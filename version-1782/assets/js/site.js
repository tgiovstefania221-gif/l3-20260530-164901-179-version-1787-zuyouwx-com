(function () {
    const menuButton = document.querySelector('[data-menu-button]');
    const navMenu = document.querySelector('[data-nav-menu]');
    if (menuButton && navMenu) {
        menuButton.addEventListener('click', function () {
            navMenu.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let active = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle('is-active', current === active);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle('is-active', current === active);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }
        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startSlider();
        });
    });
    showSlide(0);
    startSlider();

    document.querySelectorAll('[data-library-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = form.querySelector('input');
            const value = input ? input.value.trim() : '';
            const target = value ? './library.html?q=' + encodeURIComponent(value) : './library.html';
            window.location.href = target;
        });
    });

    const filterArea = document.querySelector('[data-filter-area]');
    if (filterArea) {
        const input = filterArea.querySelector('[data-filter-input]');
        const region = filterArea.querySelector('[data-filter-region]');
        const year = filterArea.querySelector('[data-filter-year]');
        const type = filterArea.querySelector('[data-filter-type]');
        const cards = Array.from(document.querySelectorAll('[data-title]'));
        const empty = document.querySelector('[data-empty-state]');
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q') || '';
        if (input && q) {
            input.value = q;
        }

        function value(node) {
            return node ? node.value.trim().toLowerCase() : '';
        }

        function applyFilter() {
            const keyword = value(input);
            const regionValue = value(region);
            const yearValue = value(year);
            const typeValue = value(type);
            let visible = 0;
            cards.forEach(function (card) {
                const text = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.category
                ].join(' ').toLowerCase();
                const matched = (!keyword || text.indexOf(keyword) !== -1) &&
                    (!regionValue || (card.dataset.region || '').toLowerCase() === regionValue) &&
                    (!yearValue || (card.dataset.year || '').toLowerCase() === yearValue) &&
                    (!typeValue || (card.dataset.type || '').toLowerCase() === typeValue);
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, region, year, type].forEach(function (node) {
            if (node) {
                node.addEventListener('input', applyFilter);
                node.addEventListener('change', applyFilter);
            }
        });
        applyFilter();
    }
})();
