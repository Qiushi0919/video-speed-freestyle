const DEFAULT_SETTINGS = {
  enabled: true,
  speed: 3
};

const enabledToggle = document.querySelector("#enabledToggle");
const speedRange = document.querySelector("#speedRange");
const speedValue = document.querySelector("#speedValue");
const statusText = document.querySelector("#statusText");
const presetButtons = [...document.querySelectorAll("[data-speed]")];

function normalizeSpeed(value) {
  const speed = Number(value);
  if (!Number.isFinite(speed)) return DEFAULT_SETTINGS.speed;
  return Math.min(5, Math.max(0.25, Math.round(speed * 4) / 4));
}

function formatSpeed(speed) {
  return `${Number(speed).toFixed(2).replace(/\.00$/, "").replace(/0$/, "")}x`;
}

function render(settings) {
  const enabled = settings.enabled !== false;
  const speed = normalizeSpeed(settings.speed);

  enabledToggle.checked = enabled;
  speedRange.value = String(speed);
  speedValue.value = formatSpeed(speed);
  statusText.textContent = enabled ? "Enabled" : "Paused";

  presetButtons.forEach((button) => {
    button.classList.toggle("active", normalizeSpeed(button.dataset.speed) === speed);
  });
}

function saveSettings(settings) {
  chrome.storage.sync.set({
    enabled: settings.enabled,
    speed: normalizeSpeed(settings.speed)
  });
}

chrome.storage.sync.get(DEFAULT_SETTINGS, render);

enabledToggle.addEventListener("change", () => {
  saveSettings({
    enabled: enabledToggle.checked,
    speed: speedRange.value
  });
  render({
    enabled: enabledToggle.checked,
    speed: speedRange.value
  });
});

speedRange.addEventListener("input", () => {
  saveSettings({
    enabled: enabledToggle.checked,
    speed: speedRange.value
  });
  render({
    enabled: enabledToggle.checked,
    speed: speedRange.value
  });
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const speed = normalizeSpeed(button.dataset.speed);
    saveSettings({
      enabled: enabledToggle.checked,
      speed
    });
    render({
      enabled: enabledToggle.checked,
      speed
    });
  });
});
