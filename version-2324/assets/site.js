(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobile = document.querySelector("[data-mobile-nav]");
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobile.classList.toggle("is-open");
    });
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var year = scope.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      var empty = scope.querySelector("[data-no-results]");

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var shown = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-title") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var passQuery = !query || haystack.indexOf(query) !== -1;
          var passYear = !selectedYear || cardYear === selectedYear;
          var visible = passQuery && passYear;
          card.style.display = visible ? "" : "none";
          if (visible) {
            shown += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
    });
  }

  function initPlayer(streamUrl) {
    var video = document.querySelector("[data-player]");
    var layer = document.querySelector("[data-play-layer]");
    var button = document.querySelector("[data-play-button]");
    var hls = null;
    var started = false;

    if (!video || !streamUrl) {
      return;
    }

    function hideLayer() {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    }

    function start() {
      hideLayer();

      if (!started) {
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = streamUrl;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    if (layer) {
      layer.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    setupNavigation();
    setupFilters();
  });

  window.MovieSite = {
    initPlayer: initPlayer
  };
})();
