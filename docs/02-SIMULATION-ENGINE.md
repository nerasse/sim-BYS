# Moteur de Simulation - Architecture

## Localisation
`app/lib/simulation/`

## Principe
Moteur **100% découplé de l'UI**, pur TypeScript, sans effets de bord (sauf logs). Testable unitairement.

## Structure Modulaire

```
simulation/
├── types.ts                    # Types centralisés
├── engine.ts                   # Orchestrateur principal
│
├── core/                       # Logique slot machine
│   ├── grid-generator.ts      # Génération grille 5×3
│   ├── combo-detector.ts      # Détection 11 combos
│   ├── calculator.ts          # Calculs gains, XP, intérêts
│   └── deduplication.ts       # Algo déduplication symboles
│
├── game-logic/                 # Règles du jeu
│   ├── level-manager.ts       # Niveaux, objectifs
│   ├── bonus-applier.ts       # Effets bonus
│   ├── joker-applier.ts       # Effets jokers
│   ├── shop-manager.ts        # Génération boutique
│   ├── rewards.ts             # Récompenses niveau
│   └── progression.ts         # XP, level-up
│
└── runners/                    # Modes de simulation
    ├── auto-runner.ts         # IA décisions
    ├── manual-runner.ts       # Pause aux décisions (TODO)
    └── batch-runner.ts        # N runs pour stats
```

## Flux de Simulation

```typescript
// 1. Configuration
const config: SimulationConfig = {
  character, startingBonus,
  symbolsConfig, combosConfig,
  ascension, startLevel, endLevel,
  startingDollars, mode, iterations
}

// 2. Initialisation
const state = initializeGameState(config)

// 3. Boucle principale
while (!hasReachedEndLevel(state.currentLevel, endLevel)) {
  // Spin phase
  for (spin = 0; spin < spinsPerLevel; spin++) {
    const result = executeSpin(state, config)
    state.tokens += result.tokensGained
  }
  
  // Check objectif
  if (!isLevelObjectiveMet(tokens, level, ascension)) break
  
  // Rewards + shop + bonus choice
  state = applyLevelRewards(state)
  
  // Next level
  state.currentLevel = getNextLevelId(state.currentLevel)
}

// 4. Résultat
return SimulationResult { success, stats, history }
```

## Modules Clés

### 1. grid-generator.ts
**Responsabilité** : Génération grille 5×3 selon poids + chance

```typescript
generateGrid(symbolWeights, chance) → Grid5x3
```

- Si chance ≥ 100% → Jackpot garanti
- Sinon : weighted random avec boost chance
- Support wilds : `applyWildSymbols(grid, count)`

**Ref** : `GRID_ROWS=3, GRID_COLS=5`

### 2. combo-detector.ts
**Responsabilité** : Détection des 11 types de combos

```typescript
detectCombos(grid, combos, values, mults) → DetectedCombo[]
```

**Algorithme** :
1. Check jackpot (full grid mono-symbole) → return ALL combos
2. Sinon : détection séquentielle selon `detectionOrder`
3. Pour chaque combo :
   - Générer patterns possibles (ex: H3 → toutes positions 3 horizontales)
   - Check chaque pattern avec `availabilityGrid`
   - Si match ET symboles disponibles → ajouter + marquer utilisés
4. Déduplication : symboles utilisés ne peuvent plus matcher

**Patterns** :
- H3, H4, H5 : horizontales (sliding window)
- V3, V : verticales (colonnes)
- D3 : diagonales (6 patterns)
- TRI : L-shapes (16 patterns)
- OEIL : croix 5 symboles (9 patterns)
- JACKPOT : grille complète
- MULTI : détection multiple (metadata)

### 3. calculator.ts
**Responsabilité** : Calcul gains, XP, intérêts

```typescript
calculateGains(combos, gameState) → number
calculateInterest(dollars) → number  // +1$/5$, max +10$
addXP(xp, level, gained) → { newXP, newLevel, leveledUp }
```

