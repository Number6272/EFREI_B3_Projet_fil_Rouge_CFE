const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const THEME_KEY = "streamflix-theme";

root.classList.add("js");

function initTheme() {
  const inputs = document.querySelectorAll('input[name="theme"]');

  function applyTheme(value) {
    const input = document.querySelector(`input[name="theme"][value="${value}"]`);
    if (!input) return;
    input.checked = true;
    root.dataset.theme = value;
    root.dataset.bsTheme = value === "sombre" ? "dark" : "light";
  }

  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) applyTheme(saved);
  } catch (error) {}

  inputs.forEach((input) => {
    input.addEventListener("change", () => {
      applyTheme(input.value);
      try {
        localStorage.setItem(THEME_KEY, input.value);
      } catch (error) {}
    });
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => root.classList.add("theme-ready"));
  });
}

function initHeader() {
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".hero");
  if (!header) return;

  let scrolled = false;
  let ticking = false;

  new ResizeObserver(() => {
    root.style.setProperty("--header-height", `${header.offsetHeight}px`);
  }).observe(header);

  function update() {
    const y = window.scrollY;

    if (!scrolled && y > 120) {
      scrolled = true;
      header.classList.add("is-scrolled");
    } else if (scrolled && y < 40) {
      scrolled = false;
      header.classList.remove("is-scrolled");
    }

    if (hero && !reduceMotion.matches) {
      const progress = Math.min(y, hero.offsetHeight);
      hero.style.setProperty("--parallax", progress.toFixed(1));
    }

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );

  update();
}

function initSectionNav() {
  const list = document.querySelector(".section-nav__list");
  const breadcrumb = document.querySelector(".breadcrumb");
  if (!list) return;

  const nav = list.parentElement;
  const links = [...list.querySelectorAll(".section-nav__link")];
  const hero = document.querySelector(".hero");
  const sections = [hero, ...links.map((link) => document.querySelector(link.hash))].filter(Boolean);
  let current = null;

  function moveIndicator(link) {
    if (!link) {
      list.style.setProperty("--indicator-width", "0px");
      return;
    }
    list.style.setProperty("--indicator-x", `${link.offsetLeft}px`);
    list.style.setProperty("--indicator-width", `${link.offsetWidth}px`);
    nav.scrollTo({
      left: link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2,
      behavior: reduceMotion.matches ? "auto" : "smooth",
    });
  }

  function sectionLabel(section) {
    if (section.dataset.breadcrumb) return section.dataset.breadcrumb;
    const heading = section.querySelector("h2");
    return heading ? heading.textContent.trim() : section.id;
  }

  function renderBreadcrumb(section) {
    if (!breadcrumb) return;
    const items = [{ label: "Accueil", href: "index.html" }];
    const page = window.location.pathname.split("/").pop();

    if (page && page !== "index.html") {
      items.push({ label: document.title.split(":")[0].trim(), href: page });
    }
    items.push({ label: sectionLabel(section), href: `#${section.id}` });

    const ol = breadcrumb.querySelector("ol");
    ol.replaceChildren(
      ...items.map((item, index) => {
        const li = document.createElement("li");
        if (index === items.length - 1) {
          const span = document.createElement("span");
          span.setAttribute("aria-current", "location");
          span.textContent = item.label;
          li.append(span);
        } else {
          const a = document.createElement("a");
          a.href = item.href;
          a.textContent = item.label;
          li.append(a);
        }
        return li;
      })
    );
    breadcrumb.hidden = false;
  }

  function setActive(section) {
    if (section === current) return;
    current = section;
    let activeLink = null;

    links.forEach((link) => {
      if (link.hash === `#${section.id}`) {
        link.setAttribute("aria-current", "true");
        activeLink = link;
      } else {
        link.removeAttribute("aria-current");
      }
    });

    moveIndicator(activeLink);
    renderBreadcrumb(section);
  }

  const visible = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });

      const line = window.innerHeight * 0.4;
      const candidates = sections.filter((section) => visible.has(section));
      const above = candidates.filter((section) => section.getBoundingClientRect().top <= line);
      const target = above.length ? above[above.length - 1] : candidates[0];
      if (target) setActive(target);
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
  if (hero) setActive(hero);

  window.addEventListener("resize", () => {
    const link = links.find((item) => item.hasAttribute("aria-current"));
    if (link) moveIndicator(link);
  });
}

