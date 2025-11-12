import type { NewCharacter } from "../schema";

export const charactersData: NewCharacter[] = [
  {
    id: "demo_char",
    name: "Joueur Chanceux",
    description:
      "Personnage de démonstration avec bonus de chance progressif",
    passiveEffects: [
      {
        type: "chance_per_level",
        value: 1, // +1% chance par niveau avec scaling multiplicatif
      },
    ],
    startingBonuses: ["starting_lucky_spin"],
    baseStats: {
      chance: 0,
      multiplier: 1,
    },
    scalingPerLevel: {
      chance: 1, // +1% par niveau
      multiplier: 0,
    },
  },
  {
    id: "high_roller",
    name: "Flambeur",
    description:
      "Commence avec plus de $ mais objectifs plus difficiles",
    passiveEffects: [
      {
        type: "starting_dollars_boost",
        value: 10,
      },
    ],
    startingBonuses: ["starting_insurance"],
    baseStats: {
      chance: 0,
      multiplier: 1.2,
    },
    scalingPerLevel: {
      chance: 0,
      multiplier: 0.02,
    },
  },
  {
    id: "survivor",
    name: "Survivant",
    description: "Plus de vies, meilleure résistance",
    passiveEffects: [
      {
        type: "extra_lives",
        value: 2,
      },
    ],
    startingBonuses: ["starting_extra_life"],
    baseStats: {
      chance: 5,
      multiplier: 0.9,
    },
    scalingPerLevel: {
      chance: 0.5,
      multiplier: 0,
    },
  },
];

