(function () {
  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.play-cover');
    var stream = video ? video.getAttribute('data-stream') : '';
    var attached = false;

    function attach() {
      if (!video || !stream || attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video) {
        video.controls = true;
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            if (cover) {
              cover.classList.remove('is-hidden');
            }
          });
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!attached) {
          start();
        }
      });
    }
  });
})();
