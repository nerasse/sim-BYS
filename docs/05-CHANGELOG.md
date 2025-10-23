# Changelog - Historique des Modifications

## Version 1.2.0 (2025-10-23)

### ✨ UX: Remplacement Emojis par Lucide React

#### 🎨 Interface Professionnelle
- **Tous les emojis remplacés** par des icônes Lucide React
- **Navigation** : NavBar avec icônes claires
- **Configuration** : Sidebar avec icônes descriptives
- **Pages** : PageHeaders avec icônes contextuelles
- **Cards** : Icônes cohérentes dans tous les composants

#### 📦 Icônes Utilisées
- `LayoutDashboard` - Dashboard
- `Settings` - Configuration
- `Gamepad2` - Simulateur  
- `TrendingUp` - Statistiques
- `Save` - Presets
- `Shapes` - Symboles
- `Target` - Combinaisons
- `Gift` - Bonus
- `Sparkles` - Jokers
- `User` - Personnages
- `BarChart3` - Niveaux/Stats
- `Store` - Boutique
- `Info` - Informations
- `Play` - Actions

#### 🔧 Modifications Techniques
- **PageHeader** : Accepte maintenant `ReactNode` en plus de `string`
- **Import centralisé** : Lucide React déjà dans dependencies
- **Classes Tailwind** : Tailles cohérentes (`w-4 h-4`, `w-5 h-5`, `w-8 h-8`)
- **Layout** : `flex items-center gap-2` pour alignement

### 🎯 Bénéfices
- ✅ **Professionnel** : Plus d'emojis, design moderne
- ✅ **Accessible** : Icônes SVG scalables et lisibles
- ✅ **Cohérent** : Style uniforme dans toute l'app
- ✅ **Maintenable** : Bibliothèque standard avec +1000 icônes

---

## Version 1.1.0 (2025-10-23)

### 🔥 Refactoring Majeur : Migration DB Complète

#### 🗄️ Nouvelles Tables
- **`level_configs`** (21 niveaux) :
  - Objectifs de jetons configurables
  - Récompenses en dollars configurables
  - Flag boss level depuis DB
  - Plus de hardcoding dans `constants.ts`
  
- **`shop_rarity_configs`** (7 mondes) :
  - Poids raretés par monde
  - Probabilités jokers 100% configurables
  - Ajustements ascension automatiques

#### ⚡ Cache de Performance
- **`configCache`** (`app/lib/utils/config-cache.ts`) :
  - Chargement configs en mémoire au démarrage
  - Évite requêtes DB pendant simulations
  - Méthodes :
    - `getLevelObjective(levelId, ascension)` - avec multiplicateur
    - `getLevelReward(levelId)` - récompense $
    - `getShopRarityWeights(world)` - poids raretés
    - `reload()` - recharger après modifs UI
  - Auto-initialize côté serveur
  - Singleton pattern

#### 🎨 Nouvelles Routes UI
- **`/config/levels`** :
  - Gestion visuelle des 21 niveaux
  - Modification objectifs et récompenses
  - Groupement par monde
  - Sauvegarde instantanée
  
- **`/config/shop-rarities`** :
  - Configuration 7 mondes
  - Sliders poids raretés
  - Progress bars visuelles
  - Aperçu pourcentages temps réel

- **`/config`** (layout) :
  - Sidebar navigation entre sections
  - 7 sections config au total
  - Navigation active state

#### 🔄 Modules Modifiés
- **`level-manager.ts`** :
  - Utilise `configCache` au lieu de constantes hardcodées
  - `getLevelInfo()` lit depuis cache
  - `isLevelObjectiveMet()` dynamique
  
- **`shop-manager.ts`** :
  - `getRarityDistribution()` utilise cache
  - Poids boutique depuis DB
  - Plus de `BASE_SHOP_RARITY_WEIGHTS` hardcodé

