(function () {
    function initSite() {
    var button = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (button && mobileNav) {
        button.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var show = function (next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    var panel = document.querySelector('[data-filter-panel]');
    if (panel) {
        var search = panel.querySelector('[data-filter-search]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(location.search);
        if (search && params.get('q')) {
            search.value = params.get('q');
        }
        var matchYear = function (cardYear, value) {
            if (!value) {
                return true;
            }
            var numeric = Number(cardYear);
            if (value === '2010') {
                return numeric >= 2010 && numeric < 2020;
            }
            if (value === '2000') {
                return numeric < 2010;
            }
            return String(cardYear) === value;
        };
        var run = function () {
            var q = search ? search.value.trim().toLowerCase() : '';
            var t = type ? type.value : '';
            var y = year ? year.value : '';
            cards.forEach(function (card) {
                var hay = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                var okText = !q || hay.indexOf(q) !== -1;
                var okType = !t || (card.getAttribute('data-type') || '').indexOf(t) !== -1;
                var okYear = matchYear(card.getAttribute('data-year'), y);
                card.classList.toggle('is-hidden', !(okText && okType && okYear));
            });
        };
        [search, type, year].forEach(function (el) {
            if (el) {
                el.addEventListener('input', run);
                el.addEventListener('change', run);
            }
        });
        run();
    }

    var video = document.getElementById('main-video');
    var playButton = document.querySelector('[data-play-button]');
    if (video && typeof mediaUrl === 'string' && mediaUrl) {
        var attached = false;
        var start = function () {
            if (!attached) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = mediaUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new Hls();
                    hls.loadSource(mediaUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = mediaUrl;
                }
                attached = true;
            }
            if (playButton) {
                playButton.classList.add('hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        };
        if (playButton) {
            playButton.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (playButton) {
                playButton.classList.add('hidden');
            }
        });
    }

    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSite);
    } else {
        initSite();
    }
})();
