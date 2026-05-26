# Video 3x Speed

A lightweight Chrome extension that automatically sets HTML5 videos to 3x playback speed.

## Features

- Sets detected HTML5 videos to 3x by default.
- Keeps the selected speed when pages try to reset playback rate.
- Includes a toolbar popup for pausing the extension or choosing another speed.
- Stores only the user's local speed preference through Chrome storage.

## Local install

1. Open `chrome://extensions/`.
2. Enable Developer mode.
3. Choose "Load unpacked".
4. Select this folder.

## Chrome Web Store package

Run the packaging script:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build.ps1
```

The upload ZIP is created in `dist/`.

## Privacy

This extension does not collect, transmit, sell, or share user data. It only stores the user's enable state and speed value through Chrome's storage API.
