import { create } from 'zustand';
import {
  getUserCart,
  addToCart as supabaseAddToCart,
  updateCartItemQuantity,
  removeFromCart as supabaseRemoveFromCart,
  clearCart as supabaseClearCart,
  subscribeToCart,
  type CartItemDB,
} from '@/integrations/supabase/supabase';
import { supabase } from '@/integrations/supabase/supabase';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  image?: string;
  scent?: string;
  category?: string;
  quantity: number;
  userId?: string;
}

interface CartStoreState {
  // State
  cartItems: CartItem[];
  isCartOpen: boolean;
  isLoading: boolean;
  error: string | null;
  promoCode: string | null;
  promoDiscount: number;

  // Computations
  cartItemsCount: number;
  cartTotal: number;

  // Initialization & Sync
  initializeCart: (userId: string) => Promise<void>;
  setupCartRealtime: (userId: string) => void;
  teardownCartRealtime: () => void;

  // Actions
  addToCart: (product: {
    productId: string;
    name: string;
    brand: string;
    price: number;
    image?: string;
    scent?: string;
    category?: string;
  }, userId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: (userId: string) => Promise<void>;
  setIsCartOpen: (open: boolean) => void;
  setPromoCode: (code: string, discount: number) => void;
  clearPromoCode: () => void;

  // Observers
  getCartItems: () => CartItem[];
  watchCartChanges: (callback: (items: CartItem[]) => void) => () => void;
  
  // Data integrity
  validateCart: (validIds: Set<string>) => void;
}

// Helper to calculate cart totals
const calculateTotals = (items: CartItem[]) => ({
  cartItemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
  cartTotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
});

// Convert Supabase CartItemDB to CartItem
const dbToCartItem = (dbItem: CartItemDB): CartItem => ({
  id: dbItem.id,
  productId: dbItem.product_id,
  name: dbItem.product_name,
  brand: dbItem.product_brand,
  price: dbItem.product_price,
  image: dbItem.product_image || undefined,
  scent: dbItem.product_scent || undefined,
  category: dbItem.product_category || undefined,
  quantity: dbItem.quantity,
  userId: dbItem.user_id,
});

// Realtime subscription reference
let cartRealtimeSubscription: any = null;

export const useCartStore = create<CartStoreState>()((set, get) => ({
  // Initial State
  cartItems: [],
  isCartOpen: false,
  isLoading: false,
  error: null,
  promoCode: null,
  promoDiscount: 0,
  cartItemsCount: 0,
  cartTotal: 0,

  // ========== INITIALIZATION ==========

  /**
   * Initialise le panier depuis Supabase pour l'utilisateur connecté
   */
  initializeCart: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('📦 Initialisation du panier depuis Supabase...');
      const dbItems = await getUserCart(userId);
      const cartItems = dbItems.map(dbToCartItem);
      const totals = calculateTotals(cartItems);

      set({
        cartItems,
        ...totals,
        isLoading: false,
        error: null,
      });

      console.log(`✅ Panier initialisé: ${cartItems.length} articles`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement du panier';
      set({
        isLoading: false,
        error: message,
      });
      console.error('❌ Erreur initializeCart:', error);
    }
  },

  /**
   * Active la synchronisation en temps réel du panier
   */
  setupCartRealtime: (userId: string) => {
    if (cartRealtimeSubscription) {
      console.log('📡 Souscription panier déjà active');
      return;
    }

    console.log('🔌 Activation sync panier temps réel...');

    cartRealtimeSubscription = subscribeToCart(
      userId,
      (payload) => {
        const state = get();
        const eventType = payload.eventType;
        const newRecord = payload.new as CartItemDB | null;
        const oldRecord = payload.old as CartItemDB | null;

        if (eventType === 'INSERT' && newRecord) {
          const newItem = dbToCartItem(newRecord);
          set((s) => {
            // Vérifier si cet item existe déjà (par id DB ou par productId)
            const existsById = s.cartItems.some((item) => item.id === newItem.id);
            if (existsById) {
              // Déjà présent (ajouté via le retour de addToCart), ignorer
              return s;
            }
            // Remplacer un item temp_ avec le même productId
            const tempIdx = s.cartItems.findIndex(
              (item) => item.id.startsWith('temp_') && item.productId === newItem.productId
            );
            if (tempIdx >= 0) {
              const items = s.cartItems.map((item, i) => i === tempIdx ? newItem : item);
              return { cartItems: items, ...calculateTotals(items) };
            }
            // Vérifier par productId (item déjà consolidé)
            const existsByProduct = s.cartItems.some((item) => item.productId === newItem.productId);
            if (existsByProduct) {
              // L'item existe déjà, ne pas dupliquer
              return s;
            }
            // Vraiment nouveau (ajouté depuis un autre onglet/appareil)
            const items = [...s.cartItems, newItem];
            return { cartItems: items, ...calculateTotals(items) };
          });
          console.log('🆕 Article ajouté au panier');
        } else if (eventType === 'UPDATE' && newRecord) {
          const updatedItem = dbToCartItem(newRecord);
          set((s) => {
            // Chercher par ID exact d'abord, sinon par productId
            let found = false;
            let items = s.cartItems.map((item) => {
              if (item.id === updatedItem.id) {
                found = true;
                return updatedItem;
              }
              return item;
            });
            if (!found) {
              // Remplacer par productId (cas d'un temp_ item)
              items = s.cartItems.map((item) =>
                item.productId === updatedItem.productId ? updatedItem : item
              );
            }
            return {
              cartItems: items,
              ...calculateTotals(items),
            };
          });
          console.log('🔄 Article du panier mis à jour');
        } else if (eventType === 'DELETE' && oldRecord) {
          set((s) => {
            const items = s.cartItems.filter((item) => item.id !== oldRecord.id);
            return {
              cartItems: items,
              ...calculateTotals(items),
            };
          });
          console.log('🗑️ Article retiré du panier');
        }
      },
      (error) => {
        console.error('❌ Erreur sync panier:', error);
        setTimeout(() => {
          console.log('🔄 Tentative de reconnexion panier...');
          cartRealtimeSubscription = null;
          get().setupCartRealtime(userId);
        }, 5000);
      }
    );
  },

  /**
   * Désactive la synchronisation panier
   */
  teardownCartRealtime: () => {
    if (cartRealtimeSubscription) {
      cartRealtimeSubscription.unsubscribe();
      cartRealtimeSubscription = null;
    }
  },

  // ========== ACTIONS ==========

  /**
   * Ajoute un produit au panier
   */
  addToCart: async (product, userId) => {
    try {
      const productPriceNum = typeof product.price === 'string' 
        ? parseFloat(product.price) 
        : product.price;

      // Optimistic update - vérifier si le produit existe déjà
      set((state) => {
        const existingIndex = state.cartItems.findIndex(
          (item) => item.productId === product.productId
        );

        let items: CartItem[];
        if (existingIndex >= 0) {
          // Incrémenter la quantité de l'article existant
          items = state.cartItems.map((item, i) =>
            i === existingIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          // Ajouter un nouvel article
          const newItem: CartItem = {
            id: `temp_${Date.now()}`,
            productId: product.productId,
            name: product.name,
            brand: product.brand,
            price: productPriceNum,
            image: product.image,
            scent: product.scent,
            category: product.category,
            quantity: 1,
            userId,
          };
          items = [...state.cartItems, newItem];
        }

        return {
          cartItems: items,
          ...calculateTotals(items),
          isCartOpen: true,
        };
      });

      // Sauvegarde dans Supabase (gère déjà le upsert côté DB)
      const dbResult = await supabaseAddToCart(userId, product.productId, {
        name: product.name,
        brand: product.brand,
        price: productPriceNum,
        image: product.image,
        scent: product.scent,
        category: product.category,
      });

      // Remplacer l'item temp par l'item réel de la DB
      if (dbResult) {
        const realItem = dbToCartItem(dbResult);
        set((state) => {
          // Remplacer temp_ item ou item existant par la version DB
          const hasReal = state.cartItems.some((item) => item.id === realItem.id);
          let items: CartItem[];
          if (hasReal) {
            // L'item DB existe déjà, juste mettre à jour
            items = state.cartItems
              .filter((item) => !(item.id.startsWith('temp_') && item.productId === realItem.productId))
              .map((item) => item.id === realItem.id ? realItem : item);
          } else {
            // Remplacer le temp_ par le vrai item
            const tempIdx = state.cartItems.findIndex(
              (item) => item.id.startsWith('temp_') && item.productId === realItem.productId
            );
            if (tempIdx >= 0) {
              items = state.cartItems.map((item, i) => i === tempIdx ? realItem : item);
            } else {
              // Aucun temp trouvé, mettre à jour par productId
              const existIdx = state.cartItems.findIndex((item) => item.productId === realItem.productId);
              if (existIdx >= 0) {
                items = state.cartItems.map((item, i) => i === existIdx ? realItem : item);
              } else {
                items = [...state.cartItems, realItem];
              }
            }
          }
          return {
            cartItems: items,
            ...calculateTotals(items),
          };
        });
      }

      console.log('🛒 Article ajouté au panier');
    } catch (error) {
      console.error('❌ Erreur addToCart:', error);
      throw error;
    }
  },

  /**
   * Met à jour la quantité d'un article
   */
  updateQuantity: async (cartItemId, quantity) => {
    try {
      if (quantity <= 0) {
        await get().removeItem(cartItemId);
        return;
      }

      // Optimistic update
      set((state) => {
        const items = state.cartItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        );
        return {
          cartItems: items,
          ...calculateTotals(items),
        };
      });

      // Sync avec Supabase
      await updateCartItemQuantity(cartItemId, quantity);
      console.log('🔄 Quantité mise à jour');
    } catch (error) {
      console.error('❌ Erreur updateQuantity:', error);
      throw error;
    }
  },

  /**
   * Retire un article du panier
   */
  removeItem: async (cartItemId) => {
    try {
      // Optimistic update
      set((state) => {
        const items = state.cartItems.filter((item) => item.id !== cartItemId);
        return {
          cartItems: items,
          ...calculateTotals(items),
        };
      });

      // Sync avec Supabase
      await supabaseRemoveFromCart(cartItemId);
      console.log('🗑️ Article retiré du panier');
    } catch (error) {
      console.error('❌ Erreur removeItem:', error);
      throw error;
    }
  },

  /**
   * Vide le panier
   */
  clearCart: async (userId) => {
    try {
      // Optimistic update
      set({
        cartItems: [],
        cartItemsCount: 0,
        cartTotal: 0,
        promoCode: null,
        promoDiscount: 0,
      });

      // Sync avec Supabase
      await supabaseClearCart(userId);
      console.log('🗑️ Panier vidé');
    } catch (error) {
      console.error('❌ Erreur clearCart:', error);
      throw error;
    }
  },

  /**
   * Change l'état d'ouverture/fermeture du panier
   */
  setIsCartOpen: (open) =>
    set({
      isCartOpen: open,
    }),

  setPromoCode: (code, discount) =>
    set({
      promoCode: code,
      promoDiscount: discount,
    }),

  clearPromoCode: () =>
    set({
      promoCode: null,
      promoDiscount: 0,
    }),

  // ========== OBSERVERS ==========

  /**
   * Retourne les articles du panier
   */
  getCartItems: () => get().cartItems,

  /**
   * S'abonne aux changements du panier
   */
  watchCartChanges: (callback) => {
    callback(get().cartItems);

    const unsubscribe = useCartStore.subscribe(
      (state) => state.cartItems,
      (items) => {
        callback(items);
      }
    );

    return unsubscribe;
  },

  /**
   * Valide le panier (nettoie les articles orphelins)
   */
  validateCart: (validIds: Set<string>) => {
    set((state) => {
      const cleanedItems = state.cartItems.filter((item) =>
        validIds.has(item.productId)
      );
      const totals = calculateTotals(cleanedItems);
      return {
        cartItems: cleanedItems,
        ...totals,
      };
    });
  },
}));

// Hook personnalisé pour utiliser le panier
export const useCart = () => {
  const {
    cartItems,
    isCartOpen,
    cartItemsCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    setIsCartOpen,
    promoCode,
    promoDiscount,
    setPromoCode,
    clearPromoCode,
    isLoading,
    error,
  } = useCartStore();

  return {
    cartItems,
    isCartOpen,
    cartItemsCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    setIsCartOpen,
    promoCode,
    promoDiscount,
    setPromoCode,
    clearPromoCode,
    isLoading,
    error,
  };
};

export default useCartStore;
