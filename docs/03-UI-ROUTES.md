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
/                          - Sélection preset (home + accès config via bouton)
/config                    - Layout config avec sidebar (accès via home ou icône ⚙️)
/config/symbols            - Config symboles du preset actif
/config/combos             - Config combinaisons du preset actif
/config/levels             - Config niveaux du preset actif
/config/shop-rarities      - Config raretés boutique du preset actif
/config/preset-settings    - Paramètres preset + lien sous-preset
/effects                   - ⚡ Bibliothèque effets (lecture seule, hard-codés)
/resources/symbols         - Bibliothèque symboles (lecture seule, hard-codés)
/resources/combinations    - Bibliothèque combos (CRUD)
/resources/bonuses         - Bibliothèque bonus (CRUD avec dropdown effets)
/resources/jokers          - Bibliothèque jokers (CRUD avec dropdown effets)

**Organisation du menu** :
- **Éléments hard-codés** : Effets, Symboles (accès direct depuis menu principal)
- **Ressources modifiables** : Combos, Bonus, Jokers, Personnages, Niveaux (dropdown "Ressources")
/resources/characters      - Bibliothèque personnages (CRUD avec dropdown effets)
/resources/levels          - Bibliothèque niveaux (CRUD)
/resources/object-selections - Sous-presets objets (CRUD)
/resources/object-selections/:id - Config objets par niveau (avec indication Passif)
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

**Sidebar** : 5 sections
- Symboles
- Combinaisons
- Niveaux
- Raretés Boutique
- Paramètres du Preset (lien sous-preset)

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

### Config Preset Settings (`config.preset-settings.tsx`) **NOUVEAU**

**Loader** : `requireActivePreset()`, `getAllObjectSelectionPresets()`

**Actions** :
- `updatePreset` - Lier un sous-preset d'objets au preset actif

**Display** :
- **Sélecteur de sous-preset** : Dropdown pour choisir un objectSelectionPreset
- **Info** : Permet de réutiliser des configs d'objets entre presets

---

### Effets (`effects.tsx`) **LECTURE SEULE** ⚡

**Loader** : `getAllEffects()`  
**Actions** : Aucune (hard-codés, liés au moteur simulation)

**Display** :
- **Cibles d'effets** : Section collapsible (réduite par défaut)
- **Filtre par cible** : Dropdown pour filtrer les effets selon leur cible
- **Table liste** en lecture seule
- Colonnes : Nom, Code, Type, Catégorie, Cible, Valeur défaut
- ⚠️ Warning : Modification nécessite adaptation code simulation

**Usage** : Référencés par bonus, jokers, personnages (dropdown sélection)

---

### Bonus (`resources.bonuses.tsx`) **CRUD**

**Loader** : `getAllBonuses()`, `getAllEffects()`  
**Actions** : `create`, `update`, `delete`

**Display** :
- **Liste des bonus** avec badges : Nom, Rareté, Type, **Passif** (étiquette bleue si applicable)
- **Formulaire d'édition** : Nom, Description, Type, Rareté, **Passif** (checkbox), Effets (sélecteur)
- **EffetSelector** mis à jour : Changement d'effet met à jour automatiquement les valeurs par défaut

**Note** : Les bonus passifs ne sont pas détruits après utilisation (contrairement aux bonus actifs)

---

### Symboles (`resources.symbols.tsx`) **LECTURE SEULE**

**Loader** : `getAllSymbols()`  
**Actions** : Aucune (hard-codés, lecture seule)

**Display** :
- **Liste des symboles** avec badges : Nom, Type, Poids, Valeur, Multiplicateur
- Pas de formulaire d'édition ou de création
- Icônes et couleurs hard-codées

**Note** : Les 9 symboles sont hard-codés pour préserver l'intégrité de la simulation

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

### Effects (`app/components/effects/`)
- `effect-selector.tsx` - Sélecteur d'effets avec mise à jour automatique des valeurs lors du changement d'effet

## Navigation

### NavBar
```
[Accueil] [Ressources▼] | [Sélections] | [Presets] | [Simulateur] [Stats] [Preset: X ▼] [⚙️]
```

**Structure** :
- **Éléments hard-codés (lecture seule)** dans dropdown : Effets (⚡), Symboles (⊞)
- **Éléments modifiables (CRUD)** dans dropdown : Combos, Bonus, Jokers, Personnages, Niveaux
- **Gestion** : Sélections (disponibilité objets), Presets (configs)
- **Utilisation** : Simulateur, Stats
- **⚙️** : Config preset actif → /config

**Note** : Le dropdown "Ressources▼" contient un séparateur interne entre les éléments hard-codés et les éléments modifiables

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
