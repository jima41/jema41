import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercentage = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

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
              <h2 className="text-lg font-semibold">Votre Panier</h2>
              <span className="text-sm text-muted-foreground">
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
                <p className="text-sm text-muted-foreground mb-2">
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
              <p className="text-sm font-medium text-primary flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Livraison gratuite débloquée !
              </p>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Votre panier est vide</p>
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
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {item.brand}
                    </p>
                    <h3 className="font-medium truncate">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.scent}</p>
                    
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
                <span className="text-muted-foreground">Sous-total</span>
                <span className="text-xl font-semibold">{subtotal.toFixed(2)}€</span>
              </div>
              <Button variant="luxury" size="lg" className="w-full">
                Passer à la caisse
              </Button>
              <p className="text-xs text-center text-muted-foreground">
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
