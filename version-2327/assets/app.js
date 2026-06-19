(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function openSearch(query) {
        const value = (query || '').trim();
        const target = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
        window.location.href = target;
    }

    function setupNavigation() {
        const toggle = document.querySelector('[data-menu-toggle]');
        const mobileNav = document.querySelector('[data-mobile-nav]');
        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        all('[data-site-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                const input = form.querySelector('input[name="q"]');
                openSearch(input ? input.value : '');
            });
        });
    }

    function setupHero() {
        const hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        const slides = all('[data-hero-slide]', hero);
        const dots = all('[data-hero-dot]', hero);
        if (slides.length < 2) {
            return;
        }
        let index = 0;
        let timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener('click', function () {
                show(itemIndex);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function setupFilters() {
        const input = document.querySelector('[data-filter-input]');
        const grid = document.querySelector('[data-filter-grid]');
        const cards = all('[data-movie-card]');
        const chips = all('[data-filter-chip]');
        if (!grid || cards.length === 0) {
            return;
        }
        let activeTag = 'all';

        function refresh() {
            const text = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                const search = (card.getAttribute('data-search') || '').toLowerCase();
                const tags = (card.getAttribute('data-tags') || '').toLowerCase();
                const textMatched = !text || search.indexOf(text) !== -1;
                const tagMatched = activeTag === 'all' || tags.indexOf(activeTag.toLowerCase()) !== -1 || search.indexOf(activeTag.toLowerCase()) !== -1;
                card.classList.toggle('is-hidden', !(textMatched && tagMatched));
            });
        }

        if (input) {
            input.addEventListener('input', refresh);
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                chip.classList.add('is-active');
                activeTag = chip.getAttribute('data-filter-chip') || 'all';
                refresh();
            });
        });
        refresh();
    }

    function setupSearchPage() {
        const root = document.querySelector('[data-search-page]');
        if (!root) {
            return;
        }
        const input = root.querySelector('[data-search-input]');
        const button = root.querySelector('[data-search-button]');
        const results = root.querySelector('[data-search-results]');
        const count = root.querySelector('[data-search-count]');
        const data = window.__MOVIE_INDEX__ || [];
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q') || '';

        function card(item) {
            return [
                '<article class="search-card">',
                '    <a href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>',
                '    <div>',
                '        <h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
                '        <p>' + escapeHtml(item.oneLine) + '</p>',
                '        <span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.category) + '</span>',
                '    </div>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function render() {
            const query = input.value.trim().toLowerCase();
            const matched = data.filter(function (item) {
                return !query || item.search.indexOf(query) !== -1;
            }).slice(0, 120);
            results.innerHTML = matched.map(card).join('');
            count.textContent = query ? '找到 ' + matched.length + ' 条相关结果' : '输入关键词查看全站影片结果';
        }

        if (input) {
            input.value = initial;
            input.addEventListener('input', render);
        }
        if (button) {
            button.addEventListener('click', render);
        }
        render();
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
}());
