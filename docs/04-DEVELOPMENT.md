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
npm run db:seed      # Peupler données
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
npm run db:seed         # Seed données initiales
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
│   ├── routes/              # Pages Remix (file-based routing)
│   │   ├── _index.tsx       # Dashboard
│   │   ├── config.tsx       # Layout config
│   │   ├── config.*.tsx     # Pages config
│   │   ├── simulator.tsx    # Simulateur
│   │   ├── stats.tsx        # Stats
│   │   └── presets.tsx      # Presets
│   │
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   └── layout/          # Layout (NavBar, PageHeader)
│   │
│   ├── lib/
│   │   ├── simulation/      # Moteur simulation
│   │   │   ├── types.ts     # Types centralisés
│   │   │   ├── engine.ts    # Orchestrateur
│   │   │   ├── core/        # Modules core (grid, combos, calc)
│   │   │   ├── game-logic/  # Game logic (levels, shop, rewards)
│   │   │   └── runners/     # Auto-runner
│   │   │
│   │   └── utils/           # Utilitaires
│   │       ├── constants.ts
│   │       ├── probability.ts
│   │       └── config-cache.ts
│   │
│   ├── db/
│   │   ├── schema.ts        # Schéma Drizzle (12 tables)
│   │   ├── client.ts        # DB client
│   │   ├── queries/         # Queries par domaine
│   │   └── seed/            # Seeds
│   │
│   ├── styles/
│   │   └── global.css       # Tailwind + custom animations
│   │
│   └── root.tsx             # Root Remix (layout global)
│
├── data/
│   └── game.db              # Base SQLite
│
├── public/
│   └── favicon.svg
│
├── docs/                    # Documentation
├── drizzle/                 # Migrations Drizzle
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── drizzle.config.ts
├── vite.config.ts
└── README.md
```

## Conventions de Code

### TypeScript
- **Strict mode** activé
- Pas de `any` (utiliser `unknown` si besoin)
- Types explicites pour fonctions publiques
- Interfaces pour objets complexes

### Naming
- `camelCase` - variables, fonctions
- `PascalCase` - composants, types, interfaces
- `SCREAMING_SNAKE_CASE` - constantes
- Fichiers : `kebab-case.tsx` ou `PascalCase.tsx` (composants)

### Imports
- Alias `~` pour imports depuis `app/`
- Grouper : React → Remix → DB → Components → Utils

### Composants
```tsx
export default function ComponentName() {
  // Hooks en premier
  const data = useLoaderData();
  
  // Logic
  const computed = useMemo(() => ..., [deps]);
  
  // Render
  return <div>...</div>;
}
```

## Workflows Courants

### Modifier une Table DB
```bash
1. Éditer app/db/schema.ts
2. npm run db:push            # Sync schema
3. Modifier seed si nécessaire
4. npm run db:reset           # Re-seed
```

### Ajouter une Route
```bash
1. Créer app/routes/new-route.tsx
2. Exporter loader/action si nécessaire
3. Ajouter lien dans NavBar (si pertinent)
```

### Ajouter un Module Simulation
```bash
1. Créer app/lib/simulation/core/new-module.ts
2. Définir types dans types.ts
3. Intégrer dans engine.ts
4. Tester indépendamment
```

### Modifier Config Cache
```bash
1. Éditer app/lib/utils/config-cache.ts
2. Ajouter méthode si nécessaire
3. Utiliser dans modules simulation
4. Recharger après modifs UI (cache.reload())
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
Le dev server Vite a HMR (Hot Module Replacement).  
Modifications auto-rechargées dans le navigateur.

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

Le `Dockerfile` et `docker-compose.yml` sont configurés :
- Multi-stage build
- Volume persistent pour SQLite
- Port 3000 exposé
- Reverse proxy Traefik ready

### Variables d'environnement
Aucune nécessaire pour le moment (SQLite local).

## Performance

### Cache Config
Les configs DB (levels, shop rarities) sont chargées en mémoire au démarrage.

### SQLite
- Index sur clés étrangères
- Queries optimisées
- Single file = simple et rapide

### Remix
- SSR pour chargement initial rapide
- Loaders pour data fetching optimisé
- Actions pour mutations server-side

## Extensions Possibles

### Tests
```bash
npm install -D vitest @testing-library/react
```

### CI/CD
GitHub Actions ou GitLab CI pour tests auto.

### Analytics
Tracker stats simulation pour méta-analyse.

### Export/Import
Presets en JSON pour partage.

### API
Exposer endpoints REST pour simulation externe.

## Troubleshooting

### "Cannot find module ~/"
Vérifier `vite.config.ts` → `resolve.alias`.

### DB lock errors
Fermer Drizzle Studio si ouvert.

### Build errors
```bash
npm run typecheck
npm run build
```

### Port 3000 occupé
Modifier `vite.config.ts` → `server.port`.

## Ressources

- [Remix Docs](https://remix.run/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)
