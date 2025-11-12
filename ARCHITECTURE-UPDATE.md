# Mise à jour de l'Architecture - Système de Ressources et Object Selections

## Vue d'ensemble

L'application a été refactorée pour séparer les **ressources globales réutilisables** et les **configurations par preset**, avec l'ajout d'un système de **sous-presets d'objets** pour une meilleure réutilisabilité.

## Nouveautés Principales

### 1. Menu Ressources

Nouveau menu dans le header permettant d'accéder à la bibliothèque globale:
- **Symboles**: Bibliothèque des 9 symboles de base
- **Combinaisons**: 11 types de combos disponibles
- **Bonus**: Tous les bonus (starting + game)
- **Jokers**: Tous les jokers disponibles
- **Personnages**: Personnages jouables avec effets passifs
- **Niveaux**: Templates de niveaux globaux (référence)
- **Sélections d'Objets**: Sous-presets réutilisables

### 2. Object Selection Presets (Sous-presets)

Un nouveau type d'entité réutilisable qui définit:
- Quels bonus sont disponibles et à partir de quel niveau
- Quels jokers sont disponibles et à partir de quel niveau

**Avantages**:
- Créer une fois, réutiliser sur plusieurs presets
- Partager des configurations d'objets entre différents presets
- Facilite la création de variantes de gameplay

**Tables DB**:
```
objectSelectionPresets
  - id, name, description, tags

objectSelectionBonuses
  - objectSelectionPresetId → objectSelectionPresets.id
  - bonusId → bonuses.id
  - availableFrom (levelId)
  - availableUntil (levelId, nullable)

objectSelectionJokers
  - objectSelectionPresetId → objectSelectionPresets.id
  - jokerId → jokers.id
  - availableFrom (levelId)
  - availableUntil (levelId, nullable)
```

### 3. Presets avec Object Selections

Les presets peuvent maintenant référencer un `objectSelectionPresetId` pour utiliser une configuration d'objets prédéfinie:

```typescript
preset {
  id,
  name,
  description,
  tags,
  isFavorite,
  objectSelectionPresetId // FK vers objectSelectionPresets (nullable)
}
```

**Fallback**: Si un preset n'a pas d'objectSelectionPresetId, il utilise les anciennes tables `presetBonusAvailability` et `presetJokerAvailability` pour compatibilité.

### 4. Config Cache Preset-Aware

Le système de cache de configuration a été refactoré pour être **multi-preset**:

```typescript
// Avant (global, obsolète)
configCache.getLevelObjective(levelId, ascension)

// Après (par preset)
presetConfigCache.getLevelObjective(presetId, levelId, ascension)
```

**Architecture**:
- `PresetConfigCache`: Gestionnaire principal
- `ConfigCacheInstance`: Cache pour UN preset spécifique
- `Map<presetId, ConfigCacheInstance>`: Un cache par preset

**Impact**: Les simulations utilisent maintenant les configurations **du preset actif**, pas des tables globales obsolètes.

### 5. Simulation avec Availabilities

Le `SimulationConfig` inclut maintenant les availabilities:

```typescript
interface SimulationConfig {
  presetId: string;  // CRITIQUE
  objectSelectionPresetId?: string;
  
  availableBonuses: Array<{
    bonusId: string;
    availableFrom: string;
    availableUntil?: string | null;
  }>;
  
  availableJokers: Array<{
    jokerId: string;
    availableFrom: string;
    availableUntil?: string | null;
  }>;
  
  // ... reste des champs
}
```

### 6. Switcher de Preset dans le Header

Dropdown permettant de changer rapidement le preset actif:
- Liste tous les presets
- Indique le preset actif
- Affiche les favoris avec ⭐
- Change le preset et recharge la page

## Flux de Données

### Création d'un Preset

1. Créer un preset sur `/` (home)
2. Le preset est vide initialement
3. Option A: Créer un nouveau object selection preset
4. Option B: Utiliser un object selection preset existant
5. Configurer les autres aspects (symboles, combos, niveaux, shop rarities)

### Lancement d'une Simulation

