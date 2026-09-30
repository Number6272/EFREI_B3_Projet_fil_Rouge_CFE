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

initTheme();
initHeader();
initSectionNav();
initReveal();
initSkeletons();
initMasonry();
initHeroFallback();
