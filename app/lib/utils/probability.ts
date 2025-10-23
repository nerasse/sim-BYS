/**
 * Weighted random selection
 * @param weights Record of item ID to weight
 * @returns Selected item ID
 */
export function weightedRandom<T extends string>(
  weights: Record<T, number>
): T {
  const entries = Object.entries(weights) as [T, number][];
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);

  if (totalWeight === 0) {
    throw new Error("Total weight cannot be 0");
  }

  let random = Math.random() * totalWeight;

  for (const [id, weight] of entries) {
    random -= weight;
    if (random <= 0) {
      return id;
    }
  }

  // Fallback (should never happen)
  return entries[entries.length - 1][0];
}

/**
 * Normalize weights to sum to 100
 */
export function normalizeWeights(
  weights: Record<string, number>
): Record<string, number> {
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);

  if (total === 0) {
    return weights;
  }

  const normalized: Record<string, number> = {};
  for (const [key, value] of Object.entries(weights)) {
    normalized[key] = (value / total) * 100;
  }

  return normalized;
}

/**
 * Random chance check
 * @param probability Value between 0 and 100
 * @returns true if random roll succeeds
 */
export function randomChance(probability: number): boolean {
  return Math.random() * 100 < probability;
}

/**
 * Random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle array in place (Fisher-Yates)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Select N random items from array
 */
export function randomSample<T>(array: T[], count: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

