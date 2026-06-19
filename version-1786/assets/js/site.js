(function () {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".mobile-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dots button"));
  if (slides.length > 1 && dots.length === slides.length) {
    let active = 0;
    const show = function (index) {
      active = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    setInterval(function () {
      show((active + 1) % slides.length);
    }, 5600);
  }

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  const filterInput = document.querySelector(".filter-keyword");
  const typeSelect = document.querySelector(".filter-type");
  const yearSelect = document.querySelector(".filter-year");
  const sortSelect = document.querySelector(".filter-sort");
  const cards = Array.from(document.querySelectorAll(".filter-card"));
  const empty = document.querySelector(".empty-state");

  if (filterInput && query) {
    filterInput.value = query;
  }

  const normalize = function (value) {
    return (value || "").toString().trim().toLowerCase();
  };

  const applyFilters = function () {
    const keyword = normalize(filterInput ? filterInput.value : "");
    const type = normalize(typeSelect ? typeSelect.value : "");
    const year = normalize(yearSelect ? yearSelect.value : "");
    let shown = 0;

    cards.forEach(function (card) {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.tags
      ].join(" "));
      const matchKeyword = !keyword || haystack.includes(keyword);
      const matchType = !type || normalize(card.dataset.type).includes(type);
      const matchYear = !year || normalize(card.dataset.year) === year;
      const visible = matchKeyword && matchType && matchYear;
      card.style.display = visible ? "" : "none";
      if (visible) {
        shown += 1;
      }
    });

    if (empty) {
      empty.style.display = shown ? "none" : "block";
    }
  };

  const sortCards = function () {
    if (!sortSelect) {
      return;
    }
    const grid = document.querySelector(".sortable-grid");
    if (!grid) {
      return;
    }
    const mode = sortSelect.value;
    const ordered = cards.slice().sort(function (a, b) {
      if (mode === "score") {
        return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
      }
      if (mode === "year") {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      }
      if (mode === "views") {
        return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
      }
      return 0;
    });
    ordered.forEach(function (card) {
      grid.appendChild(card);
    });
  };

  [filterInput, typeSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      sortCards();
      applyFilters();
    });
  }

  if (cards.length) {
    sortCards();
    applyFilters();
  }
})();
