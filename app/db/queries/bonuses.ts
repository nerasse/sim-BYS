import { getDb } from "../client";
import { bonuses } from "../schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

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

export async function createBonus(data: {
  name: string;
  description: string;
  type: "starting" | "game";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  effects: Array<{ type: string; value: number; scalingPerLevel: number; maxLevel: number; target?: string }>;
  isPassif: boolean;
}) {
  const db = await getDb();
  const [bonus] = await db
    .insert(bonuses)
    .values({
      id: nanoid(),
      name: data.name,
      description: data.description,
      type: data.type,
      rarity: data.rarity,
      effects: data.effects,
      isPassif: data.isPassif,
    })
    .returning();
  return bonus;
}

export async function updateBonus(
  id: string,
  data: {
    name?: string;
    description?: string;
    type?: "starting" | "game";
    rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
    effects?: Array<{ type: string; value: number; scalingPerLevel: number; maxLevel: number; target?: string }>;
    isPassif?: boolean;
  }
) {
  const db = await getDb();
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.description) updateData.description = data.description;
  if (data.type) updateData.type = data.type;
  if (data.rarity) updateData.rarity = data.rarity;
  if (data.effects) updateData.effects = data.effects;
  if (data.isPassif !== undefined) updateData.isPassif = data.isPassif;
  
  const [bonus] = await db
    .update(bonuses)
    .set(updateData)
    .where(eq(bonuses.id, id))
    .returning();
  return bonus;
}

export async function deleteBonus(id: string) {
  const db = await getDb();
  await db.delete(bonuses).where(eq(bonuses.id, id));
}

