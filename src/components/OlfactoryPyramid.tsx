import React, { useState } from 'react';
import type { TeteNote, CoeurNote, FondNote, OlfactoryFamily } from '@/lib/olfactory';

interface OlfactoryPyramidProps {
  notes_tete?: TeteNote[];
  notes_coeur?: CoeurNote[];
  notes_fond?: FondNote[];
  families?: OlfactoryFamily[];
  compact?: boolean;
}

// Helper to get readable label from note ID
const getNoteLabel = (noteId: string): string => {
  return noteId
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const OlfactoryPyramid: React.FC<OlfactoryPyramidProps> = ({
  notes_tete = [],
  notes_coeur = [],
  notes_fond = [],
  families = [],
  compact = false,
}) => {
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);

  if (notes_tete.length === 0 && notes_coeur.length === 0 && notes_fond.length === 0) {
    return null;
  }

  const levels = [
    { name: 'Tête', notes: notes_tete, y: 0, color: 'from-amber-300 to-amber-200' },
    { name: 'Cœur', notes: notes_coeur, y: 1, color: 'from-amber-400 to-amber-300' },
    { name: 'Fond', notes: notes_fond, y: 2, color: 'from-amber-500 to-amber-400' },
  ];

  return (
    <div className={`w-full ${compact ? 'py-2' : 'py-8'}`}>
      {/* Titre & Familles */}
      {!compact && (
        <div className="mb-6">
          <h3 className="text-xl font-montserrat font-light tracking-wide text-amber-500 mb-3 flex items-center gap-2">
            🌸 Pyramide Olfactive
          </h3>
          {families.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {families.map((family) => (
                <div
                  key={family}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-sm"
                >
                  {family}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Compact Mode - Family badges at top */}
      {compact && families.length > 0 && (
        <div className="mb-2 pb-2 border-b border-amber-500/10">
          <div className="flex flex-wrap gap-1">
            {families.map((family) => (
              <div
                key={family}
                className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-600"
              >
                {family}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pyramide SVG & Contenu */}
      <div className={`relative ${compact ? 'space-y-1' : 'space-y-4'}`}>
        {levels.map((level, index) => (
          <div key={level.name} className="relative">
            {/* Ligne séparatrice or fine */}
            {index > 0 && (
              <div className={`absolute -top-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent ${compact ? '' : ''}`} />
            )}

            {/* Header du niveau */}
            <div className={`flex items-center gap-2 ${compact ? 'mb-1' : 'mb-3'}`}>
              <div className={`h-1 ${compact ? 'w-4' : 'w-12'} bg-gradient-to-r ${level.color} rounded-full`} />
              <span className={`font-montserrat font-light tracking-widest uppercase ${compact ? 'text-xs' : 'text-xs'} text-amber-600/70`}>
                {level.name}
              </span>
              {!compact && (
                <span className="text-xs text-amber-500/50 font-montserrat">
                  ({level.notes.length})
                </span>
              )}
            </div>

            {/* Grille des notes */}
            <div className={`grid ${compact ? 'grid-cols-3 gap-1' : 'grid-cols-3 lg:grid-cols-4 gap-3'}`}>
              {level.notes.length > 0 ? (
                level.notes.map((note) => (
                  <div
                    key={note}
                    onMouseEnter={() => !compact && setHoveredNote(note)}
                    onMouseLeave={() => setHoveredNote(null)}
                    className={`
                      relative p-1 rounded text-center
                      transition-all duration-300 cursor-pointer
                      group
                      ${compact ? 'min-h-fit' : 'p-2 rounded-lg min-h-12'}
                      ${
                        hoveredNote === note
                          ? 'bg-gradient-to-br from-amber-400/30 to-amber-500/20 border border-amber-400/50 shadow-lg scale-105'
                          : 'bg-gradient-to-br from-amber-500/5 to-amber-500/10 border border-amber-500/20 hover:border-amber-400/40'
                      }
                    `}
                  >
                    {/* Glow effect on hover */}
                    {hoveredNote === note && !compact && (
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-amber-300/20 to-amber-400/10 blur-md -z-0 animate-pulse" />
                    )}

                    {/* Note text */}
                    <span
                      className={`
                        font-montserrat font-light tracking-wide leading-tight
                        transition-all duration-300 block relative z-10
                        ${compact ? 'text-xs' : 'text-xs'}
                        ${
                          hoveredNote === note
                            ? 'text-amber-400 font-semibold'
                            : 'text-amber-700/80'
                        }
                      `}
                    >
                      {getNoteLabel(note)}
                    </span>

                    {/* Hover indicator */}
                    {hoveredNote === note && !compact && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-300 rounded-full animate-pulse" />
                    )}
                  </div>
                ))
              ) : (
                <div className={`${compact ? 'col-span-3' : 'col-span-3 lg:col-span-4'} text-center py-1`}>
                  <span className={`text-amber-500/40 font-montserrat font-light italic ${compact ? 'text-xs' : 'text-xs'}`}>
                    Aucune
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer - Durée de vie */}
      {!compact && (
        <div className="mt-6 pt-4 border-t border-amber-500/20">
          <p className="text-xs text-amber-600/60 font-montserrat font-light tracking-wide">
            💫 Diffusion : Tête (0-15 min) → Cœur (15 min - 4h) → Fond (4h+)
          </p>
        </div>
      )}
    </div>
  );
};

export default OlfactoryPyramid;
