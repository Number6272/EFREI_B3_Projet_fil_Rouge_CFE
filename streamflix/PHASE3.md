# Phase 3 : optimisation et personnalisation (sur le résultat de la Phase 2)

Les 4 consignes de la Phase 3 sont appliquées, plus une mise en conformité avec les contraintes techniques obligatoires (section 5), l'étape 4 (modal) et le bonus challenge 2 (fin du document). `.gitignore` ne change pas.

Fichiers modifiés ou ajoutés :

| Fichier | Changement |
|---|---|
| `index.html` | badges de genre, rubans, utilitaires responsives et d'espacement, catalogue, formules et footer en grille Bootstrap |
| `package.json` | `npm run build` produit un CSS compressé |
| `scss/vendors/_bootstrap-custom.scss` | nouvelles variables Bootstrap |
| `scss/utils/_variables.scss` | maps `$genre-colors` et `$ribbon-colors` |
| `scss/utils/_mixins.scss` | mixins `genre-badge()` et `ribbon()` |
| `scss/components/_badges.scss` | **nouveau** |
| `scss/components/_ribbons.scss` | **nouveau** |
| `scss/style.scss` | 2 lignes `@use` en plus |
| `scss/components/_cards.scss` | ancien style des genres retiré (remplacé par les badges) |
| `scss/layout/_header.scss`, `_footer.scss`, `_hero.scss`, `scss/pages/_home.scss` | règles de grille CSS et d'espacement remplacées par la grille et les utilitaires Bootstrap |
| `css/style.css`, `css/style.css.map` | recompilés (35 Ko compressé, limite 150 Ko) |

## 1. Personnaliser les variables Bootstrap : `vendors/_bootstrap-custom.scss`

En plus des variables de la Phase 2, on ajoute :

| Variable Bootstrap | Valeur | Effet |
|---|---|---|
| `$danger` | `$primary-red` | le rouge d'erreur = rouge StreamFlix |
| `$warning` | `$accent-gold` | l'or de la charte |
| `$body-secondary-color-dark` | `$text-muted` | texte secondaire gris de la charte |
| `$border-color-dark` | `$secondary-gray` | bordures grises de la charte |
| `$font-size-base`, `$font-size-sm` | 16px, 14px convertis en rem | tailles de la charte |
| `$border-radius`, `-sm`, `-lg` | 0.25rem, 0.125rem, 0.5rem | coins plus nets (boutons, bouton ☰…) |
| `$badge-font-size`, `-font-weight`, `-padding-x`, `-padding-y` | 0.75em, 700, 0.75em, 0.4em | taille des badges de genre |

`math.div()` sert à convertir les px de la charte en rem : `math.div(16px, 16px) * 1rem = 1rem`.

## 2. Composants SASS personnalisés

### Badges de genre : `components/_badges.scss`

Les genres des cartes (Action, Drame…) deviennent des **badges Bootstrap** avec une couleur par genre.

```html
<!-- avant -->
<li>Action</li>
<!-- après -->
<li class="badge badge-genre badge-genre--action">Action</li>
```

- `utils/_variables.scss` : map `$genre-colors` (action: firebrick, drame: darkslateblue, science-fiction: teal…). Ce sont des couleurs nommées assez foncées pour que le texte blanc reste lisible.
- `utils/_mixins.scss` : mixin `genre-badge($color)`.
- `_badges.scss` : une boucle `@each` crée les 7 classes `.badge-genre--…` d'un coup. La taille vient des variables `$badge-…` de Bootstrap, lues avec `@use "../vendors/bootstrap-custom" as bs;`.

```scss
@each $genre, $color in $genre-colors {
  .badge-genre--#{$genre} {
    @include genre-badge($color);
  }
}
```

L'ancien style des genres (`.film-card__genres li`) est retiré de `_cards.scss`, car les badges le remplacent.

### Rubans des affiches : `components/_ribbons.scss`

Une étiquette « Top 10 » (rouge) sur les 3 cartes Tendances et « Nouveau » (bleu) sur les 3 cartes Nouveautés, dans le coin de l'affiche.

