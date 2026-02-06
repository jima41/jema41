import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-perfume.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Luxury Perfume Collection"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto relative z-10">
        <div className="max-w-xl animate-fade-up">
          <span className="inline-block text-sm font-medium text-muted-foreground mb-4 tracking-widest uppercase">
            Collection 2025
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium leading-tight mb-6">
            L'Art de la 
            <span className="text-gradient block">Parfumerie</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md">
            Découvrez notre sélection de parfums d'exception, soigneusement choisis pour éveiller vos sens.
          </p>
          <Button variant="luxury" size="lg">
            Explorer la Collection
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
