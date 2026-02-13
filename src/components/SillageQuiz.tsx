import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, ShoppingBag, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/store/useAdminStore';
import { useCart } from '@/context/CartContext';

// ============================================================================
// TYPES
// ============================================================================

type OlfactoryFamily = 'boisé' | 'frais' | 'épicé' | 'gourmand' | 'floral' | 'oriental' | 'cuiré';

type AuraTone = 'gold' | 'fresh' | 'floral' | 'amber' | 'leather' | 'spicy' | 'woody';

interface QuizOption {
  id: string;
  title: string;
  description: string;
  auraTone: AuraTone;
}

interface QuizQuestion {
  id: string;
  title: string;
  subtitle: string;
  options: QuizOption[];
}

interface AnswerSelection {
  questionId: string;
  option: QuizOption;
}

interface FamilyScore {
  family: OlfactoryFamily;
  label: string;
  value: number;
  percentage: number;
}

interface ProductRecommendation {
  id: string;
  name: string;
  brand: string;
  price: number;
  image?: string;
  matchScore: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FAMILY_LABELS: Record<OlfactoryFamily, string> = {
  boisé: 'Boisé',
  frais: 'Frais',
  épicé: 'Épicé',
  gourmand: 'Gourmand',
  floral: 'Floral',
  oriental: 'Oriental',
  cuiré: 'Cuiré',
};

const AURA_COLORS: Record<AuraTone, { core: string; halo: string }> = {
  gold: { core: 'rgba(212,175,55,0.58)', halo: 'rgba(212,175,55,0.24)' },
  fresh: { core: 'rgba(155,215,242,0.58)', halo: 'rgba(155,215,242,0.24)' },
  floral: { core: 'rgba(228,160,205,0.56)', halo: 'rgba(228,160,205,0.24)' },
  amber: { core: 'rgba(181,110,45,0.62)', halo: 'rgba(181,110,45,0.25)' },
  leather: { core: 'rgba(92,66,50,0.62)', halo: 'rgba(92,66,50,0.22)' },
  spicy: { core: 'rgba(177,74,44,0.62)', halo: 'rgba(177,74,44,0.24)' },
  woody: { core: 'rgba(107,88,69,0.62)', halo: 'rgba(107,88,69,0.24)' },
};

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'context',
    title: "Le Contexte · L'Intention",
    subtitle: 'Dans quelle situation votre parfum doit-il rayonner ?',
    options: [
      { id: 'date', title: 'Rendez-vous galant', description: 'Sillage sensuel, tension douce, proximité.', auraTone: 'floral' },
      { id: 'board', title: 'Réunion de direction', description: 'Présence nette, crédibilité, impact.', auraTone: 'woody' },
      { id: 'sea_trip', title: 'Escapade en bord de mer', description: 'Air salin, liberté, lumière.', auraTone: 'fresh' },
      { id: 'gala', title: 'Soirée d’apparat (Gala)', description: 'Élégance dramatique, aura magistrale.', auraTone: 'amber' },
      { id: 'comfort', title: 'Moment de réconfort chez soi', description: 'Confort chaud, intimité, douceur.', auraTone: 'gold' },
    ],
  },
  {
    id: 'opening',
    title: 'L’Ouverture · Notes de Tête',
    subtitle: 'Quelle sensation initie votre signature ?',
    options: [
      { id: 'citrus', title: 'Zestes d’agrumes pressés', description: 'Éclat vif, énergie propre.', auraTone: 'fresh' },
      { id: 'dew', title: 'Rosée du matin & herbe coupée', description: 'Fraîcheur verte, texture botanique.', auraTone: 'fresh' },
      { id: 'marine', title: 'Air marin iodé', description: 'Transparence minérale et saline.', auraTone: 'fresh' },
      { id: 'juicy_fruit', title: 'Fruits juteux & sucrés', description: 'Pulpe lumineuse, gourmandise chic.', auraTone: 'gold' },
    ],
  },
  {
    id: 'heart',
    title: 'Le Cœur · Caractère',
    subtitle: 'Quelle matière signe votre personnalité ?',
    options: [
      { id: 'white_flowers', title: 'Bouquet de fleurs blanches', description: 'Jasmin, tubéreuse, opulence.', auraTone: 'floral' },
      { id: 'mystic_rose', title: 'Rose mystique veloutée', description: 'Rose profonde, addictive.', auraTone: 'floral' },
      { id: 'cool_spices', title: 'Épices froides', description: 'Cardamome, baies roses, tranchant.', auraTone: 'spicy' },
      { id: 'wild_aromatics', title: 'Aromates sauvages', description: 'Lavande, sauge, énergie verte.', auraTone: 'woody' },
    ],
  },
  {
    id: 'depth',
    title: 'La Profondeur · Notes de Fond',
    subtitle: 'Quel sillage laisse votre empreinte ?',
    options: [
      { id: 'precious_woods', title: 'Bois précieux', description: 'Santal, cèdre, noblesse sèche.', auraTone: 'woody' },
      { id: 'warm_amber', title: 'Ambre chaud & résines', description: 'Chaleur dense, profondeur noble.', auraTone: 'amber' },
      { id: 'smoked_leather', title: 'Cuir tanné & fumé', description: 'Texture sombre, chic absolu.', auraTone: 'leather' },
      { id: 'white_musks', title: 'Muscs blancs cotonneux', description: 'Seconde peau, douceur lumineuse.', auraTone: 'gold' },
    ],
  },
  {
    id: 'temperament',
    title: 'Le Tempérament · Intensité',
    subtitle: 'Quel niveau de projection recherchez-vous ?',
    options: [
      { id: 'soft_trail', title: 'Un murmure discret', description: 'Intime, élégant, peau à peau.', auraTone: 'fresh' },
      { id: 'elegant_presence', title: 'Une présence élégante', description: 'Impact maîtrisé, allure nette.', auraTone: 'gold' },
      { id: 'bold_signature', title: 'Une signature inoubliable', description: 'Puissance assumée, trace longue.', auraTone: 'amber' },
    ],
  },
  {
    id: 'style',
    title: 'L’Esprit · Style',
    subtitle: 'Quelle allure raconte le mieux votre identité ?',
    options: [
      { id: 'classic', title: 'Intemporel & Classique', description: 'Structure pure, élégance durable.', auraTone: 'woody' },
      { id: 'modern_bold', title: 'Moderne & Audacieux', description: 'Contrastes marqués, effet couture.', auraTone: 'spicy' },
      { id: 'bohemian', title: 'Bohème & Naturel', description: 'Organique, libre, sensuel.', auraTone: 'floral' },
    ],
  },
];

