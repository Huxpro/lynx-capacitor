# @lynx-capacitor/runtime

The native half of [lynx-capacitor](../../README.md), packaged as a **Lynx native
library** so it autolinks out of `node_modules`.

## What's in here

| Path | What it is |
|------|------------|
| `lynx.lib.json` | Declares the iOS source dir and podspec to Lynx Autolink |
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
