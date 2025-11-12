import { getPresetLevelConfigs } from "~/db/queries/preset-level-configs";
import { getPresetShopRarityConfigs } from "~/db/queries/preset-shop-rarity-configs";
import type { PresetLevelConfig, PresetShopRarityConfig } from "~/db/schema";
import { ASCENSION_OBJECTIVE_MULTIPLIER } from "./constants";

/**
 * Cache instance for a single preset
 */
class ConfigCacheInstance {
  private levelConfigs: Map<string, PresetLevelConfig> = new Map();
  private shopRarityConfigs: Map<number, PresetShopRarityConfig> = new Map();
  private presetId: string;
  private initialized = false;

  constructor(presetId: string) {
    this.presetId = presetId;
  }

  /**
   * Load all configs from DB for this preset
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load level configs for this preset
    const levels = await getPresetLevelConfigs(this.presetId);
    for (const level of levels) {
      this.levelConfigs.set(level.levelId, level);
    }

    // Load shop rarity configs for this preset
    const rarities = await getPresetShopRarityConfigs(this.presetId);
    for (const rarity of rarities) {
      this.shopRarityConfigs.set(rarity.world, rarity);
    }

    this.initialized = true;
    console.log(`✅ Config cache initialized for preset ${this.presetId}: ${levels.length} levels, ${rarities.length} shop configs`);
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
  getAllLevelConfigs(): PresetLevelConfig[] {
    return Array.from(this.levelConfigs.values());
  }

  /**
   * Get all shop rarity configs (for UI)
   */
  getAllShopRarityConfigs(): PresetShopRarityConfig[] {
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
}

  /**
 * Multi-preset config cache manager
 * Maintains a separate cache instance for each preset
 */
class PresetConfigCache {
  private caches: Map<string, ConfigCacheInstance> = new Map();

  /**
   * Get or initialize cache for a specific preset
   */
  async getOrInitialize(presetId: string): Promise<ConfigCacheInstance> {
    if (!this.caches.has(presetId)) {
      const cache = new ConfigCacheInstance(presetId);
      await cache.initialize();
      this.caches.set(presetId, cache);
    }
    return this.caches.get(presetId)!;
  }

  /**
   * Get level objective for a preset
   */
  async getLevelObjective(presetId: string, levelId: string, ascension: number = 0): Promise<number> {
    const cache = await this.getOrInitialize(presetId);
    return cache.getLevelObjective(levelId, ascension);
  }

  /**
   * Get level reward for a preset
   */
  async getLevelReward(presetId: string, levelId: string): Promise<number> {
    const cache = await this.getOrInitialize(presetId);
    return cache.getLevelReward(levelId);
  }

  /**
   * Check if level is boss for a preset
   */
  async isBossLevel(presetId: string, levelId: string): Promise<boolean> {
    const cache = await this.getOrInitialize(presetId);
    return cache.isBossLevel(levelId);
  }

  /**
   * Get shop rarity weights for a preset
   */
  async getShopRarityWeights(presetId: string, world: number): Promise<Record<string, number>> {
    const cache = await this.getOrInitialize(presetId);
    return cache.getShopRarityWeights(world);
  }

  /**
   * Reload cache for a specific preset
   */
  async reloadPreset(presetId: string): Promise<void> {
    const cache = this.caches.get(presetId);
    if (cache) {
      await cache.reload();
    }
  }

  /**
   * Clear cache for a specific preset
   */
  clearPreset(presetId: string): void {
    this.caches.delete(presetId);
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.caches.clear();
  }
}

// Singleton instance
export const presetConfigCache = new PresetConfigCache();

// For backward compatibility - keep old export name but mark as deprecated
/** @deprecated Use presetConfigCache instead */
export const configCache = presetConfigCache;

