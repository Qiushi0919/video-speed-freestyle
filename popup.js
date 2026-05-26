const DEFAULT_SETTINGS = {
  enabled: true,
  speed: 3,
  holdSpeed: 3
};

const enabledToggle = document.querySelector("#enabledToggle");
const speedRange = document.querySelector("#speedRange");
const speedValue = document.querySelector("#speedValue");
const holdSpeedRange = document.querySelector("#holdSpeedRange");
const holdSpeedValue = document.querySelector("#holdSpeedValue");
const statusText = document.querySelector("#statusText");
const presetButtons = [...document.querySelectorAll("[data-speed]")];

function normalizeSpeed(value, fallback = DEFAULT_SETTINGS.speed) {
  const speed = Number(value);
  if (!Number.isFinite(speed)) return fallback;
  return Math.min(5, Math.max(0.25, Math.round(speed * 4) / 4));
}

function formatSpeed(speed) {
  return `${Number(speed).toFixed(2).replace(/\.00$/, "").replace(/0$/, "")}x`;
}

function render(settings) {
  const enabled = settings.enabled !== false;
  const speed = normalizeSpeed(settings.speed, DEFAULT_SETTINGS.speed);
  const holdSpeed = normalizeSpeed(settings.holdSpeed, DEFAULT_SETTINGS.holdSpeed);

  enabledToggle.checked = enabled;
  speedRange.value = String(speed);
  speedValue.value = formatSpeed(speed);
  holdSpeedRange.value = String(holdSpeed);
  holdSpeedValue.value = formatSpeed(holdSpeed);
  statusText.textContent = enabled ? "Enabled" : "Paused";

  presetButtons.forEach((button) => {
    button.classList.toggle("active", normalizeSpeed(button.dataset.speed) === speed);
  });
}

function saveSettings(settings) {
  const nextSettings = {
    enabled: settings.enabled,
    speed: normalizeSpeed(settings.speed, DEFAULT_SETTINGS.speed),
    holdSpeed: normalizeSpeed(settings.holdSpeed, DEFAULT_SETTINGS.holdSpeed)
  };

  chrome.storage.sync.set(nextSettings);
  applyToActiveTab(nextSettings);
}

function applyToActiveTab(settings) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;

    chrome.tabs.sendMessage(tabId, {
      type: "VIDEO_3X_APPLY_SETTINGS",
      ...settings
    }).catch(() => {
      // The tab may be a browser page or may need a refresh before the content script loads.
    });
  });
}

chrome.storage.sync.get(DEFAULT_SETTINGS, render);

enabledToggle.addEventListener("change", () => {
  saveSettings({
    enabled: enabledToggle.checked,
    speed: speedRange.value,
    holdSpeed: holdSpeedRange.value
  });
  render({
    enabled: enabledToggle.checked,
    speed: speedRange.value,
    holdSpeed: holdSpeedRange.value
  });
});

speedRange.addEventListener("input", () => {
  saveSettings({
    enabled: enabledToggle.checked,
    speed: speedRange.value,
    holdSpeed: holdSpeedRange.value
  });
  render({
    enabled: enabledToggle.checked,
    speed: speedRange.value,
    holdSpeed: holdSpeedRange.value
  });
});

holdSpeedRange.addEventListener("input", () => {
  saveSettings({
    enabled: enabledToggle.checked,
    speed: speedRange.value,
    holdSpeed: holdSpeedRange.value
  });
  render({
    enabled: enabledToggle.checked,
    speed: speedRange.value,
    holdSpeed: holdSpeedRange.value
  });
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const speed = normalizeSpeed(button.dataset.speed);
    saveSettings({
      enabled: enabledToggle.checked,
      speed,
      holdSpeed: holdSpeedRange.value
    });
    render({
      enabled: enabledToggle.checked,
      speed,
      holdSpeed: holdSpeedRange.value
    });
  });
});
