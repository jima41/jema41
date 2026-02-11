import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// TYPES
// ============================================================================

type OlfactoryFamily = 'boisé' | 'frais' | 'épicé' | 'gourmand' | 'floral' | 'oriental' | 'cuiré';
type QuizStep = 'intro' | 'q1' | 'q2' | 'q3' | 'reveal' | 'result';

interface QuizAnswer {
  label: string;
  family: OlfactoryFamily;
  emoji: string;
}

interface QuizQuestion {
  step: 'q1' | 'q2' | 'q3';
  moment: string;
  title: string;
  subtitle: string;
  answers: QuizAnswer[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FAMILY_COLORS: Record<OlfactoryFamily, { primary: string; glow: string; label: string }> = {
  frais:    { primary: '#A8D8EA', glow: 'rgba(168,216,234,0.5)', label: 'Frais' },
  floral:   { primary: '#E8A0BF', glow: 'rgba(232,160,191,0.5)', label: 'Floral' },
  boisé:    { primary: '#8B6F47', glow: 'rgba(139,111,71,0.5)',  label: 'Boisé' },
  gourmand: { primary: '#C4956A', glow: 'rgba(196,149,106,0.5)', label: 'Gourmand' },
  oriental: { primary: '#A0153E', glow: 'rgba(160,21,62,0.5)',   label: 'Oriental' },
  épicé:    { primary: '#D4A017', glow: 'rgba(212,160,23,0.5)',  label: 'Épicé' },
  cuiré:    { primary: '#4A3728', glow: 'rgba(74,55,40,0.6)',    label: 'Cuiré' },
};

const QUESTIONS: QuizQuestion[] = [
  {
    step: 'q1',
    moment: 'Le Matin',
    title: 'Comment commence votre journée idéale ?',
    subtitle: 'Choisissez l\'instant qui vous ressemble',
    answers: [
      { label: 'Une séance de sport énergisante', family: 'frais', emoji: '🏃' },
      { label: 'Un café en terrasse ensoleillée', family: 'floral', emoji: '☀️' },
      { label: 'Une réunion où j\'affirme mon style', family: 'boisé', emoji: '💼' },
    ],
  },
  {
    step: 'q2',
    moment: 'L\'Après-midi',
    title: 'Quel moment de détente recherchez-vous ?',
    subtitle: 'Laissez-vous guider par vos envies',
    answers: [
      { label: 'Une lecture calme dans un fauteuil en cuir', family: 'cuiré', emoji: '📖' },
      { label: 'Un goûter gourmand entre amis', family: 'gourmand', emoji: '🍰' },
      { label: 'Une promenade en forêt pour déconnecter', family: 'boisé', emoji: '🌲' },
    ],
  },
  {
    step: 'q3',
    moment: 'La Soirée',
    title: 'Quelle ambiance pour votre sortie ce soir ?',
    subtitle: 'Le final de votre journée parfaite',
    answers: [
      { label: 'Un dîner aux chandelles intime', family: 'oriental', emoji: '🕯️' },
      { label: 'Une soirée chic et audacieuse', family: 'épicé', emoji: '✨' },
      { label: 'Un événement mondain tout en finesse', family: 'floral', emoji: '🥂' },
    ],
  },
];

// ============================================================================
// AURA BLOB COMPONENT
// ============================================================================

function AuraBlob({ families, step }: { families: OlfactoryFamily[]; step: QuizStep }) {
  // Calculate blended color from selected families
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const blendedColor = useMemo(() => {
    if (families.length === 0) return { r: 212, g: 175, b: 55 }; // Gold default
    const colors = families.map(f => hexToRgb(FAMILY_COLORS[f].primary));
    const avg = {
      r: Math.round(colors.reduce((s, c) => s + c.r, 0) / colors.length),
      g: Math.round(colors.reduce((s, c) => s + c.g, 0) / colors.length),
      b: Math.round(colors.reduce((s, c) => s + c.b, 0) / colors.length),
    };
    return avg;
  }, [families]);

  const color = `rgb(${blendedColor.r},${blendedColor.g},${blendedColor.b})`;
  const glow = `rgba(${blendedColor.r},${blendedColor.g},${blendedColor.b},0.4)`;

  const isReveal = step === 'reveal';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full"
        animate={{
          scale: isReveal ? [1, 2.5, 0] : [1, 1.15, 1],
          opacity: isReveal ? [0.6, 0.8, 0] : [0.3, 0.5, 0.3],
          background: `radial-gradient(circle, ${glow}, transparent)`,
        }}
        transition={{
          duration: isReveal ? 1.2 : 3,
          repeat: isReveal ? 0 : Infinity,
          ease: 'easeInOut',
        }}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Main blob */}
      <motion.div
        className="absolute"
        animate={isReveal ? {
          scale: [1, 1.8, 0],
          opacity: [1, 0.8, 0],
          borderRadius: ['40% 60% 55% 45% / 55% 45% 60% 40%', '50%', '50%'],
        } : {
          borderRadius: [
            '40% 60% 55% 45% / 55% 45% 60% 40%',
            '55% 45% 40% 60% / 45% 60% 55% 40%',
            '45% 55% 60% 40% / 60% 40% 45% 55%',
            '40% 60% 55% 45% / 55% 45% 60% 40%',
          ],
          scale: [1, 1.05, 0.97, 1],
        }}
        transition={{
          duration: isReveal ? 1.2 : 6,
          repeat: isReveal ? 0 : Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: '70%',
          height: '70%',
          background: `radial-gradient(circle at 35% 35%, ${color}, ${glow})`,
          boxShadow: `0 0 60px ${glow}, 0 0 120px ${glow}`,
          willChange: 'transform, border-radius',
        }}
      />

      {/* Inner shimmer */}
      <motion.div
        className="absolute rounded-full"
        animate={isReveal ? { opacity: 0, scale: 0 } : {
          opacity: [0.2, 0.5, 0.2],
          scale: [0.3, 0.45, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: '50%',
          height: '50%',
          background: `radial-gradient(circle, rgba(255,255,255,0.4), transparent)`,
          willChange: 'transform, opacity',
        }}
      />

      {/* Reveal particles */}
      <AnimatePresence>
        {isReveal && Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const dist = 100 + Math.random() * 60;
          return (
            <motion.div
              key={`p-${i}`}
              className="absolute rounded-full"
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                opacity: 0,
                scale: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 + Math.random() * 0.4, ease: 'easeOut', delay: 0.3 }}
              style={{
                width: 4 + Math.random() * 6,
                height: 4 + Math.random() * 6,
                background: `linear-gradient(135deg, #D4AF37, ${color})`,
                willChange: 'transform, opacity',
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// PARTICLE BURST (Gold particles on reveal)
// ============================================================================

function ParticleBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 200;
        const size = 2 + Math.random() * 4;
        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full"
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              opacity: 0,
            }}
            transition={{ duration: 1 + Math.random() * 0.5, ease: 'easeOut', delay: Math.random() * 0.3 }}
            style={{
              width: size,
              height: size,
              background: '#D4AF37',
              boxShadow: '0 0 6px rgba(212,175,55,0.6)',
              willChange: 'transform, opacity',
            }}
          />
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN QUIZ COMPONENT
// ============================================================================

export default function SillageQuiz() {
  const { products } = useAdminStore();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [step, setStep] = useState<QuizStep>('intro');
  const [answers, setAnswers] = useState<OlfactoryFamily[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Determine dominant family from answers
  const dominantFamily = useMemo((): OlfactoryFamily => {
    if (answers.length === 0) return 'boisé';
    const counts: Record<string, number> = {};
    answers.forEach(f => { counts[f] = (counts[f] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as OlfactoryFamily;
  }, [answers]);

  // Find recommended products from Supabase/store
  const recommendedProducts = useMemo(() => {
    if (answers.length < 3) return [];

    // Score each product based on family match
    const scored = products
      .filter(p => p.stock > 0)
      .map(p => {
        let score = 0;
        const fam = (p.families || []).map(f => f.toLowerCase());
        const scent = (p.scent || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const allText = [...fam, scent, cat].join(' ');

        // Primary: match dominant family
        if (allText.includes(dominantFamily)) score += 10;

        // Secondary: match other chosen families
        answers.forEach(a => {
          if (allText.includes(a)) score += 3;
        });

        // Bonus for having notes
        if (p.notes_tete?.length || p.notes_coeur?.length || p.notes_fond?.length) score += 1;

        return { product: p, score };
      })
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.product);

    // Fallback: if no good match, pick top 3 by stock
    if (scored.length === 0) {
      return products.filter(p => p.stock > 0).slice(0, 3);
    }
    return scored;
  }, [answers, products, dominantFamily]);

  const currentQuestion = useMemo(() => {
    if (step === 'q1') return QUESTIONS[0];
    if (step === 'q2') return QUESTIONS[1];
    if (step === 'q3') return QUESTIONS[2];
    return null;
  }, [step]);

  const handleAnswer = useCallback((family: OlfactoryFamily, index: number) => {
    setSelectedAnswer(index);
    setTimeout(() => {
      setAnswers(prev => [...prev, family]);
      setSelectedAnswer(null);
      if (step === 'q1') setStep('q2');
      else if (step === 'q2') setStep('q3');
      else if (step === 'q3') {
        setStep('reveal');
        setTimeout(() => setStep('result'), 1800);
      }
    }, 500);
  }, [step]);

  const handleReset = useCallback(() => {
    setStep('intro');
    setAnswers([]);
    setSelectedAnswer(null);
  }, []);

  const handleAddToCart = useCallback((product: any) => {
    addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image || product.image_url,
      scent: product.scent,
      category: product.category,
    } as any);
    toast({
      title: '🛒 Ajouté au panier',
      description: `${product.name} a été ajouté à votre panier`,
    });
  }, [addToCart, toast]);

  const familyInfo = FAMILY_COLORS[dominantFamily];
  const stepProgress = step === 'q1' ? 1 : step === 'q2' ? 2 : step === 'q3' ? 3 : 3;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-background">
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${familyInfo.primary}, transparent 70%)`,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* ================================================================ */}
        {/* INTRO                                                            */}
        {/* ================================================================ */}
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 text-foreground text-xs font-medium mb-6 uppercase tracking-[0.2em]">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                Quiz Olfactif
              </div>

              <h2 className="font-serif text-3xl md:text-5xl font-normal mb-4 leading-tight">
                Votre Instant,<br />Votre Sillage
              </h2>
              <p className="text-sm md:text-base text-foreground/60 mb-8 max-w-md mx-auto leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
                3 moments de votre journée. 1 signature olfactive unique.
                Laissez vos instants révéler votre parfum idéal.
              </p>

              {/* Aura preview */}
              <div className="flex justify-center mb-8">
                <AuraBlob families={[]} step="intro" />
              </div>

              <motion.button
                onClick={() => setStep('q1')}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl
                  bg-foreground/5 backdrop-blur border border-foreground/10
                  hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5
                  active:bg-[#D4AF37]/10
                  transition-all duration-300 text-foreground"
              >
                <span className="font-serif text-base tracking-wider uppercase">Commencer</span>
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* QUESTIONS                                                       */}
          {/* ================================================================ */}
          {currentQuestion && (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="max-w-xl mx-auto"
            >
              {/* Progress */}
              <div className="flex items-center gap-3 mb-8 justify-center">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${
                      i <= stepProgress ? 'w-10 bg-[#D4AF37]' : 'w-6 bg-foreground/10'
                    }`} />
                  </div>
                ))}
                <span className="text-xs text-muted-foreground ml-2">{stepProgress}/3</span>
              </div>