```html
<article class="card film-card" …>
  <span class="film-ribbon film-ribbon--top">Top 10</span>
  <img …>
```

- `utils/_variables.scss` : map `$ribbon-colors` (top: `$primary-red`, new: `$accent-blue`).
- `utils/_mixins.scss` : mixin `ribbon($color, $corner: left)`, avec un `@if` pour arrondir le bon côté.
- `_ribbons.scss` : boucle `@each` qui crée `.film-ribbon--top` et `.film-ribbon--new`.

On a maintenant **6 mixins** (respond-to, bootstrap-button, visually-hidden, hide-scrollbar, genre-badge, ribbon).

## 3. Optimiser la responsivité avec les utilitaires Bootstrap (`index.html`)

| Élément | Classes ajoutées | Résultat |
|---|---|---|
| Boutons du Hero (`.hero__actions`) | `d-flex flex-column flex-sm-row` | sur mobile, les 3 boutons sont empilés en pleine largeur (plus faciles à toucher), en ligne dès 576px |
| Zone utilisateur du header (`.site-header__user`) | `ms-lg-auto` | poussée à droite dès 992px. Remplace le `margin-left: auto` de `_header.scss` |
| Footer (`.site-footer`) | `row g-4` | grille Bootstrap à la place de la grille CSS |
| Liens utiles, Suivez-nous | `col-12 col-md-6 col-lg-3` | 1 colonne sur mobile, 2 sur tablette, 3 sur ordinateur |
| Mentions légales | `col-12 col-lg-6` | sous les 2 colonnes, puis à droite dès 992px |

Dans `_footer.scss`, les `grid-template-columns` et `grid-column` sont supprimés, car c'est la grille Bootstrap qui gère les colonnes. Le trait au-dessus des mentions légales est gardé.

## 4. Tests sur différentes tailles d'écran

Testé dans Chromium (Playwright), page entière, après défilement complet :

| Largeur | Appareil | Débordement horizontal | Remarques |
|---|---|---|---|
| 320px | petit mobile | aucun | menu ☰, boutons Hero empilés, cartes en carrousel |
| 375px | iPhone | aucun | menu ☰ ouvert et fermé OK, thème Cinéma OK |
| 414px | grand mobile | aucun | |
| 768px | tablette | aucun | 3 cartes par ligne, footer en 2 colonnes |
| 1024px | tablette paysage | aucun | navbar en ligne, footer en 3 colonnes |
| 1280px | ordinateur | aucun | bouton de recherche en texte |
| 1440px | desktop | aucun | thèmes Sombre et Clair OK, survol 3D OK |
| 1920px | grand écran | aucun | catalogue en 5 colonnes |

- HTML validé W3C : 0 erreur.
- CSS : mêmes remarques du validateur qu'aux phases précédentes (`@property`, `@container`, `masonry`), rien de nouveau.
- Les badges et rubans passent le contraste AA (texte blanc sur couleur foncée).

Pour tester toi-même : ouvre `index.html` dans Chrome, puis F12 et l'icône téléphone/tablette (mode responsive). Choisis iPhone SE, iPad, puis élargis la fenêtre.

## 5. Vérification des contraintes techniques obligatoires

