(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        play();
      });
    });
    show(0);
    play();
  }

  function setupFilters() {
    var groups = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    groups.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var select = scope.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var empty = scope.querySelector("[data-empty]");
      if (!input && !select) {
        return;
      }
      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var year = select ? select.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var okText = !keyword || text.indexOf(keyword) !== -1;
          var okYear = !year || text.indexOf(year) !== -1;
          var ok = okText && okYear;
          card.classList.toggle("hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-player");
  var button = document.getElementById("play-toggle");
  if (!video || !streamUrl) {
    return;
  }
  function attach() {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }
  function play() {
    if (button) {
      button.classList.add("is-hidden");
    }
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });
    }
  }
  attach();
  if (button) {
    button.addEventListener("click", play);
  }
  video.addEventListener("play", function () {
    if (button) {
      button.classList.add("is-hidden");
    }
  });
  video.addEventListener("pause", function () {
    if (button && video.currentTime === 0) {
      button.classList.remove("is-hidden");
    }
  });
}
