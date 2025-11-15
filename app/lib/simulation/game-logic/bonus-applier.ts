import type { GameState, EquippedBonus } from "../types";
import type { Bonus } from "~/db/schema";

/**
 * Apply all bonus effects to game state
 */
export function applyBonusEffects(
  bonuses: EquippedBonus[],
  gameState: GameState
): GameState {
  let state = { ...gameState };

  for (const { bonus, currentLevel } of bonuses) {
    state = applySingleBonus(bonus, currentLevel, state);
  }

  return state;
}

/**
 * Apply a single bonus effect
 */
function applySingleBonus(
  bonus: Bonus,
  bonusLevel: number,
  gameState: GameState
): GameState {
  const state = { ...gameState };

  for (const effect of bonus.effects) {
    const value = calculateEffectValue(bonus, bonusLevel, effect.value);

    switch (effect.type) {
      // Weight modifications
      case "reduce_weight":
        if (effect.target) {
          const symbols = effect.target.split(",");
          for (const symbol of symbols) {
            if (state.symbolWeights[symbol]) {
              state.symbolWeights[symbol] *= 1 - value / 100;
            }
          }
        }
        break;

      case "increase_weight":
        if (effect.target) {
          const symbols = effect.target.split(",");
          for (const symbol of symbols) {
            if (state.symbolWeights[symbol]) {
              state.symbolWeights[symbol] *= 1 + value / 100;
            }
          }
        }
        break;

      // Value modifications
      case "increase_value":
        if (effect.target) {
          const symbols = effect.target.split(",");
          for (const symbol of symbols) {
            if (state.symbolValues[symbol] !== undefined) {
              state.symbolValues[symbol] += value;
            }
          }
        }
        break;

      // Chance
      case "increase_chance":
        state.chance = Math.min(90, state.chance + value);
        break;

      // Dollars
      case "bonus_dollars_per_level":
        // Applied at level end
        break;

      // Combos
      case "combo_repeat":
        // Handled in combo detection
        break;

      // Wild symbols
      case "wild_symbols":
        state.wildSymbolsCount += value;
        break;

      // Multipliers
      case "increase_symbol_multiplier":
        for (const symbol of Object.keys(state.symbolMultipliers)) {
          state.symbolMultipliers[symbol] += value;
        }
        break;

      case "increase_combo_multiplier":
        for (const connection of Object.keys(state.connectionMultipliers)) {
          state.connectionMultipliers[connection] += value;
        }
        break;

      // Spins
      case "extra_spins":
        state.extraSpinsThisLevel += value;
        break;

      // Symbol evolution
      case "symbol_evolution":
        // Handled per-combo
        break;

      // Special effects
      case "guaranteed_win_every_n":
      case "insurance_dollars":
      case "insurance_tokens":
      case "insurance_xp":
      case "extra_life":
      case "instant_levelup":
      case "transform_to_bonuses":
      case "remove_symbol":
      case "grant_random_joker":
        // These are handled separately in game loop
        break;
    }
  }

  return state;
}

/**
 * Calculate effect value based on bonus level and scaling
 */
function calculateEffectValue(
  bonus: Bonus,
  bonusLevel: number,
  baseValue: number
): number {
  if (bonusLevel === 1) {
    return baseValue;
  }

  const scaling = bonus.scalingPerLevel;
  return baseValue + scaling * (bonusLevel - 1);
}

/**
 * Check if bonus has specific effect type
 */
export function hasEffect(bonus: Bonus, effectType: string): boolean {
  return bonus.effects.some((e) => e.type === effectType);
}

/**
 * Get effect value from bonus
 */
export function getEffectValue(
  bonus: Bonus,
  bonusLevel: number,
  effectType: string
): number {
  const effect = bonus.effects.find((e) => e.type === effectType);
  if (!effect) return 0;

  return calculateEffectValue(bonus, bonusLevel, effect.value);
}

/**
 * Level up a bonus
 */
export function levelUpBonus(equippedBonus: EquippedBonus): EquippedBonus {
  const { bonus, currentLevel } = equippedBonus;

  if (currentLevel >= bonus.maxLevel) {
    return equippedBonus; // Already at max
  }

  return {
    ...equippedBonus,
    currentLevel: currentLevel + 1,
  };
}

