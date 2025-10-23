import type { NewLevelConfig } from "../schema";

export const levelConfigsData: NewLevelConfig[] = [
  // World 1
  { id: "level-1-1", levelId: "1-1", world: 1, stage: 1, baseObjective: 100, dollarReward: 6, isBoss: false },
  { id: "level-1-2", levelId: "1-2", world: 1, stage: 2, baseObjective: 200, dollarReward: 6, isBoss: false },
  { id: "level-1-3", levelId: "1-3", world: 1, stage: 3, baseObjective: 500, dollarReward: 8, isBoss: true },
  
  // World 2
  { id: "level-2-1", levelId: "2-1", world: 2, stage: 1, baseObjective: 1000, dollarReward: 8, isBoss: false },
  { id: "level-2-2", levelId: "2-2", world: 2, stage: 2, baseObjective: 1500, dollarReward: 8, isBoss: false },
  { id: "level-2-3", levelId: "2-3", world: 2, stage: 3, baseObjective: 3000, dollarReward: 10, isBoss: true },
  
  // World 3
  { id: "level-3-1", levelId: "3-1", world: 3, stage: 1, baseObjective: 5000, dollarReward: 10, isBoss: false },
  { id: "level-3-2", levelId: "3-2", world: 3, stage: 2, baseObjective: 7500, dollarReward: 10, isBoss: false },
  { id: "level-3-3", levelId: "3-3", world: 3, stage: 3, baseObjective: 15000, dollarReward: 12, isBoss: true },
  
  // World 4
  { id: "level-4-1", levelId: "4-1", world: 4, stage: 1, baseObjective: 25000, dollarReward: 12, isBoss: false },
  { id: "level-4-2", levelId: "4-2", world: 4, stage: 2, baseObjective: 40000, dollarReward: 12, isBoss: false },
  { id: "level-4-3", levelId: "4-3", world: 4, stage: 3, baseObjective: 75000, dollarReward: 15, isBoss: true },
  
  // World 5
  { id: "level-5-1", levelId: "5-1", world: 5, stage: 1, baseObjective: 125000, dollarReward: 15, isBoss: false },
  { id: "level-5-2", levelId: "5-2", world: 5, stage: 2, baseObjective: 200000, dollarReward: 15, isBoss: false },
  { id: "level-5-3", levelId: "5-3", world: 5, stage: 3, baseObjective: 350000, dollarReward: 18, isBoss: true },
  
  // World 6
  { id: "level-6-1", levelId: "6-1", world: 6, stage: 1, baseObjective: 600000, dollarReward: 18, isBoss: false },
  { id: "level-6-2", levelId: "6-2", world: 6, stage: 2, baseObjective: 1000000, dollarReward: 18, isBoss: false },
  { id: "level-6-3", levelId: "6-3", world: 6, stage: 3, baseObjective: 1750000, dollarReward: 22, isBoss: true },
  
  // World 7
  { id: "level-7-1", levelId: "7-1", world: 7, stage: 1, baseObjective: 3000000, dollarReward: 22, isBoss: false },
  { id: "level-7-2", levelId: "7-2", world: 7, stage: 2, baseObjective: 5000000, dollarReward: 22, isBoss: false },
  { id: "level-7-3", levelId: "7-3", world: 7, stage: 3, baseObjective: 10000000, dollarReward: 25, isBoss: true },
];