const SCORE_RULES: Record<string, Partial<Record<OlfactoryFamily, number>>> = {
  date: { oriental: 3, cuiré: 2, épicé: 1 },
  board: { boisé: 3, épicé: 2, cuiré: 1 },
  sea_trip: { frais: 4, floral: 1 },
  gala: { oriental: 3, épicé: 2, cuiré: 1 },
  comfort: { gourmand: 3, boisé: 1, floral: 1 },

  citrus: { frais: 4, floral: 1 },
  dew: { frais: 3, floral: 2 },
  marine: { frais: 4, boisé: 1 },
  juicy_fruit: { gourmand: 4, floral: 1 },

  white_flowers: { floral: 4, oriental: 1 },
  mystic_rose: { floral: 3, oriental: 2 },
  cool_spices: { épicé: 4, boisé: 1 },
  wild_aromatics: { frais: 2, boisé: 2, épicé: 1 },

  precious_woods: { boisé: 4, épicé: 1 },
  warm_amber: { oriental: 4, gourmand: 1 },
  smoked_leather: { cuiré: 4, boisé: 2, épicé: 1 },
  white_musks: { floral: 2, frais: 2, oriental: 1 },

  soft_trail: { frais: 2, floral: 2, boisé: 1 },
  elegant_presence: { boisé: 2, floral: 1, oriental: 1, épicé: 1 },
  bold_signature: { oriental: 3, cuiré: 2, épicé: 2 },

  classic: { boisé: 2, floral: 2, oriental: 1 },
  modern_bold: { épicé: 2, cuiré: 2, oriental: 2 },
  bohemian: { frais: 2, floral: 2, gourmand: 1, boisé: 1 },
};

