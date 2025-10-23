import { getDb } from "../client";
import { presets } from "../schema";
import { eq, desc } from "drizzle-orm";
import type { NewPreset } from "../schema";

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

export async function createPreset(data: NewPreset) {
  const db = await getDb();
  return db.insert(presets).values(data).returning();
}

export async function updatePreset(id: string, updates: Partial<NewPreset>) {
  const db = await getDb();
  return db.update(presets).set(updates).where(eq(presets.id, id));
}

export async function deletePreset(id: string) {
  const db = await getDb();
  return db.delete(presets).where(eq(presets.id, id));
}

