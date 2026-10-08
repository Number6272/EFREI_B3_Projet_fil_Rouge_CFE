# Jour 4, exercice 2 : compteur de films

Construit sur l'exercice 1. Le footer affiche maintenant « Catalogue : 6 films disponibles ».

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `js/script.js` | section `EXERCICE 2 : Compteur de films` remplie |
| `scss/pages/_exercices.scss` | style du compteur, sous le titre `/* Exercice 2 - Compteur de films */` |
| `css/` | recompilé |

`index.html` ne change pas : le paragraphe est créé par le JavaScript.

## Le JavaScript

```js
const filmCount = document.querySelectorAll("#catalogue article").length;
console.log("Nombre de films dans le catalogue :", filmCount);

const counter = document.createElement("p");
counter.className = "site-footer__count col-12";

if (filmCount > 1) {
  counter.textContent = "Catalogue : " + filmCount + " films disponibles";
} else {
  counter.textContent = "Catalogue : " + filmCount + " film disponible";
}

const footer = document.querySelector(".site-footer");
footer.appendChild(counter);
```

Étape par étape :

1. `querySelectorAll(...)` renvoie la liste des articles trouvés, et `.length` donne leur nombre.
2. `console.log` affiche ce nombre dans la console (F12), comme le conseille Marc.
3. `document.createElement("p")` crée un paragraphe vide. Il existe en mémoire, mais n'est pas encore sur la page.
4. `className` lui donne ses classes, et `textContent` son texte.
5. `footer.appendChild(counter)` l'ajoute à la fin du footer : c'est à ce moment qu'il apparaît.

Le script est chargé avec `defer` : il s'exécute quand tout le HTML est lu, donc « au chargement de la page », comme le demande la consigne.

## Pourquoi `#catalogue article` et pas `article`

La consigne propose `querySelectorAll('article').length`. Sur notre page, ça donne **15**, parce que les films de Tendances, Recommandés et Nouveautés sont aussi dans le catalogue. On n'a que **6 films différents**, et le texte dit « Catalogue : X films disponibles ». On compte donc les articles du catalogue seulement, où chaque film apparaît une fois.

Pour le vérifier, tape dans la console :

```js
document.querySelectorAll("article").length            // 15
document.querySelectorAll("#catalogue article").length // 6
```

## Le CSS

La consigne ne donne pas de CSS pour cet exercice. On ajoute juste un texte en gras, de la couleur du thème. La classe Bootstrap `col-12`, ajoutée dans le JS, fait prendre au compteur toute la largeur de la grille du footer, sur sa propre ligne.

## Tests

- Le footer affiche « Catalogue : 6 films disponibles » à 375 et 1440 px, et la console affiche `Nombre de films dans le catalogue : 6`.
- L'exercice 1 marche toujours.
- HTML validé W3C : 0 erreur, 0 avertissement. Aucun débordement horizontal.
- L'erreur `.webp` du Hero est toujours dans la console (elle existait avant le jour 4). Je la corrigerai à une prochaine étape.
