(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var current = slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    });
    if (current < 0) {
      current = 0;
      slides[0].classList.add("is-active");
    }
    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
      });
    });
    window.setInterval(function () {
      activate(current + 1);
    }, 5600);
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".search-input"));
    inputs.forEach(function (input) {
      var scope = input.closest(".search-scope") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var content = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          card.classList.toggle("is-filtered", keyword.length > 0 && content.indexOf(keyword) === -1);
        });
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".watch-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-overlay");
      var stream = player.getAttribute("data-stream");
      var attached = false;
      if (!video || !button || !stream) {
        return;
      }
      function attach() {
        if (attached) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        attached = true;
      }
      function start() {
        attach();
        button.classList.add("is-hidden");
        player.classList.add("is-playing");
        video.controls = true;
        var play = video.play();
        if (play && typeof play.catch === "function") {
          play.catch(function () {});
        }
      }
      button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
