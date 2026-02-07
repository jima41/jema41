/**
 * DICTIONNAIRE OLFACTIF EXHAUSTIF
 * Classification complète des notes olfactives pour pyramide olfactive
 */

export const OLFACTORY_DICTIONARY = {
  // NOTES DE TÊTE (Légèreté & Éclat) - Volatilité élevée
  tete: {
    citron: 'Citron',
    bergamote: 'Bergamote',
    mandarine: 'Mandarine',
    pamplemousse: 'Pamplemousse',
    orange_sanguine: 'Orange sanguine',
    lime: 'Lime (Citron vert)',
    yuzu: 'Yuzu',
    verveine: 'Verveine',
    citronnelle: 'Citronnelle',
    baies_genievre: 'Baies de genièvre',
    poivre_rose: 'Poivre rose',
    menthe_poivree: 'Menthe poivrée',
    lavande: 'Lavande',
    neroli: 'Néroli',
    pomme_verte: 'Pomme verte',
    noix_coco: 'Noix de coco',
    peche: 'Pêche',
    framboise: 'Framboise',
    melon: 'Melon',
    cassis: 'Cassis',
    aldehydes: 'Aldéhydes',
    accord_marin: 'Accord marin',
    calone: 'Calone',
    rhubarbe: 'Rhubarbe',
  },

  // NOTES DE CŒUR (Signature & Corps) - Volatilité moyenne
  coeur: {
    rose_mai: 'Rose de Mai',
    rose_damascena: 'Rose Damascena',
    jasmin_sambac: 'Jasmin Sambac',
    jasmin_espagne: 'Jasmin d\'Espagne',
    iris_toscane: 'Iris de Toscane',
    tuberose: 'Tubéreuse',
    fleur_oranger: 'Fleur d\'oranger',
    ylang_ylang: 'Ylang-Ylang',
    geranium: 'Géranium',
    magnolia: 'Magnolia',
    pivoine: 'Pivoine',
    gardenia: 'Gardénia',
    freesia: 'Freesia',
    violette: 'Violette',
    cannelle: 'Cannelle',
    muscade: 'Muscade',
    cardamome: 'Cardamome',
    clou_girofle: 'Clou de girofle',
    safran: 'Safran',
    gingembre: 'Gingembre',
    sauge_sclaree: 'Sauge sclarée',
    romarin: 'Romarin',
    thym: 'Thym',
    the_vert: 'Thé Vert',
    cyclamen: 'Cyclamen',
  },

  // NOTES DE FOND (Sillage & Profondeur) - Volatilité faible
  fond: {
    bois_santal: 'Bois de Santal',
    cedre_atlas: 'Cèdre de l\'Atlas',
    cedre_virginie: 'Cèdre de Virginie',
    patchouli: 'Patchouli',
    vetiver_haiti: 'Vétiver de Haïti',
    oud: 'Oud (Bois d\'Agar)',
    musc_blanc: 'Musc blanc',
    ambre_gris: 'Ambre gris',
    ambre_jaune: 'Ambre jaune',
    vanille_bourbon: 'Vanille Bourbon',
    gousse_vanille: 'Gousse de Vanille',
    feve_tonka: 'Fève Tonka',
    benjoin: 'Benjoin',
    mousse_chene: 'Mousse de chêne',
    cuir: 'Cuir',
    daim: 'Daim (Suede)',
    tabac_blond: 'Tabac blond',
    encens: 'Encens',
    myrrhe: 'Myrrhe',
    caramel: 'Caramel',
    chocolat_noir: 'Chocolat noir',
    cafe: 'Café',
    praline: 'Praliné',
    miel: 'Miel',
    ciste_labdanum: 'Ciste Labdanum',
    castorium_synthetique: 'Castoréum (synthétique)',
    civette_synthetique: 'Civette (synthétique)',
  },
} as const;

// Types pour les clés du dictionnaire
export type TeteNote = keyof typeof OLFACTORY_DICTIONARY.tete;
export type CoeurNote = keyof typeof OLFACTORY_DICTIONARY.coeur;
export type FondNote = keyof typeof OLFACTORY_DICTIONARY.fond;

// Familles olfactives
export type OlfactoryFamily = 
  | 'Floral'
  | 'Boisé'
  | 'Gourmand'
  | 'Oriental'
  | 'Épicé'
  | 'Cuiré'
  | 'Frais/Aquatique';

