function setupPlayer(videoId, coverId, source) {
    const video = document.getElementById(videoId);
    const cover = document.getElementById(coverId);
    let loaded = false;

    if (!video || !source) {
        return;
    }

    function loadSource() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function hideCover() {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    }

    function playVideo() {
        loadSource();
        hideCover();
        const playing = video.play();
        if (playing && typeof playing.catch === 'function') {
            playing.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', playVideo);
    }
    video.addEventListener('click', playVideo);
    video.addEventListener('play', hideCover);
    loadSource();
}