### 4. level-manager.ts
**Responsabilité** : Gestion niveaux et objectifs

```typescript
getLevelObjective(levelId, ascension) → number
// baseObjective × (1 + ascension × 0.15)

getNextLevelId("1-1") → "1-2"
isBossLevel("X-3") → true
```

**Objectifs de base** : Définis dans `constants.ts`
- 1-1: 100, 1-2: 200, 1-3: 500 (boss, consommés)
- 2-1: 1000, ..., 7-3: 10M

### 5. bonus-applier.ts
**Responsabilité** : Appliquer effets bonus équipés

```typescript
applyBonusEffects(bonuses: EquippedBonus[], state) → GameState
```

**Effets supportés** :
- `reduce_weight` / `increase_weight` : modifier symbolWeights
- `increase_value` : modifier symbolValues
- `increase_chance` : +chance (cap 90)
- `increase_*_multiplier` : modifier multiplicateurs
- `extra_spins`, `wild_symbols`, etc.

**Scaling** : `baseValue + scalingPerLevel × (level-1)`

### 6. joker-applier.ts
**Responsabilité** : Effets jokers (similaire bonus mais permanent)

```typescript
applyJokerEffects(jokers, state) → GameState
```

Effets conditionnels (ex: `multiplier_per_dollar`) appliqués à chaque phase.

### 7. shop-manager.ts
**Responsabilité** : Génération inventaire boutique

```typescript
generateShopInventory(jokers, level, ascension, chance) → ShopInventory
```

**Raretés** :
- Base : selon niveau joueur (monde 1-7)
- Modificateur ascension : -3% common, +1.5% rare, +0.1% legendary par niveau
- Boost chance : augmente légèrement hautes raretés

**Prix** : `basePrice × (1 + floor(asc/5) × 0.1)`

Reroll coût : exponentiel `2 × 2^rerollCount`

### 8. rewards.ts
**Responsabilité** : Génération choix bonus, récompenses

```typescript
generateBonusChoices(bonuses, level, ascension) → [B, B, B]
```

3 bonus proposés selon raretés pondérées (similaire shop).

### 9. progression.ts
**Responsabilité** : XP et level-up

XP requis : `100 × 1.1^(level-1)` (exponentiel)

## État de Jeu (GameState)

```typescript
{
  // Progression
  ascension, currentLevel, currentSpin, totalSpins
  
  // Ressources
  tokens, dollars, playerLevel, playerXP
  
  // Équipement
  equippedBonuses: EquippedBonus[]  // Max 3
  equippedJokers: Joker[]
  
  // Modifiers dynamiques
  chance, symbolWeights, symbolValues,
  symbolMultipliers, comboMultipliers
  
  // Temporaire
  extraSpinsThisLevel, permanentMultiplierBonus,
  bonusActive, bonusSpinsRemaining, wildSymbolsCount
}
```

## Types Principaux

Voir `types.ts` pour :
- `SimulationConfig` : input simulation
- `GameState` : état runtime
- `SpinResult` : résultat 1 spin
- `DetectedCombo` : combo trouvé
- `SimulationResult` : output complet
- `SimulationStep` : historique
- `ShopInventory` : boutique

## Constants

Voir `lib/utils/constants.ts` :
- Objectifs par niveau
- Récompenses $
- Raretés boutique par monde
- Caps (chance=90, max interest=10$)
- Paliers level-up bonus

## Utilitaires

`lib/utils/probability.ts` :
- `weightedRandom` : sélection pondérée
- `normalizeWeights` : sum = 100
- `randomChance` : roll 0-100
- `shuffle`, `randomSample`

## Extensions Futures

Pour ajouter features :
1. **Nouveau bonus/joker** : ajouter effet dans `*-applier.ts`
2. **Nouveau combo** : ajouter pattern dans `combo-detector.ts`
3. **Mode manual** : implémenter `manual-runner.ts` avec callbacks
4. **Visualisation live** : stream `SimulationStep` vers UI

