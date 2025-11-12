import type {
  SimulationConfig,
  SimulationResult,
  GameState,
  SpinResult,
  SimulationStep,
  EquippedBonus,
  SimulationStats,
} from "./types";
import { generateGrid, applyWildSymbols } from "./core/grid-generator";
import { detectCombos } from "./core/combo-detector";
import { calculateGains, calculateInterest } from "./core/calculator";
import { applyBonusEffects } from "./game-logic/bonus-applier";
import { applyJokerEffects, sumJokerEffects } from "./game-logic/joker-applier";
import {
  getLevelInfo,
  getNextLevelId,
  calculateLevelRewards,
  hasReachedEndLevel,
  isLevelObjectiveMet,
  consumeBossTokens,
} from "./game-logic/level-manager";
import { addXP } from "./game-logic/progression";
import { DEFAULT_SPINS_PER_LEVEL } from "~/lib/utils/constants";

/**
 * Initialize game state from config
 */
export function initializeGameState(config: SimulationConfig): GameState {
  // Initialize symbol weights from config
  const symbolWeights: Record<string, number> = {};
  const symbolValues: Record<string, number> = {};
  const symbolMultipliers: Record<string, number> = {};

  for (const symbol of config.symbolsConfig) {
    symbolWeights[symbol.id] = symbol.baseWeight;
    symbolValues[symbol.id] = symbol.baseValue;
    symbolMultipliers[symbol.id] = symbol.baseMultiplier;
  }

  // Initialize combo multipliers
  const comboMultipliers: Record<string, number> = {};
  for (const combo of config.combosConfig) {
    comboMultipliers[combo.id] = combo.baseMultiplier;
  }

  // Initial state
  const state: GameState = {
    ascension: config.ascension,
    currentLevel: config.startLevel,
    currentSpin: 0,
    totalSpins: 0,

    tokens: 0,
    dollars: config.startingDollars,

    playerLevel: 1,
    playerXP: 0,

    equippedBonuses: [
      {
        bonus: config.startingBonus,
        currentLevel: 1,
      },
    ],
    equippedJokers: [],

    bonusActive: false,
    bonusSpinsRemaining: 0,
    wildSymbolsCount: 0,

    chance: config.character.baseStats.chance || 0,
    symbolWeights,
    symbolValues,
    symbolMultipliers,
    comboMultipliers,

    extraSpinsThisLevel: 0,
    permanentMultiplierBonus: 0,
  };

  // Apply character passive effect
  if (config.character.passiveEffect.type === "chance_per_level") {
    state.chance += config.character.passiveEffect.value;
  }

  // Apply starting bonus and joker effects
  state.chance = Math.min(90, state.chance);

  return state;
}

/**
 * Execute a single spin
 */
export function executeSpin(
  state: GameState,
  config: SimulationConfig
): SpinResult {
  // Apply bonus and joker effects to state
  let modifiedState = applyBonusEffects(state.equippedBonuses, state);
  modifiedState = applyJokerEffects(state.equippedJokers, modifiedState);

  // Generate grid
  let grid = generateGrid(modifiedState.symbolWeights, modifiedState.chance);

  // Apply wild symbols if any
  if (modifiedState.wildSymbolsCount > 0) {
    grid = applyWildSymbols(grid, modifiedState.wildSymbolsCount);
  }

  // Detect combos
  const combos = detectCombos(
    grid,
    config.combosConfig,
    modifiedState.symbolValues,
    modifiedState.comboMultipliers
  );

  // Calculate tokens gained
  const tokensGained = calculateGains(combos, modifiedState);

  // Check if bonus triggered (if grid contains bonus symbol)
  const bonusTriggered = grid.flat().some((symbol) => symbol === "B");

  return {
    grid,
    combosDetected: combos,
    tokensGained,
    bonusTriggered,
    isWinning: combos.length > 0,
  };
}

/**
 * Run a complete simulation
 */
