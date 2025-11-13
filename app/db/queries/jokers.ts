import { getDb } from "../client";
import { jokers } from "../schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

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

export async function createJoker(data: {
  name: string;
  description: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  basePrice: number;
  effects: Array<{ type: string; value: number; scalingPerLevel: number; maxLevel: number; target?: string }>;
  sellValue: number;
}) {
  const db = await getDb();
  const [joker] = await db
    .insert(jokers)
    .values({
      id: nanoid(),
      name: data.name,
      description: data.description,
      rarity: data.rarity,
      basePrice: data.basePrice,
      effects: data.effects,
      sellValue: data.sellValue,
    })
    .returning();
  return joker;
}

export async function updateJoker(
  id: string,
  data: {
    name?: string;
    description?: string;
    rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
    basePrice?: number;
    effects?: Array<{ type: string; value: number; scalingPerLevel: number; maxLevel: number; target?: string }>;
    sellValue?: number;
  }
) {
  const db = await getDb();
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.description) updateData.description = data.description;
  if (data.rarity) updateData.rarity = data.rarity;
  if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
  if (data.effects) updateData.effects = data.effects;
  if (data.sellValue !== undefined) updateData.sellValue = data.sellValue;
  
  const [joker] = await db
    .update(jokers)
    .set(updateData)
    .where(eq(jokers.id, id))
    .returning();
  return joker;
}

export async function deleteJoker(id: string) {
  const db = await getDb();
  await db.delete(jokers).where(eq(jokers.id, id));
}

