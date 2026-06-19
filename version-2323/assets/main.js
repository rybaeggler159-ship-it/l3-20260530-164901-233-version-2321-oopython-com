function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initMenu() {
  var button = document.querySelector('.menu-toggle');
  var menu = document.querySelector('.mobile-nav');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

function initHero() {
  var carousel = document.querySelector('.hero-carousel');

  if (!carousel) {
    return;
  }

  var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
  var prev = carousel.querySelector('.hero-prev');
  var next = carousel.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function show(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (prev) {
    prev.addEventListener('click', function () {
      show(current - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(current + 1);
      start();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      show(Number(dot.dataset.slide || 0));
      start();
    });
  });

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  show(0);
  start();
}

function initImageFallback() {
  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    });
  });
}

function initQuickFilter() {
  document.querySelectorAll('.quick-filter').forEach(function (input) {
    var section = input.closest('.content-section') || document;
    var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();

        card.hidden = keyword.length > 0 && haystack.indexOf(keyword) === -1;
      });
    });
  });
}

function movieCardHtml(movie) {
  var genreBadges = movie.genres.slice(0, 2).map(function (genre) {
    return '<span>' + escapeHtml(genre) + '</span>';
  }).join('');

  var meta = [movie.year, movie.region, movie.type].filter(Boolean).join(' · ');

  return [
    '<article class="movie-card movie-card--small">',
    '  <a class="movie-card__link" href="' + escapeHtml(movie.url) + '">',
    '    <div class="movie-card__poster">',
    '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
    '      <span class="movie-card__badge">' + escapeHtml(movie.year) + '</span>',
    '      <div class="movie-card__tags">' + genreBadges + '</div>',
    '    </div>',
    '    <div class="movie-card__body">',
    '      <h3>' + escapeHtml(movie.title) + '</h3>',
    '      <p class="movie-card__meta">' + escapeHtml(meta) + '</p>',
    '      <p class="movie-card__desc">' + escapeHtml(movie.oneLine) + '</p>',
    '      <div class="movie-card__foot">',
    '        <span>' + escapeHtml(movie.region) + '</span>',
    '        <span>查看详情 →</span>',
    '      </div>',
    '    </div>',
    '  </a>',
    '</article>'
  ].join('');
}

function initSearchPage() {
  var results = document.getElementById('search-results');
  var input = document.getElementById('site-search-input');

  if (!results || !input || !window.SEARCH_DATA) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  input.value = initial;

  function render() {
    var keyword = input.value.trim().toLowerCase();
    var source = window.SEARCH_DATA;
    var matches = keyword
      ? source.filter(function (movie) {
          return movie.searchText.indexOf(keyword) !== -1;
        })
      : source.slice(0, 60);

    results.innerHTML = matches.slice(0, 120).map(movieCardHtml).join('');
    initImageFallback();
  }

  input.addEventListener('input', render);
  render();
}

function initPlayers() {
  document.querySelectorAll('.js-player').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.js-play');
    var source = player.dataset.src;
    var initialized = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function setup() {
      if (initialized) {
        return;
      }

      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      setup();
      player.classList.add('is-playing');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0) {
        player.classList.remove('is-playing');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

ready(function () {
  initMenu();
  initHero();
  initImageFallback();
  initQuickFilter();
  initSearchPage();
  initPlayers();
});
