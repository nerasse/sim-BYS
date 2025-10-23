import { getDb } from "../client";
import { combinations } from "../schema";
import { eq } from "drizzle-orm";

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

