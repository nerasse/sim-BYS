import type { Grid5x3, DetectedCombo, Position } from "../types";
import type { Combination } from "~/db/schema";
import {
  createAvailabilityGrid,
  arePositionsAvailable,
  markPositionsAsUsed,
  isValidPosition,
} from "./deduplication";
import { GRID_ROWS, GRID_COLS } from "~/lib/utils/constants";

/**
 * Detect all combos in a grid
 * Uses deduplication algorithm: once symbols are used in a combo, they can't be reused
 */
export function detectCombos(
  grid: Grid5x3,
  combosConfig: Combination[],
  symbolValues: Record<string, number>,
  comboMultipliers: Record<string, number>
): DetectedCombo[] {
  const detectedCombos: DetectedCombo[] = [];

  // Check for jackpot first (special case)
  const jackpot = detectJackpot(grid, combosConfig, symbolValues, comboMultipliers);
  if (jackpot.length > 0) {
    // Jackpot includes ALL combos + bonus
    return jackpot;
  }

  // Create availability grid
  const availability = createAvailabilityGrid();

  // Sort combos by detection order
  const sortedCombos = [...combosConfig]
    .filter((c) => c.isActive)
    .sort((a, b) => a.detectionOrder - b.detectionOrder);

  // Detect each combo type in order
  for (const combo of sortedCombos) {
    const matches = detectComboPattern(
      grid,
      combo,
      availability,
      symbolValues,
      comboMultipliers
    );

    detectedCombos.push(...matches);
  }

  return detectedCombos;
}

/**
 * Detect jackpot (entire grid is same symbol)
 */
function detectJackpot(
  grid: Grid5x3,
  combosConfig: Combination[],
  symbolValues: Record<string, number>,
  comboMultipliers: Record<string, number>
): DetectedCombo[] {
  // Get first symbol
  const firstSymbol = grid[0][0];

  // Check if all cells are the same
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (grid[row][col] !== firstSymbol) {
        return []; // Not a jackpot
      }
    }
  }

  // It's a jackpot! Return all combos + jackpot bonus
  const allCombos: DetectedCombo[] = [];

  // Find jackpot combo config
  const jackpotCombo = combosConfig.find((c) => c.id === "JACKPOT");

  if (jackpotCombo) {
    const positions: Position[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        positions.push([row, col]);
      }
    }

    const symbolValue = symbolValues[firstSymbol] || 1;
    const baseMultiplier = comboMultipliers[jackpotCombo.id] || jackpotCombo.baseMultiplier;
    const tokensGained = Math.floor(symbolValue * baseMultiplier);

    allCombos.push({
      comboType: jackpotCombo.id,
      comboName: jackpotCombo.displayName,
      symbolId: firstSymbol,
      positions,
      baseMultiplier: jackpotCombo.baseMultiplier,
      finalMultiplier: baseMultiplier,
      tokensGained,
    });
  }

  return allCombos;
}

/**
 * Detect a specific combo pattern in the grid
 */
function detectComboPattern(
  grid: Grid5x3,
  combo: Combination,
  availability: boolean[][],
  symbolValues: Record<string, number>,
  comboMultipliers: Record<string, number>
): DetectedCombo[] {
  const matches: DetectedCombo[] = [];

  // Get all possible pattern instances for this combo type
  const patterns = generatePatternsForCombo(combo);

  for (const pattern of patterns) {
    // Check if this pattern matches
    const match = checkPattern(grid, pattern, availability);

    if (match) {
      const { symbolId, positions } = match;
      const symbolValue = symbolValues[symbolId] || 1;
      const baseMultiplier = comboMultipliers[combo.id] || combo.baseMultiplier;
      const tokensGained = Math.floor(symbolValue * baseMultiplier);

      matches.push({
        comboType: combo.id,
        comboName: combo.displayName,
        symbolId,
        positions,
        baseMultiplier: combo.baseMultiplier,
        finalMultiplier: baseMultiplier,
        tokensGained,
      });

      // Mark positions as used
      markPositionsAsUsed(availability, positions);
    }
  }

  return matches;
}

/**
 * Check if a pattern matches in the grid
 */
