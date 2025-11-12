import { getDb } from "../client";
import { objectSelectionPresets } from "../schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Get all object selection presets
 */
export async function getAllObjectSelectionPresets() {
  const db = await getDb();
  return db.select().from(objectSelectionPresets).orderBy(objectSelectionPresets.createdAt);
}

/**
 * Get object selection preset by ID
 */
export async function getObjectSelectionPresetById(id: string) {
  const db = await getDb();
  const result = await db
    .select()
    .from(objectSelectionPresets)
    .where(eq(objectSelectionPresets.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Create a new object selection preset
 */
export async function createObjectSelectionPreset(data: {
  name: string;
  description?: string;
  tags?: string[];
}) {
  const db = await getDb();
  const id = nanoid();

  await db.insert(objectSelectionPresets).values({
    id,
    name: data.name,
    description: data.description || null,
    tags: data.tags || [],
  });

  return getObjectSelectionPresetById(id);
}

/**
 * Update an object selection preset
 */
export async function updateObjectSelectionPreset(
  id: string,
  data: {
    name?: string;
    description?: string;
    tags?: string[];
  }
) {
  const db = await getDb();

  await db
    .update(objectSelectionPresets)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(objectSelectionPresets.id, id));

  return getObjectSelectionPresetById(id);
}

/**
 * Delete an object selection preset
 */
export async function deleteObjectSelectionPreset(id: string) {
  const db = await getDb();

  await db.delete(objectSelectionPresets).where(eq(objectSelectionPresets.id, id));
}

/**
 * Duplicate an object selection preset
 */
export async function duplicateObjectSelectionPreset(sourceId: string) {
  const db = await getDb();
  const source = await getObjectSelectionPresetById(sourceId);

  if (!source) {
    throw new Error(`Object selection preset ${sourceId} not found`);
  }

  const newId = nanoid();
  const newName = `${source.name} (copie)`;

  await db.insert(objectSelectionPresets).values({
    id: newId,
    name: newName,
    description: source.description,
    tags: source.tags,
  });

  // Also copy bonuses and jokers (will be handled by separate functions)
  return getObjectSelectionPresetById(newId);
}