function initReveal() {
  const groups = document.querySelectorAll(".film-grid, .masonry");

  groups.forEach((group) => {
    [...group.children].forEach((item, index) => item.style.setProperty("--i", index));
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );

  groups.forEach((group) => observer.observe(group));
}

function initSkeletons() {
  document.querySelectorAll(".film-card__poster").forEach((img) => {
    const done = () => img.classList.add("is-loaded");
    if (img.complete && img.naturalWidth) {
      done();
    } else {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
  });
}

function initMasonry() {
  const grid = document.querySelector(".masonry");
  if (!grid || CSS.supports("grid-template-rows", "masonry")) return;

  grid.classList.add("masonry--js");
  const items = [...grid.children];
  let positions = new Map();
  let lastWidth = grid.clientWidth;

  function layout() {
    const style = getComputedStyle(grid);
    const rowHeight = parseFloat(style.gridAutoRows);
    const gap = parseFloat(style.rowGap) || 0;

    items.forEach((item) => {
      const height = item.firstElementChild.offsetHeight;
      const span = Math.ceil((height + gap) / (rowHeight + gap));
      item.style.gridRowEnd = `span ${span}`;
    });
  }

  function measure() {
    return new Map(items.map((item) => [item, { x: item.offsetLeft, y: item.offsetTop }]));
  }

  function flip(item, dx, dy) {
    item.style.transition = "none";
    item.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        item.style.transition = "";
        item.style.transform = "";
      });
    });
  }

  function update(animate) {
    layout();
    const next = measure();

    if (animate && !reduceMotion.matches) {
      items.forEach((item) => {
        const before = positions.get(item);
        const after = next.get(item);
        if (!before) return;
        const dx = before.x - after.x;
        const dy = before.y - after.y;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) flip(item, dx, dy);
      });
    }

    positions = next;
  }

  const observer = new ResizeObserver(() => {
    const width = grid.clientWidth;
    update(width !== lastWidth);
    lastWidth = width;
  });

  observer.observe(grid);
  items.forEach((item) => observer.observe(item.firstElementChild));
  update(false);
}

function initHeroFallback() {
  const img = document.querySelector(".hero__background");
  if (!img) return;
  const picture = img.closest("picture");

  function fallback() {
    if (!picture) return;
    picture.querySelectorAll("source").forEach((source) => source.remove());
    img.src = "images/hero-bg.jpg";
  }

  if (img.complete && img.naturalWidth === 0) {
    fallback();
  } else {
    img.addEventListener("error", fallback, { once: true });
  }
}

function initSearch() {
  const form = document.querySelector(".search-form");
  const input = document.querySelector("#search");
  const list = document.querySelector("#suggestions");
  if (!form || !input || !list) return;

  const normalize = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const films = [...document.querySelectorAll("#catalogue .film-card")].map((card) => {
    const title = card.querySelector(".film-card__title");
    const genres = [...card.querySelectorAll(".film-card__genres li")].map((item) => item.textContent.trim());
    return { title: title.textContent.trim(), genres, heading: title, card };
  });

  let matches = [];
  let active = -1;

  function close() {
    list.hidden = true;
    list.replaceChildren();
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    matches = [];
    active = -1;
  }

  function highlight(index) {
    [...list.children].forEach((option, i) => {
      option.classList.toggle("active", i === index);
      option.setAttribute("aria-selected", String(i === index));
    });
    active = index;
    input.setAttribute("aria-activedescendant", `suggestion-${index}`);
  }

  function markTitle(title, query) {
    const span = document.createElement("span");
    span.className = "search-suggestions__title";
    const start = normalize(title).indexOf(query);

    if (start === -1) {
      span.textContent = title;
      return span;
    }

    const mark = document.createElement("mark");
    mark.textContent = title.slice(start, start + query.length);
    span.append(title.slice(0, start), mark, title.slice(start + query.length));
    return span;
  }

  function option(film, index, query) {
    const item = document.createElement("li");
    item.id = `suggestion-${index}`;
    item.className = "list-group-item list-group-item-action search-suggestions__item";
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", "false");

    const genres = document.createElement("span");
    genres.className = "search-suggestions__genres";
    genres.textContent = film.genres.join(", ");

    item.append(markTitle(film.title, query), genres);
    item.addEventListener("mousedown", (event) => {
      event.preventDefault();
      choose(film);
    });
    return item;
  }

  function render() {
    const query = normalize(input.value.trim());
    if (!query) {
      close();
      return;
    }

    matches = films.filter(
      (film) => normalize(film.title).includes(query) || film.genres.some((genre) => normalize(genre).includes(query))
    );
    active = -1;
    input.removeAttribute("aria-activedescendant");

    if (matches.length) {
      list.replaceChildren(...matches.map((film, index) => option(film, index, query)));
    } else {
      const empty = document.createElement("li");
      empty.className = "list-group-item search-suggestions__empty";
      empty.setAttribute("role", "option");
      empty.setAttribute("aria-disabled", "true");
      empty.setAttribute("aria-selected", "false");
      empty.textContent = "Aucun film trouvé";
      list.replaceChildren(empty);
    }

    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function choose(film) {
    close();
    input.value = film.title;

    const menu = form.closest(".navbar-collapse");
    if (menu && menu.classList.contains("show") && window.bootstrap) {
      bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }

    film.card.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
    film.heading.querySelector("a").focus({ preventScroll: true });
    film.card.classList.add("is-found");
    setTimeout(() => film.card.classList.remove("is-found"), 2500);
  }

  input.addEventListener("input", render);
  input.addEventListener("focus", render);
  input.addEventListener("blur", close);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (!matches.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      highlight((active + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      highlight(active <= 0 ? matches.length - 1 : active - 1);
    } else if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      choose(matches[active]);
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    render();
    if (matches.length) choose(matches[0]);
  });
}

initTheme();
initHeader();
initSectionNav();
initReveal();
initSkeletons();
initMasonry();
initHeroFallback();
initSearch();

// ===================================
// EXERCICE 1 : Afficher/masquer sections
// ===================================

// Tous les boutons « Masquer » (un au-dessus de chaque section de films)
const sectionButtons = document.querySelectorAll(".section-toggle");

sectionButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    // On remonte jusqu'à la section du bouton, puis on cherche son contenu (intro + films).
    // Le bouton n'est pas dans ce contenu : il reste visible pour pouvoir réafficher.
    const section = button.closest(".film-section");
    const content = section.querySelector(".film-section__content");

    // toggle ajoute la classe .hidden si elle est absente, la retire sinon
    content.classList.toggle("hidden");

    // Le texte du bouton suit l'état de la section
    if (content.classList.contains("hidden")) {
      button.textContent = "Afficher";
      button.setAttribute("aria-expanded", "false");
    } else {
      button.textContent = "Masquer";
      button.setAttribute("aria-expanded", "true");
    }
  });
});

