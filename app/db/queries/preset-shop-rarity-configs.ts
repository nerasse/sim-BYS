import { getDb } from "../client";
import { presetShopRarityConfigs, PresetShopRarityConfig } from "../schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Récupère toutes les configs de rarités shop pour un preset donné
 */
export async function getPresetShopRarityConfigs(presetId: string) {
  const db = await getDb();
  return await db
    .select()
    .from(presetShopRarityConfigs)
    .where(eq(presetShopRarityConfigs.presetId, presetId))
    .orderBy(presetShopRarityConfigs.world);
}

/**
 * Récupère une config de rareté shop spécifique pour un preset et un monde
 */
export async function getPresetShopRarityConfig(
  presetId: string,
  world: number
) {
  const db = await getDb();
  const result = await db
    .select()
    .from(presetShopRarityConfigs)
    .where(
      and(
        eq(presetShopRarityConfigs.presetId, presetId),
        eq(presetShopRarityConfigs.world, world)
      )
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Crée ou met à jour une config de rareté shop pour un preset
 */
export async function upsertPresetShopRarityConfig(
  presetId: string,
  world: number,
  data: {
    commonWeight: number;
    uncommonWeight: number;
    rareWeight: number;
    epicWeight: number;
    legendaryWeight: number;
  }
) {
  const db = await getDb();
  const existing = await getPresetShopRarityConfig(presetId, world);

  if (existing) {
    return await db
      .update(presetShopRarityConfigs)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(presetShopRarityConfigs.id, existing.id))
      .returning();
  } else {
    return await db
      .insert(presetShopRarityConfigs)
      .values({
        id: nanoid(),
        presetId,
        world,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  }
}

/**
 * Met à jour une config de rareté shop existante
 */
export async function updatePresetShopRarityConfig(
  configId: string,
  data: Partial<
    Pick<
      PresetShopRarityConfig,
      | "commonWeight"
      | "uncommonWeight"
      | "rareWeight"
      | "epicWeight"
      | "legendaryWeight"
    >
  >
) {
  const db = await getDb();
  return await db
    .update(presetShopRarityConfigs)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(presetShopRarityConfigs.id, configId))
    .returning();
}

/**
 * Supprime toutes les configs de rarités shop d'un preset
 */
export async function deletePresetShopRarityConfigs(presetId: string) {
  const db = await getDb();
  return await db
    .delete(presetShopRarityConfigs)
    .where(eq(presetShopRarityConfigs.presetId, presetId));
}

/**
 * Initialise les configs de rarités shop pour un preset (copie des valeurs par défaut)
 */
export async function initializePresetShopRarityConfigs(
  presetId: string,
  sourceShopRarityConfigs: Array<{
    world: number;
    commonWeight: number;
    uncommonWeight: number;
    rareWeight: number;
    epicWeight: number;
    legendaryWeight: number;
  }>
) {
  for (const config of sourceShopRarityConfigs) {
    await upsertPresetShopRarityConfig(presetId, config.world, {
      commonWeight: config.commonWeight,
      uncommonWeight: config.uncommonWeight,
      rareWeight: config.rareWeight,
      epicWeight: config.epicWeight,
      legendaryWeight: config.legendaryWeight,
    });
  }

  return getPresetShopRarityConfigs(presetId);
}
