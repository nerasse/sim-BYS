import { getDb } from "../client";
import { characters } from "../schema";
import { eq } from "drizzle-orm";

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

