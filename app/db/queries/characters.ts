import { getDb } from "../client";
import { characters } from "../schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function getAllCharacters() {
  const db = await getDb();
  return db.select().from(characters);
}

export async function getUnlockedCharacters() {
  const db = await getDb();
  return db.select().from(characters).where(eq(characters.isUnlocked, true));
}

export async function getCharacterById(id: string) {
  const db = await getDb();
  const result = await db.select().from(characters).where(eq(characters.id, id));
  return result[0];
}

export async function createCharacter(data: {
  name: string;
  description: string;
  passiveEffect: { type: string; value: number };
  startingBonus: string;
  baseStats: { chance?: number; multiplier?: number };
  scalingPerLevel: { chance?: number; multiplier?: number };
  unlockCondition?: string;
}) {
  const db = await getDb();
  const [character] = await db
    .insert(characters)
    .values({
      id: nanoid(),
      name: data.name,
      description: data.description,
      passiveEffect: data.passiveEffect,
      startingBonus: data.startingBonus,
      baseStats: data.baseStats,
      scalingPerLevel: data.scalingPerLevel,
      unlockCondition: data.unlockCondition || null,
      isUnlocked: false,
    })
    .returning();
  return character;
}

export async function updateCharacter(
  id: string,
  data: {
    name?: string;
    description?: string;
    passiveEffect?: { type: string; value: number };
    startingBonus?: string;
    baseStats?: { chance?: number; multiplier?: number };
    scalingPerLevel?: { chance?: number; multiplier?: number };
    unlockCondition?: string;
  }
) {
  const db = await getDb();
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.description) updateData.description = data.description;
  if (data.passiveEffect) updateData.passiveEffect = data.passiveEffect;
  if (data.startingBonus) updateData.startingBonus = data.startingBonus;
  if (data.baseStats) updateData.baseStats = data.baseStats;
  if (data.scalingPerLevel) updateData.scalingPerLevel = data.scalingPerLevel;
  if (data.unlockCondition !== undefined) updateData.unlockCondition = data.unlockCondition || null;
  
  const [character] = await db
    .update(characters)
    .set(updateData)
    .where(eq(characters.id, id))
    .returning();
  return character;
}

export async function deleteCharacter(id: string) {
  const db = await getDb();
  await db.delete(characters).where(eq(characters.id, id));
}

