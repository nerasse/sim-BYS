import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { mkdir } from "fs/promises";
import { dirname } from "path";

const dbPath = process.env.DATABASE_URL || "./data/game.db";

// Ensure data directory exists
async function ensureDbDir() {
  try {
    await mkdir(dirname(dbPath), { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

// Create database connection
let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    await ensureDbDir();
    const sqlite = new Database(dbPath);
    sqlite.pragma("foreign_keys = ON");
    sqlite.pragma("journal_mode = WAL");
    _db = drizzle(sqlite, { schema });
  }
  return _db;
}

export { schema };

