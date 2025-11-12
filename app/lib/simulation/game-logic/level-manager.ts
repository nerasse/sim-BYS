import type { LevelId, LevelInfo, LevelRewards } from "../types";
import {
  getNextLevel,
  isBossLevel,
  parseLevelId,
  DEFAULT_SPINS_PER_LEVEL,
} from "~/lib/utils/constants";
import { presetConfigCache } from "~/lib/utils/config-cache";

/**
 * Get level information
 */
export async function getLevelInfo(presetId: string, levelId: LevelId, ascension: number): Promise<LevelInfo> {
  const { world, stage } = parseLevelId(levelId);
  const objective = await presetConfigCache.getLevelObjective(presetId, levelId, ascension);
  const reward = await presetConfigCache.getLevelReward(presetId, levelId);
  const boss = await presetConfigCache.isBossLevel(presetId, levelId);

  return {
    id: levelId,
    world,
    stage,
    isBoss: boss,
    tokensObjective: objective,
    spinsAllowed: DEFAULT_SPINS_PER_LEVEL,
    dollarsReward: reward,
  };
}

/**
 * Get next level ID
 */
export function getNextLevelId(currentLevel: LevelId): LevelId {
  return getNextLevel(currentLevel);
}

/**
 * Check if level is boss level
 */
export function isLevelBoss(levelId: LevelId): boolean {
  return isBossLevel(levelId);
}

/**
 * Calculate level rewards (dollars, XP, bonus choice)
 */
export async function calculateLevelRewards(
  presetId: string,
  levelId: LevelId,
  currentDollars: number,
  ascension: number
): Promise<LevelRewards> {
  const levelInfo = await getLevelInfo(presetId, levelId, ascension);
  const baseDollars = levelInfo.dollarsReward;

  // Calculate interest
  const interest = Math.floor(currentDollars / 5);
  const cappedInterest = Math.min(interest, 10);

  const totalDollars = baseDollars + cappedInterest;

  // XP scales with level
  const baseXP = 50;
  const xpScaling = 1.1;
  const xp = Math.floor(baseXP * Math.pow(xpScaling, levelInfo.world - 1));

  // Bonus choice on boss levels
  const bonusChoice = levelInfo.isBoss;

  return {
    dollars: totalDollars,
    xp,
    bonusChoice,
  };
}

/**
 * Check if player has reached end level
 */
export function hasReachedEndLevel(
  currentLevel: LevelId,
  endLevel: LevelId
): boolean {
  const current = parseLevelId(currentLevel);
  const end = parseLevelId(endLevel);

  if (current.world > end.world) return true;
  if (current.world === end.world && current.stage >= end.stage) return true;

  return false;
}

/**
 * Check if level objective is met
 */
export async function isLevelObjectiveMet(
  presetId: string,
  tokens: number,
  levelId: LevelId,
  ascension: number
): Promise<boolean> {
  const objective = await presetConfigCache.getLevelObjective(presetId, levelId, ascension);
  return tokens >= objective;
}

/**
 * Consume tokens for boss level
 */
export async function consumeBossTokens(
  presetId: string,
  tokens: number,
  levelId: LevelId,
  ascension: number
): Promise<number> {
  if (!isBossLevel(levelId)) {
    return tokens;
  }

  const objective = await presetConfigCache.getLevelObjective(presetId, levelId, ascension);
  return Math.max(0, tokens - objective);
}

