(function() {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs("[data-menu-button]");
    var menu = qs("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function() {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
      });
    });
    show(0);
    window.setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  function initSearch() {
    var input = qs("[data-site-search]");
    if (!input) {
      return;
    }
    var targets = qsa("[data-search]");
    input.addEventListener("input", function() {
      var value = input.value.trim().toLowerCase();
      targets.forEach(function(item) {
        var text = (item.getAttribute("data-search") || "").toLowerCase();
        item.classList.toggle("hide-by-search", value && text.indexOf(value) === -1);
      });
    });
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
    script.onload = callback;
    document.head.appendChild(script);
  }

  function initPlayer() {
    var video = qs("[data-video]");
    var button = qs("[data-play]");
    var layer = qs("[data-play-layer]");
    if (!video || !button) {
      return;
    }
    var stream = button.getAttribute("data-stream") || video.getAttribute("data-stream");
    var started = false;
    function start() {
      if (started) {
        video.play();
        if (layer) {
          layer.classList.add("hidden");
        }
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.play();
        if (layer) {
          layer.classList.add("hidden");
        }
        return;
      }
      loadHls(function() {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
            video.play();
          });
        } else {
          video.src = stream;
          video.play();
        }
        if (layer) {
          layer.classList.add("hidden");
        }
      });
    }
    button.addEventListener("click", start);
    video.addEventListener("click", function() {
      if (!started) {
        start();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    initMenu();
    initHero();
    initSearch();
    initPlayer();
  });
})();
