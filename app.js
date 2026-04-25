(() => {
  // ─── Constantes ─────────────────────────────────────────────────
  const PRONOUNS = [
    { fr: 'ena',     ar: 'أنا' },
    { fr: 'enti',    ar: 'إنتَ/إنتِ' },
    { fr: 'houwa',   ar: 'هو' },
    { fr: 'hiya',    ar: 'هي' },
    { fr: 'a7na',    ar: 'إحنا' },
    { fr: 'entouma', ar: 'إنتوما' },
    { fr: 'houma',   ar: 'هوما' },
  ];
  const TENSES = ['past', 'present', 'imperative', 'masdar'];
  const TENSE_LABELS = { past: 'Passé', present: 'Présent', imperative: 'Impératif', masdar: 'Masdar' };
  const PRIORITY_COUNT = 56;

  // ─── Données ────────────────────────────────────────────────────
  const vocabData = window.VOCAB_DATA   || { categories: [] };
  const verbsData = window.VERBS_DATA   || [];

  // ─── DOM ────────────────────────────────────────────────────────
  const screenHome       = document.getElementById('screen-home');
  const screenCategories = document.getElementById('screen-categories');
  const screenCards      = document.getElementById('screen-cards');
  const screenVerbs      = document.getElementById('screen-verbs');
  const titleEl  = document.getElementById('title');
  const backBtn  = document.getElementById('back-btn');
  const verbIndexBtn = document.getElementById('verb-index-btn');
  const categoryListEl   = document.getElementById('category-list');
  const cardTrack        = document.getElementById('card-track');
  const cardProgress     = document.getElementById('card-progress');
  const verbTrack        = document.getElementById('verb-track');
  const verbProgressEl   = document.getElementById('verb-progress');
  const tenseBtns        = document.querySelectorAll('.tense-btn');
  const overlay          = document.getElementById('verb-index-overlay');
  const indexList        = document.getElementById('verb-index-list');
  const searchInput      = document.getElementById('verb-search');

  // ─── Navigation ─────────────────────────────────────────────────
  const allScreens = [screenHome, screenCategories, screenCards, screenVerbs];

  function show(screen, { title = 'Tounsi', back = null } = {}) {
    allScreens.forEach(s => { s.hidden = true; });
    screen.hidden = false;
    titleEl.textContent = title;
    backBtn.hidden = !back;
    backBtn.onclick = back || null;
  }

  // ─── Accueil ────────────────────────────────────────────────────
  function renderHome() {
    show(screenHome, { title: 'Tounsi' });
  }

  // Tuile Vocabulaire
  document.querySelector('[data-section="vocabulaire"]')
    .addEventListener('click', renderCategories);

  // Tuile Verbes
  const tileVerbes      = document.getElementById('tile-verbes');
  const tileVerbesCount = document.getElementById('tile-verbes-count');
  if (verbsData.length) {
    tileVerbesCount.textContent = `${verbsData.length} verbes`;
  } else {
    tileVerbesCount.textContent = 'données manquantes';
    tileVerbes.disabled = true;
  }
  document.querySelector('[data-section="verbes"]')
    .addEventListener('click', renderVerbs);

  // ─── Catégories vocabulaire ──────────────────────────────────────
  function renderCategories() {
    categoryListEl.innerHTML = '';
    vocabData.categories.forEach(cat => {
      const li  = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'tile';
      btn.disabled  = cat.items.length === 0;

      if (cat.icone) {
        const img = document.createElement('img');
        img.className = 'tile-icon';
        img.src = cat.icone;
        img.alt = '';
        btn.appendChild(img);
      } else {
        const ph = document.createElement('div');
        ph.className = 'tile-icon-placeholder';
        btn.appendChild(ph);
      }

      const label = document.createElement('span');
      label.className   = 'tile-label';
      label.textContent = cat.nom;
      btn.appendChild(label);

      const count = document.createElement('span');
      count.className   = 'tile-count';
      count.textContent = cat.items.length
        ? `${cat.items.length} mot${cat.items.length > 1 ? 's' : ''}`
        : 'Bientôt';
      btn.appendChild(count);

      btn.addEventListener('click', () => { if (cat.items.length) renderCards(cat); });
      li.appendChild(btn);
      categoryListEl.appendChild(li);
    });
    show(screenCategories, { title: 'Vocabulaire', back: renderHome });
  }

  // ─── Carrousel vocabulaire ───────────────────────────────────────
  function renderCards(category) {
    cardTrack.innerHTML   = '';
    cardProgress.innerHTML = '';
    category.items.forEach(item => cardTrack.appendChild(buildVocabCard(item)));

    const dots    = document.createElement('div'); dots.className    = 'dots';
    const counter = document.createElement('span'); counter.className = 'counter';
    category.items.forEach(() => {
      const d = document.createElement('span'); d.className = 'dot'; dots.appendChild(d);
    });
    cardProgress.appendChild(dots);
    cardProgress.appendChild(counter);

    const update = () => {
      const idx = Math.round(cardTrack.scrollLeft / cardTrack.clientWidth);
      [...dots.children].forEach((d, i) => d.classList.toggle('active', i === idx));
      counter.textContent = `${idx + 1} / ${category.items.length}`;
    };
    cardTrack.onscroll = () => requestAnimationFrame(update);
    show(screenCards, { title: category.nom, back: renderCategories });
    requestAnimationFrame(() => { cardTrack.scrollLeft = 0; update(); });
  }

  function buildVocabCard(item) {
    const card    = document.createElement('article'); card.className = 'card';
    const imgWrap = document.createElement('div');     imgWrap.className = 'card-image';
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image; img.alt = item.fr || ''; img.loading = 'lazy';
      imgWrap.appendChild(img);
    } else {
      imgWrap.classList.add('empty'); imgWrap.textContent = '—';
    }
    card.appendChild(imgWrap);

    const body = document.createElement('div'); body.className = 'card-body';
    if (item.fr) {
      const fr = document.createElement('div'); fr.className = 'card-fr'; fr.textContent = item.fr;
      body.appendChild(fr);
    }
    const grid = document.createElement('div'); grid.className = 'forms-grid';
    addFormRow(grid, 'Masculin', item.masculin);
    addFormRow(grid, 'Féminin',  item.feminin);
    addFormRow(grid, 'Pluriel',  item.pluriel);
    body.appendChild(grid);
    card.appendChild(body);
    return card;
  }

  function addFormRow(parent, label, form) {
    const hasArabic = form && form.arabe && form.arabe !== '-';
    const hasLatin  = form && form.latin  && form.latin  !== '-';
    const isEmpty   = !hasArabic && !hasLatin;

    const row   = document.createElement('div'); row.className = isEmpty ? 'form-row empty' : 'form-row';
    const lbl   = document.createElement('span'); lbl.className = 'form-label'; lbl.textContent = label;
    const words = document.createElement('div');  words.className = 'form-words';
    const la    = document.createElement('span'); la.className = 'form-latin';  la.textContent  = hasLatin  ? form.latin  : '\u00A0';
    const ar    = document.createElement('span'); ar.className = 'form-arabic'; ar.lang = 'ar'; ar.textContent = hasArabic ? form.arabe : '\u00A0';

    words.appendChild(la); words.appendChild(ar);
    row.appendChild(lbl); row.appendChild(words);
    parent.appendChild(row);
  }

  // ─── Verbes ──────────────────────────────────────────────────────
  let activeTense = 'past';
  let swipeStartX = null;
  let swipeStartY = null;

  function renderVerbs() {
    verbTrack.innerHTML = '';
    verbsData.forEach((verb, i) => verbTrack.appendChild(buildVerbItem(verb, i)));
    verbTrack.scrollTop = 0;
    updateVerbProgress();

    verbTrack.onscroll = () => requestAnimationFrame(updateVerbProgress);
    verbTrack.addEventListener('touchstart', onTouchStart, { passive: true });
    verbTrack.addEventListener('touchend',   onTouchEnd,   { passive: true });

    show(screenVerbs, { title: 'Verbes', back: renderHome });
  }

  function buildVerbItem(verb) {
    const item = document.createElement('div'); item.className = 'verb-item';

    const header = document.createElement('div'); header.className = 'verb-header';
    const fr = document.createElement('span'); fr.className = 'verb-fr'; fr.textContent = verb.fr;
    const en = document.createElement('span'); en.className = 'verb-en'; en.textContent = verb.en;
    header.appendChild(fr); header.appendChild(en);
    item.appendChild(header);

    TENSES.forEach(tense => {
      const panel = document.createElement('div');
      panel.className    = 'verb-tense-panel' + (tense === activeTense ? ' active' : '');
      panel.dataset.tense = tense;
      panel.appendChild(tense === 'masdar' ? buildMasdarPanel(verb) : buildConjTable(verb, tense));
      item.appendChild(panel);
    });

    return item;
  }

  function buildConjTable(verb, tense) {
    const table = document.createElement('div'); table.className = 'conj-table';
    const forms = (verb.tenses && verb.tenses[tense]) || [];

    PRONOUNS.forEach((pron, i) => {
      const form      = forms[i] || {};
      const hasLatin  = form.latin  && form.latin  !== '-';
      const hasArabic = form.arabic && form.arabic !== '-';

      const row = document.createElement('div');
      row.className = 'conj-row' + (!hasLatin && !hasArabic ? ' empty' : '');

      const p = document.createElement('span'); p.className = 'conj-pronoun'; p.textContent = pron.fr;
      const l = document.createElement('span'); l.className = 'conj-latin';  l.textContent = hasLatin  ? form.latin  : '—';
      const a = document.createElement('span'); a.className = 'conj-arabic'; a.lang = 'ar'; a.textContent = hasArabic ? form.arabic : '';

      row.appendChild(p); row.appendChild(l); row.appendChild(a);
      table.appendChild(row);
    });
    return table;
  }

  function buildMasdarPanel(verb) {
    const panel = document.createElement('div'); panel.className = 'masdar-panel';
    const form  = verb.tenses && verb.tenses.masdar && verb.tenses.masdar[0];

    if (form && form.arabic) {
      const ar = document.createElement('div'); ar.className = 'masdar-arabic'; ar.lang = 'ar'; ar.textContent = form.arabic;
      panel.appendChild(ar);
    }
    if (form && form.latin) {
      const la = document.createElement('div'); la.className = 'masdar-latin'; la.textContent = form.latin;
      panel.appendChild(la);
    }
    if (!form || (!form.arabic && !form.latin)) {
      const dash = document.createElement('div'); dash.className = 'masdar-latin'; dash.style.opacity = '0.3'; dash.textContent = '—';
      panel.appendChild(dash);
    }
    return panel;
  }

  function updateVerbProgress() {
    if (!verbsData.length) return;
    const idx = Math.round(verbTrack.scrollTop / (verbTrack.clientHeight || 1));
    verbProgressEl.textContent = `${Math.min(idx + 1, verbsData.length)} / ${verbsData.length}`;
  }

  // Tense bar — clic
  tenseBtns.forEach(btn => btn.addEventListener('click', () => setActiveTense(btn.dataset.tense)));

  function setActiveTense(tense) {
    if (tense === activeTense) return;
    activeTense = tense;
    tenseBtns.forEach(b => b.classList.toggle('active', b.dataset.tense === tense));
    document.querySelectorAll('.verb-tense-panel').forEach(p => {
      p.classList.toggle('active', p.dataset.tense === tense);
    });
  }

  // Swipe horizontal → changer de temps
  function onTouchStart(e) {
    swipeStartX = e.touches[0].clientX;
    swipeStartY = e.touches[0].clientY;
  }
  function onTouchEnd(e) {
    if (swipeStartX === null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX;
    const dy = e.changedTouches[0].clientY - swipeStartY;
    swipeStartX = swipeStartY = null;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 35) {
      const cur  = TENSES.indexOf(activeTense);
      const next = dx < 0 ? Math.min(cur + 1, 3) : Math.max(cur - 1, 0);
      setActiveTense(TENSES[next]);
    }
  }

  // ─── Index / recherche ──────────────────────────────────────────
  verbIndexBtn.addEventListener('click', () => {
    overlay.hidden = false;
    searchInput.value = '';
    buildIndexList('');
    searchInput.focus();
  });
  document.getElementById('verb-index-close').addEventListener('click', () => {
    overlay.hidden = true;
  });
  searchInput.addEventListener('input', () => {
    buildIndexList(searchInput.value.trim().toLowerCase());
  });

  function buildIndexList(filter) {
    indexList.innerHTML = '';
    verbsData.forEach((verb, i) => {
      if (filter && !verb.fr.toLowerCase().includes(filter) && !verb.en.toLowerCase().includes(filter)) return;

      const li   = document.createElement('li');  li.className = 'verb-index-item';
      const left = document.createElement('div'); left.style.cssText = 'display:flex;align-items:center;gap:8px;';

      const frEl = document.createElement('span'); frEl.className = 'verb-index-fr'; frEl.textContent = verb.fr;
      left.appendChild(frEl);

      if (i < PRIORITY_COUNT) {
        const badge = document.createElement('span'); badge.className = 'verb-index-priority'; badge.textContent = '★';
        left.appendChild(badge);
      }

      const masdarForm = verb.tenses && verb.tenses.masdar && verb.tenses.masdar[0];
      const right = document.createElement('span'); right.className = 'verb-index-masdar';
      right.textContent = (masdarForm && masdarForm.arabic) ? masdarForm.arabic : '';

      li.appendChild(left); li.appendChild(right);
      li.addEventListener('click', () => {
        overlay.hidden = true;
        jumpToVerb(i);
      });
      indexList.appendChild(li);
    });
  }

  function jumpToVerb(idx) {
    const h = verbTrack.clientHeight;
    verbTrack.scrollTo({ top: idx * h, behavior: 'smooth' });
    setTimeout(updateVerbProgress, 400);
  }

  // ─── Démarrage ──────────────────────────────────────────────────
  renderHome();
})();
