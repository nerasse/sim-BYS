import { getDb } from "../client";
import { symbols } from "../schema";
import { eq } from "drizzle-orm";

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

