// Translations
let currentLang = localStorage.getItem('lang') || 'en';
let currentTranslations = null;

async function loadTranslations(lang) {
  const res = await fetch(new URL(`i18n/${lang}.json`, window.location.href).href);
  if (!res.ok) throw new Error(`Failed to load ${lang}.json`);
  return res.json();
}

function applyTranslations(translations) {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const keys = el.dataset.i18n.split('.');
    let text = translations;
    for (const k of keys) {
      text = text?.[k];
    }
    if (text != null && typeof text === 'string') {
      if (text.includes('<')) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    }
  });
  document.documentElement.lang = currentLang;
  document.querySelector('meta[name="description"]').content = translations.hero.statement;
}

function updateMenuLabel() {
  const toggle = document.getElementById('nav-toggle');
  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-label', isOpen ? currentTranslations.nav.close : currentTranslations.nav.menu);
}

async function translatePage(lang) {
  currentLang = lang;
  const translations = await loadTranslations(lang);
  currentTranslations = translations;
  applyTranslations(translations);
  localStorage.setItem('lang', lang);

  // Highlight the current language in the button
  const languageToggle = document.getElementById('language-toggle');
  languageToggle.querySelectorAll('[data-language]').forEach((el) => {
    el.classList.toggle('current', el.dataset.language === lang);
  });
  languageToggle.setAttribute('aria-label', lang === 'en' ? 'Passer en français' : 'Switch to English');

  updateMenuLabel();
}

document.addEventListener('DOMContentLoaded', async () => {
  // Load initial language and apply translations
  await translatePage(currentLang);

  // Language switcher
  document.getElementById('language-toggle').addEventListener('click', () => {
    translatePage(currentLang === 'en' ? 'fr' : 'en');
  });

  // Mobile menu
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navOverlay = document.getElementById('nav-overlay');
  const header = document.querySelector('.header');

  const setMenuOpen = (isOpen) => {
    navLinks.classList.toggle('open', isOpen);
    navOverlay.classList.toggle('open', isOpen);
    header.classList.toggle('menu-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    updateMenuLabel();
  };

  navToggle.addEventListener('click', () => {
    setMenuOpen(!navLinks.classList.contains('open'));
  });

  navOverlay.addEventListener('click', () => setMenuOpen(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenuOpen(false);
  });

  window.matchMedia('(min-width: 861px)').addEventListener('change', () => setMenuOpen(false));

  // Hide the header on scroll down, reveal it on scroll up
  const scrollThreshold = 6;
  let lastScrollY = Math.max(window.scrollY, 0);

  window.addEventListener('scroll', () => {
    const scrollY = Math.max(window.scrollY, 0);
    header.classList.toggle('header-scrolled', scrollY > 0);
    if (navLinks.classList.contains('open')) return;

    const delta = scrollY - lastScrollY;
    if (scrollY <= header.offsetHeight) {
      header.classList.remove('header-hidden');
    } else if (Math.abs(delta) >= scrollThreshold) {
      header.classList.toggle('header-hidden', delta > 0);
    } else {
      return;
    }
    lastScrollY = scrollY;
  }, { passive: true });

  // Section links land on the exact top of the section. The header hides on
  // the way down and stays visible on the way up, so only then offset by it.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.hash);
      if (!target) return;
      e.preventDefault();
      setMenuOpen(false);

      const targetTop = target.id === 'top' ? 0 : target.getBoundingClientRect().top + window.scrollY;
      const isScrollingUp = targetTop < window.scrollY;
      const top = isScrollingUp && target.id !== 'top' ? targetTop - header.offsetHeight : targetTop;

      window.scrollTo({ top, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      history.pushState(null, '', link.hash);
    });
  });
});
