# Jour 4, exercice 6 (bonus) : changement de thème

Construit sur l'exercice 5. Un bouton « Mode clair / Mode sombre » est ajouté dans le header. Au clic, la classe `.dark-theme` est ajoutée ou retirée sur `<body>`, et le texte du bouton change.

Cette étape corrige aussi la dernière erreur de la console (voir en bas).

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `index.html` | le bouton `#theme-toggle` dans le header, après les pastilles de thème. La ligne des images `.webp` du Hero est retirée |
| `js/script.js` | section `EXERCICE 6 : Changement de thème (bonus)` ajoutée à la fin |
| `scss/pages/_exercices.scss` | `.dark-theme` de la consigne + style du bouton |
| `css/` | recompilé |

## Le HTML

```html
<button class="btn btn-sm theme-toggle" id="theme-toggle" type="button">Mode clair</button>
```

Il est placé dans la zone utilisateur du header, à côté des 3 pastilles de thème du jour 2. Sur mobile, on le trouve dans le menu ☰.

## Le JavaScript

```js
themeButton.addEventListener("click", function () {
  document.body.classList.toggle("dark-theme");
  updateThemeButton();
  …
});

function updateThemeButton() {
  if (document.body.classList.contains("dark-theme")) {
    themeButton.textContent = "Mode clair";
  } else {
    themeButton.textContent = "Mode sombre";
  }
}
```

- **`document.body.classList.toggle("dark-theme")`** : `document.body` est la balise `<body>`. On lui ajoute la classe, ou on la retire si elle y est déjà.
- **Modification conditionnelle du texte** : le bouton propose toujours l'**autre** mode. En sombre, il affiche « Mode clair », et inversement.

## Cohabitation avec les 3 pastilles du jour 2

La page avait déjà un sélecteur de thème (Sombre, Clair, Cinéma), qui change toutes les couleurs et mémorise le choix. Si le bouton ne faisait que poser `.dark-theme`, on aurait deux systèmes de thème qui se contredisent : pastille « Clair » cochée, mais `<body>` en `.dark-theme`. Les deux sont donc synchronisés :

| Action | Résultat |
|---|---|
| clic sur le bouton | `.dark-theme` change, puis la pastille Sombre ou Clair est cochée. `dispatchEvent(new Event("change"))` prévient le code du jour 2, qui applique toutes les couleurs et sauvegarde le choix |
| clic sur une pastille (même Cinéma) | `syncDarkTheme()` met `.dark-theme` seulement si « Sombre » est coché, et met le texte du bouton à jour |
| rechargement de la page | le thème sauvegardé est restauré, puis `syncDarkTheme()` remet la classe et le bon texte |

`classList.toggle("dark-theme", isDark)` : avec un 2e argument, `toggle` **ajoute** la classe si c'est `true` et la **retire** si c'est `false`. C'est pratique pour synchroniser.

## Le CSS

```css
.dark-theme {
  background-color: #1a1a1a;
  color: #ffffff;
}
```

Les valeurs sont celles de la consigne. `#1a1a1a` n'a pas d'équivalent en couleur nommée, donc on le garde en hexadécimal, avec un commentaire. `.dark-theme` (une classe) est plus précis que `body` (une balise) : son fond gagne sur celui du thème. En mode sombre, le fond de la page passe ainsi du noir au gris très foncé de la consigne.

Le bouton a le même style en pilule que les boutons « Masquer » de l'exercice 1.

## Correction : plus aucune erreur dans la console

Le Hero demandait `images/hero-bg-768.webp`, `-1280.webp` et `-1920.webp` (bonus du jour 2). Ces fichiers n'existent pas dans ton dossier `images/`, donc la console affichait `Failed to load resource: net::ERR_FILE_NOT_FOUND`. Or la consigne demande « pas d'erreurs dans la console ». La ligne `<source>` est retirée du `<picture>` : le Hero charge directement `hero-bg.jpg`. Si tu crées un jour ces 3 images WebP, tu pourras remettre la ligne.

## Tests

- Bouton : sombre ↔ clair, avec le texte qui change, à 375 px (dans le menu ☰), 1024 px et 1440 px.
- Pastille Cinéma, puis bouton : retour en sombre. Le choix est gardé après rechargement.
- **Console : 0 erreur, 0 avertissement.**
- HTML validé W3C : 0 erreur, 0 avertissement. Aucun débordement horizontal.
- Les exercices 1 à 5 marchent toujours.

## Bilan du jour 4

| Critère de réussite | État |
|---|---|
| Minimum 3 exercices terminés | ✅ les 6, bonus compris |
| Code commenté et organisé | ✅ `script.js` suit la structure de la consigne (EXERCICE 1 à 6). Le CSS des exercices est regroupé dans `scss/pages/_exercices.scss`, avec les titres de la consigne |
| Pas d'erreurs dans la console | ✅ 0 erreur |
| Fonctionnalités testées et opérationnelles | ✅ à 375, 1024 et 1440 px (voir les fichiers `EXERCICE1.md` à `EXERCICE6.md`) |
