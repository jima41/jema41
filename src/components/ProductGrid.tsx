import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import { useAdmin } from '@/context/AdminContext';
import { useAdminStore } from '@/store/useAdminStore';
import { useFeaturedProducts } from '@/store/useAdminStore';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/products';

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

const ProductGrid = ({ onAddToCart }: ProductGridProps) => {
  const navigate = useNavigate();
  const { products } = useAdmin();
  const { products: storeProducts } = useAdminStore();
  const { getFeaturedProducts, featuredProductIds } = useFeaturedProducts();
  const { toast } = useToast();

  // Get featured products if any are selected, otherwise show all products
  const displayProducts = useMemo(() => {
    if (featuredProductIds.length > 0) {
      // Get featured products
      const featured = getFeaturedProducts();
      // Fallback to all products if featured list is empty (data consistency issue)
      return featured.length > 0 ? featured : products;
    }
    return products;
  }, [featuredProductIds, getFeaturedProducts, products]);

  // Debug logging
  useEffect(() => {
    console.log('📊 ProductGrid re-rendered with products:', {
      count: products.length,
      hasFeatured: featuredProductIds.length > 0,
      displayProductsCount: displayProducts.length,
      firstProduct: products.length > 0 ? {
        name: products[0].name,
        image: products[0].image?.substring?.(0, 50),
        hasImage: !!products[0].image,
      } : null
    });
  }, [products, displayProducts]);

  const handleAddToCart = (id: string) => {
    const product = products.find(p => p.id === id);
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
      
      onAddToCart(product as any);
    }
  };

  return (
    <section id="notre-selection" className="py-16 md:py-24">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-normal mb-4 text-foreground">Notre Sélection</h2>
          <p className="text-sm text-foreground/70 max-w-md mx-auto">
            Des fragrances d'exception pour chaque personnalité
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {displayProducts.map((product, index) => {
            const storeProduct = storeProducts.find(p => p.id === product.id);
            return (
            <div 
              key={product.id} 
              className="animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
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
            </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <motion.button
            onClick={() => navigate('/all-products')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/40 hover:border-border/80 hover:bg-secondary/30 transition-all text-sm font-medium"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            Voir tous les parfums
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
