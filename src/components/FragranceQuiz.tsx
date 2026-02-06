import { useState } from 'react';
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
    imageSrc: 'https://images.unsplash.com/photo-1511910849309-0dffb8785146?w=400&h=400&fit=crop',
    imageAlt: 'Flacon de parfum avec vanille et caramel',
    gradient: 'from-amber-100 to-orange-100',
  },
  {
    id: 'frais',
    title: 'Frais',
    description: 'Notes aquatiques, citronnées et légères',
    imageSrc: 'https://images.unsplash.com/photo-1524592714635-5fdfb210e12f?w=400&h=400&fit=crop',
    imageAlt: 'Flacon de parfum avec citron et eau',
    gradient: 'from-cyan-100 to-blue-100',
  },
  {
    id: 'épicé',
    title: 'Épicé',
    description: 'Notes chaudes, intenses et envoutantes',
    imageSrc: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop',
    imageAlt: 'Épices chaudes autour d\'un flacon de parfum',
    gradient: 'from-red-100 to-rose-100',
  },
  {
    id: 'boisé',
    title: 'Boisé',
    description: 'Notes terreuses, profondes et élégantes',
    imageSrc: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop',
    imageAlt: 'Flacon de parfum posé sur du bois',
    gradient: 'from-emerald-100 to-green-100',
  },
];

const FragranceQuiz = () => {
  const [selectedFamily, setSelectedFamily] = useState<OlfactoryFamily | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (id: OlfactoryFamily) => {
    setSelectedFamily(id);
    setShowResult(false);
  };

  const handleDiscover = () => {
    if (selectedFamily) {
      setShowResult(true);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-champagne/30 text-foreground text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Quiz Olfactif
          </div>
          <h2 className="text-3xl md:text-4xl font-medium mb-4">Trouvez Votre Parfum</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
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
                group relative p-6 rounded-2xl transition-all duration-300
                ${selectedFamily === option.id 
                  ? 'glass shadow-lg scale-[1.02]' 
                  : 'bg-card hover:bg-card/80 border border-border/50 hover:border-border'
                }
              `}
            >
              {/* Selection indicator */}
              {selectedFamily === option.id && (
                <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full animate-pulse" />
              )}
              
              <div className="text-4xl mb-3">{option.emoji}</div>
              <h3 className="font-semibold mb-1">{option.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {option.description}
              </p>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            variant="luxury"
            size="lg"
            onClick={handleDiscover}
            disabled={!selectedFamily}
            className="group"
          >
            Découvrir mes parfums
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Result Message */}
        {showResult && selectedFamily && (
          <div className="mt-8 text-center animate-fade-up">
            <div className="inline-block glass rounded-2xl p-6 max-w-md">
              <p className="text-lg">
                Parfait ! Découvrez notre sélection de parfums{' '}
                <span className="font-semibold text-gradient">
                  {quizOptions.find(o => o.id === selectedFamily)?.title.toLowerCase()}s
                </span>{' '}
                ci-dessous.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FragranceQuiz;
