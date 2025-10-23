import type { Rewards } from "../types";
import type { Bonus } from "~/db/schema";
import { randomSample } from "~/lib/utils/probability";
import { getRarityDistribution } from "./shop-manager";
import { weightedRandom } from "~/lib/utils/probability";

/**
 * Generate 3 bonus choices for player
 */
export function generateBonusChoices(
  availableBonuses: Bonus[],
  playerLevel: number,
  ascension: number
): [Bonus, Bonus, Bonus] {
  // Filter game bonuses only
  const gameBonuses = availableBonuses.filter((b) => b.type === "game");

  if (gameBonuses.length < 3) {
    throw new Error("Not enough game bonuses available");
  }

  // Get rarity distribution (similar to shop, but for bonuses)
  const rarityWeights = getRarityDistribution(playerLevel, ascension, 0);

  const choices: Bonus[] = [];

  for (let i = 0; i < 3; i++) {
    const rarity = weightedRandom(
      rarityWeights
    ) as keyof typeof rarityWeights;
    const bonusesOfRarity = gameBonuses.filter((b) => b.rarity === rarity);

    let bonus: Bonus;
    if (bonusesOfRarity.length > 0) {
      bonus = randomSample(bonusesOfRarity, 1)[0];
    } else {
      // Fallback to any bonus
      bonus = randomSample(gameBonuses, 1)[0];
    }

    choices.push(bonus);
  }

  return choices as [Bonus, Bonus, Bonus];
}

/**
 * Reroll bonus choices (1 time only)
 */
export function rerollBonusChoices(
  availableBonuses: Bonus[],
  playerLevel: number,
  ascension: number
): [Bonus, Bonus, Bonus] {
  return generateBonusChoices(availableBonuses, playerLevel, ascension);
}

/**
 * Calculate end level rewards
 */
export function calculateEndLevelRewards(
  levelDollars: number,
  levelXP: number,
  bonusChoice: boolean
): Rewards {
  return {
    dollars: levelDollars,
    xp: levelXP,
    bonuses: bonusChoice ? [] : undefined,
  };
}

/**
 * Get level up rewards (at specific level milestones)
 */
export function getLevelUpRewards(level: number): Rewards {
  const bonusChoiceLevels = [10, 20, 40, 60, 80, 100];
  const bonusChoice = bonusChoiceLevels.includes(level);

  return {
    dollars: 0,
    xp: 0,
    bonuses: bonusChoice ? [] : undefined,
  };
}

