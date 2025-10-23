# Base de Données - Architecture

## Technologie
- **SQLite** : Fichier unique `data/game.db`
- **ORM** : Drizzle (type-safe, migrations auto)
- **Driver** : better-sqlite3 (synchrone)

## Tables Principales

### Configuration de Jeu

#### `level_configs` (21 niveaux)
```typescript
{
  id: string (PK)
  levelId: string (unique) // "1-1", "1-2", etc.
  world, stage: number
  baseObjective: number     // Jetons requis (Ascension 0)
  dollarReward: number      // Dollars gagnés
  isBoss: boolean
}
```
**Usage** : Objectifs et récompenses de niveau configurables
**Ref** : `app/lib/utils/config-cache.ts`
**Notes** : 
- Objectifs ajustés automatiquement par ascension (×1.15/niveau)
- Récompenses avant intérêts
- Modifiable via UI `/config/levels`

#### `shop_rarity_configs` (7 mondes)
```typescript
{
  id: string (PK)
  world: number (unique)
  commonWeight, uncommonWeight, rareWeight: number
  epicWeight, legendaryWeight: number
}
```
**Usage** : Probabilités apparition jokers par rareté
**Ref** : `app/lib/simulation/game-logic/shop-manager.ts`
**Notes** :
- Poids ajustés automatiquement par ascension
- Modifiable via UI `/config/shop-rarities`

#### `symbols` (9 symboles)
```typescript
{
  id: string (PK)
  name, type: "basic"|"premium"|"bonus"
  baseWeight, baseValue, baseMultiplier: number
  icon, color: string
}
```
**Usage** : Génération grille, calcul gains
**Ref** : `app/db/seed/symbols.seed.ts`

#### `combinations` (11 types)
```typescript
{
  id: string (PK)
  name, displayName, description
  pattern: json (positions)
  baseMultiplier: number
  detectionOrder: number  // 1-11 (ordre détection)
  isActive: boolean
}
```
**Usage** : Détection combos dans grille
**Ref** : `combo-detector.ts`

#### `bonuses` (16 total)
```typescript
{
  id: string (PK)
  name, description
  type: "starting"|"game"
  rarity: "common"|"uncommon"|"rare"|"epic"|"legendary"
  effects: json[]
  baseValue, scalingPerLevel, maxLevel: number
  isDestructible: boolean
}
```
**Types** : 4 de départ + 12 de partie
**Ref** : `bonus-applier.ts`

#### `jokers` (25+ items)
```typescript
{
  id: string (PK)
  name, description
  rarity: enum
  basePrice, sellValue: number
  effects: json[]
  tags: string[]
}
```
**Usage** : Boutique, modificateurs permanents
**Ref** : `shop-manager.ts`

#### `characters` (3+ personnages)
```typescript
{
  id: string (PK)
  name, description
  passiveEffect: json
  startingBonus: string (FK)
  baseStats, scalingPerLevel: json
  unlockCondition: string
  isUnlocked: boolean
}
```

### Progression & Persistence

#### `player_progress`
```typescript
{
  id: "default_player"
  maxAscensionUnlocked: number  // 0-20+
  totalRunsCompleted, totalRunsAttempted: number
}
```
**Usage** : Déblocage ascensions, stats globales

#### `presets`
```typescript
{
  id: string (PK)
  name, description, tags: json
  characterId, startingBonusId: FK
  ascension: number
  symbolsConfig, combosConfig: json
  simulationParams: json
  isFavorite: boolean
}
```
**Usage** : Configs sauvegardées

#### `simulation_runs`
```typescript
{
  id: string (PK)
  presetId?, characterId: FK
  ascension: number
  mode: "auto"|"manual"
  iterations, startLevel, endLevel
  successRate, avgFinalLevel, avgTokens, avgDollars
  completedFully: boolean  // Atteint endLevel
  status: "running"|"completed"|"failed"
  duration: number (ms)
}
```
**Relations** : 1-N avec `simulation_steps`

#### `simulation_steps`
```typescript
{
  id: string (PK)
  runId: FK
  stepIndex, iterationIndex: number
  stepType: "spin"|"shop"|"bonus_choice"|"levelup"
  level: string
  tokensBefore, dollarsBefore
  grid: json (si spin)
  combosDetected: json
  tokensGained, purchasedJoker, chosenBonus
  tokensAfter, dollarsAfter
}
```
**Usage** : Historique détaillé, replay

#### `global_stats`
```typescript
{
  id: "global"
  totalSimulations, totalRuns
  globalSuccessRate: number
  symbolFrequencies, comboFrequencies: json
  topCharacter, topBonus, topJoker: string
}
```
**Usage** : Méta-analyse, heatmaps

## Cache de Configuration

### `configCache` (`app/lib/utils/config-cache.ts`)

Pour des performances optimales, les configurations de niveaux et de boutique sont **chargées en mémoire au démarrage** :

```typescript
// Chargement automatique côté serveur
await configCache.initialize();

// Utilisation
const objective = configCache.getLevelObjective("1-1", ascension);
const reward = configCache.getLevelReward("1-1");
const weights = configCache.getShopRarityWeights(world);
```

**Méthodes** :
- `getLevelObjective(levelId, ascension)` - Objectif avec multiplicateur ascension
- `getLevelReward(levelId)` - Récompense en dollars
- `isBossLevel(levelId)` - Check si boss (depuis DB)
- `getShopRarityWeights(world)` - Poids raretés pour un monde
- `reload()` - Recharger depuis DB (après modification UI)
- `updateLevelConfig(levelId)` - MAJ un seul niveau
- `updateShopRarityConfig(world)` - MAJ un seul monde

**Pourquoi ?** Éviter les requêtes DB pendant les simulations (perf critique).

## Queries Organisées

Chaque table a son fichier de queries :

```
db/queries/
├── level-configs.ts       # getAll, getLevelConfig, updateLevelConfig
├── shop-rarity-configs.ts # getAll, getByWorld, updateShopRarityConfig
├── symbols.ts             # getAllSymbols, getByType
├── combos.ts              # getActiveCombinations
├── bonuses.ts             # getStarting/Game, byRarity
├── jokers.ts              # getAll, byRarity
├── characters.ts          # getUnlocked
├── progress.ts            # get/update, unlockNextAscension
├── simulations.ts         # CRUD runs/steps
└── presets.ts             # CRUD presets
```

## Migrations

```bash
npm run db:push      # Sync schema → DB
npm run db:seed      # Populate données initiales
npm run db:reset     # Wipe + reseed
npm run db:studio    # UI Drizzle Studio
```

## Seed Data

Voir `app/db/seed/*.seed.ts` pour données initiales complètes.

## Relations Importantes

- `presets` → `characters`, `bonuses`
- `simulation_runs` → `characters`, `presets`
- `simulation_steps` → `simulation_runs`
- `characters` → `bonuses` (startingBonus)

## Indexation

Indexes automatiques sur :
- Primary keys
- Foreign keys
- `detectionOrder` (combos)
- `createdAt` (pour tri)

