import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_PRODUCTS } from '@/lib/products';
import { classifyPerfume, type TeteNote, type CoeurNote, type FondNote, type OlfactoryFamily } from '@/lib/olfactory';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AbandonedCartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface AbandonedCart {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  items: AbandonedCartItem[];
  totalValue: number;
  abandonedAt: Date;
  recoveryAttempts: number;
  lastRecoveryEmail?: Date;
  recovered: boolean;
  recoveryDate?: Date;
  discountOffered?: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  scent: string;
  category: string;          // Ancien champ pour compatibilité
  families: OlfactoryFamily[]; // Nouvelles familles olfactives (calculées)
  description?: string;
  notes?: string[];           // Ancien champ pour compatibilité
  notes_tete: TeteNote[];     // Nouvelles notes pyramide olfactive
  notes_coeur: CoeurNote[];
  notes_fond: FondNote[];
  volume?: string;
  stock: number;
  monthlySales: number;       // Ventes du mois pour calculer vélocité
}

export interface CRMStats {
  total: number;
  recovered: number;
  abandoned: number;
  totalValue: number;
  averageAttempts: number;
  recoveryRate: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  volume?: string;
}

export interface Order {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  timestamp: number;
  status: 'completed' | 'shipped' | 'cancelled';
  notes?: string;
}

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface AdminStoreState {
  // Abandoned Carts
  abandonedCarts: AbandonedCart[];
  
  // Products
  products: Product[];

  // Orders
  orders: Order[];

  // Featured Products (Notre Sélection)
  featuredProductIds: string[];

  // Featured Products Management (Notre Sélection)
  setFeaturedProducts: (productIds: string[]) => void;
  getFeaturedProducts: () => Product[];
  addFeaturedProduct: (productId: string) => void;
  removeFeaturedProduct: (productId: string) => void;
  reorderFeaturedProducts: (productIds: string[]) => void;
  validateFeaturedProducts: () => void;

  // CRUD Operations for Carts
  sendRecoveryEmail: (cartId: string, discount: number) => void;
  markRecovered: (cartId: string) => void;
  getFilteredCarts: (filter: 'all' | 'pending' | 'recovered' | 'urgent') => AbandonedCart[];

  // CRUD Operations for Products
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  updateProductStock: (id: string, newStock: number) => void;
  updateProductVelocity: (id: string, newMonthlySales: number) => void;
  deleteProduct: (id: string) => void;
  resetProductsToDefaults: () => void;

  // CRUD Operations for Orders
  createOrder: (order: Omit<Order, 'id' | 'timestamp'>) => Order;
  completeOrder: (orderId: string) => void;
  deductStock: (items: OrderItem[]) => boolean; // Returns true if all items have enough stock
  getOrdersByUserId: (userId: string) => Order[];
  getOrderHistory: () => Order[];
  getTotalOrderValue: () => number;

  // Calculated Stats
  getStatistics: () => CRMStats;

  // Filters & Searches
  filterProductsByScent: (scent: string) => Product[];
  filterProductsByCategory: (category: string) => Product[];

  // Utility
  calculateProductVelocity: (productId: string) => number;
}

// Exporter les types olfactifs pour faciliter l'utilisation
export type { TeteNote, CoeurNote, FondNote, OlfactoryFamily } from '@/lib/olfactory';
export { classifyPerfume, OLFACTORY_DICTIONARY, getAllNotesFlat, getTeteNoteIds, getCoeurNoteIds, getFondNoteIds } from '@/lib/olfactory';

// ============================================================================
// MIGRATION PRODUCTS
// ============================================================================

// Valid families after removing Hespéridé and Aromatique
const VALID_FAMILIES: OlfactoryFamily[] = [
  'Floral',
  'Boisé',
  'Gourmand',
  'Oriental',
  'Épicé',
  'Cuiré',
  'Frais/Aquatique',
];

/**
 * Convertir un ancien produit vers la nouvelle structure avec pyramide olfactive
 */
const migrateProduct = (product: any): Product => {
  // Si le produit a déjà les nouvelles propriétés, le retourner tel quel
  if (product.notes_tete && product.notes_coeur && product.notes_fond) {
    // Nettoyer les familles invalides (Hespéridé, Aromatique)
    const validFamilies = (product.families || []).filter((f: OlfactoryFamily) => 
      VALID_FAMILIES.includes(f)
    );
    return {
      ...product,
      families: validFamilies.length > 0 ? validFamilies : classifyPerfume(product.notes_tete, product.notes_coeur, product.notes_fond),
    };
  }

  // Sinon, créer une nouvelle structure
  const notes_tete: TeteNote[] = [];
  const notes_coeur: CoeurNote[] = [];
  const notes_fond: FondNote[] = [];

  // Par défaut, initialiser avec des notes vides
  // Les notes peuvent être remplies ultérieurement via le formulaire
  const families = classifyPerfume(notes_tete, notes_coeur, notes_fond);

  return {
    ...product,
    families,
    notes_tete,
    notes_coeur,
    notes_fond,
  };
};

