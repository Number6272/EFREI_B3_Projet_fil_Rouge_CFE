# Jour 4, exercice 5 : modal simple

Construit sur l'exercice 4. Un clic sur l'affiche ou le titre d'un film ouvre une fenêtre (modal) avec sa fiche : titre, affiche, année, durée, note, genres et résumé. Le bouton × la ferme.

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `index.html` | la structure de la modal, juste avant `</body>`, et la phrase d'astuce sous « Tendances » mise à jour |
| `js/script.js` | section `EXERCICE 5 : Modal` remplie, et une condition de l'exercice 3 adaptée |
| `scss/pages/_exercices.scss` | CSS de la modal, sous `/* Exercice 5 - Modal */` |
| `css/` | recompilé |

## Le HTML : pourquoi les classes sont renommées

```html
<div id="modal" class="simple-modal" role="dialog" aria-modal="true" aria-label="Fiche du film">
  <div class="simple-modal__content">
    <button class="simple-modal__close" type="button" aria-label="Fermer la fiche">&times;</button>
    <div id="modal-body"></div>
  </div>
</div>
```

| Consigne | Notre version | Pourquoi |
|---|---|---|
| `id="modal"`, `id="modal-body"` | identiques | les fonctions `openModal()` et `closeModal()` cherchent ces id |
| `class="modal"` | `class="simple-modal"` | `.modal` est une classe de **Bootstrap**, déjà utilisée par la modal « Plus d'infos » du Hero. Notre règle `.modal { display: none; background-color: … }` aurait aussi changé cette modal-là |
| `class="modal-content"` | `class="simple-modal__content"` | même raison : `.modal-content` est aussi une classe Bootstrap |
| `<span class="close">` | `<button class="simple-modal__close">` | un `<span>` ne reçoit pas le focus clavier. Un `<button>` se déclenche avec Tab puis Entrée. `aria-label` dit « Fermer la fiche » aux lecteurs d'écran, au lieu de « fois » pour × |

`role="dialog"` et `aria-modal="true"` annoncent une fenêtre de dialogue aux lecteurs d'écran.

## Le JavaScript

**Les fonctions fournies**, gardées et complétées :

- `openModal(film)` reçoit toutes les infos du film, pas seulement le titre, et construit la fiche avec `innerHTML`. Puis `modal.style.display = "block"`, comme dans la consigne. Elle met aussi le focus sur ×.
- `closeModal()` remet `display` à `"none"`, et rend le focus à l'élément cliqué avant l'ouverture.

**À compléter (fait) :**

1. **Récupérer les infos du film cliqué :** `getFilmInfos(card)` lit la carte avec `querySelector` : le titre (`h3`), l'affiche (`src` et `alt`), l'année et la durée (les 2 `<time>`), la note (`<data>`) et les genres. Les cartes de Tendances, Recommandés et Nouveautés n'ont pas de résumé : on va le chercher dans la carte du catalogue qui a le même titre.
2. **Event listeners sur les films :** un `addEventListener("click")` sur chaque carte. On ouvre seulement si le clic est sur l'affiche ou le titre (`event.target.closest(...)`, comme à l'exercice 3). `event.preventDefault()` empêche le lien du titre (`href="#"`) de remonter en haut de page.
3. **Event listener sur le bouton close :** `closeButton.addEventListener("click", closeModal)`. On passe la fonction elle-même, sans parenthèses : elle sera appelée au moment du clic.

**En plus :** la modal se ferme aussi avec la touche Échap ou par un clic sur le fond noir (`event.target === modal` : on a cliqué sur le fond, pas dans la boîte blanche).

## Partage des clics avec l'exercice 3

Un clic sur une carte servait déjà à l'exercice 3 (« Vu »). Les deux exercices se partagent maintenant la carte :

- affiche ou titre → la fiche s'ouvre ;
- ailleurs sur la carte (année, genres, résumé) → badge « ✓ Vu » ;
- bouton « Ma liste » → rien.

La condition de l'exercice 3 devient `event.target.closest(".film-card__poster, .film-card__title, button")`. La phrase d'astuce sous « Tendances » l'explique.

## Le CSS

Les propriétés de la consigne sont gardées, avec les nouveaux noms de classes et 4 changements, commentés dans le fichier :

| Consigne | Notre version | Pourquoi |
|---|---|---|
| `z-index: 1000` | `z-index: 1050` | le header collant est à 1030 : il serait passé devant le fond noir |
| `background-color: rgba(0,0,0,0.8)` | un calque `::before` noir avec `opacity: 0.8` | même résultat, avec des couleurs nommées |
| (rien) | `color: black` sur la boîte | en thème sombre, le texte de la page est blanc : il serait invisible sur le fond blanc |
| (rien) | `overflow-y: auto` sur la modal | si la fiche est plus haute que l'écran (petit mobile), on peut la faire défiler |

S'y ajoutent la mise en page de la fiche : l'affiche à gauche, les infos à droite, le titre dans la police du Hero.

## Tests

- Clic sur une affiche ou un titre : la fiche du bon film s'ouvre, avec son résumé. × ferme, Échap ferme, un clic sur le fond noir ferme. La page ne remonte pas en haut (testé à 375 et 1440 px).
- Clic sur le reste de la carte : toujours le badge « Vu ».
- La modal Bootstrap « Plus d'infos » du Hero s'ouvre toujours, avec les mêmes couleurs qu'avant.
- Les exercices 1 à 4 marchent toujours. HTML validé W3C : 0 erreur.
- L'erreur `.webp` du Hero est toujours dans la console (elle existait avant le jour 4). Je la corrigerai à une prochaine étape.
