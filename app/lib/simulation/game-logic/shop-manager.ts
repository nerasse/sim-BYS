import type { ShopInventory, ShopItem } from "../types";
import type { Joker } from "~/db/schema";
import {
  weightedRandom,
  randomSample,
  normalizeWeights,
} from "~/lib/utils/probability";
import {
  SHOP_SLOTS,
  SHOP_BASE_REROLL_COST,
  SHOP_REROLL_MULTIPLIER,
} from "~/lib/utils/constants";
import { presetConfigCache } from "~/lib/utils/config-cache";

type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

/**
 * Generate shop inventory based on level, ascension, and chance
 */
export async function generateShopInventory(
  presetId: string,
  availableJokers: Joker[],
  playerLevel: number,
  ascension: number,
  chance: number,
  freeRerolls: number = 0
): Promise<ShopInventory> {
  const items: ShopItem[] = [];
  const rarityWeights = await getRarityDistribution(presetId, playerLevel, ascension, chance);

  // Generate items for each shop slot
  for (let i = 0; i < SHOP_SLOTS; i++) {
    const rarity = weightedRandom(rarityWeights) as Rarity;
    const joker = selectJokerByRarity(availableJokers, rarity);

    if (joker) {
      const price = calculateJokerPrice(joker, ascension);
      items.push({
        id: `${joker.id}-${i}`,
        type: "joker",
        joker,
        price,
        rarity: joker.rarity as Rarity,
      });
    }
  }

  return {
    items,
    rerollCost: SHOP_BASE_REROLL_COST,
    rerollCount: 0,
    freeRerollsRemaining: freeRerolls,
  };
}

/**
 * Get rarity distribution based on level, ascension, and chance
 */
export async function getRarityDistribution(
  presetId: string,
  playerLevel: number,
  ascension: number,
  chance: number
): Promise<Record<Rarity, number>> {
  // Get base weights for player level from config cache
  const world = Math.min(Math.ceil(playerLevel / 3), 7);
  const baseWeights = await presetConfigCache.getShopRarityWeights(presetId, world);

  // Apply ascension shift (less common, more rare)
  const ascensionWeights = applyAscensionRarityShift(baseWeights, ascension);

  // Apply chance boost (slightly increase higher rarities)
  const chanceBoost = chance / 100; // 0-0.9 range
  const boostedWeights = { ...ascensionWeights };

  boostedWeights.rare = (boostedWeights.rare || 0) * (1 + chanceBoost * 0.5);
  boostedWeights.epic = (boostedWeights.epic || 0) * (1 + chanceBoost * 0.7);
  boostedWeights.legendary = (boostedWeights.legendary || 0) * (1 + chanceBoost * 1.0);

  // Normalize to ensure sum = 100
  return normalizeWeights(boostedWeights) as Record<Rarity, number>;
}

/**
 * Apply ascension rarity shift
 * Less commons, more rares/epics/legendaries
 */
function applyAscensionRarityShift(
  baseWeights: Record<string, number>,
  ascension: number
): Record<string, number> {
  if (ascension === 0) {
    return baseWeights;
  }

  const weights = { ...baseWeights };

  // Per ascension level:
  // - Common: -3%
  // - Uncommon: +1%
  // - Rare: +1.5%
  // - Epic: +0.4%
  // - Legendary: +0.1%

  weights.common = Math.max(5, (weights.common || 0) - ascension * 3);
  weights.uncommon = (weights.uncommon || 0) + ascension * 1;
  weights.rare = (weights.rare || 0) + ascension * 1.5;
  weights.epic = (weights.epic || 0) + ascension * 0.4;
  weights.legendary = (weights.legendary || 0) + ascension * 0.1;

  return weights;
}

/**
 * Select a random joker of given rarity
 */
function selectJokerByRarity(
  availableJokers: Joker[],
  rarity: Rarity
): Joker | null {
  const jokersOfRarity = availableJokers.filter((j) => j.rarity === rarity);

  if (jokersOfRarity.length === 0) {
    // Fallback to any joker
    return randomSample(availableJokers, 1)[0] || null;
  }

  return randomSample(jokersOfRarity, 1)[0];
}

/**
 * Calculate joker price with ascension modifier
 */
function calculateJokerPrice(joker: Joker, ascension: number): number {
  const basePrice = joker.basePrice;
  const ascensionTier = Math.floor(ascension / 5);
  const priceMultiplier = 1 + ascensionTier * 0.1; // +10% every 5 ascensions

  return Math.ceil(basePrice * priceMultiplier);
}

/**
 * Reroll shop inventory
 */
export async function rerollShop(
  presetId: string,
  currentInventory: ShopInventory,
  availableJokers: Joker[],
  playerLevel: number,
  ascension: number,
  chance: number
): Promise<ShopInventory> {
  const newRerollCount = currentInventory.rerollCount + 1;
  const newRerollCost =
    SHOP_BASE_REROLL_COST * Math.pow(SHOP_REROLL_MULTIPLIER, newRerollCount);

  const newInventory = await generateShopInventory(
    presetId,
    availableJokers,
    playerLevel,
    ascension,
    chance,
    currentInventory.freeRerollsRemaining
  );

  return {
    ...newInventory,
    rerollCost: newRerollCost,
    rerollCount: newRerollCount,
    freeRerollsRemaining: currentInventory.freeRerollsRemaining,
  };
}

/**
 * Purchase a joker from shop
 */
export function purchaseJoker(
  item: ShopItem,
  currentDollars: number,
  allowDebt: boolean = false
): { success: boolean; newDollars: number; joker?: Joker } {
  if (!allowDebt && currentDollars < item.price) {
    return { success: false, newDollars: currentDollars };
  }

  const newDollars = currentDollars - item.price;

  return {
    success: true,
    newDollars,
    joker: item.joker,
  };
}

/**
 * Use free reroll if available
 */
export async function useFreeReroll(
  presetId: string,
  inventory: ShopInventory,
  availableJokers: Joker[],
  playerLevel: number,
  ascension: number,
  chance: number
): Promise<ShopInventory | null> {
  if (inventory.freeRerollsRemaining <= 0) {
    return null;
  }

  const newInventory = await generateShopInventory(
    presetId,
    availableJokers,
    playerLevel,
    ascension,
    chance,
    inventory.freeRerollsRemaining - 1
  );

  return {
    ...newInventory,
    rerollCost: inventory.rerollCost,
    rerollCount: inventory.rerollCount,
  };
}

