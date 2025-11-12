import { eq } from "drizzle-orm";
import { getDb } from "../client";
import { levelConfigs, type LevelConfig } from "../schema";
import { nanoid } from "nanoid";

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
 * Create level config
 */
export async function createLevelConfig(data: {
  world: number;
  stage: number;
  baseObjective: number;
  dollarReward: number;
  isBoss?: boolean;
}) {
  const db = await getDb();
  const levelId = `${data.world}-${data.stage}`;
  
  const [config] = await db
    .insert(levelConfigs)
    .values({
      id: nanoid(),
      levelId,
      world: data.world,
      stage: data.stage,
      baseObjective: data.baseObjective,
      dollarReward: data.dollarReward,
      isBoss: data.isBoss || false,
    })
    .returning();
  return config;
}

/**
 * Update level config
 */
export async function updateLevelConfig(
  id: string,
  data: {
    world?: number;
    stage?: number;
    baseObjective?: number;
    dollarReward?: number;
    isBoss?: boolean;
  }
): Promise<LevelConfig> {
  const db = await getDb();
  
  const updates: any = {};
  if (data.baseObjective !== undefined) updates.baseObjective = data.baseObjective;
  if (data.dollarReward !== undefined) updates.dollarReward = data.dollarReward;
  if (data.isBoss !== undefined) updates.isBoss = data.isBoss;
  
  if (data.world !== undefined || data.stage !== undefined) {
    // Get existing config to compute new levelId
    const [existing] = await db.select().from(levelConfigs).where(eq(levelConfigs.id, id));
    const world = data.world !== undefined ? data.world : existing.world;
    const stage = data.stage !== undefined ? data.stage : existing.stage;
    updates.levelId = `${world}-${stage}`;
    if (data.world !== undefined) updates.world = data.world;
    if (data.stage !== undefined) updates.stage = data.stage;
  }
  
  const [updated] = await db
    .update(levelConfigs)
    .set(updates)
    .where(eq(levelConfigs.id, id))
    .returning();
  
  return updated;
}

/**
 * Delete level config
 */
export async function deleteLevelConfig(id: string) {
  const db = await getDb();
  await db.delete(levelConfigs).where(eq(levelConfigs.id, id));
}

