# 🎰 Simulateur BYS - Plan d'Architecture Complet

## 📋 Vue d'ensemble

Application fullstack de simulation de machine à sous type roguelike avec progression, boutique, bonus, jokers et système d'ascension pour difficulté progressive.

---

## 🛠️ Stack Technique

### Frontend/UI
- **React 18** (pur, pas de framework custom)
- **Remix** (fullstack framework, routing + loaders/actions)
- **TypeScript** (type-safety complète)
- **shadcn/ui** (composants UI de qualité)
- **Tailwind CSS** (styling)
- **Recharts** (graphiques et visualisations)
- **Lucide React** (icônes)

### Backend/Data
- **SQLite** (base de données locale, fichier unique)
- **Drizzle ORM** (type-safe, simple, excellent DX)
- **better-sqlite3** (driver synchrone rapide)

### Dev Tools
- **Vite** (build tool, intégré dans Remix)
- **ESLint + Prettier** (formatage et linting)
- **tsx** (execution TypeScript)

---

## 🎚️ Système d'Ascension

### Concept
Système de difficulté progressive inspiré de Slay the Spire. Après avoir complété une run (atteindre niveau 7-3), le joueur peut choisir de recommencer en **Ascension suivante**.

### Mécaniques

**Progression** :
- Ascension 0 (par défaut) : difficulté normale
- Ascension 1, 2, 3... jusqu'à Ascension 20 (ou plus)
- Chaque ascension débloquée après succès de l'ascension précédente

**Effets par niveau d'ascension** :

1. **Sur les objectifs de niveau** :
   - Ascension 0 : objectifs normaux
   - Ascension 1+ : objectifs × (1 + ascension × 0.15)
   - Exemple : Niveau 1-1 demande 100 jetons normalement
     - Ascension 1 : 115 jetons
     - Ascension 5 : 175 jetons
     - Ascension 10 : 250 jetons

2. **Sur la boutique (raretés)** :
   - **Diminue** les jokers communs
   - **Augmente** les jokers rares/épiques/légendaires
   
   ```
   Ascension 0 (normal) :
   - Commun: 70%, Peu commun: 25%, Rare: 5%
   
   Ascension 5 :
   - Commun: 50%, Peu commun: 30%, Rare: 15%, Épique: 5%
   
   Ascension 10 :
   - Commun: 30%, Peu commun: 35%, Rare: 25%, Épique: 8%, Légendaire: 2%
   
   Ascension 15 :
   - Commun: 15%, Peu commun: 30%, Rare: 35%, Épique: 15%, Légendaire: 5%
   
   Ascension 20 :
   - Commun: 5%, Peu commun: 20%, Rare: 40%, Épique: 25%, Légendaire: 10%
   ```

3. **Sur les prix boutique** (optionnel) :
   - Ascension 5+ : prix jokers +10%
   - Ascension 10+ : prix jokers +25%
   - Ascension 15+ : prix jokers +50%

4. **Sur les récompenses** (optionnel) :
   - Ascension élevée : bonus proposés ont raretés plus élevées
   - Compense la difficulté accrue

**Interface** :
- Sélection ascension au début de la simulation
- Indicateur ascension toujours visible pendant simulation
- Écran de fin : proposition "Monter en Ascension X+1"

**Base de données** :
- Stocker ascension max débloquée par joueur
- Historique runs par ascension
- Stats par niveau d'ascension

**Déblocage d'ascension** :
```typescript
// Après une run réussie (atteindre endLevel, ex: 7-3)
function onRunCompleted(runResult: SimulationResult, currentProgress: PlayerProgress) {
  if (runResult.success && runResult.completedFully) {
    const nextAscension = runResult.ascension + 1
    
    // Débloquer ascension suivante si pas déjà débloquée
    if (nextAscension > currentProgress.maxAscensionUnlocked) {
      updatePlayerProgress({
        maxAscensionUnlocked: nextAscension
      })
      
      // UI : Afficher notification + bouton "Essayer Ascension [X+1]"
    }
  }
}
```

---

## 📁 Structure du Projet

