import { getDb } from "../client";
import {
  presetComboConfigs,
  connections,
  NewPresetComboConfig,
  PresetComboConfig,
} from "../schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Récupère toutes les configs de connexions pour un preset donné
 */
export async function getPresetComboConfigs(presetId: string) {
  const db = await getDb();
  return await db
    .select({
      config: presetComboConfigs,
      combo: connections,
    })
    .from(presetComboConfigs)
    .leftJoin(connections, eq(presetComboConfigs.comboId, connections.id))
    .where(eq(presetComboConfigs.presetId, presetId));
}

/**
 * Récupère une config de combo spécifique pour un preset
 */
export async function getPresetComboConfig(presetId: string, comboId: string) {
  const db = await getDb();
  const result = await db
    .select()
    .from(presetComboConfigs)
    .where(
      and(
        eq(presetComboConfigs.presetId, presetId),
        eq(presetComboConfigs.comboId, comboId)
      )
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Crée ou met à jour une config de combo pour un preset
 */
export async function upsertPresetComboConfig(
  presetId: string,
  comboId: string,
  data: { multiplier: number; isActive: boolean }
) {
  const db = await getDb();
  const existing = await getPresetComboConfig(presetId, comboId);

  if (existing) {
    return await db
      .update(presetComboConfigs)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(presetComboConfigs.id, existing.id))
      .returning();
  } else {
    return await db
      .insert(presetComboConfigs)
      .values({
        id: nanoid(),
        presetId,
        comboId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  }
}

/**
 * Met à jour une config de combo existante
 */
export async function updatePresetComboConfig(
  configId: string,
  data: Partial<Pick<PresetComboConfig, "multiplier" | "isActive">>
) {
  const db = await getDb();
  return await db
    .update(presetComboConfigs)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(presetComboConfigs.id, configId))
    .returning();
}

/**
 * Supprime toutes les configs de combos d'un preset
 */
export async function deletePresetComboConfigs(presetId: string) {
  const db = await getDb();
  return await db
    .delete(presetComboConfigs)
    .where(eq(presetComboConfigs.presetId, presetId));
}

/**
 * Initialise les configs de connexions pour un preset (copie des valeurs par défaut)
 */
export async function initializePresetComboConfigs(presetId: string) {
  const db = await getDb();
  const allConnections = await db.select().from(connections);

  for (const connection of allConnections) {
    await upsertPresetComboConfig(presetId, connection.id, {
      multiplier: connection.baseMultiplier,
      isActive: connection.isActive,
    });
  }

  return getPresetComboConfigs(presetId);
}
