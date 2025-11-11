# Notes de Refactoring - Architecture Presets

## Refactoring Complété

### ✅ Dashboard et Navigation
- Dashboard transformé en sélecteur de presets
- Navigation mise à jour avec indicateur de preset actif
- Helper `requireActivePreset()` pour bloquer l'accès sans preset

### ✅ Configuration par Preset
- Toutes les routes config chargent depuis les tables `preset_*_configs`
- Nouvelle route `/config/object-selections` pour gérer bonus/jokers par niveau
- Queries availability complètes

### ✅ Simulateur
- Charge les configs depuis le preset actif
- Affiche le preset utilisé
- Intégration complète avec les tables preset

### ✅ Statistiques
- Filtrage par preset
- Comparaison entre presets
- Stats globales conservées

## Code Legacy Conservé

### Tables Globales
Les tables `levelConfigs` et `shopRarityConfigs` sont conservées car elles sont utilisées par le `configCache` dans le moteur de simulation.

**Fichiers concernés:**
- `app/db/schema.ts` - Tables `levelConfigs` et `shopRarityConfigs`
- `app/db/queries/level-configs.ts` - Queries globales
- `app/db/queries/shop-rarity-configs.ts` - Queries globales
- `app/db/seed/level-configs.seed.ts` - Seeds
- `app/db/seed/shop-rarity-configs.seed.ts` - Seeds

### Config Cache
Le `configCache` (`app/lib/utils/config-cache.ts`) continue d'utiliser les tables globales.

**Raison:** Le cache est chargé au démarrage de l'application et utilisé pendant les simulations pour la performance. Il est appelé par:
- `app/lib/simulation/game-logic/level-manager.ts`
- `app/lib/simulation/game-logic/shop-manager.ts`

## Refactoring Futur (Optionnel)

Pour supprimer complètement le code legacy, il faudrait:

1. **Modifier le moteur de simulation** pour accepter les configs en paramètres au lieu d'utiliser le cache global
2. **Passer les configs preset** depuis le simulateur jusqu'au moteur
3. **Supprimer le configCache** et les tables globales
4. **Mettre à jour** level-manager et shop-manager pour utiliser les configs passées en paramètre

Cette refactorisation est complexe et touche le cœur du moteur de simulation. Elle n'est pas nécessaire pour le fonctionnement de l'architecture preset.

## Architecture Actuelle

```
Preset Actif
    ↓
Routes Config (édition preset)
    ↓
Tables preset_*_configs
    ↓
Simulateur (charge configs)
    ↓
Moteur Simulation (utilise cache global*)
    *Le cache utilise encore les tables globales

Recommended: Garder les tables globales synchronisées avec les presets par défaut
```

## Workflow Utilisateur

1. **Sélectionner/Créer un preset** (page d'accueil)
2. **Configurer le preset** (routes /config/*)
3. **Simuler** avec le preset actif
4. **Analyser** les stats par preset

Tout est fonctionnel et cohérent avec ce workflow.

