import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, LogOut, User, Settings, ChevronRight, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

// ============================================================================
// SHIPPING BAR COMPONENT
// ============================================================================
export const ShippingBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 h-6 bg-[#FDFBF7] border-b border-border/20 flex items-center justify-center z-40">
      <span className="text-[10px] text-gray-500 font-medium tracking-shipping uppercase">
        L'EXCELLENCE OLFACTIVE, LIVRÉE CHEZ VOUS.
      </span>
    </div>
  );
};

// ============================================================================
// LOGO COMPONENT (Typographie Contrastée: Serif + Sans-serif)
// ============================================================================
const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-0 group">
      <span className="font-serif text-2xl md:text-3xl font-normal tracking-widest text-foreground">
        Rayha
      </span>
      <span className="font-sans text-xs font-light tracking-widest text-foreground/70 uppercase ml-1 pt-1">
        Store
      </span>
    </Link>
  );
};

// ============================================================================
// ANIMATED NAV LINK COMPONENT (Golden underline from center)
// ============================================================================
interface NavLinkProps {
  label: string;
  href: string;
}

const AnimatedNavLink = ({ label, href }: NavLinkProps) => {
  const navigate = useNavigate();
  const isActive = window.location.pathname === href;

  const underlineVariants = {
    initial: {
      scaleX: 0,
    },
    hover: {
      scaleX: 1,
      transition: { duration: 0.3 },
    },
  };

  const handleClick = (e: React.MouseEvent) => {
    if (href.startsWith('http')) {
      return;
    }
    e.preventDefault();
    navigate(href);
  };

  return (
    <motion.div className="relative pb-1 cursor-pointer">
      <a
        href={href}
        onClick={handleClick}
        className={`text-sm font-medium transition-colors duration-200 ${
          isActive
            ? 'text-foreground'
            : 'text-foreground/70 hover:text-foreground'
        }`}
      >
        {label}
      </a>
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-px bg-[#D4AF37] w-full"
        variants={underlineVariants}
        initial="initial"
        whileHover="hover"
        style={{
          originX: 0.5,
        }}
      />
    </motion.div>
  );
};

// ============================================================================
// PERFUME NAV DROPDOWN COMPONENT
// ============================================================================
// OVERLAY COMPONENT (Fermeture du menu au clic)
// ============================================================================
interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const PerfumeOverlay = ({ isOpen, onClose }: OverlayProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 md:hidden backdrop-blur-[2px]"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        />
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// PERFUME NAV DROPDOWN COMPONENT (PREMIUM)
// ============================================================================
interface PerfumeDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const PerfumeNavDropdown = ({ isOpen, onToggle, onClose }: PerfumeDropdownProps) => {
  const navigate = useNavigate();
  const isActive = window.location.pathname === '/all-products';

  const underlineVariants = {
    initial: {
      scaleX: 0,
    },
    hover: {
      scaleX: 1,
      transition: { duration: 0.3 },
    },
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/all-products');
  };

  return (
    <motion.div className="relative pb-1 cursor-pointer">
      <a
        href="/all-products"
        onClick={handleClick}
        className={`text-sm font-medium transition-colors duration-200 ${
          isActive
            ? 'text-foreground'
            : 'text-foreground/70 hover:text-foreground'
        }`}
      >
        Nos Parfums
      </a>
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-px bg-[#D4AF37] w-full"
        variants={underlineVariants}
        initial="initial"
        whileHover="hover"
        style={{
          originX: 0.5,
        }}
      />
    </motion.div>
  );
};

// ============================================================================
// ACTION ICON COMPONENT (Bronze brossé avec hover)
// ============================================================================
interface ActionIconProps {
  icon: React.ReactNode;
  onClick?: () => void;
  badge?: number;
  title?: string;
  isActive?: boolean;
}

const ActionIcon = ({ icon, onClick, badge, title, isActive }: ActionIconProps) => {
  return (
    <motion.button
      className={`p-2 rounded-full transition-all duration-200 relative ${
        isActive ? 'bg-amber-50/30' : 'hover:bg-amber-50/20'
      }`}
      onClick={onClick}
      title={title}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-[#A68A56]">{icon}</div>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-black text-xs rounded-full flex items-center justify-center font-semibold">
          {badge}
        </span>
      )}
    </motion.button>
  );
};

// ============================================================================
// MAIN HEADER COMPONENT
// ============================================================================
const Header = ({ cartItemsCount: propsCartItemsCount, onCartClick: propsOnCartClick }: HeaderProps) => {
  // Prefer cart context when available to avoid needing to pass props from many pages
  let cartItemsCount = propsCartItemsCount;
  let onCartClick = propsOnCartClick;

  try {
    const cart = useCart();
    if (cart) {
      cartItemsCount = cart.cartItemsCount;
      onCartClick = () => cart.setIsCartOpen(true);
    }
  } catch (err) {
    // If hooks are not available for some reason, fall back to props
  }
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Throttle scroll event
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  // Calculate scale and opacity based on scroll
  const isScrolled = scrollY > 40;
  const headerPaddingScale = isScrolled ? 0.85 : 1;
  const backdropOpacity = isScrolled ? 0.5 : 0.4;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <header className={`${isScrolled ? 'fixed top-0 left-0 right-0' : 'relative mt-6'} w-full z-[100] bg-white/70 dark:bg-black/40 backdrop-blur-md transition-all duration-300`}>

      {/* Main Header with Glassmorphism */}
      <motion.div
        className={`backdrop-blur-xl transition-all duration-300`}
        style={{
          backgroundColor: `rgba(255, 255, 255, ${backdropOpacity * 0.16})`,
        }}
        animate={{
          backgroundColor: `rgba(255, 255, 255, ${backdropOpacity * 0.16})`,
        }}
      >
        <div className="container mx-auto">
          <motion.div
            className="flex items-center justify-between w-full transition-[padding] duration-300"
            style={{
              padding: `${1 * headerPaddingScale}rem 1rem`,
            }}
            animate={{
              padding: `${1 * headerPaddingScale}rem 1rem`,
            }}
          >
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -ml-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-[#A68A56]" strokeWidth={1.5} />
              ) : (
                <Menu className="w-5 h-5 text-[#A68A56]" strokeWidth={1.5} />
              )}
            </button>

            {/* Desktop Navigation - LEFT */}
            <nav className="hidden md:flex items-center gap-8 flex-1">
              <PerfumeNavDropdown 
                isOpen={false} 
                onToggle={() => {}}
                onClose={() => {}}
              />
            </nav>

            {/* Logo - CENTER */}
            <div className="flex-1 flex justify-center md:flex-none">
              <Logo />
            </div>

            {/* Actions - RIGHT */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative flex items-center">
                {isSearchOpen && (
                  <motion.input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mr-2 w-48 md:w-64 px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 transition-all"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      borderColor: 'rgba(212, 175, 55, 0.3)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                    }}
                    autoFocus
                    initial={{ opacity: 0, scale: 0.95, width: 0 }}
                    animate={{ opacity: 1, scale: 1, width: 'auto' }}
                    exit={{ opacity: 0, scale: 0.95, width: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <ActionIcon
                  icon={<Search strokeWidth={1.5} className="w-5 h-5" />}
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  title="Rechercher"
                />
              </form>

              {/* Cart */}
              <ActionIcon
                icon={<ShoppingBag strokeWidth={1.5} className="w-5 h-5" />}
                onClick={onCartClick}
                badge={cartItemsCount}
                title="Panier"
              />

              {/* Admin */}
              {user?.role === 'admin' && (
                <ActionIcon
                  icon={<Settings strokeWidth={1.5} className="w-5 h-5" />}
                  onClick={() => navigate('/admin')}
                  title="Panneau d'Administration"
                />
              )}

              {/* User/Auth Actions */}
              {user ? (
                <div className="relative">
                  <ActionIcon
                    icon={<User strokeWidth={1.5} className="w-5 h-5" />}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    isActive={isProfileOpen}
                    title={user.username}
                  />

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-background border border-border/40 rounded-lg shadow-lg backdrop-blur-md overflow-hidden z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 py-3 border-b border-border/30">
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        {user.role === 'admin' && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-[#D4AF37]/20 text-[#D4AF37] rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          navigate('/mes-informations');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50/20 transition-colors flex items-center gap-2 text-foreground hover:text-[#D4AF37]"
                      >
                        <Settings className="w-4 h-4" strokeWidth={1.5} />
                        Mes informations
                      </button>
                      <button
                        onClick={() => {
                          navigate('/favorites');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50/20 transition-colors flex items-center gap-2 text-foreground hover:text-[#D4AF37]"
                      >
                        <Heart className="w-4 h-4" strokeWidth={1.5} />
                        Mes coups de coeurs
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50/20 transition-colors flex items-center gap-2 text-[#A68A56]"
                      >
                        <LogOut className="w-4 h-4" strokeWidth={1.5} />
                        Déconnexion
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex gap-4">
                  <Link to="/login">
                    <button className="text-sm font-medium transition-colors duration-200 text-foreground/70 hover:text-foreground">
                      Connexion
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button className="text-sm font-medium transition-colors duration-200 text-foreground/70 hover:text-foreground">
                      Inscription
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden border-t border-border/20 bg-background/95 backdrop-blur-md"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="container mx-auto py-4 flex flex-col gap-4 px-4">
              {/* Tous nos Parfums */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigate('/all-products');
                    setIsMenuOpen(false);
                  }}
                  className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors py-2 w-full text-left"
                >
                  Nos Parfums
                </button>
              </div>

              {user?.role === 'admin' && (
                <a
                  href="/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/admin');
                    setIsMenuOpen(false);
                  }}
                  className="text-sm font-medium text-[#D4AF37] py-2"
                >
                  Administration
                </a>
              )}

              {/* Mobile Auth */}
              {!user && (
                <div className="flex flex-col gap-3 pt-4 border-t border-border/20">
                  <Link to="/login">
                    <button className="w-full text-sm font-medium transition-colors duration-200 text-foreground/70 hover:text-foreground">
                      Connexion
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button className="w-full text-sm font-medium transition-colors duration-200 text-foreground/70 hover:text-foreground">
                      Inscription
                    </button>
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </motion.div>
    </header>
  );
};

export default Header;
