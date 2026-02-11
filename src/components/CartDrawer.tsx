import { useEffect, useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Tag, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Product } from './ProductGrid';
import { usePromoCodesStore } from '@/store/usePromoCodesStore';
import { useCartStore } from '@/store/useCartStore';

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
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const promoCodes = usePromoCodesStore((state) => state.promoCodes);
  const promoCode = useCartStore((state) => state.promoCode);
  const promoDiscount = useCartStore((state) => state.promoDiscount);
  const setPromoCode = useCartStore((state) => state.setPromoCode);
  const clearPromoCode = useCartStore((state) => state.clearPromoCode);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = promoCode ? (subtotal * promoDiscount) / 100 : 0;
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercentage = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  useEffect(() => {
    if (!promoCode) return;
    const matched = promoCodes.find(
      (promo) => promo.active && promo.code === promoCode
    );
    if (!matched) {
      clearPromoCode();
      setPromoError("Ce code promo n'est plus actif.");
      return;
    }
    if (matched.discount !== promoDiscount) {
      setPromoCode(matched.code, matched.discount);
    }
  }, [promoCode, promoDiscount, promoCodes, clearPromoCode, setPromoCode]);

  const normalizeCode = (value: string) => value.trim().toUpperCase();

  const handleApplyPromo = () => {
    const normalized = normalizeCode(promoInput);
    if (!normalized) {
      setPromoError('Entrez un code promo.');
      return;
    }

    const matched = promoCodes.find(
      (promo) => promo.active && promo.code === normalized
    );

    if (!matched) {
      setPromoError('Code promo invalide.');
      return;
    }

    setPromoCode(matched.code, matched.discount);
    setPromoInput('');
    setPromoError('');
  };

  const handleClearPromo = () => {
    clearPromoCode();
    setPromoError('');
  };

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

      {/* Drawer - Full screen on mobile, sidebar on desktop */}
      <div className="fixed right-0 top-0 h-full w-full md:max-w-md z-50 slide-in-right">
        <div className="h-full glass border-l border-border/50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/50 sticky top-0 z-10 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <ShoppingBag className="w-5 h-5 flex-shrink-0" />
              <h2 className="font-serif text-base md:text-lg font-normal truncate">Votre Panier</h2>
              <span className="text-[10px] md:text-xs text-foreground/70 uppercase tracking-widest flex-shrink-0">
                ({items.reduce((sum, item) => sum + item.quantity, 0)})
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
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border/50 bg-secondary/30">
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
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 mx-auto text-foreground/40 mb-4" />
                <p className="text-foreground/70">Votre panier est vide</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl bg-card border border-border/50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-xs text-foreground/60 uppercase tracking-[0.1em] mb-0.5 md:mb-1">
                      {item.brand}
                    </p>
                    <h3 className="font-serif font-normal text-sm md:text-base truncate">{item.name}</h3>
                    <p className="text-[10px] md:text-xs text-foreground/70 truncate">{item.scent}</p>
                    
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
            <div className="p-4 md:p-6 border-t border-border/50 space-y-3 md:space-y-4 bg-card/50 sticky bottom-0">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-foreground/70">Sous-total</span>
                  <span className="font-medium">{subtotal.toFixed(2)}€</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-3 gap-2">
                  <span className="text-foreground/70 text-xs md:text-sm">Code promo</span>
                  {promoCode ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-widest px-2 py-1 rounded-full bg-secondary/50">
                        <Tag className="w-3 h-3" />
                        {promoCode}
                      </span>
                      <button
                        onClick={handleClearPromo}
                        className="text-[10px] md:text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Retirer
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 md:gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(event) => setPromoInput(event.target.value)}
                        placeholder="CODE"
                        className="flex-1 md:w-28 px-2 py-1 rounded-md border border-border bg-background/70 text-[10px] md:text-xs uppercase tracking-widest"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="text-[10px] md:text-xs px-2 py-1 rounded-md border border-border/60 hover:border-border hover:bg-secondary/40 transition-colors whitespace-nowrap"
                        disabled={items.length === 0}
                      >
                        Appliquer
                      </button>
                    </div>
                  )}
                </div>

                {promoError && (
                  <p className="text-[10px] md:text-xs text-destructive">{promoError}</p>
                )}

                {promoCode && (
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-foreground/70">Remise ({promoDiscount}%)</span>
                    <span className="text-emerald-500">-{discountAmount.toFixed(2)}€</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border/30 pt-2 md:pt-3">
                  <span className="text-foreground/70 text-xs md:text-sm">Total</span>
                  <span className="text-xl md:text-2xl font-serif font-light">
                    {totalAfterDiscount.toFixed(2)}€
                  </span>
                </div>
              </div>
              <motion.button
                onClick={handleCheckout}
                className="w-full inline-flex items-center justify-center px-4 py-3 md:py-2.5 rounded-lg md:rounded-lg border border-border/40 hover:border-border/80 hover:bg-secondary/30 transition-all text-xs md:text-sm font-medium active:scale-95 md:active:scale-100"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Check className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Passer à la caisse</span>
                <span className="md:hidden">Commander</span>
              </motion.button>
              <p className="text-[10px] md:text-xs text-center text-foreground/60 uppercase tracking-widest">
                Paiement sécurisé • Livraison 2-4 jours
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