| Contrainte | État | Où |
|---|---|---|
| CDN Bootstrap 5.3+ | ✅ | 5.3.8 dans le `<head>` de `index.html` |
| Navigation avec collapse responsive | ✅ | `navbar-expand-lg`, bouton `navbar-toggler`, `collapse navbar-collapse` |
| Grilles Bootstrap exclusivement | ✅ (corrigé) | voir ci-dessous |
| Minimum 5 composants Bootstrap | ✅ 9 | Navbar, Collapse, Nav, Buttons, Cards, Badges, Modal, Carousel, List group |
| Utilitaires Bootstrap pour l'espacement | ✅ (complété) | `p-0`, `m-0`, `mt-2`, `mt-4`, `pb-4`, `ms-lg-auto`, `g-2`, `g-3`, `g-4`, `gap-2`, `gap-3` |
| Architecture 7-1 | ✅ | `base`, `components`, `layout`, `pages`, `utils`, `vendors` + `style.scss` |
| Minimum 8 variables SASS | ✅ 20+ | `utils/_variables.scss` |
| Au moins 2 mixins créés et utilisés | ✅ 6 | `utils/_mixins.scss` |
| Variables Bootstrap personnalisées | ✅ | `vendors/_bootstrap-custom.scss` |
| Compilation automatique | ✅ | `npm run sass` (mode `--watch`) |
| Branche `cssNatif` | à faire chez toi | voir « Étape 1 » |
| Branche `bootstrap-sass` | ✅ | Phases 2 et 3 |
| Résultat visuel identique ou amélioré | ✅ | même design, plus badges, rubans, boutons pleine largeur sur mobile |
| Performance maintenue ou améliorée | ✅ | CSS compressé : 38 Ko avec les bonus (le CSS natif du jour 2 fait 40 Ko) |
| Structure de fichiers attendue | ✅ | tous les fichiers demandés existent, plus `_badges.scss` et `_ribbons.scss` |

### Ce qui a été corrigé pour « grilles Bootstrap exclusivement »

Trois endroits utilisaient encore `display: grid` :

1. **Catalogue** (`<ul class="masonry">`) : il devient
   `row row-cols-2 row-cols-md-3 row-cols-xl-4 row-cols-xxl-5 g-3 g-md-4 mt-2 pb-4 align-items-start`.
   Il y a donc 2, 3, 4 puis 5 colonnes selon l'écran. La grille masonry CSS est supprimée de `_home.scss`. Les cartes gardent leur hauteur naturelle (`align-items-start`), mais elles ne s'emboîtent plus comme dans un mur de briques. Le glissement animé des cartes au redimensionnement marche toujours. Le JS n'a pas été modifié.
2. **Formules d'abonnement** : les 3 choix sont dans `<div class="row g-3">` avec `<div class="col-12 col-lg-4">`. Ils sont empilés sur mobile et sur une ligne dès 992px, ce qui remplace la grille de 3 colonnes de `_home.scss`.
3. **Footer** : liens en `d-flex flex-column gap-2`, réseaux sociaux en `row row-cols-2 g-2`, mentions légales en `d-flex flex-column gap-2`.

### Espacements passés en utilitaires Bootstrap

| Élément | Avant (SCSS) | Après (classe HTML) |
|---|---|---|
| Grilles de films | `margin-top`, `padding-bottom` | `mt-2 pb-4` |
| Catalogue | `margin-top`, `padding-bottom`, `gap` | `mt-2 pb-4 g-3 g-md-4` |
| Boutons du Hero | `gap` | `gap-3` |
| Formulaire | `margin-top` | `mt-4` |
| Footer | `gap` | `gap-2`, `g-2` |

### Performance

`npm run build` compile maintenant en mode compressé (`--style=compressed`) : 35 Ko au lieu de 50 Ko, avec la source map. `npm run sass` (le mode automatique pendant que tu travailles) reste lisible.

## Étape 1 : préparation (branches git)

Ce qu'il faut obtenir :

| Branche | Contenu |
|---|---|
| `cssNatif` | le site du jour 2, en CSS natif (avant Bootstrap) |
| `bootstrap-sass` | la migration : Phases 1, 2 et 3 |
| `main` | Phase 1 aujourd'hui (tu pourras y fusionner `bootstrap-sass` à la fin si ton prof le demande) |

**1. Voir si `cssNatif` existe déjà**
```bash
git branch -a
```
Si tu vois `cssNatif` (ou `remotes/origin/cssNatif`), c'est déjà fait : passe au point 3.

