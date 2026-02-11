import { createContext, useContext, ReactNode } from 'react';
import { useCartStore, CartItem } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';

// Re-export types for backward compatibility
export type { CartItem };

interface CartContextType {
  cartItems: CartItem[];
  cartItemsCount: number;
  isCartOpen: boolean;
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  setIsCartOpen: (open: boolean) => void;
  promoCode: string | null;
  promoDiscount: number;
  setPromoCode: (code: string, discount: number) => void;
  clearPromoCode: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Le CartProvider est maintenant une enveloppe autour du store Zustand
  // Tous les états viennent du store Zustand
  
  return (
    <CartContext.Provider value={undefined as any}>
      {children}
    </CartContext.Provider>
  );
};

// Hook backward compatible qui utilise le store Zustand
export const useCart = () => {
  const {
    cartItems,
    cartItemsCount,
    isCartOpen,
    addToCart: addToCartStore,
    updateQuantity,
    removeItem,
    setIsCartOpen,
    promoCode,
    promoDiscount,
    setPromoCode,
    clearPromoCode,
  } = useCartStore();

  const { user } = useAuth();

  // Wrapper pour addToCart - injecte automatiquement userId
  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    if (!user?.id) {
      console.warn('⚠️ Ajout au panier sans utilisateur connecté');
      return;
    }
    // Map les propriétés du produit vers le format attendu par le store
    const productData = {
      productId: (product as any).productId || (product as any).id || '',
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image || (product as any).image_url,
      scent: (product as any).scent,
      category: (product as any).category,
    };
    addToCartStore(productData, user.id);
  };

  return {
    cartItems,
    cartItemsCount,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    setIsCartOpen,
    promoCode,
    promoDiscount,
    setPromoCode,
    clearPromoCode,
  };
};
