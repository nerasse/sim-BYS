import { getDb } from "../client";
import { presetBonusAvailability, bonuses } from "../schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Récupère toutes les disponibilités de bonus pour un preset donné
 */
export async function getPresetBonusAvailabilities(presetId: string) {
  const db = await getDb();
  return await db
    .select({
      availability: presetBonusAvailability,
      bonus: bonuses,
    })
    .from(presetBonusAvailability)
    .leftJoin(bonuses, eq(presetBonusAvailability.bonusId, bonuses.id))
    .where(eq(presetBonusAvailability.presetId, presetId));
}

/**
 * Récupère les bonus disponibles pour un niveau spécifique dans un preset
 */
export async function getAvailableBonusesForLevel(
  presetId: string,
  levelId: string
) {
  const allAvailabilities = await getPresetBonusAvailabilities(presetId);

  // Filtre les bonus disponibles pour ce niveau
  return allAvailabilities.filter((item) => {
    const { availableFrom, availableUntil } = item.availability;

    // Compare les IDs de niveau (format "1-1", "1-2", etc.)
    const levelIsAfterFrom = compareLevelIds(levelId, availableFrom) >= 0;
    const levelIsBeforeUntil = availableUntil
      ? compareLevelIds(levelId, availableUntil) <= 0
      : true;

    return levelIsAfterFrom && levelIsBeforeUntil;
  });
}

/**
 * Ajoute ou met à jour la disponibilité d'un bonus dans un preset
 */
export async function upsertPresetBonusAvailability(
  presetId: string,
  bonusId: string,
  availableFrom: string,
  availableUntil: string | null = null
) {
  const db = await getDb();
  const existing = await db
    .select()
    .from(presetBonusAvailability)
    .where(
      and(
        eq(presetBonusAvailability.presetId, presetId),
        eq(presetBonusAvailability.bonusId, bonusId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return await db
      .update(presetBonusAvailability)
      .set({
        availableFrom,
        availableUntil,
        updatedAt: new Date(),
      })
      .where(eq(presetBonusAvailability.id, existing[0].id))
      .returning();
  } else {
    return await db
      .insert(presetBonusAvailability)
      .values({
        id: nanoid(),
        presetId,
        bonusId,
        availableFrom,
        availableUntil,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  }
}

/**
 * Supprime la disponibilité d'un bonus d'un preset
 */
export async function deletePresetBonusAvailability(
  presetId: string,
  bonusId: string
) {
  const db = await getDb();
  return await db
    .delete(presetBonusAvailability)
    .where(
      and(
        eq(presetBonusAvailability.presetId, presetId),
        eq(presetBonusAvailability.bonusId, bonusId)
      )
    );
}

/**
 * Supprime toutes les disponibilités de bonus d'un preset
 */
export async function deleteAllPresetBonusAvailabilities(presetId: string) {
  const db = await getDb();
  return await db
    .delete(presetBonusAvailability)
    .where(eq(presetBonusAvailability.presetId, presetId));
}

/**
 * Helper : Compare deux IDs de niveau (format "X-Y")
 * Retourne : -1 si a < b, 0 si a === b, 1 si a > b
 */
function compareLevelIds(a: string, b: string): number {
  const [aWorld, aStage] = a.split("-").map(Number);
  const [bWorld, bStage] = b.split("-").map(Number);

  if (aWorld !== bWorld) {
    return aWorld - bWorld;
  }

  return aStage - bStage;
}