- **`constants.ts`** :
  - Nettoyage complet
  - Suppression `LEVEL_OBJECTIVES`, `LEVEL_DOLLAR_REWARDS`
  - Suppression `BASE_SHOP_RARITY_WEIGHTS`
  - Conservation uniquement constantes système (grille, shop slots, etc.)
  - Notes vers `configCache` ajoutées

#### 📊 Database Queries
- **`level-configs.ts`** :
  - `getAllLevelConfigs()`
  - `getLevelConfig(levelId)`
  - `getLevelsByWorld(world)`
  - `updateLevelConfig(levelId, updates)`
  
- **`shop-rarity-configs.ts`** :
  - `getAllShopRarityConfigs()`
  - `getShopRarityConfigByWorld(world)`
  - `updateShopRarityConfig(world, weights)`

#### 🌱 Seeds
- **`level-configs.seed.ts`** : 21 niveaux (7 mondes × 3 stages)
- **`shop-rarity-configs.seed.ts`** : 7 configurations monde

#### 📚 Documentation Mise à Jour
- **`01-DATABASE.md`** :
  - Section nouvelles tables
  - Section Cache de Configuration
  - Mise à jour queries organisées
  
- **`03-UI-ROUTES.md`** :
  - Ajout routes `/config/levels` et `/config/shop-rarities`
  - Détails loaders/actions
  - Navigation config layout
  
- **`README.md`** :
  - Mise à jour version 1.1.0
  - Modifications récentes

### 🎯 Impact Fonctionnel
- ✅ **Zéro hardcoding** : Toutes les configs niveau/boutique en DB
- ✅ **Personnalisable** : Modification via UI sans toucher au code
- ✅ **Performant** : Cache mémoire pour simulations
- ✅ **Type-safe** : Drizzle génère types automatiquement
- ✅ **Maintenable** : Séparation claire data/code

### 🚀 Bénéfices
1. **Flexibilité** : Modifier objectifs/raretés sans recompiler
2. **Expérimentation** : Tester différentes balances facilement
3. **Scalabilité** : Ajouter mondes/niveaux via DB
4. **Performance** : Cache évite overhead DB pendant sims
5. **UX Admin** : Interface graphique pour game design

### 🔧 Compatibilité
- ✅ Rétrocompatible avec sims existantes
- ✅ Migration automatique via `db:reset`
- ✅ Pas de breaking changes pour l'utilisateur

### 📝 Scripts
- `npm run db:reset` - Recrée DB avec nouvelles tables
- `npm run db:seed` - Peuple configs
- Pas de migration manuelle nécessaire

---

## Version 1.0.0 (2025-01-23)

### ✨ Fonctionnalités Complètes

#### 🎯 Moteur de Simulation
- Génération grille 5×3 avec weighted random
- Détection 11 types de combos (H3, V3, D3, H4, H5, V, V_BIS, TRI, OEIL, JACKPOT, MULTI)
- Algorithme de déduplication des symboles
- Système d'ascension (0-20+) avec scaling objectifs
- Shop avec raretés dynamiques selon ascension/chance
- Calcul gains, XP, intérêts
- Support wilds et bonus mode

#### 🗄️ Base de Données
- 10 tables SQLite avec Drizzle ORM
- 9 symboles (5 basiques, 3 premium, 1 bonus)
- 11 combinaisons configurables
- 16 bonus (4 départ + 12 partie)
- 25+ jokers avec effets variés
- 3 personnages jouables
- Système de progression persistante
- Historique complet des simulations

#### 🎨 Interface Utilisateur
- Dashboard avec stats temps réel
- Pages configuration complètes :
  - Symboles avec distribution poids
  - Combinaisons avec ordre détection
  - Bonus avec effets et scaling
  - Jokers avec tags et prix
  - Personnages avec passifs
- Simulateur fonctionnel :
  - Configuration complète (personnage, bonus, ascension)
  - Exécution temps réel
  - Résultats détaillés avec stats
- Page statistiques :
  - Stats globales
  - Performance par ascension
  - Historique runs
- Page presets (structure CRUD)

