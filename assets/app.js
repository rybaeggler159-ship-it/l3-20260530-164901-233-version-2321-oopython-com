document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var heroIndex = 0;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === heroIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === heroIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showHero(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5600);
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var searchInput = document.querySelector(".search-input");

    if (searchInput && query) {
        searchInput.value = query;
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function filterCards(scope, term) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        var text = normalize(term);
        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].join(" "));
            card.classList.toggle("is-hidden", text && haystack.indexOf(text) === -1);
        });
    }

    var searchPage = document.querySelector(".search-results");
    if (searchPage) {
        filterCards(searchPage, query);
        var searchForm = document.querySelector(".search-panel form");
        if (searchForm) {
            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                filterCards(searchPage, searchInput ? searchInput.value : "");
            });
        }
        if (searchInput) {
            searchInput.addEventListener("input", function () {
                filterCards(searchPage, searchInput.value);
            });
        }
    }

    Array.prototype.slice.call(document.querySelectorAll(".category-filter")).forEach(function (filter) {
        var input = filter.querySelector("input");
        var grid = document.querySelector(filter.getAttribute("data-target"));
        if (input && grid) {
            input.addEventListener("input", function () {
                filterCards(grid, input.value);
            });
            filter.addEventListener("submit", function (event) {
                event.preventDefault();
                filterCards(grid, input.value);
            });
        }
    });
});
