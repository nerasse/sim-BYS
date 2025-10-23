import { eq } from "drizzle-orm";
import { getDb } from "../client";
import { levelConfigs, type LevelConfig } from "../schema";

/**
 * Get all level configurations
 */
export async function getAllLevelConfigs(): Promise<LevelConfig[]> {
  const db = await getDb();
  return await db.select().from(levelConfigs);
}

/**
 * Get level config by level ID (e.g., "1-1", "2-3")
 */
export async function getLevelConfig(levelId: string): Promise<LevelConfig | undefined> {
  const db = await getDb();
  const [config] = await db
    .select()
    .from(levelConfigs)
    .where(eq(levelConfigs.levelId, levelId))
    .limit(1);
  return config;
}

/**
 * Get all levels for a specific world
 */
export async function getLevelsByWorld(world: number): Promise<LevelConfig[]> {
  const db = await getDb();
  return await db
    .select()
    .from(levelConfigs)
    .where(eq(levelConfigs.world, world));
}

/**
 * Update level config
 */
export async function updateLevelConfig(
  levelId: string,
  updates: Partial<Omit<LevelConfig, "id" | "levelId" | "createdAt" | "updatedAt">>
): Promise<LevelConfig> {
  const db = await getDb();
  await db
    .update(levelConfigs)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(levelConfigs.levelId, levelId));
  
  const updated = await getLevelConfig(levelId);
  if (!updated) throw new Error(`Level config ${levelId} not found after update`);
  return updated;
}

