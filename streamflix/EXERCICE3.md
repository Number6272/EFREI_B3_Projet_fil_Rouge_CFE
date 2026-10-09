# Jour 4, exercice 3 : marquer un film comme « vu »

Construit sur l'exercice 2. Un clic sur une carte de film ajoute le badge vert « ✓ Vu » et rend la carte plus pâle. Un nouveau clic les retire.

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `js/script.js` | section `EXERCICE 3 : Films vus` remplie |
| `scss/pages/_exercices.scss` | CSS de la consigne (`.watched` et `.watched::after`) + un complément |
| `index.html` | une phrase d'astuce sous « Tendances actuelles » |
| `css/` | recompilé |

## Le JavaScript

```js
const filmCards = document.querySelectorAll(".film-card");

filmCards.forEach(function (card) {
  card.addEventListener("click", function (event) {
    if (event.target.closest("button, a")) {
      return;
    }
    card.classList.toggle("watched");
  });
});
```

Étape par étape :

1. **Event listener sur plusieurs éléments :** `querySelectorAll(".film-card")` récupère les 15 cartes, et `forEach` pose un `addEventListener("click")` sur chacune.
2. **`event` :** la fonction reçoit un objet qui décrit le clic. `event.target`, c'est l'élément exact sur lequel on a cliqué : l'affiche, le titre, une année, le bouton « Ma liste »…
3. **Pourquoi on regarde `event.target` :** la carte contient un bouton « Ma liste » et un lien sur le titre. Cliquer dessus ne doit pas marquer le film comme vu. `event.target.closest("button, a")` répond à la question « l'élément cliqué est-il un bouton ou un lien, ou se trouve-t-il dedans ? ». Si oui, `return` arrête la fonction.
4. **`classList.toggle("watched")` :** ajoute la classe si elle n'y est pas, la retire si elle y est. On utilise `card` (la carte entière) et non `event.target`, sinon la classe irait sur l'image ou sur le texte cliqué.

Pour voir `event.target` avec `console.log()` : ajoute `console.log(event.target);` en première ligne de la fonction, puis clique à plusieurs endroits d'une carte.

## Le CSS

Les règles de la consigne sont recopiées telles quelles :

```css
.watched {
  opacity: 0.6;
  position: relative;
}

.watched::after {
  content: "✓ Vu";
  position: absolute;
  top: 10px;
  right: 10px;
  background: green;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
}
```

**Le complément, et pourquoi il faut un complément :** nos cartes utilisaient déjà `::after`. Dans `components/_cards.scss`, `.film-card::after` est le reflet lumineux qui traverse la carte au survol. Il couvre toute la carte (`inset: 0`) et il est invisible (`opacity: 0`). Une balise n'a qu'un seul `::after` : le badge récupérait donc ces réglages. Il s'étirait sur toute la carte et restait invisible. Le complément remet `left: auto`, `bottom: auto` et `opacity: 1`.

Il est écrit `.film-card.watched::after` (2 classes) pour être plus précis que `.film-card:hover::after`. Sinon, au survol, le badge redeviendrait presque transparent.

Deux petits ajouts en plus :

- Sur les grandes cartes (affiche à gauche, texte à droite), le titre laisse de la place au badge pour ne pas passer dessous.
- `cursor: pointer` sur les cartes : la main montre qu'on peut cliquer.

## Tests

- Clic sur l'affiche, le texte ou l'année : le badge apparaît, la carte passe à 60 % d'opacité. Re-clic : tout disparaît (testé à 375 et 1440 px).
- Clic sur « Ma liste » ou sur le titre : pas de badge.
- Le badge reste visible au survol, et chaque carte est indépendante.
- Les exercices 1 et 2 marchent toujours. HTML validé W3C : 0 erreur.
- L'erreur `.webp` du Hero est toujours dans la console (elle existait avant le jour 4). Je la corrigerai à une prochaine étape.
