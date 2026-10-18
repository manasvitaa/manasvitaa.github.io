const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  navigation.classList.toggle('open', !expanded);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

const tabList = document.querySelector('.impact-tabs');
const tabs = [...tabList.querySelectorAll('button')];
tabList.setAttribute('role', 'tablist');
function selectTab(tab, focus = false) {
  tabs.forEach(button => {
    const selected = button === tab;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    button.classList.toggle('active', selected);
    document.getElementById(button.dataset.panel).hidden = !selected;
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  const panel = document.getElementById(tab.dataset.panel);
  tab.id = 'tab-' + tab.dataset.panel;
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', panel.id);
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', tab.id);
  panel.tabIndex = 0;
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectTab(tabs[next], true);
    }
  });
});
selectTab(tabs[0]);


document.querySelector('#year').textContent = new Date().getFullYear();
const copyEmail = document.querySelector('#copy-email');
const copyStatus = document.querySelector('#copy-status');
copyEmail.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('manasvitasharma@gmail.com');
    copyStatus.textContent = 'Email copied.';
  } catch {
    copyStatus.textContent = 'Select the email address above to copy it.';
  }
});

// Palette choices stay on this browser; storage restrictions do not block the UI.
const palettePicker = document.querySelector('#palette-picker');
const paletteButtons = [...document.querySelectorAll('[data-palette]')].filter(element => element.tagName === 'BUTTON');
const paletteColors = { sage: '#f7f8f4', mist: '#f5f7f8', rose: '#faf6f5' };
function applyPalette(palette, remember = true) {
  if (!Object.hasOwn(paletteColors, palette)) return;
  document.documentElement.dataset.palette = palette;
  paletteButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.palette === palette)));
  document.querySelector('meta[name="theme-color"]').content = paletteColors[palette];
  if (remember) {
    try { localStorage.setItem('ms-portfolio-palette', palette); } catch {}
  }
}
applyPalette(document.documentElement.dataset.palette || 'sage', false);
paletteButtons.forEach(button => button.addEventListener('click', () => applyPalette(button.dataset.palette)));
document.addEventListener('click', event => {
  if (!palettePicker.contains(event.target)) palettePicker.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && palettePicker.open) {
    palettePicker.open = false;
    palettePicker.querySelector('summary').focus();
  }
});

// Native dialogs provide modal focus management and Escape-to-close behavior.
const hobbyDialog = document.querySelector('#hobby-dialog');
const hobbyNotes = {
  cricket: { title: 'Cricket', description: 'I’m a huge cricket fan. A love of the game is one of the things I bring with me from home.' },
  reading: { title: 'Reading', description: 'I’m an avid reader. Books are one of the ways I enjoy exploring new ideas and perspectives.' },
  coffee: { title: 'Coffee', description: 'I enjoy exploring different coffees—one of my small pleasures outside work.' },
  cooking: { title: 'Cooking', description: 'An amateur cook, but getting better! I enjoy experimenting in the kitchen.' }
};
let hobbyTrigger;
document.querySelectorAll('[data-hobby]').forEach(button => {
  button.addEventListener('click', () => {
    const hobby = button.dataset.hobby;
    const note = hobbyNotes[hobby];
    if (!note) return;
    hobbyTrigger = button;
    document.querySelector('#hobby-title').textContent = note.title;
    document.querySelector('#hobby-description').textContent = note.description;
    document.querySelector('#hobby-dialog-symbol').setAttribute('href', '#icon-' + hobby);
    hobbyDialog.showModal();
  });
});
hobbyDialog.querySelector('.hobby-close').addEventListener('click', () => hobbyDialog.close());
hobbyDialog.addEventListener('close', () => hobbyTrigger?.focus());
hobbyDialog.addEventListener('click', event => {
  if (event.target !== hobbyDialog) return;
  const bounds = hobbyDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) hobbyDialog.close();
});

// One-time scroll reveals; content stays visible when motion is reduced or unsupported.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let revealObserver;
const revealElements = [...document.querySelectorAll('.section-heading, .about-layout, .experience-intro, .timeline-item, .approach-grid article, .beyond-column, .hobbies, .expertise-band > div')];
function configureMotion() {
  revealObserver?.disconnect();
  revealElements.forEach(element => element.classList.remove('is-waiting'));
  if (motionPreference.matches || !('IntersectionObserver' in window)) return;
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('is-waiting');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
  revealElements.forEach(element => {
    element.classList.add('reveal', 'is-waiting');
    revealObserver.observe(element);
  });
}
configureMotion();
motionPreference.addEventListener('change', configureMotion);

const pageSections = [...document.querySelectorAll('main > section[id]')];
const chapterLinks = [...document.querySelectorAll('[data-chapter-link]')];
const mainNavigationLinks = [...navigation.querySelectorAll('a[href^="#"]')];
let currentChapter;
function updateCurrentChapter() {
  let chapter = pageSections[0];
  const readingPosition = Math.min(window.innerHeight * 0.34, 300);
  pageSections.forEach(section => {
    if (section.getBoundingClientRect().top <= readingPosition) chapter = section;
  });
  const bottom = document.documentElement.scrollHeight - window.innerHeight;
  if (bottom > 0 && window.scrollY >= bottom - 4) chapter = pageSections.at(-1);
  if (!chapter || chapter.id === currentChapter) return;
  currentChapter = chapter.id;
  document.documentElement.dataset.chapter = currentChapter;
  [...chapterLinks, ...mainNavigationLinks].forEach(link => {
    const selected = link.getAttribute('href') === '#' + currentChapter;
    if (selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

const scrollProgress = document.querySelector('.scroll-progress');
let scrollFrame;
function updateScrollProgress() {
  const range = document.documentElement.scrollHeight - window.innerHeight;
  const progress = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
  scrollProgress.style.transform = 'scaleX(' + progress + ')';
  updateCurrentChapter();
  scrollFrame = undefined;
}
window.addEventListener('scroll', () => {
  if (scrollFrame === undefined) scrollFrame = requestAnimationFrame(updateScrollProgress);
}, { passive: true });
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();

// A slight photographic tilt adds depth for mouse users; touch and reduced motion stay still.
const heroVisual = document.querySelector('.hero-visual');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
function resetPhotoTilt() {
  heroVisual.style.setProperty('--tilt-x', '0deg');
  heroVisual.style.setProperty('--tilt-y', '0deg');
}
heroVisual.addEventListener('pointermove', event => {
  if (motionPreference.matches || !finePointer.matches) return;
  const bounds = heroVisual.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  heroVisual.style.setProperty('--tilt-x', (y * -5).toFixed(2) + 'deg');
  heroVisual.style.setProperty('--tilt-y', (x * 5).toFixed(2) + 'deg');
});
heroVisual.addEventListener('pointerleave', resetPhotoTilt);
motionPreference.addEventListener('change', resetPhotoTilt);
finePointer.addEventListener('change', resetPhotoTilt);
