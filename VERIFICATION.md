# Verification

## Plugin Coverage Check

Compared against the [official plugin list from capacitorjs.com](https://capacitorjs.com/docs/apis):

✅ **All 35 official Capacitor plugins are covered**

- 35 plugin headers registered at runtime
- 27 non-interactive smoke tests automatically pass on simulator
- 8 interactive/hardware/credential plugins are available for manual testing

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
