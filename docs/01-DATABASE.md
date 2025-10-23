# Base de Données

## Technologies

- **SQLite** - Fichier unique `data/game.db`
- **Drizzle ORM** - Type-safe avec migrations automatiques
- **better-sqlite3** - Driver synchrone performant

## Tables (12 au total)

### Configuration de Jeu

#### `symbols` (9 symboles)
```typescript
{
  id: string (PK)
  name: string
  type: "basic" | "premium" | "bonus"
  baseWeight: number       // Probabilité apparition
  baseValue: number        // Valeur de base
  baseMultiplier: number   // Multiplicateur
  icon: string            // Emoji/icône
  color: string           // Couleur hex
}
```
**Éditable** : `/config/symbols`  
**Usage** : Génération grille, calcul gains

#### `combinations` (11 types)
```typescript
{
  id: string (PK)
  name: string                // Code interne (H3, V3, etc.)
  displayName: string         // Nom affiché
  pattern: number[][]         // Positions dans grille 5×3
  baseMultiplier: number      // Multiplicateur de gain
  detectionOrder: number      // Ordre de détection (1-11)
  isActive: boolean           // Actif/inactif
  description: string
}
```
**Éditable** : `/config/combos`  
**Usage** : Détection combos dans grille

#### `bonuses` (16 total)
```typescript
{
  id: string (PK)
  name: string
  description: string
  type: "starting" | "game"
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  effects: json[]             // Array d'effets
  baseValue: number
  scalingPerLevel: number     // Scaling par niveau
  maxLevel: number            // Level cap (selon rareté)
  isDestructible: boolean
}
```
**Types** : 4 de départ + 12 de partie  
**Usage** : Récompenses, bonus équipés

#### `jokers` (25+)
```typescript
{
  id: string (PK)
  name: string
  description: string
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  basePrice: number
  sellValue: number
  effects: json[]
  tags: string[]
}
```
**Usage** : Shop, effets permanents

#### `characters` (3 personnages)
```typescript
{
  id: string (PK)
  name: string
  description: string
  passiveEffect: json         // Effet passif
  startingBonus: string       // FK vers bonuses
  baseStats: json             // Chance, multiplicateur
  scalingPerLevel: json       // Scaling stats
  isUnlocked: boolean         // Tous à true (simulateur)
}
```
**Note** : Tous débloqués pour tests

#### `level_configs` (21 niveaux)
```typescript
{
  id: string (PK)
  levelId: string (unique)    // "1-1", "1-2", etc.
  world: number
  stage: number
  baseObjective: number       // Jetons requis (Ascension 0)
  dollarReward: number        // $ gagnés
  isBoss: boolean            // Stage 3 = boss
}
```
**Éditable** : `/config/levels`  
**Usage** : Objectifs ajustés automatiquement par ascension  
**Formule** : `objective = baseObjective × (1 + ascension × 0.15)`

#### `shop_rarity_configs` (7 mondes)
```typescript
{
  id: string (PK)
  world: number (unique)
  commonWeight: number
  uncommonWeight: number
  rareWeight: number
  epicWeight: number
  legendaryWeight: number
}
```
**Éditable** : `/config/shop-rarities`  
**Usage** : Probabilités d'apparition jokers par rareté  
**Note** : Poids ajustés automatiquement par ascension

### Progression & Historique

#### `player_progress`
```typescript
{
  id: string (PK)
  maxAscensionUnlocked: number    // Ascension max débloquée
  totalRunsCompleted: number
  totalRunsAttempted: number
}
```
**Usage** : Progression globale du joueur

#### `presets`
```typescript
{
  id: string (PK)
  name: string
  description: string
  tags: string[]
  characterId: string (FK)
  startingBonusId: string (FK)
  ascension: number
  symbolsConfig: json             // Record<string, number>
  combosConfig: json              // Record<string, number>
  simulationParams: json          // Config simulation
  isFavorite: boolean
}
```
**CRUD complet** : `/presets`  
**Usage** : Sauvegarder/restaurer configurations

#### `simulation_runs`
```typescript
{
  id: string (PK)
  presetId: string (FK, nullable)
  characterId: string (FK)
  ascension: number
  mode: "auto" | "manual"
  iterations: number
  startLevel: string
  endLevel: string
  successRate: number
  avgFinalLevel: string
  avgTokens: number
  avgDollars: number
  completedFully: boolean
  status: "running" | "completed" | "failed"
  duration: number (ms)
}
```
**Usage** : Historique et analytics

#### `simulation_steps`
```typescript
{
  id: string (PK)
  runId: string (FK)
  iterationIndex: number
  stepIndex: number
  stepType: "spin" | "shop" | "bonus_choice" | "levelup"
  level: string
  tokensBefore: number
  dollarsBefore: number
  grid: json (si spin)
  combosDetected: json
  tokensGained: number
  purchasedJoker: string
  chosenBonus: string
  tokensAfter: number
  dollarsAfter: number
}
```
**Usage** : Replay détaillé, analyse fine

#### `global_stats`
```typescript
{
  id: "global" (singleton)
  totalSimulations: number
  totalRuns: number
  globalSuccessRate: number
  symbolFrequencies: json
  comboFrequencies: json
  topCharacter: string
  topBonus: string
  topJoker: string
}
```
**Usage** : Dashboard, méta-analyse

## Cache de Configuration

### `configCache` (`app/lib/utils/config-cache.ts`)

**Pourquoi ?** Éviter les requêtes DB pendant les simulations (perf critique).

```typescript
// Chargé automatiquement au démarrage côté serveur
await configCache.initialize();

// Utilisation
const objective = configCache.getLevelObjective("1-1", ascension);
const reward = configCache.getLevelReward("1-1");
const weights = configCache.getShopRarityWeights(world);
```

**Méthodes** :
- `getLevelObjective(levelId, ascension)` - Objectif avec multiplicateur
- `getLevelReward(levelId)` - Récompense en dollars
- `isBossLevel(levelId)` - Check depuis DB
- `getShopRarityWeights(world)` - Poids raretés
- `reload()` - Recharger après modifications UI
- `updateLevelConfig(levelId)` - MAJ cache d'un niveau
- `updateShopRarityConfig(world)` - MAJ cache d'un monde

## Queries Organisées

```
db/queries/
├── level-configs.ts       - CRUD level configs
├── shop-rarity-configs.ts - CRUD shop configs
├── symbols.ts             - CRUD symboles
├── combos.ts              - CRUD combinaisons
├── bonuses.ts             - CRUD bonus
├── jokers.ts              - CRUD jokers
├── characters.ts          - CRUD personnages
├── progress.ts            - Get/update progression
├── presets.ts             - CRUD presets
└── simulations.ts         - CRUD runs/steps
```

## Seeds

Données initiales dans `db/seed/`:
- `symbols.seed.ts` - 9 symboles
- `combos.seed.ts` - 11 combinaisons
- `bonuses.seed.ts` - 16 bonus
- `jokers.seed.ts` - 25+ jokers
- `characters.seed.ts` - 3 personnages (tous débloqués)
- `level-configs.seed.ts` - 21 niveaux
- `shop-rarity-configs.seed.ts` - 7 configs monde

## Commandes

```bash
npm run db:push      # Synchroniser schéma → DB
npm run db:seed      # Peupler avec données initiales
npm run db:reset     # Vider + re-seed
npm run db:studio    # Interface Drizzle Studio
```

## Type Safety

Types générés automatiquement par Drizzle :
```typescript
import type { Symbol, Combination, Bonus, Joker, Character } from "~/db/schema";
```

Chaque table a ses types `Select` (lecture) et `Insert` (création).
