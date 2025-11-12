# Vue d'Ensemble - Simulateur BYS

## Description

Application fullstack de simulation de machine à sous type roguelike avec système d'ascension, progression, boutique dynamique, bonus et jokers. **Outil professionnel de game design** permettant de configurer et tester toutes les mécaniques via des **presets**.

## Stack Technique

### Frontend
- **React 18** - Librairie UI
- **Remix 2** - Framework fullstack SSR
- **TypeScript** - Type-safety complète
- **Tailwind CSS** - Styling utility-first
- **shadcn/ui** - Composants UI (Radix primitives)
- **Lucide React** - Bibliothèque d'icônes

### Backend & Data
- **SQLite** - Base de données locale (`data/game.db`)
- **Drizzle ORM** - ORM type-safe avec migrations
- **better-sqlite3** - Driver synchrone performant

### Dev Tools
- **Vite** - Build tool et dev server
- **TypeScript** - Compilation et vérification
- **ESLint** - Linting
- **Prettier** - Formatage de code

## Architecture

### Système de Presets
Architecture entièrement centrée sur les **presets**. Un preset contient toute la configuration d'une simulation :
- Poids et valeurs des symboles
- Multiplicateurs et activation des combos
- Objectifs et récompenses des niveaux
- Probabilités de raretés boutique
- Disponibilité des bonus/jokers par niveau

### Séparation Moteur/UI
Le moteur de simulation (`app/lib/simulation/`) est **100% découplé** de l'interface.

### Type Safety
TypeScript strict activé. Drizzle génère automatiquement les types depuis le schéma DB.

### File-Based Routing
Remix utilise le routing basé sur les fichiers. Chaque fichier dans `app/routes/` = une route.

## Fonctionnalités Principales

### 🎨 Système de Presets
- **Sélection de preset** : Page d'accueil dédiée
- **Preset actif** : Un seul preset actif à la fois
- **CRUD complet** : Créer, dupliquer, modifier, supprimer
- **Configuration isolée** : Chaque preset a ses propres configs
- **Favoris et tags** : Organisation facilitée

### ⚡ Système d'Effets (Hard-codés)
- **Bibliothèque hard-codée** : Effets liés au moteur de simulation
- **Lecture seule** : Pas de CRUD (modification = adaptation code simulation)
- **Référencés par** : Bonus, jokers, personnages
- **Sélection** : Dropdown dans objets pour utiliser effets existants

### ⚙️ Configuration par Preset
- **Symboles** : Poids, valeurs, multiplicateurs
- **Combinaisons** : Multiplicateurs, actif/inactif
- **Niveaux** : Objectifs et récompenses
- **Raretés boutique** : Probabilités par monde
- **Objets par niveau** : Bonus/jokers disponibles

### 🎰 Simulation
- Moteur roguelike complet
- Grille 5×3 avec 9 symboles
- 11 types de combinaisons configurables
- Système de niveaux (7 mondes × 3 stages)
- Mode auto-run avec batch simulations
- **Utilise le preset actif**

### 📊 Statistiques
- **Filtrage par preset** : Analysez chaque preset séparément
- **Comparaison** : Vue globale comparant tous les presets
- Stats par ascension
- Historique des simulations
- Taux de succès et métriques

### 📈 Système d'Ascension
- Difficulté progressive (0-20+)
- Objectifs × (1 + ascension × 0.15)
- Raretés boutique ajustées automatiquement
- Tracking séparé par niveau d'ascension

## Structure de Données

### Tables Principales (23 au total)

#### Configuration Globale
```
effects             - Effets hard-codés (lecture seule, liés simulation)
symbols             - 9 symboles (basiques, premium, bonus)
combinations        - 11 types de combos
bonuses             - 16 bonus (4 départ + 12 partie)
jokers              - 25+ jokers avec effets
characters          - Personnages (effets passifs + bonus départ multiples)
```

#### Système de Presets
```
presets                    - Métadonnées des presets
activePreset               - Preset actuellement actif (1 ligne)
presetSymbolConfigs        - Config symboles par preset
presetComboConfigs         - Config combos par preset
presetLevelConfigs         - Config niveaux par preset
presetShopRarityConfigs    - Config raretés par preset
presetBonusAvailability    - Bonus disponibles par niveau
presetJokerAvailability    - Jokers disponibles par niveau
```

#### Progression & Historique
```
playerProgress      - Progression globale
simulationRuns      - Historique simulations (avec presetId)
simulationSteps     - Détails step-by-step
globalStats         - Statistiques agrégées
```

#### Legacy (conservées pour cache)
```
levelConfigs        - Configs niveaux globales (cache)
shopRarityConfigs   - Configs raretés globales (cache)
```

## Pages de l'Application

```
/                                  - Home (sélection preset)
/presets                           - Gestion presets (liste)
/resources/object-selections       - Sélections objets (liste)
/resources/object-selections/:id   - Config objets par niveau
/config/*                          - Config preset (symboles, combos, niveaux, shop, settings)
/effects                           - Bibliothèque effets (lecture seule)
/resources/*                       - Bibliothèques (symboles, combos, bonus, jokers, personnages, niveaux)
/simulator                         - Simulation preset actif
/stats                             - Stats par preset
```

## Workflow Typique

### 1. Sélection de Preset
```
1. Page d'accueil affiche tous les presets
2. Créer un nouveau preset OU sélectionner un existant
3. Le preset devient actif
4. Navigation débloquée vers Config et Simulator
```

### 2. Configuration
```
1. Accès config via bouton "Configurer" ou icône ⚙️ navbar
2. Ajuster poids symboles (/config/symbols)
3. Modifier multiplicateurs combos (/config/combos)
4. Tweaker objectifs de niveaux (/config/levels)
5. Ajuster probabilités boutique (/config/shop-rarities)
```

### 3. Simulation & Analyse
```
1. Lancer simulation (/simulator) - utilise preset actif
2. Analyser résultats
3. Consulter stats du preset (/stats?preset=<id>)
4. Itérer sur la configuration
5. Comparer avec d'autres presets
```

### 4. Gestion des Presets
```
1. Dupliquer un preset pour tester des variantes
2. Marquer favoris pour accès rapide
3. Supprimer presets obsolètes
4. Switcher entre presets pour tests comparatifs
```

## Points Techniques Clés

### Modularité
14 modules de simulation indépendants et testables.

### Type Safety
Pas de `any`, types générés automatiquement de la DB.

### Performance
- Cache mémoire pour configs (legacy)
- SQLite optimisé (single file)
- Simulations rapides (pure functions)

### Flexibilité
- Tout est éditable par preset
- Isolation complète entre presets
- Extensible facilement

## Commandes Essentielles

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Build production
npm run start        # Serveur production

npm run db:push      # Sync schéma DB
npm run db:seed      # Peupler données (crée preset par défaut)
npm run db:reset     # Reset complet DB
npm run db:studio    # UI Drizzle Studio

npm run typecheck    # Vérification TypeScript
```

## État Actuel

**Version** : 2.0.0
**Statut** : Production Ready - Architecture Presets  
**Presets** : Système complet et fonctionnel
**Configuration** : 100% isolée par preset
**Navigation** : Indicateur preset actif
