// Translations
let currentLang = localStorage.getItem('lang') || 'en';

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

async function translatePage(lang) {
  currentLang = lang;
  const translations = await loadTranslations(lang);
  applyTranslations(translations);
  localStorage.setItem('lang', lang);

  // Update language button states
  document.querySelectorAll('[data-language]').forEach((btn) => {
    btn.classList.toggle('current', btn.dataset.language === lang);
  });

  const toggle = document.getElementById('nav-toggle');
  toggle.setAttribute('aria-label', translations.nav.menu);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Load initial language and apply translations
  await translatePage(currentLang);

  // Language switcher
  document.querySelectorAll('[data-language]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const lang = btn.dataset.language;
      if (lang && lang !== currentLang) await translatePage(lang);
    });
  });

  // Mobile menu
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  const setMenuOpen = (isOpen) => {
    navLinks.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  };

  navToggle.addEventListener('click', () => {
    setMenuOpen(!navLinks.classList.contains('open'));
  });

  navLinks.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenuOpen(false);
  });
});
