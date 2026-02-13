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

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Header - Vue Fermée - VERSION SIMPLIFIÉE SANS ANIMATIONS */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#D4AF37]/20">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Logo Centré */}
          <div className="flex-1 flex justify-center">
            <Link to="/" className="flex items-center gap-0 group">
              <span className="font-serif text-2xl font-normal tracking-widest text-foreground">
                Rayha
              </span>
              <span className="font-sans text-xs font-light tracking-widest text-foreground/70 uppercase ml-1 pt-1">
                Store
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Menu Mobile Simplifié - SANS FRAMER MOTION */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Header du Menu */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/20">
            <h2 className="text-lg font-serif font-normal text-foreground">Menu</h2>
            <button
              onClick={handleMenuClose}
              className="p-2 text-[#A68A56]"
              aria-label="Fermer le menu"
            >
              ✕
            </button>
          </div>

          {/* Contenu du Menu */}
          <div className="px-6 py-8">
            <div className="space-y-4">
              <Link
                to="/"
                onClick={handleMenuClose}
                className="block py-3 text-foreground hover:text-[#D4AF37] transition-colors"
              >
                Accueil
              </Link>
              <Link
                to="/all-products"
                onClick={handleMenuClose}
                className="block py-3 text-foreground hover:text-[#D4AF37] transition-colors"
              >
                Nos Parfums
              </Link>
              <Link
                to="/login"
                onClick={handleMenuClose}
                className="block py-3 text-foreground hover:text-[#D4AF37] transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/signup"
                onClick={handleMenuClose}
                className="block py-3 text-foreground hover:text-[#D4AF37] transition-colors"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileHeader;