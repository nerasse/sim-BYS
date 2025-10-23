import type { Grid5x3 } from "../types";
import { weightedRandom, randomChance } from "~/lib/utils/probability";
import { GRID_ROWS, GRID_COLS, JACKPOT_CHANCE } from "~/lib/utils/constants";

/**
 * Generate a 5x3 grid of symbols based on weights and chance
 * @param symbolWeights Record of symbol ID to weight
 * @param chance Global chance modifier (0-100)
 * @returns 3x5 grid of symbol IDs
 */
export function generateGrid(
  symbolWeights: Record<string, number>,
  chance: number = 0
): Grid5x3 {
  // Special case: 100% chance = guaranteed jackpot
  if (chance >= JACKPOT_CHANCE) {
    return generateJackpotGrid(symbolWeights);
  }

  const grid: Grid5x3 = [];

  // Generate each row
  for (let row = 0; row < GRID_ROWS; row++) {
    const gridRow: string[] = [];

    for (let col = 0; col < GRID_COLS; col++) {
      // Apply chance boost: higher chance increases likelihood of matching symbols
      const boostedWeights = applyChanceBoost(symbolWeights, chance, grid);
      const symbol = weightedRandom(boostedWeights);
      gridRow.push(symbol);
    }

    grid.push(gridRow);
  }

  return grid;
}

/**
 * Generate a jackpot grid (all cells same symbol)
 */
function generateJackpotGrid(symbolWeights: Record<string, number>): Grid5x3 {
  // Pick a random symbol (weighted)
  const symbol = weightedRandom(symbolWeights);

  // Fill entire grid with that symbol
  return Array(GRID_ROWS)
    .fill(null)
    .map(() => Array(GRID_COLS).fill(symbol));
}

/**
 * Apply chance boost to increase combo likelihood
 * Higher chance = higher probability of recent symbols appearing again
 */
function applyChanceBoost(
  baseWeights: Record<string, number>,
  chance: number,
  currentGrid: Grid5x3
): Record<string, number> {
  if (chance === 0 || currentGrid.length === 0) {
    return baseWeights;
  }

  // Extract symbols already in grid
  const existingSymbols = currentGrid.flat();
  const symbolCounts: Record<string, number> = {};

  for (const symbol of existingSymbols) {
    symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
  }

  // Boost weights of symbols already present
  const boostedWeights = { ...baseWeights };
  const chanceBoost = chance / 100; // 0-1 range

  for (const symbol of Object.keys(symbolCounts)) {
    if (boostedWeights[symbol] !== undefined) {
      // Increase weight proportional to chance and how many times symbol appears
      const boost = 1 + chanceBoost * symbolCounts[symbol] * 0.5;
      boostedWeights[symbol] *= boost;
    }
  }

  return boostedWeights;
}

/**
 * Replace symbols with wilds in grid
 * @param grid Original grid
 * @param wildCount Number of symbols to replace with wild
 * @param wildSymbol Symbol ID to use as wild (default "W")
 * @returns Grid with wilds
 */
export function applyWildSymbols(
  grid: Grid5x3,
  wildCount: number,
  wildSymbol: string = "W"
): Grid5x3 {
  if (wildCount === 0) {
    return grid;
  }

  const newGrid = grid.map((row) => [...row]);
  const positions: [number, number][] = [];

  // Get all positions
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      positions.push([row, col]);
    }
  }

  // Shuffle and pick random positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Replace with wilds
  for (let i = 0; i < Math.min(wildCount, positions.length); i++) {
    const [row, col] = positions[i];
    newGrid[row][col] = wildSymbol;
  }

  return newGrid;
}

