import { getDb } from "../client";
import { presetJokerAvailability, jokers } from "../schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Récupère toutes les disponibilités de jokers pour un preset donné
 */
export async function getPresetJokerAvailabilities(presetId: string) {
  const db = await getDb();
  return await db
    .select({
      availability: presetJokerAvailability,
      joker: jokers,
    })
    .from(presetJokerAvailability)
    .leftJoin(jokers, eq(presetJokerAvailability.jokerId, jokers.id))
    .where(eq(presetJokerAvailability.presetId, presetId));
}

/**
 * Récupère les jokers disponibles pour un niveau spécifique dans un preset
 */
export async function getAvailableJokersForLevel(
  presetId: string,
  levelId: string
) {
  const allAvailabilities = await getPresetJokerAvailabilities(presetId);

  // Filtre les jokers disponibles pour ce niveau
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
 * Ajoute ou met à jour la disponibilité d'un joker dans un preset
 */
export async function upsertPresetJokerAvailability(
  presetId: string,
  jokerId: string,
  availableFrom: string,
  availableUntil: string | null = null
) {
  const db = await getDb();
  const existing = await db
    .select()
    .from(presetJokerAvailability)
    .where(
      and(
        eq(presetJokerAvailability.presetId, presetId),
        eq(presetJokerAvailability.jokerId, jokerId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return await db
      .update(presetJokerAvailability)
      .set({
        availableFrom,
        availableUntil,
        updatedAt: new Date(),
      })
      .where(eq(presetJokerAvailability.id, existing[0].id))
      .returning();
  } else {
    return await db
      .insert(presetJokerAvailability)
      .values({
        id: nanoid(),
        presetId,
        jokerId,
        availableFrom,
        availableUntil,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  }
}

/**
 * Supprime la disponibilité d'un joker d'un preset
 */
export async function deletePresetJokerAvailability(
  presetId: string,
  jokerId: string
) {
  const db = await getDb();
  return await db
    .delete(presetJokerAvailability)
    .where(
      and(
        eq(presetJokerAvailability.presetId, presetId),
        eq(presetJokerAvailability.jokerId, jokerId)
      )
    );
}

/**
 * Supprime toutes les disponibilités de jokers d'un preset
 */
export async function deleteAllPresetJokerAvailabilities(presetId: string) {
  const db = await getDb();
  return await db
    .delete(presetJokerAvailability)
    .where(eq(presetJokerAvailability.presetId, presetId));
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
