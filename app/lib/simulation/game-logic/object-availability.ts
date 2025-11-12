import type { Bonus, Joker } from "~/db/schema";

type AvailabilityConfig = {
  bonusId: string;
  availableFrom: string;
  availableUntil?: string | null;
};

type JokerAvailabilityConfig = {
  jokerId: string;
  availableFrom: string;
  availableUntil?: string | null;
};

/**
 * Compare two level IDs (format: "X-Y")
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
function compareLevelIds(a: string, b: string): number {
  const [worldA, stageA] = a.split("-").map(Number);
  const [worldB, stageB] = b.split("-").map(Number);

  if (worldA !== worldB) {
    return worldA - worldB;
  }
  return stageA - stageB;
}

/**
 * Check if a level is within availability range
 */
function isLevelInRange(
  levelId: string,
  availableFrom: string,
  availableUntil?: string | null
): boolean {
  const isAfterStart = compareLevelIds(levelId, availableFrom) >= 0;
  const isBeforeEnd =
    !availableUntil || compareLevelIds(levelId, availableUntil) <= 0;

  return isAfterStart && isBeforeEnd;
}

/**
 * Filter bonuses available for a specific level
 */
export function getAvailableBonusesForLevel(
  allBonuses: Bonus[],
  availabilityConfigs: AvailabilityConfig[],
  levelId: string
): Bonus[] {
  // Get bonus IDs that are available at this level
  const availableBonusIds = new Set(
    availabilityConfigs
      .filter((config) =>
        isLevelInRange(
          levelId,
          config.availableFrom,
          config.availableUntil
        )
      )
      .map((config) => config.bonusId)
  );

  // Filter bonuses by available IDs
  return allBonuses.filter((bonus) => availableBonusIds.has(bonus.id));
}

/**
 * Filter jokers available for a specific level
 */
export function getAvailableJokersForLevel(
  allJokers: Joker[],
  availabilityConfigs: JokerAvailabilityConfig[],
  levelId: string
): Joker[] {
  // Get joker IDs that are available at this level
  const availableJokerIds = new Set(
    availabilityConfigs
      .filter((config) =>
        isLevelInRange(
          levelId,
          config.availableFrom,
          config.availableUntil
        )
      )
      .map((config) => config.jokerId)
  );

  // Filter jokers by available IDs
  return allJokers.filter((joker) => availableJokerIds.has(joker.id));
}

/**
 * Check if a specific bonus is available at a level
 */
export function isBonusAvailableAtLevel(
  bonusId: string,
  availabilityConfigs: AvailabilityConfig[],
  levelId: string
): boolean {
  return availabilityConfigs.some(
    (config) =>
      config.bonusId === bonusId &&
      isLevelInRange(levelId, config.availableFrom, config.availableUntil)
  );
}

/**
 * Check if a specific joker is available at a level
 */
export function isJokerAvailableAtLevel(
  jokerId: string,
  availabilityConfigs: JokerAvailabilityConfig[],
  levelId: string
): boolean {
  return availabilityConfigs.some(
    (config) =>
      config.jokerId === jokerId &&
      isLevelInRange(levelId, config.availableFrom, config.availableUntil)
  );
}

/**
 * Get the earliest level where a bonus becomes available
 */
export function getBonusAvailableFrom(
  bonusId: string,
  availabilityConfigs: AvailabilityConfig[]
): string | null {
  const config = availabilityConfigs.find((c) => c.bonusId === bonusId);
  return config?.availableFrom || null;
}

/**
 * Get the latest level where a bonus is available
 */
export function getBonusAvailableUntil(
  bonusId: string,
  availabilityConfigs: AvailabilityConfig[]
): string | null {
  const config = availabilityConfigs.find((c) => c.bonusId === bonusId);
  return config?.availableUntil || null;
}

