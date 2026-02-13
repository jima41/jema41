import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileHeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

const MobileHeader = ({ cartItemsCount, onCartClick }: MobileHeaderProps) => {
  // TEMPORAIRE : Header simplifié pour debug - pas d'état, pas d'animations
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#D4AF37]/20">
      <div className="flex items-center justify-center px-4 h-16">
        <div className="text-center">
          <span className="font-serif text-xl font-normal text-foreground">
            HEADER TEST - MOBILE
          </span>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;