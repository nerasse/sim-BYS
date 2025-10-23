# 📚 Documentation Technique - Simulateur BYS

Documentation complète de l'architecture et du fonctionnement de l'application.

## Structure de la Documentation

### [00-OVERVIEW.md](./00-OVERVIEW.md)
Vue d'ensemble technique de l'application.
- Stack technique
- Architecture globale
- Principes de design
- Flux de données
- Points d'entrée

### [01-DATABASE.md](./01-DATABASE.md)
Architecture de la base de données.
- Tables et schémas
- Relations
- Queries organisées
- Migrations et seeds

### [02-SIMULATION-ENGINE.md](./02-SIMULATION-ENGINE.md)
Moteur de simulation (cœur de l'application).
- Structure modulaire (14 modules)
- Algorithmes (génération, détection, calculs)
- État de jeu (GameState)
- Types et flux

### [03-UI-ROUTES.md](./03-UI-ROUTES.md)
Interface utilisateur et routing.
- Pages Remix (9 routes)
- Composants UI (shadcn/ui)
- Layout et navigation
- Styling (Tailwind)

### [04-DEVELOPMENT.md](./04-DEVELOPMENT.md)
Guide de développement.
- Setup et scripts
- Conventions de code
- Workflows courants
- Debug et déploiement

## Navigation Rapide

### Pour Comprendre l'App
1. Lire `00-OVERVIEW.md` (vue d'ensemble)
2. Parcourir `02-SIMULATION-ENGINE.md` (logique métier)
3. Consulter `01-DATABASE.md` (données)

### Pour Modifier l'App
1. Identifier le domaine (DB / Simulation / UI)
2. Consulter la doc correspondante
3. Suivre les workflows dans `04-DEVELOPMENT.md`

### Pour Ajouter une Feature
| Feature | Documentation | Fichiers |
|---------|---------------|----------|
| Nouveau symbole/bonus/joker | `01-DATABASE.md` → Seeds | `app/db/seed/*.seed.ts` |
| Modifier logique simulation | `02-SIMULATION-ENGINE.md` | `app/lib/simulation/*` |
| Ajouter une page | `03-UI-ROUTES.md` | `app/routes/*.tsx` |
| Nouveau composant UI | `03-UI-ROUTES.md` | `app/components/*` |
| Modifier schéma DB | `01-DATABASE.md` | `app/db/schema.ts` |

## Concepts Clés à Comprendre

### 1. Séparation Moteur/UI
Le moteur de simulation (`lib/simulation/`) est **100% découplé** de l'interface. Il peut tourner sans React/Remix.

### 2. Système d'Ascension
Difficulté progressive qui modifie objectifs (+15%/niveau) et raretés boutique. Voir `02-SIMULATION-ENGINE.md` section level-manager.

### 3. Déduplication Combos
Algorithme critique : symboles utilisés dans un combo ne peuvent plus être réutilisés. Voir `02-SIMULATION-ENGINE.md` section combo-detector.

### 4. File-Based Routing
Chaque fichier `routes/*.tsx` = page accessible. Voir `03-UI-ROUTES.md`.

### 5. Type Safety
TypeScript strict + Drizzle = types générés automatiquement de la DB vers le code.

## Références Rapides

### Commandes Essentielles
```bash
npm run dev          # Dev server
npm run db:reset     # Reset DB
npm run typecheck    # Vérif TS
```

### Fichiers Importants
- `app/lib/simulation/engine.ts` - Moteur principal
- `app/db/schema.ts` - Schéma DB complet
- `app/routes/simulator.tsx` - Interface simulation
- `app/lib/simulation/types.ts` - Types centralisés

### Constants
- Max chance : 90% (100% = jackpot garanti)
- Grille : 5×3 (15 cellules)
- Max bonus équipés : 3
- Intérêts : +1$/5$, cap +10$

## Workflow Agent IA

Pour un agent IA qui modifie l'app :

1. **Contexte initial** : Lire `00-OVERVIEW.md` + demander clarifications
2. **Localiser** : Identifier le(s) fichier(s) concerné(s) via la doc
3. **Lire le code** : Examiner le fichier identifié
4. **Modifier** : Appliquer les changements
5. **Vérifier** : `npm run typecheck` + tester

### Exemple : "Ajouter un nouveau bonus"

1. Lire `01-DATABASE.md` section bonuses
2. Ouvrir `app/db/seed/bonuses.seed.ts`
3. Ajouter l'objet dans `bonusesData`
4. Si nouvel effet : implémenter dans `app/lib/simulation/game-logic/bonus-applier.ts`
5. `npm run db:reset`
6. Tester via UI simulateur

## Modifications Récentes

Voir `05-CHANGELOG.md` pour l'historique complet des modifications.

### Dernière Mise à Jour (v1.2.0)
- ✨ **Icônes professionnelles** : Remplacement complet emojis par Lucide React
- 🎨 **UI moderne** : Design cohérent avec icônes SVG scalables
- 📦 **+15 icônes** : Navigation, configuration, pages, composants
- 🔧 **PageHeader amélioré** : Support ReactNode pour flexibilité

### Version précédente (v1.1.0)
- 🔥 **Migration DB complète** : Niveaux et raretés boutique en base de données
- ⚡ **Cache de config** : Performance optimale (configs en mémoire)
- 🎨 **Nouvelles routes UI** : `/config/levels` et `/config/shop-rarities`
- ✅ **Zéro hardcoding** : Toutes les configs éditables via UI
- 📊 **2 nouvelles tables** : `level_configs` (21) et `shop_rarity_configs` (7)
- 🔄 **Refactor moteur** : `level-manager` et `shop-manager` utilisent cache

### Version précédente (v1.0.0)
- ✅ Dashboard amélioré avec stats temps réel
- ✅ Loader données progress + runs récentes
- ✅ Interface plus dynamique et informative
- ✅ Section "Getting Started" pour nouveaux utilisateurs
- ✅ Stats overview (ascension, runs, succès)

## Maintenance

Cette documentation doit être mise à jour lors de :
- Ajout de modules majeurs
- Changements d'architecture
- Nouvelles conventions

**Dernier update** : 2025-10-23
**Version app** : 1.2.0 (Modern UI + Fully Configurable)

