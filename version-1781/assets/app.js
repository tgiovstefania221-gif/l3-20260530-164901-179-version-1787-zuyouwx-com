(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".site-nav");

        if (menuButton && nav) {
            menuButton.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var heroIndex = 0;

        function showHero(index) {
            if (!slides.length) {
                return;
            }

            heroIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === heroIndex);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === heroIndex);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showHero(i);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showHero(heroIndex + 1);
            }, 6200);
        }

        var searchInput = document.querySelector(".js-search");
        var yearSelect = document.querySelector(".js-year");
        var typeSelect = document.querySelector(".js-type");
        var categorySelect = document.querySelector(".js-category");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function filterCards() {
            if (!cards.length) {
                return;
            }

            var keyword = normalize(searchInput ? searchInput.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var category = normalize(categorySelect ? categorySelect.value : "");

            cards.forEach(function (card) {
                var text = normalize(card.textContent + " " + card.dataset.title + " " + card.dataset.genre);
                var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                var okYear = !year || normalize(card.dataset.year) === year;
                var okType = !type || normalize(card.dataset.type) === type;
                var okCategory = !category || normalize(card.dataset.category) === category;
                card.classList.toggle("is-filtered-out", !(okKeyword && okYear && okType && okCategory));
            });
        }

        [searchInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", filterCards);
                control.addEventListener("change", filterCards);
            }
        });
    });
})();
