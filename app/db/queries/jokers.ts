import { getDb } from "../client";
import { jokers } from "../schema";
import { eq } from "drizzle-orm";

export async function getAllJokers() {
  const db = await getDb();
  return db.select().from(jokers);
}

export async function getJokersByRarity(
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
) {
  const db = await getDb();
  return db.select().from(jokers).where(eq(jokers.rarity, rarity));
}

export async function getJokerById(id: string) {
  const db = await getDb();
  const result = await db.select().from(jokers).where(eq(jokers.id, id));
  return result[0];
}

