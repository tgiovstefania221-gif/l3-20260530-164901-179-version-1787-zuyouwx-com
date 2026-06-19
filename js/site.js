(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startAuto() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startAuto();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startAuto();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
                startAuto();
            });
        });

        startAuto();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters(toolbar) {
        var scope = document.querySelector('[data-filter-scope]');
        if (!scope) {
            return;
        }

        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var localSearch = toolbar.querySelector('[data-local-search]');
        var activeButtons = Array.prototype.slice.call(toolbar.querySelectorAll('.filter-group button.active'));
        var keyword = localSearch ? normalize(localSearch.value) : '';
        var visibleCount = 0;

        cards.forEach(function (card) {
            var matched = true;
            var searchText = normalize(card.getAttribute('data-search'));

            if (keyword && searchText.indexOf(keyword) === -1) {
                matched = false;
            }

            activeButtons.forEach(function (button) {
                var filter = button.getAttribute('data-filter');
                var value = normalize(button.getAttribute('data-value'));

                if (!matched || filter === 'all' || value === 'all') {
                    return;
                }

                if (filter === 'type') {
                    var typeText = normalize(card.getAttribute('data-type'));
                    matched = typeText.indexOf(value) !== -1;
                }

                if (filter === 'year') {
                    matched = normalize(card.getAttribute('data-year')) === value;
                }
            });

            card.style.display = matched ? '' : 'none';
            if (matched) {
                visibleCount += 1;
            }
        });

        var empty = document.querySelector('[data-empty-state]');
        if (empty) {
            empty.classList.toggle('show', visibleCount === 0);
        }
    }

    document.querySelectorAll('[data-filter-toolbar]').forEach(function (toolbar) {
        var localSearch = toolbar.querySelector('[data-local-search]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (localSearch && initialQuery) {
            localSearch.value = initialQuery;
        }

        toolbar.querySelectorAll('.filter-group button').forEach(function (button) {
            button.addEventListener('click', function () {
                var group = button.closest('.filter-group');
                if (group) {
                    group.querySelectorAll('button').forEach(function (item) {
                        item.classList.remove('active');
                    });
                }
                button.classList.add('active');
                applyFilters(toolbar);
            });
        });

        if (localSearch) {
            localSearch.addEventListener('input', function () {
                applyFilters(toolbar);
            });
        }

        applyFilters(toolbar);
    });

    var backTop = document.querySelector('[data-back-top]');
    if (backTop) {
        window.addEventListener('scroll', function () {
            backTop.classList.toggle('show', window.scrollY > 500);
        });

        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
