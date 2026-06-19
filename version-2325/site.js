
(function () {
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function initNav() {
    var toggle = qs('[data-nav-toggle]');
    var panel = qs('[data-nav-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && !toggle.contains(e.target)) {
        panel.classList.remove('is-open');
      }
    });
  }

  function initCarousel() {
    var root = qs('[data-carousel]');
    if (!root) return;

    var slides = qsa('[data-slide]', root);
    var dotsWrap = qs('[data-dots]', root);
    var prev = qs('[data-prev]', root);
    var next = qs('[data-next]', root);
    var active = 0;
    var timer = null;

    if (!slides.length) return;

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      slides.forEach(function (_, idx) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'hero__dot' + (idx === active ? ' is-active' : '');
        button.setAttribute('aria-label', '切换到第 ' + (idx + 1) + ' 张推荐图');
        button.addEventListener('click', function () {
          go(idx);
          restart();
        });
        dotsWrap.appendChild(button);
      });
    }

    function sync() {
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === active);
      });
      renderDots();
    }

    function go(idx) {
      active = (idx + slides.length) % slides.length;
      sync();
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        go(active + 1);
      }, 5500);
    }

    if (prev) prev.addEventListener('click', function () { go(active - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(active + 1); restart(); });

    sync();
    restart();
  }

  function initFilters() {
    var input = qs('[data-filter-input]');
    if (!input) return;

    var cards = qsa('[data-search]');
    var counter = qs('[data-filter-count]');
    var clears = qsa('[data-filter-clear]');
    var selects = qsa('[data-filter-select]');

    function normalize(s) {
      return (s || '').toLowerCase();
    }

    function getValueByGroup(group) {
      var sel = qsa('[data-filter-select="' + group + '"]')[0];
      return sel ? sel.value : 'all';
    }

    function apply() {
      var keyword = normalize(input.value.trim());
      var yearValue = getValueByGroup('year');
      var typeValue = getValueByGroup('type');
      var regionValue = getValueByGroup('region');

      var visible = 0;
      cards.forEach(function (card) {
        var blob = normalize(card.getAttribute('data-search'));
        var year = card.getAttribute('data-year') || '';
        var type = card.getAttribute('data-type') || '';
        var region = card.getAttribute('data-region') || '';
        var ok = true;

        if (keyword && blob.indexOf(keyword) === -1) ok = false;
        if (yearValue !== 'all' && year !== yearValue) ok = false;
        if (typeValue !== 'all' && type !== typeValue) ok = false;
        if (regionValue !== 'all' && region !== regionValue) ok = false;

        card.classList.toggle('hidden', !ok);
        if (ok) visible += 1;
      });

      if (counter) counter.textContent = visible + ' 部可见';
    }

    input.addEventListener('input', apply);
    selects.forEach(function (sel) { sel.addEventListener('change', apply); });
    clears.forEach(function (btn) {
      btn.addEventListener('click', function () {
        input.value = '';
        selects.forEach(function (sel) { sel.value = 'all'; });
        apply();
      });
    });
    apply();
  }

  function initPlayer() {
    var video = qs('[data-player-video]');
    if (!video) return;

    var source = video.getAttribute('data-src') || '';
    var fallback = video.getAttribute('data-fallback') || '';
    var overlay = qs('[data-player-overlay]');
    var playBtn = qs('[data-player-play]');
    var status = qs('[data-player-status]');

    function setStatus(msg) {
      if (status) status.textContent = msg;
    }

    function bindNative() {
      if (!source) return;
      video.src = source;
      video.load();
      setStatus(source.indexOf('.m3u8') > -1 ? '当前播放源为 HLS，浏览器会自动调用兼容逻辑。' : '当前播放源已准备就绪。');
    }

    function bindHls() {
      if (!source) return bindNative();
      if (source.indexOf('.m3u8') === -1) return bindNative();
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('HLS 线路已加载，可直接点击播放。');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && fallback) {
            video.src = fallback;
            video.load();
            setStatus('HLS 播放失败，已切换到备用源。');
          }
        });
        return;
      }

      if (video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl')) {
        bindNative();
      } else if (fallback) {
        video.src = fallback;
        video.load();
        setStatus('浏览器不支持 HLS，已切换到备用播放源。');
      } else {
        bindNative();
      }
    }

    bindHls();

    function startPlay() {
      var p = video.play();
      if (p && p.catch) {
        p.catch(function () {
          setStatus('当前浏览器限制了自动播放，请再次点击播放器中的播放按钮。');
        });
      }
      if (overlay) overlay.style.display = 'none';
    }

    if (playBtn) playBtn.addEventListener('click', startPlay);
    if (overlay) overlay.addEventListener('click', startPlay);
    video.addEventListener('play', function () {
      if (overlay) overlay.style.display = 'none';
      setStatus('正在播放：' + (video.currentSrc || source));
    });
    video.addEventListener('pause', function () {
      if (overlay) overlay.style.display = 'flex';
    });
    video.addEventListener('error', function () {
      if (fallback && video.src !== fallback) {
        video.src = fallback;
        video.load();
        setStatus('主播放源加载失败，已自动尝试备用源。');
      }
    });
  }

  function initCopyLinks() {
    qsa('[data-copy-link]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy-link');
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text);
          btn.textContent = '已复制链接';
          setTimeout(function () {
            btn.textContent = '复制链接';
          }, 1500);
        }
      });
    });
  }

  function initCurrentYear() {
    qsa('[data-current-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initCarousel();
    initFilters();
    initPlayer();
    initCopyLinks();
    initCurrentYear();
  });
})();
