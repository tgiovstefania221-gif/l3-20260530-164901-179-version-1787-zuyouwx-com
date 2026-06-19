import { H as Hls } from './hls.js';

function initializePlayer(box) {
    var video = box.querySelector('video[data-src]');
    var overlay = box.querySelector('[data-play-overlay]');

    if (!video || !overlay) {
        return;
    }

    var source = video.getAttribute('data-src');
    var hlsInstance = null;

    function attachSource() {
        if (!source || video.getAttribute('data-ready') === 'true') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }

        video.setAttribute('data-ready', 'true');
    }

    function playVideo() {
        attachSource();
        overlay.classList.add('is-hidden');
        video.controls = true;

        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
                video.controls = true;
            });
        }
    }

    overlay.addEventListener('click', playVideo);

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}

document.querySelectorAll('[data-player-box]').forEach(initializePlayer);
