import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-perfume.jpg';

const Hero = () => {
  const handleExplore = () => {
    const element = document.getElementById('notre-selection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return <section className="relative min-h-screen sm:min-h-[70vh] md:min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Luxury Perfume Collection" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 sm:from-background/80 via-background/50 sm:via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto relative z-10 py-12 sm:py-0">
        <div className="max-w-2xl animate-fade-up text-left">
          {/* Kicker */}
          <span className="inline-block text-xs font-medium text-[#A68A56] mb-4 tracking-[0.3em] uppercase">
            Collection 2025
          </span>
          
          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif leading-tight mb-4 sm:mb-6">
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
            className="text-base font-light leading-relaxed text-gray-600 mb-[26rem] max-w-md sm:hidden"
          >
            Découvrez notre sélection de parfums d'exception, soigneusement choisis pour éveiller vos sens.
          </p>
          
          {/* Description - Desktop version without borders */}
          <p className="text-sm sm:text-lg font-light leading-relaxed text-gray-600 md:text-foreground mb-8 sm:mb-10 max-w-md hidden sm:block">
            Découvrez notre sélection de parfums d'exception, soigneusement choisis pour éveiller vos sens.
          </p>
          
          {/* CTA Button - Mobile version */}
          <button onClick={handleExplore} className="sm:hidden px-6 py-3 rounded-lg border border-border/40 hover:border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/5 to-transparent hover:from-[#D4AF37]/10 hover:to-[#D4AF37]/5 transition-all text-foreground font-serif text-base font-light tracking-[0.15em] uppercase hover:shadow-lg hover:shadow-[#D4AF37]/10">
            Explorer la Collection
          </button>
          
          {/* CTA Button - Desktop version */}
          <button onClick={handleExplore} className="hidden sm:inline-block px-6 py-3 rounded-lg border border-border/40 hover:border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/5 to-transparent hover:from-[#D4AF37]/10 hover:to-[#D4AF37]/5 transition-all text-foreground font-serif text-base font-light tracking-[0.15em] uppercase hover:shadow-lg hover:shadow-[#D4AF37]/10">
            Explorer la Collection
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>;
};
export default Hero;