function checkPattern(
  grid: Grid5x3,
  positions: Position[],
  availability: boolean[][]
): { symbolId: string; positions: Position[] } | null {
  // Check if all positions are available
  if (!arePositionsAvailable(availability, positions)) {
    return null;
  }

  // Check if all positions have the same symbol (or wild)
  const firstSymbol = grid[positions[0][0]][positions[0][1]];
  const wildSymbol = "W";

  for (const [row, col] of positions) {
    const symbol = grid[row][col];
    if (symbol !== firstSymbol && symbol !== wildSymbol && firstSymbol !== wildSymbol) {
      return null; // Not matching
    }
  }

  // Determine which symbol is the "real" one (non-wild)
  let symbolId = firstSymbol;
  if (symbolId === wildSymbol) {
    // Find first non-wild symbol
    for (const [row, col] of positions) {
      const symbol = grid[row][col];
      if (symbol !== wildSymbol) {
        symbolId = symbol;
        break;
      }
    }
  }

  return { symbolId, positions };
}

/**
 * Generate all possible pattern instances for a combo type
 */
function generatePatternsForCombo(combo: Combination): Position[][] {
  const patterns: Position[][] = [];

  // Handle specific combo types
  switch (combo.id) {
    case "H3":
      // Horizontal 3: sliding window across each row
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col <= GRID_COLS - 3; col++) {
          patterns.push([
            [row, col],
            [row, col + 1],
            [row, col + 2],
          ]);
        }
      }
      break;

    case "H4":
      // Horizontal 4
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col <= GRID_COLS - 4; col++) {
          patterns.push([
            [row, col],
            [row, col + 1],
            [row, col + 2],
            [row, col + 3],
          ]);
        }
      }
      break;

    case "H5":
      // Horizontal 5 (full row)
      for (let row = 0; row < GRID_ROWS; row++) {
        patterns.push([
          [row, 0],
          [row, 1],
          [row, 2],
          [row, 3],
          [row, 4],
        ]);
      }
      break;

    case "V3":
      // Vertical 3 (full column since we only have 3 rows)
      for (let col = 0; col < GRID_COLS; col++) {
        patterns.push([
          [0, col],
          [1, col],
          [2, col],
        ]);
      }
      break;

    case "V":
    case "V_BIS":
      // Full vertical (same as V3 in 3x5 grid)
      for (let col = 0; col < GRID_COLS; col++) {
        patterns.push([
          [0, col],
          [1, col],
          [2, col],
        ]);
      }
      break;

    case "D3":
      // Diagonal 3
      // Top-left to bottom-right
      patterns.push([
        [0, 0],
        [1, 1],
        [2, 2],
      ]);
      patterns.push([
        [0, 1],
        [1, 2],
        [2, 3],
      ]);
      patterns.push([
        [0, 2],
        [1, 3],
        [2, 4],
      ]);
      // Top-right to bottom-left
      patterns.push([
        [0, 4],
        [1, 3],
        [2, 2],
      ]);
      patterns.push([
        [0, 3],
        [1, 2],
        [2, 1],
      ]);
      patterns.push([
        [0, 2],
        [1, 1],
        [2, 0],
      ]);
      break;

    case "TRI":
      // Triangle patterns (L-shape)
      for (let row = 0; row <= GRID_ROWS - 2; row++) {
        for (let col = 0; col <= GRID_COLS - 2; col++) {
          // Bottom-left triangle
          patterns.push([
            [row, col],
            [row + 1, col],
            [row + 1, col + 1],
          ]);
          // Bottom-right triangle
          patterns.push([
            [row, col + 1],
            [row + 1, col],
            [row + 1, col + 1],
          ]);
          // Top-left triangle
          patterns.push([
            [row, col],
            [row, col + 1],
            [row + 1, col],
          ]);
          // Top-right triangle
          patterns.push([
            [row, col],
            [row, col + 1],
            [row + 1, col + 1],
          ]);
        }
      }
      break;

    case "OEIL":
      // Eye/Cross pattern (center + 4 adjacents)
      for (let row = 1; row < GRID_ROWS - 1; row++) {
        for (let col = 1; col < GRID_COLS - 1; col++) {
          patterns.push([
            [row, col], // Center
            [row - 1, col], // Top
            [row + 1, col], // Bottom
            [row, col - 1], // Left
            [row, col + 1], // Right
          ]);
        }
      }
      break;

    default:
      // Use pattern from config if available
      if (combo.pattern && combo.pattern.length > 0) {
        patterns.push(combo.pattern as Position[]);
      }
  }

  return patterns;
}

/**
 * Check if grid has any winning combo
 */
export function hasWinningCombo(
  grid: Grid5x3,
  combosConfig: Combination[],
  symbolValues: Record<string, number>,
  comboMultipliers: Record<string, number>
): boolean {
  const combos = detectCombos(grid, combosConfig, symbolValues, comboMultipliers);
  return combos.length > 0;
}

