import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminStore, type Product } from '@/store/useAdminStore';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { OlfactoryFamily } from '@/lib/olfactory';

// ============================================================================
// CONSTANTS & DATA
// ============================================================================

type Step = 'intro' | 'quiz' | 'loading' | 'results';

const QUESTIONS = [
  {
    id: 1,
    question: "Quelle intensité recherchez-vous ?",
    options: [
      { label: "Légère & Aérienne", value: "light" },
      { label: "Présente & Équilibrée", value: "moderate" },
      { label: "Intense & Signée", value: "intense" },
      { label: "Majestueuse & Rare", value: "royal" }
    ]
  },
  {
    id: 2,
    question: "Quel moment vous inspire le plus ?",
    options: [
      { label: "L'Aube Fraîche", value: "morning" },
      { label: "Le Zénith Solaire", value: "noon" },
      { label: "Le Crépuscule Doré", value: "evening" },
      { label: "La Nuit Profonde", value: "night" }
    ]
  },
  {
    id: 3,
    question: "Quelle matière vous touche le plus ?",
    options: [
      { label: "Fleurs Blanches", value: "floral" },
      { label: "Bois Précieux", value: "woody" },
      { label: "Épices Chaudes", value: "spicy" },
      { label: "Vanille & Ambre", value: "gourmand" }
    ]
  }
];

// ============================================================================
// ANIMATIONS & SUB-COMPONENTS
// ============================================================================

