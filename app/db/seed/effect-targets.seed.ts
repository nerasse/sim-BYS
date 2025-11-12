import { getDb } from "~/db/client";
import * as schema from "~/db/schema";
import { nanoid } from "nanoid";

const targetsData = [
  {
    name: "score",
    displayName: "Score",
    description: "Affecte les points de score (jetons)",
    icon: "🎯",
  },
  {
    name: "money",
    displayName: "Argent",
    description: "Affecte l'argent (dollars)",
    icon: "💰",
  },
  {
    name: "symbols",
    displayName: "Symboles",
    description: "Affecte les symboles sur la grille",
    icon: "🎰",
  },
  {
    name: "combos",
    displayName: "Combinaisons",
    description: "Affecte les combinaisons détectées",
    icon: "🔗",
  },
  {
    name: "shop",
    displayName: "Boutique",
    description: "Affecte la boutique (prix, rerolls)",
    icon: "🛒",
  },
  {
    name: "jokers",
    displayName: "Jokers",
    description: "Affecte les jokers possédés",
    icon: "🃏",
  },
  {
    name: "bonuses",
    displayName: "Bonus",
    description: "Affecte les bonus actifs",
    icon: "⭐",
  },
  {
    name: "levels",
    displayName: "Niveaux",
    description: "Affecte la progression de niveau",
    icon: "📊",
  },
];

export async function seedEffectTargets() {
  const db = await getDb();
  
  for (const target of targetsData) {
    await db.insert(schema.effectTargets).values({
      id: nanoid(),
      ...target,
    });
  }
  
  console.log(`✅ Seeded ${targetsData.length} effect targets`);
}

