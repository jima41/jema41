import { useEffect } from 'react';
import Hero from '@/components/Hero';
import SillageQuiz from '@/components/SillageQuiz';
import ProductGrid from '@/components/ProductGrid';
import CartDrawer from '@/components/CartDrawer';
import Reassurance from '@/components/Reassurance';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useAdmin } from '@/context/AdminContext';
import { useAnalytics } from '@/context/AnalyticsContext';
import type { Product } from '@/lib/products';

const Index = () => {
  const {
    cartItems,
    cartItemsCount,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    setIsCartOpen,
    promoCode,
    promoDiscount,
    applyPromoCode,
    clearPromoCode,
  } = useCart();
  const { trackPageView: adminTrackPageView } = useAdmin();
  const { trackPageView, trackPageExit, trackClick } = useAnalytics();

  useEffect(() => {
    adminTrackPageView('/');
    trackPageView('/', 'Accueil');
    return () => trackPageExit('/');
  }, []);

  const handleAddToCart = (product: Product) => {
    const { quantity, ...productData } = product as any;
    addToCart(productData);
  };

  return (
    <div className="min-h-screen bg-background">
      
      <main>
        <Hero />
        {/* Description mobile sous Hero, 2 pouces (env. 64px) au-dessus du quiz olfactif */}
        <p className="text-xs sm:hidden font-light leading-relaxed text-gray-600 max-w-md mx-auto mt-8 mb-16" style={{marginBottom: '64px'}}>
          Découvrez notre sélection de parfums d'exception, soigneusement choisis pour éveiller vos sens.
        </p>
        <SillageQuiz />
        <ProductGrid onAddToCart={handleAddToCart} />
        <Reassurance />
      </main>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        promoCode={promoCode}
        promoDiscount={promoDiscount}
        onApplyPromo={applyPromoCode}
        onClearPromo={clearPromoCode}
      />
    </div>
  );
};

export default Index;