**2. Créer `cssNatif` sur le dernier commit du jour 2** (celui juste avant « Phase 1 »)
```bash
git log --oneline main
```
Repère le commit juste **en dessous** de celui de la Phase 1 (par exemple `a1b2c3d Jour 2 …`), puis :
```bash
git branch cssNatif a1b2c3d
git push -u origin cssNatif
```
Remplace `a1b2c3d` par ton vrai numéro de commit. La branche est créée sans changer de branche ni toucher à tes fichiers.

**3. Envoyer la Phase 3 sur `bootstrap-sass`**
```bash
git checkout bootstrap-sass
git branch            # l'étoile doit être devant bootstrap-sass
rm -rf scss css/style.css css/style.css.map
unzip -o ~/Downloads/streamflix-phase3.zip
npm run build
open index.html
git add -A
git status            # node_modules/ ne doit PAS apparaître
git commit -m "Phase 3 : optimisation, personnalisation et contraintes"
git push -u origin bootstrap-sass
```

**4. Vérifier sur GitHub** : le menu des branches doit montrer `main`, `cssNatif` et `bootstrap-sass`.

## Étape 4 : composants Bootstrap

| Consigne | État | Où |
|---|---|---|
| Boutons en `btn` Bootstrap | ✅ (Phase 1) | `btn btn-light btn-lg`, `btn btn-secondary btn-lg / btn-sm`, `btn btn-primary btn-lg w-100` |
| Badges pour les genres | ✅ (Phase 3) | `badge badge-genre badge-genre--…` dans toutes les cartes |
| Tooltips ou modals | ✅ **ajouté** | modal « Plus d'infos » du Hero |
| Utilitaires d'espacement | ✅ (Phase 3) | `mt-2`, `mt-4`, `pb-4`, `mb-3`, `gap-2`, `gap-3`, `g-*`, `ms-lg-auto` |

### Modal « Plus d'infos »

**index.html**
- Le lien « Plus d'infos » du Hero devient un bouton qui ouvre la modal :
  `<button class="btn btn-secondary btn-lg" type="button" data-bs-toggle="modal" data-bs-target="#infos-film" …>`
- La modal est ajoutée juste avant `</body>` : `<div class="modal fade film-modal" id="infos-film">`, avec
  `modal-dialog modal-dialog-centered modal-lg`, `modal-header` (titre + `btn-close`), `modal-body` et `modal-footer` (Fermer / Lecture).
- Le contenu est mis en page avec la grille Bootstrap (`row g-4`, affiche en `col-5 col-sm-4`, texte en `col-12 col-sm-8`). Il reprend les badges de genre et des utilitaires (`img-fluid`, `rounded`, `mb-3`, `mx-auto`, `fs-4`).

Aucun JavaScript à écrire : `bootstrap.bundle.min.js` (déjà chargé) gère l'ouverture, la fermeture (croix, bouton Fermer, touche Échap, clic à côté) et le focus clavier.

**scss/components/_modal.scss** (nouveau, ajouté dans `style.scss`) : il donne à la modal les couleurs du thème avec les variables `--bs-modal-…`, et le titre dans la police d'affiche du Hero. La croix passe en blanc toute seule en thème sombre grâce à `data-bs-theme="dark"`.

Testé à 375 et 1440px, thèmes sombre et clair : la modal s'ouvre et se ferme avec Échap, sans erreur.

## Bonus challenge 2 : composants personnalisés

Fichiers : `index.html`, `js/script.js` (une fonction `initSearch` ajoutée), 3 nouveaux partials dans `scss/components/` (`_carousel.scss`, `_rating.scss`, `_search.scss`), des variables en plus dans `utils/_variables.scss`, et le mixin `floating-panel()` dans `utils/_mixins.scss`.

### 1. Carousel Bootstrap custom : section « À ne pas manquer »

- **HTML** : nouvelle section `#selection` entre le Hero et les Tendances, avec un lien « Sélection » dans les onglets de sections. Elle contient le composant `carousel slide` de Bootstrap, avec 3 films, des indicateurs et des flèches.
  - `data-bs-ride="carousel"` + `data-bs-interval="6000"` : défilement automatique toutes les 6 secondes, avec pause au survol.
  - Chaque diapositive est en grille Bootstrap : affiche en `col-4 col-md-3 col-xl-2`, texte en `col-8 col-md-9 col-xl-10`. Le résumé est caché sur petit mobile (`d-none d-sm-block`).
  - Le bouton « Voir la fiche » mène à la carte du film dans le catalogue.
