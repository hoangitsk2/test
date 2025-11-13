const playlist = [
  {
    title: "Chill Day",
    artist: "LAKEY INSPIRED",
    src: "https://cdn.pixabay.com/download/audio/2022/10/09/audio_9b9ee0d9a3.mp3?filename=chill-day-12418.mp3"
  },
  {
    title: "Waves",
    artist: "Pictures of the Floating World",
    src: "https://cdn.pixabay.com/download/audio/2022/02/14/audio_bbc32c50bb.mp3?filename=waves-110088.mp3"
  },
  {
    title: "Dreamy Vibes",
    artist: "ZakharValaha",
    src: "https://cdn.pixabay.com/download/audio/2021/11/23/audio_4f7736b5aa.mp3?filename=dreamy-vibes-ambient-11091.mp3"
  }
];

const rangeBackground = (element, value) => {
  if (!element) return;
  const percentage = Math.max(0, Math.min(100, value));
  element.style.background = `linear-gradient(to right, #8fa8ff 0%, #8fa8ff ${percentage}%, rgba(255, 255, 255, 0.2) ${percentage}%, rgba(255, 255, 255, 0.2) 100%)`;
};

const formatTime = (timeInSeconds = 0) => {
  if (!Number.isFinite(timeInSeconds)) {
    return "0:00";
  }
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const initMusicPlayer = () => {
  const audio = document.getElementById("audio-player");
  const playPauseButton = document.getElementById("play-pause");
  const nextButton = document.getElementById("next-track");
  const previousButton = document.getElementById("prev-track");
  const progressBar = document.getElementById("progress-bar");
  const currentTimeEl = document.getElementById("current-time");
  const durationEl = document.getElementById("duration");
  const volumeSlider = document.getElementById("volume-slider");
  const muteToggle = document.getElementById("mute-toggle");
  const titleEl = document.getElementById("track-title");
  const artistEl = document.getElementById("track-artist");
  const playlistEl = document.getElementById("track-list");
  const toggleListButton = document.getElementById("toggle-track-list");

  if (!audio || !playPauseButton || !progressBar || !volumeSlider || !playlistEl) {
    return;
  }

  let currentTrackIndex = 0;
  let isUserSeeking = false;

  audio.preload = "metadata";
  audio.volume = 0.8;
  rangeBackground(volumeSlider, volumeSlider.value);

  const renderPlaylist = () => {
    playlistEl.innerHTML = "";
    playlist.forEach((track, index) => {
      const button = document.createElement("button");
      button.className = "music-player__track";
      button.type = "button";
      button.dataset.index = index.toString();
      button.innerHTML = `
        <span class="music-player__track-title">${track.title}</span>
        <span class="music-player__track-artist">${track.artist}</span>
      `;
      button.addEventListener("click", () => {
        loadTrack(index, true);
      });
      playlistEl.appendChild(button);
    });
  };

  const highlightActiveTrack = () => {
    const buttons = playlistEl.querySelectorAll(".music-player__track");
    buttons.forEach((btn, index) => {
      btn.classList.toggle("is-active", index === currentTrackIndex);
    });
  };

  const updatePlayState = () => {
    const isPlaying = !audio.paused;
    playPauseButton.textContent = isPlaying ? "⏸" : "▶";
    playPauseButton.setAttribute("aria-pressed", String(isPlaying));
  };

  const loadTrack = (index, shouldPlay = false) => {
    currentTrackIndex = (index + playlist.length) % playlist.length;
    const { title, artist, src } = playlist[currentTrackIndex];
    audio.src = src;
    audio.currentTime = 0;
    titleEl.textContent = title;
    artistEl.textContent = artist;
    progressBar.value = 0;
    rangeBackground(progressBar, 0);
    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";
    highlightActiveTrack();

    if (shouldPlay) {
      audio
        .play()
        .then(updatePlayState)
        .catch(() => {
          updatePlayState();
        });
    } else {
      updatePlayState();
    }
  };

  renderPlaylist();
  loadTrack(currentTrackIndex);

  playPauseButton.addEventListener("click", () => {
    if (audio.paused) {
      audio
        .play()
        .then(updatePlayState)
        .catch(() => {
          /* Ignore autoplay restrictions */
        });
    } else {
      audio.pause();
      updatePlayState();
    }
  });

  nextButton?.addEventListener("click", () => {
    loadTrack(currentTrackIndex + 1, true);
  });

  previousButton?.addEventListener("click", () => {
    loadTrack(currentTrackIndex - 1, true);
  });

  toggleListButton?.addEventListener("click", () => {
    const isHidden = playlistEl.hasAttribute("hidden");
    if (isHidden) {
      playlistEl.removeAttribute("hidden");
    } else {
      playlistEl.setAttribute("hidden", "");
    }
    toggleListButton.setAttribute("aria-expanded", String(isHidden));
  });

  progressBar.addEventListener("input", event => {
    isUserSeeking = true;
    const value = Number(event.target.value);
    rangeBackground(progressBar, value);
    const previewTime = (value / 100) * audio.duration;
    if (Number.isFinite(previewTime)) {
      currentTimeEl.textContent = formatTime(previewTime);
    }
  });

  progressBar.addEventListener("change", event => {
    const value = Number(event.target.value);
    if (Number.isFinite(audio.duration)) {
      audio.currentTime = (value / 100) * audio.duration;
    }
    isUserSeeking = false;
  });

  audio.addEventListener("timeupdate", () => {
    if (isUserSeeking) {
      return;
    }
    const progress = Number.isFinite(audio.duration) && audio.duration > 0
      ? (audio.currentTime / audio.duration) * 100
      : 0;
    progressBar.value = progress;
    rangeBackground(progressBar, progress);
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("ended", () => {
    loadTrack(currentTrackIndex + 1, true);
  });

  volumeSlider.addEventListener("input", event => {
    const value = Number(event.target.value);
    const normalized = value / 100;
    audio.volume = Math.max(0, Math.min(1, normalized));
    audio.muted = audio.volume === 0;
    muteToggle.textContent = audio.muted ? "🔇" : "🔊";
    rangeBackground(volumeSlider, value);
  });

  muteToggle.addEventListener("click", () => {
    audio.muted = !audio.muted;
    muteToggle.textContent = audio.muted ? "🔇" : "🔊";
    if (!audio.muted && audio.volume === 0) {
      audio.volume = 0.5;
      volumeSlider.value = 50;
      rangeBackground(volumeSlider, 50);
    }
  });

  document.addEventListener("keydown", event => {
    if (event.code === "Space" && document.activeElement?.tagName !== "INPUT") {
      event.preventDefault();
      playPauseButton.click();
    }
    if (event.code === "ArrowRight" && event.shiftKey) {
      nextButton?.click();
    }
    if (event.code === "ArrowLeft" && event.shiftKey) {
      previousButton?.click();
    }
  });
};

window.addEventListener("load", () => {
  const timeout = setTimeout(() => {
    document.body.classList.remove("not-loaded");
    clearTimeout(timeout);
  }, 1000);

  initMusicPlayer();
});