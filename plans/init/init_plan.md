## 🎰 Projet : Simulation de Machine à Sous (Slot Game Simulator)

### 🎯 Objectif

Créer une application interactive qui simule un mini-jeu de machine à sous.  
L'utilisateur peut :

- Configurer les paramètres de base du slot (valeurs, taux d'apparition, multiplicateurs, connexions, etc.)
- Ajouter et activer/désactiver des objets qui modifient les multiplicateurs et probabilités
- Lancer une simulation de plusieurs spins pour observer les résultats, les moyennes et les extrêmes

---

### ⚙️ Structure de l'application

L'app doit comporter 3 onglets principaux :

1. **Paramètres de base**
   - Gestion des symboles et de leurs propriétés :
     - Valeur de base
     - Pourcentage d'apparition
   - Il y a 8 symboles normaux : 10, J, Q, K, A, P1 (Premium 1), P2 (Premium 2), P3 (Premium 3)
   - 1 symbole Bonus (B) (s'active si 3 apparaissent)
   - Définition du poids des symboles : 
     - 10 =17%
     - J =17%
     - Q =14%
     - K =14%
     - A = 14%
     - P1 =12.33%
     - P2 =12.33%
     - P3 = 12.33%
     - B = 1% 
     - A
   - **Paramètre : % minimum pour le Bonus (par défaut 1%)**
   - Grid : 5x3
   - 11 types de connexions (horizontal, vertical, diagonal, zigzag, patate, V, V inversé, full grid, etc.)
   - Voici les différentes connexions possibles avec 10 comme exemple de symbole

     oeil (Oeil):

     |    |    |    |    |    |
     |----|----|----|----|----|
     |    | 10 | 10 | 10 |    |
     | 10 | 10 |    | 10 | 10 |
     |    | 10 | 10 | 10 |    |

     triangle en haut (Tri)

     |    |    |    |    |    |
     |----|----|----|----|----|
     | 10 | 10 | 10 | 10 | 10 |
     |    | 10 |    | 10 |    |
     |    |    | 10 |    |    |

     V en bas (V bis)

     |    |    |    |    |     |
     |----|----|----|----|-----|
     |    |    | 10 |    |     |
     |    | 10 |    | 10 |     |
     | 10 |    |    |    | /10 |

     Triangle (Tri)

     |    |    |    |    |    |
     |----|----|----|----|----|
     |    |    | 10 |    |    |
     |    | 10 |    | 10 |    |
     | 10 | 10 | 10 | 10 | 10 |

     Horizontal 3 (H3)

     |    |    |    |
     |----|----|----|
     | 10 | 10 | 10 |

     Horizontal 4 (H4)

     |    |    |    |    |
     |----|----|----|----|
     | 10 | 10 | 10 | 10 |

     V (V)

     |    |    |    |    |    |
     |----|----|----|----|----|
     | 10 |    |    |    | 10 |
     |    | 10 |    | 10 |    |
     |    |    | 10 |    |    |

     Horizontal 5 (H5)

     |    |    |    |    |    |
     |----|----|----|----|----|
     | 10 | 10 | 10 | 10 | 10 |

     Diagonal 3 (D3)

     |    |    |    |
     |----|----|----|
     | 10 |    |    |
     |    | 10 |    |
     |    |    | 10 |

     Vertical 3 (V3)

   |    |
   |----|
   | 10 |
   | 10 |
   | 10 |

   Jackpot (J)

   |    |    |    |    |    |
   |----|----|----|----|----|
   | 10 | 10 | 10 | 10 | 10 |
   | 10 | 10 | 10 | 10 | 10 |
   | 10 | 10 | 10 | 10 | 10 |


  - **Règles de combinaisons (DÉDUPLICATION - Des petites vers les grandes)**
  - \- **PRINCIPE** : Chaque symbole ne peut être compté QU'UNE SEULE FOIS. On commence par détecter les petites combis, puis on cherche les grandes avec les symboles restants.
  
  - **CAS SPÉCIAL - JACKPOT** :
         - **Jackpot (J)** = EXCEPTION - CUMULE TOUT
         - Si la grille complète (5×3 = 15 cases) est remplie d'un seul symbole → JACKPOT !
         - **C'est la seule combinaison qui cumule toutes les autres**
         - Déclenche TOUTES les combinaisons possibles présentes (Oeil, Tri, V bis, V, tous les H5, H4, H3, V3, D3)
         - + Multiplicateur bonus du Jackpot
         - **Gain = Somme de toutes les combinaisons + Bonus Jackpot**
  
  - **ORDRE DE DÉTECTION** (des petites vers les grandes) :
         
         **Étape 1 : Détecter les combinaisons de base (3 symboles)**
         - **H3** (3 symboles horizontaux alignés)
         - **V3** (3 symboles verticaux alignés)
         - **D3** (3 symboles en diagonale)
         - Pour chaque combinaison détectée : compter le gain et marquer les 3 symboles comme "utilisés"
         
         **Étape 2 : Détecter H4 avec les symboles restants**
         - **H4** (4 symboles horizontaux alignés)
         - Si tous les 4 symboles sont encore disponibles → compter H4 et marquer comme "utilisés"
         - Sinon → ignorer (déjà compté en H3 à l'étape 1)
         
         **Étape 3 : Détecter H5 avec les symboles restants**
         - **H5** (5 symboles horizontaux alignés)
         - Si tous les 5 symboles sont encore disponibles → compter H5 et marquer comme "utilisés"
         - Sinon → ignorer (déjà compté en H3/H4 aux étapes précédentes)
         
         **Étape 4 : Détecter V avec les symboles restants**
         - **V** (pattern en V)
         - Si tous les symboles du V sont encore disponibles → compter V et marquer comme "utilisés"
         - Sinon → ignorer
         
         **Étape 5 : Détecter V bis avec les symboles restants**
         - **V bis** (V inversé)
         - Si tous les symboles du V bis sont encore disponibles → compter V bis et marquer comme "utilisés"
         - Sinon → ignorer
         
         **Étape 6 : Détecter Triangle avec les symboles restants**
         - **Tri** (pattern triangle)
         - Si tous les symboles du Tri sont encore disponibles → compter Tri et marquer comme "utilisés"
         - Sinon → ignorer
         
         **Étape 7 : Détecter Oeil avec les symboles restants**
         - **Oeil** (pattern oeil)
         - Si tous les symboles de l'Oeil sont encore disponibles → compter Oeil et marquer comme "utilisés"
         - Sinon → ignorer
  
  - **RÉSUMÉ DE L'ALGORITHME** :
         1. Vérifier d'abord si Jackpot (full grid) → si oui, cumul TOUT et stop
         2. Sinon, détecter dans l'ordre : H3/V3/D3 → H4 → H5 → V → V bis → Tri → Oeil
         3. Pour chaque combinaison : si tous ses symboles sont disponibles, la compter et marquer les symboles comme utilisés
         4. Gain total = somme de toutes les combinaisons détectées

   
   - Gestion des multiplicateurs générale par type de connexion
   - Chaque entrée doit avoir une note d'aide indiquant ce qu'elle fait
   - **Les pourcentages d'apparition sont toujours normalisés à 100% :**
     - Dans l'interface utilisateur : modifier un symbole ajuste automatiquement les autres pour garder 100% total
     - Avec les effets d'objets : **l'ajout est littéral (+10% = vraiment +10% affiché), les autres perdent proportionnellement**
     - **Le symbole Bonus garde toujours minimum 1% (paramétrable dans l'interface)**
     - Si un symbole atteint ≥100%, tous les autres tombent à 0% (sauf Bonus à 1%)
     - L'affichage montre toujours le % réel après application des effets
   - On start avec 1% de chance (100% = jackpot avec un cap à 90%)
2. **Objets**
   - Possibilité d'ajouter dynamiquement des objets via un bouton "Ajouter un objet"
   - Chaque objet a : 
     - Un nom
     - Une case "Activer/Désactiver"
     - Un effet (sélectionnable dans un menu déroulant)
     - Définir le ou les symbole(s) affecté(s) (option pour les symboles premiums ou non) (option pour tout affecté en 1 clic)
     - Définir la valeur de l'effet sur le(s) symbole(s)
     - Les objets sont toujours éditables
     - Connexions affectées (possibilité de tout affecter en 1 clic)
     - Un pourcentage d'apparition de l'effet (pas tout le temps)
     - Effets sur le nombre de spins (+ou- x spin)
   - Un helper (petit panneau explicatif) décrivant ce que chaque multiplicateur ou effet fait (le calcul si possible)
   - **Afficher les nouvelles valeurs à jour après l'application des effets d'objet :**
     - Afficher le POIDS (valeur brute après effets)
     - Afficher le % RÉEL (pourcentage calculé par rapport au total des poids)
     - Formule : % Réel = (Poids du symbole / Somme de tous les poids) × 100
   - Liste des effets: 
     - Ajouter/multiplier/soustraire le POIDS d'apparition (min 0, pas de max - devient un poids de probabilité)
     - Ajouter/multiplier/soustraire la valeur de base (min 0)
     - Ajouter/multiplier/soustraire la chance globale (qui est générale, max 90%)
3. **Simulation**
   - Entrées utilisateur : 
     - Nombre de tours (échéances)
     - Nombre de spins par tour (par défaut : 5)
     - Définir le montant de l'échéance de base (par défaut : 100)
     - Multiplicateur d'échéance (par défaut : "10x" à la suivante)
   - Bouton "Lancer la simulation" qui lance la simulation
   - Bouton "Echéance suivante" qui permet de passer à l'échéance suivante et de faire une simulation sur la next série de 5×3 = 15 spins
   - Affichage de la simulation: 
     - Échec ou réussite de l'échéance
     - Un graph pour visualiser la répartition des essais par rapport aux gains
     - Simulation de 1000 essais → affiche moyenne, min et max
     - Aperçu des 3 meilleurs essais complets et aussi des 3 pires et 3 moyens
     - Chaque essai = 15 spins, mais par jet de 5 spins pour 3 tour
     - Pour chaque spin on doit voir :
       - Affiche les 15 grilles (5×3)
       - Nombre de combinaisons
       - résultats obtenus
       - Indicateur tour bonus en cours
       - Afficher le pourcentage de chance sur les spins
   - Les bonus : 
     - Si 3 symboles bonus apparaissent alors les 2 prochains tours sont en bonus (+2 spins gratuits supplémentaires) ex : sur un jet de 5 spins, si on a un bonus, ça fera un nombre total de 7 spins
     - Sous bonus, la chance augmente de +50% cap à 90%
     - Sous bonus, les symboles bonus deviennent des WILDS (W) qui connectent avec n’importe quel symbole et ne rajoutent aucun spin supplémentaire
   - "Chance = 100%" = Jackpot (full grille avec un seul symbole)

---

### 🔧 Gestion des probabilités (SIMPLE ET DIRECT)

**Un seul mode de calcul :**

1. **Mode Interface (Paramètres de base)** :
   - Normalisation automatique pour garder 100% total
   - Modifier un symbole redistribue proportionnellement aux autres
   - UX simple et intuitive pour l'utilisateur
2. **Mode avec objets actifs** :
   - **L'ajout est LITTÉRAL : +10% = vraiment +10% affiché**
   - Les autres symboles perdent proportionnellement pour compenser
   - **RÈGLE SPÉCIALE : Le symbole Bonus garde toujours minimum 1% (paramétrable)**
   - Si un symbole atteint ou dépasse 100% → tous les autres tombent à 0% (sauf Bonus à 1% minimum)

   **Formule de réduction des autres :**

   ```
   Symbole boosté : +X% → garde exactement +X%
   Montant à retirer total : X%
   
   Pour chaque autre symbole (sauf Bonus) :
     perte = X × (son_% / somme_des_autres_%)
     nouveau_% = max(0, ancien_% - perte)
   
   Bonus : toujours >= 1% (ou valeur paramétrable)
   ```
3. **Ordre d'application des objets** :
   - Les objets s'appliquent dans l'ordre de la liste
   - Possibilité de réorganiser les objets (boutons ↑↓)

---

### 💡 Exemples concrets

**Exemple 1 : Boost normal**

```
Initial : Tous les symboles à 11.11% (9 symboles)
Objet 1 : +10% sur J

J = 11.11 + 10 = 21.11% ✓ (garde exactement 21.11%)
Les 8 autres perdent au prorata :
  - Chaque autre : 11.11 - 1.25 = 9.86%
  - Bonus : 11.11 - 1.25 = 9.86% (≥ 1% OK)
Total = 21.11 + (8 × 9.86) = 100% ✓
```

**Exemple 2 : Plusieurs boosts**

```
Initial : Tous à 11.11%
Objet 1 : +10% sur J → J = 21.11%, autres = 9.86%
Objet 2 : +20% sur K

K = 9.86 + 20 = 29.86% ✓
Les autres (dont J) perdent au prorata :
  - J : 21.11 - 6.03 = 15.08%
  - 6 autres : 9.86 - 2.82 = 7.04%
  - Bonus : max(1%, 9.86 - 2.82) = 7.04%
Total = 29.86 + 15.08 + (7 × 7.04) = 100% ✓
```

**Exemple 3 : Boost extrême**

```
Initial : Tous à 11.11%
Objet 1 : +95% sur J

J = 11.11 + 95 = 106.11%
Puisque ≥ 100% :
  J = 99% (ajusté)
  Tous les autres = 0%
  Bonus = 1% (protection)
Total = 99 + 1 = 100% ✓
```

**Génération de grille :**

```javascript
// Pour chaque case de la grille :
random = Math.random() × 100
cumul = 0

Pour chaque symbole :
  cumul += pourcentage_symbole
  Si random <= cumul :
    sélectionner ce symbole
```

**Calcul des gains :**

```javascript
gain = valeur_base_symbole × multiplicateur_connexion
```

---

### 💡 Détails techniques

App dans un seul fichier HTML

- **Technos :**
  - Preact (import via CDN)
  - TailwindCSS (import via CDN)
  - Une lib d'icônes simple (Lucide ou Heroicons) (import via CDN)
  - Chart.js pour les graphiques (import via CDN)
  - Librairies additionnelles permises pour rendre le code le moins verbose possible (import via CDN)
- **UI :**
  - Interface propre et lisible (en Dashborad pas de scroll si possible sauf simulation)
  - Inputs annotés
  - Preview lisible des grilles simulées
  - En darkmode (sobre et pro et simple)

---

### 📚 Librairies à importer

#### Tailwind CSS

- **URL :** `https://cdn.tailwindcss.com`
- **Version :** CDN (dernier)
- **Méthode :** script dans `<head>`

Exemple :

```html
<script src="https://cdn.tailwindcss.com"></script>
```

#### Preact

- **URL :** `https://esm.sh/preact@10.19.3`
- **Version :** 10.19.3
- **Méthode :** importmap ESM (déclaré dans `<script type="importmap">`) puis import depuis le module principal

Exemple d'importmap :

```html
<script type="importmap">
{
    "imports": {
        "preact": "https://esm.sh/preact@10.19.3",
        "preact/hooks": "https://esm.sh/preact@10.19.3/hooks",
        "htm/preact": "https://esm.sh/htm@3.1.1/preact?external=preact"
    }
}
</script>
```

Exemple d'import dans le module principal :

```javascript
import { h, render } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { html } from 'htm/preact';
```

#### Preact hooks

- **URL :** `https://esm.sh/preact@10.19.3/hooks`
- **Version :** 10.19.3
- **Méthode :** importmap ESM (voir ci-dessus)

#### HTM (Preact integration)

- **URL :** `https://esm.sh/htm@3.1.1/preact?external=preact`
- **Version :** 3.1.1
- **Méthode :** importmap ESM (voir ci-dessus)

#### Chart.js

- **URL :** `https://cdn.jsdelivr.net/npm/chart.js@4.4.1`
- **Version :** 4.4.1
- **Méthode :** script classique

Exemple :

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1"></script>
```

#### Lucide (icons)

- **URL :** `https://unpkg.com/lucide@latest`
- **Version :** latest (tag)
- **Méthode :** script classique

Exemple :

```html
<script src="https://unpkg.com/lucide@latest"></script>
```