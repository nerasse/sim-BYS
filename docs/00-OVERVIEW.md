# 🎰 Simulateur BYS - Vue d'Ensemble Technique

## Résumé
Application fullstack de simulation de slot machine roguelike avec système d'ascension, boutique, bonus et jokers. Moteur de simulation autonome découplé de l'UI.

## Stack Technique
- **Framework**: Remix 2 (React 18 + SSR + File-based routing)
- **UI**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Database**: SQLite + Drizzle ORM (type-safe)
- **Language**: TypeScript (strict mode)
- **Build**: Vite
- **Runtime**: Node.js 20+

## Architecture Globale

```
sim-BYS/
├── app/
│   ├── components/        # Composants React réutilisables
│   ├── db/               # Couche base de données
│   ├── lib/              # Business logic (moteur simulation)
│   ├── routes/           # Pages Remix (file-based routing)
│   └── styles/           # CSS global
├── data/                 # SQLite database file
├── drizzle/              # Migrations DB
└── scripts/              # Utilitaires CLI
```

## Principes de Design

### 1. Séparation des Préoccupations
- **Moteur de simulation** (`lib/simulation/`) : 100% découplé, pur TypeScript, testable
- **Base de données** (`db/`) : Queries isolées par domaine
- **UI** (`components/`, `routes/`) : Présentation uniquement

### 2. Type Safety
- Types stricts partout (pas de `any`)
- Schéma DB génère les types TypeScript
- Types de simulation définis dans `types.ts`

### 3. Performance
- Simulations synchrones (pas d'async inutile)
- SQLite avec WAL mode
- Batch simulations pour stats

## Flux de Données

```
User Input (UI)
    ↓
Remix Loader/Action
    ↓
Database Queries ←→ SQLite
    ↓
Simulation Engine (pure TS)
    ↓
Results
    ↓
UI Display
```

## Points d'Entrée Principaux

| Fichier | Rôle |
|---------|------|
| `app/root.tsx` | Layout principal, NavBar |
| `app/routes/_index.tsx` | Dashboard |
| `app/routes/simulator.tsx` | Interface simulation |
| `app/lib/simulation/engine.ts` | Moteur principal |
| `app/db/schema.ts` | Schéma DB complet |

## Concepts Clés

### Ascension
Système de difficulté progressive (0-20+) qui modifie :
- Objectifs niveau : ×(1 + asc × 0.15)
- Raretés boutique : moins communs, plus légendaires
- Déblocage automatique après succès

### Simulation
3 modes :
- **Auto** : IA décide tout
- **Manual** : Pause aux décisions (boutique, bonus)
- **Batch** : N runs pour stats

### Combos
11 types détectés avec **déduplication** (symboles utilisés une seule fois par spin).

## Configuration Requise

```bash
# Install
npm install

# DB Setup
npm run db:push
npm run db:seed

# Dev
npm run dev  # → http://localhost:3000
```

## Documentation Détaillée

Voir les fichiers suivants pour plus de détails :
- `01-DATABASE.md` : Schéma complet, relations
- `02-SIMULATION-ENGINE.md` : Architecture moteur
- `03-UI-ROUTES.md` : Pages et composants
- `04-DEVELOPMENT.md` : Guide dev, conventions

## Modifications Courantes

Pour modifier l'application, référez-vous à :
- Ajouter symbole/bonus/joker → `db/seed/*.seed.ts`
- Modifier logique simulation → `lib/simulation/*`
- Ajouter page → `routes/*.tsx`
- Modifier UI → `components/*`

