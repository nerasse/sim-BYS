import { eq } from "drizzle-orm";
import { getDb } from "../client";
import { shopRarityConfigs, type ShopRarityConfig } from "../schema";

/**
 * Get all shop rarity configurations
 */
export async function getAllShopRarityConfigs(): Promise<ShopRarityConfig[]> {
  const db = await getDb();
  return await db.select().from(shopRarityConfigs);
}

/**
 * Get shop rarity config by world
 */
export async function getShopRarityConfigByWorld(world: number): Promise<ShopRarityConfig | undefined> {
  const db = await getDb();
  const [config] = await db
    .select()
    .from(shopRarityConfigs)
    .where(eq(shopRarityConfigs.world, world))
    .limit(1);
  return config;
}

/**
 * Update shop rarity config
 */
export async function updateShopRarityConfig(
  world: number,
  updates: Partial<Omit<ShopRarityConfig, "id" | "world" | "createdAt" | "updatedAt">>
): Promise<ShopRarityConfig> {
  const db = await getDb();
  await db
    .update(shopRarityConfigs)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(shopRarityConfigs.world, world));
  
  const updated = await getShopRarityConfigByWorld(world);
  if (!updated) throw new Error(`Shop rarity config for world ${world} not found after update`);
  return updated;
}

