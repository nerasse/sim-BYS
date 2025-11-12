import { getDb } from "../client";
import { combinations } from "../schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function getAllCombinations() {
  const db = await getDb();
  return db.select().from(combinations).orderBy(combinations.detectionOrder);
}

export async function getActiveCombinations() {
  const db = await getDb();
  return db
    .select()
    .from(combinations)
    .where(eq(combinations.isActive, true))
    .orderBy(combinations.detectionOrder);
}

export async function getCombinationById(id: string) {
  const db = await getDb();
  const result = await db.select().from(combinations).where(eq(combinations.id, id));
  return result[0];
}

export async function createCombination(data: {
  name: string;
  displayName: string;
  description?: string;
  pattern: number[][];
  baseMultiplier: number;
  isActive?: boolean;
}) {
  const db = await getDb();
  const allCombos = await getAllCombinations();
  const maxOrder = Math.max(0, ...allCombos.map(c => c.detectionOrder));
  
  const [combo] = await db
    .insert(combinations)
    .values({
      id: nanoid(),
      name: data.name,
      displayName: data.displayName,
      description: data.description || null,
      pattern: data.pattern,
      baseMultiplier: data.baseMultiplier,
      isActive: data.isActive ?? true,
      detectionOrder: maxOrder + 1,
    })
    .returning();
  return combo;
}

export async function updateCombination(
  id: string,
  data: {
    name?: string;
    displayName?: string;
    description?: string;
    pattern?: number[][];
    baseMultiplier?: number;
    isActive?: boolean;
  }
) {
  const db = await getDb();
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.displayName) updateData.displayName = data.displayName;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.pattern) updateData.pattern = data.pattern;
  if (data.baseMultiplier !== undefined) updateData.baseMultiplier = data.baseMultiplier;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  
  const [combo] = await db
    .update(combinations)
    .set(updateData)
    .where(eq(combinations.id, id))
    .returning();
  return combo;
}

export async function deleteCombination(id: string) {
  const db = await getDb();
  await db.delete(combinations).where(eq(combinations.id, id));
}

