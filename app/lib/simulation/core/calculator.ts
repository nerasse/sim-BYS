import type { DetectedCombo, GameState } from "../types";

/**
 * Calculate total tokens gained from detected combos
 * Applies all active multipliers from game state
 */
export function calculateGains(
  combos: DetectedCombo[],
  gameState: GameState
): number {
  if (combos.length === 0) {
    return 0;
  }

  let totalTokens = 0;

  for (const combo of combos) {
    // Base gain already calculated in combo detection
    let gain = combo.tokensGained;

    // Apply permanent multiplier bonus (from some jokers/bonuses)
    gain *= 1 + gameState.permanentMultiplierBonus;

    totalTokens += Math.floor(gain);
  }

  return totalTokens;
}

/**
 * Calculate interest on dollars (like Balatro/TFT)
 * +1$ per 5$ owned, capped at +10$ (50$ owned)
 */
export function calculateInterest(dollars: number): number {
  const interestRate = 1; // $1 per 5$ owned
  const interestPer = 5;
  const maxInterest = 10;

  const interest = Math.floor(dollars / interestPer) * interestRate;
  return Math.min(interest, maxInterest);
}

/**
 * Calculate XP required for next level
 */
export function calculateXPRequirement(currentLevel: number): number {
  const baseXP = 100;
  const scaling = 1.1;
  return Math.floor(baseXP * Math.pow(scaling, currentLevel - 1));
}

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
  let xp = currentXP + xpGained;
  let level = currentLevel;
  let levelsGained = 0;

  // Check for level up (can level up multiple times)
  while (true) {
    const xpRequired = calculateXPRequirement(level);

    if (xp >= xpRequired) {
      xp -= xpRequired;
      level++;
      levelsGained++;
    } else {
      break;
    }
  }

  return {
    newXP: xp,
    newLevel: level,
    leveledUp: levelsGained > 0,
    levelsGained,
  };
}

/**
 * Calculate shop reroll cost (exponential)
 */
export function calculateRerollCost(rerollCount: number): number {
  const baseCost = 2;
  const multiplier = 2;
  return baseCost * Math.pow(multiplier, rerollCount);
}

