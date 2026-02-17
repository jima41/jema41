import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import { useCart } from '@/context/CartContext';
import { useAdmin } from '@/context/AdminContext';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useAdminStore } from '@/store/useAdminStore';
import type { Product } from '@/lib/products';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const { trackPageView: adminTrackPageView, products } = useAdmin();
  const { trackPageView, trackPageExit } = useAnalytics();
  const { products: storeProducts } = useAdminStore();

  const query = searchParams.get('q')?.toLowerCase() || '';

  // Scroll to top when query changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [query]);

  // Track page view on mount (only once)
  useEffect(() => {
    adminTrackPageView(window.location.pathname + window.location.search);
    trackPageView('/search', 'Recherche');
    return () => trackPageExit('/search');
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.brand.toLowerCase().includes(query) ||
    product.scent.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query)
  );

  const handleAddToCart = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      const { ...productData } = product;
      addToCart(productData);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1 py-6 md:py-8 lg:py-12 px-4 md:px-6 lg:px-0">
        <div className="container mx-auto">
          {/* Breadcrumb / Back Button */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 md:mb-8 min-h-10 px-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>

          {/* Search Results Header */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-2 md:mb-3">Résultats de recherche</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {query ? (
                <>
                  {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''} pour <span className="font-semibold text-foreground italic">'{query}'</span>
                </>
              ) : (
                'Veuillez entrer un terme de recherche'
              )}
            </p>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-16">
              {filteredProducts.map(product => {
                const storeProduct = storeProducts.find(p => p.id === product.id);
                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    brand={product.brand}
                    price={product.price}
                    image={product.image}
                    scent={product.scent}
                    notes={product.notes}
                    stock={storeProduct?.stock || 0}
                    notes_tete={storeProduct?.notes_tete}
                    notes_coeur={storeProduct?.notes_coeur}
                    notes_fond={storeProduct?.notes_fond}
                    families={storeProduct?.families}
                    onAddToCart={handleAddToCart}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 md:py-16 lg:py-20 px-4">
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground mb-6 md:mb-8">
                Aucun parfum ne correspond à votre recherche.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-4 md:px-6 py-2.5 md:py-3 rounded-lg border border-border/40 hover:border-border/80 text-sm font-medium text-foreground transition-all min-h-10 md:min-h-11"
              >
                Retour à tous les parfums
              </button>
            </div>
          )}
        </div>
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

export default SearchResults;
