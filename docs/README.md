# Documentation Technique - Simulateur BYS

Application fullstack de simulation de machine à sous roguelike.  
**Outil professionnel de game design** pour configurer et tester des mécaniques de gambling.

## Structure Documentation

### [00-OVERVIEW.md](./00-OVERVIEW.md)
Vue d'ensemble complète de l'application.
- Stack technique
- Architecture globale
- Fonctionnalités principales
- Workflow typique
- Commandes essentielles

### [01-DATABASE.md](./01-DATABASE.md)
Architecture de la base de données.
- 12 tables SQLite
- Schéma complet
- Cache de configuration
- Queries organisées
- Seeds et migrations

### [02-SIMULATION-ENGINE.md](./02-SIMULATION-ENGINE.md)
Moteur de simulation (cœur de l'application).
- 14 modules indépendants
- Types centralisés
- Algorithmes détaillés
- Game loop
- Runners

### [03-UI-ROUTES.md](./03-UI-ROUTES.md)
Interface utilisateur et routing.
- 11 routes Remix
- Pages détaillées (loaders, actions, display)
- Composants UI (shadcn/ui)
- Layout et navigation
- Patterns Remix

### [04-DEVELOPMENT.md](./04-DEVELOPMENT.md)
Guide de développement.
- Setup projet
- Scripts npm
- Structure code
- Conventions
- Workflows courants
- Debug et déploiement

## Accès Rapide

### Pour Comprendre l'App
1. Lire `00-OVERVIEW.md` (vue d'ensemble)
2. Consulter `02-SIMULATION-ENGINE.md` (logique métier)
3. Parcourir `01-DATABASE.md` (données)

### Pour Développer
1. Setup : `04-DEVELOPMENT.md`
2. Identifier le domaine (DB / Engine / UI)
3. Consulter la doc correspondante
4. Suivre les conventions de code

### Pour Utiliser (Game Design)
1. **Config symboles** → `/config/symbols` (poids, valeurs, multiplicateurs)
2. **Config combos** → `/config/combos` (multiplicateurs, actif/inactif)
3. **Config niveaux** → `/config/levels` (objectifs, récompenses)
4. **Config boutique** → `/config/shop-rarities` (probabilités raretés)
5. **Créer preset** → `/presets` (sauvegarder config)
6. **Simuler** → `/simulator` (charger preset, lancer)
7. **Analyser** → `/stats` (résultats, métriques)

## Fonctionnalités Clés

### ✏️ Configuration Complète
- **Symboles** : Poids, valeurs, multiplicateurs éditables
- **Combinaisons** : Multiplicateurs, activer/désactiver
- **Niveaux** : Objectifs et récompenses personnalisables
- **Boutique** : Probabilités de raretés par monde
- Tous les personnages débloqués (outil de test)

### 💾 Système de Presets
- Sauvegarde configurations complètes
- CRUD : Créer, lire, supprimer
- Chargement dans simulateur (URL : `/simulator?preset=<id>`)
- Favoris et tags

### 🎰 Simulation Avancée
- Grille 5×3, 9 symboles, 11 combos
- Système d'ascension (0-20+)
- Shop dynamique avec raretés ajustées
- Mode auto (IA simple)
- Batch de 1 à 10000 itérations

### 📊 Analytics
- Stats globales et par ascension
- Historique complet des simulations
- Taux de succès, niveaux atteints
- Métriques détaillées

## Use Cases

### Game Design
```
1. Tweaker poids symboles pour changer variance
2. Ajuster multiplicateurs combos pour balance
3. Modifier objectifs niveaux pour difficulté
4. Créer preset "Balance V2"
5. Simuler 1000 runs
6. Comparer avec "Balance V1"
7. Itérer
```

### Test Économie
```
1. Configurer probabilités boutique
2. Ajuster prix jokers (via DB)
3. Simuler progression 1-1 → 7-3
4. Analyser gains moyens
5. Vérifier équilibre
```

### Validation Mécaniques
```
1. Implémenter nouveau bonus/joker (via seed)
2. Configurer synergie avec combos
3. Tester impact sur success rate
4. Ajuster valeurs
```

## Architecture Technique

### Stack
- React 18 + Remix 2 + TypeScript
- SQLite + Drizzle ORM
- Tailwind CSS + shadcn/ui + Lucide React

### Principes
- **Séparation moteur/UI** : Simulation 100% découplée
- **Type safety** : TypeScript strict, types générés DB
- **Performance** : Cache configs, pure functions
- **Flexibilité** : Tout éditable via UI

### Structure
```
app/
├── routes/           # Pages Remix (11 routes)
├── lib/simulation/   # Moteur (14 modules)
├── db/               # Database (12 tables)
├── components/       # UI components
└── styles/           # Tailwind + custom
```

## Commandes Essentielles

```bash
# Développement
npm install           # Install dependencies
npm run dev           # Dev server
npm run typecheck     # Vérifier TypeScript

# Base de données
npm run db:push       # Sync schema
npm run db:seed       # Peupler données
npm run db:reset      # Reset complet
npm run db:studio     # UI Drizzle

# Production
npm run build         # Build
npm run start         # Serveur prod
docker-compose up -d  # Docker
```

## Fichiers Importants

| Fichier | Description |
|---------|-------------|
| `app/lib/simulation/engine.ts` | Orchestrateur simulation |
| `app/db/schema.ts` | Schéma DB complet (12 tables) |
| `app/lib/simulation/types.ts` | Types centralisés |
| `app/lib/utils/config-cache.ts` | Cache performance |
| `app/routes/config.symbols.tsx` | Config symboles éditable |
| `app/routes/config.combos.tsx` | Config combos éditable |
| `app/routes/presets.tsx` | CRUD presets |
| `app/routes/simulator.tsx` | Interface simulation |

## Constants Clés

- Grille : **5×3** (15 cellules)
- Symboles : **9** (5 basiques, 3 premium, 1 bonus)
- Combinaisons : **11** types
- Niveaux : **21** (7 mondes × 3 stages)
- Max chance : **90%** (100% = jackpot garanti)
- Max bonus équipés : **3**
- Shop slots : **4**
- Intérêts : **+1$/5$**, cap **+10$**

## État Actuel

**Version** : 1.3.0  
**Statut** : Production Ready  
**Type** : Outil professionnel de game design  

**Complet** :
- ✅ Configuration totale (symboles, combos, niveaux, boutique)
- ✅ Système presets fonctionnel (CRUD + chargement)
- ✅ Tous personnages débloqués
- ✅ Simulation avancée avec ascension
- ✅ Interface moderne avec Lucide React
- ✅ Documentation complète

## Pour un Agent IA

### Workflow Modification
1. **Contexte** : Lire `00-OVERVIEW.md`
2. **Localiser** : Identifier fichier(s) concerné(s) via doc
3. **Comprendre** : Lire code du fichier
4. **Modifier** : Appliquer changements
5. **Vérifier** : `npm run typecheck`

### Exemple : "Ajouter un symbole"
1. Lire `01-DATABASE.md` section symbols
2. Ouvrir `app/db/seed/symbols.seed.ts`
3. Ajouter objet dans `symbolsData`
4. `npm run db:reset`
5. Vérifier dans `/config/symbols`

### Exemple : "Modifier multiplicateur combo"
1. Aller sur `/config/combos`
2. Modifier valeur dans formulaire
3. Cliquer "Sauvegarder"
4. Tester dans `/simulator`

## Support & Resources

- Documentation interne : `docs/`
- Code source : `app/`
- Database : `data/game.db`
- Remix : https://remix.run
- Drizzle : https://orm.drizzle.team