```
sim-BYS/
├── app/
│   ├── routes/                           # Routes Remix (pages)
│   │   ├── _index.tsx                   # Dashboard principal
│   │   ├── config.tsx                   # Layout config
│   │   ├── config.symbols.tsx           # Config symboles
│   │   ├── config.combos.tsx            # Config combinaisons  
│   │   ├── config.bonuses.tsx           # Config bonus
│   │   ├── config.jokers.tsx            # Config jokers
│   │   ├── config.characters.tsx        # Config personnages
│   │   ├── simulator.tsx                # Simulateur principal
│   │   ├── simulator.results.$id.tsx    # Résultats d'une simulation
│   │   ├── stats.tsx                    # Statistiques globales
│   │   └── presets.tsx                  # Gestion des presets
│   │
│   ├── components/                       # Composants React
│   │   ├── ui/                          # shadcn components (button, card, etc.)
│   │   │
│   │   ├── layout/                      # Layout components
│   │   │   ├── nav-bar.tsx
│   │   │   ├── side-panel.tsx
│   │   │   └── page-header.tsx
│   │   │
│   │   ├── grid/                        # Composants grille slot
│   │   │   ├── slot-grid.tsx           # Grille 5x3 principale
│   │   │   ├── symbol-cell.tsx         # Cellule symbole
│   │   │   ├── combo-overlay.tsx       # Surbrillance combos
│   │   │   └── animation-layer.tsx     # Animations
│   │   │
│   │   ├── simulation/                  # Composants simulation
│   │   │   ├── sim-control-panel.tsx   # Panneau contrôle
│   │   │   ├── sim-state-display.tsx   # Affichage état
│   │   │   ├── sim-history-log.tsx     # Log historique
│   │   │   ├── shop-interface.tsx      # Interface boutique
│   │   │   ├── bonus-selector.tsx      # Sélection bonus
│   │   │   └── level-indicator.tsx     # Indicateur niveau
│   │   │
│   │   ├── results/                     # Composants résultats
│   │   │   ├── stats-overview.tsx
│   │   │   ├── run-comparison.tsx
│   │   │   ├── charts/
│   │   │   │   ├── progression-chart.tsx
│   │   │   │   ├── distribution-chart.tsx
│   │   │   │   └── heatmap-chart.tsx
│   │   │   └── run-detail-viewer.tsx
│   │   │
│   │   └── config/                      # Composants configuration
│   │       ├── symbol-editor.tsx
│   │       ├── combo-visualizer.tsx
│   │       ├── bonus-card.tsx
│   │       ├── joker-card.tsx
│   │       └── preset-manager.tsx
│   │
│   ├── lib/                             # Business logic (coeur de l'app)
│   │   │
│   │   ├── persistence/                 # Gestion progression persistante
│   │   │   ├── player-progress.ts      # Gestion ascension débloquée, stats
│   │   │   └── unlock-manager.ts       # Logique déblocage ascensions
│   │   │
│   │   ├── simulation/                  # 🎯 MOTEUR DE SIMULATION (indépendant)
│   │   │   ├── engine.ts               # Moteur principal
│   │   │   ├── types.ts                # Types de simulation
│   │   │   │
│   │   │   ├── core/                   # Logique core slot
│   │   │   │   ├── grid-generator.ts   # Génération grille 5x3
│   │   │   │   ├── combo-detector.ts   # Détection des 11 combos
│   │   │   │   ├── calculator.ts       # Calculs gains
│   │   │   │   └── deduplication.ts    # Algo déduplication symboles
│   │   │   │
│   │   │   ├── game-logic/             # Logique de jeu
│   │   │   │   ├── level-manager.ts    # Gestion niveaux (1-1 → X-X)
│   │   │   │   ├── bonus-applier.ts    # Application effets bonus
│   │   │   │   ├── joker-applier.ts    # Application effets jokers
│   │   │   │   ├── shop-manager.ts     # Logique boutique
│   │   │   │   ├── progression.ts      # XP / Level up
│   │   │   │   └── rewards.ts          # Calcul récompenses
│   │   │   │
│   │   │   └── runners/                # Modes de simulation
│   │   │       ├── auto-runner.ts      # Mode automatique
│   │   │       ├── manual-runner.ts    # Mode manuel
│   │   │       └── batch-runner.ts     # Multiple runs (stats)
│   │   │
│   │   ├── game/                        # État de jeu
│   │   │   ├── game-state.ts           # État global du jeu
│   │   │   ├── character-system.ts     # Système personnages
│   │   │   ├── bonus-system.ts         # Système bonus (équipés, level up)
│   │   │   └── joker-system.ts         # Système jokers
│   │   │
│   │   └── utils/                       # Utilitaires
│   │       ├── probability.ts          # Calculs proba
│   │       ├── formatting.ts           # Formatage nombres
│   │       ├── validation.ts           # Validation données
│   │       └── constants.ts            # Constantes globales
│   │
│   ├── db/                              # Base de données
│   │   ├── schema.ts                   # Schéma Drizzle (tables)
│   │   ├── client.ts                   # Client DB
│   │   ├── queries/                    # Queries organisées
│   │   │   ├── symbols.ts
│   │   │   ├── combos.ts
│   │   │   ├── bonuses.ts
│   │   │   ├── jokers.ts
│   │   │   ├── characters.ts
│   │   │   ├── presets.ts
│   │   │   ├── simulations.ts
│   │   │   └── progress.ts             # Queries progression (ascension)
│   │   │
│   │   └── seed/                       # Données initiales
│   │       ├── seed.ts                 # Script seed principal
│   │       ├── symbols.seed.ts
│   │       ├── combos.seed.ts
│   │       ├── bonuses.seed.ts
│   │       └── jokers.seed.ts
│   │
│   ├── styles/                          # Styles globaux
│   │   └── global.css
│   │
│   └── root.tsx                         # Root component Remix
│
├── drizzle/                             # Migrations Drizzle
│   └── migrations/
│
├── data/                                # Données persistantes
│   └── game.db                         # Fichier SQLite
│
├── public/                              # Assets statiques
│   └── favicon.ico
│
├── scripts/                             # Scripts utilitaires
│   ├── reset-db.ts
│   └── export-preset.ts
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── drizzle.config.ts
├── remix.config.js
├── .eslintrc.js
└── README.md
```

---

## 🎨 Organisation des Routes (Onglets)

### 1. Dashboard (`/`)
**Objectif** : Vue d'ensemble et point d'entrée

**Contenu** :
- Stats rapides (nombre de simulations, taux de succès moyen)
- Accès rapide au simulateur
- Dernières simulations lancées
- Presets favoris

---

### 2. Configuration (`/config/*`)

Layout partagé avec navigation latérale entre sous-sections.

#### 2.1 Symboles (`/config/symbols`)
**Gestion des 9 symboles**