const MOCK_PRODUCTS: Product[] = DEFAULT_PRODUCTS.map((p, idx) => 
  migrateProduct({
    ...p,
    stock: [45, 28, 120, 0, 67, 89, 54, 32, 78, 91, 45, 60, 38, 73, 56, 81, 42, 67, 50, 85, 72][idx] || 50,
    monthlySales: [85, 62, 43, 78, 51, 32, 68, 55, 72, 88, 63, 76, 58, 81, 65, 79, 47, 69, 61, 87, 74][idx] || 50,
  })
);

// ============================================================================
// MOCK DATA - ABANDONED CARTS
// ============================================================================

const MOCK_ABANDONED_CARTS: AbandonedCart[] = [
  {
    id: '1',
    clientId: 'cli-001',
    clientName: 'Catherine Rousseau',
    clientEmail: 'catherine.rousseau@email.com',
    items: [
      { productId: '1', productName: 'Éclat Doré 50ml', quantity: 1, price: 129.00 },
      { productId: '5', productName: 'Fleur de Lys 50ml', quantity: 1, price: 142.00 },
    ],
    totalValue: 271.00,
    abandonedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    recoveryAttempts: 1,
    lastRecoveryEmail: new Date(Date.now() - 24 * 60 * 60 * 1000),
    recovered: false,
    discountOffered: 10,
  },
  {
    id: '2',
    clientId: 'cli-002',
    clientName: 'Patrick Fontaine',
    clientEmail: 'patrick.fontaine@email.com',
    items: [
      { productId: '4', productName: 'Bois Noir 50ml', quantity: 2, price: 135.00 },
    ],
    totalValue: 270.00,
    abandonedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    recoveryAttempts: 0,
    recovered: false,
  },
  {
    id: '3',
    clientId: 'cli-003',
    clientName: 'Véronique Blanc',
    clientEmail: 'veronique.blanc@email.com',
    items: [
      { productId: '2', productName: 'Rose Éternelle 50ml', quantity: 1, price: 145.00 },
      { productId: '3', productName: 'Nuit Mystique 50ml', quantity: 1, price: 98.00 },
      { productId: '6', productName: 'Essense Légère 50ml', quantity: 1, price: 112.00 },
    ],
    totalValue: 355.00,
    abandonedAt: new Date(Date.now() - 120 * 60 * 60 * 1000),
    recoveryAttempts: 3,
    lastRecoveryEmail: new Date(Date.now() - 48 * 60 * 60 * 1000),
    recovered: false,
  },
  {
    id: '4',
    clientId: 'cli-004',
    clientName: 'Michel Durand',
    clientEmail: 'michel.durand@email.com',
    items: [
      { productId: '1', productName: 'Éclat Doré 50ml', quantity: 1, price: 129.00 },
    ],
    totalValue: 129.00,
    abandonedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    recoveryAttempts: 2,
    lastRecoveryEmail: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    recovered: true,
    recoveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    discountOffered: 15,
  },
  {
    id: '5',
    clientId: 'cli-005',
    clientName: 'Isabelle Mercier',
    clientEmail: 'isabelle.mercier@email.com',
    items: [
      { productId: '5', productName: 'Fleur de Lys 50ml', quantity: 1, price: 142.00 },
      { productId: '2', productName: 'Rose Éternelle 50ml', quantity: 1, price: 145.00 },
    ],
    totalValue: 287.00,
    abandonedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    recoveryAttempts: 0,
    recovered: false,
  },
  {
    id: '6',
    clientId: 'cli-006',
    clientName: 'Laurent Girard',
    clientEmail: 'laurent.girard@email.com',
    items: [
      { productId: '3', productName: 'Nuit Mystique 50ml', quantity: 1, price: 98.00 },
    ],
    totalValue: 98.00,
    abandonedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    recoveryAttempts: 2,
    lastRecoveryEmail: new Date(Date.now() - 48 * 60 * 60 * 1000),
    recovered: false,
    discountOffered: 15,
  },
];

