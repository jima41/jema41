import { useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
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
      className="grid grid-cols-1 grid-rows-1 h-[600px] w-full relative isolate bg-[#FAF9F7]"
    >
      {/* Background Image Layer */}
      <img
        src={`${import.meta.env.BASE_URL}images/Hero-section.webp`}
        alt="Collection Parfum Rayha"
        className="col-start-1 row-start-1 w-full h-full object-cover -z-10"
        loading="eager"
        style={{
          imageRendering: 'crisp-edges',
          WebkitOptimizeContrast: 'true',
          MozCrispEdges: 'true',
          msInterpolateMode: 'nearest-neighbor',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Text Content Layer */}
      <div className="col-start-1 row-start-1 w-full h-full z-10 flex items-center justify-start px-6 md:px-12 lg:px-24">
        <div className="max-w-2xl animate-fade-up text-left">
          {/* Kicker */}
          <span className="inline-block text-[11px] sm:text-xs font-medium text-[#A68A56] mb-3 sm:mb-4 tracking-[0.3em] uppercase">
            Collection 2025
          </span>
          
          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-serif leading-tight sm:leading-snug md:leading-tight mb-3 sm:mb-6 tracking-wide">
            L'Art de la 
            {/* Mobile version without borders */}
            <span 
              style={{ 
                backgroundImage: 'linear-gradient(to right, #D4AF37, #FCEEAC, #A68A56)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
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
          
          {/* Description - Mobile version déplacée dans Index.tsx */}
          
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