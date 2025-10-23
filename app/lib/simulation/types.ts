import type { Symbol, Combination, Bonus, Joker, Character } from "~/db/schema";

// ========== GRID & POSITIONS ==========

export type Position = [row: number, col: number];
export type Grid5x3 = string[][]; // 3 rows x 5 columns of symbol IDs

// ========== LEVEL MANAGEMENT ==========

export type LevelId = string; // Format: "X-Y" (e.g., "1-1", "2-3")

export interface LevelInfo {
  id: LevelId;
  world: number;
  stage: number;
  isBoss: boolean;
  tokensObjective: number;
  spinsAllowed: number;
  dollarsReward: number;
}

// ========== GAME STATE ==========

export interface EquippedBonus {
  bonus: Bonus;
  currentLevel: number;
}

export interface GameState {
  // Progression
  ascension: number;
  currentLevel: LevelId;
  currentSpin: number;
  totalSpins: number;

  // Resources
  tokens: number;
  dollars: number;

  // Player progression
  playerLevel: number;
  playerXP: number;

  // Equipped items
  equippedBonuses: EquippedBonus[];
  equippedJokers: Joker[];

  // Bonus mode
  bonusActive: boolean;
  bonusSpinsRemaining: number;
  wildSymbolsCount: number;

  // Dynamic modifiers
  chance: number;
  symbolWeights: Record<string, number>;
  symbolValues: Record<string, number>;
  symbolMultipliers: Record<string, number>;
  comboMultipliers: Record<string, number>;

  // Temporary/session modifiers
  extraSpinsThisLevel: number;
  permanentMultiplierBonus: number;
}

// ========== SPIN RESULTS ==========

export interface DetectedCombo {
  comboType: string; // Combo ID
  comboName: string;
  symbolId: string;
  positions: Position[];
  baseMultiplier: number;
  finalMultiplier: number;
  tokensGained: number;
}

export interface SpinResult {
  grid: Grid5x3;
  combosDetected: DetectedCombo[];
  tokensGained: number;
  bonusTriggered: boolean;
  isWinning: boolean;
}

// ========== SIMULATION CONFIG ==========

export interface SimulationConfig {
  // Character & starting items
  character: Character;
  startingBonus: Bonus;

  // Game configuration
  symbolsConfig: Symbol[];
  combosConfig: Combination[];

  // Ascension & difficulty
  ascension: number;
  startLevel: LevelId;
  endLevel: LevelId;
  startingDollars: number;

  // Simulation mode
  mode: "auto" | "manual";
  iterations: number; // For batch simulations
}

// ========== SHOP ==========

export interface ShopItem {
  id: string;
  type: "joker" | "consumable";
  joker?: Joker;
  price: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

export interface ShopInventory {
  items: ShopItem[];
  rerollCost: number;
  rerollCount: number;
  freeRerollsRemaining: number;
}

// ========== DECISIONS (for manual mode) ==========

export type Decision =
  | {
      type: "shop";
      inventory: ShopInventory;
      dollars: number;
    }
  | {
      type: "bonus_choice";
      options: [Bonus, Bonus, Bonus];
      currentBonuses: EquippedBonus[];
      canReroll: boolean;
    }
  | {
      type: "symbol_choice";
      availableSymbols: Symbol[];
      reason: string;
    };

export type Action =
  | { type: "shop_buy"; itemId: string }
  | { type: "shop_reroll" }
  | { type: "shop_skip" }
  | { type: "bonus_select"; bonusId: string; replaceIndex?: number }
  | { type: "bonus_skip" }
  | { type: "bonus_reroll" }
  | { type: "symbol_select"; symbolId: string };

// ========== SIMULATION STEPS ==========

export interface SimulationStep {
  stepIndex: number;
  stepType: "spin" | "shop" | "bonus_choice" | "levelup" | "level_end";
  level: LevelId;

  // State before action
  stateBefore: {
    tokens: number;
    dollars: number;
    playerLevel: number;
    playerXP: number;
  };

  // Action data
  spinResult?: SpinResult;
  shopAction?: {
    itemPurchased?: ShopItem;
    rerolled?: boolean;
    skipped?: boolean;
  };
  bonusAction?: {
    bonusChosen?: Bonus;
    bonusReplaced?: number;
    skipped?: boolean;
  };
  levelUpReward?: {
    newLevel: number;
    bonusOffered?: boolean;
  };

  // State after action
  stateAfter: {
    tokens: number;
    dollars: number;
    playerLevel: number;
    playerXP: number;
  };

  timestamp: Date;
}

// ========== SIMULATION RESULT ==========

export interface SimulationStats {
  totalSpins: number;
  winningSpins: number;
  totalCombos: number;
  comboFrequency: Record<string, number>;
  symbolFrequency: Record<string, number>;
  averageTokensPerSpin: number;
  maxTokensInSingleSpin: number;
  levelsCompleted: number;
  jokersPurchased: number;
  bonusesAcquired: number;
}

export interface SimulationResult {
  success: boolean;
  completedFully: boolean; // Reached endLevel
  finalLevel: LevelId;
  finalTokens: number;
  finalDollars: number;
  finalPlayerLevel: number;

  history: SimulationStep[];
  stats: SimulationStats;

  duration: number; // milliseconds
}

// For batch simulations
export interface BatchSimulationResult {
  iterations: number;
  successRate: number;
  results: SimulationResult[];

  aggregateStats: {
    avgFinalLevel: string;
    avgFinalTokens: number;
    avgFinalDollars: number;
    avgPlayerLevel: number;
    minTokens: number;
    maxTokens: number;
    stdDevTokens: number;
  };
}

// ========== REWARDS ==========

export interface LevelRewards {
  dollars: number;
  xp: number;
  bonusChoice?: boolean;
}

export interface Rewards {
  dollars: number;
  xp: number;
  bonuses?: Bonus[];
  jokers?: Joker[];
}

