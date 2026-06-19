(function () {
  const root = document.querySelector("[data-player]");
  if (!root) {
    return;
  }

  const video = root.querySelector("video");
  const startLayer = root.querySelector(".player-cover");
  const startButton = root.querySelector(".player-start");
  const playButton = root.querySelector(".control-play");
  const muteButton = root.querySelector(".control-mute");
  const fullButton = root.querySelector(".control-full");
  const progress = root.querySelector(".progress");
  const timeLabel = root.querySelector(".time-label");
  const src = root.getAttribute("data-video");
  let hls = null;
  let loaded = false;
  let pendingPlay = false;

  const formatTime = function (time) {
    if (!Number.isFinite(time)) {
      return "0:00";
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return minutes + ":" + seconds;
  };

  const updateTime = function () {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (progress) {
      progress.max = duration || 0;
      progress.value = video.currentTime || 0;
    }
    if (timeLabel) {
      timeLabel.textContent = formatTime(video.currentTime || 0) + " / " + formatTime(duration || 0);
    }
  };

  const loadVideo = function () {
    if (loaded || !src || !video) {
      return;
    }
    loaded = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (pendingPlay) {
          video.play().catch(function () {});
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      video.src = src;
    }
  };

  const start = function () {
    pendingPlay = true;
    loadVideo();
    root.classList.add("is-ready");
    video.play().catch(function () {});
  };

  const togglePlay = function () {
    if (!loaded || video.paused) {
      start();
    } else {
      video.pause();
    }
  };

  const updatePlayState = function () {
    root.classList.toggle("is-playing", !video.paused);
    if (playButton) {
      playButton.textContent = video.paused ? "▶" : "⏸";
    }
  };

  if (startLayer) {
    startLayer.addEventListener("click", start);
  }
  if (startButton) {
    startButton.addEventListener("click", start);
  }
  if (playButton) {
    playButton.addEventListener("click", togglePlay);
  }
  if (video) {
    video.addEventListener("click", togglePlay);
    video.addEventListener("play", updatePlayState);
    video.addEventListener("pause", updatePlayState);
    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateTime);
    video.addEventListener("durationchange", updateTime);
  }
  if (muteButton) {
    muteButton.addEventListener("click", function () {
      video.muted = !video.muted;
      muteButton.textContent = video.muted ? "🔇" : "🔊";
    });
  }
  if (progress) {
    progress.addEventListener("input", function () {
      video.currentTime = Number(progress.value || 0);
      updateTime();
    });
  }
  if (fullButton) {
    fullButton.addEventListener("click", function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        root.requestFullscreen().catch(function () {});
      }
    });
  }
  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });

  updateTime();
})();
