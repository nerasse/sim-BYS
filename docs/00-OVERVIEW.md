# Vue d'Ensemble - Simulateur BYS

## Description

Application fullstack de simulation de machine à sous type roguelike avec système d'ascension, progression, boutique dynamique, bonus et jokers. **Outil professionnel de game design** permettant de configurer et tester toutes les mécaniques d'un jeu de gambling.

## Stack Technique

### Frontend
- **React 18** - Librairie UI
- **Remix 2** - Framework fullstack avec SSR
- **TypeScript** - Type-safety complète
- **Tailwind CSS** - Styling utility-first
- **shadcn/ui** - Composants UI (Radix primitives)
- **Lucide React** - Bibliothèque d'icônes (15+ icônes utilisées)

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

### Séparation Moteur/UI
Le moteur de simulation (`app/lib/simulation/`) est **100% découplé** de l'interface. Il peut fonctionner indépendamment de React/Remix.

### Type Safety
TypeScript strict activé. Drizzle génère automatiquement les types depuis le schéma de base de données.

### File-Based Routing
Remix utilise le routing basé sur les fichiers. Chaque fichier dans `app/routes/` = une route accessible.

## Fonctionnalités Principales

### 🎰 Simulation
- Moteur de simulation roguelike complet
- Grille 5×3 avec 9 symboles
- 11 types de combinaisons configurables
- Système de niveaux (7 mondes × 3 stages)
- Mode auto-run (batch de simulations)

### ⚙️ Configuration Totale
- **Symboles** : Poids, valeurs, multiplicateurs éditables
- **Combinaisons** : Multiplicateurs, actif/inactif
- **Niveaux** : Objectifs et récompenses personnalisables
- **Boutique** : Probabilités de raretés par monde
- **Tous les personnages débloqués** (outil de test)

### 💾 Système de Presets
- Sauvegarde de configurations complètes
- CRUD complet (créer, lire, supprimer)
- Chargement dans simulateur en 1 clic
- Gestion favoris et tags

### 📊 Système d'Ascension
- Difficulté progressive (0-20+)
- Objectifs × (1 + ascension × 0.15)
- Raretés boutique ajustées automatiquement
- Tracking séparé par niveau d'ascension

### 📈 Statistiques
- Stats globales et par ascension
- Historique des simulations
- Taux de succès et métriques
- Progression sauvegardée

## Structure de Données

### 12 Tables SQLite
```
symbols              - 9 symboles (basiques, premium, bonus)
combinations         - 11 types de combos
bonuses              - 16 bonus (4 départ + 12 partie)
jokers               - 25+ jokers avec effets
characters           - 3 personnages (tous débloqués)
level_configs        - 21 niveaux configurables
shop_rarity_configs  - 7 configurations boutique
player_progress      - Progression et ascension max
presets              - Configurations sauvegardées
simulation_runs      - Historique des simulations
simulation_steps     - Détails step-by-step
global_stats         - Statistiques agrégées
```

### Cache de Performance
Configurations chargées en mémoire au démarrage (`configCache`) pour éviter les requêtes DB pendant les simulations.

## Pages de l'Application

```
/                    - Dashboard avec stats overview
/config/symbols      - Config symboles (éditable)
/config/combos       - Config combinaisons (éditable)
/config/bonuses      - Config bonus
/config/jokers       - Config jokers
/config/characters   - Config personnages
/config/levels       - Config niveaux (éditable)
/config/shop-rarities - Config raretés boutique (éditable)
/simulator           - Interface de simulation
/stats               - Statistiques globales
/presets             - Gestion des presets
```

## Workflow Typique

### 1. Configuration
```
1. Ajuster poids symboles (/config/symbols)
2. Modifier multiplicateurs combos (/config/combos)
3. Tweaker objectifs de niveaux (/config/levels)
4. Ajuster probabilités boutique (/config/shop-rarities)
```

### 2. Test & Itération
```
1. Créer un preset de la config actuelle
2. Lancer simulation avec 100-1000 itérations
3. Analyser résultats (taux succès, niveaux atteints)
4. Ajuster config et créer nouveau preset
5. Comparer les résultats
```

### 3. Use Cases
- **Game Design** : Tester balances de jeu
- **Économie** : Simuler progression et gains
- **Probabilités** : Vérifier distribution RNG
- **Jokers/Bonus** : Tester synergies et effets

## Points Techniques Clés

### Modularité
14 modules de simulation indépendants et testables.

### Type Safety
Pas de `any`, types générés automatiquement de la DB.

### Performance
- Cache mémoire pour configs
- SQLite optimisé (single file)
- Simulations rapides (pure functions)

### Flexibilité
- Tout est éditable via UI
- Pas de valeurs hardcodées
- Extensible facilement

## Commandes Essentielles

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Build production
npm run start        # Serveur production

npm run db:push      # Sync schéma DB
npm run db:seed      # Peupler données
npm run db:reset     # Reset complet DB
npm run db:studio    # UI Drizzle Studio

npm run typecheck    # Vérification TypeScript
```

## État Actuel

**Version** : 1.3.0  
**Statut** : Production Ready - Outil professionnel de game design  
**Personnages** : Tous débloqués pour tests  
**Configuration** : 100% éditable via UI  
**Presets** : Système complet et fonctionnel
