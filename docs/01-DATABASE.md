# Base de Données

## Technologies

- **SQLite** - Fichier unique `data/game.db`
- **Drizzle ORM** - Type-safe avec migrations automatiques
- **better-sqlite3** - Driver synchrone performant

## Architecture Presets

L'application utilise une architecture **centrée sur les presets**. Chaque preset contient sa propre configuration complète et isolée.

## Tables (18 au total)

### Configuration Globale (5 tables)

#### `symbols` (9 symboles)
```typescript
{
  id: string (PK)
  name: string
  type: "basic" | "premium" | "bonus"
  baseWeight: number       // Poids par défaut
  baseValue: number        // Valeur par défaut
  baseMultiplier: number   // Multiplicateur par défaut
  icon: string            // Emoji/icône
  color: string           // Couleur hex
}
```
**Usage** : Bibliothèque de symboles. Valeurs par défaut copiées dans les presets.

#### `combinations` (11 types)
```typescript
{
  id: string (PK)
  name: string                // Code interne (H3, V3, etc.)
  displayName: string         // Nom affiché
  pattern: number[][]         // Positions dans grille 5×3
  baseMultiplier: number      // Multiplicateur par défaut
  detectionOrder: number      // Ordre de détection (1-11)
  isActive: boolean           // Actif par défaut
  description: string
}
```
**Usage** : Bibliothèque de combos. Configs copiées dans les presets.

#### `bonuses` (16 total)
```typescript
{
  id: string (PK)
  name: string
  description: string
  type: "starting" | "game"
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  effects: json[]
  baseValue: number
  scalingPerLevel: number
  maxLevel: number
  isDestructible: boolean
}
```
**Types** : 4 de départ + 12 de partie  
**Usage** : Bibliothèque, disponibilité contrôlée par preset

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
**Usage** : Bibliothèque, disponibilité contrôlée par preset

#### `characters` (3 personnages)
```typescript
{
  id: string (PK)
  name: string
  description: string
  passiveEffect: json
  startingBonus: string       // FK vers bonuses
  baseStats: json
  scalingPerLevel: json
  isUnlocked: boolean         // Tous à true
}
```
**Note** : Tous débloqués pour tests

### Système de Presets (7 tables)

#### `presets` - Métadonnées
```typescript
{
  id: string (PK)
  name: string
  description: string
  tags: string[]
  isFavorite: boolean
}
```
**Usage** : Liste des presets, gestion CRUD

#### `activePreset` - Preset actif (singleton)
```typescript
{
  id: integer (PK) = 1        // Toujours 1
  presetId: string (FK)       // Preset actuellement actif
}
```
**Usage** : Tracking du preset en cours d'édition/simulation

#### `presetSymbolConfigs` - Configs symboles
```typescript
{
  id: string (PK)
  presetId: string (FK → cascade delete)
  symbolId: string (FK)
  weight: number              // Poids custom
  value: number               // Valeur custom
  multiplier: number          // Multiplicateur custom
}
```
**Usage** : Config symboles isolée par preset

#### `presetComboConfigs` - Configs combos
```typescript
{
  id: string (PK)
  presetId: string (FK → cascade delete)
  comboId: string (FK)
  multiplier: number          // Multiplicateur custom
  isActive: boolean          // Activation custom
}
```
**Usage** : Config combos isolée par preset

#### `presetLevelConfigs` - Configs niveaux
```typescript
{
  id: string (PK)
  presetId: string (FK → cascade delete)
  levelId: string            // "1-1", "1-2", etc.
  world: number
  stage: number
  baseObjective: number      // Jetons requis (Ascension 0)
  dollarReward: number       // $ gagnés
  isBoss: boolean           // Stage 3 = boss
}
```
**Usage** : Objectifs/récompenses custom par preset  
**Formule** : `objective = baseObjective × (1 + ascension × 0.15)`

#### `presetShopRarityConfigs` - Configs raretés
```typescript
{
  id: string (PK)
  presetId: string (FK → cascade delete)
  world: number
  commonWeight: number
  uncommonWeight: number
  rareWeight: number
  epicWeight: number
  legendaryWeight: number
}
```
**Usage** : Probabilités raretés custom par preset

