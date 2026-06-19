
(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setActiveNav() {
    const path = location.pathname.replace(/\/index\.html?$/, '/');
    qsa('.nav a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (!href) return;
      if (href === location.pathname || (href !== '/' && path.endsWith(href.replace(/\.html$/, '/')))) {
        a.classList.add('active');
      }
    });
  }

  function initMenu() {
    const btn = qs('[data-menu-toggle]');
    const nav = qs('[data-nav]');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }

  function initPlayers() {
    qsa('video[data-hls]').forEach(video => {
      const src = video.dataset.hls;
      if (!src) return;
      if (video.dataset.inited) return;
      video.dataset.inited = '1';
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return;
      }
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            console.warn('HLS error:', data);
          }
        });
      } else {
        const wrap = video.closest('.player');
        if (wrap) {
          const note = document.createElement('div');
          note.className = 'note';
          note.textContent = '当前浏览器暂不支持 HLS 自动播放，请使用支持 M3U8 的浏览器打开。';
          wrap.appendChild(note);
        }
      }
    });
  }

  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[·•，,。！？!?/\\|:：；;"'“”‘’()\[\]{}<>_+-]/g, '');
  }

  function buildCard(item, opts = {}) {
    const tags = (item.tags || []).slice(0, 3).map(t => `<span class="pill gray">${escapeHtml(t)}</span>`).join('');
    const score = opts.score != null ? `<span class="pill amber">热度 ${Math.round(opts.score)}</span>` : '';
    const meta = `${escapeHtml(item.region || '')} · ${escapeHtml(item.year || '')} · ${escapeHtml(item.type || '')}`;
    const oneLine = escapeHtml(item.one_line || item.summary || '');
    return `
      <a class="card" href="${escapeAttr(item.detail_url)}">
        <div class="poster-wrap">
          <img src="${escapeAttr(item.poster)}" alt="${escapeAttr(item.title)}" loading="lazy">
        </div>
        <div class="meta">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${oneLine}</p>
          <div class="foot">
            <span>${meta}</span>
            <span>${escapeHtml(item.category_title || item.primary_category || '')}</span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">${tags}${score}</div>
        </div>
      </a>`;
  }

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }
  function escapeAttr(str) { return escapeHtml(str).replace(/`/g, '&#96;'); }

  function initSearchPage() {
    const root = qs('[data-search-page]');
    if (!root) return;
    const data = window.SITE_CATALOG || [];
    const input = qs('[data-search-input]', root);
    const typeSel = qs('[data-filter-type]', root);
    const regionSel = qs('[data-filter-region]', root);
    const yearSel = qs('[data-filter-year]', root);
    const results = qs('[data-search-results]', root);
    const count = qs('[data-result-count]', root);
    const pager = qs('[data-pagination]', root);
    const clearBtn = qs('[data-clear-filters]', root);
    const params = new URLSearchParams(location.search);

    const state = {
      q: params.get('q') || '',
      type: params.get('type') || '',
      region: params.get('region') || '',
      year: params.get('year') || '',
      page: Math.max(1, parseInt(params.get('page') || '1', 10) || 1),
      pageSize: 24
    };

    if (input) input.value = state.q;
    if (typeSel && state.type) typeSel.value = state.type;
    if (regionSel && state.region) regionSel.value = state.region;
    if (yearSel && state.year) yearSel.value = state.year;

    function filtered() {
      const q = normalize(state.q);
      return data.filter(item => {
        if (state.type && item.type !== state.type) return false;
        if (state.region && item.region !== state.region) return false;
        if (state.year && String(item.year) !== String(state.year)) return false;
        if (q) {
          const hay = normalize([
            item.title, item.region, item.type, item.year, item.genre,
            (item.tags || []).join(' '), item.one_line, item.summary, item.review
          ].join(' '));
          if (!hay.includes(q)) return false;
        }
        return true;
      });
    }

    function render() {
      const list = filtered().sort((a,b) => (b.score||0) - (a.score||0) || a.id - b.id);
      const total = list.length;
      const pages = Math.max(1, Math.ceil(total / state.pageSize));
      state.page = Math.min(state.page, pages);
      const start = (state.page - 1) * state.pageSize;
      const slice = list.slice(start, start + state.pageSize);
      if (count) count.textContent = `共 ${total} 条，当前第 ${state.page} / ${pages} 页`;
      if (results) results.innerHTML = slice.map(item => buildCard(item, item)).join('') || '<div class="note">暂无匹配结果，请尝试更换关键词。</div>';
      if (pager) {
        const prev = state.page > 1 ? state.page - 1 : 1;
        const next = state.page < pages ? state.page + 1 : pages;
        let html = '';
        html += `<a class="page-link ${state.page===1?'disabled':''}" href="${pageUrl(prev)}">上一页</a>`;
        const windowSize = 7;
        let begin = Math.max(1, state.page - Math.floor(windowSize/2));
        let end = Math.min(pages, begin + windowSize - 1);
        begin = Math.max(1, end - windowSize + 1);
        if (begin > 1) html += `<a class="page-link" href="${pageUrl(1)}">1</a>`;
        if (begin > 2) html += `<span class="page-link disabled">…</span>`;
        for (let p = begin; p <= end; p++) {
          html += `<a class="page-link ${p===state.page?'active':''}" href="${pageUrl(p)}">${p}</a>`;
        }
        if (end < pages - 1) html += `<span class="page-link disabled">…</span>`;
        if (end < pages) html += `<a class="page-link" href="${pageUrl(pages)}">${pages}</a>`;
        html += `<a class="page-link ${state.page===pages?'disabled':''}" href="${pageUrl(next)}">下一页</a>`;
        pager.innerHTML = html;
      }
    }

    function pageUrl(page) {
      const p = new URLSearchParams(location.search);
      if (state.q) p.set('q', state.q); else p.delete('q');
      if (state.type) p.set('type', state.type); else p.delete('type');
      if (state.region) p.set('region', state.region); else p.delete('region');
      if (state.year) p.set('year', state.year); else p.delete('year');
      if (page > 1) p.set('page', page); else p.delete('page');
      const qs = p.toString();
      return location.pathname + (qs ? `?${qs}` : '');
    }

    function syncAndRender() {
      state.q = input ? input.value.trim() : state.q;
      state.type = typeSel ? typeSel.value : state.type;
      state.region = regionSel ? regionSel.value : state.region;
      state.year = yearSel ? yearSel.value : state.year;
      state.page = 1;
      render();
    }

    [input, typeSel, regionSel, yearSel].forEach(el => {
      if (!el) return;
      el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', syncAndRender);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (input) input.value = '';
        if (typeSel) typeSel.value = '';
        if (regionSel) regionSel.value = '';
        if (yearSel) yearSel.value = '';
        state.q = state.type = state.region = state.year = '';
        state.page = 1;
        render();
      });
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    initMenu();
    initPlayers();
    initSearchPage();
  });
})();
