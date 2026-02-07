import { createContext, useContext, ReactNode } from 'react';
import { useCartStore, CartItem } from '@/store/useCartStore';

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
  } = useCartStore();

  // Wrapper pour addToCart (compatibilité - pas de userId params)
  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    addToCartStore(product);
  };

  return {
    cartItems,
    cartItemsCount,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    setIsCartOpen,
  };
};
