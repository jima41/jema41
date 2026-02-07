import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useAdmin } from '@/context/AdminContext';
import { useFavoritesStore } from '@/store/useFavoritesStore';

const Favorites = () => {
  const navigate = useNavigate();
  const { cartItemsCount, addToCart, setIsCartOpen } = useCart();
  const { products } = useAdmin();
  const { favorites } = useFavoritesStore();

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  const handleAddToCart = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      const { description, notes, volume, ...productData } = product;
      addToCart(productData as any);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemsCount={cartItemsCount} onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-1 py-8 md:py-16">
        <div className="container mx-auto">
          {/* Back Button */}
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
              Mes coups de coeurs
            </h1>
            <p className="text-sm text-foreground/70 leading-loose max-w-[60%]">
              {favoriteProducts.length === 0
                ? 'Vous n\'avez pas encore ajouté de produits à vos favoris. Découvrez nos parfums et commencez à créer votre collection.'
                : `Découvrez votre sélection personnalisée de ${favoriteProducts.length} parfum${favoriteProducts.length > 1 ? 's' : ''} d'exception.`}
            </p>
          </div>

          {/* Products Grid */}
          {favoriteProducts.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {favoriteProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard
                    {...product}
                    onAddToCart={handleAddToCart}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="flex flex-col items-center justify-center py-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Heart className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground mb-6">
                Commencez à aimer vos parfums préférés !
              </p>
              <button
                onClick={() => navigate('/all-products')}
                className="px-6 py-2 border border-foreground/30 rounded-lg hover:border-[#D4AF37]/60 text-foreground hover:text-[#D4AF37] transition-all duration-300"
              >
                Découvrir les produits
              </button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
