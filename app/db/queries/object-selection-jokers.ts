import { getDb } from "../client";
import { objectSelectionJokers, jokers } from "../schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Get all joker availabilities for an object selection preset
 */
export async function getObjectSelectionJokers(objectSelectionPresetId: string) {
  const db = await getDb();
  const results = await db
    .select({
      availability: objectSelectionJokers,
      joker: jokers,
    })
    .from(objectSelectionJokers)
    .leftJoin(jokers, eq(objectSelectionJokers.jokerId, jokers.id))
    .where(eq(objectSelectionJokers.objectSelectionPresetId, objectSelectionPresetId));

  return results;
}

/**
 * Get available jokers for a specific level
 */
export async function getAvailableJokersForLevel(
  objectSelectionPresetId: string,
  levelId: string
) {
  const db = await getDb();
  const availabilities = await getObjectSelectionJokers(objectSelectionPresetId);

  return availabilities.filter(({ availability }) => {
    if (!availability) return false;

    const isAfterStart = compareLevelIds(levelId, availability.availableFrom) >= 0;
    const isBeforeEnd =
      !availability.availableUntil ||
      compareLevelIds(levelId, availability.availableUntil) <= 0;

    return isAfterStart && isBeforeEnd;
  });
}

/**
 * Add or update a joker availability
 */
export async function upsertObjectSelectionJoker(
  objectSelectionPresetId: string,
  jokerId: string,
  availableFrom: string,
  availableUntil: string | null = null
) {
  const db = await getDb();

  // Check if already exists
  const existing = await db
    .select()
    .from(objectSelectionJokers)
    .where(
      and(
        eq(objectSelectionJokers.objectSelectionPresetId, objectSelectionPresetId),
        eq(objectSelectionJokers.jokerId, jokerId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update
    await db
      .update(objectSelectionJokers)
      .set({
        availableFrom,
        availableUntil,
        updatedAt: new Date(),
      })
      .where(eq(objectSelectionJokers.id, existing[0].id));

    return existing[0].id;
  } else {
    // Insert
    const id = nanoid();
    await db.insert(objectSelectionJokers).values({
      id,
      objectSelectionPresetId,
      jokerId,
      availableFrom,
      availableUntil,
    });

    return id;
  }
}

/**
 * Delete a joker availability
 */
export async function deleteObjectSelectionJoker(
  objectSelectionPresetId: string,
  jokerId: string
) {
  const db = await getDb();

  await db
    .delete(objectSelectionJokers)
    .where(
      and(
        eq(objectSelectionJokers.objectSelectionPresetId, objectSelectionPresetId),
        eq(objectSelectionJokers.jokerId, jokerId)
      )
    );
}

/**
 * Delete all joker availabilities for an object selection preset
 */
export async function deleteAllObjectSelectionJokers(objectSelectionPresetId: string) {
  const db = await getDb();

  await db
    .delete(objectSelectionJokers)
    .where(eq(objectSelectionJokers.objectSelectionPresetId, objectSelectionPresetId));
}

/**
 * Copy all joker availabilities from one object selection preset to another
 */
export async function copyObjectSelectionJokers(sourceId: string, targetId: string) {
  const db = await getDb();
  const sourceAvailabilities = await getObjectSelectionJokers(sourceId);

  for (const { availability } of sourceAvailabilities) {
    if (availability) {
      await db.insert(objectSelectionJokers).values({
        id: nanoid(),
        objectSelectionPresetId: targetId,
        jokerId: availability.jokerId,
        availableFrom: availability.availableFrom,
        availableUntil: availability.availableUntil,
      });
    }
  }
}

/**
 * Compare two level IDs (format: "X-Y")
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
function compareLevelIds(a: string, b: string): number {
  const [worldA, stageA] = a.split("-").map(Number);
  const [worldB, stageB] = b.split("-").map(Number);

  if (worldA !== worldB) {
    return worldA - worldB;
  }
  return stageA - stageB;
}