1. Sélectionner un preset actif (via home ou switcher)
2. Aller sur `/simulator`
3. Le loader charge:
   - Configs du preset (symboles, combos, niveaux, shop rarities)
   - Object availabilities (depuis objectSelectionPreset OU fallback)
4. La simulation utilise `presetConfigCache` pour tous les calculs
5. Les objets disponibles sont filtrés par niveau pendant le jeu

## Routes

### Nouvelles Routes Ressources

- `/resources/symbols` - Symboles globaux
- `/resources/combinations` - Combinaisons globales
- `/resources/bonuses` - Bonus globaux (anciennement `/config/bonuses`)
- `/resources/jokers` - Jokers globaux (anciennement `/config/jokers`)
- `/resources/characters` - Personnages (anciennement `/config/characters`)
- `/resources/levels` - Templates de niveaux globaux
- `/resources/object-selections` - Liste des sous-presets
- `/resources/object-selections/$id` - Configuration d'un sous-preset

### Routes Config (par preset)

- `/config/symbols` - Configuration des symboles pour le preset actif
- `/config/combos` - Configuration des combos pour le preset actif
- `/config/levels` - Configuration des niveaux pour le preset actif
- `/config/shop-rarities` - Configuration des shop rarities pour le preset actif
- `/config/object-selections` - Configuration ancienne (peut être obsolète)

## Helpers et Utilities

### Object Availability

`app/lib/simulation/game-logic/object-availability.ts`:
- `getAvailableBonusesForLevel()` - Filtre les bonus disponibles à un niveau
- `getAvailableJokersForLevel()` - Filtre les jokers disponibles à un niveau
- `isBonusAvailableAtLevel()` - Check si un bonus est dispo
- `isJokerAvailableAtLevel()` - Check si un joker est dispo

### Config Cache

`app/lib/utils/config-cache.ts`:
- `presetConfigCache` - Instance singleton du gestionnaire
- `presetConfigCache.getOrInitialize(presetId)` - Obtenir/créer cache pour preset
- `presetConfigCache.getLevelObjective(presetId, levelId, ascension)` - Objectif d'un niveau
- `presetConfigCache.getShopRarityWeights(presetId, world)` - Poids des rarités shop

## Notes Techniques

### Backward Compatibility

Les anciennes tables `presetBonusAvailability` et `presetJokerAvailability` sont conservées pour:
1. Compatibilité avec les presets existants
2. Permettre une migration progressive
3. Fallback si pas d'objectSelectionPresetId

### Migration Future

Quand tous les presets utiliseront les objectSelectionPresets:
1. Migrer les données des tables `preset*Availability` vers `objectSelection*`
2. Supprimer les anciennes tables
3. Supprimer également `levelConfigs` et `shopRarityConfigs` (obsolètes, remplacés par `presetLevelConfigs` et `presetShopRarityConfigs`)

### Performance

- Cache par preset évite les rechargements DB constants
- Les availabilities sont chargées une fois au chargement du simulateur
- Le filtrage des objets est fait en mémoire (rapide)

## Améliorations Futures

### Auto-save
- Sauvegarder automatiquement les modifications dans les forms de config
- Debounce de 500ms
- Indicateur visuel "Sauvegardé ✓"

### Sauvegarde avant Switch
- Sauvegarder les modifications en attente avant de changer de preset
- Empêche la perte de données

### Availabilities Avancées
- Définir précisément `availableFrom` et `availableUntil` par bonus/joker
- UI pour configurer des ranges de niveaux plus fins
- Visualisation graphique de la disponibilité

### Character Scaling
- Le scaling du character par niveau est appliqué automatiquement
- Pourrait être amélioré avec des effets visuels/notifications

## Conclusion

Cette architecture offre:
- ✅ **Séparation claire** entre ressources globales et configs par preset
- ✅ **Réutilisabilité** via les object selection presets
- ✅ **Performance** avec le cache multi-preset
- ✅ **Flexibilité** pour créer des variations de gameplay
- ✅ **Maintenabilité** avec une structure de code claire

L'application est maintenant un véritable **outil de game design** permettant de tester rapidement différentes configurations et d'itérer sur les mécaniques de jeu.

