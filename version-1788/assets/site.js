document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".mobile-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === current);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
  filters.forEach(function (input) {
    var scopeSelector = input.getAttribute("data-filter-input");
    var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card")) : [];

    function runFilter() {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        card.classList.toggle("hidden-card", value && text.indexOf(value) === -1);
      });
    }

    input.addEventListener("input", runFilter);

    var panel = input.closest(".search-panel");
    if (panel) {
      var button = panel.querySelector("button");
      if (button) {
        button.addEventListener("click", runFilter);
      }
    }

    if (scopeSelector === "#search-grid") {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
        runFilter();
      }
    }
  });

  var players = Array.prototype.slice.call(document.querySelectorAll(".player-box"));
  players.forEach(function (box) {
    var video = box.querySelector("video");
    var cover = box.querySelector(".player-cover");
    var stream = box.getAttribute("data-stream");
    var ready = false;
    var player = null;

    function attach() {
      if (!video || !stream || ready) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls();
        player.loadSource(stream);
        player.attachMedia(video);
        box.hlsPlayer = player;
      } else {
        video.src = stream;
      }
      ready = true;
    }

    function play() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (video) {
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (cover) {
              cover.classList.remove("is-hidden");
            }
          });
        }
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    }
  });
});
