# Phase 3 : optimisation et personnalisation (sur le résultat de la Phase 2)

Seules les 4 consignes de la Phase 3 ont été appliquées. `js/script.js`, `package.json` et `.gitignore` ne changent pas.

Fichiers modifiés ou ajoutés :

| Fichier | Changement |
|---|---|
| `index.html` | classes des badges de genre, rubans, utilitaires responsives |
| `scss/vendors/_bootstrap-custom.scss` | nouvelles variables Bootstrap |
| `scss/utils/_variables.scss` | maps `$genre-colors` et `$ribbon-colors` |
| `scss/utils/_mixins.scss` | mixins `genre-badge()` et `ribbon()` |
| `scss/components/_badges.scss` | **nouveau** |
| `scss/components/_ribbons.scss` | **nouveau** |
| `scss/style.scss` | 2 lignes `@use` en plus |
| `scss/components/_cards.scss` | ancien style des genres retiré (remplacé par les badges) |
| `scss/layout/_header.scss`, `scss/layout/_footer.scss` | règles remplacées par des utilitaires Bootstrap |
| `css/style.css`, `css/style.css.map` | recompilés (50 Ko, limite 150 Ko) |

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
