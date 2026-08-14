# Lynx Capacitor

Run **Capacitor v8 plugins** on Lynx (ReactLynx). The adapter reimplements the
Capacitor bridge over Lynx's NativeModule API, so existing Capacitor plugin
packages can keep their JavaScript and native implementations.

This repository integrates all 37 plugin APIs listed in the
[Capacitor v8 documentation](https://capacitorjs.com/docs/apis). The packages
use their official Android and iOS implementations where available.

## Architecture

### JavaScript (npm package @lynx-capacitor/core)

- **Drop-in replacement** for `@capacitor/core`
- Implements `registerPlugin()` exactly as Capacitor does
- Handles promise/callback/event listener dispatch over Lynx
- Re-exports all type definitions from Capacitor
- Provides built-in implementations for:
  - `CapacitorHttp` (native HTTP client)
  - `CapacitorCookies` (cookie access)
  - `SystemBars` + `SystemBarsStyle` + `SystemBarType` (system bar styling)
- Routes unmodified `@capacitor/*` packages from npm — no plugin JS fork needed

### Native iOS (npm package `@lynx-capacitor/runtime`, CocoaPod `LynxCapacitorRuntime`)

- Ships as a **Lynx native library** — a `lynx.lib.json` manifest plus an iOS podspec, so [Lynx Autolink](https://lynxjs.org/next/zh/guide/autolink.html?platform=ios) links and registers it from `node_modules`
- Implements `CAPBridgeProtocol` for installed Capacitor iOS plugin implementations
- Uses the real `@capacitor/ios` framework and official native plugin CocoaPods
- Bridges Lynx NativeModule JS calls into the official Capacitor plugin infrastructure
- **Discovers plugins at runtime** — every `CAPPlugin` subclass linked into the app is registered, with no class list to maintain
- Handles result serialization back to JS
- Supports native UI presentation (view controllers, action sheets, alerts)
- Motion plugin provided natively (official npm doesn't ship iOS native yet)

### Native Android (`@lynx-capacitor/runtime` + Gradle autolink)

- Hosts Capacitor 8.4.2 without constructing a WebView; plugin calls and results use Lynx NativeModule callbacks
- Keeps an `AppCompatActivity` for Activity Result and runtime-permission dispatch, so Camera and other UI plugins use their unchanged Android implementations
- Scans `node_modules` packages containing `capacitor.android`, includes their Gradle projects, and generates both plugin and Lynx-module registries
- Supports pnpm symlinks plus explicit include/exclude filters
- Delivers retained listener results through Lynx `GlobalEventEmitter`; Motion
  uses the runtime's native Android SensorManager implementation

### Why there are two adapter packages

| Package | Used by | Contains |
|---|---|---|
| `@lynx-capacitor/core` | The ReactLynx JavaScript bundle | The drop-in `@capacitor/core` API and Lynx bridge protocol |
| `@lynx-capacitor/runtime` | Android Gradle and iOS CocoaPods/Autolink | `lynx.lib.json`, Kotlin/Java, Objective-C/Swift, and the headless native bridge |

The runtime is shared by both Android and iOS; it is not Android-specific. A
native Lynx host installs both packages: Rspeedy bundles `core`, while native
Autolink consumes `runtime`.

### JavaScript setup

1. **Install the official Capacitor plugins you want:**
```bash
npm install @capacitor/device @capacitor/preferences @capacitor/filesystem
```

2. **Install this adapter — the JS shim, native runtime, and target platform:**
```bash
# Android
npm install @lynx-capacitor/core @lynx-capacitor/runtime @capacitor/android

# iOS
npm install @lynx-capacitor/core @lynx-capacitor/runtime @capacitor/ios
```

3. **Add an alias in your Lynx build config:**
```typescript
// lynx.config.ts (rspeedy)
export default defineConfig({
  resolve: {
    alias: {
      '@capacitor/core': require.resolve('@lynx-capacitor/core'),
    },
  },
});
```

The host app performs the native Autolink setup once per target platform. After
that, Android refreshes installed plugins during Gradle sync/build and iOS does
so during `pod install`; there is no per-plugin Java/Kotlin, Swift/Objective-C,
Gradle dependency, or Podfile registration list to maintain.

### Android host setup

Load the settings plugin included in `@lynx-capacitor/runtime` and point it at
the app's `node_modules`:

```kotlin
// settings.gradle.kts
pluginManagement {
  includeBuild("../node_modules/@lynx-capacitor/runtime/gradle-plugin")
}
plugins {
  id("org.lynxcapacitor.settings")
}

include(":app")
lynxCapacitor { nodeModulesPath = "../node_modules" }
```

Apply autolink to the Android application:

```kotlin
// app/build.gradle.kts
plugins {
  id("com.android.application")
  id("org.lynxcapacitor.autolink")
}
```

Register the generated Lynx module before building the view:

```kotlin
val builder = LynxViewBuilder()
LynxGeneratedLibraryRegistry.setup(builder)
val lynxView = builder.build(this)
setContentView(lynxView)
LynxCapacitorRuntime.attach(this)
```

The complete host is in [`android/Demo`](android/Demo). Installed Capacitor
packages are the only plugin list; no manual Java/Kotlin registration is
needed. Adding a plugin later is `npm install` + Gradle sync/build. The Demo uses
minSdk 28 because its installed `@capacitor/local-llm` package requires it,
while the runtime itself supports minSdk 24.

### iOS host setup

4. **Turn on both autolink plugins in your Podfile:**
```ruby
plugin 'cocoapods-lynx-library'    # gem 'cocoapods-lynx-library', '~> 4.0'
plugin 'cocoapods-lynx-capacitor'  # gem 'cocoapods-lynx-capacitor'

target 'YourApp' do
  use_lynx_library!        # the Capacitor bridge, as a Lynx native library
  use_capacitor_plugins!   # the Capacitor plugins it dispatches to
end
```

No plugin is named anywhere. `use_lynx_library!` finds `@lynx-capacitor/runtime`
in `node_modules`, adds the `LynxCapacitorRuntime` pod, and generates a registry
that registers the `CapacitorBridge` native module.
[`use_capacitor_plugins!`](gems/cocoapods-lynx-capacitor/README.md) finds every
package with a `capacitor` key in its `package.json` and adds its pod.

5. **Invoke the generated registry when you build your `LynxConfig`:**
```objc
#import <LynxLibraryRegistry/LynxGeneratedLibraryRegistry.h>

LynxConfig *config = [[LynxConfig alloc] initWithProvider:provider];
[[LynxGeneratedLibraryRegistry new] setup:config];
[[LynxEnv sharedInstance] prepareConfig:config];
```

That's it! Your existing Capacitor plugin code will just work on Lynx. Adding
another plugin later is `npm install` + `pod install` — no Podfile edit, no
Swift or ObjC, no registration code.

### How the three layers link up

| Layer | Handled by | Trigger |
|-------|-----------|---------|
| `CapacitorBridge` Lynx module — pod + registration | `cocoapods-lynx-library` (Lynx Autolink), via `lynx.lib.json` and the `@LynxNativeModule` annotation | `pod install` |
| Capacitor plugin pods | `cocoapods-lynx-capacitor`, via the `capacitor` key in each `package.json` | `pod install` |
| Capacitor plugin registration | `LynxCapacitorRuntime`, via an ObjC class sweep | app launch |

Nothing is generated into your source tree, and no Podfile section is rewritten
behind your back.

## Requirements

- Node.js 18+
- pnpm or npm
- Android Studio / Android SDK 36, JDK 21 (Android runtime minSdk 24)
- Xcode 15+
- iOS 15+ deployment target (required by Capacitor 8)
- Lynx SDK 4.1+
- CocoaPods

## Run the demo gallery

```bash
pnpm install
pnpm android:run
```

Use a specific device:

```bash
ANDROID_SERIAL=emulator-5554 pnpm android:run
```

For iOS:

```bash
pnpm ios:run
```

Override the simulator:

```bash
SIMULATOR='iPhone 17 Pro' pnpm ios:run
```

Override Lynx location if it's not at `../lynx`:

```bash
LYNX_ROOT=/path/to/lynx pnpm ios:run
```

## Plugin Coverage

The current [Capacitor v8 API list](https://capacitorjs.com/docs/apis) contains
37 official plugin APIs. This repository integrates all of them:

| Status | Count | Meaning |
|--------|-------|---------|
| ✅ Full | 23 | An automatic native smoke path passes |
| 🖱 Device-verified | 8 | The interactive Android path was exercised on a cloud device |
| 🔑 Partial/config-gated | 6 | Integrated, but full behavior needs host setup, hardware, or a WebView-specific capability |

### Status Breakdown

| Plugin | Status | Notes |
|--------|--------|-------|
| Action Sheet | 🖱 Interactive | Requires user selection |
| App Launcher | ✅ Full | |
| App | ✅ Full | |
| Background Runner | 🔑 Partial | Needs registered JS worker |
| Barcode Scanner | 🔑 Partial | Needs camera hardware |
| Browser | 🖱 Interactive | Presents Custom Tabs / SFSafariViewController |
| Calendar | ✅ Full | Android create/find/delete round-trip verified on a cloud device |
| Camera | 🖱 Interactive | Requires camera/hardware |
| Clipboard | ✅ Full | |
| Contacts | ✅ Full | Android save/find/remove round-trip verified on a cloud device |
| Cookies | ✅ Full | Built into core |
| Device | ✅ Full | |
| Dialog | 🖱 Interactive | User interaction |
| Filesystem | ✅ Full | |
| File Transfer | ✅ Full | |
| File Viewer | 🖱 Interactive | Presents the platform document viewer |
| Geolocation | ✅ Full | |
| Google Maps | 🔑 Partial | Needs Google Maps SDK + API key |
| Haptics | ✅ Full | |
| HTTP | ✅ Full | Built into core |
| InAppBrowser | 🖱 Interactive | Presents browser |
| Keyboard | 🔑 Partial | Some methods depend on a WebView-backed host |
| Local LLM 🧪 | 🔑 Partial | Availability probe passes; model use needs on-device LLM support |
| Local Notifications | ✅ Full | |
| Motion | 🖱 Interactive | Native SensorManager on Android |
| Network | ✅ Full | |
| Preferences | ✅ Full | |
| Privacy Screen | ✅ Full | |
| Push Notifications | 🔑 Partial | Permission probe passes; delivery needs APNs/FCM configuration |
| Screen Orientation | ✅ Full | |
| Screen Reader | ✅ Full | |
| Share | 🖱 Interactive | Shows system share sheet |
| Splash Screen | ✅ Full | |
| Status Bar | ✅ Full | |
| System Bars | ✅ Full | Built into core |
| Text Zoom | ✅ Full | |
| Toast | ✅ Full | |

## Verification

```bash
pnpm verify
pnpm verify:android
```

The demo exposes `globalThis.runCapacitorSmokeMatrix()` for DevTool automation.
The original Android cloud-device run passed 29/29 automatic actions across 28
gallery entries: 25 official plugins and 3 Community plugins. A follow-up run
verified Calendar with a create/find/delete round-trip and Contacts with a
save/find/remove round-trip. All eight official interactive entries were also
exercised manually: Dialog, Action Sheet, Share, Camera, File Viewer, Browser,
InAppBrowser, and Motion. These results do not claim end-to-end coverage for the
partial/config-gated entries. See the
[cloud-device verification report](docs/android-verification.md).

## Project Structure

```
lynx-capacitor/
├── packages/core/          # npm package - drop-in @capacitor/core adapter
├── packages/runtime/       # Native runtime + included Gradle Android autolink plugin
├── gems/                   # cocoapods-lynx-capacitor - links plugin pods from node_modules
├── demo/                   # ReactLynx gallery for 37 official + 3 Community plugins
├── ios/Demo/               # Standalone iOS host (XcodeGen + CocoaPods)
├── android/Demo/           # Standalone Android Lynx host
├── plugins.json            # Plugin coverage reference (documentation only)
├── scripts/                # Build/run/generate scripts
└── VERIFICATION.md         # Detailed plugin-by-plugin verification
```

## License

MIT
