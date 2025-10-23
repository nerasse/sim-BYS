import { getDb } from "../client";
import * as schema from "../schema";
import { symbolsData } from "./symbols.seed";
import { combosData } from "./combos.seed";
import { bonusesData } from "./bonuses.seed";
import { jokersData } from "./jokers.seed";
import { charactersData } from "./characters.seed";
import { levelConfigsData } from "./level-configs.seed";
import { shopRarityConfigsData } from "./shop-rarity-configs.seed";

async function seed() {
  console.log("🌱 Starting database seed...");

  const db = await getDb();

  try {
    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await db.delete(schema.simulationSteps);
    await db.delete(schema.simulationRuns);
    await db.delete(schema.presets);
    await db.delete(schema.globalStats);
    await db.delete(schema.playerProgress);
    await db.delete(schema.shopRarityConfigs);
    await db.delete(schema.levelConfigs);
    await db.delete(schema.characters);
    await db.delete(schema.jokers);
    await db.delete(schema.bonuses);
    await db.delete(schema.combinations);
    await db.delete(schema.symbols);

    // Insert symbols
    console.log("📊 Inserting symbols...");
    await db.insert(schema.symbols).values(symbolsData);

    // Insert combinations
    console.log("🎯 Inserting combinations...");
    await db.insert(schema.combinations).values(combosData);

    // Insert bonuses
    console.log("🎁 Inserting bonuses...");
    await db.insert(schema.bonuses).values(bonusesData);

    // Insert jokers
    console.log("🃏 Inserting jokers...");
    await db.insert(schema.jokers).values(jokersData);

    // Insert characters
    console.log("👤 Inserting characters...");
    await db.insert(schema.characters).values(charactersData);

    // Insert level configs
    console.log("🎚️ Inserting level configs...");
    await db.insert(schema.levelConfigs).values(levelConfigsData);

    // Insert shop rarity configs
    console.log("🏪 Inserting shop rarity configs...");
    await db.insert(schema.shopRarityConfigs).values(shopRarityConfigsData);

    // Insert initial player progress
    console.log("📈 Inserting player progress...");
    await db.insert(schema.playerProgress).values({
      id: "default_player",
      maxAscensionUnlocked: 0,
      totalRunsCompleted: 0,
      totalRunsAttempted: 0,
    });

    // Insert initial global stats
    console.log("📊 Inserting global stats...");
    await db.insert(schema.globalStats).values({
      id: "global",
      totalSimulations: 0,
      totalRuns: 0,
      globalSuccessRate: 0,
      symbolFrequencies: {},
      comboFrequencies: {},
    });

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed();

