(function () {
    var attached = false;

    function bind(video, streamUrl) {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    window.MoviePlayer = {
        start: function (streamUrl) {
            var video = document.querySelector(".movie-player");
            var button = document.querySelector(".player-overlay");

            if (!video || !button || !streamUrl) {
                return;
            }

            function play() {
                bind(video, streamUrl);
                button.classList.add("is-hidden");
                var action = video.play();

                if (action && typeof action.catch === "function") {
                    action.catch(function () {});
                }
            }

            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        }
    };
})();
