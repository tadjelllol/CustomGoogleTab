'use strict';

const BACKGROUND_INTERVAL_MS = 12000;
const TRANSITION_DURATION_MS = 1000;
const IMAGE_TIMEOUT_MS = 10000;
const PARALLAX_STRENGTH = 3;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Bookmark rendering and icon fallback. All listeners are bound only once.
function renderBookmarks() {
  const selector = document.getElementById('group-selector');
  const panels = document.getElementById('bookmark-panels');
  const tabs = [];
  const sections = [];
  const select = (index) => {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      sections[i].hidden = i !== index;
    });
  };
  bookmarkGroups.forEach((group, index) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.id = `tab-${index}`;
    tab.textContent = group.name;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `panel-${index}`);
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', (event) => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % bookmarkGroups.length;
      else if (event.key === 'ArrowLeft') next = (index + bookmarkGroups.length - 1) % bookmarkGroups.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = bookmarkGroups.length - 1;
      else return;
      event.preventDefault();
      select(next);
      tabs[next].focus();
    });
    const section = document.createElement('div');
    section.id = `panel-${index}`;
    section.setAttribute('role', 'tabpanel');
    section.setAttribute('aria-labelledby', tab.id);
    const grid = document.createElement('div');
    grid.className = 'bookmarks';
    group.bookmarks.forEach((bookmark) => {
      const link = document.createElement('a');
      link.className = 'bookmark';
      link.href = bookmark.url;
      link.append(createIcon(bookmark));
      const label = document.createElement('span');
      label.textContent = bookmark.label;
      link.append(label);
      grid.append(link);
    });
    section.append(grid);
    if (group.name === 'Courses') {
      const note = document.createElement('p');
      note.className = 'course-note';
      note.textContent = 'APSC 100 · APSC 160 · CHEM 154 · MATH 100 — use your LMS in UBC.';
      section.append(note);
    }
    tabs.push(tab);
    sections.push(section);
    selector.append(tab);
    panels.append(section);
  });
  select(0);
}

function createIcon(bookmark) {
  const wrapper = document.createElement('span');
  wrapper.className = 'icon';
  // The visible card label provides the accessible name; avoid reading it twice.
  wrapper.setAttribute('aria-hidden', 'true');
  const fallback = document.createElement('span');
  fallback.className = 'icon-fallback';
  fallback.textContent = bookmark.short || bookmark.label.slice(0, 2);
  wrapper.append(fallback);
  if (bookmark.icon === null) return wrapper;
  const img = new Image();
  img.alt = `${bookmark.label} icon`;
  img.hidden = true;
  img.referrerPolicy = 'no-referrer';
  img.addEventListener('load', () => { img.hidden = false; fallback.hidden = true; }, { once: true });
  img.addEventListener('error', () => { img.remove(); fallback.hidden = false; }, { once: true });
  img.src = bookmark.icon || new URL('/favicon.ico', bookmark.url).href;
  wrapper.append(img);
  return wrapper;
}

// Theme: never make a second CORS request just to sample a remote wallpaper.
// Canvas access for cross-origin images may throw; the neutral accent stays intact.
function updateTheme(image) {
  let accent = '211, 224, 241';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, 1, 1);
    const data = context.getImageData(0, 0, 1, 1).data;
    accent = Array.from(data.slice(0, 3), channel => Math.round(channel * .4 + 153)).join(', ');
  } catch { /* Expected for third-party images without CORS; no logging needed. */ }
  document.documentElement.style.setProperty('--accent', accent);
}

