import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Heart } from 'lucide-react';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import type { TeteNote, CoeurNote, FondNote, OlfactoryFamily } from '@/lib/olfactory';

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
  notes_tete?: TeteNote[];
  notes_coeur?: CoeurNote[];
  notes_fond?: FondNote[];
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
  const hasOlfactoryData = notes_tete && notes_tete.length > 0 || notes_coeur && notes_coeur.length > 0 || notes_fond && notes_fond.length > 0;
  
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
    toggleFavorite(id);
    setIsFaved(!isFaved);
  };

  return (
    <div 
      className="product-card group text-left w-full relative"
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
        className="relative aspect-square overflow-hidden rounded-lg bg-secondary/30 mb-2"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <motion.img
          src={image}
          alt={name}
          className={`w-full h-full object-cover img-zoom transition-all duration-300 ${
            isOutOfStock ? 'grayscale backdrop-blur-sm' : ''
          }`}
          loading="lazy"
          whileHover={!isOutOfStock ? { scale: 1.05 } : undefined}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
        
        {/* Out of Stock - Raffiné Text Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <p className="font-serif text-xl text-[#D4AF37] font-light tracking-widest uppercase drop-shadow-lg">
              ÉPUISÉ
            </p>
          </div>
        )}
        {!isOutOfStock && (
          <div className="absolute inset-0 glass opacity-0 group-hover:opacity-60 transition-opacity duration-300 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
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
          className="absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-all duration-300 z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          aria-label="Ajouter aux favoris"
        >
          <Heart
            strokeWidth={2}
            className={`w-5 h-5 transition-all duration-300 ${
              isFaved 
                ? 'fill-red-500 text-red-500' 
                : 'text-white hover:text-[#D4AF37]'
            }`}
          />
        </motion.button>
      </motion.div>

      {/* Product Info - Fixed Layout */}
      <div className="flex flex-col min-h-[110px] p-3 rounded-lg bg-white/15 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30 group-hover:backdrop-blur-md cursor-pointer">
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

        {/* Price or Out of Stock - Bottom */}
        <div className="mt-auto">
          {isOutOfStock ? (
            <p className="text-center py-2 font-serif text-[#D4AF37] text-xs font-normal tracking-wide">
              ÉDITION ÉPUISÉE
            </p>
          ) : (
            <div className="flex items-center justify-between">
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
  );
};

export default ProductCard;
