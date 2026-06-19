
(function () {
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function toggleNav() {
    const btn = q('[data-nav-toggle]');
    const nav = q('[data-nav]');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('is-open'));
  }

  function initHero() {
    const slides = qa('.hero-slide');
    const dots = qa('[data-hero-dot]');
    if (!slides.length) return;
    let index = slides.findIndex((s) => s.classList.contains('is-active'));
    if (index < 0) index = 0;
    const setActive = (i) => {
      slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
      dots.forEach((d, idx) => d.classList.toggle('is-active', idx === i));
      index = i;
    };
    dots.forEach((dot, i) => dot.addEventListener('click', () => setActive(i)));
    setInterval(() => {
      const next = (index + 1) % slides.length;
      setActive(next);
    }, 5000);
  }

  function normalize(text) {
    return (text || '').toLowerCase().trim();
  }

  function sortCards(cards, mode) {
    const byTitle = (a, b) => normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), 'zh-Hans-CN');
    const byYear = (a, b) => (parseInt(b.dataset.year || '0', 10) - parseInt(a.dataset.year || '0', 10)) || byTitle(a, b);
    const byScore = (a, b) => (parseInt(b.dataset.score || '0', 10) - parseInt(a.dataset.score || '0', 10)) || byYear(a, b);
    cards.sort(mode === 'title' ? byTitle : mode === 'year' ? byYear : byScore);
  }

  function initFilters() {
    const grid = q('[data-card-grid]');
    const input = q('[data-filter-input]');
    const select = q('[data-sort-select]');
    const chips = qa('[data-filter-chip]');
    if (!grid || (!input && !select && !chips.length)) return;
    let activeChip = '全部';
    const apply = () => {
      const term = normalize(input ? input.value : '');
      const cards = qa('.movie-card', grid);
      cards.forEach((card) => {
        const text = normalize([
          card.dataset.title,
          card.dataset.category,
          card.dataset.region,
          card.dataset.type,
          card.innerText
        ].join(' '));
        const chipMatch = activeChip === '全部' || text.includes(normalize(activeChip));
        const termMatch = !term || text.includes(term);
        card.classList.toggle('hidden', !(chipMatch && termMatch));
      });
      if (select) {
        const visible = cards.filter((c) => !c.classList.contains('hidden'));
        sortCards(visible, select.value);
        visible.forEach((c) => grid.appendChild(c));
      }
    };
    if (input) input.addEventListener('input', apply);
    if (select) select.addEventListener('change', apply);
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        activeChip = chip.dataset.filterChip || '全部';
        chips.forEach((c) => c.classList.toggle('is-active', c === chip));
        apply();
      });
    });
    apply();
  }

  function initPlayer() {
    const video = q('[data-player-video]');
    const button = q('[data-player-play]');
    if (!video || !button) return;
    const source = video.dataset.src;
    let hls = null;

    function startPlayback() {
      if (button.classList.contains('is-hidden')) return;
      button.classList.add('is-hidden');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => button.classList.remove('is-hidden'));
      }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', () => {
      if (button.classList.contains('is-hidden')) return;
      startPlayback();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    toggleNav();
    initHero();
    initFilters();
    initPlayer();
  });
})();
