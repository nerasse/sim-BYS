import { getAllLevelConfigs, getLevelConfig } from "~/db/queries/level-configs";
import { getAllShopRarityConfigs, getShopRarityConfigByWorld } from "~/db/queries/shop-rarity-configs";
import type { LevelConfig, ShopRarityConfig } from "~/db/schema";
import { ASCENSION_OBJECTIVE_MULTIPLIER } from "./constants";

/**
 * Cache for level configs and shop rarity configs
 * Loaded once at startup to avoid DB queries during simulation
 */
class ConfigCache {
  private levelConfigs: Map<string, LevelConfig> = new Map();
  private shopRarityConfigs: Map<number, ShopRarityConfig> = new Map();
  private initialized = false;

  /**
   * Load all configs from DB into memory cache
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load level configs
    const levels = await getAllLevelConfigs();
    for (const level of levels) {
      this.levelConfigs.set(level.levelId, level);
    }

    // Load shop rarity configs
    const rarities = await getAllShopRarityConfigs();
    for (const rarity of rarities) {
      this.shopRarityConfigs.set(rarity.world, rarity);
    }

    this.initialized = true;
    console.log(`✅ Config cache initialized: ${levels.length} levels, ${rarities.length} shop configs`);
  }

  /**
   * Get level objective (with ascension multiplier)
   */
  getLevelObjective(levelId: string, ascension: number = 0): number {
    const config = this.levelConfigs.get(levelId);
    if (!config) {
      console.warn(`⚠️  Level config not found for ${levelId}, using default`);
      return 1000;
    }

    const ascensionMultiplier = 1 + ascension * ASCENSION_OBJECTIVE_MULTIPLIER;
    return Math.floor(config.baseObjective * ascensionMultiplier);
  }

  /**
   * Get level dollar reward
   */
  getLevelReward(levelId: string): number {
    const config = this.levelConfigs.get(levelId);
    if (!config) {
      console.warn(`⚠️  Level config not found for ${levelId}, using default`);
      return 5;
    }
    return config.dollarReward;
  }

  /**
   * Check if level is a boss level
   */
  isBossLevel(levelId: string): boolean {
    const config = this.levelConfigs.get(levelId);
    return config?.isBoss ?? false;
  }

  /**
   * Get shop rarity weights for a world
   */
  getShopRarityWeights(world: number): Record<string, number> {
    // Clamp world to 1-7 range
    const clampedWorld = Math.max(1, Math.min(7, world));
    const config = this.shopRarityConfigs.get(clampedWorld);
    
    if (!config) {
      console.warn(`⚠️  Shop rarity config not found for world ${world}, using default`);
      return {
        common: 70,
        uncommon: 25,
        rare: 5,
        epic: 0,
        legendary: 0,
      };
    }

    return {
      common: config.commonWeight,
      uncommon: config.uncommonWeight,
      rare: config.rareWeight,
      epic: config.epicWeight,
      legendary: config.legendaryWeight,
    };
  }

  /**
   * Get all level configs (for UI)
   */
  getAllLevelConfigs(): LevelConfig[] {
    return Array.from(this.levelConfigs.values());
  }

  /**
   * Get all shop rarity configs (for UI)
   */
  getAllShopRarityConfigs(): ShopRarityConfig[] {
    return Array.from(this.shopRarityConfigs.values());
  }

  /**
   * Reload configs from DB (after updates)
   */
  async reload(): Promise<void> {
    this.initialized = false;
    this.levelConfigs.clear();
    this.shopRarityConfigs.clear();
    await this.initialize();
  }

  /**
   * Update a single level config in cache
   */
  async updateLevelConfig(levelId: string): Promise<void> {
    const config = await getLevelConfig(levelId);
    if (config) {
      this.levelConfigs.set(levelId, config);
    }
  }

  /**
   * Update a single shop rarity config in cache
   */
  async updateShopRarityConfig(world: number): Promise<void> {
    const config = await getShopRarityConfigByWorld(world);
    if (config) {
      this.shopRarityConfigs.set(world, config);
    }
  }
}

// Singleton instance
export const configCache = new ConfigCache();

// Auto-initialize on import (server-side only)
if (typeof window === "undefined") {
  configCache.initialize().catch(console.error);
}

