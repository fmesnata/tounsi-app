const ACCENT_COLORS = ['#e9c46a','#f4a261','#2a9d8f','#457b9d','#9b72cf','#e76f51','#06d6a0'];

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

// ── helpers ───────────────────────────────────────────────────────────────────

function getArfr(card, gender) {
  if (gender === 'm')  return card['arfr(m)'] || card['arf(m)'] || '-';
  if (gender === 'f')  return card['arfr(f)']  || '-';
  if (gender === 'pl') return card['arfr(pl)'] || '-';
  return '-';
}

function getArab(card, gender) {
  if (gender === 'm')  return card['arab(m)'] || '-';
  if (gender === 'f')  return card['arab(f)']  || '-';
  if (gender === 'pl') return card['arab(pl)'] || '-';
  return '-';
}

function isBlank(v) { return !v || v === '-'; }

function buildWordHTML(card) {
  // Format expressions : arfr/arab sans genre + arfr(rep)/arab(rep) pour la réponse
  if (card['arfr'] !== undefined) {
    const arfr = card['arfr'] || '-';
    const arab = card['arab'] || '-';
    const rep  = card['arfr(rep)'];
    const arep = card['arab(rep)'];
    let html = `<div class="forms-single">
      <div class="form-arfr-solo">${arfr}</div>
      ${!isBlank(arab) ? `<div class="form-arab-solo">${arab}</div>` : ''}
    </div>`;
    if (!isBlank(rep)) {
      html += `<div class="forms-single forms-rep">
        <div class="form-label">rép.</div>
        <div class="form-arfr-solo">${rep}</div>
        ${!isBlank(arep) ? `<div class="form-arab-solo">${arep}</div>` : ''}
      </div>`;
    }
    return html;
  }

  const m   = getArfr(card, 'm');
  const f   = getArfr(card, 'f');
  const pl  = getArfr(card, 'pl');
  const am  = getArab(card, 'm');
  const af  = getArab(card, 'f');
  const apl = getArab(card, 'pl');

  const fDiff  = !isBlank(f)  && f  !== m;
  const plDiff = !isBlank(pl) && pl !== m;

  if (!fDiff && !plDiff) {
    return `<div class="forms-single">
      <div class="form-arfr-solo">${m}</div>
      ${!isBlank(am) ? `<div class="form-arab-solo">${am}</div>` : ''}
    </div>`;
  }

  const cols = [{ label: 'm.', arfr: m, arab: am }];
  if (fDiff)  cols.push({ label: 'f.',  arfr: f,  arab: af });
  if (plDiff) cols.push({ label: 'pl.', arfr: pl, arab: apl });

  const n = cols.length;
  const labels = cols.map(c => `<span class="form-label">${c.label}</span>`).join('');
  const arfrs  = cols.map(c => `<span class="form-arfr">${c.arfr}</span>`).join('');
  const arabs  = cols.map(c => `<span class="form-arab">${!isBlank(c.arab) ? c.arab : ''}</span>`).join('');

  return `<div class="forms-grid" style="grid-template-columns:repeat(${n},1fr)">${labels}${arfrs}${arabs}</div>`;
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
  words.innerHTML = `<div class="word-fr">${card.fr || ''}</div>${buildWordHTML(card)}`;

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

    const categories = await Promise.all(
      manifest.map(async (entry, i) => {
        const cards = await fetch(`data/${entry.id}.json`).then(r => r.json());
        return { ...entry, cards, color: ACCENT_COLORS[i % ACCENT_COLORS.length] };
      })
    );

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
