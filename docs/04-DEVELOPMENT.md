# Guide de Développement

## Setup Initial

```bash
# Clone & install
git clone <repo>
cd sim-BYS
npm install

# Database
npm run db:push      # Sync schema
npm run db:seed      # Populate data

# Dev server
npm run dev          # → http://localhost:3000
```

## Scripts npm

```bash
# Development
npm run dev          # Dev server (hot reload)
npm run build        # Production build
npm run start        # Production server
npm run typecheck    # TypeScript check

# Database
npm run db:push      # Push schema changes
npm run db:seed      # Reseed data
npm run db:reset     # Wipe + recreate + seed
npm run db:studio    # Drizzle Studio UI
npm run db:generate  # Generate migration files

# Code Quality
npm run lint         # ESLint
npm run format       # Prettier
```

## Structure de Développement

### Ajouter un Symbole/Bonus/Joker

1. Éditer `app/db/seed/*.seed.ts`
2. Ajouter l'objet dans l'array
3. `npm run db:reset`

**Exemple** :
```typescript
// bonuses.seed.ts
{
  id: "new_bonus",
  name: "Nouveau Bonus",
  description: "Description",
  type: "game",
  rarity: "rare",
  effects: [{ type: "increase_chance", value: 5 }],
  baseValue: 5,
  scalingPerLevel: 1,
  maxLevel: 30,
  obtainCondition: "boss_or_levelup"
}
```

### Ajouter un Effet Bonus/Joker

1. Définir le type d'effet dans le seed
2. Implémenter dans `lib/simulation/game-logic/bonus-applier.ts` ou `joker-applier.ts`

**Exemple** :
```typescript
// bonus-applier.ts
case "new_effect_type":
  state.someProperty += value
  break
```

### Modifier Logique Simulation

Fichiers concernés : `lib/simulation/*`

**Workflow** :
1. Identifier le module concerné (ex: `calculator.ts` pour calculs)
2. Modifier la fonction
3. TypeScript catch les erreurs
4. Tester via simulateur UI

**Exemple** : Changer formule gains
```typescript
// calculator.ts
export function calculateGains(combos, state) {
  // Nouvelle formule ici
  return totalGain
}
```

### Ajouter une Page

1. Créer `app/routes/nom.tsx`
2. Définir `loader` (data) et/ou `action` (mutations)
3. Exporter composant React

**Template** :
```typescript
import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { PageHeader } from "~/components/layout/page-header"

export async function loader({ request }: LoaderFunctionArgs) {
  // Fetch data
  return json({ data })
}

export default function MyPage() {
  const { data } = useLoaderData<typeof loader>()
  
  return (
    <div>
      <PageHeader title="Mon Titre" />
      {/* Content */}
    </div>
  )
}
```

### Ajouter un Composant UI

1. Créer `app/components/domain/nom.tsx`
2. Export + import dans route

**Conventions** :
- Props typées (interface)
- Utiliser composants shadcn/ui
- Styling Tailwind

```typescript
interface MyComponentProps {
  title: string
  onClick?: () => void
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return (
    <Card onClick={onClick}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
    </Card>
  )
}
```

### Modifier le Schéma DB

1. Éditer `app/db/schema.ts`
2. `npm run db:push` (applique changements)
3. Si données existantes : migration manuelle ou reset

**Exemple** : Ajouter colonne
```typescript
export const myTable = sqliteTable("my_table", {
  // ...
  newColumn: text("new_column")
})
```

## Conventions de Code

### TypeScript
- Strict mode activé
- Pas de `any` (utiliser `unknown` si nécessaire)
- Types explicites pour fonctions publiques
- Inférence OK pour variables locales

### Naming
- **Fichiers** : kebab-case (`my-file.ts`)
- **Composants** : PascalCase (`MyComponent.tsx`)
- **Fonctions** : camelCase (`myFunction`)
- **Constants** : UPPER_SNAKE_CASE (`MY_CONSTANT`)
- **Types/Interfaces** : PascalCase (`MyType`)

### Imports
- Alias `~/*` pour `app/*`
- Imports groupés : externes → internes → composants → types
- Pas d'imports circulaires

### Comments
- JSDoc pour fonctions publiques
- Inline pour logique complexe
- Pas de comments évidents

## Testing (TODO)

Framework suggéré : Vitest

**Tests critiques** :
- Moteur simulation : `lib/simulation/**/*.test.ts`
- Détection combos (déduplication)
- Calculs gains, XP, intérêts
- Génération boutique (raretés)

## Debug

### Simulation
Ajouter logs dans moteur :
```typescript
console.log("[SPIN]", { grid, combos, tokensGained })
```

### Database
```bash
npm run db:studio    # UI browser
# ou SQLite CLI
sqlite3 data/game.db
```

### UI
React DevTools + Remix DevTools (auto en dev)

## Performance

### Bottlenecks Potentiels
- Batch simulations (1000+ runs) : considérer Web Workers
- Large grids (si extension) : optimiser algo combos
- DB queries : indexes automatiques, pas de N+1

### Optimisations Actuelles
- SQLite WAL mode (concurrency)
- Remix SSR cache
- Tailwind purge CSS
- Code splitting routes

## Déploiement

### Docker
```bash
docker build -t sim-bys .
docker run -p 3000:3000 -v $(pwd)/data:/app/data sim-bys
```

### Production Build
```bash
npm run build
npm run start    # Port 3000
```

**Environment** :
- `NODE_ENV=production`
- `DATABASE_URL=./data/game.db` (default)

### Reverse Proxy (Traefik/Nginx)
Voir `docker-compose.yml` pour config Traefik.

## Troubleshooting

### DB Locked
SQLite en mode single-writer. Si lock :
```bash
rm data/game.db-shm data/game.db-wal
```

### TypeScript Errors après Changement Schema
```bash
npm run db:push      # Regen types
npm run typecheck    # Verify
```

### Build Errors
```bash
rm -rf build/ node_modules/.cache/
npm run build
```

## Ressources

- **Remix** : https://remix.run/docs
- **Drizzle** : https://orm.drizzle.team/docs
- **Tailwind** : https://tailwindcss.com/docs
- **shadcn/ui** : https://ui.shadcn.com

## Extensions Futures

### Prioritaires
1. Mode manual simulation (pause aux décisions)
2. Visualisation grille 5×3 en temps réel
3. Graphiques (Recharts) dans stats
4. Export/import presets JSON
5. Tests unitaires moteur

### Nice-to-Have
6. Mode endless (après 7-3)
7. Achievements/trophées
8. Replay animations
9. Mobile responsive
10. Multiplayer compare (leaderboards)