              {/* Aura + Question */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <AuraBlob families={answers} step={step} />
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium uppercase tracking-wider mb-3">
                  {currentQuestion.moment}
                </div>
                <h3 className="font-serif text-2xl md:text-3xl mb-2">
                  {currentQuestion.title}
                </h3>
                <p className="text-sm text-foreground/50" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
                  {currentQuestion.subtitle}
                </p>
              </div>

              {/* Answer cards */}
              <div className="space-y-3">
                {currentQuestion.answers.map((answer, i) => {
                  const isSelected = selectedAnswer === i;
                  const familyColor = FAMILY_COLORS[answer.family];
                  return (
                    <motion.button
                      key={answer.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(answer.family, i)}
                      disabled={selectedAnswer !== null}
                      className={`
                        w-full text-left p-5 rounded-xl border backdrop-blur-sm
                        transition-all duration-300 min-h-[64px]
                        ${isSelected
                          ? 'border-[#D4AF37]/60 bg-[#D4AF37]/10 scale-[1.01]'
                          : 'border-foreground/8 bg-foreground/[0.02] hover:border-foreground/15 hover:bg-foreground/[0.04] active:bg-foreground/[0.06]'
                        }
                        disabled:pointer-events-none
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl flex-shrink-0" role="img">{answer.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm md:text-base font-medium" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
                            {answer.label}
                          </p>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: familyColor.primary }}
                          />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* REVEAL TRANSITION                                               */}
          {/* ================================================================ */}
          {step === 'reveal' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[400px] relative"
            >
              <AuraBlob families={answers} step="reveal" />
              <ParticleBurst active />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 font-serif text-lg text-foreground/60 text-center"
              >
                Votre sillage se dessine…
              </motion.p>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* RESULT                                                          */}
          {/* ================================================================ */}
          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              {/* Verdict */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                  style={{ backgroundColor: `${familyInfo.primary}20`, color: familyInfo.primary }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">{familyInfo.label}</span>
                </motion.div>

                <h3 className="font-serif text-2xl md:text-4xl mb-3">
                  Votre Signature Olfactive
                </h3>
                <p className="text-sm text-foreground/60 max-w-md mx-auto" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
                  Pour vos instants {answers.length >= 1 && '—'} du matin energique à la soirée élégante {answers.length >= 1 && '—'} votre sillage idéal est <strong className="text-foreground">{familyInfo.label}</strong>.
                </p>
              </div>

              {/* Aura small */}
              <div className="flex justify-center mb-8">
                <div className="scale-75">
                  <AuraBlob families={answers} step="result" />
                </div>
              </div>

              {/* Product recommendations */}
              {recommendedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                  {recommendedProducts.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.15 }}
                      className="relative rounded-2xl border border-foreground/8 bg-foreground/[0.02] backdrop-blur-sm overflow-hidden group"
                    >
                      {/* Badge #1 */}
                      {i === 0 && (
                        <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-full bg-[#D4AF37]/90 text-black text-[10px] font-bold uppercase tracking-wider">
                          Parfait pour vous
                        </div>
                      )}

                      {/* Product image */}
                      <div className="aspect-square bg-secondary/20 overflow-hidden">
                        {(product.image || product.image_url) ? (
                          <img
                            src={product.image || product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-active:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">
                            🌸
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="p-4">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{product.brand}</p>
                        <h4 className="font-serif text-base mb-1 line-clamp-1">{product.name}</h4>
                        <p className="text-lg font-light" style={{ color: '#D4AF37' }}>
                          {product.price.toFixed(2)} €
                        </p>

                        {/* Add to cart */}
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleAddToCart(product)}
                          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                            border border-foreground/15 hover:border-[#D4AF37]/50
                            active:bg-[#D4AF37]/10
                            transition-all duration-200 text-sm min-h-[48px]"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Ajouter au panier</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <p>Aucun parfum disponible pour le moment.</p>
                </div>
              )}

              {/* Verdict phrase */}
              {recommendedProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center mb-8 p-6 rounded-2xl border border-foreground/5 bg-foreground/[0.01]"
                >
                  <p className="font-serif text-lg md:text-xl text-foreground/80 italic leading-relaxed">
                    « Pour votre journée, votre signature idéale est{' '}
                    <span className="not-italic font-semibold text-foreground">{recommendedProducts[0]?.name}</span>. »
                  </p>
                </motion.div>
              )}

              {/* Restart */}
              <div className="text-center">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg
                    text-muted-foreground hover:text-foreground
                    active:text-foreground
                    transition-colors text-sm min-h-[48px]"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>Recommencer le quiz</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
