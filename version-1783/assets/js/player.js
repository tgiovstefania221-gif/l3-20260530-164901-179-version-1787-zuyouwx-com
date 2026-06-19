(function () {
  function setState(shell, text) {
    const state = shell.querySelector("[data-player-state]");
    if (state) {
      state.textContent = text;
    }
  }

  function bindPlayer(shell) {
    const video = shell.querySelector("video");
    const url = shell.getAttribute("data-video");
    if (!video || !url) {
      return;
    }

    let hls = null;
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setState(shell, "点击播放");
      });
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          setState(shell, "正在重新连接");
          hls.startLoad();
          return;
        }
        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          setState(shell, "正在恢复播放");
          hls.recoverMediaError();
          return;
        }
        setState(shell, "播放暂不可用");
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else {
      video.src = url;
      setState(shell, "播放暂不可用");
    }

    function togglePlay() {
      if (video.paused) {
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            setState(shell, "点击播放");
          });
        }
      } else {
        video.pause();
      }
    }

    shell.querySelectorAll("[data-play-button]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        togglePlay();
      });
    });

    const muteButton = shell.querySelector("[data-mute-button]");
    if (muteButton) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? "取消静音" : "静音";
      });
    }

    const fullscreenButton = shell.querySelector("[data-fullscreen-button]");
    if (fullscreenButton) {
      fullscreenButton.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (shell.requestFullscreen) {
          shell.requestFullscreen();
        }
      });
    }

    video.addEventListener("click", togglePlay);
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
      setState(shell, "正在播放");
    });
    video.addEventListener("pause", function () {
      shell.classList.remove("is-playing");
      setState(shell, "点击播放");
    });
    video.addEventListener("ended", function () {
      shell.classList.remove("is-playing");
      setState(shell, "播放结束");
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll("[data-player]").forEach(bindPlayer);
})();