#### 📚 Documentation
- Architecture technique complète (5 fichiers)
- Guide développement avec workflows
- Structure code détaillée
- Conventions et best practices
- Guide agent IA pour modifications

### 🛠️ Stack Technique
- React 18 + Remix 2
- TypeScript strict
- Tailwind CSS + shadcn/ui
- SQLite + Drizzle ORM
- Vite (build)
- Node.js 20+

### 📦 Modules Créés

#### Simulation (14 modules)
- `types.ts` - Types centralisés
- `engine.ts` - Orchestrateur principal
- `core/grid-generator.ts` - Génération grille
- `core/combo-detector.ts` - Détection combos
- `core/calculator.ts` - Calculs
- `core/deduplication.ts` - Déduplication
- `game-logic/level-manager.ts` - Niveaux
- `game-logic/bonus-applier.ts` - Bonus
- `game-logic/joker-applier.ts` - Jokers
- `game-logic/shop-manager.ts` - Shop
- `game-logic/rewards.ts` - Récompenses
- `game-logic/progression.ts` - XP
- `runners/auto-runner.ts` - Mode auto
- `runners/batch-runner.ts` - Batch (future)

#### Database (8 query modules)
- `symbols.ts`
- `combos.ts`
- `bonuses.ts`
- `jokers.ts`
- `characters.ts`
- `progress.ts`
- `simulations.ts`
- `presets.ts`

#### UI (15+ components)
- Layout : NavBar, PageHeader
- UI : Button, Card, Badge, Input, Progress, Separator
- Routes : 9 pages fonctionnelles

### 🎮 Fonctionnalités Clés

#### Système d'Ascension
- Difficulté progressive 0-20+
- Objectifs × (1 + asc × 0.15)
- Raretés shop modifiées (-3% common, +1.5% rare/niveau)
- Déblocage automatique après succès
- Tracking séparé par ascension

#### Détection Combos
- 11 patterns différents
- Déduplication stricte (symboles utilisés 1 fois)
- Support wilds
- Jackpot = grille mono-symbole
- Ordre détection configurable

#### Shop Dynamique
- Raretés basées sur niveau joueur
- Modificateur ascension
- Boost chance (légère augmentation hautes raretés)
- Prix ajustés par ascension
- Reroll coût exponentiel

### 📊 Statistiques
- ~60 fichiers créés
- ~8000+ lignes de code
- 9 pages fonctionnelles
- 10 tables DB
- 50+ items configurables

### 🔧 Configuration
- Future flags Remix v3 activés
- Alias `~` pour imports propres
- Dark mode par défaut
- Animations CSS custom
- Responsive (desktop first)

### 📝 Scripts npm
- `dev` - Serveur développement
- `build` - Build production
- `start` - Serveur production
- `typecheck` - Vérification TypeScript
- `db:push` - Sync schéma DB
- `db:seed` - Peupler données
- `db:reset` - Reset complet
- `db:studio` - UI Drizzle Studio

### 🚀 Déploiement
- Docker ready (Dockerfile + docker-compose)
- Reverse proxy Traefik configuré
- Volume persistent pour SQLite
- Multi-stage build optimisé

### ✅ Tests
- Structure prête pour Vitest
- Modules simulation isolés et testables
- Pas de tests implémentés (TODO)

### 📌 Notes Importantes
- Moteur simulation 100% découplé UI
- Type-safety complète (TypeScript strict)
- Pas de `any` dans le code
- Queries DB organisées par domaine
- Documentation exhaustive pour agents IA

### 🔜 Extensions Futures Suggérées
1. Mode manual simulation (pause aux décisions)
2. Visualisation grille 5×3 temps réel
3. Graphiques Recharts dans stats
4. Export/import presets JSON
5. Tests unitaires moteur
6. Mode endless (après 7-3)
7. Achievements
8. Replay animations
9. Mobile responsive complet
10. Multiplayer/leaderboards

---

**Version Release** : 1.0.0  
**Date** : 23 janvier 2025  
**Statut** : ✅ Production Ready  
**Auteur** : Développé pour projet BYS

