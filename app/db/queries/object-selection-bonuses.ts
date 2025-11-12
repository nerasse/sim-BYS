import { getDb } from "../client";
import { objectSelectionBonuses, bonuses } from "../schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Get all bonus availabilities for an object selection preset
 */
export async function getObjectSelectionBonuses(objectSelectionPresetId: string) {
  const db = await getDb();
  const results = await db
    .select({
      availability: objectSelectionBonuses,
      bonus: bonuses,
    })
    .from(objectSelectionBonuses)
    .leftJoin(bonuses, eq(objectSelectionBonuses.bonusId, bonuses.id))
    .where(eq(objectSelectionBonuses.objectSelectionPresetId, objectSelectionPresetId));

  return results;
}

/**
 * Get available bonuses for a specific level
 */
export async function getAvailableBonusesForLevel(
  objectSelectionPresetId: string,
  levelId: string
) {
  const db = await getDb();
  const availabilities = await getObjectSelectionBonuses(objectSelectionPresetId);

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
 * Add or update a bonus availability
 */
export async function upsertObjectSelectionBonus(
  objectSelectionPresetId: string,
  bonusId: string,
  availableFrom: string,
  availableUntil: string | null = null
) {
  const db = await getDb();

  // Check if already exists
  const existing = await db
    .select()
    .from(objectSelectionBonuses)
    .where(
      and(
        eq(objectSelectionBonuses.objectSelectionPresetId, objectSelectionPresetId),
        eq(objectSelectionBonuses.bonusId, bonusId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update
    await db
      .update(objectSelectionBonuses)
      .set({
        availableFrom,
        availableUntil,
        updatedAt: new Date(),
      })
      .where(eq(objectSelectionBonuses.id, existing[0].id));

    return existing[0].id;
  } else {
    // Insert
    const id = nanoid();
    await db.insert(objectSelectionBonuses).values({
      id,
      objectSelectionPresetId,
      bonusId,
      availableFrom,
      availableUntil,
    });

    return id;
  }
}

/**
 * Delete a bonus availability
 */
export async function deleteObjectSelectionBonus(
  objectSelectionPresetId: string,
  bonusId: string
) {
  const db = await getDb();

  await db
    .delete(objectSelectionBonuses)
    .where(
      and(
        eq(objectSelectionBonuses.objectSelectionPresetId, objectSelectionPresetId),
        eq(objectSelectionBonuses.bonusId, bonusId)
      )
    );
}

/**
 * Delete all bonus availabilities for an object selection preset
 */
export async function deleteAllObjectSelectionBonuses(objectSelectionPresetId: string) {
  const db = await getDb();

  await db
    .delete(objectSelectionBonuses)
    .where(eq(objectSelectionBonuses.objectSelectionPresetId, objectSelectionPresetId));
}

/**
 * Copy all bonus availabilities from one object selection preset to another
 */
export async function copyObjectSelectionBonuses(sourceId: string, targetId: string) {
  const db = await getDb();
  const sourceAvailabilities = await getObjectSelectionBonuses(sourceId);

  for (const { availability } of sourceAvailabilities) {
    if (availability) {
      await db.insert(objectSelectionBonuses).values({
        id: nanoid(),
        objectSelectionPresetId: targetId,
        bonusId: availability.bonusId,
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

