# Interface & Routes

## Framework

**Remix 2** avec file-based routing.

## Structure Remix

### Loader (Data Fetching SSR)
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const data = await getDataFromDB();
  return json({ data });
}
```

### Action (Mutations)
```typescript
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // Process mutation
  return json({ result });
}
```

## Routes

```
/                          - Sélection de preset (home)
/config                    - Layout avec sidebar
/config/symbols            - Config symboles du preset actif
/config/combos             - Config combinaisons du preset actif
/config/bonuses            - Bibliothèque bonus (lecture seule)
/config/jokers             - Bibliothèque jokers (lecture seule)
/config/characters         - Bibliothèque personnages (lecture seule)
/config/levels             - Config niveaux du preset actif
/config/shop-rarities      - Config raretés boutique du preset actif
/config/object-selections  - Config objets par niveau (nouveau)
/simulator                 - Simulation avec preset actif
/stats                     - Statistiques par preset
/stats?preset=<id>         - Stats d'un preset spécifique
/presets                   - Gestion presets (CRUD)
```

## Pages Détaillées

### Home (`_index.tsx`) - Sélection Presets ⭐

**Loader** : `getAllPresets()`, `getActivePreset()`, `getAllSimulationRuns()`

**Actions** :
- `create` - Créer preset et activer
- `duplicate` - Dupliquer preset et activer
- `setActive` - Activer un preset
- `delete` - Supprimer preset

**Display** :
- **Hero** : Preset actif en grand avec actions (Configurer, Simuler)
- **Créer preset** : Formulaire rapide
- **Grid presets** : Cards avec stats (nb simulations, taux succès)
- **Favoris** : Section séparée
- **Actions par preset** : Activer, Dupliquer, Supprimer

**Protection** : Aucune (accessible sans preset actif)

---

### Config Layout (`config.tsx`)

**Loader** : `getAllPresets()`, `getActivePreset()`  
**Protection** : Redirect si pas de preset actif

**Sidebar** : 8 sections
- Symboles
- Combinaisons
- Bonus
- Jokers
- Personnages
- Niveaux
- Raretés Boutique
- **Objets par Niveau** ← Nouveau

**Top** : PresetSelector component (switch preset)

---

### Config Symboles (`config.symbols.tsx`) **ÉDITABLE**

**Loader** : `requireActivePreset()`, `getPresetSymbolConfigs()`  
**Action** : `upsertPresetSymbolConfig()`

**Display** :
- 3 sections : Basiques, Premium, Bonus
- **Formulaire par symbole** : Poids, Valeur, Multiplicateur
- Édition du **preset actif uniquement**

---

### Config Combos (`config.combos.tsx`) **ÉDITABLE**

**Loader** : `requireActivePreset()`, `getPresetComboConfigs()`  
**Action** : `upsertPresetComboConfig()`

**Display** :
- **Formulaire par combo** : Multiplicateur, Activer/Désactiver
- Édition du **preset actif uniquement**

---

### Config Objets par Niveau (`config.object-selections.tsx`) **NOUVEAU**

**Loader** : `requireActivePreset()`, `getPresetBonusAvailabilities()`, `getPresetJokerAvailabilities()`

**Actions** :
- `addBonus` - Ajouter disponibilité bonus
- `removeBonus` - Retirer disponibilité
- `addJoker` - Ajouter disponibilité joker
- `removeJoker` - Retirer disponibilité

**Display** :
- **Bonus configurés** : Liste avec plage (de X-3 à Y-3)
- **Ajouter bonus** : Dropdown bonus + from/until
- **Jokers configurés** : Liste avec plage
- **Ajouter joker** : Dropdown joker + from/until
- **Info** : Par défaut, tous disponibles si non configuré

---

### Config Niveaux (`config.levels.tsx`) **ÉDITABLE**

**Loader** : `requireActivePreset()`, `getPresetLevelConfigs()`  
**Action** : `upsertPresetLevelConfig()`

**Display** :
- Groupés par monde (1-7)
- **Formulaire par niveau** : Objectif, Récompense $
- Badge "Boss" si X-3

---

### Config Raretés (`config.shop-rarities.tsx`) **ÉDITABLE**

**Loader** : `requireActivePreset()`, `getPresetShopRarityConfigs()`  
**Action** : `upsertPresetShopRarityConfig()`

**Display** :
- 7 cards (1 par monde)
- **Formulaire** : 5 poids (common → legendary)
- Progress bars visuelles

---

### Simulateur (`simulator.tsx`)

**Loader** : `requireActivePreset()`, charge toutes les configs preset

```typescript
const [
  preset,
  symbolConfigs,      // ← preset
  comboConfigs,       // ← preset
  levelConfigs,       // ← preset
  shopRarityConfigs,  // ← preset
  startingBonuses,
  characters
] = await Promise.all([...]);
```

**Action** : `runAutoSimulation(config)`, sauvegarde avec `presetId`

**Display** :
- **Header** : Affiche preset utilisé
- **Panel config** : Personnage, Bonus départ, Ascension, Niveaux, Itérations
- **Panel résultats** : Stats détaillées
- **Protection** : Redirect si pas de preset actif

---

### Statistiques (`stats.tsx`)

**Loader** : `getAllSimulationRuns()`, `getAllPresets()`, filtrage par preset

**Display** :
- **Sélecteur preset** : Boutons pour filtrer
- **Comparaison presets** : Si aucun filtre, compare tous
- **Stats preset** : Filtrées si preset sélectionné
- **Stats par ascension** : Toujours affichées
- **Runs récentes** : Filtrées ou toutes

**URL** : `/stats?preset=<id>` pour filtre direct

**Protection** : Aucune (accessible sans preset actif)

---

### Presets (`presets.tsx`) **CRUD**

**Loader** : `getAllPresets()`, `getActivePreset()`

**Actions** :
- `create` - Créer avec config par défaut
- `duplicate` - Copier preset existant
- `delete` - Supprimer (cascade configs)
- `toggleFavorite` - Marquer favori
- `setActive` - Activer preset

**Display** :
- Grid presets avec cards détaillées
- **Actions** : Activer, Configurer, Dupliquer, Supprimer, Favoris
- Formulaire création rapide
- Info sur système presets

**Protection** : Aucune

---

## Composants UI

### shadcn/ui (`app/components/ui/`)
- `button.tsx` - Variants: default, outline, ghost, destructive
- `card.tsx` - Card + Header + Content + Footer
- `badge.tsx` - Variants: default, secondary, outline, destructive
- `input.tsx` - Input standard
- `select.tsx` - Dropdown
- `progress.tsx` - Barre progression
- `separator.tsx` - Ligne séparation

### Layout (`app/components/layout/`)
- `nav-bar.tsx` - Navigation avec **indicateur preset actif**
- `page-header.tsx` - Header de page

### Presets (`app/components/presets/`)
- `preset-selector.tsx` - Dropdown switch preset (dans config layout)

## Navigation

### NavBar
```
[Logo] [Accueil] [Configuration] [Simulateur] [Statistiques] [Presets]
                                                              [Preset: "X" ▼]
```

**Preset actif** : Badge cliquable vers home  
**Pas de preset** : Badge rouge "Aucun preset actif"

## Styling

**Tailwind CSS** utility-first  
**Dark mode** : `class="dark"` par défaut  
**Custom animations** : `slideIn`, `fadeIn`, `bounceSubtle`

## Patterns

### Protection Routes
```tsx
export async function loader() {
  const presetId = await requireActivePreset(); // ← Redirect si null
  // ... continue
}
```

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
{items.length === 0 ? <EmptyState /> : <Grid items={items} />}
```
