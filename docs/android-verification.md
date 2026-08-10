# Android verification

Verified on 2026-08-10 with a Lynx Sandbox cloud device:

- Device: `aries_10`, Android 10 / API 29, reported as a physical device
- Headless bridge: `LC_BRIDGE_READY plugins=36 webView=false`
- Automatic matrix: `LC_SMOKE_DONE passed=29 failed=0 total=29`
- Bundle embedded in the APK is byte-identical to `demo/dist/main.lynx.bundle`
- APK SHA-256: `e52e20c2cef91ac2d67f5766a683be6b4e37104e5f55114d03b70686dae42993`
- Bundle SHA-256: `efdedd5c6a87bb4acc93819656c4ced3505f5be17200b70f457532560a1db27c`

The bridge host never constructs a WebView. `InAppBrowser.openInWebView` creates
its own plugin-owned Activity only when that action is explicitly requested.

The automatic result counts actions, not distinct plugins. The 29 actions cover
28 gallery entries: 25 official Capacitor plugins and 3 Community plugins
(`Keep Awake` contributes two actions). It should not be read as "29 official
plugins verified end to end."

## Exit-criteria calls

| Call | Device evidence |
|---|---|
| `Device.getInfo()` | Success; Android 10, API 29, model `aries_10` |
| `Preferences.set/get()` | Success in the automatic matrix |
| `Filesystem.writeFile/readFile()` | Success with data round-trip |
| `Camera.getPhoto()` | `IMAGE_CAPTURE` with a FileProvider URI, photo confirmed, `success=true` |
| `ActionSheet.showActions()` | Native bottom sheet shown and selection returned |

## Interactive coverage

| Plugin | Result |
|---|---|
| Dialog | Native alert shown and dismissed |
| Action Sheet | Native sheet shown; selection returned successfully |
| Share | Android `CHOOSER` Activity shown; cancellation returned to Lynx |
| Camera | Native camera captured and returned a photo successfully |
| File Viewer | Local file opened through an Android `VIEW` resolver; `success=true` |
| Browser | Android browser Activity opened; `Browser.open success=true` |
| InAppBrowser | Plugin-owned `OSIABWebViewActivity` opened; `success=true` |
| Motion | 149 accelerometer events received in 3 seconds; listener then stopped |

These are all eight entries classified as interactive in the Android gallery.
They were exercised manually in addition to the automatic matrix.

## Partial and configuration-gated coverage

The following integrated entries are not claimed as end-to-end verified:

- Background Runner needs a registered JS runner.
- Barcode Scanner still needs an actual barcode scan workflow.
- Google Maps needs its native SDK and an API key.
- Keyboard has methods coupled to a WebView-backed host.
- Local LLM passed only `systemAvailability`; model warmup/inference was not run.
- Push Notifications passed only the permission probe; FCM registration and
  message delivery were not configured.

The Motion check is also evidence for retained Capacitor callbacks: Android
results travel through Lynx `GlobalEventEmitter`, because a Lynx NativeModule
`Callback` is intentionally one-shot.

## Screenshots

### Device and smoke results

![Android device smoke results](assets/android-device-smoke.png)

### Native Action Sheet

![Android Action Sheet](assets/android-action-sheet.png)

### Camera capture confirmation and return

![Android Camera confirmation](assets/android-camera-confirm.png)

![Android Camera result](assets/android-camera-result.png)

### Persistent Motion listener

![Android Motion result](assets/android-motion-result.png)
