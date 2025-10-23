import type { GameState } from "../types";
import type { Joker } from "~/db/schema";

/**
 * Apply all joker effects to game state
 */
export function applyJokerEffects(
  jokers: Joker[],
  gameState: GameState
): GameState {
  let state = { ...gameState };

  for (const joker of jokers) {
    state = applySingleJoker(joker, state);
  }

  return state;
}

/**
 * Apply a single joker effect
 */
function applySingleJoker(joker: Joker, gameState: GameState): GameState {
  const state = { ...gameState };

  for (const effect of joker.effects) {
    const value = effect.value;

    switch (effect.type) {
      // Weight modifications
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

      // Chance
      case "increase_chance":
        state.chance = Math.min(90, state.chance + value);
        break;

      case "decrease_chance":
        state.chance = Math.max(0, state.chance - value);
        break;

      // Multipliers
      case "increase_combo_multiplier":
        for (const combo of Object.keys(state.comboMultipliers)) {
          state.comboMultipliers[combo] += value;
        }
        break;

      case "increase_symbol_multiplier":
        for (const symbol of Object.keys(state.symbolMultipliers)) {
          state.symbolMultipliers[symbol] += value;
        }
        break;

      // Spins
      case "extra_spins":
        state.extraSpinsThisLevel += value;
        break;

      // Conditional effects (handled during combo detection/calculation)
      case "conditional_multiplier":
      case "combo_multiplier_on_symbol_type":
      case "multiplier_per_dollar":
      case "random_permanent_multiplier":
      case "chance_per_combo":
      case "persistent_chance_on_loss":
      case "symbol_drop":
        // These are handled in specific game loop phases
        break;

      // Shop effects
      case "free_rerolls":
      case "allow_debt":
      case "increase_sell_value":
        // Handled in shop manager
        break;

      // Special effects
      case "unify_symbols":
      case "grant_bonus_choice":
      case "upgrade_bonus_rarity":
        // Handled in specific game events
        break;

      // Economy
      case "bonus_dollars_per_level":
      case "increase_xp_percent":
      case "increase_dollars_percent":
        // Handled at level end
        break;
    }
  }

  return state;
}

/**
 * Check if joker has specific effect type
 */
export function hasJokerEffect(joker: Joker, effectType: string): boolean {
  return joker.effects.some((e) => e.type === effectType);
}

/**
 * Get effect value from joker
 */
export function getJokerEffectValue(joker: Joker, effectType: string): number {
  const effect = joker.effects.find((e) => e.type === effectType);
  return effect?.value || 0;
}

/**
 * Get all jokers with specific effect
 */
export function getJokersWithEffect(
  jokers: Joker[],
  effectType: string
): Joker[] {
  return jokers.filter((j) => hasJokerEffect(j, effectType));
}

/**
 * Sum effect values from all jokers
 */
export function sumJokerEffects(jokers: Joker[], effectType: string): number {
  return jokers.reduce((sum, joker) => {
    return sum + getJokerEffectValue(joker, effectType);
  }, 0);
}

