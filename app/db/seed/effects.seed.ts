import { effects } from "../schema";
import { getDb } from "../client";
import { nanoid } from "nanoid";

export async function seedEffects() {
  const db = await getDb();

  // Note: Les defaultValue ont été retirés du schéma de la BDD.
  // Les valeurs spécifiques des effets sont maintenant définies directement dans les bonus/jokers/personnages
  // via la structure: Array<{ type: string; value: number; target?: string }>

  const defaultEffects = [
    {
      id: nanoid(),
      name: "score_multiplier",
      displayName: "Multiplicateur de Score",
      description: "Multiplie le score obtenu",
      type: "multiplier",
      category: "passive" as const,
      target: "score",
      unit: "x",
      icon: "⚡",
    },
    {
      id: nanoid(),
      name: "money_bonus",
      displayName: "Bonus d'Argent",
      description: "Ajoute de l'argent supplémentaire",
      type: "additive",
      category: "passive" as const,
      target: "money",
      unit: "$",
      icon: "💰",
    },
    {
      id: nanoid(),
      name: "symbol_value_increase",
      displayName: "Augmentation Valeur Symbole",
      description: "Augmente la valeur des symboles",
      type: "percentage",
      category: "passive" as const,
      target: "symbols",
      unit: "%",
      icon: "📈",
    },
    {
      id: nanoid(),
      name: "reroll_discount",
      displayName: "Réduction Reroll",
      description: "Réduit le coût du reroll",
      type: "percentage",
      category: "passive" as const,
      target: "shop",
      unit: "%",
      icon: "🔄",
    },
    {
      id: nanoid(),
      name: "combo_multiplier",
      displayName: "Multiplicateur de Combo",
      description: "Augmente le multiplicateur des combos",
      type: "multiplier",
      category: "passive" as const,
      target: "combo",
      unit: "x",
      icon: "🎯",
    },
    {
      id: nanoid(),
      name: "extra_spin",
      displayName: "Spin Supplémentaire",
      description: "Donne un spin gratuit",
      type: "action",
      category: "active" as const,
      target: "spin",
      unit: "",
      icon: "🎰",
    },
    {
      id: nanoid(),
      name: "on_boss_defeated",
      displayName: "À la Défaite du Boss",
      description: "Se déclenche quand un boss est vaincu",
      type: "trigger",
      category: "trigger" as const,
      target: "boss",
      unit: "",
      icon: "👑",
    },
    {
      id: nanoid(),
      name: "obtain_starting",
      displayName: "Obtention : Départ",
      description: "Condition : Disponible dès le départ",
      type: "trigger",
      category: "trigger" as const,
      target: "starting",
      unit: "",
      icon: "🎬",
    },
    {
      id: nanoid(),
      name: "obtain_boss_or_levelup",
      displayName: "Obtention : Boss ou Level Up",
      description: "Condition : Obtenu après un boss ou en level up",
      type: "trigger",
      category: "trigger" as const,
      target: "boss_levelup",
      unit: "",
      icon: "🎁",
    },
    {
      id: nanoid(),
      name: "level_reward_boost",
      displayName: "Boost Récompense de Niveau",
      description: "Augmente les récompenses de niveau",
      type: "percentage",
      category: "passive" as const,
      target: "reward",
      unit: "%",
      icon: "🎁",
    },
    {
      id: nanoid(),
      name: "chance_per_level",
      displayName: "Chance par Niveau",
      description: "Augmente la chance à chaque niveau",
      type: "percentage",
      category: "passive" as const,
      target: "chance",
      unit: "%",
      icon: "🍀",
    },
    {
      id: nanoid(),
      name: "starting_dollars_boost",
      displayName: "Boost Dollars de Départ",
      description: "Augmente l'argent de départ",
      type: "additive",
      category: "passive" as const,
      target: "money",
      unit: "$",
      icon: "💵",
    },
    {
      id: nanoid(),
      name: "extra_lives",
      displayName: "Vies Supplémentaires",
      description: "Ajoute des vies supplémentaires",
      type: "additive",
      category: "passive" as const,
      target: "lives",
      unit: "",
      icon: "❤️",
    },
  ];

  for (const effect of defaultEffects) {
    await db.insert(effects).values(effect);
  }

  console.log(`✅ ${defaultEffects.length} effets créés`);
}

