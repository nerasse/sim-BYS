# Moteur de Simulation

## Architecture

Le moteur est **100% découplé** de l'UI. Modules purs et testables.

## Integration Presets

Le simulateur charge les configs depuis le **preset actif** et les passe au moteur :
```typescript
// Dans simulator.tsx (loader)
const symbolConfigs = await getPresetSymbolConfigs(activePresetId);
const connectionConfigs = await getPresetComboConfigs(activePresetId);

// Transformation pour le moteur
const symbolWeights = {};
symbolConfigs.forEach(({ config, symbol }) => {
  symbolWeights[symbol.id] = config.weight;
});

// Passage au moteur
const result = runAutoSimulation({
  character,
  startingBonus,
  symbolWeights,        // ← depuis preset
  connectionMultipliers, // ← depuis preset
  ascension,
  // ...
});
```

## Types Centralisés (`types.ts`)

```typescript
SimulationConfig {
  character, startingBonus, ascension
  symbolWeights: Record<string, number>       // ← preset
  connectionMultipliers: Record<string, number> // ← preset
  startLevel, endLevel, startingDollars
  iterations, mode
}

GameState {
  level, tokens, dollars, spins, xp
  bonuses[], jokers[], shopInventory
  chance, multiplier
}

SpinResult {
  grid, connectionsDetected, tokensGained
  newState
}

SimulationResult {
  success, finalLevel, totalTokens
  stats, decisions, completedFully
}
```

## Modules Core

### `grid-generator.ts`
Génération grille 5×3 avec symbolWeights depuis preset.

```typescript
generateGrid(symbolWeights, chance) → Grid5x3
```

### `deduplication.ts`
Marque symboles utilisés = `null`.

### `combo-detector.ts`
Détecte combos selon `detectionOrder`.

```typescript
detectConnections(grid, connections, symbolData) → DetectedConnection[]
```

**Types** : H3, H4, H5, V3, V, V_BIS, D3, TRI, OEIL, JACKPOT, MULTI

### `calculator.ts`
Calcul gains finaux.

```typescript
calculateGains(connections, state) → number
```

## Modules Game Logic

### `level-manager.ts`
Gestion niveaux. **Utilise configCache (legacy)**.

```typescript
getLevelInfo(levelId, ascension) → LevelInfo
isLevelObjectiveMet(tokens, levelId, ascension) → boolean
```

### `bonus-applier.ts`
Application effets bonus.

### `joker-applier.ts`
Application effets jokers.

## Système d'Effets

### Architecture d'Effets
Les effets sont définis dans la table `effects` comme bibliothèque de comportements purs. Les valeurs spécifiques sont définies dans les objets qui les utilisent :

```typescript
// Dans bonus/joker/personnage
effects: Array<{
  type: string;    // Référence à effects.name
  value: number;   // Valeur spécifique à ce contexte
  target?: string; // Override cible si nécessaire
}>
```

### Types d'Effets
- **multiplier**: Multiplicateur (ex: 1.5 = +50%)
- **additive**: Valeur additive (ex: 10 = +10)
- **percentage**: Pourcentage (ex: 0.2 = +20%)
- **action**: Action direct (ex: spin supplémentaire)
- **trigger**: Déclenchement conditionnel

### Application des Effets
```typescript
// Valeurs par défaut selon type (utilisé dans UI)
getDefaultValueForType(type: string): number {
  switch (type) {
    case "multiplier": return 1.0;  // Neutre
    case "percentage": return 0.1;  // 10%
    case "additive": return 10;     // +10
    case "action":
    case "trigger": return 1;       // Comptage
    default: return 1;              // Fallback
  }
}
```

### `shop-manager.ts`
Génération boutique. **Utilise configCache (legacy)**.

```typescript
generateShopInventory(jokers, level, ascension, chance) → ShopInventory
```

### `rewards.ts`
Génération récompenses (choix bonus).

### `progression.ts`
Gestion XP et levels.

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
   a. N spins
   b. Shop phase
   c. Check objectif
   d. Level up si OK
   e. Boss consomme jetons si X-3
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
ASCENSION_OBJECTIVE_MULTIPLIER = 0.15
```

## Config Cache (Legacy)

Le `configCache` (`app/lib/utils/config-cache.ts`) charge les configs **globales** au démarrage pour performance.

**Utilisé par** :
- `level-manager.ts` - getLevelObjective, isBossLevel
- `shop-manager.ts` - getRarityDistribution

**Note** : Le cache utilise encore les tables globales `levelConfigs` et `shopRarityConfigs`. Refactorisation future pour utiliser configs preset directement.

## Helpers

### `probability.ts`
```typescript
weightedRandom(weights) → string
randomSample(array, count) → T[]
normalizeWeights(weights) → Record<string, number>
```

## Caractéristiques

### Pure Functions
Pas d'effets de bord, testables facilement.

### Type Safety
Tous les types explicites, pas de `any`.

### Modularité
14 modules indépendants, responsabilité claire.

### Performance
- Simulations rapides (pure JS)
- Pas de requêtes DB pendant simulation
- Algorithmes optimisés

## Utilisation

```typescript
// Dans simulator.tsx
const config: SimulationConfig = {
  character,
  startingBonus,
  symbolWeights,        // ← depuis preset
  comboMultipliers,     // ← depuis preset
  ascension: 10,
  startLevel: "1-1",
  endLevel: "7-3",
  startingDollars: 10,
  mode: "auto",
  iterations: 1,
};

const result = runAutoSimulation(config);
// → { success, finalLevel, stats, ... }
```

## Extension

Pour ajouter une fonctionnalité :
1. Définir types dans `types.ts`
2. Créer module dans `core/` ou `game-logic/`
3. Intégrer dans `engine.ts`
4. Tester indépendamment
5. Utiliser dans runner
