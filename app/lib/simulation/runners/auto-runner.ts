import type { SimulationConfig, SimulationResult } from "../types";
import { runSimulation } from "../engine";

/**
 * Run simulation in automatic mode
 * All decisions are made automatically by simple AI
 */
export function runAutoSimulation(
  config: SimulationConfig
): SimulationResult {
  // Ensure mode is set to auto
  const autoConfig: SimulationConfig = {
    ...config,
    mode: "auto",
  };

  return runSimulation(autoConfig);
}

/**
 * Run multiple simulations (batch mode) for statistical analysis
 */
export async function runBatchSimulation(
  config: SimulationConfig,
  iterations: number,
  onProgress?: (current: number, total: number) => void
): Promise<SimulationResult[]> {
  const results: SimulationResult[] = [];

  for (let i = 0; i < iterations; i++) {
    const result = runAutoSimulation(config);
    results.push(result);

    if (onProgress) {
      onProgress(i + 1, iterations);
    }
  }

  return results;
}

/**
 * Calculate aggregate statistics from multiple simulation results
 */
export function calculateAggregateStats(results: SimulationResult[]) {
  if (results.length === 0) {
    throw new Error("No results to aggregate");
  }

  const successCount = results.filter((r) => r.success).length;
  const completedFullyCount = results.filter((r) => r.completedFully).length;

  const finalTokens = results.map((r) => r.finalTokens);
  const finalDollars = results.map((r) => r.finalDollars);
  const finalLevels = results.map((r) => r.finalPlayerLevel);

  const avgTokens =
    finalTokens.reduce((sum, t) => sum + t, 0) / results.length;
  const avgDollars =
    finalDollars.reduce((sum, d) => sum + d, 0) / results.length;
  const avgPlayerLevel =
    finalLevels.reduce((sum, l) => sum + l, 0) / results.length;

  const minTokens = Math.min(...finalTokens);
  const maxTokens = Math.max(...finalTokens);

  // Calculate standard deviation
  const variance =
    finalTokens.reduce((sum, t) => sum + Math.pow(t - avgTokens, 2), 0) /
    results.length;
  const stdDevTokens = Math.sqrt(variance);

  // Most common final level
  const levelCounts: Record<string, number> = {};
  for (const result of results) {
    levelCounts[result.finalLevel] =
      (levelCounts[result.finalLevel] || 0) + 1;
  }
  const avgFinalLevel = Object.keys(levelCounts).sort(
    (a, b) => levelCounts[b] - levelCounts[a]
  )[0];

  return {
    iterations: results.length,
    successRate: successCount / results.length,
    completionRate: completedFullyCount / results.length,
    aggregateStats: {
      avgFinalLevel,
      avgFinalTokens: avgTokens,
      avgFinalDollars: avgDollars,
      avgPlayerLevel,
      minTokens,
      maxTokens,
      stdDevTokens,
    },
  };
}

