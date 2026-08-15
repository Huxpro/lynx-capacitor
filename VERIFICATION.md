# Verification

## Plugin Coverage Check

Compared against the [official plugin list from capacitorjs.com](https://capacitorjs.com/docs/apis):

✅ **All 37 Capacitor v8 plugin APIs are integrated**

The current official list contains 37 APIs. Calendar and Contacts were added to
the gallery after the original simulator baseline and have now been verified on
an Android cloud device.

- 37 official APIs available in the gallery
- Calendar passes a create/find/delete Android round-trip
- Contacts passes a save/find/remove Android round-trip
- 27 non-interactive smoke tests passed on the earlier iOS simulator baseline
- 8 interactive/hardware/credential plugins are available for manual testing

## Release-artifact Build Verification

On 2026-08-15, the release candidates were packed exactly as npm would publish
them: `@lynx-capacitor/core@8.4.2` and
`@lynx-capacitor/runtime@0.1.2`. The packed runtime contains the Android and iOS
native sources plus the included Android Gradle autolink build.

- A clean npm consumer installed both tarballs and all 40 demo entries without
  workspace links. The Android demo then completed `:app:assembleDebug` using
  the Gradle plugin and native projects exclusively from that consumer's
  `node_modules`.
- The full iOS simulator app built on Xcode 26.3 with all demo plugins, the
  packed runtime, CocoaPods Lynx 4.0.1, and the published
  `cocoapods-lynx-capacitor@0.1.0` RubyGem. The successful clean-host run is
  recorded in [GitHub Actions run 31834841692](https://github.com/Huxpro/lynx-capacitor/actions/runs/31834841692).

Registry installation is repeated after npm publication so this tarball-level
check and the registry-level check cover the same bytes and dependency graph.

## Android Cloud-device Matrix

Environment and full evidence are recorded in
[`docs/android-verification.md`](docs/android-verification.md).

- 29/29 automatic actions passed across 28 gallery entries: 25 official and 3
  Community plugins.
- A follow-up cloud-device run passed the new Calendar and Contacts CRUD smoke
  actions. The bridge registered 38 native plugin classes with no WebView.
- All 8 entries classified as interactive were manually exercised: Dialog,
  Action Sheet, Share, Camera, File Viewer, Browser, InAppBrowser, and Motion.
- Partial/config-gated entries are not claimed as end-to-end verified; Local LLM
  and Push Notifications received only safe availability/permission probes.

## Automated iOS Simulator Baseline

Environment:

- iPhone 17 Pro simulator
- iOS 26.2
- Capacitor core/iOS 8.4.2
- Lynx SDK 4.1 local checkout

Result before Calendar and Contacts were added:

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

- Lynx DevTool reported 35 `PluginHeaders` in the earlier iOS baseline.
- Lynx DevTool executed the 27-test safe matrix against the simulator.
- ReactLynx best-practices scanner reported zero issues for
  `demo/src/App.tsx` and `demo/src/plugins.ts`.
- `xcodebuild` succeeded for the standalone `LynxCapacitorDemo` host.