const SprayBurst = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div
      className="absolute inset-0 z-[50] flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={onComplete}
    >
      {/* Subtle Mist Flash */}
      <motion.div
        className="absolute w-full h-full bg-white/10 blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      
      {/* Fine Golden Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#D4AF37]"
          style={{ width: Math.random() * 2 + 'px', height: Math.random() * 2 + 'px' }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ 
            x: (Math.random() - 0.5) * 600, 
            y: (Math.random() - 0.5) * 400,
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
};

const FillingBottle = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8">
      <div className="relative w-12 h-20">
        <div className="absolute inset-0 overflow-hidden">
          <svg viewBox="0 0 100 160" className="w-full h-full absolute z-20">
            <path
              d="M30 10 H70 V30 H90 V150 H10 V30 H30 V10 Z"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-[#D4AF37]/80 z-10"
            initial={{ height: "0%" }}
            animate={{ height: "85%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            onAnimationComplete={() => setTimeout(onComplete, 400)}
            style={{ width: '80%', left: '10%', bottom: '5%' }}
          />
        </div>
      </div>
      <motion.p 
        className="mt-4 font-serif text-xs text-[#D4AF37]/70 italic tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.5, 1] }}
        transition={{ duration: 2 }}
      >
        Création de votre accord...
      </motion.p>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DiagnosticRitual = () => {
  const [step, setStep] = useState<Step>('intro');
  const [isSpraying, setIsSpraying] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  
  const { products, isInitialized, initializeProducts } = useAdminStore();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized) {
      initializeProducts();
    }
  }, [isInitialized, initializeProducts]);

  const handleStart = () => {
    setIsSpraying(true);
    setTimeout(() => {
        setStep('quiz');
        setTimeout(() => setIsSpraying(false), 600); 
    }, 200);
  };

  const handleRestart = () => {
    setStep('intro');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setRecommendations([]);
  };

  const calculateRecommendations = (finalAnswers: Record<number, string>) => {
    // Logic based on Q3 (Matter) mainly
    const matter = finalAnswers[3];
    let family: OlfactoryFamily | null = null;

    if (matter === 'floral') family = 'Floral';
    else if (matter === 'woody') family = 'Boisé';
    else if (matter === 'spicy') family = 'Épicé';
    else if (matter === 'gourmand') family = 'Gourmand'; // Could also map to Oriental

    // Fallback or refinement based on Q2 (Moment)
    // if Q2 is 'morning' -> maybe 'Frais/Aquatique' or lighter floral?
    // if Q2 is 'night' -> Oriental / Intense
    
    if (finalAnswers[2] === 'morning' && matter === 'floral') {
        // Maybe check if we have enough products, otherwise stick to floral
    }

    let matching = products.filter(p => 
        family && p.families && p.families.includes(family)
    );

    if (matching.length === 0 && family) {
        matching = products.filter(p => p.scent && p.scent.toLowerCase().includes(family!.toLowerCase()));
    }
    
    // If we still have no matches (or family was null), try to map from Q1/Q2
    if (matching.length === 0) {
        // Fallback random or specific logic
        // E.g. "morning" -> Frais
        if (finalAnswers[2] === 'morning') {
             matching = products.filter(p => p.families && p.families.includes('Frais/Aquatique'));
        }
    }
    
    // Fallback if absolutely nothing found
    if (matching.length === 0) {
        matching = products; 
    }

    // Select 3 random
    const shuffled = [...matching].sort(() => 0.5 - Math.random());
    setRecommendations(shuffled.slice(0, 3));
  };

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [QUESTIONS[currentQuestionIndex].id]: value };
    setAnswers(newAnswers);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
    } else {
        calculateRecommendations(newAnswers);
        setStep('loading');
    }
  };

  const handleAddToCart = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      if (product.stock === 0) {
        toast.error('Ce produit est actuellement en rupture de stock');
        return;
      }
      addToCart({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image || product.image_url || '',
        scent: product.scent,
        category: product.category || 'mixte'
      });
      toast.success('Ajouté au panier');
    }
  };

  // Hauteur fixe et contenue pour éviter l'effet "massif", sauf en mode results où on a besoin de place
  const containerHeight = step === 'results' ? 'min-h-[600px]' : (step === 'intro' ? 'min-h-[160px]' : 'min-h-[380px]');

  return (
    <div className="w-full flex justify-center px-4 md:px-0 my-12 animate-fade-up">
       <motion.div
        className={`relative w-full max-w-5xl bg-[#0a0a0a] rounded-sm overflow-hidden border border-white/5 shadow-2xl transition-all duration-700 ease-[0.22, 1, 0.36, 1] ${containerHeight}`}
        layout
      >
        <AnimatePresence mode="wait">
            
            {/* --- STEP 1: INTRO (Bandeau Luxe) --- */}
            {step === 'intro' && (
                <motion.div
                    key="intro"
                    className="flex flex-col md:flex-row items-center justify-between px-8 py-10 md:py-8 gap-6 md:gap-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                >
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
                        <span className="text-[10px] font-medium tracking-[0.25em] text-amber-200/60 uppercase">
                            Diagnostic Olfactif Haute Couture
                        </span>
                        
                        <h2 className="font-serif text-2xl md:text-3xl text-[#F5F5F0] font-light leading-tight">
                            Trouvez votre signature
                        </h2>
                        
                        <p className="text-xs text-neutral-500 font-light tracking-wide max-w-md">
                            Une expérience immersive pour révéler le parfum qui capture votre essence.
                        </p>
                    </div>

                    <div className="flex-shrink-0">
                        <Button
                            onClick={handleStart}
                            className="bg-transparent border border-amber-200/30 text-amber-100 hover:bg-amber-900/10 hover:border-amber-200/60 hover:text-[#D4AF37] px-8 py-6 h-auto rounded-sm font-sans text-xs font-medium tracking-[0.15em] uppercase transition-all duration-500 ease-out group"
                        >
                            Commencer l'expérience
                            <span className="ml-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500">→</span>
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* --- STEP 2: QUIZ --- */}
            {step === 'quiz' && (
                <motion.div
                    key="quiz"
                    className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-12 bg-[#0a0a0a]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                     <div className="w-full max-w-2xl">
                        <div className="flex justify-center mb-8">
                            <span className="text-[10px] text-neutral-600 tracking-[0.2em] uppercase font-light">
                                Question {currentQuestionIndex + 1} <span className="text-neutral-800 mx-2">/</span> {QUESTIONS.length}
                            </span>
                        </div>
                        
                        <h3 className="font-serif text-xl md:text-2xl text-[#F5F5F0] mb-10 text-center font-light">
                            {QUESTIONS[currentQuestionIndex].question}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {QUESTIONS[currentQuestionIndex].options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleAnswer(option.value)}
                                    className="p-5 rounded-sm border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-amber-900/30 text-left transition-all duration-300 group active:scale-[0.99]"
                                >
                                    <span className="flex justify-between items-center w-full">
                                        <span className="block text-xs md:text-sm text-neutral-400 group-hover:text-amber-100/90 font-light tracking-wide transition-colors">
                                            {option.label}
                                        </span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-[#D4AF37] transition-colors duration-500" />
                                    </span>
                                </button>
                            ))}
                        </div>
                     </div>
                </motion.div>
            )}

            {/* --- STEP 3: LOADING --- */}
            {step === 'loading' && (
                <motion.div
                    key="loading"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <FillingBottle onComplete={() => setStep('results')} />
                </motion.div>
            )}

            {/* --- STEP 4: RESULTS --- */}
            {step === 'results' && (
                <motion.div
                    key="results"
                    className="absolute inset-0 flex flex-col items-center justify-start p-8 md:p-12 bg-[#0a0a0a] overflow-y-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="text-center mb-10 mt-4">
                        <span className="text-[9px] text-amber-200/50 tracking-[0.25em] uppercase mb-4 block">
                            Votre signature olfactive
                        </span>
                        <h2 className="font-serif text-2xl md:text-3xl text-[#F5F5F0] mb-4 font-light">
                            Sélection Exclusive
                        </h2>
                        <p className="font-sans text-xs text-neutral-500 max-w-lg mx-auto font-light leading-relaxed tracking-wide">
                            Basé sur vos préférences pour {answers[3] === 'floral' ? 'les fleurs blanches' : answers[3] === 'woody' ? 'les bois précieux' : answers[3] === 'spicy' ? 'les épices' : 'la vanille'}, voici nos recommandations.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto mb-10">
                        {recommendations.map((product, index) => (
                             <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl p-2 shadow-lg"
                             >
                                <ProductCard
                                    id={product.id}
                                    name={product.name}
                                    brand={product.brand}
                                    price={product.price}
                                    image={product.image || product.image_url || ''}
                                    scent={product.scent}
                                    stock={product.stock}
                                    notes={product.notes}
                                    notes_tete={product.notes_tete}
                                    notes_coeur={product.notes_coeur}
                                    notes_fond={product.notes_fond}
                                    families={product.families}
                                    onAddToCart={handleAddToCart}
                                />
                             </motion.div>
                        ))}
                        {recommendations.length === 0 && (
                             <div className="col-span-3 text-center text-neutral-500 text-sm">
                                 Aucun résultat trouvé pour cette combinaison.
                             </div>
                        )}
                    </div>

                    <div className="flex justify-center pb-8">
                        <Button 
                            onClick={handleRestart} 
                            variant="outline" 
                            className="border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 px-6 py-4 rounded-sm bg-transparent text-[10px] tracking-widest uppercase"
                        >
                            <RotateCcw className="w-3 h-3 mr-2" />
                            Recommencer
                        </Button>
                    </div>
                </motion.div>
            )}

        </AnimatePresence>

        {isSpraying && <SprayBurst onComplete={() => {}} />}
      </motion.div>
    </div>
  );
};

export default DiagnosticRitual;
