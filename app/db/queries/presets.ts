import { getDb } from "../client";
import { presets, levelConfigs, shopRarityConfigs } from "../schema";
import { eq, desc } from "drizzle-orm";
import type { NewPreset } from "../schema";
import { nanoid } from "nanoid";

// Import des queries pour les configs
import { initializePresetSymbolConfigs } from "./preset-symbol-configs";
import { initializePresetComboConfigs } from "./preset-combo-configs";
import { initializePresetLevelConfigs } from "./preset-level-configs";
import { initializePresetShopRarityConfigs } from "./preset-shop-rarity-configs";

export async function getAllPresets() {
  const db = await getDb();
  return db.select().from(presets).orderBy(desc(presets.createdAt));
}

export async function getFavoritePresets() {
  const db = await getDb();
  return db
    .select()
    .from(presets)
    .where(eq(presets.isFavorite, true))
    .orderBy(desc(presets.createdAt));
}

export async function getPresetById(id: string) {
  const db = await getDb();
  const result = await db.select().from(presets).where(eq(presets.id, id));
  return result[0];
}

/**
 * Crée un preset complet avec toutes ses configurations initialisées
 */
export async function createPreset(data: {
  name: string;
  description?: string;
  tags?: string[];
  isFavorite?: boolean;
}) {
  const db = await getDb();

  // Crée le preset
  const presetId = nanoid();
  const [preset] = await db
    .insert(presets)
    .values({
      id: presetId,
      name: data.name,
      description: data.description || null,
      tags: data.tags || [],
      isFavorite: data.isFavorite || false,
      objectSelectionPresetId: null,
    })
    .returning();

  // Initialise toutes les configs avec les valeurs par défaut
  await initializePresetSymbolConfigs(presetId);
  await initializePresetComboConfigs(presetId);

  // Copie les level configs et shop rarity configs depuis les tables globales
  const allLevelConfigs = await db.select().from(levelConfigs);
  await initializePresetLevelConfigs(presetId, allLevelConfigs);

  const allShopRarityConfigs = await db.select().from(shopRarityConfigs);
  await initializePresetShopRarityConfigs(presetId, allShopRarityConfigs);

  return preset;
}

/**
 * Duplique un preset existant avec toutes ses configs
 */
export async function duplicatePreset(sourcePresetId: string, newName: string) {
  const db = await getDb();

  // Récupère le preset source
  const sourcePreset = await getPresetById(sourcePresetId);
  if (!sourcePreset) {
    throw new Error(`Preset with id ${sourcePresetId} not found`);
  }

  // Crée le nouveau preset
  const newPresetId = nanoid();
  const [newPreset] = await db
    .insert(presets)
    .values({
      id: newPresetId,
      name: newName,
      description: sourcePreset.description,
      tags: sourcePreset.tags,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Copie toutes les configs depuis le preset source
  // (À implémenter : copier les configs depuis les tables preset_*_configs)
  // Pour l'instant, on initialise avec les valeurs par défaut
  await initializePresetSymbolConfigs(newPresetId);
  await initializePresetComboConfigs(newPresetId);

  const allLevelConfigs = await db.select().from(levelConfigs);
  await initializePresetLevelConfigs(newPresetId, allLevelConfigs);

  const allShopRarityConfigs = await db.select().from(shopRarityConfigs);
  await initializePresetShopRarityConfigs(newPresetId, allShopRarityConfigs);

  return newPreset;
}

export async function updatePreset(
  id: string,
  updates: Partial<{
    name: string;
    description: string | null;
    tags: string[];
    isFavorite: boolean;
  }>
) {
  const db = await getDb();
  return db
    .update(presets)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(presets.id, id))
    .returning();
}

export async function deletePreset(id: string) {
  const db = await getDb();
  // Les cascades dans le schéma supprimeront automatiquement toutes les configs liées
  return db.delete(presets).where(eq(presets.id, id));
}