export async function runSimulation(config: SimulationConfig): Promise<SimulationResult> {
  const startTime = Date.now();
  const history: SimulationStep[] = [];
  const stats: SimulationStats = {
    totalSpins: 0,
    winningSpins: 0,
    totalCombos: 0,
    comboFrequency: {},
    symbolFrequency: {},
    averageTokensPerSpin: 0,
    maxTokensInSingleSpin: 0,
    levelsCompleted: 0,
    jokersPurchased: 0,
    bonusesAcquired: 0,
  };

  let state = initializeGameState(config);
  let currentStepIndex = 0;

  // Main game loop
  while (!hasReachedEndLevel(state.currentLevel, config.endLevel)) {
    const levelInfo = await getLevelInfo(config.presetId, state.currentLevel, state.ascension);
    const spinsForLevel =
      DEFAULT_SPINS_PER_LEVEL + state.extraSpinsThisLevel;
    state.extraSpinsThisLevel = 0;

    // Spin phase
    for (let spin = 0; spin < spinsForLevel; spin++) {
      const stateBefore = {
        tokens: state.tokens,
        dollars: state.dollars,
        playerLevel: state.playerLevel,
        playerXP: state.playerXP,
      };

      const spinResult = executeSpin(state, config);

      // Update state
      state.tokens += spinResult.tokensGained;
      state.totalSpins++;
      stats.totalSpins++;

      if (spinResult.isWinning) {
        stats.winningSpins++;
      }

      stats.totalCombos += spinResult.combosDetected.length;
      stats.maxTokensInSingleSpin = Math.max(
        stats.maxTokensInSingleSpin,
        spinResult.tokensGained
      );

      // Track frequencies
      for (const combo of spinResult.combosDetected) {
        stats.comboFrequency[combo.comboType] =
          (stats.comboFrequency[combo.comboType] || 0) + 1;
      }

      for (const row of spinResult.grid) {
        for (const symbol of row) {
          stats.symbolFrequency[symbol] =
            (stats.symbolFrequency[symbol] || 0) + 1;
        }
      }

      // Record step
      history.push({
        stepIndex: currentStepIndex++,
        stepType: "spin",
        level: state.currentLevel,
        stateBefore,
        spinResult,
        stateAfter: {
          tokens: state.tokens,
          dollars: state.dollars,
          playerLevel: state.playerLevel,
          playerXP: state.playerXP,
        },
        timestamp: new Date(),
      });
    }

    // Check level objective
    if (!(await isLevelObjectiveMet(config.presetId, state.tokens, state.currentLevel, state.ascension))) {
      // Level failed
      break;
    }

    // Level completed
    stats.levelsCompleted++;

    // Consume tokens if boss level
    if (levelInfo.isBoss) {
      state.tokens = await consumeBossTokens(
        config.presetId,
        state.tokens,
        state.currentLevel,
        state.ascension
      );
    }

    // Level rewards
    const levelRewards = await calculateLevelRewards(
      config.presetId,
      state.currentLevel,
      state.dollars,
      state.ascension
    );

    const interest = calculateInterest(state.dollars);
    state.dollars += levelRewards.dollars + interest;

    // XP
    const xpResult = addXP(state.playerXP, state.playerLevel, levelRewards.xp);
    state.playerXP = xpResult.newXP;
    state.playerLevel = xpResult.newLevel;

    // Record level end
    history.push({
      stepIndex: currentStepIndex++,
      stepType: "level_end",
      level: state.currentLevel,
      stateBefore: {
        tokens: state.tokens - levelRewards.dollars,
        dollars: state.dollars - levelRewards.dollars - interest,
        playerLevel: state.playerLevel - xpResult.levelsGained,
        playerXP: state.playerXP,
      },
      stateAfter: {
        tokens: state.tokens,
        dollars: state.dollars,
        playerLevel: state.playerLevel,
        playerXP: state.playerXP,
      },
      timestamp: new Date(),
    });

    // Proceed to next level
    state.currentLevel = getNextLevelId(state.currentLevel);

    // TODO: Shop phase (for now skipped in auto mode)
    // TODO: Bonus choice (for now skipped in auto mode)
  }

  // Calculate final stats
  stats.averageTokensPerSpin =
    stats.totalSpins > 0 ? state.tokens / stats.totalSpins : 0;

  const duration = Date.now() - startTime;
  const success = hasReachedEndLevel(state.currentLevel, config.endLevel);
  const completedFully =
    success &&
    (await isLevelObjectiveMet(config.presetId, state.tokens, config.endLevel, state.ascension));

  return {
    success,
    completedFully,
    finalLevel: state.currentLevel,
    finalTokens: state.tokens,
    finalDollars: state.dollars,
    finalPlayerLevel: state.playerLevel,
    history,
    stats,
    duration,
  };
}

