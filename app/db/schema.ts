import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Effets (bibliothèque centralisée)
export const effects = sqliteTable("effects", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "multiplier", "additive", "percentage", etc.
  category: text("category", { enum: ["passive", "active", "trigger"] }).notNull(),
  target: text("target"), // "score", "money", "symbols", etc.
  unit: text("unit"), // "%", "x", "$", etc.
  icon: text("icon"),
  // Champs spécifiques selon le type
  config: text("config", { mode: "json" }), // { condition?: string, baseValue?: number, increment?: number, maxValue?: number }
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const effectTargets = sqliteTable("effect_targets", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(), // "score", "money", "symbols"
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Symboles (9 symboles de base)
export const symbols = sqliteTable("symbols", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["basic", "premium", "bonus"] }).notNull(),
  baseWeight: real("base_weight").notNull().default(1),
  baseValue: integer("base_value").notNull().default(1),
  baseMultiplier: real("base_multiplier").notNull().default(1),
  icon: text("icon"),
  color: text("color"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Connexions (11 types)
export const connections = sqliteTable("connections", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  pattern: text("pattern", { mode: "json" }).$type<number[][]>().notNull(),
  baseMultiplier: real("base_multiplier").notNull().default(1),
  detectionOrder: integer("detection_order").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Bonus
export const bonuses = sqliteTable("bonuses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type", { enum: ["starting", "game"] }).notNull(),
  rarity: text("rarity", {
    enum: ["common", "uncommon", "rare", "epic", "legendary"],
  }).notNull(),
  effects: text("effects", { mode: "json" })
    .$type<Array<{ type: string; value: number; scalingPerLevel: number; maxLevel: number; target?: string }>>()
    .notNull(),
  isPassif: integer("is_passif", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Jokers
export const jokers = sqliteTable("jokers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  rarity: text("rarity", {
    enum: ["common", "uncommon", "rare", "epic", "legendary"],
  }).notNull(),
  basePrice: integer("base_price").notNull(),
  effects: text("effects", { mode: "json" })
    .$type<Array<{ type: string; value: number; scalingPerLevel: number; maxLevel: number; target?: string }>>()
    .notNull(),
  sellValue: integer("sell_value").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Personnages
export const characters = sqliteTable("characters", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  passiveEffects: text("passive_effects", { mode: "json" })
    .$type<Array<{ type: string; value: number }>>()
    .notNull()
    .default(sql`'[]'`),
  startingBonuses: text("starting_bonuses", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  baseStats: text("base_stats", { mode: "json" })
    .$type<{ chance?: number; multiplier?: number }>()
    .notNull(),
  scalingPerLevel: text("scaling_per_level", { mode: "json" })
    .$type<{ chance?: number; multiplier?: number }>()
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Progression du joueur
export const playerProgress = sqliteTable("player_progress", {
  id: text("id").primaryKey(),
  maxAscensionUnlocked: integer("max_ascension_unlocked").notNull().default(0),
  totalRunsCompleted: integer("total_runs_completed").notNull().default(0),
  totalRunsAttempted: integer("total_runs_attempted").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Object Selection Presets (sous-presets réutilisables)
export const objectSelectionPresets = sqliteTable("object_selection_presets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Disponibilité des bonus dans un object selection preset
export const objectSelectionBonuses = sqliteTable("object_selection_bonuses", {
  id: text("id").primaryKey(),
  objectSelectionPresetId: text("object_selection_preset_id")
    .references(() => objectSelectionPresets.id, { onDelete: "cascade" })
    .notNull(),
  bonusId: text("bonus_id")
    .references(() => bonuses.id)
    .notNull(),
  availableFrom: text("available_from").notNull(), // "1-1", "1-3", etc.
  availableUntil: text("available_until"), // null = toujours disponible après availableFrom
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Disponibilité des jokers dans un object selection preset
export const objectSelectionJokers = sqliteTable("object_selection_jokers", {
  id: text("id").primaryKey(),
  objectSelectionPresetId: text("object_selection_preset_id")
    .references(() => objectSelectionPresets.id, { onDelete: "cascade" })
    .notNull(),
  jokerId: text("joker_id")
    .references(() => jokers.id)
    .notNull(),
  availableFrom: text("available_from").notNull(), // "1-1", "1-2", etc.
  availableUntil: text("available_until"), // null = toujours disponible après availableFrom
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Presets (métadonnées uniquement)
export const presets = sqliteTable("presets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
  isFavorite: integer("is_favorite", { mode: "boolean" })
    .notNull()
    .default(false),
  objectSelectionPresetId: text("object_selection_preset_id")
    .references(() => objectSelectionPresets.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Preset actif (une seule ligne dans cette table)
export const activePreset = sqliteTable("active_preset", {
  id: integer("id").primaryKey().default(1),
  presetId: text("preset_id")
    .references(() => presets.id)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Configuration des symboles par preset
export const presetSymbolConfigs = sqliteTable("preset_symbol_configs", {
  id: text("id").primaryKey(),
  presetId: text("preset_id")
    .references(() => presets.id, { onDelete: "cascade" })
    .notNull(),
  symbolId: text("symbol_id")
    .references(() => symbols.id)
    .notNull(),
  weight: real("weight").notNull(),
  value: integer("value").notNull(),
  multiplier: real("multiplier").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Configuration des connexions par preset
export const presetComboConfigs = sqliteTable("preset_combo_configs", {
  id: text("id").primaryKey(),
  presetId: text("preset_id")
    .references(() => presets.id, { onDelete: "cascade" })
    .notNull(),
  comboId: text("combo_id")
    .references(() => connections.id)
    .notNull(),
  multiplier: real("multiplier").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Configuration des niveaux par preset
export const presetLevelConfigs = sqliteTable("preset_level_configs", {
  id: text("id").primaryKey(),
  presetId: text("preset_id")
    .references(() => presets.id, { onDelete: "cascade" })
    .notNull(),
  levelId: text("level_id").notNull(), // "1-1", "1-2", etc.
  world: integer("world").notNull(),
  stage: integer("stage").notNull(),
  baseObjective: integer("base_objective").notNull(),
  dollarReward: integer("dollar_reward").notNull(),
  isBoss: integer("is_boss", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Configuration des rarités shop par preset
export const presetShopRarityConfigs = sqliteTable("preset_shop_rarity_configs", {
  id: text("id").primaryKey(),
  presetId: text("preset_id")
    .references(() => presets.id, { onDelete: "cascade" })
    .notNull(),
  world: integer("world").notNull(),
  commonWeight: real("common_weight").notNull().default(70),
  uncommonWeight: real("uncommon_weight").notNull().default(25),
  rareWeight: real("rare_weight").notNull().default(5),
  epicWeight: real("epic_weight").notNull().default(0),
  legendaryWeight: real("legendary_weight").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Disponibilité des bonus par niveau dans un preset
export const presetBonusAvailability = sqliteTable("preset_bonus_availability", {
  id: text("id").primaryKey(),
  presetId: text("preset_id")
    .references(() => presets.id, { onDelete: "cascade" })
    .notNull(),
  bonusId: text("bonus_id")
    .references(() => bonuses.id)
    .notNull(),
  availableFrom: text("available_from").notNull(), // "1-1", "1-3", etc.
  availableUntil: text("available_until"), // null = toujours disponible après availableFrom
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Disponibilité des jokers par niveau dans un preset
export const presetJokerAvailability = sqliteTable("preset_joker_availability", {
  id: text("id").primaryKey(),
  presetId: text("preset_id")
    .references(() => presets.id, { onDelete: "cascade" })
    .notNull(),
  jokerId: text("joker_id")
    .references(() => jokers.id)
    .notNull(),
  availableFrom: text("available_from").notNull(), // "1-1", "1-2", etc.
  availableUntil: text("available_until"), // null = toujours disponible après availableFrom
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Runs de simulation
export const simulationRuns = sqliteTable("simulation_runs", {
  id: text("id").primaryKey(),
  presetId: text("preset_id").references(() => presets.id),
  characterId: text("character_id")
    .references(() => characters.id)
    .notNull(),
  ascension: integer("ascension").notNull().default(0),
  mode: text("mode", { enum: ["auto", "manual"] }).notNull(),
  iterations: integer("iterations").notNull().default(1),
  startLevel: text("start_level").notNull(),
  endLevel: text("end_level").notNull(),
  successRate: real("success_rate").notNull().default(0),
  avgFinalLevel: text("avg_final_level"),
  avgTokens: real("avg_tokens").notNull().default(0),
  avgDollars: real("avg_dollars").notNull().default(0),
  completedFully: integer("completed_fully", { mode: "boolean" })
    .notNull()
    .default(false),
  status: text("status", { enum: ["running", "completed", "failed"] })
    .notNull()
    .default("running"),
  duration: integer("duration").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Steps de simulation
export const simulationSteps = sqliteTable("simulation_steps", {
  id: text("id").primaryKey(),
  runId: text("run_id")
    .references(() => simulationRuns.id)
    .notNull(),
  iterationIndex: integer("iteration_index").notNull().default(0),
  stepIndex: integer("step_index").notNull(),
  stepType: text("step_type", {
    enum: ["spin", "shop", "bonus_choice", "levelup"],
  }).notNull(),
  level: text("level").notNull(),
  tokensBefore: integer("tokens_before").notNull().default(0),
  dollarsBefore: integer("dollars_before").notNull().default(0),
  grid: text("grid", { mode: "json" }).$type<string[][]>(),
  combosDetected: text("combos_detected", { mode: "json" })
    .$type<Array<{ comboType: string; symbolId: string; positions: number[][] }>>(),
  tokensGained: integer("tokens_gained").notNull().default(0),
  purchasedJoker: text("purchased_joker"),
  chosenBonus: text("chosen_bonus"),
  tokensAfter: integer("tokens_after").notNull().default(0),
  dollarsAfter: integer("dollars_after").notNull().default(0),
  timestamp: integer("timestamp", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Configurations de niveau (objectifs et récompenses)
export const levelConfigs = sqliteTable("level_configs", {
  id: text("id").primaryKey(),
  levelId: text("level_id").notNull().unique(), // "1-1", "1-2", etc.
  world: integer("world").notNull(),
  stage: integer("stage").notNull(),
  baseObjective: integer("base_objective").notNull(), // Jetons requis
  dollarReward: integer("dollar_reward").notNull(), // $ gagnés
  isBoss: integer("is_boss", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Configurations de rarité de boutique par monde
export const shopRarityConfigs = sqliteTable("shop_rarity_configs", {
  id: text("id").primaryKey(),
  world: integer("world").notNull().unique(),
  commonWeight: real("common_weight").notNull().default(70),
  uncommonWeight: real("uncommon_weight").notNull().default(25),
  rareWeight: real("rare_weight").notNull().default(5),
  epicWeight: real("epic_weight").notNull().default(0),
  legendaryWeight: real("legendary_weight").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Stats globales
export const globalStats = sqliteTable("global_stats", {
  id: text("id").primaryKey(),
  totalSimulations: integer("total_simulations").notNull().default(0),
  totalRuns: integer("total_runs").notNull().default(0),
  globalSuccessRate: real("global_success_rate").notNull().default(0),
  symbolFrequencies: text("symbol_frequencies", { mode: "json" })
    .$type<Record<string, number>>()
    .notNull(),
  connectionFrequencies: text("connection_frequencies", { mode: "json" })
    .$type<Record<string, number>>()
    .notNull(),
  topCharacter: text("top_character"),
  topBonus: text("top_bonus"),
  topJoker: text("top_joker"),
  lastUpdated: integer("last_updated", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Type exports
export type Effect = typeof effects.$inferSelect;
export type NewEffect = typeof effects.$inferInsert;

export type EffectTarget = typeof effectTargets.$inferSelect;
export type NewEffectTarget = typeof effectTargets.$inferInsert;

export type Symbol = typeof symbols.$inferSelect;
export type NewSymbol = typeof symbols.$inferInsert;

export type Connection = typeof connections.$inferSelect;
export type NewConnection = typeof connections.$inferInsert;

export type Bonus = typeof bonuses.$inferSelect;
export type NewBonus = typeof bonuses.$inferInsert;

export type Joker = typeof jokers.$inferSelect;
export type NewJoker = typeof jokers.$inferInsert;

export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;

export type PlayerProgress = typeof playerProgress.$inferSelect;
export type NewPlayerProgress = typeof playerProgress.$inferInsert;

export type ObjectSelectionPreset = typeof objectSelectionPresets.$inferSelect;
export type NewObjectSelectionPreset = typeof objectSelectionPresets.$inferInsert;

export type ObjectSelectionBonus = typeof objectSelectionBonuses.$inferSelect;
export type NewObjectSelectionBonus = typeof objectSelectionBonuses.$inferInsert;

export type ObjectSelectionJoker = typeof objectSelectionJokers.$inferSelect;
export type NewObjectSelectionJoker = typeof objectSelectionJokers.$inferInsert;

export type Preset = typeof presets.$inferSelect;
export type NewPreset = typeof presets.$inferInsert;

export type ActivePreset = typeof activePreset.$inferSelect;
export type NewActivePreset = typeof activePreset.$inferInsert;

export type PresetSymbolConfig = typeof presetSymbolConfigs.$inferSelect;
export type NewPresetSymbolConfig = typeof presetSymbolConfigs.$inferInsert;

export type PresetComboConfig = typeof presetComboConfigs.$inferSelect;
export type NewPresetComboConfig = typeof presetComboConfigs.$inferInsert;

export type PresetLevelConfig = typeof presetLevelConfigs.$inferSelect;
export type NewPresetLevelConfig = typeof presetLevelConfigs.$inferInsert;

export type PresetShopRarityConfig = typeof presetShopRarityConfigs.$inferSelect;
export type NewPresetShopRarityConfig = typeof presetShopRarityConfigs.$inferInsert;

export type PresetBonusAvailability = typeof presetBonusAvailability.$inferSelect;
export type NewPresetBonusAvailability = typeof presetBonusAvailability.$inferInsert;

export type PresetJokerAvailability = typeof presetJokerAvailability.$inferSelect;
export type NewPresetJokerAvailability = typeof presetJokerAvailability.$inferInsert;

export type SimulationRun = typeof simulationRuns.$inferSelect;
export type NewSimulationRun = typeof simulationRuns.$inferInsert;

export type SimulationStep = typeof simulationSteps.$inferSelect;
export type NewSimulationStep = typeof simulationSteps.$inferInsert;

export type LevelConfig = typeof levelConfigs.$inferSelect;
export type NewLevelConfig = typeof levelConfigs.$inferInsert;

export type ShopRarityConfig = typeof shopRarityConfigs.$inferSelect;
export type NewShopRarityConfig = typeof shopRarityConfigs.$inferInsert;

export type GlobalStats = typeof globalStats.$inferSelect;
export type NewGlobalStats = typeof globalStats.$inferInsert;

