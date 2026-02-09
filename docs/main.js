// Translations
let currentLang = localStorage.getItem('lang') || 'en';
let currentTranslations = {};

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
}

async function translatePage(lang) {
  currentLang = lang;
  const translations = await loadTranslations(lang);
  currentTranslations = translations;
  applyTranslations(translations);
  syncAccordionLabels();
  localStorage.setItem('lang', lang);

  // Update language button states
  document.querySelectorAll('[data-language]').forEach((btn) => {
    btn.classList.toggle('current', btn.dataset.language === lang);
  });
}

function getReadLessLabel() {
  const inExperiences = (el) => el.closest('.experiences');
  const inEducation = (el) => el.closest('.education');
  return (span) => {
    if (inExperiences(span)) return currentTranslations?.experiences?.readless ?? 'Read less';
    if (inEducation(span)) return currentTranslations?.education?.readless ?? 'Read less';
    return 'Read less';
  };
}

function getReadMoreLabel() {
  const inExperiences = (el) => el.closest('.experiences');
  const inEducation = (el) => el.closest('.education');
  return (span) => {
    if (inExperiences(span)) return currentTranslations?.experiences?.readmore ?? 'Read more';
    if (inEducation(span)) return currentTranslations?.education?.readmore ?? 'Read more';
    return 'Read more';
  };
}

function syncAccordionLabels() {
  const getReadLess = getReadLessLabel();
  const getReadMore = getReadMoreLabel();
  document.querySelectorAll('.experience-info__container').forEach((container) => {
    const content = container.querySelector('.experience-info');
    const span = container.querySelector('.experience-info__description .read-more span');
    if (!content || !span) return;
    span.textContent = content.classList.contains('open') ? getReadLess(span) : getReadMore(span);
  });
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

  // Dark mode
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    darkModeToggle?.classList.add('active');
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
    darkModeToggle?.classList.remove('active');
  }

  darkModeToggle?.addEventListener('click', function () {
    const isDark = document.documentElement.classList.toggle('dark');
    darkModeToggle.classList.toggle('active');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // Accordion (Read more / Read less) – uses current language
  const getReadLess = getReadLessLabel();
  const getReadMore = getReadMoreLabel();

  document.querySelectorAll('.experience-info__container').forEach((container) => {
    const toggle = container.querySelector('.experience-info__description .read-more');
    const content = container.querySelector('.experience-info');
    const arrow = toggle?.querySelector('svg');
    const span = toggle?.querySelector('span');

    if (!toggle || !content || !span) return;

    toggle.addEventListener('click', () => {
      const isOpen = content.classList.contains('open');

      if (isOpen) {
        content.style.height = '0';
        content.style.visibility = 'hidden';
        content.classList.remove('open');
        span.textContent = getReadMore(span);
        if (arrow) arrow.style.transform = 'rotate(0deg)';
      } else {
        content.style.height = content.scrollHeight + 'px';
        content.style.visibility = 'visible';
        content.classList.add('open');
        span.textContent = getReadLess(span);
        if (arrow) arrow.style.transform = 'rotate(180deg)';
      }
    });
});

// Projects swiper
const swiper = new Swiper('.swiper', {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 10,
    centeredSlides: true,
    autoHeight: true,
    autoplay: {
      delay: 3000,
    },
    breakpoints: {
      701: {
        slidesPerView: 1.7,
        autoHeight: false,
      },
    },
    pagination: {
      el: '.swiper-pagination',
    },
  });
});
