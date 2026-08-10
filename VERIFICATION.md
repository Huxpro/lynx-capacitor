# Verification

## Plugin Coverage Check

Compared against the [official plugin list from capacitorjs.com](https://capacitorjs.com/docs/apis):

✅ **35 Capacitor v8 plugin APIs are integrated**

The current official list contains 37 APIs. Calendar and Contacts were added to
the documentation after this gallery baseline and are not integrated yet.

- 35 plugin headers registered at runtime
- 27 non-interactive smoke tests automatically pass on simulator
- 8 interactive/hardware/credential plugins are available for manual testing

## Android Cloud-device Matrix

Environment and full evidence are recorded in
[`docs/android-verification.md`](docs/android-verification.md).

- 29/29 automatic actions passed across 28 gallery entries: 25 official and 3
  Community plugins.
- All 8 entries classified as interactive were manually exercised: Dialog,
  Action Sheet, Share, Camera, File Viewer, Browser, InAppBrowser, and Motion.
- Partial/config-gated entries are not claimed as end-to-end verified; Local LLM
  and Push Notifications received only safe availability/permission probes.

## Automated iOS Simulator Matrix

Environment:

- iPhone 17 Pro simulator
- iOS 26.2
- Capacitor core/iOS 8.4.2
- Lynx SDK 4.1 local checkout

Result:

- 35 plugin headers registered
- 27 non-interactive smoke tests passed
- 0 non-interactive smoke failures
- 8 interactive, hardware, or credential-gated plugins available from the UI

The passing matrix covers:

- Device
- App
- App Launcher
- Preferences
- Toast
- Haptics
- Share
- Clipboard
- Filesystem
- Camera permissions
- File Transfer
- Network
- Capacitor HTTP
- Capacitor Cookies
- Geolocation permissions
- Status Bar
- System Bars
- Screen Orientation
- Screen Reader
- Text Zoom
- Keyboard
- Splash Screen
- Privacy Screen
- Local Notifications permissions
- Push Notifications permissions
- Background Runner permissions
- Local LLM system availability

## Interactive Coverage

These plugins are installed and registered, but successful completion requires
visible UI, hardware, or credentials:

- Dialog
- Action Sheet
- Browser
- InAppBrowser
- File Viewer
- Motion
- Barcode Scanner
- Google Maps

## Tool Verification

- Lynx DevTool reported 35 `PluginHeaders`.
- Lynx DevTool executed the 27-test safe matrix against the simulator.
- ReactLynx best-practices scanner reported zero issues for
  `demo/src/App.tsx` and `demo/src/plugins.ts`.
- `xcodebuild` succeeded for the standalone `LynxCapacitorDemo` host.