- **`_carousel.scss`** : la personnalisation.
  - fond en dégradé et coins arrondis ;
  - titre dans la police d'affiche ;
  - indicateurs en barres fines, la barre active est rouge (`$carousel-indicator-color`) et plus longue ;
  - flèches rondes en bas à droite, rouges au survol.

### 2. Notation avec étoiles : dans la modal « Plus d'infos »

- **HTML** : `<fieldset class="star-rating">` avec 5 boutons radio cachés (`visually-hidden`) et 5 labels qui sont les étoiles. Chaque label a un texte caché (« 3 étoiles sur 5 ») pour les lecteurs d'écran.
- **`_rating.scss`** : **aucun JavaScript**.
  - Les étoiles sont écrites de 5 à 1 dans le HTML, et `flex-direction: row-reverse` les affiche de 1 à 5.
  - Le sélecteur `input:checked ~ label` colore l'étoile choisie et toutes celles à sa gauche. Au survol, `label:hover ~ label` prévisualise la note.
  - « Merci, votre note est enregistrée » s'affiche grâce à `:has(input:checked)`.
  - Variables : `$star-color` (or de la charte), `$star-empty-color`, `$star-size`.
- Au clavier : Tab pour arriver sur les étoiles, puis les flèches. Un contour indique l'étoile active.

### 3. Searchbar avec suggestions

- **HTML** : le champ de recherche reçoit `role="combobox"`, `aria-expanded`, `aria-controls="suggestions"`, et une liste vide `<ul class="search-suggestions list-group" id="suggestions" role="listbox">` est ajoutée juste en dessous. Le champ passe en `type="text"`, car le validateur W3C n'accepte pas `role="combobox"` sur `type="search"`.
- **JS (`initSearch`)** :
  - Le JS lit les films du catalogue (titres et genres).
  - Pendant la frappe, il affiche ceux qui correspondent, en ignorant les accents et les majuscules (« dra » trouve tous les drames). La partie tapée est surlignée en rouge.
  - **↑ / ↓** pour choisir, **Entrée** pour valider, **Échap** pour fermer, ou un clic sur la suggestion.
  - Le bouton Rechercher choisit la première suggestion. Sans résultat, la liste affiche « Aucun film trouvé ».
  - Au choix, la page défile jusqu'à la carte du film dans le catalogue, qui s'entoure d'un halo rouge. Sur mobile, le menu ☰ se referme.
- **`_search.scss`** :
  - le composant `list-group` de Bootstrap est recoloré avec ses variables `--bs-list-group-…` ;
  - le mixin `floating-panel()` donne le fond, la bordure et l'ombre de la liste.

### Tests

À 375 et 1440px : le carousel passe bien au film suivant, et « in » propose Interstellar et Inception. ↓ ↓ Entrée mène à la carte d'Inception, « zzz » affiche « Aucun film trouvé ». Une note de 4 étoiles est bien retenue, et le survol de la 2e étoile la prévisualise. Aucun débordement de 320 à 1920px. HTML validé W3C : 0 erreur. CSS : 38 Ko.

## Bonus challenge 3 : optimisation avancée

### 1. Tree-shaking Bootstrap : `scss/bootstrap-lite.scss` → `css/bootstrap-lite.css`