// ===================================
// EXERCICE 2 : Compteur de films
// ===================================

// On compte les <article> du catalogue : c'est là que chaque film apparaît une seule fois.
// querySelectorAll("article") compterait 15 cartes, car les films de Tendances,
// Recommandés et Nouveautés sont aussi dans le catalogue (6 films différents).
const filmCount = document.querySelectorAll("#catalogue article").length;
console.log("Nombre de films dans le catalogue :", filmCount);

// Création du paragraphe qui affichera le résultat
const counter = document.createElement("p");
counter.className = "site-footer__count col-12";

// Texte au pluriel ou au singulier selon le nombre de films
if (filmCount > 1) {
  counter.textContent = "Catalogue : " + filmCount + " films disponibles";
} else {
  counter.textContent = "Catalogue : " + filmCount + " film disponible";
}

// Ajout du paragraphe à la fin du footer
const footer = document.querySelector(".site-footer");
footer.appendChild(counter);

// ===================================
// EXERCICE 3 : Films vus
// ===================================

// Toutes les cartes de films de la page (les 15 cartes, dans toutes les sections)
const filmCards = document.querySelectorAll(".film-card");

// Un event listener sur chaque carte
filmCards.forEach(function (card) {
  card.addEventListener("click", function (event) {
    // event.target = l'élément exact sur lequel on a cliqué (affiche, titre, texte, bouton…).
    // closest() regarde si l'élément cliqué est (ou est dans) l'affiche, le titre ou un bouton :
    // - affiche ou titre → c'est la modal de l'exercice 5 qui s'en occupe
    // - bouton « Ma liste » → ce n'est pas un clic « vu »
    if (event.target.closest(".film-card__poster, .film-card__title, button")) {
      return;
    }

    // toggle ajoute la classe .watched si elle est absente, la retire sinon.
    // Le badge « ✓ Vu » est dessiné par le CSS (.watched::after)
    card.classList.toggle("watched");
  });
});

// ===================================
// EXERCICE 4 : Recherche
// ===================================

// Le champ de recherche du header (renommé #search). Il garde aussi ses suggestions du jour 3.
const searchInput = document.querySelector("#search");