const FAMILY_SYNONYMS: Record<OlfactoryFamily, string[]> = {
  boisé: ['boise', 'boisé', 'woody'],
  frais: ['frais', 'fresh', 'aquatique', 'frais/aquatique'],
  épicé: ['epice', 'épicé', 'spicy'],
  gourmand: ['gourmand'],
  floral: ['floral', 'fleur'],
  oriental: ['oriental', 'ambre', 'amber'],
  cuiré: ['cuire', 'cuiré', 'leather'],
};

// ============================================================================
// HELPERS
// ============================================================================

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function createEmptyScores(): Record<OlfactoryFamily, number> {
  return {
    boisé: 0,
    frais: 0,
    épicé: 0,
    gourmand: 0,
    floral: 0,
    oriental: 0,
    cuiré: 0,
  };
}

function calculateResults(answers: AnswerSelection[]) {
  const scores = createEmptyScores();

  answers.forEach((answer) => {
    const rule = SCORE_RULES[answer.option.id];
    if (!rule) return;

    (Object.keys(rule) as OlfactoryFamily[]).forEach((familyKey) => {
      scores[familyKey] += rule[familyKey] ?? 0;
    });
  });

  const sortedFamilies = (Object.keys(scores) as OlfactoryFamily[])
    .map((family) => ({ family, value: scores[family] }))
    .sort((a, b) => b.value - a.value);

  const dominantFamily = sortedFamilies[0]?.family ?? 'boisé';

  return {
    scores,
    dominantFamily,
    sortedFamilies,
  };
}

function AuraBlob({ tone }: { tone: AuraTone }) {
  const aura = AURA_COLORS[tone];

  return (
    <div className="relative mx-auto h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56">
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          opacity: [0.25, 0.45, 0.25],
          scale: [1, 1.1, 1],
          background: [`radial-gradient(circle, ${aura.halo}, transparent 70%)`],
        }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: 'blur(8px)', willChange: 'transform, opacity' }}
      />

      <motion.div
        className="absolute inset-[14%]"
        animate={{
          borderRadius: [
            '44% 56% 62% 38% / 38% 45% 55% 62%',
            '52% 48% 36% 64% / 62% 44% 56% 38%',
            '40% 60% 56% 44% / 40% 60% 40% 60%',
            '44% 56% 62% 38% / 38% 45% 55% 62%',
          ],
          scale: [1, 1.04, 0.97, 1],
          background: [
            `radial-gradient(circle at 32% 35%, rgba(255,255,255,0.35), ${aura.core})`,
            `radial-gradient(circle at 62% 48%, rgba(255,255,255,0.28), ${aura.core})`,
            `radial-gradient(circle at 45% 30%, rgba(255,255,255,0.33), ${aura.core})`,
          ],
        }}
        transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          boxShadow: '0 0 38px rgba(212,175,55,0.22)',
          willChange: 'transform, border-radius, background',
        }}
      />
    </div>
  );
}

