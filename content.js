const DEFAULT_SETTINGS = {
  enabled: true,
  speed: 3
};

const watchedVideos = new WeakSet();
let currentSettings = { ...DEFAULT_SETTINGS };
let isApplyingRate = false;
let enforceTimer = null;

function normalizeSpeed(value) {
  const speed = Number(value);
  if (!Number.isFinite(speed)) return DEFAULT_SETTINGS.speed;
  return Math.min(5, Math.max(0.25, Math.round(speed * 4) / 4));
}

function getTargetRate() {
  return normalizeSpeed(currentSettings.speed);
}

function setVideoSpeed(video) {
  if (!(video instanceof HTMLVideoElement)) return;

  if (!currentSettings.enabled) {
    if (video.dataset.video3xManaged === "true") {
      delete video.dataset.video3xManaged;
    }
    return;
  }

  const targetRate = getTargetRate();

  try {
    isApplyingRate = true;
    video.playbackRate = targetRate;
    video.defaultPlaybackRate = targetRate;
    video.dataset.video3xManaged = "true";
  } finally {
    isApplyingRate = false;
  }
}

function syncVideoSpeed(video) {
  if (!(video instanceof HTMLVideoElement)) return;
  if (!currentSettings.enabled) return;

  const targetRate = getTargetRate();
  if (video.playbackRate !== targetRate || video.defaultPlaybackRate !== targetRate) {
    setVideoSpeed(video);
  }
}

function watchVideo(video) {
  if (!(video instanceof HTMLVideoElement)) return;

  if (!watchedVideos.has(video)) {
    watchedVideos.add(video);

    ["loadedmetadata", "play", "playing", "ratechange"].forEach((eventName) => {
      video.addEventListener(eventName, () => {
        if (!isApplyingRate) {
          syncVideoSpeed(video);
        }
      });
    });
  }

  setVideoSpeed(video);
}

function scanVideos(root = document) {
  if (root instanceof HTMLVideoElement) {
    watchVideo(root);
    return;
  }

  root.querySelectorAll?.("video").forEach(watchVideo);
}

function enforceAllVideos() {
  if (!currentSettings.enabled) return;
  document.querySelectorAll("video").forEach((video) => {
    watchVideo(video);
    syncVideoSpeed(video);
  });
}

function startEnforcing() {
  if (enforceTimer) return;
  enforceTimer = window.setInterval(enforceAllVideos, 500);
}

function stopEnforcing() {
  if (!enforceTimer) return;
  window.clearInterval(enforceTimer);
  enforceTimer = null;
}

function applySettings(settings) {
  currentSettings = {
    enabled: settings.enabled !== false,
    speed: normalizeSpeed(settings.speed)
  };

  if (currentSettings.enabled) {
    startEnforcing();
  } else {
    stopEnforcing();
  }

  scanVideos();
  enforceAllVideos();
}

chrome.storage.sync.get(DEFAULT_SETTINGS, applySettings);

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") return;

  applySettings({
    enabled: changes.enabled?.newValue ?? currentSettings.enabled,
    speed: changes.speed?.newValue ?? currentSettings.speed
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== "VIDEO_3X_APPLY_SETTINGS") return;

  applySettings({
    enabled: message.enabled,
    speed: message.speed
  });
});

scanVideos();
startEnforcing();

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      scanVideos(node);
    }
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
