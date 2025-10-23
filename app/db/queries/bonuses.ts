import { getDb } from "../client";
import { bonuses } from "../schema";
import { eq, and } from "drizzle-orm";

export async function getAllBonuses() {
  const db = await getDb();
  return db.select().from(bonuses);
}

export async function getStartingBonuses() {
  const db = await getDb();
  return db.select().from(bonuses).where(eq(bonuses.type, "starting"));
}

export async function getGameBonuses() {
  const db = await getDb();
  return db.select().from(bonuses).where(eq(bonuses.type, "game"));
}

export async function getBonusesByRarity(
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
) {
  const db = await getDb();
  return db.select().from(bonuses).where(eq(bonuses.rarity, rarity));
}

export async function getBonusById(id: string) {
  const db = await getDb();
  const result = await db.select().from(bonuses).where(eq(bonuses.id, id));
  return result[0];
}

export async function getGameBonusesByRarity(
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
) {
  const db = await getDb();
  return db
    .select()
    .from(bonuses)
    .where(and(eq(bonuses.type, "game"), eq(bonuses.rarity, rarity)));
}

