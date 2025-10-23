import { getDb } from "../client";
import { presets } from "../schema";
import { createPreset } from "../queries/presets";
import { setActivePreset } from "../queries/active-preset";

export async function seedDefaultPreset() {
  console.log("📦 Seeding default preset...");
  const db = await getDb();

  // Vérifie si un preset existe déjà
  const existingPresets = await db.select().from(presets);

  if (existingPresets.length === 0) {
    // Crée un preset par défaut
    const defaultPreset = await createPreset({
      name: "Configuration par défaut",
      description:
        "Configuration de base avec toutes les valeurs standard pour démarrer vos simulations",
      tags: ["default", "balanced"],
      isFavorite: true,
    });

    console.log(`✅ Created default preset: ${defaultPreset.name}`);

    // Définit ce preset comme actif
    await setActivePreset(defaultPreset.id);
    console.log(`✅ Set default preset as active`);
  } else {
    console.log(`⏭️  Presets already exist, skipping default preset creation`);

    // S'assure qu'il y a un preset actif
    const db = await getDb();
    const activePresetResult = await db.query.activePreset.findFirst();

    if (!activePresetResult) {
      // Définit le premier preset comme actif
      await setActivePreset(existingPresets[0].id);
      console.log(`✅ Set first preset as active`);
    }
  }

  console.log("✅ Default preset seeded");
}