**Données éditables** :
- Nom du symbole (10, J, Q, K, A, P1, P2, P3, B)
- Poids de base (probabilité d'apparition)
- Valeur de base (pour calcul gains)
- Multiplicateur de base
- Type (basique / premium / bonus)
- Icône/couleur

**Affichage** :
- Tableau récapitulatif
- Graphique circulaire des probabilités
- Preview grille avec distribution actuelle

#### 2.2 Combinaisons (`/config/combos`)
**Configuration des 11 types de combinaisons**

**Données éditables** :
- Nom (H3, V3, D3, H4, H5, V, V bis, Tri, Oeil, Jackpot)
- Multiplicateur de base
- Activé/désactivé
- Description
- Pattern visuel

**Affichage** :
- Liste avec cards
- Visualisation du pattern (grille 5x3 avec symboles exemple)
- Ordre de détection (rappel de l'algo)

#### 2.3 Bonus (`/config/bonuses`)
**Bibliothèque des bonus disponibles**

**Types de bonus** :
- Bonus de départ (4 types)
- Bonus de partie (12+ types)

**Données éditables** :
- Nom
- Description
- Rareté (Commun, Peu commun, Rare, Épique, Légendaire)
- Effet(s)
- Scaling par level (valeur de base, increment)
- Level max (selon rareté)
- Conditions d'obtention

**Interface** :
- Filtres par rareté/type
- Cards avec preview effets
- Formulaire création/édition bonus custom

#### 2.4 Jokers (`/config/jokers`)
**Bibliothèque des jokers disponibles**

**Données éditables** :
- Nom
- Description
- Rareté
- Prix de base
- Effet(s)
- Tags (multiplicateur, chance, shop, etc.)

**Interface** :
- Filtres par rareté/tag
- Cards avec preview effets
- Formulaire création/édition joker custom

#### 2.5 Personnages (`/config/characters`)
**Gestion des personnages jouables**

**Données éditables** :
- Nom
- Description
- Effet passif
- Bonus de départ unique
- Stat de base (chance, multiplicateurs, etc.)
- Scaling par niveau
- Conditions de déblocage

**Interface** :
- Cards personnages
- Preview des effets
- Stats comparées

---

### 3. Simulateur (`/simulator`)
**Interface principale de simulation**

#### Layout 3 colonnes :

**Colonne gauche (30%) : Configuration de Run**

**Bloc 1 : Setup**
- Sélection personnage (dropdown avec preview)
- Sélection bonus de départ (3 choix)
- **Sélection ascension** (slider 0-20 ou input, affiche max débloqué)
- Preset (charger une config sauvegardée)

**Bloc 2 : Paramètres de simulation**
- Niveaux à simuler :
  - Niveau de départ (1-1 par défaut)
  - Niveau d'arrivée (7-3 par défaut, ∞ possible)
- Budget initial ($ de départ)
- Mode de simulation :
  - **Auto** : tout automatique (achats, choix bonus auto)
  - **Pas-à-pas** : pause à chaque décision (boutique, bonus)
- Nombre de runs (1 à 10000)
  - Si > 1 : mode batch pour stats
- Affichage impact ascension :
  - Preview objectifs niveau 1-1, 1-2, etc.
  - Preview raretés boutique

**Bloc 3 : Actions**
- Bouton "Lancer la simulation"
- Bouton "Pause" (si en cours)
- Bouton "Reset"
- Bouton "Sauvegarder config"

---

**Colonne centrale (50%) : Simulation Live**

**Bloc 1 : État actuel**
- Niveau actuel (ex: 2-2 BOSS)
- Spin actuel / Total (ex: 3/5)
- Phase (SPIN / SHOP / CHOIX BONUS)

**Bloc 2 : Ressources**
- Jetons accumulés / Objectif
- Dollars disponibles
- XP / Niveau personnage

**Bloc 3 : Grille 5×3**
- Affichage des symboles
- Animation lors des spins
- Surbrillance des combos détectés
- Indicateur Wilds/Bonus

**Bloc 4 : Bonus & Jokers équipés**
- 3 slots bonus (avec niveau actuel de chaque)
- N slots jokers (liste scrollable)
- Preview rapide effets actifs

**Bloc 5 : Résultat du spin**
- Combos détectés (liste)
- Calcul des gains (détaillé)
- Total jetons gagnés ce spin

---

**Colonne droite (20%) : Logs & Actions**

**Historique (scrollable)** :
- Log de chaque spin :
  - Grille générée
  - Combos trouvés
  - Gains
- Log des achats boutique
- Log des choix bonus
- Log level up

**Actions contextuelles** :
Si en mode pas-à-pas, affiche les choix :

**En boutique** :
- Liste jokers disponibles (avec prix)
- Bouton "Acheter"
- Bouton "Reroll" (coût)
- Bouton "Skip" (passer)

**Choix bonus** :
- 3 cartes bonus proposées
- Bouton "Reroll" (1 fois max)
- Sélectionner 1 bonus
- Si 3 déjà équipés : choisir lequel remplacer
- **Bouton "Skip" : garder ses 3 bonus actuels (ne prendre aucun nouveau)**

**Level up** :
- Affichage palier atteint
- Bonus/stat gagnée

---

### 4. Résultats (`/simulator/results/:id`)
**Analyse d'une simulation terminée**

**Section 1 : Résumé**
- Succès / Échec
- Niveau final atteint
- **Ascension jouée**
- Jetons totaux gagnés
- Dollars finaux
- Durée simulation
- Configuration utilisée (personnage, bonus, jokers)
- **Si succès complet (7-3) :** 
  - Badge "RUN COMPLÉTÉE"
  - **Bouton "Monter en Ascension [X+1]"** (lance nouvelle simulation)
  - Affichage des nouveaux modificateurs ascension suivante

**Section 2 : Statistiques (si multiple runs)**
- Nombre de runs
- Taux de réussite (%)
- Niveau moyen atteint
- Gain moyen
- Écart-type
- Min / Max

**Section 3 : Graphiques**
- **Progression des jetons** (ligne au fil des niveaux)
- **Distribution des gains** (histogramme)
- **Heatmap symboles** (fréquence apparition)
- **Heatmap combos** (fréquence déclenchement)
- **Évolution de la chance** (ligne)

**Section 4 : Runs détaillés**
Onglets :
- Top 3 (meilleures runs)
- Bottom 3 (pires runs)
- Moyennes (3 runs proches de la moyenne)

Pour chaque run :
- Timeline niveau par niveau
- Achats effectués
- Bonus choisis
- Stats finales
- Bouton "Rejouer cette config"

**Section 5 : Replay**
- Visualisation pas-à-pas d'une run spécifique
- Navigation spin par spin
- Affichage grilles + combos

---

### 5. Statistiques globales (`/stats`)
**Méta-analyse de toutes les simulations**

**Section 1 : Overview**
- Nombre total de simulations
- Taux de succès global
- Niveau moyen final
- **Ascension max débloquée**
- Top personnage (plus joué / meilleur winrate)
- Top bonus
- Top jokers

**Section 2 : Statistiques par Ascension**
- Sélecteur ascension (0-max débloqué)
- Pour l'ascension sélectionnée :
  - Nombre de runs
  - Taux de succès
  - Niveau moyen atteint
  - Temps moyen de run
  - Graphique distribution des résultats

**Section 3 : Comparaisons**
- Winrate par personnage (graphique barres)
- Winrate par bonus de départ
- Corrélation bonus équipés ↔ succès
- Impact jokers spécifiques
- **Winrate par ascension** (courbe)

**Section 4 : Optimisation**
- Suggestions (basées sur stats) :
  - "Le bonus X a 15% plus de succès que Y"
  - "Les runs avec joker Z atteignent en moyenne 2 niveaux de plus"
  - "En ascension 10+, le personnage Y performe 20% mieux"
- Synergies détectées (bonus + jokers)

**Section 5 : Heatmaps**
- Fréquence symboles (global ou par ascension)
- Fréquence combos (global ou par ascension)
- Distribution gains par niveau

---

### 6. Presets (`/presets`)
**Gestion des configurations sauvegardées**

**Interface** :
- Liste des presets (cards)
- Filtres (personnage, difficulté, tags custom)
- Actions :
  - Créer nouveau preset
  - Éditer
  - Dupliquer
  - Supprimer
  - Exporter (JSON)
  - Importer (JSON)

**Contenu d'un preset** :
- Nom
- Description
- Tags
- Configuration complète :
  - Personnage
  - Bonus de départ
  - Config symboles (poids custom)
  - Config combos (multis custom)
  - Paramètres simulation

**Presets par défaut** :
- "Facile" : chance +10%, objectifs -30%
- "Normal" : valeurs de base
- "Difficile" : chance -10%, objectifs +50%
- "Chaos" : poids symboles randomisés
- "Pure Luck" : pas de jokers/bonus

---

## 🗄️ Schéma de Base de Données

### Tables principales

#### `symbols`
```typescript
{
  id: string (primary)
  name: string              // "10", "J", "Q", etc.
  type: enum                // "basic" | "premium" | "bonus"
  baseWeight: number        // Poids de base (probabilité)
  baseValue: number         // Valeur de base
  baseMultiplier: number    // Multiplicateur de base
  icon: string              // URL ou emoji
  color: string             // Hex color
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `combinations`
```typescript
{
  id: string (primary)
  name: string              // "H3", "V3", etc.
  displayName: string       // "Horizontal 3"
  pattern: json             // Positions grille 5x3
  baseMultiplier: number
  detectionOrder: number    // Ordre dans l'algo (1-11)
  isActive: boolean
  description: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `bonuses`
```typescript
{
  id: string (primary)
  name: string
  description: string
  type: enum                // "starting" | "game"
  rarity: enum              // "common" | "uncommon" | "rare" | "epic" | "legendary"
  effects: json             // Array d'effets
  baseValue: number         // Valeur de base effet
  scalingPerLevel: number   // Increment par level
  maxLevel: number          // Selon rareté
  obtainCondition: string
  isDestructible: boolean   // Se détruit après usage
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `jokers`
```typescript
{
  id: string (primary)
  name: string
  description: string
  rarity: enum
  basePrice: number
  effects: json             // Array d'effets
  tags: json                // Array de strings
  sellValue: number         // Prix revente
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `characters`
```typescript
{
  id: string (primary)
  name: string
  description: string
  passiveEffect: json
  startingBonus: string     // ID bonus unique
  baseStats: json           // Stats de départ
  scalingPerLevel: json     // Scaling
  unlockCondition: string
  isUnlocked: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `presets`
```typescript
{
  id: string (primary)
  name: string
  description: string
  tags: json
  characterId: string (foreign key)
  startingBonusId: string (foreign key)
  ascension: number         // Niveau d'ascension
  symbolsConfig: json       // Config poids custom
  combosConfig: json        // Config multis custom
  simulationParams: json
  isFavorite: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `player_progress`
```typescript
{
  id: string (primary)
  maxAscensionUnlocked: number    // Ascension max débloquée
  totalRunsCompleted: number
  totalRunsAttempted: number
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `simulation_runs`
```typescript
{
  id: string (primary)
  presetId: string (foreign key, nullable)
  characterId: string (foreign key)
  ascension: number         // Niveau d'ascension (0-20+)
  mode: enum                // "auto" | "manual"
  iterations: number        // Nombre de runs
  startLevel: string        // "1-1"
  endLevel: string          // "7-3"
  
  // Résultats globaux
  successRate: number
  avgFinalLevel: string
  avgTokens: number
  avgDollars: number
  completedFully: boolean   // true si atteint endLevel
  
  status: enum              // "running" | "completed" | "failed"
  duration: number          // ms
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `simulation_steps`
```typescript
{
  id: string (primary)
  runId: string (foreign key)
  iterationIndex: number    // Si multiple runs
  stepIndex: number
  stepType: enum            // "spin" | "shop" | "bonus_choice" | "levelup"
  level: string             // "2-1"
  
  // État avant
  tokensBefore: number
  dollarsBefore: number
  
  // Action
  grid: json                // Grille 5x3 générée (si spin)
  combosDetected: json      // Combos trouvés
  tokensGained: number
  purchasedJoker: string    // ID (si shop)
  chosenBonus: string       // ID (si bonus)
  
  // État après
  tokensAfter: number
  dollarsAfter: number
  
  timestamp: timestamp
}
```

#### `global_stats`
```typescript
{
  id: string (primary)
  totalSimulations: number
  totalRuns: number
  globalSuccessRate: number
  symbolFrequencies: json   // Heatmap symbols
  comboFrequencies: json    // Heatmap combos
  topCharacter: string
  topBonus: string
  topJoker: string
  lastUpdated: timestamp
}
```

---

## ⚙️ Moteur de Simulation (Architecture détaillée)

### Principes
- **Indépendant** : peut tourner sans UI (tests, batch)
- **Pur** : fonctions sans effets de bord (sauf logs)
- **Testable** : chaque module isolé
- **Type-safe** : types stricts TypeScript

---

### Types principaux (`lib/simulation/types.ts`)

```typescript
// Configuration d'une simulation
type SimulationConfig = {
  character: Character
  startingBonus: Bonus
  equippedBonuses: Bonus[]      // Max 3
  equippedJokers: Joker[]
  
  symbolsConfig: SymbolConfig[]
  combosConfig: ComboConfig[]
  
  ascension: number             // Niveau d'ascension (0-20+)
  startLevel: LevelId           // "1-1"
  endLevel: LevelId             // "7-3"
  startingDollars: number
  
  mode: "auto" | "manual"
  iterations: number            // Pour batch
}

// État du jeu à un instant T
type GameState = {
  ascension: number             // Niveau d'ascension
  currentLevel: LevelId
  currentSpin: number
  totalSpins: number
  
  tokens: number
  dollars: number
  
  playerLevel: number
  playerXP: number
  
  equippedBonuses: EquippedBonus[]  // Avec niveau
  equippedJokers: Joker[]
  
  bonusActive: boolean          // Mode bonus actif
  bonusSpinsRemaining: number
  
  chance: number                // Chance globale actuelle
  
  // Modifiers dynamiques
  symbolWeights: Record<SymbolId, number>
  symbolValues: Record<SymbolId, number>
  comboMultipliers: Record<ComboId, number>
}

// Résultat d'un spin
type SpinResult = {
  grid: Grid5x3                 // Symboles générés
  combosDetected: DetectedCombo[]
  tokensGained: number
  bonusTriggered: boolean
}

// Combo détecté
type DetectedCombo = {
  comboType: ComboId
  symbolId: SymbolId
  positions: Position[]         // Positions grille
  multiplier: number
  tokensGained: number
}

// Résultat complet simulation
type SimulationResult = {
  success: boolean
  finalLevel: LevelId
  finalTokens: number
  finalDollars: number
  
  history: SimulationStep[]     // Historique complet
  stats: SimulationStats
}
```

---

### Modules principaux

#### 1. `engine.ts` - Moteur principal

**Fonction principale** :
```typescript
function runSimulation(config: SimulationConfig): SimulationResult
```

**Responsabilités** :
- Initialiser l'état de jeu
- Orchestrer la boucle de jeu (niveaux → spins → boutique)
- Déléguer aux sous-modules
- Retourner résultat complet

**Pseudo-code** :
```
1. Init GameState depuis config
2. Pour chaque niveau (1-1 → endLevel) :
   a. Calculer objectif jetons niveau
   b. Pour chaque spin (1-5 ou +bonus) :
      - Générer grille (grid-generator)
      - Détecter combos (combo-detector)
      - Calculer gains (calculator)
      - Mettre à jour état
      - Logger step
   c. Fin niveau : calculer récompenses (rewards)
   d. Phase boutique (shop-manager)
   e. Si niveau boss : choix bonus
   f. Vérifier succès/échec
3. Retourner SimulationResult
```

---

#### 2. `core/grid-generator.ts` - Génération grille

**Fonction principale** :
```typescript
function generateGrid(
  symbolWeights: Record<SymbolId, number>,
  chance: number
): Grid5x3
```

**Responsabilités** :
- Générer grille 5×3 aléatoire selon probabilités
- Appliquer la "chance" globale
- Si chance = 100% : forcer Jackpot (grille mono-symbole)

**Pseudo-code** :
```
1. Si chance >= 100% :
   - Choisir symbole aléatoire
   - Remplir toute la grille avec ce symbole (Jackpot)
   - Return grid
   
2. Normaliser les poids (total = 100%)
3. Pour chaque case (15 total) :
   - Tirer random 0-100
   - Sélectionner symbole selon cumul poids
   - Appliquer boost chance (augmente proba combos)
4. Return grid
```

---

#### 3. `core/combo-detector.ts` - Détection combos

**Fonction principale** :
```typescript
function detectCombos(
  grid: Grid5x3,
  symbolValues: Record<SymbolId, number>,
  comboMultipliers: Record<ComboId, number>
): DetectedCombo[]
```

**Responsabilités** :
- Détecter les 11 types de combinaisons
- Appliquer algorithme de déduplication
- Gérer les Wilds (mode bonus)

**Algorithme** :
```
1. Vérifier Jackpot (full grid mono-symbole)
   - Si oui : cumule TOUTES les combos + bonus Jackpot
   - Return immédiatement

2. Init tableau symboles "disponibles" (15 cases à true)

3. Pour chaque type de combo (ordre : H3, V3, D3 → H4 → H5 → V → V bis → Tri → Oeil) :
   a. Chercher toutes les occurrences du pattern
   b. Pour chaque occurrence trouvée :
      - Vérifier si tous symboles encore "disponibles"
      - Si oui :
        * Ajouter combo détecté
        * Marquer symboles comme "utilisés"
      - Sinon : ignorer (déjà comptés)

4. Return liste combos détectés
```

**Patterns de détection** :
```typescript
// Exemple pattern H3
const H3_PATTERNS = [
  // Ligne 1
  [[0,0], [0,1], [0,2]],
  [[0,1], [0,2], [0,3]],
  [[0,2], [0,3], [0,4]],
  // Ligne 2
  [[1,0], [1,1], [1,2]],
  // etc.
]
```

---

#### 4. `core/calculator.ts` - Calculs gains

**Fonction principale** :
```typescript
function calculateGains(
  combos: DetectedCombo[],
  gameState: GameState
): number
```

**Responsabilités** :
- Calculer jetons gagnés depuis combos
- Appliquer multiplicateurs (bonus, jokers)

**Formule** :
```
Pour chaque combo :
  baseGain = symbolValue × comboMultiplier
  
Appliquer multiplicateurs de bonus équipés
Appliquer multiplicateurs de jokers
  
totalGain = sum(baseGain × multipliers)
```

---

#### 5. `core/deduplication.ts` - Algo déduplication

**Fonction utilitaire** :
```typescript
function markUsedPositions(
  availableGrid: boolean[][],
  positions: Position[]
): void
```

Marque les positions comme utilisées dans la grille.

---

#### 6. `game-logic/level-manager.ts` - Gestion niveaux

**Fonctions** :
```typescript
function getLevelObjective(level: LevelId, ascension: number): number
function getNextLevel(current: LevelId): LevelId
function isBossLevel(level: LevelId): boolean
function getLevelRewards(level: LevelId): Rewards
function getAscensionMultiplier(ascension: number): number
```

**Responsabilités** :
- Calculer objectif jetons par niveau **avec modificateur ascension**
- Progression des niveaux
- Identifier niveaux boss (X-3)
- Définir récompenses de fin de niveau

**Objectifs (base)** :
```
1-1 : 100 jetons
1-2 : 200 jetons
1-3 (boss) : 500 jetons (consommés)
2-1 : 1000 jetons
...
Scaling exponentiel
```

**Modificateur ascension** :
```typescript
multiplier = 1 + (ascension × 0.15)

// Exemples :
// Ascension 0 : ×1.0
// Ascension 1 : ×1.15
// Ascension 5 : ×1.75
// Ascension 10 : ×2.5
// Ascension 20 : ×4.0

objectif_final = objectif_base × multiplier
```

---

#### 7. `game-logic/bonus-applier.ts` - Application bonus

**Fonction principale** :
```typescript
function applyBonusEffects(
  bonuses: EquippedBonus[],
  gameState: GameState
): GameState
```

**Responsabilités** :
- Appliquer effets des bonus équipés
- Gérer level-up des bonus
- Modifier symbolWeights, symbolValues, comboMultipliers, chance, etc.

**Exemples d'effets** :
```
- Réduire poids P1,P2,P3 de X%
- Augmenter valeur 10,J,Q,K,A de X
- +X chance
- +X spins
- Multiplicateur de combo +X
- etc. (voir bonus.txt)
```

---

#### 8. `game-logic/joker-applier.ts` - Application jokers

**Fonction principale** :
```typescript
function applyJokerEffects(
  jokers: Joker[],
  gameState: GameState
): GameState
```

**Responsabilités** :
- Appliquer effets des jokers équipés
- Effets passifs (toujours actifs)
- Effets conditionnels (déclenchés par events)

**Exemples d'effets** :
```
- +X% poids symbole
- +X chance flat
- +X multiplicateur combo/symbole
- Re-rolls gratuits shop
- +X spins
- Conditions (si 10,J,Q connectent → +mult)
- etc. (voir jokers.txt)
```

---

#### 9. `game-logic/shop-manager.ts` - Boutique

**Fonctions** :
```typescript
function generateShopInventory(
  playerLevel: number,
  ascension: number,
  chance: number
): ShopItem[]

function getRarityDistribution(
  playerLevel: number,
  ascension: number
): RarityWeights

function purchaseJoker(
  joker: Joker,
  gameState: GameState
): GameState

function rerollShop(
  gameState: GameState,
  rerollCount: number
): { newInventory: ShopItem[], cost: number }
```

**Responsabilités** :
- Générer inventaire boutique (jokers + consommables)
- Gérer achats (déduire $)
- Gérer rerolls (coût exponentiel)
- **Ajuster raretés selon niveau/chance ET ascension**

**Raretés (base par niveau)** :
```
Niveau 1-X : 70% commun, 25% peu commun, 5% rare
Niveau 3-X : 40% commun, 40% peu commun, 15% rare, 5% épique
Niveau 5-X : 20% commun, 30% peu commun, 30% rare, 15% épique, 5% légendaire
```

**Modificateur ascension** :
```typescript
// Shift des raretés : moins de communs, plus de rares
function applyAscensionRarityShift(
  baseWeights: RarityWeights,
  ascension: number
): RarityWeights

// Formule :
// Pour chaque cran d'ascension :
//   - Commun : -3%
//   - Peu commun : +1%
//   - Rare : +1.5%
//   - Épique : +0.4%
//   - Légendaire : +0.1%
// (avec min/max pour éviter valeurs impossibles)

// Exemples (voir section Système d'Ascension pour détails complets)
```

**Prix (modificateur ascension optionnel)** :
```typescript
priceMultiplier = 1 + (Math.floor(ascension / 5) × 0.1)
// Ascension 0-4 : ×1.0
// Ascension 5-9 : ×1.1
// Ascension 10-14 : ×1.25
// etc.
```

---

#### 10. `game-logic/progression.ts` - XP / Level up

**Fonctions** :
```typescript
function addXP(
  currentXP: number,
  currentLevel: number,
  xpGained: number
): { newXP: number, newLevel: number, leveledUp: boolean }

function getLevelUpRewards(level: number): Rewards
```

**Responsabilités** :
- Gérer XP et level-up joueur
- Calculer paliers de bonus (niv 10, 20, 40, etc.)
- Appliquer scaling personnage

---

#### 11. `game-logic/rewards.ts` - Récompenses

**Fonction** :
```typescript
function calculateEndLevelRewards(
  level: LevelId,
  tokensGained: number,
  dollars: number
): Rewards

function generateBonusChoices(
  playerLevel: number,
  ascension: number,
  availableBonuses: Bonus[]
): [Bonus, Bonus, Bonus]
```

**Responsabilités** :
- Calculer $ reçus fin de niveau (flat + intérêts)
- Calculer XP reçue
- Générer choix de bonus (3 proposés) après boss ou palier level
- **Gérer option "skip bonus"** (garder bonus actuels)

**Intérêts** :
```
+1$ par tranche de 5$ possédés
Cap à +10$ (pour 50$ possédés)
```

**Choix bonus** :
```typescript
// 3 bonus proposés
// Le joueur peut :
// - Choisir 1 bonus (et remplacer un existant si déjà 3 équipés)
// - Choisir "skip" : ne prendre aucun nouveau bonus, garder les 3 actuels

type BonusChoice = 
  | { action: "select", bonus: Bonus, replaceIndex?: number }
  | { action: "skip" }
```

---

#### 12. `runners/auto-runner.ts` - Mode auto

**Fonction** :
```typescript
function runAutoSimulation(config: SimulationConfig): SimulationResult
```

**Responsabilités** :
- Automatiser les décisions :
  - Achats boutique (stratégie simple : acheter meilleur joker si assez de $)
  - Choix bonus (stratégie : prendre bonus avec meilleur scaling)
- Pas d'interaction utilisateur

---

#### 13. `runners/manual-runner.ts` - Mode manuel

**Fonction** :
```typescript
function runManualSimulation(
  config: SimulationConfig,
  onDecisionRequired: (decision: Decision) => Promise<Action>
): SimulationResult
```

**Responsabilités** :
- Pause aux points de décision
- Appeler callback pour récupérer action utilisateur
- Reprendre simulation après action

**Types de décisions** :
```typescript
type Decision = 
  | { type: "shop", inventory: ShopItem[], dollars: number }
  | { type: "bonus_choice", options: [Bonus, Bonus, Bonus], currentBonuses: EquippedBonus[] }

type Action =
  | { type: "shop_buy", itemId: string }
  | { type: "shop_reroll" }
  | { type: "shop_skip" }
  | { type: "bonus_select", bonusId: string, replaceIndex?: number }
  | { type: "bonus_skip" }  // NOUVEAU : skip le choix bonus
```

**Decisions** :
- Shop : acheter quoi, reroll, skip
- Bonus : lequel choisir, lequel remplacer, **ou skip (garder bonus actuels)**

---

#### 14. `runners/batch-runner.ts` - Multiple runs

**Fonction** :
```typescript
function runBatchSimulation(
  config: SimulationConfig,
  iterations: number,
  onProgress?: (current: number, total: number) => void
): BatchSimulationResult
```

**Responsabilités** :
- Lancer N simulations identiques (auto)
- Calculer statistiques agrégées :
  - Taux succès
  - Moyenne/min/max niveau final, jetons, etc.
  - Écart-type
- Callback progression pour UI

---

## 🎨 UI/UX Guidelines

### Design system
- **Theme** : Dark mode par défaut
- **Colors** :
  - Primary : bleu/violet (slot vibes)
  - Success : vert
  - Warning : orange
  - Error : rouge
  - Neutral : grays
- **Typography** : Inter ou similaire (lisible, moderne)
- **Spacing** : Tailwind scale (4, 8, 16, 24, 32...)

### Composants shadcn/ui utilisés
- Button, Card, Input, Select, Checkbox, Switch
- Tabs, Dialog, Sheet (side panels)
- Table, Badge, Progress, Separator
- Toast (notifications)
- Tooltip (explications)

### Animations
- Spins de la grille : rotation symboles
- Combos détectés : highlight glow
- Gains : counter animation
- Transitions douces entre états

### Responsive
- Desktop first (simulateur complexe)
- Mobile : version simplifiée (pas de 3 colonnes, tout vertical)

---

## 🔄 Workflow de développement

### Phase 1 : Setup projet
1. Init Remix app
2. Setup Tailwind + shadcn/ui
3. Setup Drizzle + SQLite
4. Structure dossiers

### Phase 2 : Base de données
1. Définir schéma Drizzle
2. Créer migrations
3. Seeds de données initiales (symboles, combos, bonus, jokers par défaut)
4. Queries de base

### Phase 3 : Moteur de simulation (indépendant)
1. Types (`types.ts`)
2. Grid generator
3. Combo detector (+ tests algo déduplication)
4. Calculator
5. Level manager
6. Bonus/Joker appliers
7. Shop manager
8. Rewards
9. Auto runner (tests simples)

### Phase 4 : Interface Configuration
1. Layout config avec navigation
2. Page symboles
3. Page combos
4. Page bonus
5. Page jokers
6. Page personnages

### Phase 5 : Interface Simulateur
1. Layout 3 colonnes
2. Panneau config run
3. Grille 5×3 avec affichage symboles
4. Panneau état (ressources, bonus, jokers)
5. Logs
6. Intégration moteur simulation (mode auto d'abord)
7. Mode pas-à-pas (boutique, choix bonus)

### Phase 6 : Résultats & Stats
1. Page résultats
2. Graphiques (Recharts)
3. Run detail viewer
4. Page stats globales
5. Comparaisons

### Phase 7 : Presets
1. CRUD presets
2. Export/Import JSON
3. Presets par défaut

### Phase 8 : Polish
1. Animations
2. Responsive
3. Loading states
4. Error handling
5. Tooltips & help texts

---

## 📦 Dependencies (package.json)

```json
{
  "dependencies": {
    "@remix-run/node": "^2.x",
    "@remix-run/react": "^2.x",
    "@remix-run/serve": "^2.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    
    "drizzle-orm": "^0.30.x",
    "better-sqlite3": "^9.x",
    
    "recharts": "^2.x",
    "lucide-react": "^0.x",
    
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "class-variance-authority": "^0.7.x"
  },
  "devDependencies": {
    "@remix-run/dev": "^2.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "@types/better-sqlite3": "^7.x",
    
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    
    "drizzle-kit": "^0.20.x",
    
    "eslint": "^8.x",
    "prettier": "^3.x",
    
    "tsx": "^4.x"
  }
}
```

---

## 🚀 Scripts npm

```json
{
  "scripts": {
    "dev": "remix dev",
    "build": "remix build",
    "start": "remix-serve build",
    "typecheck": "tsc",
    "lint": "eslint .",
    "format": "prettier --write .",
    
    "db:generate": "drizzle-kit generate:sqlite",
    "db:migrate": "drizzle-kit push:sqlite",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx app/db/seed/seed.ts",
    "db:reset": "tsx scripts/reset-db.ts"
  }
}
```

---

## 📝 Résumé des Fonctionnalités Clés

### ✅ Système d'Ascension
- **Difficulté progressive** : Ascension 0 → 20+
- **Impact sur objectifs** : multiplicateur ×(1 + asc × 0.15)
- **Impact sur boutique** : shift raretés (moins communs, plus rares)
- **Progression persistante** : déblocage automatique après succès
- **Stats par ascension** : tracking séparé pour chaque niveau

### ✅ Choix de Bonus Flexibles
- **3 bonus proposés** après boss / palier level
- **Option "Skip"** : garder ses 3 bonus actuels
- **Reroll 1 fois** : re-générer 3 nouvelles options
- **Remplacement** : si 3 équipés, choisir lequel remplacer

### ✅ Moteur de Simulation Robuste
- **Modes** : auto (AI décisions), manuel (joueur décide), batch (stats)
- **Indépendant** : séparé de l'UI, testable
- **Type-safe** : TypeScript strict
- **Modularisé** : 14 modules spécialisés

### ✅ Gestion Complète des Données
- **10 tables** : symbols, combos, bonuses, jokers, characters, presets, runs, steps, progress, stats
- **SQLite** : simple, rapide, fichier unique
- **Drizzle ORM** : type-safe, migrations gérées

### ✅ Interface Riche
- **6 onglets** : Dashboard, Config, Simulateur, Résultats, Stats, Presets
- **Visualisations** : graphiques (Recharts), grille animée, heatmaps
- **shadcn/ui** : composants de qualité, accessibles

---

## 🧪 Testing (optionnel, mais recommandé)

### Moteur simulation
Tests unitaires critiques :
- `grid-generator.test.ts` : vérifier probas, chance 100% = jackpot
- `combo-detector.test.ts` : vérifier détection patterns, déduplication
- `calculator.test.ts` : vérifier calculs gains
- `bonus-applier.test.ts` : vérifier effets bonus
- `joker-applier.test.ts` : vérifier effets jokers

Framework : Vitest (rapide, compatible Vite)

---

## 📝 Notes finales

### Modifications par rapport au plan initial

**Ajouts majeurs** :
1. ✅ **Système d'Ascension** (difficulté progressive 0-20+)
   - Impact sur objectifs, raretés boutique, prix
   - Progression persistante avec déblocage automatique
   - Stats tracking par ascension
   
2. ✅ **Option Skip Bonus**
   - Le joueur peut refuser les 3 bonus proposés
   - Garde ses bonus actuels s'il en est satisfait
   - Ajouté dans l'UI et le moteur (manual-runner)

**Modifications techniques** :
- Ajout table `player_progress` (ascension max débloquée)
- Ajout champ `ascension` dans `simulation_runs`, `presets`
- Ajout champ `completedFully` dans `simulation_runs`
- Module `lib/persistence/` pour gérer progression
- Fonctions moteur prennent paramètre `ascension` :
  - `getLevelObjective(level, ascension)`
  - `generateShopInventory(level, ascension, chance)`
  - `getRarityDistribution(level, ascension)`
- Type `Action` étendu avec `{ type: "bonus_skip" }`

### Séparation simulation / UI
Le moteur dans `lib/simulation/` est **totalement indépendant** :
- Pas d'imports React
- Pas d'accès DB direct (reçoit data en input)
- Peut tourner en Node pur (tests, CLI, workers)
- Facilite tests et refactoring

### Évolutivité
Architecture permet d'ajouter facilement :
- Nouveaux symboles
- Nouvelles combinaisons
- Nouveaux bonus/jokers
- Nouveaux personnages
- Modes de jeu (endless, challenge, etc.)
- **Nouveaux modificateurs d'ascension** (facilement extensible)

### Performance
- SQLite suffisant (pas de concurrent writes)
- Simulations batch = potentiellement lent (10000 runs)
  - Solution : Web Workers (futur)
  - Ou : batch côté serveur avec progress streaming

### Déploiement

**Configuration production** :
- **Domaine** : bys.kssimi.fr
- **Méthode** : Docker + Docker Compose
- **Reverse proxy** : Traefik (ou Nginx)
- **Persistence** : Volume host `/home/neras/appdata/bys/`

**Architecture Docker** :
```
Container sim-bys (Node 20)
├── Port : 3000
├── Volume : /home/neras/appdata/bys:/app/data
└── DB : /app/data/game.db
```

**Fichiers de déploiement** :
- `Dockerfile` : multi-stage build (base → deps → build → runner)
- `docker-compose.yml` : orchestration + labels Traefik
- `.dockerignore` : exclusions build
- Scripts de backup automatique (cron)

**Autres options** :
- **Fly.io** : excellent pour Remix + SQLite
- **Railway** : simple, supporte SQLite
- **Local** : juste `npm run dev`

---

**FIN DU PLAN D'ARCHITECTURE** 🎉

