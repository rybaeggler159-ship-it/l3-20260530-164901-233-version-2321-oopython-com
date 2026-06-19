(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    showSlide(0);
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  function normalizeText(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
  var cardSearch = document.querySelector('[data-card-search]');
  var genreSelect = document.querySelector('[data-filter-genre]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var emptyState = document.querySelector('[data-empty-state]');

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalizeText(cardSearch && cardSearch.value);
    var genre = normalizeText(genreSelect && genreSelect.value);
    var year = normalizeText(yearSelect && yearSelect.value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalizeText([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var cardGenre = normalizeText(card.getAttribute('data-genre'));
      var cardYear = normalizeText(card.getAttribute('data-year'));
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchGenre = !genre || cardGenre.indexOf(genre) !== -1;
      var matchYear = !year || cardYear === year;
      var matched = matchKeyword && matchGenre && matchYear;

      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (cardSearch) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery) {
      cardSearch.value = initialQuery;
    }
    cardSearch.addEventListener('input', applyFilters);
  }
  if (genreSelect) {
    genreSelect.addEventListener('change', applyFilters);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilters);
  }
  applyFilters();

  function startVideo(player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-play-cover]');
    var source = player.getAttribute('data-hls');

    if (!video || !source) {
      return;
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }

    if (video.getAttribute('data-ready') !== '1') {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          var nextPlay = video.play();
          if (nextPlay && typeof nextPlay.catch === 'function') {
            nextPlay.catch(function () {});
          }
        });
        video.hlsPlayer = hls;
      } else {
        video.src = source;
      }
      video.setAttribute('data-ready', '1');
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var cover = player.querySelector('[data-play-cover]');
    var video = player.querySelector('video');

    if (cover) {
      cover.addEventListener('click', function () {
        startVideo(player);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused || video.getAttribute('data-ready') !== '1') {
          startVideo(player);
        }
      });
    }
  });
})();
