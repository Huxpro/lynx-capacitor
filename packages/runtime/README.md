# @lynx-capacitor/runtime

The native half of [lynx-capacitor](../../README.md), packaged as a **Lynx native
library** so it autolinks out of `node_modules`.

Install the runtime with the Capacitor package for the native platform you are
building:

```bash
# Android
npm install @lynx-capacitor/runtime @capacitor/android

# iOS
npm install @lynx-capacitor/runtime @capacitor/ios
```

## What's in here

| Path | What it is |
|------|------------|
| `lynx.lib.json` | Declares Android and iOS native sources to Lynx Autolink |
| `android/` | Kotlin NativeModule plus the headless Capacitor Android source overlay |
| `ios/LynxCapacitorRuntime.podspec` | The `LynxCapacitorRuntime` pod |
| `ios/src/LynxCapacitorBridge.{h,m}` | The single Lynx NativeModule all plugin calls travel through |
| `ios/src/LynxCapacitorRuntime.swift` | `CAPBridgeProtocol` implementation + plugin discovery |

## How it gets linked

`cocoapods-lynx-library` scans `node_modules` for `lynx.lib.json` during
`pod install`. Finding this package, it adds the `LynxCapacitorRuntime` pod and
scans `ios/src` for annotations. `LynxCapacitorBridge.h` carries:

```objc
@LynxNativeModule("CapacitorBridge")
@interface LynxCapacitorBridge : NSObject <LynxModule>
```

which expands to `@class LynxNativeModuleMarker;` (see `Lynx/LynxModule.h`) — a
pure source marker. The generated `LynxGeneratedLibraryRegistry` then emits:

```objc
[config registerModule:NSClassFromString(@"LynxCapacitorBridge")
              withName:@"CapacitorBridge"];
```

One annotation covers every Capacitor plugin, because plugins are multiplexed
over the bridge's `handleCall` rather than exposed as separate Lynx modules.

## Android

The Gradle settings plugin includes this directory as `:lynx-capacitor-runtime`
and includes the exact `@capacitor/android` source installed in `node_modules`.
A small, version-pinned patch adds a headless `Bridge` constructor and result
sink. It deliberately never creates a WebView, while retaining Capacitor's
official plugin, permission, Activity Result, lifecycle, and serialization code.

Android results use Lynx `GlobalEventEmitter`, including retained listener
callbacks. The runtime includes a native SensorManager implementation of Motion
because the official npm package otherwise selects a browser-only Android
fallback.

The build plugin scans `@CapacitorPlugin` annotations and generates
`LynxCapacitorPluginRegistry` plus `LynxGeneratedLibraryRegistry`. The runtime's
auto-init provider installs lifecycle forwarding. The host calls
`LynxCapacitorRuntime.attach(this)` after `setContentView` and before returning
from `onCreate`; this gives view-aware plugins a content root while remaining
early enough for Activity Result launcher registration.

Requirements: compileSdk 36, JDK 21, minSdk 24, Lynx SDK 4.0+. A host may need a
higher minSdk when an installed plugin requires one.

## How plugins get registered

`LynxCapacitorRuntime` unions two sources at startup:

1. **An Objective-C runtime sweep** for `CAPPlugin` subclasses. Linking a plugin
   pod is enough to expose it to JS — no manifest, no codegen. This also picks up
   plugins written directly in the host app, which Capacitor itself cannot do
   without hand-editing `capacitor.config.json`.
2. **`packageClassList`** from a bundled `capacitor.config.json`, if the app has
   one. This keeps projects that run `npx cap sync` working, and is the escape
   hatch if dead-stripping removes a class the sweep would have found.

Classes that only make sense with a `WKWebView` host (`CAPConsolePlugin`,
`CAPWebViewPlugin`) and `CAPInstancePlugin` subclasses are skipped.

## Requirements

- Lynx SDK 3.9+ (for `LynxConfig registerModule:withName:` and the
  `LynxNativeModule` macro)
- `cocoapods-lynx-library` ~> 4.0
- iOS 15+ (Capacitor 8's deployment target)
