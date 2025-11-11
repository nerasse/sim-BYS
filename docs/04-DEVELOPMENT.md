# Guide de Développement

## Setup Initial

### Prérequis
- Node.js 20+
- npm ou pnpm

### Installation
```bash
git clone <repo>
cd sim-BYS
npm install
```

### Base de Données
```bash
npm run db:push      # Créer tables
npm run db:seed      # Peupler + créer preset par défaut
```

### Lancer l'app
```bash
npm run dev          # Dev server → http://localhost:3000
```

## Scripts npm

### Développement
```bash
npm run dev          # Remix dev server (Vite)
npm run typecheck    # Vérification TypeScript
```

### Base de Données
```bash
npm run db:push         # Sync schéma → SQLite
npm run db:seed         # Seed données + preset par défaut
npm run db:reset        # Reset complet (drop + seed)
npm run db:studio       # UI Drizzle Studio
```

### Production
```bash
npm run build        # Build app
npm run start        # Serveur production
```

## Structure Projet

```
sim-BYS/
├── app/
│   ├── routes/              # Pages Remix
│   │   ├── _index.tsx       # Sélection preset (home)
│   │   ├── config.tsx       # Layout config
│   │   ├── config.*.tsx     # Pages config
│   │   ├── simulator.tsx    # Simulateur
│   │   ├── stats.tsx        # Stats par preset
│   │   └── presets.tsx      # Gestion presets
│   │
│   ├── components/
│   │   ├── ui/              # shadcn/ui
│   │   ├── layout/          # NavBar, PageHeader
│   │   └── presets/         # PresetSelector
│   │
│   ├── lib/
│   │   ├── simulation/      # Moteur simulation
│   │   │   ├── types.ts     # Types centralisés
│   │   │   ├── engine.ts    # Orchestrateur
│   │   │   ├── core/        # Grid, combos, calc
│   │   │   ├── game-logic/  # Levels, shop, rewards
│   │   │   └── runners/     # Auto-runner
│   │   │
│   │   └── utils/           # Utilitaires
│   │       ├── constants.ts
│   │       ├── probability.ts
│   │       ├── config-cache.ts (legacy)
│   │       └── require-active-preset.ts
│   │
│   ├── db/
│   │   ├── schema.ts        # Schéma Drizzle (18 tables)
│   │   ├── client.ts        # DB client
│   │   ├── queries/         # Queries par domaine
│   │   └── seed/            # Seeds
│   │
│   └── root.tsx             # Root Remix + loader preset actif
│
├── data/
│   └── game.db              # Base SQLite
│
├── docs/                    # Documentation
├── REFACTORING-NOTES.md     # Notes architecture presets
```

## Conventions de Code

### TypeScript
- **Strict mode** activé
- Pas de `any` (utiliser `unknown` si besoin)
- Types explicites pour fonctions publiques

### Naming
- `camelCase` - variables, fonctions
- `PascalCase` - composants, types
- `SCREAMING_SNAKE_CASE` - constantes
- Fichiers : `kebab-case.tsx` ou `PascalCase.tsx`

### Imports
- Alias `~` pour imports depuis `app/`
- Grouper : React → Remix → DB → Components → Utils

## Workflows Courants

### Créer un Nouveau Preset
```bash
1. Page d'accueil → "Créer preset"
2. Preset créé avec configs par défaut
3. Automatiquement activé
4. Redirect vers /config
5. Éditer configs
```

### Modifier un Preset Existant
```bash
1. Sélectionner preset (devient actif)
2. Aller dans /config/*
3. Éditer configs (sauvegarde auto par formulaire)
4. Simuler pour tester
```

### Ajouter une Table DB
```bash
1. Éditer app/db/schema.ts
2. npm run db:push            # Sync schema
3. Créer queries dans app/db/queries/
4. Modifier seed si nécessaire
5. npm run db:reset           # Re-seed
```

### Ajouter une Route
```bash
1. Créer app/routes/new-route.tsx
2. Exporter loader/action si nécessaire
3. Ajouter dans NavBar si pertinent
4. Si route config : ajouter dans config.tsx sidebar
```

### Modifier le Moteur Simulation
```bash
1. Éditer modules dans app/lib/simulation/
2. Définir types dans types.ts
3. Intégrer dans engine.ts
4. Tester indépendamment
```

## Architecture Presets

### Preset Actif
Une seule ligne dans `activePreset` table :
```sql
id | presetId
1  | "abc123"
```

Chargée dans `root.tsx` et passée à NavBar.

### Isolation Configs
Chaque preset a ses propres rows dans :
- `presetSymbolConfigs`
- `presetComboConfigs`
- `presetLevelConfigs`
- `presetShopRarityConfigs`
- `presetBonusAvailability`
- `presetJokerAvailability`

### Protection Routes
Helper `requireActivePreset()` dans loader :
```typescript
export async function loader() {
  const presetId = await requireActivePreset();
  // → Redirect "/" si null
  // → Continue si preset actif
}
```

Utilisé dans :
- Toutes les routes `/config/*`
- `/simulator`

Non utilisé dans :
- `/` (home)
- `/stats` (accessible sans preset)
- `/presets` (accessible sans preset)

### Workflow de Données
```
User sélectionne preset
    ↓
setActivePreset(id)
    ↓
Routes config chargent preset_*_configs
    ↓
User édite → upsert dans tables preset
    ↓
Simulator charge configs preset
    ↓
runSimulation avec configs
    ↓
Sauvegarde run avec presetId
```

## Debug

### Logs
```typescript
console.log("Debug:", value);
```

### Drizzle Studio
```bash
npm run db:studio    # UI pour explorer DB
```

### TypeScript Errors
```bash
npm run typecheck
```

### Dev Server
Vite HMR (Hot Module Replacement) actif.

## Testing (à implémenter)

Structure prête pour Vitest :
```typescript
// my-module.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-module';

describe('myFunction', () => {
  it('should work', () => {
    expect(myFunction(input)).toBe(output);
  });
});
```

## Déploiement

### Docker
```bash
docker-compose up -d
```

Dockerfile multi-stage build.  
Volume persistent pour SQLite.  
Port 3000 exposé.

### Variables d'environnement
Aucune nécessaire (SQLite local).

## Performance

### Isolation Presets
Configs chargées par preset uniquement lors de l'utilisation.

### SQLite
- Index sur clés étrangères
- Queries optimisées
- Single file

### Remix
- SSR pour chargement rapide
- Loaders pour data fetching
- Actions pour mutations server-side

## Extensions Possibles

### Refactorisation Cache
Supprimer `configCache` global et passer configs preset au moteur.

### Export/Import Presets
JSON pour partage entre utilisateurs.

### API REST
Exposer endpoints pour simulation externe.

### Tests
Vitest + Testing Library pour couverture.

## Troubleshooting

### "No active preset"
```bash
# Redirect vers / pour sélectionner preset
# OU seed DB pour créer preset par défaut
npm run db:seed
```

### "Cannot find module ~/"
Vérifier `vite.config.ts` → `resolve.alias`.

### DB lock errors
Fermer Drizzle Studio si ouvert.

### Build errors
```bash
npm run typecheck
npm run build
```

## Ressources

- [Remix Docs](https://remix.run/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)
- [REFACTORING-NOTES.md](../REFACTORING-NOTES.md)
