# Moteur de Simulation

## Architecture

Le moteur est **100% découplé** de l'UI. Il est composé de modules purs et testables.

## Types Centralisés (`types.ts`)

```typescript
// Configuration de simulation
SimulationConfig {
  character, startingBonus, ascension
  symbolWeights, comboMultipliers
  startLevel, endLevel, startingDollars
  iterations, mode
}

// État du jeu
GameState {
  level, tokens, dollars, spins, xp
  bonuses[], jokers[], shopInventory
  chance, multiplier
}

// Résultat de spin
SpinResult {
  grid, combosDetected, tokensGained
  newState
}

// Résultat de simulation
SimulationResult {
  success, finalLevel, totalTokens
  stats, decisions, completedFully
}
```

## Modules Core

### `grid-generator.ts`
Génération de la grille 5×3.

```typescript
generateGrid(symbolWeights, chance) → Grid5x3
```
- Weighted random basé sur poids symboles
- Boost de chance augmente symboles premium
- Jackpot garanti si chance = 100%

### `deduplication.ts`
Marque les symboles utilisés dans un combo.

```typescript
deduplicateGrid(grid, combo) → Grid5x3
```
- Symbole utilisé = `null`
- Empêche réutilisation dans autre combo

### `combo-detector.ts`
Détecte tous les combos dans la grille.

```typescript
detectCombos(grid, combinations, symbolData) → DetectedCombo[]
```
- Ordre de détection : `detectionOrder` (1-11)
- Déduplication après chaque combo trouvé
- Support wilds

**Types de combos** :
- H3, H4, H5 (horizontaux)
- V3, V (vertical), V_BIS (2 verticaux)
- D3 (diagonal)
- TRI (triple paire), OEIL (4 coins)
- JACKPOT (mono-symbole)
- MULTI (plusieurs combos)

### `calculator.ts`
Calcul des gains finaux.

```typescript
calculateGains(combos, state) → number
```
- Somme (valeur symbole × multiplicateur combo × multiplier joueur)
- Application effets bonus/jokers

## Modules Game Logic

### `level-manager.ts`
Gestion des niveaux.

```typescript
getLevelInfo(levelId, ascension) → LevelInfo
calculateLevelRewards(levelId, dollars, ascension) → LevelRewards
isLevelObjectiveMet(tokens, levelId, ascension) → boolean
consumeBossTokens(tokens, levelId, ascension) → number
```
- Objectifs depuis `configCache`
- Intérêts : +1$/5$, cap +10$
- Boss levels consomment jetons

### `bonus-applier.ts`
Application des effets de bonus.

```typescript
applyBonusEffects(bonuses, state) → GameState
```
- Multiplicateur global
- Bonus jetons
- Effets spéciaux

### `joker-applier.ts`
Application des effets de jokers.

```typescript
applyJokerEffects(jokers, state) → GameState
```
- Multiplicateurs
- Modifications shop
- Effets conditionnels

### `shop-manager.ts`
Génération et gestion boutique.

```typescript
generateShopInventory(jokers, level, ascension, chance) → ShopInventory
getRarityDistribution(level, ascension, chance) → Record<Rarity, number>
purchaseJoker(item, dollars) → { success, newDollars, joker }
rerollShop(inventory, jokers, level, ascension, chance) → ShopInventory
```
- Raretés depuis `configCache`
- Ajustement ascension automatique
- Prix modifiés par ascension

### `rewards.ts`
Génération récompenses (choix bonus).

```typescript
generateBonusChoices(bonuses, level, ascension) → [Bonus, Bonus, Bonus]
```
- Raretés augmentées en ascension élevée

### `progression.ts`
Gestion XP et levels.

```typescript
gainXP(state, amount) → GameState
checkLevelUp(state) → boolean
```

## Engine Principal (`engine.ts`)

Orchestrateur du jeu.

```typescript
initializeGameState(config) → GameState
executeSpin(state, config) → SpinResult
executeShopPhase(state, decisions) → GameState
executeLevelUp(state) → GameState
```

**Game Loop** :
```
1. Init state
2. Pour chaque niveau:
   a. N spins (généralement 5)
   b. Shop phase
   c. Check objectif
   d. Level up si OK
   e. Boss consomme jetons si stage 3
3. Retour résultat final
```

## Runners

### `auto-runner.ts`
Mode automatique (IA simple).

```typescript
runAutoSimulation(config) → SimulationResult
```
- Décisions automatiques
- Achat jokers si budget
- Progression jusqu'à échec ou fin

### Batch Runner (futur)
Multiple runs en parallèle pour stats.

## Constantes (`constants.ts`)

```typescript
GRID_ROWS = 3
GRID_COLS = 5
DEFAULT_SPINS_PER_LEVEL = 5
MAX_EQUIPPED_BONUSES = 3
MAX_CHANCE = 90
JACKPOT_CHANCE = 100
SHOP_SLOTS = 4
INTEREST_RATE_PER_5_DOLLARS = 1
MAX_INTEREST = 10
```

**Note** : Objectifs niveaux et raretés boutique sont en DB, pas hardcodés.

## Helpers

### `probability.ts`
```typescript
weightedRandom(weights) → string
randomSample(array, count) → T[]
normalizeWeights(weights) → Record<string, number>
```

### `config-cache.ts`
Cache mémoire des configs.
```typescript
configCache.getLevelObjective(levelId, ascension)
configCache.getLevelReward(levelId)
configCache.getShopRarityWeights(world)
```

## Caractéristiques

### Pure Functions
Pas d'effets de bord, testables facilement.

### Type Safety
Tous les types explicites, pas de `any`.

### Modularité
14 modules indépendants, chacun avec responsabilité claire.

### Performance
- Simulations rapides (pure JS)
- Pas de requêtes DB pendant simulation (cache)
- Algorithmes optimisés

## Utilisation

```typescript
import { runAutoSimulation } from "~/lib/simulation/runners/auto-runner";
import type { SimulationConfig } from "~/lib/simulation/types";

const config: SimulationConfig = {
  character: { ... },
  symbolWeights: { "10": 10, "J": 8, ... },
  comboMultipliers: { "H3": 1.5, ... },
  ascension: 10,
  startLevel: "1-1",
  endLevel: "7-3",
  // ...
};

const result = await runAutoSimulation(config);
console.log(result.success, result.finalLevel, result.stats);
```

## Extension

Pour ajouter une fonctionnalité :
1. Définir types dans `types.ts`
2. Créer module dans `core/` ou `game-logic/`
3. Intégrer dans `engine.ts`
4. Tester indépendamment
5. Utiliser dans runner