/**
 * ALGORITHME DE CLASSIFICATION AUTOMATIQUE
 * Analyse les notes pour déterminer la famille olfactive
 * Priorité : Fond > Cœur > Tête
 */
export const classifyPerfume = (
  notes_tete: TeteNote[] = [],
  notes_coeur: CoeurNote[] = [],
  notes_fond: FondNote[] = []
): OlfactoryFamily[] => {
  const families: Set<OlfactoryFamily> = new Set();

  // Combiner toutes les notes avec priorité Fond > Cœur > Tête
  const allNotes = [...notes_fond, ...notes_coeur, ...notes_tete];

  // Floral : Rose, Jasmin, Iris, Tubéreuse, Pivoine, Magnolia
  if (allNotes.some(n =>
    ['rose_mai', 'rose_damascena', 'jasmin_sambac', 'jasmin_espagne', 'iris_toscane', 
     'tuberose', 'pivoine', 'magnolia', 'freesia'].includes(n as string)
  )) {
    families.add('Floral');
  }

  // Boisé : Santal, Cèdre, Vétiver, Oud, Patchouli, Mousse de chêne
  if (allNotes.some(n =>
    ['bois_santal', 'cedre_atlas', 'cedre_virginie', 'vetiver_haiti', 'oud', 
     'patchouli', 'mousse_chene'].includes(n as string)
  )) {
    families.add('Boisé');
  }

  // Gourmand : Vanille, Caramel, Chocolat, Praliné, Miel, Fève Tonka
  if (allNotes.some(n =>
    ['vanille_bourbon', 'gousse_vanille', 'feve_tonka', 'caramel', 'chocolat_noir', 
     'praline', 'miel'].includes(n as string)
  )) {
    families.add('Gourmand');
  }

  // Oriental/Ambré : Ambre, Encens, Myrrhe, Benjoin, Oud
  if (allNotes.some(n =>
    ['ambre_gris', 'ambre_jaune', 'encens', 'myrrhe', 'benjoin', 'oud'].includes(n as string)
  )) {
    families.add('Oriental');
  }

  // Épicé : Poivre, Cannelle, Cardamome, Safran, Clou de girofle, Muscade
  if (allNotes.some(n =>
    ['poivre_rose', 'cannelle', 'cardamome', 'safran', 'clou_girofle', 'muscade'].includes(n as string)
  )) {
    families.add('Épicé');
  }

  // Cuiré : Cuir, Daim, Tabac
  if (allNotes.some(n =>
    ['cuir', 'daim', 'tabac_blond'].includes(n as string)
  )) {
    families.add('Cuiré');
  }

  // Frais/Aquatique : Accord marin, Calone, Menthe, Aldéhydes
  if (allNotes.some(n =>
    ['accord_marin', 'calone', 'menthe_poivree', 'aldehydes', 'pomme_verte'].includes(n as string)
  )) {
    families.add('Frais/Aquatique');
  }

  // Si aucune famille détectée, retourner "Floral" par défaut
  return families.size > 0 ? Array.from(families) : ['Floral'];
};

/**
 * Utilitaires pour récupérer les libellés
 */
export const getNoteLabel = (
  noteKey: string,
  pyramid: 'tete' | 'coeur' | 'fond'
): string => {
  const dict = OLFACTORY_DICTIONARY[pyramid] as Record<string, string>;
  return dict[noteKey] || noteKey;
};

export const getAllNotesFlat = () => {
  return {
    tete: Object.entries(OLFACTORY_DICTIONARY.tete).map(([key, label]) => ({ key, label })),
    coeur: Object.entries(OLFACTORY_DICTIONARY.coeur).map(([key, label]) => ({ key, label })),
    fond: Object.entries(OLFACTORY_DICTIONARY.fond).map(([key, label]) => ({ key, label })),
  };
};

// Get note IDs (keys) as arrays for iteration
export const getTeteNoteIds = (): TeteNote[] =>
  Object.keys(OLFACTORY_DICTIONARY.tete) as TeteNote[];

export const getCoeurNoteIds = (): CoeurNote[] =>
  Object.keys(OLFACTORY_DICTIONARY.coeur) as CoeurNote[];

export const getFondNoteIds = (): FondNote[] =>
  Object.keys(OLFACTORY_DICTIONARY.fond) as FondNote[];

