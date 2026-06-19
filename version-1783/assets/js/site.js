(function () {
  const rootBase = document.body ? document.body.getAttribute("data-base") || "./" : "./";

  function resolvePath(path) {
    return rootBase + path.replace(/^\.\//, "");
  }

  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const backTop = document.querySelector("[data-back-top]");
  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("is-visible", window.scrollY > 320);
    });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = form.getAttribute("action") || resolvePath("search.html");
        return;
      }
      event.preventDefault();
      const target = form.getAttribute("action") || resolvePath("search.html");
      window.location.href = target + "?q=" + encodeURIComponent(input.value.trim());
    });
  });

  const slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-slide-dot]"));
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function startSlider() {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute("data-slide-dot")) || 0);
        startSlider();
      });
    });

    slider.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    slider.addEventListener("mouseleave", startSlider);
    startSlider();
  }

  const localFilter = document.querySelector("[data-local-filter]");
  const localSort = document.querySelector("[data-local-sort]");
  const cardList = document.querySelector("[data-card-list]");
  const localEmpty = document.querySelector("[data-local-empty]");

  function filterLocalCards() {
    if (!cardList) {
      return;
    }
    const query = localFilter ? localFilter.value.trim().toLowerCase() : "";
    let visible = 0;
    Array.from(cardList.querySelectorAll("[data-card]")).forEach(function (card) {
      const haystack = (card.getAttribute("data-filter-text") || "").toLowerCase();
      const matched = !query || haystack.indexOf(query) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    if (localEmpty) {
      localEmpty.hidden = visible !== 0;
    }
  }

  if (localFilter) {
    localFilter.addEventListener("input", filterLocalCards);
  }

  if (localSort && cardList) {
    localSort.addEventListener("change", function () {
      const cards = Array.from(cardList.querySelectorAll("[data-card]"));
      const mode = localSort.value;
      cards.sort(function (a, b) {
        if (mode === "year-desc") {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        }
        if (mode === "title-asc") {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        }
        return 0;
      });
      cards.forEach(function (card) {
        cardList.appendChild(card);
      });
      filterLocalCards();
    });
  }

  const searchInput = document.querySelector("[data-search-input]");
  const categorySelect = document.querySelector("[data-category-select]");
  const yearSelect = document.querySelector("[data-year-select]");
  const regionSelect = document.querySelector("[data-region-select]");
  const resultBox = document.querySelector("[data-search-results]");
  const resetButton = document.querySelector("[data-reset-search]");
  const searchEmpty = document.querySelector("[data-search-empty]");

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cardTemplate(item) {
    const href = resolvePath(item.url);
    const image = resolvePath(item.cover);
    const tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>#" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      '<article class="movie-card card-grid" data-card>',
      '  <a href="' + escapeHtml(href) + '" class="movie-card-link">',
      '    <div class="cover-box">',
      '      <span class="cover-glow">' + escapeHtml(item.title) + '</span>',
      '      <img src="' + escapeHtml(image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '      <span class="play-mark">▶</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <div class="meta-row"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '      <h3>' + escapeHtml(item.title) + '</h3>',
      '      <p>' + escapeHtml(item.oneLine) + '</p>',
      '      <div class="tag-row">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join("");
  }

  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function runSearch() {
    if (!resultBox || !window.SEARCH_INDEX) {
      return;
    }
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const category = categorySelect ? categorySelect.value : "";
    const year = yearSelect ? yearSelect.value : "";
    const region = regionSelect ? regionSelect.value : "";
    const results = window.SEARCH_INDEX.filter(function (item) {
      const haystack = [item.title, item.region, item.type, item.year, item.genre, item.categoryLabel, (item.tags || []).join(" "), item.oneLine].join(" ").toLowerCase();
      if (query && haystack.indexOf(query) === -1) {
        return false;
      }
      if (category && item.category !== category) {
        return false;
      }
      if (year && item.year !== year) {
        return false;
      }
      if (region && item.region !== region) {
        return false;
      }
      return true;
    }).slice(0, 120);

    resultBox.innerHTML = results.map(cardTemplate).join("");
    if (searchEmpty) {
      searchEmpty.hidden = results.length !== 0;
    }
  }

  if (resultBox) {
    const initialQuery = getParam("q");
    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }
    [searchInput, categorySelect, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", runSearch);
        control.addEventListener("change", runSearch);
      }
    });
    if (resetButton) {
      resetButton.addEventListener("click", function () {
        [searchInput, categorySelect, yearSelect, regionSelect].forEach(function (control) {
          if (control) {
            control.value = "";
          }
        });
        runSearch();
      });
    }
    if (initialQuery) {
      runSearch();
    }
  }
})();
