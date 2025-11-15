import type { Grid5x3, DetectedCombo, Position } from "../types";
import type { Connection } from "~/db/schema";
import {
  createAvailabilityGrid,
  arePositionsAvailable,
  markPositionsAsUsed,
} from "./deduplication";
import { GRID_ROWS, GRID_COLS } from "~/lib/utils/constants";

/**
 * Detect all connections in a grid
 * Uses deduplication algorithm: once symbols are used in a connection, they can't be reused
 * Now uses patterns stored in database instead of hard-coded generation
 */
export function detectConnections(
  grid: Grid5x3,
  connectionsConfig: Connection[],
  symbolValues: Record<string, number>,
  connectionMultipliers: Record<string, number>
): DetectedCombo[] {
  const detectedConnections: DetectedCombo[] = [];

  // Check for jackpot first (special case)
  const jackpot = detectJackpot(grid, connectionsConfig, symbolValues, connectionMultipliers);
  if (jackpot.length > 0) {
    // Jackpot includes ALL connections + bonus
    return jackpot;
  }

  // Create availability grid
  const availability = createAvailabilityGrid();

  // Sort connections by detection order
  const sortedConnections = [...connectionsConfig]
    .filter((c) => c.isActive)
    .sort((a, b) => a.detectionOrder - b.detectionOrder);

  // Detect each connection type in order
  for (const connection of sortedConnections) {
    const matches = detectConnectionPattern(
      grid,
      connection,
      availability,
      symbolValues,
      connectionMultipliers
    );

    detectedConnections.push(...matches);
  }

  return detectedConnections;
}

/**
 * Detect jackpot (entire grid is same symbol)
 */
function detectJackpot(
  grid: Grid5x3,
  connectionsConfig: Connection[],
  symbolValues: Record<string, number>,
  connectionMultipliers: Record<string, number>
): DetectedCombo[] {
  // Get first symbol
  const firstSymbol = grid[0][0];

  // Check if all cells are same
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (grid[row][col] !== firstSymbol) {
        return []; // Not a jackpot
      }
    }
  }

  // It's a jackpot! Return all connections + jackpot bonus
  const allConnections: DetectedCombo[] = [];

  // Find jackpot connection config
  const jackpotConnection = connectionsConfig.find((c) => c.id === "JACKPOT");

  if (jackpotConnection) {
    const positions: Position[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        positions.push([row, col]);
      }
    }

    const symbolValue = symbolValues[firstSymbol] || 1;
    const baseMultiplier = connectionMultipliers[jackpotConnection.id] || jackpotConnection.baseMultiplier;
    const tokensGained = Math.floor(symbolValue * baseMultiplier);

    allConnections.push({
      comboType: jackpotConnection.id,
      comboName: jackpotConnection.displayName,
      symbolId: firstSymbol,
      positions,
      baseMultiplier: jackpotConnection.baseMultiplier,
      finalMultiplier: baseMultiplier,
      tokensGained,
    });
  }

  return allConnections;
}

/**
 * Detect a specific connection pattern in grid
 */
function detectConnectionPattern(
  grid: Grid5x3,
  connection: Connection,
  availability: boolean[][],
  symbolValues: Record<string, number>,
  connectionMultipliers: Record<string, number>
): DetectedCombo[] {
  const matches: DetectedCombo[] = [];

  // Get pattern from connection config (stored as Position[][])
  const patterns = getPatternsFromConnection(connection);

  for (const pattern of patterns) {
    // Check if this pattern matches
    const match = checkPattern(grid, pattern, availability);

    if (match) {
      const { symbolId, positions } = match;
      const symbolValue = symbolValues[symbolId] || 1;
      const baseMultiplier = connectionMultipliers[connection.id] || connection.baseMultiplier;
      const tokensGained = Math.floor(symbolValue * baseMultiplier);

      matches.push({
        comboType: connection.id,
        comboName: connection.displayName,
        symbolId,
        positions,
        baseMultiplier: connection.baseMultiplier,
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
 * Get patterns from connection configuration
 * Handles both new format (Position[][]) and legacy format for backward compatibility
 */
function getPatternsFromConnection(connection: Connection): Position[][] {
  const patterns: Position[][] = [];

  // New format: pattern is already a Position[][]
  if (connection.pattern && Array.isArray(connection.pattern)) {
    // Check if it's the new format (array of Position arrays)
    if (connection.pattern.length > 0 && Array.isArray(connection.pattern[0])) {
      // New format: use as-is
      return connection.pattern as Position[][];
    }
    // Legacy format: single pattern array
    else if (connection.pattern.length > 0) {
      patterns.push(connection.pattern as Position[]);
    }
  }

  // Special handling for JACKPOT (full grid)
  if (connection.id === "JACKPOT") {
    const fullGridPattern: Position[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        fullGridPattern.push([row, col]);
      }
    }
    patterns.push(fullGridPattern);
  }

  return patterns;
}

/**
 * Check if a pattern matches in grid
 */
function checkPattern(
  grid: Grid5x3,
  positions: Position[],
  availability: boolean[][]
): { symbolId: string; positions: Position[] } | null {
  // Check if all positions are valid
  for (const [row, col] of positions) {
    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) {
      return null;
    }
  }

  // Check if all positions are available
  if (!arePositionsAvailable(availability, positions)) {
    return null;
  }

  // Check if all positions have same symbol (or wild)
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
 * Check if grid has any winning connection
 */
export function hasWinningConnection(
  grid: Grid5x3,
  connectionsConfig: Connection[],
  symbolValues: Record<string, number>,
  connectionMultipliers: Record<string, number>
): boolean {
  const connections = detectConnections(grid, connectionsConfig, symbolValues, connectionMultipliers);
  return connections.length > 0;
}