// Helper to initialize products (from localStorage or defaults)
const initializeProducts = (): Product[] => {
  // Try to load from localStorage
  const stored = localStorage.getItem('admin-store-products');
  if (stored) {
    try {
      const products = JSON.parse(stored);
      // Vérifier si les produits stockés sont valides et complets
      if (Array.isArray(products) && products.length > 0 && products.length >= 21) {
        // Migrer les anciens produits vers la nouvelle structure
        return products.map(migrateProduct);
      }
    } catch (e) {
      console.error('Failed to parse stored products:', e);
      localStorage.removeItem('admin-store-products'); // Clear corrupted data
      return MOCK_PRODUCTS;
    }
  }
  // Default to MOCK_PRODUCTS if no valid localStorage data
  return MOCK_PRODUCTS;
};

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const useAdminStore = create<AdminStoreState>()(
  persist(
    (set, get) => ({
      // Initial State
      abandonedCarts: MOCK_ABANDONED_CARTS,
      products: initializeProducts(),
      orders: [],
      featuredProductIds: [], // Initialize empty, will be loaded from localStorage

      // ========== FEATURED PRODUCTS OPERATIONS ==========

      setFeaturedProducts: (productIds: string[]) =>
        set(() => ({
          featuredProductIds: productIds,
        })),

      getFeaturedProducts: () => {
        const state = get();
        return state.featuredProductIds
          .map((id) => state.products.find((p) => p.id === id))
          .filter((p) => p !== undefined) as Product[];
      },

      addFeaturedProduct: (productId: string) =>
        set((state) => {
          if (state.featuredProductIds.includes(productId)) {
            return state;
          }
          return {
            featuredProductIds: [...state.featuredProductIds, productId],
          };
        }),

      removeFeaturedProduct: (productId: string) =>
        set((state) => ({
          featuredProductIds: state.featuredProductIds.filter((id) => id !== productId),
        })),

      reorderFeaturedProducts: (productIds: string[]) =>
        set(() => ({
          featuredProductIds: productIds,
        })),

      // Validate featured product IDs against current products
      validateFeaturedProducts: () =>
        set((state) => {
          const validIds = state.featuredProductIds.filter(id => 
            state.products.some(p => p.id === id)
          );
          return {
            featuredProductIds: validIds,
          };
        }),

      // ========== ABANDONED CARTS OPERATIONS ==========

      sendRecoveryEmail: (cartId: string, discount: number) =>
        set((state) => ({
          abandonedCarts: state.abandonedCarts.map((cart) =>
            cart.id === cartId
              ? {
                  ...cart,
                  recoveryAttempts: cart.recoveryAttempts + 1,
                  lastRecoveryEmail: new Date(),
                  discountOffered: discount,
                }
              : cart
          ),
        })),

  markRecovered: (cartId: string) =>
    set((state) => ({
      abandonedCarts: state.abandonedCarts.map((cart) =>
        cart.id === cartId
          ? {
              ...cart,
              recovered: true,
              recoveryDate: new Date(),
            }
          : cart
      ),
    })),

  getFilteredCarts: (filter: 'all' | 'pending' | 'recovered' | 'urgent') => {
    const state = get();
    switch (filter) {
      case 'pending':
        return state.abandonedCarts.filter((c) => !c.recovered);
      case 'recovered':
        return state.abandonedCarts.filter((c) => c.recovered);
      case 'urgent': {
        return state.abandonedCarts.filter((c) => {
          const hoursSince = (Date.now() - c.abandonedAt.getTime()) / (1000 * 60 * 60);
          return !c.recovered && (hoursSince > 72 || c.recoveryAttempts >= 3);
        });
      }
      default:
        return state.abandonedCarts;
    }
  },

  // ========== ORDERS OPERATIONS ==========

  createOrder: (orderData) => {
    const order: Order = {
      ...orderData,
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    set((state) => ({
      orders: [...state.orders, order],
    }));
    return order;
  },

  completeOrder: (orderId: string) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status: 'completed' } : order
      ),
    })),

  deductStock: (items: OrderItem[]) => {
    const state = get();
    
    // Check if all items have enough stock
    for (const item of items) {
      const product = state.products.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return false;
      }
    }

    // Deduct stock
    set((state) => ({
      products: state.products.map((product) => {
        const item = items.find((i) => i.productId === product.id);
        if (item) {
          return {
            ...product,
            stock: Math.max(0, product.stock - item.quantity),
            monthlySales: product.monthlySales + item.quantity,
          };
        }
        return product;
      }),
    }));

    return true;
  },

  getOrdersByUserId: (userId: string) => {
    return get().orders.filter((o) => o.userId === userId);
  },

  getOrderHistory: () => {
    return [...get().orders].sort((a, b) => b.timestamp - a.timestamp);
  },

  getTotalOrderValue: () => {
    return get().orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  },

  // ========== PRODUCTS OPERATIONS ==========

  addProduct: (product) =>
    set((state) => ({
      products: [
        ...state.products,
        {
          ...product,
          // Clean invalid families
          families: (product.families || []).filter((f: OlfactoryFamily) => VALID_FAMILIES.includes(f)),
        },
      ],
    })),

  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id 
          ? {
              ...p,
              ...updates,
              // Clean invalid families
              families: updates.families 
                ? updates.families.filter((f: OlfactoryFamily) => VALID_FAMILIES.includes(f))
                : p.families,
            }
          : p
      ),
    })),

  updateProductStock: (id, newStock) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, newStock) } : p
      ),
    })),

  updateProductVelocity: (id, newMonthlySales) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, monthlySales: Math.max(0, newMonthlySales) } : p
      ),
    })),

  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  // Reset all products to default values
  resetProductsToDefaults: () =>
    set(() => ({
      products: MOCK_PRODUCTS.map((p) => ({ ...p })),
    })),

  // ========== CALCULATED STATS ==========

  getStatistics: () => {
    const state = get();
    const carts = state.abandonedCarts;
    const total = carts.length;
    const recovered = carts.filter((c) => c.recovered).length;
    const abandoned = total - recovered;
    const totalValue = carts
      .filter((c) => !c.recovered)
      .reduce((sum, c) => sum + c.totalValue, 0);
    const averageAttempts = carts.length > 0
      ? carts.reduce((sum, c) => sum + c.recoveryAttempts, 0) / carts.length
      : 0;
    const recoveryRate = total > 0 ? (recovered / total) * 100 : 0;

    return {
      total,
      recovered,
      abandoned,
      totalValue,
      averageAttempts: Math.round(averageAttempts * 10) / 10,
      recoveryRate: Math.round(recoveryRate * 10) / 10,
    };
  },

  // ========== FILTERS & SEARCHES ==========

  filterProductsByScent: (scent) =>
    get().products.filter((p) => p.scent.toLowerCase() === scent.toLowerCase()),

  filterProductsByCategory: (category) =>
    get().products.filter((p) =>
      p.category.toLowerCase().includes(category.toLowerCase())
    ),

  // ========== UTILITY FUNCTIONS ==========

  calculateProductVelocity: (productId: string) => {
    const product = get().products.find((p) => p.id === productId);
    if (!product || product.monthlySales === 0) {
      return 0;
    }
    const velocity = product.monthlySales / 30;
    return Math.round(velocity * 100) / 100;
  },
    }),
    {
      name: 'admin-store',
      partialize: (state) => ({
        products: state.products,
        orders: state.orders,
        featuredProductIds: state.featuredProductIds,
      }),
      onRehydrateStorage: () => (state) => {
        // If products are not properly hydrated, reset to MOCK_PRODUCTS
        if (!state || !state.products || state.products.length === 0 || state.products.length < 21) {
          state.products = MOCK_PRODUCTS;
          state.orders = [];
        }
        // Always clean up featured product IDs to ensure they match current products
        if (state && state.products && state.products.length > 0) {
          state.featuredProductIds = (state.featuredProductIds || []).filter(id => 
            state.products.some(p => p.id === id)
          );
        } else {
          state.featuredProductIds = [];
        }
      },
    }
  )
);

