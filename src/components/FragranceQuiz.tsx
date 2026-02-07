import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type OlfactoryFamily = 'gourmand' | 'frais' | 'épicé' | 'boisé';

interface QuizOption {
  id: OlfactoryFamily;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  gradient: string;
}

const quizOptions: QuizOption[] = [
  {
    id: 'gourmand',
    title: 'Gourmand',
    description: 'Notes sucrées, vanillées et addictives',
    imageSrc: 'http://www.image-heberg.fr/files/17704237253410028282.png',
    imageAlt: 'Flacon de parfum avec vanille et caramel',
    gradient: 'from-amber-100 to-orange-100',
  },
  {
    id: 'frais',
    title: 'Frais',
    description: 'Notes aquatiques, citronnées et légères',
    imageSrc: 'https://www.image-heberg.fr/files/thumbs/17703938173332812077.png',
    imageAlt: 'Flacon de parfum avec citron et eau',
    gradient: 'from-cyan-100 to-blue-100',
  },
  {
    id: 'épicé',
    title: 'Épicé',
    description: 'Notes chaudes, intenses et envoutantes',
    imageSrc: 'http://www.image-heberg.fr/files/17704237922198395105.png',
    imageAlt: 'Épices chaudes autour d\'un flacon de parfum',
    gradient: 'from-red-100 to-rose-100',
  },
  {
    id: 'boisé',
    title: 'Boisé',
    description: 'Notes terreuses, profondes et élégantes',
    imageSrc: 'http://www.image-heberg.fr/files/17704237022363089774.png',
    imageAlt: 'Flacon de parfum posé sur du bois',
    gradient: 'from-emerald-100 to-green-100',
  },
];

const FragranceQuiz = () => {
  const navigate = useNavigate();
  const [selectedFamily, setSelectedFamily] = useState<OlfactoryFamily | null>(null);

  const handleSelect = (id: OlfactoryFamily) => {
    setSelectedFamily(id);
  };

  const handleDiscover = () => {
    if (selectedFamily) {
      // Redirect to all products page with scent filter
      navigate(`/products?scent=${selectedFamily}`);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-champagne/30 text-foreground text-xs font-medium mb-4 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Quiz Olfactif
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-normal mb-4">Trouvez votre Fragrance Parfaite</h2>
          <p className="text-sm text-foreground/70 max-w-md mx-auto">
            Sélectionnez votre famille olfactive préférée et découvrez les parfums faits pour vous
          </p>
        </div>

        {/* Quiz Options */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto mb-8">
          {quizOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`
                group relative p-6 rounded-2xl transition-all duration-300 overflow-hidden
                ${selectedFamily === option.id 
                  ? 'glass shadow-lg scale-[1.02]' 
                  : 'bg-card hover:bg-card/80 border border-border/50 hover:border-border'
                }
              `}
            >
              {/* Image de fond */}
              {option.imageSrc && (
                <img 
                  src={option.imageSrc} 
                  alt={option.imageAlt}
                  className={`w-full h-32 object-cover rounded-lg mb-3 transition-transform duration-300 ${
                    selectedFamily === option.id ? 'scale-110' : 'scale-100'
                  }`}
                />
              )}

              {/* Selection indicator */}
              {selectedFamily === option.id && (
                <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full animate-pulse z-20" />
              )}
              
              <div className="relative z-10">
                <h3 className="font-semibold mb-1">{option.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {option.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleDiscover}
            disabled={!selectedFamily}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border/40 hover:border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/5 to-transparent hover:from-[#D4AF37]/10 hover:to-[#D4AF37]/5 transition-all text-foreground font-serif text-base font-light tracking-[0.15em] uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#D4AF37]/10"
          >
            Découvrir mes parfums
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FragranceQuiz;
