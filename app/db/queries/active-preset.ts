import { getDb } from "../client";
import { activePreset, presets } from "../schema";
import { eq } from "drizzle-orm";

/**
 * Récupère le preset actuellement actif (celui qu'on édite)
 */
export async function getActivePreset() {
  const db = await getDb();
  const result = await db
    .select({
      activePreset,
      preset: presets,
    })
    .from(activePreset)
    .leftJoin(presets, eq(activePreset.presetId, presets.id))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return {
    ...result[0].activePreset,
    preset: result[0].preset,
  };
}

/**
 * Définit quel preset est actif
 */
export async function setActivePreset(presetId: string) {
  const db = await getDb();
  // Vérifie si le preset existe
  const preset = await db.query.presets.findFirst({
    where: eq(presets.id, presetId),
  });

  if (!preset) {
    throw new Error(`Preset with id ${presetId} not found`);
  }

  // Upsert : met à jour ou insère
  const existing = await db.query.activePreset.findFirst();

  if (existing) {
    await db
      .update(activePreset)
      .set({
        presetId,
        updatedAt: new Date(),
      })
      .where(eq(activePreset.id, 1));
  } else {
    await db.insert(activePreset).values({
      id: 1,
      presetId,
      updatedAt: new Date(),
    });
  }

  return getActivePreset();
}

/**
 * Récupère l'ID du preset actif (helper rapide)
 */
export async function getActivePresetId(): Promise<string | null> {
  const active = await getActivePreset();
  return active?.presetId ?? null;
}

