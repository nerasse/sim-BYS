import { getDb } from "../client";
import { presetLevelConfigs, PresetLevelConfig } from "../schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Récupère toutes les configs de niveaux pour un preset donné
 */
export async function getPresetLevelConfigs(presetId: string) {
  const db = await getDb();
  return await db
    .select()
    .from(presetLevelConfigs)
    .where(eq(presetLevelConfigs.presetId, presetId))
    .orderBy(presetLevelConfigs.world, presetLevelConfigs.stage);
}

/**
 * Récupère une config de niveau spécifique pour un preset
 */
export async function getPresetLevelConfig(presetId: string, levelId: string) {
  const db = await getDb();
  const result = await db
    .select()
    .from(presetLevelConfigs)
    .where(
      and(
        eq(presetLevelConfigs.presetId, presetId),
        eq(presetLevelConfigs.levelId, levelId)
      )
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Crée ou met à jour une config de niveau pour un preset
 */
export async function upsertPresetLevelConfig(
  presetId: string,
  levelId: string,
  data: {
    world: number;
    stage: number;
    baseObjective: number;
    dollarReward: number;
    isBoss: boolean;
  }
) {
  const db = await getDb();
  const existing = await getPresetLevelConfig(presetId, levelId);

  if (existing) {
    return await db
      .update(presetLevelConfigs)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(presetLevelConfigs.id, existing.id))
      .returning();
  } else {
    return await db
      .insert(presetLevelConfigs)
      .values({
        id: nanoid(),
        presetId,
        levelId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  }
}

/**
 * Met à jour une config de niveau existante
 */
export async function updatePresetLevelConfig(
  configId: string,
  data: Partial<
    Pick<PresetLevelConfig, "baseObjective" | "dollarReward" | "isBoss">
  >
) {
  const db = await getDb();
  return await db
    .update(presetLevelConfigs)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(presetLevelConfigs.id, configId))
    .returning();
}

/**
 * Supprime toutes les configs de niveaux d'un preset
 */
export async function deletePresetLevelConfigs(presetId: string) {
  const db = await getDb();
  return await db
    .delete(presetLevelConfigs)
    .where(eq(presetLevelConfigs.presetId, presetId));
}

/**
 * Initialise les configs de niveaux pour un preset (copie des valeurs par défaut)
 */
export async function initializePresetLevelConfigs(
  presetId: string,
  sourceLevelConfigs: Array<{
    levelId: string;
    world: number;
    stage: number;
    baseObjective: number;
    dollarReward: number;
    isBoss: boolean;
  }>
) {
  for (const level of sourceLevelConfigs) {
    await upsertPresetLevelConfig(presetId, level.levelId, {
      world: level.world,
      stage: level.stage,
      baseObjective: level.baseObjective,
      dollarReward: level.dollarReward,
      isBoss: level.isBoss,
    });
  }

  return getPresetLevelConfigs(presetId);
}
