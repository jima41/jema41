import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Product } from './ProductGrid';

export interface CartItem extends Product {
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const FREE_SHIPPING_THRESHOLD = 100;

const CartDrawer = ({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }: CartDrawerProps) => {
  const navigate = useNavigate();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercentage = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleCheckout = () => {
    navigate('/checkout');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 slide-in-right">
        <div className="h-full glass border-l border-border/50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5" />
              <h2 className="font-serif text-lg font-normal">Votre Panier</h2>
              <span className="text-xs text-foreground/70 uppercase tracking-widest">
                ({items.reduce((sum, item) => sum + item.quantity, 0)} articles)
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-6 py-4 border-b border-border/50 bg-secondary/30">
            {remainingForFreeShipping > 0 ? (
              <>
                <p className="text-xs text-foreground/70 mb-2 uppercase tracking-widest">
                  Plus que <span className="font-semibold text-foreground">{remainingForFreeShipping.toFixed(2)}€</span> pour la livraison gratuite
                </p>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div 
                    className="h-full btn-luxury rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-xs font-medium text-[#D4AF37] flex items-center gap-2 uppercase tracking-widest">
                <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
                Livraison gratuite débloquée !
              </p>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 mx-auto text-foreground/40 mb-4" />
                <p className="text-foreground/70">Votre panier est vide</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-card border border-border/50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground/60 uppercase tracking-[0.1em] mb-1">
                      {item.brand}
                    </p>
                    <h3 className="font-serif font-normal truncate">{item.name}</h3>
                    <p className="text-xs text-foreground/70">{item.scent}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-secondary rounded transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-secondary rounded transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          {(item.price * item.quantity).toFixed(2)}€
                        </span>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-border/50 space-y-4 bg-card/50">
              <div className="flex items-center justify-between">
                <span className="text-foreground/70 text-sm">Sous-total</span>
                <span className="text-2xl font-serif font-light">{subtotal.toFixed(2)}€</span>
              </div>
              <motion.button
                onClick={handleCheckout}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-border/40 hover:border-border/80 hover:bg-secondary/30 transition-all text-sm font-medium"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                Passer à la caisse
              </motion.button>
              <p className="text-xs text-center text-foreground/60 uppercase tracking-widest">
                Paiement sécurisé • Livraison sous 2-4 jours
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