// Met le texte en minuscules et retire les accents : « Comédie » devient « comedie »
function normalizeText(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Les sections qui contiennent des cartes de films (pas le carrousel « À ne pas manquer »)
const filmSections = [...document.querySelectorAll(".film-section")].filter(
  (section) => section.querySelector("article")
);

// Un message « Aucun résultat » par section, créé une fois et caché au départ
filmSections.forEach((section) => {
  const message = document.createElement("p");
  message.className = "search-empty";
  message.hidden = true;
  section.querySelector(".film-section__content").appendChild(message);
});

searchInput.addEventListener("input", function () {
  const searchTerm = normalizeText(this.value.trim());

  filmSections.forEach((section) => {
    const articles = section.querySelectorAll("article");
    let visibleCount = 0;

    articles.forEach((article) => {
      // On cherche dans le titre et dans les genres (comme les suggestions du jour 3)
      const title = normalizeText(article.querySelector("h3").textContent);
      const genreList = article.querySelector(".film-card__genres");
      const genres = genreList ? normalizeText(genreList.textContent) : "";

      // On cache le <li> qui contient la carte, sinon sa colonne vide resterait dans la grille.
      // "" au lieu de "block" : le <li> reprend le display prévu par le CSS (flex)
      const item = article.closest("li");

      if (title.includes(searchTerm) || genres.includes(searchTerm)) {
        item.style.display = "";
        visibleCount++;
      } else {
        item.style.display = "none";
      }
    });

    // Message « Aucun résultat » si plus aucun film n'est visible dans cette section
    const message = section.querySelector(".search-empty");
    message.textContent = "Aucun résultat pour « " + this.value.trim() + " » dans cette section.";
    message.hidden = visibleCount > 0;
  });
});

// ===================================
// EXERCICE 5 : Modal
// ===================================

// Les id #modal et #modal-body sont ceux de la consigne. Les classes sont renommées
// (.simple-modal…) car .modal existe déjà dans Bootstrap (voir _exercices.scss).
const modal = document.querySelector("#modal");
const closeButton = document.querySelector(".simple-modal__close");

// Élément qui avait le focus avant l'ouverture (on y revient à la fermeture)
let lastFocused = null;

// Fonction fournie, complétée : elle reçoit toutes les infos du film, pas seulement le titre
function openModal(film) {
  const modalBody = document.querySelector("#modal-body");

  modalBody.innerHTML = `
    <h2>${film.title}</h2>
    <div class="simple-modal__film">
      <img class="simple-modal__poster" src="${film.poster}" alt="${film.alt}" width="300" height="450">
      <div class="simple-modal__infos">
        <p class="simple-modal__meta">${film.year} · ${film.duration} · ${film.rating}</p>
        <p>${film.genres}</p>
        <p>${film.synopsis}</p>
      </div>
    </div>
  `;
  modal.style.display = "block";

  // Le focus va sur × : au clavier, Entrée ferme tout de suite la modal
  lastFocused = document.activeElement;
  closeButton.focus();
}

// Fonction fournie, complétée : le focus revient où il était avant l'ouverture
function closeModal() {
  modal.style.display = "none";

  if (lastFocused) {
    lastFocused.focus();
  }
}

// Récupère les infos du film cliqué, en les lisant dans le HTML de sa carte
function getFilmInfos(card) {
  const title = card.querySelector("h3").textContent.trim();
  const poster = card.querySelector(".film-card__poster");
  const times = card.querySelectorAll(".film-card__meta time");
  const rating = card.querySelector(".film-card__meta data");
  const genres = card.querySelectorAll(".film-card__genres li");

  // Seules les cartes du catalogue ont un résumé : pour les autres sections,
  // on va le chercher dans la carte du catalogue qui a le même titre
  let synopsis = card.querySelector(".film-card__synopsis");
  if (!synopsis) {
    document.querySelectorAll("#catalogue .film-card").forEach(function (catalogueCard) {
      if (catalogueCard.querySelector("h3").textContent.trim() === title) {
        synopsis = catalogueCard.querySelector(".film-card__synopsis");
      }
    });
  }

  return {
    title: title,
    poster: poster.getAttribute("src"),
    alt: poster.getAttribute("alt"),
    year: times[0].textContent,
    duration: times[1].textContent,
    rating: rating.textContent + "/5",
    genres: [...genres].map((genre) => genre.textContent).join(", "),
    synopsis: synopsis ? synopsis.textContent : "",
  };
}

// Event listeners sur les films : clic sur l'affiche ou sur le titre → ouverture de la modal
filmCards.forEach(function (card) {
  card.addEventListener("click", function (event) {
    if (!event.target.closest(".film-card__poster, .film-card__title")) {
      return;
    }

    // Le titre est un lien href="#" : on empêche le retour en haut de page
    event.preventDefault();
    openModal(getFilmInfos(card));
  });
});

// Event listener sur le bouton close (×) → fermeture
closeButton.addEventListener("click", closeModal);

// En plus : clic sur le fond noir (en dehors de la boîte blanche) → fermeture
modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    closeModal();
  }
});

// En plus : touche Échap → fermeture
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && modal.style.display === "block") {
    closeModal();
  }
});
