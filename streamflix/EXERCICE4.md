# Jour 4, exercice 4 : recherche simple

Construit sur l'exercice 3. Quand on tape dans le champ de recherche du header, les films qui ne correspondent pas disparaissent. Une section qui n'a plus aucun film affiche « Aucun résultat ».

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `index.html` | le champ de recherche s'appelle maintenant `id="search"` (avant : `recherche`), et son `<label for="search">` aussi |
| `js/script.js` | section `EXERCICE 4 : Recherche` remplie. Dans `initSearch()` (jour 3), `#recherche` devient `#search` |
| `scss/pages/_exercices.scss` | style du message « Aucun résultat » |
| `css/` | recompilé |

## Pourquoi renommer le champ au lieu d'en ajouter un

La page avait déjà un champ de recherche dans le header, avec les suggestions du bonus du jour 3. Deux champs de recherche sur la même page, ce serait déroutant. Le champ est donc renommé `#search`, comme dans la consigne, et deux codes l'écoutent :

- les suggestions du jour 3, qui s'affichent sous le champ ;
- le filtrage de l'exercice 4, qui cache les films de la page.

Un même élément peut avoir plusieurs `addEventListener("input")` : ils s'exécutent tous.

## Le JavaScript, et ce qui change par rapport à la fonction fournie

La structure est celle de la consigne : `addEventListener('input')`, `this.value`, `forEach` sur les articles, `includes()`, `style.display`. Quatre adaptations :

| Fonction fournie | Notre version | Pourquoi |
|---|---|---|
| `article.style.display = 'none'` | on cache le `<li>` qui contient l'article (`article.closest("li")`) | chaque carte est dans une colonne Bootstrap (`<li class="col-…">`). Si on ne cache que l'article, la colonne vide reste et laisse un trou dans la grille |
| `style.display = 'block'` | `style.display = ""` | `""` efface le style ajouté en JS : le `<li>` reprend le `display: flex` prévu par le CSS. Avec `"block"`, la carte ne prendrait plus toute la hauteur de sa colonne |
| titre seulement | titre **et** genres | les suggestions du jour 3 cherchent aussi dans les genres. Sinon, « drame » proposerait des films dans les suggestions mais les cacherait tous dans la page |
| `toLowerCase()` | `normalizeText()` : minuscules **et** accents retirés | « comedie » trouve « Comédie ». On l'applique au titre et à la recherche |

`this.value.trim()` retire les espaces au début et à la fin. Quand le champ est vide, `includes("")` vaut toujours `true` : tous les films réapparaissent.

## Le message « Aucun résultat »

```js
filmSections.forEach((section) => {
  const message = document.createElement("p");
  message.className = "search-empty";
  message.hidden = true;
  section.querySelector(".film-section__content").appendChild(message);
});
```

Au chargement, chaque section de films reçoit un paragraphe caché, créé avec `createElement` et `appendChild` comme à l'exercice 2. À chaque frappe, on compte les films encore visibles dans la section (`visibleCount`). S'il n'y en a aucun, le message s'affiche, par exemple « Aucun résultat pour « zzz » dans cette section ». La propriété `hidden` cache ou montre le message.

Le message est par section, car le filtrage touche toute la page. Si on tape « matrix », Tendances et Nouveautés disent qu'elles n'ont pas ce film, et Recommandés et Catalogue le montrent.

## Tests

| Recherche | Résultat |
|---|---|
| `mat` ou `MATRIX` | The Matrix seul dans Recommandés et Catalogue, « Aucun résultat » dans Tendances et Nouveautés |
| `drame` | tous les films du genre Drame |
| `comedie` (sans accent) | Forrest Gump, dans le catalogue |
| `zzz` | « Aucun résultat » dans les 4 sections |
| champ vidé | tous les films reviennent, la grille est intacte |

- Testé à 375 px (menu ☰ ouvert) et à 1440 px. Les suggestions du jour 3 marchent toujours.
- Les exercices 1, 2 et 3 marchent toujours. HTML validé W3C : 0 erreur.
- L'erreur `.webp` du Hero est toujours dans la console (elle existait avant le jour 4). Je la corrigerai à une prochaine étape.
