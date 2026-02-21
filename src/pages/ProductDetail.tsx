import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Heart, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import SimpleOlfactoryDisplay from '@/components/SimpleOlfactoryDisplay';
import { useCart } from '@/context/CartContext';
import { useAdmin } from '@/context/AdminContext';
import { useAdminStore } from '@/store/useAdminStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProductTracking } from '@/hooks/use-page-tracking';
import { getTopFamilies } from '@/lib/olfactory';
import { useState } from 'react';
import { renderSimpleMarkdown } from '@/lib/markdown';
import type { Product } from '@/lib/products';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
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
  const { trackPageView, products } = useAdmin();
  const { products: storeProducts } = useAdminStore();
  const { toast } = useToast();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [productName, setProductName] = useState('Produit');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg'>('sm');
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchCurrent, setTouchCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Get visible products count based on screen size
  const getVisibleCount = () => {
    if (screenSize === 'sm') return 2;
    if (screenSize === 'md') return 3;
    return 5;
  };

  // Track screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setScreenSize('lg');
      } else if (window.innerWidth >= 768) {
        setScreenSize('md');
      } else {
        setScreenSize('sm');
      }
      setCarouselIndex(0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle touch drag with smooth following
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchCurrent(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setTouchCurrent(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const distance = touchStart - touchCurrent;
    const threshold = 20; // Moins sensible que avant (50px)
    const maxSwipe = 100; // Distance max pour un swipe
    
    if (Math.abs(distance) < threshold) return; // Ignore les petits mouvements

    if (distance > threshold) {
      // Swipe left - go to next
      const swipeStrength = Math.min(Math.abs(distance) / maxSwipe, 1);
      const itemsToMove = Math.ceil(swipeStrength * 2); // Max 2 items par swipe
      setCarouselIndex(Math.min(recommendedProducts.length - getVisibleCount() + 1, carouselIndex + itemsToMove));
    }
    if (distance < -threshold) {
      // Swipe right - go to previous
      const swipeStrength = Math.min(Math.abs(distance) / maxSwipe, 1);
      const itemsToMove = Math.ceil(swipeStrength * 2); // Max 2 items par swipe
      setCarouselIndex(Math.max(0, carouselIndex - itemsToMove));
    }
  };

  // Track product view using hook
  useProductTracking(id || '', productName);

  // Update product name when found
  useEffect(() => {
    if (id && storeProducts.length > 0) {
      const foundProduct = storeProducts.find(p => p.id === id);
      if (foundProduct) {
        setProductName(foundProduct.name);
      }
    }
  }, [id, storeProducts]);

  useEffect(() => {
    if (id) {
      setIsFav(isFavorite(id));
    }
  }, [id, isFavorite]);

  // Générer les produits recommandés aléatoires (12 produits)
  useEffect(() => {
    if (products.length > 0 && id) {
      // Filtrer les produits (exclure le produit actuel)
      const otherProducts = products.filter(p => p.id !== id);
      
      // Shuffler les produits
      const shuffled = [...otherProducts].sort(() => Math.random() - 0.5);
      
      // Si moins de 12 produits, répéter les produits pour en avoir 12
      let recommended = [...shuffled];
      while (recommended.length < 12 && shuffled.length > 0) {
        recommended = [...recommended, ...shuffled].slice(0, 12);
      }
      
      setRecommendedProducts(recommended.slice(0, 12));
    }
  }, [id, products]);

  // Scroll to top when product ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Track page view on mount (only once)
  useEffect(() => {
    if (id) {
      trackPageView(`/product/${id}`);
    }
  }, []);

  const product = products.find(p => p.id === id);
  const storeProduct = storeProducts.find(p => p.id === id);
  const stock = storeProduct?.stock ?? 0;

  const concentrationRaw = (storeProduct && (storeProduct as any).concentration) || (product && (product as any).concentration) || '';
  const topFamilies = getTopFamilies(storeProduct?.notes_tete || product?.notes_tete || [], storeProduct?.notes_coeur || product?.notes_coeur || [], storeProduct?.notes_fond || product?.notes_fond || [], storeProduct?.families || product?.families || [], 3);
  const [showMoreFamilies, setShowMoreFamilies] = useState(false);
  const concentrationLabel = (() => {
    if (!concentrationRaw) return '';
    const map: Record<string, string> = {
      EX: 'Extrait de Parfum',
      EDP: 'Eau de Parfum',
      EDT: 'Eau de Toilette',
    };
    return map[concentrationRaw] || concentrationRaw;
  })();

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Produit non trouvé</h1>
            <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (stock === 0) {
      toast({
        title: 'Rupture de stock',
        description: `${product?.name} est actuellement indisponible.`,
        variant: 'destructive',
      });
      return;
    }
    
    const { description, notes, volume, ...productData } = product!;
    addToCart(productData as any, quantity);
    setQuantity(1);
  };

  const handleToggleFavorite = () => {
    if (id && user?.id) {
      toggleFavorite(user.id, id);
      setIsFav(!isFav);
      toast({
        title: isFav ? 'Retiré de vos coups de coeurs' : 'Ajouté à vos coups de coeurs',
        description: product?.name,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 py-8 md:py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-20">
          {/* Breadcrumb / Back Button */}
          <button
            onClick={() => navigate('/all-products')}
            className="inline-flex items-center gap-2 md:gap-3 text-muted-foreground hover:text-foreground transition-colors mb-6 md:mb-8 min-h-10 px-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux parfums
          </button>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-16 mb-12 md:mb-16 lg:mb-24 items-start">
            {/* Product Image */}
            <div>
              <motion.div 
                className="aspect-square w-full rounded-xl md:rounded-2xl bg-secondary/30 overflow-hidden relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <motion.img
                  src={product.image}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    stock === 0 ? 'grayscale backdrop-blur-sm' : ''
                  }`}
                  whileHover={stock > 0 ? { scale: 1.05 } : undefined}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
                
                {/* Out of Stock Overlay */}
                {stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
                    <p className="font-serif text-2xl text-[#D4AF37] font-light tracking-widest uppercase drop-shadow-lg">
                      ÉPUISÉ
                    </p>
                  </div>
                )}
                
                {/* Hover Overlay with Add to Cart */}
                {stock > 0 && (
                  <div className="absolute inset-0 glass opacity-0 group-hover:opacity-60 transition-opacity duration-300 flex items-center justify-center">
                    <motion.button 
                      onClick={handleAddToCart}
                      className="p-3 rounded-full border border-foreground/40 hover:border-[#D4AF37]/70 text-foreground hover:text-[#D4AF37] transition-all duration-300"
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                      <ShoppingCart strokeWidth={1.5} className="w-6 h-6" />
                    </motion.button>
                  </div>
                )}
                
                {/* Heart Favorite Button - Top Right */}
                <motion.button
                  onClick={handleToggleFavorite}
                  className="absolute top-2 md:top-4 right-2 md:right-4 p-1.5 md:p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-all duration-300 z-10 min-h-10 min-w-10 md:min-h-11 md:min-w-11 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <Heart
                    strokeWidth={2}
                    className={`w-4 md:w-5 h-4 md:h-5 transition-all duration-300 ${
                      isFav 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-white hover:text-[#D4AF37]'
                    }`}
                  />
                </motion.button>
              </motion.div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-start space-y-3 md:space-y-4 lg:space-y-6 md:pr-4 lg:pr-8">
              <div>
                <p className="text-[10px] md:text-xs lg:text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1 md:mb-2">
                  {product.brand}
                </p>
                <h1 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-snug md:leading-normal lg:leading-relaxed mb-2 md:mb-4 lg:mb-6 text-foreground">{product.name}</h1>
                {concentrationLabel && (
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{concentrationLabel}</div>
                )}
                {topFamilies && topFamilies.length > 0 && (
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-foreground">{topFamilies[0]}</span>
                    {topFamilies.length > 1 && (
                      <button
                        onClick={() => setShowMoreFamilies(!showMoreFamilies)}
                        aria-expanded={showMoreFamilies}
                        className="text-xs text-muted-foreground px-2 py-0.5 rounded hover:bg-admin-border/30"
                      >
                        +
                      </button>
                    )}
                  </div>
                )}
                {showMoreFamilies && topFamilies.length > 1 && (
                  <div className="flex gap-2 mb-2">
                    {topFamilies.slice(1, 3).map((f) => (
                      <span key={f} className="text-xs text-foreground/80">{f}</span>
                    ))}
                  </div>
                )}
                {stock === 0 && (
                  <span className="text-xs md:text-sm lg:text-base font-serif text-[#D4AF37] font-light tracking-widest uppercase mb-4 md:mb-6 inline-block">ÉPUISÉ</span>
                )}
              </div>

              <div className="space-y-3 md:space-y-4 lg:space-y-6">
                {/* Description */}
                <div className="mt-2 md:mt-3 lg:mt-4">
                  <div
                    className="text-xs md:text-sm text-foreground/70 leading-relaxed md:leading-loose max-w-prose"
                    // Nous rendons un Markdown minimal (gras + sauts de ligne) de façon sûre
                    dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(product.description) }}
                  />
                </div>

                {/* Notes Olfactives Simplifiées */}
                {storeProduct && (storeProduct.notes_tete || storeProduct.notes_coeur || storeProduct.notes_fond) && (
                  <div className="pt-1.5 md:pt-2 lg:pt-4">
                    <SimpleOlfactoryDisplay
                      notes_tete={storeProduct.notes_tete || []}
                      notes_coeur={storeProduct.notes_coeur || []}
                      notes_fond={storeProduct.notes_fond || []}
                      families={storeProduct.families || []}
                    />
                  </div>
                )}

                {/* Additional Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 lg:gap-6 pt-1.5 md:pt-2 lg:pt-4">
                  {product.volume && (
                    <div>
                      <h3 className="font-semibold mb-0.5 md:mb-1 uppercase text-[9px] md:text-xs tracking-wider text-muted-foreground">Volume</h3>
                      <p className="text-[10px] md:text-xs lg:text-sm text-foreground">{product.volume}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-0.5 md:mb-1 uppercase text-[9px] md:text-xs tracking-wider text-muted-foreground">Catégorie</h3>
                    <p className="text-[10px] md:text-xs lg:text-sm text-foreground capitalize">{product.category}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-0.5 md:mb-1 uppercase text-[9px] md:text-xs tracking-wider text-muted-foreground">Pour</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(() => {
                        const gender = storeProduct?.gender || (product.category === 'homme' ? 'homme' : product.category === 'femme' ? 'femme' : 'mixte');
                        if (gender === 'homme') {
                          return <span className="text-black text-xs font-semibold">Lui</span>;
                        }
                        if (gender === 'femme') {
                          return <span className="text-black text-xs font-semibold">Elle</span>;
                        }
                        return (
                          <>
                            <span className="text-black text-xs font-semibold">Lui</span>
                            <span className="text-black text-xs font-semibold">&</span>
                            <span className="text-black text-xs font-semibold">Elle</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>



              {/* Action Buttons - Desktop sticky, Mobile fixed bottom bar */}
              <div>
                {/* Desktop sticky */}
                <div className="hidden md:flex flex-col gap-3 pt-4 lg:pt-6 sticky top-24">
                  {stock === 0 ? (
                    <button
                      disabled
                      className="w-full min-h-12 border border-border/30 rounded-lg text-foreground/50 text-sm font-medium hover:border-border/30 transition-colors cursor-not-allowed"
                    >
                      Épuisé
                    </button>
                  ) : (
                    <>
                      <div className="flex flex-row gap-3">
                        <div className="flex items-center min-h-12 border border-border/30 rounded-lg overflow-hidden flex-shrink-0">
                          <button
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            disabled={quantity <= 1}
                            className="w-12 min-h-12 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-secondary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="flex-1 min-h-12 flex items-center justify-center text-sm font-medium text-foreground select-none min-w-12">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                            disabled={quantity >= stock}
                            className="w-12 min-h-12 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-secondary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={handleAddToCart}
                          className="flex-1 min-h-12 border border-foreground/30 hover:border-[#D4AF37]/60 text-foreground hover:text-[#D4AF37] rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-sm flex items-center justify-center gap-2 group"
                        >
                          <ShoppingCart className="w-5 h-5 group-hover:animate-bounce" />
                          <span>Ajouter</span>
                        </button>
                        <motion.button
                          onClick={handleToggleFavorite}
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          className="w-12 min-h-12 border border-border/30 rounded-lg hover:border-[#D4AF37]/60 text-foreground hover:text-[#D4AF37] flex items-center justify-center transition-all duration-300"
                        >
                          <Heart className={`w-5 h-5 transition-all duration-300 ${isFav ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>
                {/* Mobile fixed bottom bar */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/30 px-4 py-3 flex gap-2 items-center" style={{boxShadow:'0 -2px 16px 0 rgba(0,0,0,0.07)'}}>
                  {stock === 0 ? (
                    <button
                      disabled
                      className="flex-1 min-h-[48px] border border-border/30 rounded-lg text-foreground/50 text-xs font-medium hover:border-border/30 transition-colors cursor-not-allowed"
                    >
                      Épuisé
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center min-h-[48px] border border-border/30 rounded-lg overflow-hidden flex-shrink-0">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          disabled={quantity <= 1}
                          className="w-10 min-h-[48px] flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-secondary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="flex-1 min-h-[48px] flex items-center justify-center text-xs font-medium text-foreground select-none min-w-10">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                          disabled={quantity >= stock}
                          className="w-10 min-h-[48px] flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-secondary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 min-h-[48px] border border-foreground/30 hover:border-[#D4AF37]/60 text-foreground hover:text-[#D4AF37] rounded-lg text-xs font-medium transition-all duration-300 hover:shadow-sm flex items-center justify-center gap-1.5 group active:scale-95"
                      >
                        <ShoppingCart className="w-4 h-4 group-hover:animate-bounce" />
                        <span>Ajouter</span>
                      </button>
                      <motion.button
                        onClick={handleToggleFavorite}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 min-h-[48px] border border-border/30 rounded-lg hover:border-[#D4AF37]/60 text-foreground hover:text-[#D4AF37] flex items-center justify-center transition-all duration-300"
                      >
                        <Heart className={`w-4 h-4 transition-all duration-300 ${isFav ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
                      </motion.button>
                    </>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="hidden md:flex md:flex-col border-t pt-4 md:pt-6 text-xs md:text-sm text-muted-foreground space-y-1.5 md:space-y-2">
                <p>✓ Livraison gratuite pour les commandes de + de 100€</p>
                <p>✓ Satisfait ou remboursé 30 jours</p>
                <p>✓ Emballage cadeau disponible</p>
              </div>
            </div>
          </div>

          {/* Recommended Products Carousel */}
          <div className="border-t pt-8 md:pt-12 lg:pt-16">
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-snug md:leading-normal lg:leading-relaxed mb-4 md:mb-6 lg:mb-8 text-foreground">Vous aimeriez aussi...</h2>
            
            {recommendedProducts.length > 0 ? (
              <div 
                className="relative group"
                onMouseEnter={() => setIsCarouselHovered(true)}
                onMouseLeave={() => setIsCarouselHovered(false)}
              >
                {/* Carousel Container */}
                <div 
                  className="overflow-x-auto scrollbar-hide select-none -mx-4 md:mx-0 px-4 md:px-0"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <motion.div
                    className="flex gap-3 sm:gap-4 md:gap-5"
                    animate={{ x: `${-carouselIndex * (100 / getVisibleCount())}%` }}
                    transition={{ type: 'spring', stiffness: 150, damping: 35, mass: 1.2 }}
                  >
                    {recommendedProducts.map((relatedProduct, index) => {
                      const relatedStoreProduct = storeProducts.find(p => p.id === relatedProduct.id);
                      const relatedStock = relatedStoreProduct?.stock ?? 0;
                      const isRelatedFaved = isFavorite(relatedProduct.id);
                      
                      return (
                      <div 
                        key={relatedProduct.id}
                        className="flex-none w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
                      >
                        <motion.div
                          className="product-card group text-left w-full relative h-full"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          {/* Image Container */}
                          <motion.div className="relative aspect-square overflow-hidden rounded-lg bg-secondary/30 mb-2 group-hover:opacity-90 transition-opacity">
                            <motion.img
                              src={relatedProduct.image}
                              alt={relatedProduct.name}
                              className={`w-full h-full object-cover img-zoom transition-all duration-300 ${
                                relatedStock === 0 ? 'grayscale backdrop-blur-sm' : ''
                              }`}
                              loading="lazy"
                              whileHover={relatedStock > 0 ? { scale: 1.05 } : undefined}
                              transition={{ duration: 0.4, ease: 'easeOut' }}
                            />
                            
                            {/* Out of Stock Overlay */}
                            {relatedStock === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
                                <p className="font-serif text-xl text-[#D4AF37] font-light tracking-widest uppercase drop-shadow-lg">
                                  ÉPUISÉ
                                </p>
                              </div>
                            )}
                            
                            {/* Hover Overlay with Add to Cart */}
                            {relatedStock > 0 && (
                              <div className="absolute inset-0 glass opacity-0 group-hover:opacity-60 transition-opacity duration-300 flex items-center justify-center">
                                <motion.button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const { description, notes, volume, ...productData } = relatedProduct;
                                    addToCart(productData as any);
                                    toast({
                                      title: 'Ajouté au panier',
                                      description: relatedProduct.name,
                                    });
                                  }}
                                  className="p-3 rounded-full border border-foreground/40 hover:border-[#D4AF37]/70 text-foreground hover:text-[#D4AF37] transition-all duration-300"
                                  whileHover={{ scale: 1.08, y: -2 }}
                                  whileTap={{ scale: 0.95 }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                >
                                  <ShoppingCart strokeWidth={1.5} className="w-6 h-6" />
                                </motion.button>
                              </div>
                            )}
                            
                            {/* Heart Favorite Button - Top Right */}
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (user?.id) toggleFavorite(user.id, relatedProduct.id);
                              }}
                              className="absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-all duration-300 z-10"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            >
                              <Heart
                                strokeWidth={2}
                                className={`w-5 h-5 transition-all duration-300 ${
                                  isRelatedFaved 
                                    ? 'fill-red-500 text-red-500' 
                                    : 'text-white hover:text-[#D4AF37]'
                                }`}
                              />
                            </motion.button>
                          </motion.div>

                          {/* Product Info - Fixed Layout */}
                          <div className="flex flex-col min-h-[90px] md:min-h-[110px] p-2 md:p-3 rounded-lg bg-white/15 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30 group-hover:backdrop-blur-md cursor-pointer">
                            {/* Brand & Title */}
                            <div className="mb-1.5 md:mb-2">
                              <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-0.5">
                                {relatedProduct.brand}
                              </span>
                              <h3 className="font-medium text-foreground leading-tight group-hover:text-primary transition-colors text-[10px] md:text-xs line-clamp-1">
                                {relatedProduct.name}
                              </h3>
                            </div>

                            {/* Price or Out of Stock - Bottom */}
                            <div className="mt-auto">
                              {relatedStock === 0 ? (
                                <p className="text-center py-2 font-serif text-[#D4AF37] text-xs font-normal tracking-wide">
                                  ÉDITION ÉPUISÉE
                                </p>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-foreground text-xs">
                                    {relatedProduct.price.toFixed(2)}€
                                  </span>
                                  {relatedStock > 0 && relatedStock < 5 && (
                                    <span className="text-xs text-amber-600 font-medium">Stock limité</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Click to navigate */}
                          <button 
                            onClick={() => navigate(`/product/${relatedProduct.id}`)}
                            className="absolute inset-0 z-0 opacity-0"
                          />
                        </motion.div>
                      </div>
                    );
                    })}
                  </motion.div>
                </div>

                {/* Navigation Arrows */}
                {recommendedProducts.length > getVisibleCount() && (
                  <>
                    <motion.button
                      onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                      disabled={carouselIndex === 0}
                      animate={{ opacity: isCarouselHovered ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed top-1/2 -translate-y-1/2 text-foreground/70 hover:text-[#D4AF37] transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 z-40"
                      style={{ 
                        left: '8.4rem',
                        pointerEvents: isCarouselHovered ? 'auto' : 'none' 
                      }}
                    >
                      <ChevronLeft strokeWidth={1} className="w-7 h-7" />
                    </motion.button>
                    <motion.button
                      onClick={() => setCarouselIndex(Math.min(recommendedProducts.length - getVisibleCount() + 1, carouselIndex + 1))}
                      disabled={carouselIndex >= recommendedProducts.length - getVisibleCount() + 1}
                      animate={{ opacity: isCarouselHovered ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed top-1/2 -translate-y-1/2 text-foreground/70 hover:text-[#D4AF37] transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 z-40"
                      style={{ 
                        right: '8.4rem',
                        pointerEvents: isCarouselHovered ? 'auto' : 'none' 
                      }}
                    >
                      <ChevronRight strokeWidth={1} className="w-7 h-7" />
                    </motion.button>
                  </>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Pas de produits recommandés pour le moment</p>
            )}
          </div>
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

export default ProductDetail;