#### `presetBonusAvailability` - Disponibilité bonus
```typescript
{
  id: string (PK)
  presetId: string (FK → cascade delete)
  bonusId: string (FK)
  availableFrom: string      // "1-3", "2-3", etc. (boss)
  availableUntil: string     // null = toujours après from
}
```
**Usage** : Contrôle quels bonus proposés en récompense

#### `presetJokerAvailability` - Disponibilité jokers
```typescript
{
  id: string (PK)
  presetId: string (FK → cascade delete)
  jokerId: string (FK)
  availableFrom: string      // "1-1", "1-2", etc.
  availableUntil: string     // null = toujours après from
}
```
**Usage** : Contrôle quels jokers en boutique

### Progression & Historique (4 tables)

#### `playerProgress`
```typescript
{
  id: string (PK)
  maxAscensionUnlocked: number
  totalRunsCompleted: number
  totalRunsAttempted: number
}
```

#### `simulationRuns`
```typescript
{
  id: string (PK)
  presetId: string (FK)      // ⭐ Lié au preset
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
  duration: number
}
```
**Usage** : Historique avec traçabilité preset

#### `simulationSteps`
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
  grid: json
  combosDetected: json
  tokensGained: number
  purchasedJoker: string
  chosenBonus: string
  tokensAfter: number
  dollarsAfter: number
}
```

#### `globalStats`
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

### Legacy (2 tables - conservées pour cache)

#### `levelConfigs` et `shopRarityConfigs`
Configs globales utilisées par le `configCache` du moteur de simulation.  
**Note** : À terme, le moteur devrait utiliser les configs preset directement.

## Queries Organisées

```
db/queries/
├── presets.ts                    - CRUD presets
├── active-preset.ts              - Get/set preset actif
├── preset-symbol-configs.ts      - CRUD configs symboles
├── preset-combo-configs.ts       - CRUD configs combos
├── preset-level-configs.ts       - CRUD configs niveaux
├── preset-shop-rarity-configs.ts - CRUD configs raretés
├── preset-bonus-availability.ts  - CRUD disponibilité bonus
├── preset-joker-availability.ts  - CRUD disponibilité jokers
├── symbols.ts                    - Bibliothèque symboles
├── combos.ts                     - Bibliothèque combos
├── bonuses.ts                    - Bibliothèque bonus
├── jokers.ts                     - Bibliothèque jokers
├── characters.ts                 - Bibliothèque personnages
├── progress.ts                   - Get/update progression
└── simulations.ts                - CRUD runs/steps
```

## Workflow de Données

### Création d'un Preset
```
1. createPreset(metadata)
2. Copie valeurs par défaut depuis tables globales
3. Initialise preset*Configs avec baseWeight, baseMultiplier, etc.
4. Preset prêt à être configuré
```

### Activation d'un Preset
```
1. setActivePreset(presetId)
2. Update table activePreset (singleton)
3. Routes /config/* chargent depuis ce preset
4. Simulateur utilise ce preset
```

### Simulation
```
1. Loader simulateur : requireActivePreset()
2. Charge configs depuis preset_*_configs
3. Lance simulation avec ces configs
4. Sauvegarde run avec presetId
```

### Statistiques
```
1. getSimulationRunsByPreset(presetId)
2. Calcule métriques spécifiques au preset
3. Comparaison entre presets possible
```

## Seeds

Données initiales dans `db/seed/`:
- `symbols.seed.ts` - 9 symboles
- `combos.seed.ts` - 11 combinaisons
- `bonuses.seed.ts` - 16 bonus
- `jokers.seed.ts` - 25+ jokers
- `characters.seed.ts` - 3 personnages
- `level-configs.seed.ts` - 21 niveaux
- `shop-rarity-configs.seed.ts` - 7 configs monde
- `preset-default.seed.ts` - **Preset par défaut + activation**

## Commandes

```bash
npm run db:push      # Sync schéma → DB
npm run db:seed      # Peupler + créer preset par défaut
npm run db:reset     # Vider + re-seed
npm run db:studio    # Interface Drizzle Studio
```

## Type Safety

Types générés automatiquement par Drizzle :
```typescript
import type { 
  Preset, 
  PresetSymbolConfig,
  PresetComboConfig,
  // etc.
} from "~/db/schema";
```

Chaque table a ses types `Select` (lecture) et `Insert` (création).
