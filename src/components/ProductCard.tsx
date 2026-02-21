import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Heart } from 'lucide-react';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useAuth } from '@/context/AuthContext';
import type { OlfactoryFamily } from '@/lib/olfactory';

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  scent: string;
  notes?: string[];
  stock: number;
  onAddToCart: (id: string) => void;
  notes_tete?: string[];
  notes_coeur?: string[];
  notes_fond?: string[];
  families?: OlfactoryFamily[];
}

// Valid families after removing Hespéridé and Aromatique
const VALID_FAMILIES: OlfactoryFamily[] = [
  'Floral',
  'Boisé',
  'Gourmand',
  'Oriental',
  'Épicé',
  'Cuiré',
  'Frais/Aquatique',
];

// Helper to get readable label from note ID
const getNoteLabel = (noteId: string): string => {
  return noteId
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ProductCard = ({ 
  id, 
  name, 
  brand, 
  price, 
  image, 
  scent, 
  notes, 
  stock, 
  onAddToCart,
  notes_tete,
  notes_coeur,
  notes_fond,
  families,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOutOfStock = stock === 0;
  const [showPyramid, setShowPyramid] = useState(false);
  const [isFaved, setIsFaved] = useState(false);
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { user } = useAuth();
  const hasOlfactoryData = notes_tete && notes_tete.length > 0 || notes_coeur && notes_coeur.length > 0 || notes_fond && notes_fond.length > 0;
  
  // Debug logging
  useEffect(() => {
    if (!image) {
      console.warn(`⚠️ ProductCard ${name} (ID: ${id}) has NO image!`);
    } else {
      console.log(`✅ ProductCard ${name} has image:`, typeof image, image?.substring?.(0, 50) || image);
    }
  }, [id, name, image]);
  
  // Initialize favorite state
  useEffect(() => {
    setIsFaved(isFavorite(id));
  }, [id, isFavorite]);
  
  // Filter valid families
  const validFamilies = (families || []).filter((f) => VALID_FAMILIES.includes(f));

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    toggleFavorite(user.id, id);
    setIsFaved(!isFaved);
  };

  return (
    <div 
      className="product-card group text-left w-full relative transition-shadow duration-700 ease-in-out shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:shadow-[0_16px_42px_rgba(15,23,42,0.14)] rounded-t-lg md:rounded-t-xl rounded-b-[0.25rem] md:rounded-b-[0.375rem] overflow-hidden"
      onClick={() => navigate(`/product/${id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/product/${id}`);
        }
      }}
      style={{ cursor: !isOutOfStock ? 'pointer' : 'default' }}
    >
      {/* Image Container */}
      <motion.div 
        className="relative aspect-square overflow-hidden rounded-t-lg md:rounded-t-xl rounded-b-none bg-secondary/30 mb-2 md:mb-3"
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {image ? (
          <motion.img
            src={image}
            alt={name}
            className={`w-full h-full object-cover img-zoom transition-transform duration-700 ease-in-out rounded-t-lg md:rounded-t-xl ${
              isOutOfStock ? 'grayscale backdrop-blur-sm' : ''
            }`}
            loading="lazy"
            onError={(e) => {
              console.error(`❌ Image failed to load: ${image}`, e);
            }}
            onLoad={() => {
              console.log(`✅ Image loaded successfully: ${name}`);
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Out of Stock - Raffiné Text Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-t-lg md:rounded-t-xl overflow-hidden">
            <p className="font-serif text-xl text-[#D4AF37] font-light tracking-widest uppercase drop-shadow-lg">
              ÉPUISÉ
            </p>
          </div>
        )}
        {!isOutOfStock && (
          <div className="absolute inset-0 glass opacity-0 group-hover:opacity-60 transition-opacity duration-300 flex items-center justify-center rounded-t-lg md:rounded-t-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <motion.button 
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(id);
              }}
              className="p-3 rounded-full border border-foreground/40 hover:border-[#D4AF37]/70 text-foreground hover:text-[#D4AF37] transition-all duration-300"
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              aria-label="Ajouter au panier"
            >
              <ShoppingBag strokeWidth={1.5} className="w-6 h-6" />
            </motion.button>
          </div>
        )}
        
        {/* Heart Like Button - Top Right */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFavorite(e);
          }}
          className="absolute top-2 md:top-3 right-2 md:right-3 p-1.5 md:p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-all duration-300 z-10 active:scale-95"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          aria-label="Ajouter aux favoris"
        >
          <Heart
            strokeWidth={2}
            className={`w-4 md:w-5 h-4 md:h-5 transition-all duration-300 ${
              isFaved 
                ? 'fill-red-500 text-red-500' 
                : 'text-white hover:text-[#D4AF37]'
            }`}
          />
        </motion.button>
      </motion.div>

      {/* Product Info - Fixed Layout */}
      <div className="flex flex-col min-h-[110px] p-3 rounded-none bg-white/15 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30 group-hover:backdrop-blur-md cursor-pointer">
        {/* Brand & Title */}
        <div className="mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-0.5">
            {brand}
          </span>
          <h3 className="font-medium text-foreground leading-tight group-hover:text-primary transition-colors text-xs line-clamp-1">
            {name}
          </h3>
        </div>

        {/* Family Display - Simple & Clean */}
        <div className="mb-2 pb-2 border-b border-border/30">
          {validFamilies && validFamilies.length > 0 ? (
            <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">
              {validFamilies[0]}
            </span>
          ) : (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {scent}
            </span>
          )}
        </div>

        {/* Price or Out of Stock - Bottom (fixed height to keep cards uniform) */}
        <div className="mt-auto">
          <div className="h-8 flex items-center w-full">
            {isOutOfStock ? (
              <p className="w-full text-center font-serif text-[#D4AF37] text-xs font-normal tracking-wide">
                ÉDITION ÉPUISÉE
              </p>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-foreground text-xs">
                  {price.toFixed(2)}€
                </span>
                {stock > 0 && stock < 5 && (
                  <span className="text-xs text-amber-600 font-medium">Stock limité</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
