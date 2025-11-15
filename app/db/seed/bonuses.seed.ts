import type { NewBonus } from "../schema";

export const bonusesData: NewBonus[] = [
  // ========== BONUS DE DÉPART ==========
  {
    id: "starting_lucky_spin",
    name: "Spin Chanceux",
    description:
      "Tous les 5 spins, le 5ème spin est gagnant (au moins une combinaison garantie)",
    type: "starting",
    rarity: "common",
    effects: [
      { type: "guaranteed_win_every_n", value: 5, scalingPerLevel: 0, maxLevel: 1 },
      { type: "obtain_starting", value: 1, scalingPerLevel: 0, maxLevel: 1 },
    ],
  },
  {
    id: "starting_insurance",
    name: "Assurance",
    description:
      "Octroie une certaine quantité de $, jetons et exp si aucun spin n'est gagnant ce niveau",
    type: "starting",
    rarity: "common",
    effects: [
      { type: "insurance_dollars", value: 3, scalingPerLevel: 0, maxLevel: 1 },
      { type: "insurance_tokens", value: 50, scalingPerLevel: 0, maxLevel: 1 },
      { type: "insurance_xp", value: 10, scalingPerLevel: 0, maxLevel: 1 },
      { type: "obtain_starting", value: 1, scalingPerLevel: 0, maxLevel: 1 },
    ],
  },
  {
    id: "starting_extra_life",
    name: "Vie Supplémentaire",
    description:
      "Si le nombre de jetons demandé n'est pas atteint à la fin du niveau, le joueur passe quand même (1 fois)",
    type: "starting",
    rarity: "common",
    effects: [
      { type: "extra_life", value: 1, scalingPerLevel: 0, maxLevel: 1 },
      { type: "obtain_starting", value: 1, scalingPerLevel: 0, maxLevel: 1 },
    ],
    isPassif: true,
  },
  {
    id: "starting_level_boost",
    name: "Boost de Niveau",
    description: "À l'obtention, le joueur gagne 3 level up, puis ce bonus est détruit",
    type: "starting",
    rarity: "common",
    effects: [
      { type: "instant_levelup", value: 3, scalingPerLevel: 0, maxLevel: 1 },
      { type: "obtain_starting", value: 1, scalingPerLevel: 0, maxLevel: 1 },
    ],
    isPassif: true,
  },

  // ========== BONUS DE PARTIE ==========
  {
    id: "basic_value_boost",
    name: "Valorisation Basique",
    description: "Réduit le poids de P1,P2,P3 et augmente les valeurs de 10,J,Q,K,A",
    type: "game",
    rarity: "common",
    effects: [
      { type: "reduce_weight", value: 20, scalingPerLevel: 0, maxLevel: 1, target: "P1,P2,P3" },
      { type: "increase_value", value: 2, scalingPerLevel: 0.5, maxLevel: 20, target: "10,J,Q,K,A" },
      { type: "obtain_boss_or_levelup", value: 1, scalingPerLevel: 0, maxLevel: 1 },
    ],
  },
  {
    id: "premium_value_boost",
    name: "Valorisation Premium",
    description: "Réduit le poids de 10,J,Q,K,A et augmente les valeurs de P1,P2,P3",
    type: "game",
    rarity: "uncommon",
    effects: [
      { type: "reduce_weight", value: 15, scalingPerLevel: 0, maxLevel: 1, target: "10,J,Q,K,A" },
      { type: "increase_value", value: 3, scalingPerLevel: 1, maxLevel: 30, target: "P1,P2,P3" },
      { type: "obtain_boss_or_levelup", value: 1, scalingPerLevel: 0, maxLevel: 1 },
    ],
  },
  {
    id: "transmutation",
    name: "Transmutation",
    description:
      "À la fin de l'échéance, se transforme en 2 bonus aléatoires (choix entre les 2 si 3 bonus équipés)",
    type: "game",
    rarity: "rare",
    effects: [
      { type: "transform_to_bonuses", value: 2, scalingPerLevel: 0, maxLevel: 1 },
      { type: "obtain_boss_or_levelup", value: 1, scalingPerLevel: 0, maxLevel: 1 },
    ],
    isPassif: true,
  },
  {
    id: "chance_boost",
    name: "Chance Élevée",
    description: "Augmente la chance de base",
    type: "game",
    rarity: "uncommon",
    effects: [
      { type: "increase_chance", value: 5, scalingPerLevel: 1, maxLevel: 40 },
      { type: "obtain_boss_or_levelup", value: 1, scalingPerLevel: 0, maxLevel: 1 },
    ],
  },
  {
    id: "dollar_generator",
    name: "Générateur de $",
    description: "Rajoute des $ à la fin de chaque niveau",
    type: "game",
    rarity: "common",
    effects: [
      { type: "bonus_dollars_per_level", value: 2, scalingPerLevel: 0.5, maxLevel: 30 },
      { type: "obtain_boss_or_levelup", value: 1, scalingPerLevel: 0, maxLevel: 1 },
    ],
  },
  {
    id: "combo_repeat",
    name: "Répétition de Combos",
    description: "Les combinaisons se déclenchent X fois supplémentaires",
    type: "game",
    rarity: "epic",
    effects: [
      { type: "combo_repeat", value: 1, scalingPerLevel: 0.2, maxLevel: 50 },
      { type: "obtain_boss_or_levelup", value: 1, scalingPerLevel: 0, maxLevel: 1 },
    ],
  },
  {
    id: "wild_symbols",
    name: "Symboles Wild",
    description: "Le joueur gagne X symboles wild",
    type: "game",
    rarity: "rare",
    effects: [
      { type: "wild_symbols", value: 1, scalingPerLevel: 0.5, maxLevel: 40 },
      { type: "obtain_boss_or_levelup", value: 1, scalingPerLevel: 0, maxLevel: 1 },
    ],
  },
  {
    id: "symbol_evolution",
    name: "Évolution de Symbole",
    description:
      "Choisissez un symbole : chaque combo augmente sa valeur de base",
    type: "game",
    rarity: "uncommon",
    effects: [
      { type: "symbol_evolution", value: 1, scalingPerLevel: 0.3, maxLevel: 50, target: "player_choice" },
      { type: "obtain_boss_or_levelup", value: 1, scalingPerLevel: 0, maxLevel: 1 },
    ],
  },
  {
    id: "symbol_removal",
    name: "Retrait de Symbole",
    description:
      "Choisissez un symbole à retirer définitivement. Gagnez un joker aléatoire de même rareté, puis ce bonus est détruit",
    type: "game",
    rarity: "legendary",
    effects: [
      { type: "remove_symbol", value: 1, scalingPerLevel: 0, maxLevel: 1, target: "player_choice" },
      { type: "grant_random_joker", value: 1, scalingPerLevel: 0, maxLevel: 1 },
      { type: "obtain_boss_or_levelup", value: 1, scalingPerLevel: 0, maxLevel: 1 },
    ],
    isPassif: true,
  },
  {
    id: "multiplier_boost",
    name: "Boost de Multiplicateurs",
    description: "Augmente les multiplicateurs de symboles et de combinaisons",
    type: "game",
    rarity: "uncommon",
    effects: [
      { type: "increase_symbol_multiplier", value: 0.2, scalingPerLevel: 0.1, maxLevel: 40 },
      { type: "increase_combo_multiplier", value: 0.2, scalingPerLevel: 0.1, maxLevel: 40 },
      { type: "obtain_boss_or_levelup", value: 1, scalingPerLevel: 0, maxLevel: 1 },
    ],
  },
  {
    id: "extra_spins",
    name: "Spins Supplémentaires",
    description: "Rajoute des spins par niveau",
    type: "game",
    rarity: "rare",
    effects: [
      { type: "extra_spins", value: 1, scalingPerLevel: 0.2, maxLevel: 50 },
      { type: "obtain_boss_or_levelup", value: 1, scalingPerLevel: 0, maxLevel: 1 },
    ],
  },
];

