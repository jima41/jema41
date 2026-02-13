import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileHeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

const MobileHeader = ({ cartItemsCount, onCartClick }: MobileHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleSearchClick = () => {
    // TODO: Implement search functionality
    console.log('Search clicked');
  };

  return (
    <>
      {/* Header - Vue Fermée */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#D4AF37]/20">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Gauche : Menu Hamburger */}
          <button
            onClick={handleMenuToggle}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5 text-[#A68A56]" strokeWidth={1.5} />
          </button>

          {/* Centre : Logo */}
          <Link to="/" className="flex items-center gap-0 group">
            <span className="font-serif text-2xl font-normal tracking-widest text-foreground">
              Rayha
            </span>
            <span className="font-sans text-xs font-light tracking-widest text-foreground/70 uppercase ml-1 pt-1">
              Store
            </span>
          </Link>

          {/* Droite : Icônes Recherche et Panier */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSearchClick}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5 text-[#A68A56]" strokeWidth={1.5} />
            </button>
            <button
              onClick={onCartClick}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform relative"
              aria-label="Panier"
            >
              <ShoppingBag className="w-5 h-5 text-[#A68A56]" strokeWidth={1.5} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-black text-xs rounded-full flex items-center justify-center font-semibold">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menu Mobile - Vue Ouverte / Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleMenuClose}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 left-0 z-50 w-full h-full bg-gradient-to-b from-amber-50/95 to-white/95 backdrop-blur-md"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Header du Drawer */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/20">
                <div className="w-8" /> {/* Spacer pour centrer le X */}
                <button
                  onClick={handleMenuClose}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform"
                  aria-label="Fermer le menu"
                >
                  <X className="w-6 h-6 text-[#A68A56]" strokeWidth={1.5} />
                </button>
              </div>

              {/* Contenu du Menu */}
              <div className="flex flex-col h-full">
                {/* Navigation Principale */}
                <div className="flex-1 flex flex-col justify-center px-8">
                  {/* Lien Maître : NOS PARFUMS */}
                  <motion.button
                    onClick={() => {
                      navigate('/all-products');
                      handleMenuClose();
                    }}
                    className="text-left py-6 text-2xl font-serif font-normal tracking-wider text-foreground uppercase min-h-[44px] active:scale-95 transition-transform"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Nos Parfums
                  </motion.button>

                  {/* Séparateur Doré */}
                  <motion.div
                    className="w-20 h-px bg-[#D4AF37] mx-auto my-8"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  />

                  {/* Bloc Compte */}
                  <motion.div
                    className="space-y-4 mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-center mb-4">
                      <p className="text-sm text-foreground/60 font-montserrat">Mon Compte</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Link to="/login" onClick={handleMenuClose}>
                        <button className="w-full min-h-[44px] py-3 px-6 text-sm font-montserrat font-medium text-[#A68A56] rounded-lg active:scale-95 transition-all bg-transparent underline underline-offset-4 decoration-[#D4AF37]/30">
                          Connexion
                        </button>
                      </Link>
                      <Link to="/signup" onClick={handleMenuClose}>
                        <button className="w-full min-h-[44px] py-3 px-6 text-sm font-montserrat font-medium text-[#A68A56] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 rounded-lg active:scale-95 transition-all shadow-sm">
                          S'inscrire
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileHeader;