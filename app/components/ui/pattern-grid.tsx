import React, { useState, useCallback, useMemo } from "react";
import { cn } from "~/lib/utils";

// Types pour le composant PatternGrid
export type Position = [row: number, col: number];

interface PatternGridProps {
  /** Mode d'affichage : édition ou lecture seule */
  readonly?: boolean;
  /** Positions actives du pattern (format [row, col]) */
  value?: Position[];
  /** Callback appelé lors du changement de pattern */
  onChange?: (positions: Position[]) => void;
  /** Affichage compact (optimisé) ou grille complète */
  compact?: boolean;
  /** Classes CSS supplémentaires */
  className?: string;
}

export const PatternGrid: React.FC<PatternGridProps> = ({
  readonly = false,
  value = [],
  onChange,
  compact = false,
  className
}) => {
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null);

  // Dimensions fixes de la grille de jeu
  const GRID_ROWS = 3;
  const GRID_COLS = 5;

  // Convertir les positions en Set pour une recherche efficace
  const activePositionsSet = useMemo(() => {
    return new Set(value.map(([row, col]) => `${row},${col}`));
  }, [value]);

  // Déterminer les bornes de la zone active pour l'affichage compact
  const bounds = useMemo(() => {
    if (value.length === 0) {
      return { minRow: 0, maxRow: GRID_ROWS - 1, minCol: 0, maxCol: GRID_COLS - 1, gridSize: 1 };
    }

    let minRow = GRID_ROWS - 1;
    let maxRow = 0;
    let minCol = GRID_COLS - 1;
    let maxCol = 0;

    value.forEach(([row, col]) => {
      minRow = Math.min(minRow, row);
      maxRow = Math.max(maxRow, row);
      minCol = Math.min(minCol, col);
      maxCol = Math.max(maxCol, col);
    });

    // Ajouter une marge de 1 autour
    minRow = Math.max(0, minRow - 1);
    maxRow = Math.min(GRID_ROWS - 1, maxRow + 1);
    minCol = Math.max(0, minCol - 1);
    maxCol = Math.min(GRID_COLS - 1, maxCol + 1);

    return { minRow, maxRow, minCol, maxCol };
  }, [value]);

  // Gérer le clic sur une cellule
  const handleCellClick = useCallback((row: number, col: number) => {
    if (readonly) return;

    const posKey = `${row},${col}`;
    const isActive = activePositionsSet.has(posKey);
    
    let newPositions: Position[];
    if (isActive) {
      // Retirer la position
      newPositions = value.filter(([r, c]) => `${r},${c}` !== posKey);
    } else {
      // Ajouter la position
      newPositions = [...value, [row, col]].sort((a, b) => {
        // Tri par ligne puis par colonne
        if (a[0] !== b[0]) return a[0] - b[0];
        return a[1] - b[1];
      });
    }

    onChange?.(newPositions);
  }, [readonly, activePositionsSet, value, onChange]);

  // Afficher les lignes et colonnes selon le mode
  const rowsToDisplay = compact 
    ? Array.from({ length: bounds.maxRow - bounds.minRow + 1 }, (_, i) => bounds.minRow + i)
    : Array.from({ length: GRID_ROWS }, (_, i) => i);

  const colsToDisplay = compact 
    ? Array.from({ length: bounds.maxCol - bounds.minCol + 1 }, (_, i) => bounds.minCol + i)
    : Array.from({ length: GRID_COLS }, (_, i) => i);

  // Obtenir la couleur d'une cellule
  const getCellVariant = useCallback((row: number, col: number) => {
    const posKey = `${row},${col}`;
    const isActive = activePositionsSet.has(posKey);
    const isHovered = hoveredCell && hoveredCell[0] === row && hoveredCell[1] === col;

    if (isActive && isHovered) {
      return readonly ? "active" : "active-hover";
    } else if (isActive) {
      return "active";
    } else if (isHovered && !readonly) {
      return "hover";
    }
    return "inactive";
  }, [activePositionsSet, hoveredCell, readonly]);

  return (
    <div className={cn("inline-block", className)}>
      <div className="border-2 border-border rounded-lg p-2 bg-background">
        <div className="grid gap-0" style={{ 
          gridTemplateColumns: `repeat(${compact ? colsToDisplay.length : 5}, ${compact ? '3rem' : '3rem'})`,
          gridTemplateRows: `repeat(${compact ? rowsToDisplay.length : 3}, ${compact ? '3rem' : '3rem'})`,
          // Adapter la taille du conteneur en mode compact
          width: compact ? 'auto' : 'auto',
          maxWidth: compact ? `${colsToDisplay.length * 3.125}rem` : 'auto' // 3rem + 0.125rem de gap entre les bordures
        }}>
          {rowsToDisplay.map((row) => (
            colsToDisplay.map((col) => {
              const variant = getCellVariant(row, col);
              const isRealGridPosition = row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS;

              return (
                <div
                  key={`${row}-${col}`}
                  className={cn(
                    "border-2 rounded cursor-pointer transition-all duration-200 flex items-center justify-center",
                    {
                      "bg-primary border-primary-foreground": variant === "active",
                      "bg-primary/80 border-primary-foreground": variant === "active-hover",
                      "bg-muted border-border": variant === "inactive",
                      "bg-muted/80 border-muted-foreground": variant === "hover",
                      "cursor-not-allowed opacity-50": !readonly && !isRealGridPosition,
                      "cursor-default": readonly || !isRealGridPosition,
                    }
                  )}
                  style={{
                    // Dimensions fixes pour toutes les cases (vraiment carrées)
                    width: "3rem",
                    height: "3rem",
                    // Ajuster la taille selon le nombre de positions
                    transform: `scale(${bounds.gridSize || 1})`,
                    transformOrigin: 'center'
                  }}
                  onClick={() => isRealGridPosition && handleCellClick(row, col)}
                  onMouseEnter={() => setHoveredCell([row, col])}
                  onMouseLeave={() => setHoveredCell(null)}
                  title={isRealGridPosition ? `Position [${row}, ${col}]` : 'Position hors grille'}
                >
                  {isRealGridPosition && (
                    <span className={cn(
                      "text-xs font-mono font-bold",
                      {
                        "text-primary-foreground": variant === "active" || variant === "active-hover",
                        "text-muted-foreground": variant === "inactive",
                        "text-foreground": variant === "hover",
                      }
                    )}>
                      {variant === "active" || variant === "active-hover" ? "●" : "○"}
                    </span>
                  )}
                </div>
              );
            })
          ))}
        </div>
        
        {/* Indicateurs de coordonnées en mode compact */}
        {compact && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            {bounds.minRow !== 0 || bounds.maxRow !== GRID_ROWS - 1 || 
             bounds.minCol !== 0 || bounds.maxCol !== GRID_COLS - 1 ? (
              <span>
                Zone: L{bounds.minRow}-{bounds.maxRow}, C{bounds.minCol}-{bounds.maxCol}
              </span>
            ) : (
              <span>Grille complète 5×3</span>
            )}
          </div>
        )}
      </div>
      
      {/* Affichage du format de sortie pour débogage */}
      {process.env.NODE_ENV === 'development' && value.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground font-mono bg-muted p-1 rounded">
          JSON: {JSON.stringify(value)}
        </div>
      )}
    </div>
  );
};

// Presets de patterns courants
export const CONNECTION_PRESETS = {
  HORIZONTAL_3: {
    name: "Horizontal 3",
    positions: [[0, 0], [0, 1], [0, 2]] as Position[],
  },
  HORIZONTAL_4: {
    name: "Horizontal 4",
    positions: [[0, 0], [0, 1], [0, 2], [0, 3]] as Position[],
  },
  HORIZONTAL_5: {
    name: "Horizontal 5",
    positions: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] as Position[],
  },
  VERTICAL_3: {
    name: "Vertical 3",
    positions: [[0, 0], [1, 0], [2, 0]] as Position[],
  },
  DIAGONAL_LEFT: {
    name: "Diagonale ↘",
    positions: [[0, 0], [1, 1], [2, 2]] as Position[],
  },
  DIAGONAL_RIGHT: {
    name: "Diagonale ↙",
    positions: [[0, 2], [1, 1], [2, 0]] as Position[],
  },
  L_SHAPE: {
    name: "Forme L",
    positions: [[0, 0], [1, 0], [2, 0], [2, 1]] as Position[],
  },
  T_SHAPE: {
    name: "Forme T",
    positions: [[0, 0], [0, 1], [0, 2], [1, 1]] as Position[],
  },
  CROSS: {
    name: "Croix",
    positions: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]] as Position[],
  },
} as const;

export type ConnectionPresetKey = keyof typeof CONNECTION_PRESETS;
