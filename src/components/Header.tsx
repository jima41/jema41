import { useState } from 'react';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

const Header = ({ cartItemsCount, onCartClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 -ml-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <div className="flex-1 flex justify-center md:justify-start">
            <a href="/" className="text-xl md:text-2xl font-semibold tracking-wide">
              Rayha Store
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Tous les Parfums
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Femme
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Homme
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Unisex
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Search */}
            <div className="relative">
              {isSearchOpen && (
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="absolute right-10 top-1/2 -translate-y-1/2 w-48 md:w-64 px-4 py-2 rounded-full border border-border bg-background/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 animate-fade-in"
                  autoFocus
                />
              )}
              <button 
                className="p-2 hover:bg-secondary rounded-full transition-colors"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Cart */}
            <button 
              className="p-2 hover:bg-secondary rounded-full transition-colors relative"
              onClick={onCartClick}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass border-t border-border/50 animate-fade-in">
          <nav className="container mx-auto py-4 flex flex-col gap-4">
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors py-2">
              Tous les Parfums
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors py-2">
              Femme
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors py-2">
              Homme
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors py-2">
              Unisex
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
