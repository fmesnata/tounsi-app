const ACCENT_COLORS = ['#e9c46a','#f4a261','#2a9d8f','#457b9d','#9b72cf','#e76f51','#06d6a0'];

// ── CSV parser ────────────────────────────────────────────────────────────────

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function parseCSV(text) {
  const lines = text.trim().split('\n').map(l => l.trimEnd());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  return lines.slice(1)
    .filter(l => l.trim())
    .map(line => {
      const values = parseCSVLine(line);
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (values[i] || '').trim(); });
      return obj;
    });
}

const homeScreen    = document.getElementById('screen-home');
const cardsScreen   = document.getElementById('screen-cards');
const categoryGrid  = document.getElementById('category-grid');
const cardsTrack    = document.getElementById('cards-track');
const cardsTitle    = document.getElementById('cards-title');
const cardsCounter  = document.getElementById('cards-counter');
const progressFill  = document.getElementById('progress-fill');
const backBtn       = document.getElementById('back-btn');
const cardsViewport = document.getElementById('cards-viewport');

let currentIndex = 0;
let totalCards   = 0;

// ── card builder ──────────────────────────────────────────────────────────────

const ARABIC_RE = /[؀-ۿ]/;

// Affiche toutes les colonnes sauf "fr" et "image", détecte l'arabe automatiquement
function buildWordHTML(card) {
  const SKIP = new Set(['fr', 'image']);
  const vals = Object.entries(card)
    .filter(([k, v]) => !SKIP.has(k) && v && v !== '-')
    .map(([, v]) => v);

  if (!vals.length) return '';

  if (vals.length === 1) {
    const v = vals[0];
    const cls = ARABIC_RE.test(v) ? 'form-arab-solo' : 'form-arfr-solo';
    return `<div class="forms-single"><div class="${cls}">${v}</div></div>`;
  }

  const cells = vals.map(v => {
    const cls = ARABIC_RE.test(v) ? 'form-arab' : 'form-arfr';
    return `<span class="${cls}">${v}</span>`;
  }).join('');

  return `<div class="forms-all">${cells}</div>`;
}

function buildCard(card) {
  const div = document.createElement('div');
  div.className = 'card';

  const imgWrap = document.createElement('div');
  imgWrap.className = 'card-img-wrap';

  const img = document.createElement('img');
  img.src = card.image || '';
  img.alt = card.fr || '';
  img.onerror = () => {
    img.remove();
    const ph = document.createElement('div');
    ph.className = 'img-missing';
    ph.textContent = '🖼';
    imgWrap.prepend(ph);
  };
  imgWrap.appendChild(img);

  const tapPrev = document.createElement('div');
  tapPrev.className = 'tap-prev';
  tapPrev.addEventListener('click', goPrev);

  const tapNext = document.createElement('div');
  tapNext.className = 'tap-next';
  tapNext.addEventListener('click', goNext);

  imgWrap.appendChild(tapPrev);
  imgWrap.appendChild(tapNext);

  const words = document.createElement('div');
  words.className = 'card-words';
  words.innerHTML = buildWordHTML(card);

  div.appendChild(imgWrap);
  div.appendChild(words);
  return div;
}

// ── navigation ────────────────────────────────────────────────────────────────

function goTo(index) {
  currentIndex = Math.max(0, Math.min(index, totalCards - 1));
  cardsTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
  cardsCounter.textContent   = `${currentIndex + 1} / ${totalCards}`;
  progressFill.style.width   = `${((currentIndex + 1) / totalCards) * 100}%`;
}

function goNext() { if (currentIndex < totalCards - 1) goTo(currentIndex + 1); }
function goPrev() { if (currentIndex > 0)              goTo(currentIndex - 1); }

// ── swipe ─────────────────────────────────────────────────────────────────────

let touchStartX = 0;
let touchStartY = 0;
let swipeActive = false;

cardsViewport.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  swipeActive = false;
}, { passive: true });

cardsViewport.addEventListener('touchmove', e => {
  const dx = Math.abs(e.touches[0].clientX - touchStartX);
  const dy = Math.abs(e.touches[0].clientY - touchStartY);
  if (!swipeActive && dx > dy && dx > 8) swipeActive = true;
}, { passive: true });

cardsViewport.addEventListener('touchend', e => {
  if (!swipeActive) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (dx < -48) goNext();
  else if (dx > 48) goPrev();
  swipeActive = false;
});

// ── keyboard ──────────────────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
  if (cardsScreen.classList.contains('off-right')) return;
  if (e.key === 'ArrowRight') goNext();
  if (e.key === 'ArrowLeft')  goPrev();
  if (e.key === 'Escape')     showHome();
});

// ── transitions ───────────────────────────────────────────────────────────────

function showCards(label) {
  cardsTitle.textContent = label;
  homeScreen.classList.add('transitioning', 'off-left');
  cardsScreen.classList.add('transitioning');
  cardsScreen.classList.remove('off-right');
  homeScreen.addEventListener('transitionend',  () => homeScreen.classList.remove('transitioning'),  { once: true });
  cardsScreen.addEventListener('transitionend', () => cardsScreen.classList.remove('transitioning'), { once: true });
}

function showHome() {
  homeScreen.classList.add('transitioning');
  homeScreen.classList.remove('off-left');
  cardsScreen.classList.add('transitioning', 'off-right');
  homeScreen.addEventListener('transitionend',  () => homeScreen.classList.remove('transitioning'),  { once: true });
  cardsScreen.addEventListener('transitionend', () => cardsScreen.classList.remove('transitioning'), { once: true });
}

backBtn.addEventListener('click', showHome);

// ── load category ─────────────────────────────────────────────────────────────

function loadCategory(cat) {
  cardsTrack.innerHTML = '';
  totalCards   = cat.cards.length;
  currentIndex = 0;
  cat.cards.forEach(card => cardsTrack.appendChild(buildCard(card)));
  goTo(0);
  showCards(cat.label);
}

// ── init ──────────────────────────────────────────────────────────────────────

async function init() {
  try {
    const manifest = await fetch('data/manifest.json').then(r => r.json());

    // Chaque catégorie est chargée indépendamment : une erreur n'empêche pas les autres
    const results = await Promise.allSettled(
      manifest.map(async (entry, i) => {
        const resp = await fetch(`data/${entry.id}.csv`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const text  = await resp.text();
        const cards = parseCSV(text).map(card => ({
          ...card,
          image: `images/${entry.id}/${card.fr}.png`
        }));
        return { ...entry, cards, color: ACCENT_COLORS[i % ACCENT_COLORS.length] };
      })
    );

    const categories = results
      .filter(r => {
        if (r.status === 'rejected') {
          console.warn('Catégorie ignorée :', r.reason);
          return false;
        }
        return true;
      })
      .map(r => r.value);

    if (!categories.length) throw new Error('Aucune catégorie disponible');

    categories.forEach(cat => {
      const tile = document.createElement('button');
      tile.className = 'cat-tile';
      tile.style.setProperty('--tile-color', cat.color);
      tile.innerHTML = `
        <span class="cat-tile-icon">${cat.icon || '📚'}</span>
        <span class="cat-tile-label">${cat.label}</span>
        <span class="cat-tile-count">${cat.cards.length} mots</span>`;
      tile.addEventListener('click', () => loadCategory(cat));
      categoryGrid.appendChild(tile);
    });

  } catch (err) {
    console.error(err);
    categoryGrid.innerHTML = '<p style="color:var(--text-2);padding:24px;text-align:center;grid-column:1/-1">Impossible de charger les données.<br>Vérifie que l\'application est servie via HTTP.</p>';
  }
}

init();
