import { getDb } from "../client";
import { symbols } from "../schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function getAllSymbols() {
  const db = await getDb();
  return db.select().from(symbols);
}

export async function getSymbolById(id: string) {
  const db = await getDb();
  const result = await db.select().from(symbols).where(eq(symbols.id, id));
  return result[0];
}

export async function getSymbolsByType(type: "basic" | "premium" | "bonus") {
  const db = await getDb();
  return db.select().from(symbols).where(eq(symbols.type, type));
}

export async function createSymbol(data: {
  name: string;
  type: "basic" | "premium" | "bonus";
  baseWeight: number;
  baseValue: number;
  baseMultiplier: number;
}) {
  const db = await getDb();
  const [symbol] = await db
    .insert(symbols)
    .values({
      id: nanoid(),
      ...data,
    })
    .returning();
  return symbol;
}

export async function updateSymbol(
  id: string,
  data: {
    name?: string;
    baseWeight?: number;
    baseValue?: number;
    baseMultiplier?: number;
  }
) {
  const db = await getDb();
  const [symbol] = await db
    .update(symbols)
    .set(data)
    .where(eq(symbols.id, id))
    .returning();
  return symbol;
}

export async function deleteSymbol(id: string) {
  const db = await getDb();
  await db.delete(symbols).where(eq(symbols.id, id));
}

