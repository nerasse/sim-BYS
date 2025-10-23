// ========== GAME CONSTANTS ==========

export const GRID_ROWS = 3;
export const GRID_COLS = 5;
export const GRID_TOTAL_CELLS = GRID_ROWS * GRID_COLS; // 15

export const DEFAULT_SPINS_PER_LEVEL = 5;
export const MAX_EQUIPPED_BONUSES = 3;
export const MAX_CHANCE = 90; // 100 = guaranteed jackpot
export const JACKPOT_CHANCE = 100;

// ========== LEVEL PROGRESSION ==========
// Note: Level objectives and rewards are now stored in the database
// Use configCache from config-cache.ts to access them

// ========== ASCENSION ==========

export const ASCENSION_OBJECTIVE_MULTIPLIER = 0.15; // +15% per ascension level
export const ASCENSION_PRICE_MULTIPLIER_PER_TIER = 0.1; // +10% every 5 ascensions

// ========== SHOP ==========

export const SHOP_SLOTS = 4;
export const SHOP_BASE_REROLL_COST = 2;
export const SHOP_REROLL_MULTIPLIER = 2; // Exponential cost

// Interest on dollars (like TFT/Balatro)
export const INTEREST_RATE_PER_5_DOLLARS = 1;
export const MAX_INTEREST = 10;
export const INTEREST_CAP_DOLLARS = 50;

// ========== XP & LEVELING ==========

export const XP_PER_LEVEL = 100;
export const XP_SCALING_PER_LEVEL = 1.1; // Exponential growth

export const BONUS_CHOICE_LEVELS = [10, 20, 40, 60, 80, 100]; // Levels where player gets bonus choice

// ========== BONUS LEVEL CAPS BY RARITY ==========

export const BONUS_MAX_LEVEL_BY_RARITY: Record<string, number> = {
  common: 20,
  uncommon: 30,
  rare: 40,
  epic: 50,
  legendary: 100,
};

// ========== RARITY WEIGHTS (base shop) ==========
// Note: Shop rarity weights are now stored in the database
// Use configCache from config-cache.ts to access them

// ========== HELPERS ==========

export function parseLevelId(levelId: string): { world: number; stage: number } {
  const [world, stage] = levelId.split("-").map(Number);
  return { world, stage };
}

export function isBossLevel(levelId: string): boolean {
  // For helper functions without DB access, use stage === 3 as fallback
  const { stage } = parseLevelId(levelId);
  return stage === 3;
}

// Note: For boss level checks with DB data, use configCache.isBossLevel(levelId)

export function getNextLevel(currentLevel: string): string {
  const { world, stage } = parseLevelId(currentLevel);

  if (stage === 3) {
    // Boss level, go to next world
    return `${world + 1}-1`;
  } else {
    // Regular level, next stage
    return `${world}-${stage + 1}`;
  }
}

// Note: getLevelObjective and getLevelReward are now in configCache
// Import configCache from config-cache.ts and use:
// - configCache.getLevelObjective(levelId, ascension)
// - configCache.getLevelReward(levelId)