function GoldenSwirl() {
  return (
    <div className="relative mx-auto h-48 w-48 sm:h-56 sm:w-56">
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
        style={{
          border: '1px solid rgba(212,175,55,0.25)',
          borderTopColor: 'rgba(212,175,55,0.9)',
          willChange: 'transform',
        }}
      />
      <motion.div
        className="absolute inset-[18%] rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
        style={{
          border: '1px solid rgba(212,175,55,0.16)',
          borderTopColor: 'rgba(212,175,55,0.75)',
          willChange: 'transform',
        }}
      />

      {Array.from({ length: 16 }).map((_, index) => {
        const angle = (index / 16) * Math.PI * 2;
        const distance = 72 + ((index % 4) * 8);
        return (
          <motion.div
            key={index}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
            animate={{
              x: [Math.cos(angle) * (distance - 10), Math.cos(angle) * (distance + 14)],
              y: [Math.sin(angle) * (distance - 10), Math.sin(angle) * (distance + 14)],
              opacity: [0.25, 0.9, 0.25],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{ duration: 2 + (index % 4) * 0.25, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: '#D4AF37',
              boxShadow: '0 0 10px rgba(212,175,55,0.6)',
              willChange: 'transform, opacity',
            }}
          />
        );
      })}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function SillageQuiz() {
  const products = useAdminStore((state) => state.products);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<'quiz' | 'alchemy' | 'result'>('quiz');
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerSelection[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [auraTone, setAuraTone] = useState<AuraTone>('gold');

  const question = QUESTIONS[stepIndex];
  const totalSteps = QUESTIONS.length;

  const resultData = useMemo(() => calculateResults(answers), [answers]);

  const topFamilies = useMemo<FamilyScore[]>(() => {
    const total = resultData.sortedFamilies.reduce((sum, item) => sum + item.value, 0) || 1;

    return resultData.sortedFamilies.slice(0, 3).map((item) => ({
      family: item.family,
      label: FAMILY_LABELS[item.family],
      value: item.value,
      percentage: Math.round((item.value / total) * 100),
    }));
  }, [resultData]);

  const selectedSituation = useMemo(() => {
    const contextAnswer = answers.find((item) => item.questionId === 'context');
    return contextAnswer?.option.title ?? 'style personnel';
  }, [answers]);

  const recommendedProducts = useMemo<ProductRecommendation[]>(() => {
    const inStock = products.filter((product) => product.stock > 0);
    if (inStock.length === 0) return [];

    const topFamilyIds = topFamilies.map((family) => family.family);

    const scored = inStock
      .map((product) => {
        const normalizedFamilies = (product.families || []).map((family) => normalizeText(String(family)));
        const searchBlob = `${normalizedFamilies.join(' ')} ${normalizeText(product.scent || '')} ${normalizeText(product.category || '')}`;

        let matchScore = 0;

        topFamilyIds.forEach((family, index) => {
          const aliases = FAMILY_SYNONYMS[family];
          if (aliases.some((alias) => searchBlob.includes(normalizeText(alias)))) {
            matchScore += index === 0 ? 10 : index === 1 ? 6 : 4;
          }
        });

        if (product.notes_tete?.length || product.notes_coeur?.length || product.notes_fond?.length) {
          matchScore += 1;
        }

        return {
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          image: product.image || product.image_url,
          matchScore,
        };
      })
      .filter((product) => product.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    if (scored.length > 0) return scored;

    return inStock.slice(0, 3).map((fallback, index) => ({
      id: fallback.id,
      name: fallback.name,
      brand: fallback.brand,
      price: fallback.price,
      image: fallback.image || fallback.image_url,
      matchScore: 3 - index,
    }));
  }, [products, topFamilies]);

  const handleRestart = useCallback(() => {
    setStarted(false);
    setPhase('quiz');
    setStepIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setAuraTone('gold');
  }, []);

  const handleAnswer = useCallback(
    (option: QuizOption, index: number) => {
      if (selectedOption !== null || !question) return;

      setSelectedOption(index);
      setAuraTone(option.auraTone);

      const currentQuestionId = question.id;

      setTimeout(() => {
        setAnswers((prev) => [...prev, { questionId: currentQuestionId, option }]);
        setSelectedOption(null);

        if (stepIndex < totalSteps - 1) {
          setStepIndex((prev) => prev + 1);
          return;
        }

        setPhase('alchemy');
        setTimeout(() => {
          setPhase('result');
          setStepIndex(totalSteps);
        }, 1900);
      }, 260);
    },
    [question, selectedOption, stepIndex, totalSteps],
  );

  return (
    <section className="relative overflow-hidden bg-background py-12 sm:py-14 md:py-20">
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_50%_15%,rgba(212,175,55,0.28),transparent_62%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 md:px-12 lg:px-20">
        <AnimatePresence mode="wait">
          {!started && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45 }}
              className="mx-auto max-w-2xl text-center"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-admin-gold/20 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-admin-gold">
                <Sparkles className="h-4 w-4" />
                Diagnostic Olfactif Haute Couture
              </div>

              <h2 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl">
                Une expérience immersive,
                <br />
                pensée comme un rituel.
              </h2>

              <p className="mx-auto mt-4 max-w-xl font-montserrat text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
                Votre profil est calculé sur 7 familles olfactives puis relié à des parfums réels disponibles en stock.
              </p>

              <div className="mt-8 flex justify-center">
                <AuraBlob tone={auraTone} />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setStarted(true)}
                className="mt-8 min-h-12 rounded-xl border-[0.5px] border-admin-gold/20 bg-white/5 px-7 py-3 font-montserrat text-xs uppercase tracking-[0.2em] text-admin-gold backdrop-blur-lg transition-all duration-500 ease-in-out hover:border-admin-gold hover:bg-white/10"
              >
                Lancer le diagnostic
              </motion.button>
            </motion.div>
          )}

          {started && phase === 'quiz' && question && (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="mx-auto max-w-3xl"
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <span className="font-montserrat text-[11px] font-light uppercase tracking-[0.18em] text-muted-foreground">
                  Étape {stepIndex + 1} / {totalSteps}
                </span>
                <div className="h-1.5 w-40 overflow-hidden rounded-full bg-foreground/10 sm:w-56">
                  <motion.div
                    className="h-full rounded-full bg-admin-gold"
                    initial={false}
                    animate={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <div className="mb-8 text-center">
                <AuraBlob tone={auraTone} />
                <h3 className="mt-6 font-serif text-2xl text-foreground sm:text-3xl">{question.title}</h3>
                <p className="mx-auto mt-2 max-w-xl font-montserrat text-sm font-light text-muted-foreground sm:text-base">
                  {question.subtitle}
                </p>
              </div>

              <motion.div
                className="grid grid-cols-1 gap-3 sm:gap-4"
                variants={{ show: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
                initial="hidden"
                animate="show"
              >
                {question.options.map((option, index) => {
                  const isActive = selectedOption === index;

                  return (
                    <motion.button
                      key={option.id}
                      variants={{
                        hidden: { opacity: 0, y: 12, filter: 'blur(8px)' },
                        show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: 'easeOut' } },
                      }}
                      whileHover={
                        selectedOption === null
                          ? {
                              borderColor: 'rgba(212,175,55,0.5)',
                              boxShadow: '0 0 20px rgba(212,175,55,0.2), inset 0 1px 1px rgba(255,255,255,0.06)',
                            }
                          : undefined
                      }
                      whileTap={selectedOption === null ? { scale: 0.95 } : undefined}
                      disabled={selectedOption !== null}
                      onClick={() => handleAnswer(option, index)}
                      className={`relative w-full overflow-hidden rounded-2xl border-[0.5px] p-4 text-left backdrop-blur-xl transition-all duration-300 ease-in-out sm:p-5 min-h-[100px] sm:min-h-[88px] active:scale-95 ${
                        isActive
                          ? 'border-admin-gold bg-white/10 scale-[0.98]'
                          : 'border-white/10 bg-white/5'
                      }`}
                      style={{
                        willChange: 'transform, box-shadow, filter',
                        boxShadow: isActive
                          ? '0 0 24px rgba(212,175,55,0.28), inset 0 1px 1px rgba(255,255,255,0.06)'
                          : 'inset 0 1px 1px rgba(255,255,255,0.06)',
                      }}
                    >
                      {/* Radial gold glow on selection */}
                      <motion.span
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-10 rounded-full"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: isActive ? 0.32 : 0, scale: isActive ? 1 : 0.8 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        style={{
                          background: 'radial-gradient(circle, rgba(212,175,55,0.35), transparent 65%)',
                        }}
                      />

                      <p className="relative z-10 font-montserrat text-lg tracking-wide text-admin-gold sm:text-xl">{option.title}</p>
                      <p className="relative z-10 mt-1 font-montserrat text-sm font-light tracking-wide leading-relaxed text-muted-foreground">
                        {option.description}
                      </p>
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>
          )}

          {started && phase === 'alchemy' && (
            <motion.div
              key="alchemy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="mx-auto flex min-h-[420px] max-w-3xl items-center justify-center rounded-3xl border border-admin-gold/20 bg-black px-6"
            >
              <div className="text-center">
                <GoldenSwirl />
                <p className="mt-8 font-serif text-2xl text-admin-gold sm:text-3xl">
                  L'alchimie opère...
                </p>
                <p className="mt-2 font-montserrat text-sm font-light text-white/70 sm:text-base">
                  votre signature se dessine.
                </p>
              </div>
            </motion.div>
          )}

          {started && phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="mx-auto max-w-5xl"
            >
              <div className="text-center">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-admin-gold/20 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-admin-gold">
                  <Sparkles className="h-4 w-4" />
                  Signature Royale
                </div>

                <h3 className="font-serif text-3xl text-foreground sm:text-4xl md:text-5xl">
                  Votre Aura est {FAMILY_LABELS[resultData.dominantFamily]}
                </h3>
                <p className="mx-auto mt-3 max-w-2xl font-montserrat text-sm font-light text-muted-foreground sm:text-base">
                  Analyse pondérée sur 7 familles olfactives, connectée à votre intention et à des parfums réellement disponibles.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:gap-4">
                {topFamilies.map((family, index) => (
                  <motion.div
                    key={family.family}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-2xl border-[0.5px] border-admin-gold/20 bg-white/5 p-4 backdrop-blur-lg"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-serif text-xl text-admin-gold">{family.label}</p>
                      <p className="font-montserrat text-sm font-light text-foreground">{family.percentage}%</p>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                      <motion.div
                        className="h-full rounded-full bg-admin-gold"
                        initial={{ width: 0 }}
                        animate={{ width: `${family.percentage}%` }}
                        transition={{ duration: 0.55, ease: 'easeOut', delay: index * 0.08 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10">
                <h4 className="mb-4 text-center font-serif text-2xl text-foreground">Vos 3 parfums recommandés</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {recommendedProducts.map((product, index) => (
                    <motion.article
                      key={product.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + index * 0.12 }}
                      className="group cursor-pointer overflow-hidden rounded-2xl border-[0.5px] border-admin-gold/20 bg-white/5 backdrop-blur-lg transition-all duration-500 hover:border-admin-gold/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <div className="relative aspect-square overflow-hidden bg-secondary/20">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-admin-gold">✦</div>
                        )}

                        {/* Add to Cart overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart({
                                id: product.id,
                                productId: product.id,
                                name: product.name,
                                brand: product.brand || '',
                                price: product.price,
                                image: product.image || '',
                              } as any);
                            }}
                            className="rounded-full border border-white/40 p-4 min-w-[48px] min-h-[48px] text-white transition-all duration-300 hover:border-admin-gold/70 hover:text-admin-gold active:scale-95"
                            whileHover={{ scale: 1.08, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Ajouter au panier"
                          >
                            <ShoppingBag strokeWidth={1.5} className="h-6 w-6" />
                          </motion.button>
                        </div>
                      </div>

                      <div className="space-y-2 p-4">
                        <p className="font-montserrat text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{product.brand}</p>
                        <p className="font-serif text-xl text-foreground transition-colors duration-300 group-hover:text-admin-gold">{product.name}</p>
                        <p className="font-montserrat text-sm font-light text-admin-gold">{product.price.toFixed(2)} €</p>
                        <p className="font-montserrat text-xs font-light text-muted-foreground">
                          Recommandé pour votre {selectedSituation}.
                        </p>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>

              <div className="mt-10 text-center">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRestart}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-admin-gold/20 bg-white/5 px-5 py-3 font-montserrat text-sm font-light text-foreground backdrop-blur-md transition-all duration-300 ease-in-out hover:border-admin-gold active:scale-95"
                >
                  <RotateCcw className="h-5 w-5" />
                  Refaire le diagnostic
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
