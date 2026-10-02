# Phase 3 : optimisation et personnalisation (sur le résultat de la Phase 2)

Les 4 consignes de la Phase 3 sont appliquées, plus une mise en conformité avec les contraintes techniques obligatoires (section 5). `js/script.js` et `.gitignore` ne changent pas.

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
| `$font-size-base`, `$font-size-sm`, `$font-size-lg` | 16px, 14px, 24px convertis en rem | tailles de la charte |
| `$headings-font-weight` | 700 | titres en gras |
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
| Minimum 5 composants Bootstrap | ✅ 6 | Navbar, Collapse, Nav, Buttons, Cards, Badges |
| Utilitaires Bootstrap pour l'espacement | ✅ (complété) | `p-0`, `m-0`, `mt-2`, `mt-4`, `pb-4`, `ms-lg-auto`, `g-2`, `g-3`, `g-4`, `gap-2`, `gap-3` |
| Architecture 7-1 | ✅ | `base`, `components`, `layout`, `pages`, `utils`, `vendors` + `style.scss` |
| Minimum 8 variables SASS | ✅ 20+ | `utils/_variables.scss` |
| Au moins 2 mixins créés et utilisés | ✅ 6 | `utils/_mixins.scss` |
| Variables Bootstrap personnalisées | ✅ | `vendors/_bootstrap-custom.scss` |
| Compilation automatique | ✅ | `npm run sass` (mode `--watch`) |
| Branche `cssNatif` | à faire chez toi | voir « Étape 1 » |
| Branche `bootstrap-sass` | ✅ | Phases 2 et 3 |
| Résultat visuel identique ou amélioré | ✅ | même design, plus badges, rubans, boutons pleine largeur sur mobile |
| Performance maintenue ou améliorée | ✅ | CSS compressé : 35 Ko (le CSS natif du jour 2 fait 40 Ko) |
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