Un 2e fichier SASS principal (à côté de `style.scss`) recompile Bootstrap avec **seulement ce qu'utilise `index.html`** :
- **Imports sélectifs** : `reboot`, `images`, `helpers`, `grid`, `transitions`, `buttons`, `close`, `nav`, `navbar`, `card`, `badge`, `list-group`, `modal`, `carousel`. Les 16 autres modules (`forms`, `tables`, `dropdown`, `accordion`, `tooltip`…) ne sont pas importés.
- **Utilitaires filtrés** : la map `$utilities` de Bootstrap est réduite à 15 familles utilisées (`display`, `gap`, `margin-top`…), avec une boucle `@each` et `map.get()`. Les familles utilisées sans point de rupture (`mt-2`, `gap-3`…) perdent leurs versions `-sm`, `-md`… (`"responsive": false`).
- Les **variables Bootstrap personnalisées** (`vendors/_bootstrap-custom.scss`) s'appliquent directement : les couleurs StreamFlix sont compilées dans le CSS de Bootstrap.

| | Bootstrap CDN complet | `bootstrap-lite.css` | Gain |
|---|---|---|---|
| Taille | 232 Ko | 96 Ko | **-58 %** |
| Compressé gzip (ce qui transite) | 31 Ko | 15 Ko | **-53 %** |

**Rendu vérifié identique au pixel près** (comparaison de captures CDN / allégé à 375, 768 et 1440px, et modal ouverte : 0 pixel différent).

**Pourquoi le CDN reste dans `index.html`** : le brief impose « Utilisation du CDN Bootstrap 5.3+ ». La version allégée est donc fournie et prête, mais pas activée. Pour l'activer, il suffit de remplacer dans le `<head>` la ligne du CSS du CDN par :
```html
<link rel="stylesheet" href="css/bootstrap-lite.css">
```
(le JS `bootstrap.bundle.min.js` reste sur le CDN).

Pour que `$font-size-lg` n'agrandisse pas les boutons `btn-lg` dans la version allégée (différence avec le CDN), cette variable n'est plus personnalisée, tout comme `$headings-font-weight`.

### 2. Compilation SASS optimisée : `package.json`

| Script | Rôle |
|---|---|
| `npm run sass` | **développement** : recompile `style.css` ET `bootstrap-lite.css` à chaque sauvegarde, CSS lisible + source maps |
| `npm run build` | compilation unique **compressée** (`--style=compressed`) + source maps |
| `npm run build:prod` | **mise en ligne** : compressé, sans source maps (`--no-source-map`) |

Déjà en place : `@use` (chaque fichier n'est chargé et compilé qu'une fois), `--load-path=node_modules` (imports courts), `--quiet-deps` (pas d'avertissements venant de Bootstrap). `style.css` : 39 Ko, soit 8 Ko en gzip.

### 3. Core Web Vitals

**Optimisations dans `index.html`** :
- `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` : la connexion au CDN démarre plus tôt (meilleur LCP).
- `fetchpriority="high"` sur l'image du Hero : c'est l'élément LCP (le plus grand affiché), le navigateur la télécharge en premier.

**Déjà en place** :
- `width` et `height` sur toutes les images (pas de décalage de mise en page, bon CLS) ;
- `loading="lazy"` sur les affiches hors écran ;
- scripts en `defer` ;
- écouteur de défilement `passive` et `requestAnimationFrame` (bon INP) ;
- aucune police web à télécharger.

**Mesures** (Chromium, en local, donc sans le temps réseau réel) :

| Critère | Seuil « bon » Google | Ordinateur | Mobile simulé (processeur 4× plus lent) |
|---|---|---|---|
| **LCP** (affichage du plus grand élément) | < 2,5 s | 0,35 s ✅ | 0,9 à 1,3 s ✅ |
| **CLS** (stabilité de la mise en page) | < 0,1 | 0,02 ✅ | 0 ✅ |
| **INP** (réactivité, mesurée sur le changement de thème) | < 200 ms | 52 ms ✅ | 160 à 260 ms ⚠️ |

Seul point limite : sur un téléphone lent, le changement de thème recalcule les couleurs de toute la page (variables `@property` animées). Avec `bootstrap-lite.css`, le travail du navigateur au chargement baisse d'environ 25 % (moins de CSS à analyser).

Pour mesurer toi-même : Chrome, F12, onglet **Lighthouse**, « Mobile », **Analyser le chargement de page**.
