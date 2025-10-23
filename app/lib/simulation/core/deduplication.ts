import type { Position } from "../types";
import { GRID_ROWS, GRID_COLS } from "~/lib/utils/constants";

/**
 * Availability grid to track which positions have been used in combos
 */
export type AvailabilityGrid = boolean[][];

/**
 * Create a new availability grid (all cells available)
 */
export function createAvailabilityGrid(): AvailabilityGrid {
  return Array(GRID_ROWS)
    .fill(null)
    .map(() => Array(GRID_COLS).fill(true));
}

/**
 * Check if all positions in a combo are still available
 */
export function arePositionsAvailable(
  availability: AvailabilityGrid,
  positions: Position[]
): boolean {
  return positions.every(([row, col]) => availability[row]?.[col] === true);
}

/**
 * Mark positions as used in the availability grid
 */
export function markPositionsAsUsed(
  availability: AvailabilityGrid,
  positions: Position[]
): void {
  for (const [row, col] of positions) {
    if (availability[row]?.[col] !== undefined) {
      availability[row][col] = false;
    }
  }
}

/**
 * Check if a position is valid in the grid
 */
export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS;
}

/**
 * Get remaining available positions
 */
export function getAvailablePositions(
  availability: AvailabilityGrid
): Position[] {
  const positions: Position[] = [];

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (availability[row][col]) {
        positions.push([row, col]);
      }
    }
  }

  return positions;
}

/**
 * Count how many positions are still available
 */
export function countAvailablePositions(
  availability: AvailabilityGrid
): number {
  let count = 0;

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (availability[row][col]) {
        count++;
      }
    }
  }

  return count;
}

