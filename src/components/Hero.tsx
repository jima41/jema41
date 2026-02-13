import { useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import heroImage from '@/assets/hero-perfume.jpg';
import { useMediaQuery } from '@/hooks/use-media-query';

const Hero = () => {
  const hasFinePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 110, damping: 34, mass: 0.8 });
  const springY = useSpring(y, { stiffness: 110, damping: 34, mass: 0.8 });
  const springRotate = useSpring(rotate, { stiffness: 110, damping: 34, mass: 0.8 });

  const handleExplore = () => {
    // Safety check for SSR and DOM readiness
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const element = document.getElementById('notre-selection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLElement>) => {
    // Désactiver complètement les animations sur mobile
    if (!hasFinePointer || isMobile || typeof window === 'undefined') return;

    const normalizedX = event.clientX / window.innerWidth - 0.5;
    const normalizedY = event.clientY / window.innerHeight - 0.5;

    const targetX = Math.max(-8, Math.min(8, normalizedX * 16));
    const targetY = Math.max(-8, Math.min(8, normalizedY * 16));

    x.set(targetX);
    y.set(targetY * -1);
    rotate.set(Math.max(-1.5, Math.min(1.5, normalizedX * 3)));
  }, [hasFinePointer, x, y, rotate, isMobile]);

  const handleMouseLeave = useCallback(() => {
    // Désactiver complètement les animations sur mobile
    if (!hasFinePointer || isMobile || typeof window === 'undefined') return;
    x.set(0);
    y.set(0);
    rotate.set(0);
  }, [hasFinePointer, x, y, rotate, isMobile]);

  return (
    <section
      className="relative min-h-screen sm:min-h-[70vh] md:min-h-[85vh] flex items-center overflow-hidden"
      onMouseMove={hasFinePointer ? handleMouseMove : undefined}
      onMouseLeave={hasFinePointer ? handleMouseLeave : undefined}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Luxury Perfume Collection"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 sm:from-background/80 via-background/50 sm:via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl px-6 py-8 sm:py-12 md:py-0 md:px-12 lg:px-20">
        <div className="max-w-2xl animate-fade-up text-left md:text-left">
          {/* Kicker */}
          <span className="inline-block text-[11px] sm:text-xs font-medium text-[#A68A56] mb-3 sm:mb-4 tracking-[0.3em] uppercase">
            Collection 2025
          </span>
          
          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-serif leading-tight sm:leading-snug md:leading-tight mb-3 sm:mb-6">
            L'Art de la 
            {/* Mobile version with borders */}
            <span 
              style={{ 
                backgroundImage: 'linear-gradient(to right, #D4AF37, #FCEEAC, #A68A56)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(-0.75px -0.75px 0 #000) drop-shadow(0.75px -0.75px 0 #000) drop-shadow(-0.75px 0.75px 0 #000) drop-shadow(0.75px 0.75px 0 #000) drop-shadow(0 0.75px 1.5px rgba(0, 0, 0, 0.6))'
              }}
              className="block sm:hidden"
            >
              Parfumerie
            </span>
            {/* Desktop version without borders */}
            <span 
              style={{ 
                backgroundImage: 'linear-gradient(to right, #D4AF37, #FCEEAC, #A68A56)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              className="hidden sm:block"
            >
              Parfumerie
            </span>
          </h1>
          
          {/* Description - Mobile version */}
          <p 
            className="text-xs sm:text-base font-light leading-relaxed text-gray-600 mb-[26rem] sm:mb-8 md:mb-10 max-w-md sm:max-w-none sm:hidden"
          >
            Découvrez notre sélection de parfums d'exception, soigneusement choisis pour éveiller vos sens.
          </p>
          
          {/* Description - Desktop version without borders */}
          <p className="text-xs sm:text-base md:text-lg font-light leading-relaxed text-gray-600 md:text-foreground mb-6 sm:mb-8 md:mb-10 max-w-md hidden sm:block">
            Découvrez notre sélection de parfums d'exception, soigneusement choisis pour éveiller vos sens.
          </p>
          
          {/* CTA Button - Mobile version */}
          <button onClick={handleExplore} className="sm:hidden group px-4 sm:px-6 py-3 md:py-3.5 rounded-lg border-[0.5px] border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-[#D4AF37] transition-all duration-500 ease-in-out font-montserrat text-xs sm:text-sm font-light tracking-[0.2em] uppercase text-white min-h-12">
            <span className="inline-block transition-transform duration-500 ease-in-out group-hover:-translate-y-0.5">
              Explorer
            </span>
          </button>
          
          {/* CTA Button - Desktop version */}
          <button onClick={handleExplore} className="hidden sm:inline-block group px-4 sm:px-6 py-3 md:py-3.5 rounded-lg border-[0.5px] border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-[#D4AF37] transition-all duration-500 ease-in-out font-montserrat text-xs sm:text-sm font-light tracking-[0.2em] uppercase text-black min-h-10">
            <span className="inline-block transition-transform duration-500 ease-in-out group-hover:-translate-y-0.5">
              Explorer la Collection
            </span>
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
export default Hero;