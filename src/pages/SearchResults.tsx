import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import { useCart } from '@/context/CartContext';
import { useAdmin } from '@/context/AdminContext';
import { useAdminStore } from '@/store/useAdminStore';
import type { Product } from '@/lib/products';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { cartItems, cartItemsCount, isCartOpen, addToCart, updateQuantity, removeItem, setIsCartOpen } = useCart();
  const { trackPageView, products } = useAdmin();
  const { products: storeProducts } = useAdminStore();

  const query = searchParams.get('q')?.toLowerCase() || '';

  // Scroll to top when query changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [query]);

  // Track page view on mount (only once)
  useEffect(() => {
    trackPageView(window.location.pathname + window.location.search);
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
      <Header cartItemsCount={cartItemsCount} onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-1 py-8 md:py-16">
        <div className="container mx-auto">
          {/* Breadcrumb / Back Button */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>

          {/* Search Results Header */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-medium mb-2">Résultats de recherche</h1>
            <p className="text-muted-foreground">
              {query ? (
                <>
                  {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''} pour <span className="font-semibold text-foreground">"{query}"</span>
                </>
              ) : (
                'Veuillez entrer un terme de recherche'
              )}
            </p>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
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
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-6">
                Aucun parfum ne correspond à votre recherche.
              </p>
              <Button onClick={() => navigate('/')}>
                Retour à tous les parfums
              </Button>
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
      />
    </div>
  );
};

export default SearchResults;
