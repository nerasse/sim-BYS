# Interface & Routes

## Framework

**Remix 2** avec file-based routing.  
Chaque fichier dans `app/routes/` = une route accessible.

## Icônes

**Lucide React** utilisé dans toute l'application.
- Import : `import { IconName } from "lucide-react"`
- Usage : `<IconName className="w-4 h-4" />`
- 15+ icônes : LayoutDashboard, Settings, Gamepad2, TrendingUp, Save, Shapes, Target, Gift, Sparkles, User, BarChart3, Store, Info, Play, etc.

## Structure Remix

### Loader (Data Fetching SSR)
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const data = await getDataFromDB();
  return json({ data });
}
```
Accessible via `useLoaderData()` dans le composant.

### Action (Mutations)
```typescript
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // Process mutation (CREATE, UPDATE, DELETE)
  return json({ result });
}
```
Déclenché par `<Form method="post">`.

## Routes

```
/                          - Dashboard
/config                    - Layout avec sidebar
/config/symbols            - Config symboles (éditable)
/config/combos             - Config combinaisons (éditable)
/config/bonuses            - Config bonus
/config/jokers             - Config jokers
/config/characters         - Config personnages
/config/levels             - Config niveaux (éditable)
/config/shop-rarities      - Config raretés boutique (éditable)
/simulator                 - Interface simulation
/simulator?preset=<id>     - Simulateur avec preset chargé
/stats                     - Statistiques globales
/presets                   - Gestion presets (CRUD)
```

## Pages Détaillées

### Dashboard (`_index.tsx`)
**Loader** : `getPlayerProgress()`, `getAllSimulationRuns()`

**Display** :
- Stats overview (ascension max, total runs, success rate)
- Simulations récentes
- Quick actions (Configuration, Simulateur, Statistiques, Presets)
- Getting started (si aucune run)

**Composants** : `PageHeader`, `Card`, `Button`, `Badge`

---

### Config Layout (`config.tsx`)
**Layout partagé** avec sidebar pour navigation entre sections.

**Sidebar** : 7 sections avec icônes
- Symboles (Shapes)
- Combinaisons (Target)
- Bonus (Gift)
- Jokers (Sparkles)
- Personnages (User)
- Niveaux (BarChart3)
- Raretés Boutique (Store)

---

### Config Symboles (`config.symbols.tsx`) **ÉDITABLE**
**Loader** : `getAllSymbols()`  
**Action** : `UPDATE symbols` (poids, valeur, multiplicateur)

**Display** :
- 3 sections : Basiques, Premium, Bonus
- **Formulaire par symbole** :
  - Poids (probabilité)
  - Valeur de base
  - Multiplicateur
  - Bouton sauvegarder
- Graphique distribution temps réel

**Composants** : `Card`, `Badge`, `Input`, `Form`, `Button`

---

### Config Combos (`config.combos.tsx`) **ÉDITABLE**
**Loader** : `getAllCombinations()`  
**Action** : `UPDATE combinations` (multiplicateur, isActive)

**Display** :
- **Formulaire par combo** :
  - Input multiplicateur
  - Boutons Activer/Désactiver
  - Affichage ordre détection
  - Code interne
- Info sur ordre de détection

**Composants** : `Card`, `Badge`, `Input`, `Form`, `Button`

---

### Config Bonus (`config.bonuses.tsx`)
**Loader** : `getAllBonuses()`

**Display** :
- Section bonus départ (4)
- Section bonus partie (12)
- Filtres par rareté
- Effets + scaling par level

**Composants** : `Card`, `Badge`

---

### Config Jokers (`config.jokers.tsx`)
**Loader** : `getAllJokers()`

**Display** :
- Groupés par rareté
- Prix, valeur revente
- Tags, effets
- Stats agrégées

**Composants** : `Card`, `Badge`

---

### Config Personnages (`config.characters.tsx`)
**Loader** : `getUnlockedCharacters()`

**Display** :
- 3 personnages (tous débloqués)
- Effets passifs
- Bonus de départ
- Stats de base et scaling

**Composants** : `Card`, `Badge`

---

### Config Niveaux (`config.levels.tsx`) **ÉDITABLE**
**Loader** : `getAllLevelConfigs()`  
**Action** : `updateLevelConfig(levelId, updates)`

**Display** :
- Groupés par monde (1-7)
- **Formulaire par niveau** :
  - Objectif jetons (Ascension 0)
  - Récompense dollars
  - Badge "Boss" si X-3
  - Bouton sauvegarder
- Info ascension auto-scaling

**Composants** : `Card`, `Input`, `Form`, `Button`, `Badge`

---

### Config Raretés Boutique (`config.shop-rarities.tsx`) **ÉDITABLE**
**Loader** : `getAllShopRarityConfigs()`  
**Action** : `updateShopRarityConfig(world, weights)`

**Display** :
- 7 cards (1 par monde)
- **Formulaire par monde** :
  - 5 inputs (common, uncommon, rare, epic, legendary)
  - Progress bars visuelles
  - Total = 100% dynamique
  - Bouton sauvegarder
- Info ajustement ascension

**Composants** : `Card`, `Input`, `Progress`, `Form`, `Button`

---

### Simulateur (`simulator.tsx`)
**Loader** :
- `getAllSymbols()`, `getActiveCombinations()`
- `getStartingBonuses()`, `getGameBonuses()`
- `getAllJokers()`, `getUnlockedCharacters()`
- `getPlayerProgress()`
- `getPresetById(presetId)` si `?preset=<id>`

**Action** : `runAutoSimulation(config)`

**Display** :
- Panel configuration :
  - Sélection personnage
  - Sélection bonus départ
  - Ascension (slider)
  - Start/end level
  - Iterations
- Panel résultats :
  - Success/Failure
  - Stats détaillées
  - Niveau atteint

**État** : React local + Remix fetcher

**Composants** : `Card`, `Input`, `Button`, `Badge`, `Separator`

---

### Statistiques (`stats.tsx`)
**Loader** : `getAllSimulationRuns()`, `getPlayerProgress()`

**Display** :
- Overview global
- Progression joueur
- Stats par ascension
- Runs récentes

**Composants** : `Card`, `Badge`, `Progress`

---

### Presets (`presets.tsx`) **CRUD COMPLET**
**Loader** :
- `getAllPresets()`
- `getAllSymbols()`, `getAllCombinations()`

**Actions** :
- `CREATE preset` (sauvegarde config actuelle)
- `DELETE preset` (avec confirmation)
- `UPDATE preset` (toggle favorite)

**Display** :
- Grid presets avec cards détaillées
- Par preset :
  - Nom, description, tags
  - Favoris (⭐)
  - Stats (ascension, niveaux, mode, itérations)
  - Compteurs (symboles modifiés, combos actifs)
  - Actions :
    - **Charger** : Lien vers `/simulator?preset=<id>`
    - **Supprimer** : Avec confirmation
    - **Toggle favoris**
- Bouton "Nouveau Preset" (capture config actuelle)
- Empty state si aucun preset

**Intégration** : Les presets se chargent dans le simulateur via query param.

**Composants** : `Card`, `Button`, `Badge`, `Form`

---

## Composants UI

### shadcn/ui (Radix Primitives)
Localisation : `app/components/ui/`

- `button.tsx` - Variants: default, outline, ghost, link, destructive
- `card.tsx` - Card + CardHeader + CardContent + CardFooter
- `badge.tsx` - Variants: default, secondary, outline, destructive
- `input.tsx` - Input standard avec focus styles
- `progress.tsx` - Barre de progression
- `separator.tsx` - Ligne de séparation

### Layout
- `nav-bar.tsx` - Navigation principale avec icônes
- `page-header.tsx` - Header de page (title + description + actions)

## Styling

**Tailwind CSS** utility-first.

**Dark mode** : `class="dark"` par défaut.

**Custom animations** : `slideIn`, `fadeIn`, `bounceSubtle` (dans `global.css`).

## Patterns

### Form Actions
```tsx
<Form method="post">
  <input type="hidden" name="intent" value="update" />
  <Input name="value" defaultValue={current} />
  <Button type="submit">Sauvegarder</Button>
</Form>
```

### Conditional Rendering
```tsx
{items.length === 0 ? (
  <EmptyState />
) : (
  <Grid items={items} />
)}
```

### Loading States
```tsx
const fetcher = useFetcher();
const isRunning = fetcher.state !== "idle";
```
