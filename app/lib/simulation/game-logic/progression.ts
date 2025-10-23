import { calculateXPRequirement, addXP as addXPUtil } from "../core/calculator";

/**
 * Add XP and check for level up
 */
export function addXP(
  currentXP: number,
  currentLevel: number,
  xpGained: number
): {
  newXP: number;
  newLevel: number;
  leveledUp: boolean;
  levelsGained: number;
} {
  return addXPUtil(currentXP, currentLevel, xpGained);
}

/**
 * Get XP requirement for next level
 */
export function getXPRequirement(currentLevel: number): number {
  return calculateXPRequirement(currentLevel);
}

/**
 * Get XP progress percentage
 */
export function getXPProgress(currentXP: number, currentLevel: number): number {
  const required = getXPRequirement(currentLevel);
  return Math.min(100, (currentXP / required) * 100);
}

/**
 * Calculate total XP earned
 */
export function calculateTotalXP(level: number, currentXP: number): number {
  let total = currentXP;

  for (let i = 1; i < level; i++) {
    total += calculateXPRequirement(i);
  }

  return total;
}