// Wallpaper manager: one pending image, one rotation timer, two permanent layers.
function createWallpaperManager() {
  const layers = [...document.querySelectorAll('.wallpaper')];
  const failed = new Set();
  let current = 0;
  let currentUrl = backgroundImages[0];
  let timer = 0;
  let busy = false;
  let animation = null;
  let pendingLoad = null;
  let queue = [];

  function refillQueue() {
    queue = backgroundImages.filter(url => url !== currentUrl && !failed.has(url));
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
  }

  function loadImage(url) {
    return new Promise(resolve => {
      const image = new Image();
      let settled = false;
      const finish = result => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        image.onload = image.onerror = null;
        pendingLoad = null;
        resolve(result);
      };
      const timeout = setTimeout(() => { finish(null); image.src = ''; }, IMAGE_TIMEOUT_MS);
      pendingLoad = () => { finish(null); image.src = ''; };
      image.onerror = () => finish(null);
      image.onload = async () => {
        try { await image.decode(); finish(image.naturalWidth ? image : null); }
        catch { finish(null); }
      };
      // Do not set crossOrigin: display does not require canvas access.
      image.src = url;
    });
  }

  async function transition(image, url) {
    const previous = layers[current];
    const next = layers[1 - current];
    next.style.backgroundImage = `url("${url}")`;
    next.style.zIndex = '1';
    next.style.opacity = '1';
    if (!reducedMotion.matches) {
      // A small vertical drift preserves the reveal feeling without sliced-image seams.
      animation = next.animate([
        { opacity: 0, transform: 'translate3d(0, -1.5%, 0) scale(1.035)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
      ], { duration: TRANSITION_DURATION_MS, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'both' });
      try { await animation.finished; } catch { /* finish/cleanup still keeps a full layer */ }
    }
    previous.classList.remove('is-current');
    previous.style.opacity = '0';
    previous.style.backgroundImage = 'none';
    next.classList.add('is-current');
    next.style.zIndex = '0';
    animation?.cancel();
    animation = null;
    current = 1 - current;
    currentUrl = url;
    updateTheme(image);
  }

  function schedule(delay = BACKGROUND_INTERVAL_MS) {
    clearTimeout(timer);
    if (!document.hidden) timer = setTimeout(rotate, delay);
  }

  async function rotate() {
    if (busy || document.hidden) return;
    busy = true;
    try {
      if (!queue.length) refillQueue();
      // An exhausted collection stays on the last good wallpaper, without retry storms.
      while (queue.length && !document.hidden) {
        const url = queue.pop();
        const image = await loadImage(url);
        if (document.hidden) { queue.push(url); break; }
        if (!image) { failed.add(url); continue; }
        await transition(image, url);
        break;
      }
    } finally {
      busy = false;
      schedule();
    }
  }

  document.addEventListener('visibilitychange', () => {
    clearTimeout(timer);
    if (document.hidden) {
      pendingLoad?.();
      animation?.pause();
    } else {
      animation?.play();
      if (!busy) schedule();
    }
  });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) animation?.finish(); });
  // CSS paints a bundled member of the original collection immediately, even offline.
  schedule(800);
}

// Clock: align to minute boundaries and stop its timer while hidden.
function startClock() {
  const clock = document.getElementById('clock');
  let timer;
  const update = () => {
    clearTimeout(timer);
    const now = new Date();
    clock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    clock.dateTime = now.toISOString();
    clock.setAttribute('aria-label', `Current time ${clock.textContent}`);
    if (!document.hidden) timer = setTimeout(update, 60000 - (Date.now() % 60000));
  };
  document.addEventListener('visibilitychange', update);
  update();
}

function setupSearch() {
  const input = document.getElementById('search');
  document.getElementById('search-form').addEventListener('submit', event => {
    input.value = input.value.trim();
    if (!input.value) event.preventDefault();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.activeElement === input) {
      input.value = '';
      input.blur();
    }
    const target = event.target;
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey &&
        !target.isContentEditable && !target.closest('input, textarea, select')) {
      event.preventDefault();
      input.focus();
    }
  });
}

// CSS owns transform composition: parallax + hover lift + active scale.
function setupParallax() {
  const root = document.documentElement;
  const finePointer = matchMedia('(pointer: fine)');
  let frame = 0;
  let x = 0;
  let y = 0;
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    root.style.setProperty('--parallax-x', '0px');
    root.style.setProperty('--parallax-y', '0px');
  };
  document.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches || document.hidden) return;
    x = (event.clientX / innerWidth - .5) * PARALLAX_STRENGTH;
    y = (event.clientY / innerHeight - .5) * PARALLAX_STRENGTH;
    if (!frame) frame = requestAnimationFrame(() => {
      root.style.setProperty('--parallax-x', `${x.toFixed(2)}px`);
      root.style.setProperty('--parallax-y', `${y.toFixed(2)}px`);
      frame = 0;
    });
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', reset);
  document.addEventListener('visibilitychange', reset);
  window.addEventListener('blur', reset);
  reducedMotion.addEventListener('change', reset);
  finePointer.addEventListener('change', reset);
}

renderBookmarks();
startClock();
setupSearch();
setupParallax();
createWallpaperManager();
