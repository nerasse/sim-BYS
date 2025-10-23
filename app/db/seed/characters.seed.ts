import type { NewCharacter } from "../schema";

export const charactersData: NewCharacter[] = [
  {
    id: "demo_char",
    name: "Joueur Chanceux",
    description:
      "Personnage de démonstration avec bonus de chance progressif",
    passiveEffect: {
      type: "chance_per_level",
      value: 1, // +1% chance par niveau avec scaling multiplicatif
    },
    startingBonus: "starting_lucky_spin",
    baseStats: {
      chance: 0,
      multiplier: 1,
    },
    scalingPerLevel: {
      chance: 1, // +1% par niveau
      multiplier: 0,
    },
    unlockCondition: "default",
    isUnlocked: true,
  },
  {
    id: "high_roller",
    name: "Flambeur",
    description:
      "Commence avec plus de $ mais objectifs plus difficiles",
    passiveEffect: {
      type: "starting_dollars_boost",
      value: 10,
    },
    startingBonus: "starting_insurance",
    baseStats: {
      chance: 0,
      multiplier: 1.2,
    },
    scalingPerLevel: {
      chance: 0,
      multiplier: 0.02,
    },
    unlockCondition: "Complete 5 runs",
    isUnlocked: false,
  },
  {
    id: "survivor",
    name: "Survivant",
    description: "Plus de vies, meilleure résistance",
    passiveEffect: {
      type: "extra_lives",
      value: 2,
    },
    startingBonus: "starting_extra_life",
    baseStats: {
      chance: 5,
      multiplier: 0.9,
    },
    scalingPerLevel: {
      chance: 0.5,
      multiplier: 0,
    },
    unlockCondition: "Reach level 5-3",
    isUnlocked: false,
  },
];