// ============================================================================
// EXPORT HOOKS
// ============================================================================

export const useAbandonedCarts = () => {
  const store = useAdminStore();
  return {
    carts: store.abandonedCarts,
    sendRecoveryEmail: store.sendRecoveryEmail,
    markRecovered: store.markRecovered,
    getStatistics: store.getStatistics,
    getFilteredCarts: store.getFilteredCarts,
  };
};

export const useAdminProducts = () => {
  const store = useAdminStore();
  return {
    products: store.products,
    addProduct: store.addProduct,
    updateProduct: store.updateProduct,
    updateProductStock: store.updateProductStock,
    updateProductVelocity: store.updateProductVelocity,
    deleteProduct: store.deleteProduct,
    resetProductsToDefaults: store.resetProductsToDefaults,
    filterByScent: store.filterProductsByScent,
    filterByCategory: store.filterProductsByCategory,
    calculateVelocity: store.calculateProductVelocity,
  };
};

export const useOrderManagement = () => {
  const store = useAdminStore();
  return {
    orders: store.orders,
    createOrder: store.createOrder,
    completeOrder: store.completeOrder,
    deductStock: store.deductStock,
    getOrdersByUserId: store.getOrdersByUserId,
    getOrderHistory: store.getOrderHistory,
    getTotalOrderValue: store.getTotalOrderValue,
  };
};

export const useFeaturedProducts = () => {
  const store = useAdminStore();
  return {
    featuredProductIds: store.featuredProductIds,
    getFeaturedProducts: store.getFeaturedProducts,
    setFeaturedProducts: store.setFeaturedProducts,
    addFeaturedProduct: store.addFeaturedProduct,
    removeFeaturedProduct: store.removeFeaturedProduct,
    reorderFeaturedProducts: store.reorderFeaturedProducts,
    validateFeaturedProducts: store.validateFeaturedProducts,
  };
};
