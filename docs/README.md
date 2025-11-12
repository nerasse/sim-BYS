# Documentation Technique - Simulateur BYS

Application fullstack de simulation de machine à sous roguelike.  
**Outil professionnel de game design** pour configurer et tester des mécaniques via **presets**.

## Structure Documentation

### [00-OVERVIEW.md](./00-OVERVIEW.md)
Vue d'ensemble complète de l'application.
- Stack technique
- **Architecture presets**
- Fonctionnalités principales
- Workflow typique
- Commandes essentielles

### [01-DATABASE.md](./01-DATABASE.md)
Architecture de la base de données.
- **18 tables** (presets + configs)
- Schéma complet
- Queries organisées
- Seeds et migrations

### [02-SIMULATION-ENGINE.md](./02-SIMULATION-ENGINE.md)
Moteur de simulation (cœur de l'application).
- 14 modules indépendants
- Types centralisés
- **Intégration presets**
- Algorithmes détaillés

### [03-UI-ROUTES.md](./03-UI-ROUTES.md)
Interface utilisateur et routing.
- **Routes presets** (home, config, stats)
- Pages détaillées (loaders, actions)
- Composants UI (shadcn/ui)
- Patterns Remix

### [04-DEVELOPMENT.md](./04-DEVELOPMENT.md)
Guide de développement.
- Setup projet
- Scripts npm
- **Workflow presets**
- Conventions
- Debug et déploiement

### [../REFACTORING-NOTES.md](../REFACTORING-NOTES.md)
Notes sur l'architecture presets.
- Refactoring complété
- Code legacy conservé
- Refactoring futur optionnel

## Accès Rapide

### Pour Comprendre l'App
1. Lire `00-OVERVIEW.md` (vue d'ensemble + presets)
2. Consulter `02-SIMULATION-ENGINE.md` (logique métier)
3. Parcourir `01-DATABASE.md` (données)

### Pour Développer
1. Setup : `04-DEVELOPMENT.md`
2. Identifier le domaine (DB / Engine / UI)
3. Consulter la doc correspondante
4. **Comprendre système presets** : REFACTORING-NOTES.md

### Pour Utiliser (Game Design)
1. **Sélectionner preset** → `/` (home)
2. **Accéder config** → Bouton "Configurer" ou icône ⚙️ navbar
3. **Config symboles** → `/config/symbols`
4. **Config combos** → `/config/combos`
5. **Config niveaux** → `/config/levels`
6. **Config boutique** → `/config/shop-rarities`
7. **Simuler** → `/simulator`
8. **Analyser** → `/stats?preset=<id>`

## Fonctionnalités Clés

### 🎨 Système de Presets
- **Sélection** : Page d'accueil dédiée
- **Preset actif** : Un seul actif à la fois
- **Isolation** : Chaque preset a ses propres configs
- **CRUD** : Créer, dupliquer, modifier, supprimer
- **Favoris et tags** : Organisation

### ✏️ Configuration par Preset
- **Symboles** : Poids, valeurs, multiplicateurs
- **Combinaisons** : Multiplicateurs, activer/désactiver
- **Niveaux** : Objectifs et récompenses
- **Boutique** : Probabilités raretés
- **Objets** : Bonus/jokers disponibles par niveau

### 🎰 Simulation
- Grille 5×3, 9 symboles, 11 combos
- **Utilise preset actif**
- Mode auto avec batch
- Système d'ascension (0-20+)

### 📊 Statistiques
- **Filtrage par preset**
- **Comparaison** entre presets
- Stats par ascension
- Historique détaillé

## Workflow Presets

### Créer et Configurer
```
1. Page d'accueil → "Créer preset"
2. Preset créé avec configs par défaut
3. Automatiquement activé
4. Accès config via bouton "Configurer" ou icône ⚙️
5. Éditer dans /config/*
6. Sauvegardes automatiques
```

### Simuler et Analyser
```
1. /simulator utilise preset actif
2. Configs chargées depuis preset
3. Run sauvegardée avec presetId
4. /stats filtre par preset
5. Comparaison entre presets
```

### Itérer
```
1. Dupliquer preset pour variante
2. Modifier configs
3. Comparer résultats
4. Choisir meilleur preset
```

## Use Cases

### Game Design
```
1. Créer preset "Balance V1"
2. Tweaker poids symboles
3. Ajuster objectifs niveaux
4. Simuler 1000 runs
5. Dupliquer → "Balance V2"
6. Modifier multiplicateurs combos
7. Comparer V1 vs V2
8. Itérer
```

### Test Économie
```
1. Créer preset "Économie Test"
2. Configurer probabilités boutique
3. Limiter jokers disponibles
4. Simuler progression 1-1 → 7-3
5. Analyser gains moyens
6. Ajuster récompenses niveaux
```

### Validation Mécaniques
```
1. Créer preset "Test Bonus X"
2. Configurer disponibilité bonus
3. Limiter à certains niveaux
4. Tester impact sur success rate
5. Ajuster valeurs
```

## Architecture Technique

### Stack
- React 18 + Remix 2 + TypeScript
- SQLite + Drizzle ORM
- Tailwind CSS + shadcn/ui + Lucide React

### Principes
- **Architecture presets** : Isolation complète
- **Séparation moteur/UI** : Simulation découplée
- **Type safety** : TypeScript strict
- **Performance** : Pure functions, cache

### Structure
```
app/
├── routes/           # Pages (home = presets)
├── lib/simulation/   # Moteur (14 modules)
├── db/               # Database (18 tables)
├── components/       # UI components
└── root.tsx          # Loader preset actif
```

## Commandes Essentielles

```bash
# Développement
npm install           # Install dependencies
npm run dev           # Dev server
npm run typecheck     # Vérifier TypeScript

# Base de données
npm run db:push       # Sync schema
npm run db:seed       # Peupler + créer preset par défaut
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
| `app/routes/_index.tsx` | Home = sélection presets |
| `app/routes/presets.tsx` | Gestion presets (liste) |
| `app/routes/resources.object-selections.*` | Sélections objets par niveau |
| `app/routes/config.*.tsx` | Config par preset |
| `app/routes/simulator.tsx` | Simulateur preset actif |
| `app/db/schema.ts` | Schéma DB (23 tables) |
| `app/lib/simulation/` | Moteur (14 modules) |
| `app/contexts/modal-context.tsx` | Modale globale |
| `REFACTORING-NOTES.md` | Notes architecture |

## Constants Clés

- Grille : **5×3** (15 cellules)
- Symboles : **9** (5 basiques, 3 premium, 1 bonus)
- Combinaisons : **11** types
- Niveaux : **21** (7 mondes × 3 stages)
- Tables : **18** (dont 7 pour presets)
- Max chance : **90%** (100% = jackpot)
- Max bonus équipés : **3**
- Shop slots : **4**
- Intérêts : **+1$/5$**, cap **+10$**

## État Actuel

**Version** : 2.0.0  
**Statut** : Production Ready  
**Architecture** : Presets  

**Complet** :
- ✅ Système presets fonctionnel
- ✅ Configuration isolée par preset
- ✅ Simulation avec preset actif
- ✅ Stats par preset
- ✅ Navigation avec indicateur preset
- ✅ Protection routes sans preset
- ✅ Config objets par niveau
- ✅ Documentation complète

**Legacy conservé** :
- Tables globales `levelConfigs`, `shopRarityConfigs` (pour cache)
- `configCache` (performance simulation)
- Voir REFACTORING-NOTES.md pour détails

## Pour un Agent IA

### Workflow Modification
1. **Contexte** : Lire `00-OVERVIEW.md`
2. **Localiser** : Identifier fichier(s) via docs
3. **Comprendre** : Lire code du fichier
4. **Modifier** : Appliquer changements
5. **Vérifier** : `npm run typecheck`

### Exemple : "Ajouter config dans preset"
1. Lire `01-DATABASE.md` section presets
2. Ajouter table `preset*Config` dans schema
3. Créer queries dans `db/queries/`
4. Créer route `config.*.tsx`
5. Ajouter dans sidebar `config.tsx`
6. `npm run db:push && npm run db:reset`

## Support & Resources

- Documentation interne : `docs/`
- Notes refactoring : `REFACTORING-NOTES.md`
- Code source : `app/`
- Database : `data/game.db`
- Remix : https://remix.run
- Drizzle : https://orm.drizzle.team
