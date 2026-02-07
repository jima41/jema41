import { create } from 'zustand';
import { persist, PersistStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  scent: string;
  category: string;
  quantity: number;
  userId?: string; // Track which user added this
}

interface CartStoreState {
  // State
  cartItems: CartItem[];
  isCartOpen: boolean;

  // Computations
  cartItemsCount: number;
  cartTotal: number;

  // Actions
  addToCart: (product: Omit<CartItem, 'quantity'>, userId?: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;

  // Observers - pour "écouter" les changements
  getCartItems: () => CartItem[];
  watchCartChanges: (callback: (items: CartItem[]) => void) => () => void;
  
  // Data integrity
  validateCart: (validIds: Set<string>) => void; // Clean orphaned items
}

// Helper to calculate cart totals
const calculateTotals = (items: CartItem[]) => ({
  cartItemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
  cartTotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
});

export const useCartStore = create<CartStoreState>()(
  persist<CartStoreState,
    [['zustand/persist', { cartItems: CartItem[]; isCartOpen: boolean }]]
  >(
    (set, get) => ({
      // Initial State
      cartItems: [],
      isCartOpen: false,
      cartItemsCount: 0,
      cartTotal: 0,

      // ========== ACTIONS ==========

      addToCart: (product, userId) =>
        set((state) => {
          const existingItem = state.cartItems.find((item) => item.id === product.id);
          let updatedItems: CartItem[];

          if (existingItem) {
            updatedItems = state.cartItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1, userId: userId || item.userId }
                : item
            );
          } else {
            updatedItems = [...state.cartItems, { ...product, quantity: 1, userId }];
          }

          // Calculate new totals
          const totals = calculateTotals(updatedItems);

          return {
            cartItems: updatedItems,
            ...totals,
            isCartOpen: true,
          };
        }),

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;

        set((state) => {
          const updatedItems = state.cartItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          );

          const totals = calculateTotals(updatedItems);

          return {
            cartItems: updatedItems,
            ...totals,
          };
        });
      },

      removeItem: (id) =>
        set((state) => {
          const updatedItems = state.cartItems.filter((item) => item.id !== id);
          const totals = calculateTotals(updatedItems);

          return {
            cartItems: updatedItems,
            ...totals,
          };
        }),

      clearCart: () => {
        const totals = calculateTotals([]);
        set({
          cartItems: [],
          ...totals,
        });
      },

      setIsCartOpen: (open) =>
        set({
          isCartOpen: open,
        }),

      // ========== OBSERVERS ==========

      getCartItems: () => get().cartItems,

      // Système d'observation réactif
      watchCartChanges: (callback) => {
        // Appel initial
        callback(get().cartItems);

        // S'abonner aux changements
        const unsubscribe = useCartStore.subscribe(
          (state) => state.cartItems,
          (items) => {
            callback(items);
          }
        );

        // Retourner une fonction pour se désabonner
        return unsubscribe;
      },

      // Clean orphaned cart items
      validateCart: (validIds: Set<string>) => {
        set((state) => {
          const cleanedItems = state.cartItems.filter((item) => validIds.has(item.id));
          const totals = calculateTotals(cleanedItems);
          return {
            cartItems: cleanedItems,
            ...totals,
          };
        });
      },
    }),

    {
      name: 'cart-store',
      partialize: (state) => ({
        cartItems: state.cartItems,
        isCartOpen: state.isCartOpen,
      }),
      onRehydrateStorage: () => (state) => {
        // Ensure cart items are properly formatted after hydration
        if (!state || !Array.isArray(state.cartItems)) {
          if (state) {
            state.cartItems = [];
            state.cartItemsCount = 0;
            state.cartTotal = 0;
          }
        } else {
          // Recalculate totals after hydration
          const totals = calculateTotals(state.cartItems);
          state.cartItemsCount = totals.cartItemsCount;
          state.cartTotal = totals.cartTotal;
        }
      },
    }
  )
);

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
  };
};

export default useCartStore;
