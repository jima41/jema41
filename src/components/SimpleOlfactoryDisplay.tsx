import React from 'react';
import type { TeteNote, CoeurNote, FondNote, OlfactoryFamily } from '@/lib/olfactory';

interface SimpleOlfactoryDisplayProps {
  notes_tete?: TeteNote[];
  notes_coeur?: CoeurNote[];
  notes_fond?: FondNote[];
  families?: OlfactoryFamily[];
}

// Valid families after removing Hespéridé and Aromatique
const VALID_FAMILIES: OlfactoryFamily[] = [
  'Floral',
  'Boisé',
  'Gourmand',
  'Oriental',
  'Épicé',
  'Cuiré',
  'Frais/Aquatique',
];

// Helper to get readable label from note ID
const getNoteLabel = (noteId: string): string => {
  return noteId
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const SimpleOlfactoryDisplay: React.FC<SimpleOlfactoryDisplayProps> = ({
  notes_tete = [],
  notes_coeur = [],
  notes_fond = [],
  families = [],
}) => {
  // Filter out invalid families
  const validFamilies = families.filter((f) => VALID_FAMILIES.includes(f));
  
  if (notes_tete.length === 0 && notes_coeur.length === 0 && notes_fond.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Familles Olfactives */}
      {validFamilies.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Famille{validFamilies.length > 1 ? 's' : ''} Olfactive{validFamilies.length > 1 ? 's' : ''}
          </h3>
          <div className="flex flex-wrap gap-2">
            {validFamilies.map((family) => (
              <span
                key={family}
                className="px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:border-foreground/40 text-foreground/70 hover:text-foreground transition-all duration-300"
              >
                {family}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes Olfactives - 3 Column Layout */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Composition Olfactive
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tête */}
          {notes_tete.length > 0 && (
            <div className="rounded-lg p-4 border border-border/40 hover:border-border/80 transition-colors">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/50" />
                Notes de Tête
              </h4>
              <ul className="space-y-2">
                {notes_tete.map((note, index) => (
                  <li
                    key={`${note}-${index}`}
                    className="text-sm text-foreground/70 flex items-start gap-2"
                  >
                    <span className="text-foreground/40 mt-1">•</span>
                    <span>{getNoteLabel(note)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/30 italic">
                Volatilité : 30 min - 1h
              </p>
            </div>
          )}

          {/* Cœur */}
          {notes_coeur.length > 0 && (
            <div className="rounded-lg p-4 border border-border/40 hover:border-border/80 transition-colors">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/50" />
                Notes de Cœur
              </h4>
              <ul className="space-y-2">
                {notes_coeur.map((note, index) => (
                  <li
                    key={`${note}-${index}`}
                    className="text-sm text-foreground/70 flex items-start gap-2"
                  >
                    <span className="text-foreground/40 mt-1">•</span>
                    <span>{getNoteLabel(note)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/30 italic">
                Signature : 1h - 4h
              </p>
            </div>
          )}

          {/* Fond */}
          {notes_fond.length > 0 && (
            <div className="rounded-lg p-4 border border-border/40 hover:border-border/80 transition-colors">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/50" />
                Notes de Fond
              </h4>
              <ul className="space-y-2">
                {notes_fond.map((note, index) => (
                  <li
                    key={`${note}-${index}`}
                    className="text-sm text-foreground/70 flex items-start gap-2"
                  >
                    <span className="text-foreground/40 mt-1">•</span>
                    <span>{getNoteLabel(note)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/30 italic">
                Sillage : 4h+
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleOlfactoryDisplay;
