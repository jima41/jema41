import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import FilterDrawer from '@/components/FilterDrawer';
import { useCart } from '@/context/CartContext';
import { useAdmin } from '@/context/AdminContext';
import { useAdminStore } from '@/store/useAdminStore';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/products';
import type { OlfactoryFamily } from '@/lib/olfactory';

// All olfactory families from the dictionary
const ALL_FAMILIES: OlfactoryFamily[] = [
  'Floral',
  'Boisé',
  'Gourmand',
  'Oriental',
  'Épicé',
  'Cuiré',
  'Frais/Aquatique',
];

const AllProducts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartItems, cartItemsCount, isCartOpen, addToCart, updateQuantity, removeItem, setIsCartOpen } = useCart();
  const { trackPageView, products: allProducts } = useAdmin();
  const { products: storeProducts } = useAdminStore();
  const { toast } = useToast();
  
  // Get family from query params
  const familyFromUrl = searchParams.get('family');
  
  const [activeCategory, setActiveCategory] = useState('tous');
  const [activeFamily, setActiveFamily] = useState<OlfactoryFamily | 'tous'>(familyFromUrl ? (familyFromUrl as OlfactoryFamily) : 'tous');
  const [activeBrand, setActiveBrand] = useState('tous');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Scroll to top when component mounts (only once)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Track page view on mount (only once)
  useEffect(() => {
    trackPageView('/all-products');
  }, []);

  // Get unique values for filters
  const categories = ['tous', ...new Set(allProducts.map(p => p.category))];
  
  // All families from the olfactory dictionary
  const families: (OlfactoryFamily | 'tous')[] = ['tous', ...ALL_FAMILIES];
  
  const brands = ['tous', ...new Set(allProducts.map(p => p.brand))];

  // Filter products
  const filteredProducts = allProducts.filter(product => {
    const categoryMatch = activeCategory === 'tous' || product.category === activeCategory;
    const storeProduct = storeProducts.find(p => p.id === product.id);
    const familyMatch = activeFamily === 'tous' || (storeProduct?.families && storeProduct.families.includes(activeFamily));
    const brandMatch = activeBrand === 'tous' || product.brand === activeBrand;
    return categoryMatch && familyMatch && brandMatch;
  });

  const handleAddToCart = (id: string) => {
    const product = allProducts.find(p => p.id === id);
    const storeProduct = storeProducts.find(p => p.id === id);
    
    if (product) {
      // Check stock
      const stock = storeProduct?.stock ?? 0;
      if (stock === 0) {
        toast({
          title: 'Rupture de stock',
          description: `${product.name} est actuellement indisponible.`,
          variant: 'destructive',
        });
        return;
      }
      
      const { ...productData } = product;
      addToCart(productData);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemsCount={cartItemsCount} onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-1 py-2 md:py-4">
        <div className="container mx-auto">
          {/* Breadcrumb / Back Button */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-4 text-xs tracking-[0.15em] uppercase font-medium"
          >
            <span>←</span>
            Retour à l'accueil
          </button>

          {/* Page Header - Editorial */}
          <div className="mb-6">
            <h1 className="font-serif text-4xl md:text-5xl font-normal leading-relaxed mb-4 text-foreground">
              Tous nos Parfums
            </h1>
            <p className="text-sm text-foreground/70 leading-loose max-w-[60%]">
              Découvrez notre collection complète de parfums d'exception, soigneusement sélectionnés pour tous les goûts et toutes les occasions.
            </p>
          </div>

          {/* Filters Toggle Button & Results Count */}
          <div className="mb-2 flex items-center justify-between">
            <motion.button
              onClick={() => setIsFiltersOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/40 hover:border-border/80 hover:bg-secondary/30 transition-all"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <motion.div
                animate={{ rotate: 0 }}
                whileHover={{ rotate: 15 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Filter className="w-4 h-4" />
              </motion.div>
              <motion.span 
                className="text-xs font-medium"
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                Filtres
              </motion.span>
            </motion.button>
            
            {/* Results Count - Right side */}
            <motion.div 
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
            </motion.div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {filteredProducts.map((product, index) => {
                const storeProduct = storeProducts.find(p => p.id === product.id);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: 'spring',
                      stiffness: 200,
                      damping: 30,
                      duration: 0.4
                    }}
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      brand={product.brand}
                      price={product.price}
                      image={product.image}
                      scent={product.scent}
                      notes={product.notes}
                      stock={storeProduct?.stock ?? 0}
                      notes_tete={storeProduct?.notes_tete}
                      notes_coeur={storeProduct?.notes_coeur}
                      notes_fond={storeProduct?.notes_fond}
                      families={storeProduct?.families}
                      onAddToCart={handleAddToCart}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-muted-foreground mb-6">Aucun parfum ne correspond à vos critères de filtrage.</p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeFamily={activeFamily}
        setActiveFamily={setActiveFamily}
        activeBrand={activeBrand}
        setActiveBrand={setActiveBrand}
        categories={categories}
        families={families}
        brands={brands}
        onApply={() => {}}
        onReset={() => {
          setActiveCategory('tous');
          setActiveFamily('tous');
          setActiveBrand('tous');
        }}
      />

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

export default AllProducts;
