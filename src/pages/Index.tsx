import { useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FragranceQuiz from '@/components/FragranceQuiz';
import ProductGrid from '@/components/ProductGrid';
import CartDrawer from '@/components/CartDrawer';
import Reassurance from '@/components/Reassurance';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useAdmin } from '@/context/AdminContext';
import { useAnalytics } from '@/context/AnalyticsContext';
import type { Product } from '@/lib/products';

const Index = () => {
  const { cartItems, cartItemsCount, isCartOpen, addToCart, updateQuantity, removeItem, setIsCartOpen } = useCart();
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
      <Header 
        cartItemsCount={cartItemsCount}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <main>
        <Hero />
        <FragranceQuiz />
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
      />
    </div>
  );
};

export default Index;
