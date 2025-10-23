import { getDb } from "../client";
import {
  presetSymbolConfigs,
  symbols,
  NewPresetSymbolConfig,
  PresetSymbolConfig,
} from "../schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Récupère toutes les configs de symboles pour un preset donné
 */
export async function getPresetSymbolConfigs(presetId: string) {
  const db = await getDb();
  return await db
    .select({
      config: presetSymbolConfigs,
      symbol: symbols,
    })
    .from(presetSymbolConfigs)
    .leftJoin(symbols, eq(presetSymbolConfigs.symbolId, symbols.id))
    .where(eq(presetSymbolConfigs.presetId, presetId));
}

/**
 * Récupère une config de symbole spécifique pour un preset
 */
export async function getPresetSymbolConfig(presetId: string, symbolId: string) {
  const db = await getDb();
  const result = await db
    .select()
    .from(presetSymbolConfigs)
    .where(
      and(
        eq(presetSymbolConfigs.presetId, presetId),
        eq(presetSymbolConfigs.symbolId, symbolId)
      )
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Crée ou met à jour une config de symbole pour un preset
 */
export async function upsertPresetSymbolConfig(
  presetId: string,
  symbolId: string,
  data: { weight: number; value: number; multiplier: number }
) {
  const db = await getDb();
  const existing = await getPresetSymbolConfig(presetId, symbolId);

  if (existing) {
    return await db
      .update(presetSymbolConfigs)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(presetSymbolConfigs.id, existing.id))
      .returning();
  } else {
    return await db
      .insert(presetSymbolConfigs)
      .values({
        id: nanoid(),
        presetId,
        symbolId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  }
}

/**
 * Met à jour une config de symbole existante
 */
export async function updatePresetSymbolConfig(
  configId: string,
  data: Partial<Pick<PresetSymbolConfig, "weight" | "value" | "multiplier">>
) {
  const db = await getDb();
  return await db
    .update(presetSymbolConfigs)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(presetSymbolConfigs.id, configId))
    .returning();
}

/**
 * Supprime toutes les configs de symboles d'un preset
 */
export async function deletePresetSymbolConfigs(presetId: string) {
  const db = await getDb();
  return await db
    .delete(presetSymbolConfigs)
    .where(eq(presetSymbolConfigs.presetId, presetId));
}

/**
 * Initialise les configs de symboles pour un preset (copie des valeurs par défaut)
 */
export async function initializePresetSymbolConfigs(presetId: string) {
  const db = await getDb();
  const allSymbols = await db.select().from(symbols);

  for (const symbol of allSymbols) {
    await upsertPresetSymbolConfig(presetId, symbol.id, {
      weight: symbol.baseWeight,
      value: symbol.baseValue,
      multiplier: symbol.baseMultiplier,
    });
  }

  return getPresetSymbolConfigs(presetId);
}

