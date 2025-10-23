# Interface & Routes - Structure

## Framework
Remix 2 avec file-based routing. Chaque fichier dans `app/routes/` = route.

## Icônes
**Lucide React** : Bibliothèque d'icônes utilisée dans toute l'application.
- Import : `import { IconName } from "lucide-react"`
- Usage : `<IconName className="w-4 h-4" />`
- Toutes les icônes sont des composants React avec props standards

## Routes Principales

```
routes/
├── _index.tsx                  # Dashboard (/)
├── config.tsx                  # Layout config avec sidebar
├── config.symbols.tsx          # Config symboles
├── config.combos.tsx           # Config combinaisons
├── config.bonuses.tsx          # Config bonus
├── config.jokers.tsx           # Config jokers
├── config.characters.tsx       # Config personnages
├── config.levels.tsx           # Config niveaux (NEW)
├── config.shop-rarities.tsx    # Config raretés boutique (NEW)
├── simulator.tsx               # Interface simulation
├── stats.tsx                   # Statistiques globales
└── presets.tsx                 # Gestion presets
```

## Architecture Remix

### Loader (SSR Data Fetching)
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const data = await getDataFromDB()
  return json({ data })
}
```
**Usage** : Fetch data côté serveur, accessible via `useLoaderData()`

### Action (Mutations)
```typescript
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  // Process mutation
  return json({ result })
}
```
**Usage** : POST/PUT/DELETE via `useFetcher()` ou `<Form>`

## Pages Détaillées

### 1. Dashboard (`_index.tsx`)
- **Loader** : Stats rapides (optionnel)
- **Display** : Cards navigation vers sections
- **Composants** : `PageHeader`, `Card`, `Button`

### 2. Config Symboles (`config.symbols.tsx`)
- **Loader** : `getAllSymbols()`
- **Display** :
  - Symboles basiques (5)
  - Symboles premium (3)
  - Symboles bonus (1)
  - Graphique distribution poids
- **Composants** : `Card`, `Badge`, `Progress`

### 3. Config Combos (`config.combos.tsx`)
- **Loader** : `getAllCombinations()`
- **Display** :
  - Grid combos avec multiplicateurs
  - Liste ordre détection
  - Active/inactive state
- **Composants** : `Card`, `Badge`

### 4. Config Bonus (`config.bonuses.tsx`)
- **Loader** : `getAllBonuses()`
- **Display** :
  - Section bonus départ (4)
  - Section bonus partie (12)
  - Filtres par rareté
  - Effets + scaling
- **Composants** : `Card`, `Badge` (couleur par rareté)

### 5. Config Jokers (`config.jokers.tsx`)
- **Loader** : `getAllJokers()`
- **Display** :
  - Groupés par rareté
  - Prix, valeur revente
  - Tags, effets
  - Stats agrégées
- **Composants** : `Card`, `Badge`

### 6. Config Characters (`config.characters.tsx`)
- **Loader** : `getAllCharacters()`
- **Display** :
  - Cards personnages
  - Effets passifs
  - Stats base + scaling
  - Unlock conditions
- **Composants** : `Card`, `Badge` (locked/unlocked)

### 7. Simulateur (`simulator.tsx`)
- **Loader** :
  ```typescript
  getAllSymbols(), getActiveCombinations(),
  getStartingBonuses(), getAllJokers(),
  getUnlockedCharacters(), getPlayerProgress()
  ```
- **Action** : Exécute simulation via `runAutoSimulation()`
- **Layout** : 2 colonnes
  - Gauche : Config (character, bonus, ascension, levels, $)
  - Droite : Résultats (stats, combos, progression)
- **State** : Local React (form inputs)
- **Composants** : `Card`, `Input`, `Button`, `Badge`, `Separator`

### 8. Statistiques (`stats.tsx`)
- **Loader** :
  ```typescript
  getAllSimulationRuns(), getPlayerProgress()
  ```
- **Display** :
  - Overview (total, success rate, completion rate)
  - Progression joueur
  - Stats par ascension
  - Runs récentes
- **Composants** : `Card`, `Badge`, `Progress`

### 9. Presets (`presets.tsx`)
- **Loader** : `getAllPresets()`
- **Display** : Grid presets avec actions (load, edit, delete)
- **TODO** : Actions CRUD complètes
- **Composants** : `Card`, `Button`, `Badge`

## Composants UI

### shadcn/ui (Radix primitives)
Localisation : `app/components/ui/`

```
ui/
├── button.tsx         # Variants: default, outline, ghost, link
├── card.tsx           # Card + Header + Content + Footer
├── badge.tsx          # Variants: default, secondary, outline, destructive
├── input.tsx          # Input standard
├── separator.tsx      # Divider horizontal/vertical
├── progress.tsx       # Barre progression
└── ... (à étendre)
```

**Utilisation** :
```typescript
import { Button } from "~/components/ui/button"
<Button variant="default" size="lg">Click</Button>
```

### Layout Components
Localisation : `app/components/layout/`

```
layout/
├── nav-bar.tsx        # Navigation principale (top)
└── page-header.tsx    # Header pages (titre + description + actions)
```

**NavBar** :
- Items : Dashboard, Config, Simulateur, Stats, Presets
- Affiche ascension max débloquée
- Responsive (mobile TODO)

**PageHeader** :
```typescript
<PageHeader 
  title="Titre"
  description="Description"
  actions={<Button>Action</Button>}
/>
```

## Styling

### Tailwind CSS
Classes utilitaires + thème custom dark.

**Variables CSS** : `app/styles/global.css`
- Couleurs : `--primary`, `--secondary`, `--destructive`, etc.
- Dark mode par défaut

**Animations** :
```css
.animate-slide-in    /* Slide + fade */
.animate-fade-in     /* Fade seul */
.animate-bounce-subtle /* Bounce léger */
```

### Conventions
- Classes conditionnelles : `cn()` helper (clsx + tailwind-merge)
- Responsive : `md:`, `lg:` breakpoints
- Dark mode : classe `dark` sur `<html>`

## Helpers & Utils

`app/lib/utils.ts` :
```typescript
cn(...classes)              // Merge classes Tailwind
formatNumber(1234)          // "1 234"
formatCurrency(10)          // "10$"
formatPercent(0.5)          // "50.0%"
```

## Extensions UI

Pour ajouter features UI :

1. **Nouvelle page** :
   - Créer `routes/nom.tsx`
   - Définir `loader` si data nécessaire
   - Définir `action` si mutation
   - Utiliser composants existants

2. **Nouveau composant** :
   - Créer dans `components/` (domaine) ou `components/ui/` (réutilisable)
   - Export + utiliser dans routes

3. **shadcn/ui component** :
   - Générer via CLI (optionnel) ou copier template
   - Placer dans `components/ui/`

## Optimisations

- **Loader cache** : Remix cache automatiquement (revalidation sur navigation)
- **Prefetch** : Links prefetch automatique au hover
- **Code splitting** : Route-based (auto par Remix)
- **CSS** : Tailwind purge unused (production)

## Accessibilité

shadcn/ui basé sur Radix = accessible par défaut :
- Keyboard navigation
- ARIA attributes
- Focus management
- Screen reader support

