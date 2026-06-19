
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function normalize(str) {
  return String(str || "").toLowerCase().trim();
}

function setActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  $$("[data-nav]").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });
}

function initHeroSlider() {
  const slider = $("#heroSlides");
  if (!slider) return;
  const slides = $$(".hero-slide", slider);
  if (slides.length <= 1) return;
  const dots = $("#heroDots");
  let idx = 0;
  const show = (next) => {
    idx = (next + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
    if (dots) {
      $$(".dot", dots).forEach((d, i) => d.classList.toggle("is-active", i === idx));
    }
  };
  if (dots && !dots.children.length) {
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dot" + (i === 0 ? " is-active" : "");
      b.addEventListener("click", () => show(i));
      dots.appendChild(b);
    });
  }
  const next = () => show(idx + 1);
  show(0);
  let timer = setInterval(next, 4500);
  slider.addEventListener("mouseenter", () => clearInterval(timer));
  slider.addEventListener("mouseleave", () => timer = setInterval(next, 4500));
}

function filterCards(root) {
  const cards = $$(".js-card", root);
  if (!cards.length) return;
  const qInput = $("[data-filter-input]", root);
  const sortSelect = $("[data-sort]", root);
  const yearSelect = $("[data-year-filter]", root);
  const apply = () => {
    const q = normalize(qInput ? qInput.value : "");
    const sort = sortSelect ? sortSelect.value : "score";
    const year = yearSelect ? yearSelect.value : "all";
    let list = cards.slice();

    list.forEach(card => {
      const hay = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.oneLine
      ].join(" "));
      const passQ = !q || hay.includes(q);
      const passY = year === "all" || card.dataset.year === year;
      card.style.display = (passQ && passY) ? "" : "none";
    });

    const visible = cards.filter(c => c.style.display !== "none");
    visible.sort((a, b) => {
      if (sort === "year") return Number(b.dataset.year) - Number(a.dataset.year);
      if (sort === "title") return a.dataset.title.localeCompare(b.dataset.title, "zh-Hans-CN");
      return Number(b.dataset.score) - Number(a.dataset.score);
    });
    visible.forEach(card => card.parentNode.appendChild(card));
    const count = root.querySelector("[data-result-count]");
    if (count) count.textContent = visible.length;
  };
  [qInput, sortSelect, yearSelect].forEach(el => el && el.addEventListener("input", apply));
  apply();
}

function initSearchPage() {
  const box = $("#searchResults");
  if (!box || !window.SITE_MOVIES) return;
  const input = $("#searchInput");
  const qFromUrl = new URLSearchParams(location.search).get("q") || "";
  if (input) input.value = qFromUrl;
  const render = () => {
    const q = normalize(input ? input.value : qFromUrl);
    const list = window.SITE_MOVIES.filter(m => {
      if (!q) return true;
      const hay = normalize([m.title, m.genre, m.region, m.type, m.one_line, (m.tags || []).join(" ")].join(" "));
      return hay.includes(q);
    });
    $("#searchCount") && ($("#searchCount").textContent = list.length);
    box.innerHTML = list.slice(0, 240).map(cardHTML).join("") || `
      <div class="page-hero" style="width:100%;margin:0;">
        <h1>没有找到匹配结果</h1>
        <p>换个关键词试试，比如影片名、类型、地区或标签。</p>
      </div>`;
    if (input && !input.dataset.bound) {
      input.dataset.bound = "1";
      input.addEventListener("input", render);
    }
  };
  render();
}

function cardHTML(m) {
  return `
  <a class="card js-card" href="${m.detail_url}" data-title="${escapeHTML(m.title)}" data-genre="${escapeHTML(m.genre)}" data-tags="${escapeHTML((m.tags || []).join(" "))}" data-region="${escapeHTML(m.region)}" data-year="${m.year}" data-score="${m.score}" data-one-line="${escapeHTML(m.one_line)}">
    <div class="poster">
      <span class="rank">#${String(m.id).padStart(4, "0")}</span>
      <img loading="lazy" src="${m.poster}" alt="${escapeHTML(m.title)}">
      <span class="hot">热播</span>
    </div>
    <div class="card-body">
      <h3 class="card-title">${escapeHTML(m.title)}</h3>
      <div class="card-meta">
        <span>${escapeHTML(m.year)}</span>
        <span>${escapeHTML(m.region)}</span>
        <span>${escapeHTML(m.genre.split("/")[0].trim())}</span>
      </div>
      <div class="card-tags">
        ${(m.tags || []).slice(0, 3).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join("")}
      </div>
    </div>
  </a>`;
}

function escapeHTML(str) {
  return String(str || "").replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;","&gt;":"&quot;","'":"&#39;"
  }[s]));
}

async function initPlayer() {
  const video = $("#moviePlayer");
  if (!video) return;

  $$("[data-play-now]").forEach(btn => {
    btn.addEventListener("click", () => {
      video.play().catch(() => {});
    });
  });
  const hlsSrc = video.dataset.hls;
  const mp4Src = video.dataset.mp4;
  const canNativeHls = video.canPlayType("application/vnd.apple.mpegurl");
  if (canNativeHls) {
    video.src = hlsSrc;
    return;
  }
  try {
    const mod = await import("./hls.js");
    const Hls = mod.H || mod.default || mod.Hls;
    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        lowLatencyMode: false
      });
      hls.loadSource(hlsSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function(event, data) {
        if (data && data.fatal) {
          video.src = mp4Src;
        }
      });
      return;
    }
  } catch (err) {
    console.warn("HLS init failed", err);
  }
  video.src = mp4Src;
}

function initCategoryFilters() {
  const scope = $(".filter-bar");
  if (!scope) return;
  filterCards(scope.closest(".section") || document);
}

function initSortButtons() {
  const sortButtons = $$("[data-sort-btn]");
  if (!sortButtons.length) return;
  sortButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.target);
      if (!target) return;
      const key = btn.dataset.sortBtn;
      $$("[data-sort-btn]", btn.parentNode).forEach(b => b.classList.toggle("is-active", b === btn));
      const cards = $$(".js-card", target);
      cards.sort((a, b) => {
        if (key === "year") return Number(b.dataset.year) - Number(a.dataset.year);
        if (key === "title") return a.dataset.title.localeCompare(b.dataset.title, "zh-Hans-CN");
        return Number(b.dataset.score) - Number(a.dataset.score);
      });
      cards.forEach(card => target.appendChild(card));
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  initHeroSlider();
  initSearchPage();
  initPlayer();
  initCategoryFilters();
  initSortButtons();
});
