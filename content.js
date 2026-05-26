const TARGET_RATE = 3;

function setVideoSpeed(video) {
  if (!(video instanceof HTMLVideoElement)) return;

  if (video.playbackRate !== TARGET_RATE) {
    video.playbackRate = TARGET_RATE;
  }

  if (video.defaultPlaybackRate !== TARGET_RATE) {
    video.defaultPlaybackRate = TARGET_RATE;
  }
}

function lockVideoSpeed(video) {
  setVideoSpeed(video);

  ["loadedmetadata", "play", "playing", "ratechange"].forEach((eventName) => {
    video.addEventListener(eventName, () => {
      if (video.playbackRate !== TARGET_RATE) {
        setVideoSpeed(video);
      }
    });
  });
}

function scanVideos(root = document) {
  if (root instanceof HTMLVideoElement) {
    lockVideoSpeed(root);
    return;
  }

  root.querySelectorAll?.("video").forEach(lockVideoSpeed);
}

scanVideos();

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
