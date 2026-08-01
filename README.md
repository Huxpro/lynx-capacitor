# Lynx Capacitor

Run **all official Capacitor 8 plugins** on Lynx (ReactLynx). An adapter that reimplements the Capacitor bridge over Lynx's NativeModule API, so **unmodified npm packages from @capacitor work without changes**.

All 35 official Capacitor plugins from [capacitorjs.com/docs/apis](https://capacitorjs.com/docs/apis) are included and wired through the official native iOS implementations.

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
- Works with **any unmodified `@capacitor/*` plugin** from npm — no code changes needed

### Native iOS (npm package `@lynx-capacitor/runtime`, CocoaPod `LynxCapacitorRuntime`)

- Ships as a **Lynx native library** — a `lynx.lib.json` manifest plus an iOS podspec, so [Lynx Autolink](https://lynxjs.org/next/zh/guide/autolink.html?platform=ios) links and registers it from `node_modules`
- Implements `CAPBridgeProtocol` to be compatible with all official Capacitor iOS plugins
- Uses the real `@capacitor/ios` framework and official native plugin CocoaPods
- Bridges Lynx NativeModule JS calls into the official Capacitor plugin infrastructure
- **Discovers plugins at runtime** — every `CAPPlugin` subclass linked into the app is registered, with no class list to maintain
- Handles result serialization back to JS
- Supports native UI presentation (view controllers, action sheets, alerts)
- Motion plugin provided natively (official npm doesn't ship iOS native yet)

### Usage in your Lynx app

1. **Install the official Capacitor plugins you want:**
```bash
npm install @capacitor/device @capacitor/preferences @capacitor/filesystem
```

2. **Install this adapter — the JS shim and the native runtime:**
```bash
npm install @lynx-capacitor/core @lynx-capacitor/runtime
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
- Xcode 15+
- iOS 15+ deployment target (required by Capacitor 8)
- Lynx SDK 4.1+
- CocoaPods

## Run the demo gallery

```bash
pnpm install
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

✅ **All 35 official Capacitor plugins from the documentation are covered:**

| Status | Count | Meaning |
|--------|-------|---------|
| ✅ Full | 27 | Automatic smoke tests pass, fully functional |
| 🖱 Interactive | 8 | Works but requires user interaction/UI |
| 🔑 Partial | 4 | Requires external API key, SDK, or hardware |
| ❌ Unsupported | 0 | All plugins covered |

### Status Breakdown

| Plugin | Status | Notes |
|--------|--------|-------|
| Action Sheet | 🖱 Interactive | Requires user selection |
| App Launcher | ✅ Full | |
| App | ✅ Full | |
| Background Runner | 🔑 Partial | Needs registered JS worker |
| Barcode Scanner | 🔑 Partial | Needs camera hardware |
| Browser | 🖱 Interactive | Presents SFSafariViewController |
| Camera | 🖱 Interactive | Requires camera/hardware |
| Clipboard | ✅ Full | |
| Cookies | ✅ Full | Built into core |
| Device | ✅ Full | |
| Dialog | 🖱 Interactive | User interaction |
| Filesystem | ✅ Full | |
| File Transfer | ✅ Full | |
| File Viewer | 🖱 Interactive | Presents QuickLook |
| Geolocation | ✅ Full | |
| Google Maps | 🔑 Partial | Needs Google Maps SDK + API key |
| Haptics | ✅ Full | |
| HTTP | ✅ Full | Built into core |
| InAppBrowser | 🖱 Interactive | Presents browser |
| Keyboard | ✅ Full | |
| Local LLM 🧪 | 🔑 Partial | Needs on-device LLM support |
| Local Notifications | ✅ Full | |
| Motion | 🖱 Interactive | Simulator has no accelerometer |
| Network | ✅ Full | |
| Preferences | ✅ Full | |
| Privacy Screen | ✅ Full | |
| Push Notifications | 🔑 Partial | Needs APNs configuration |
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
```

The demo exposes `globalThis.runCapacitorSmokeMatrix()` for DevTool automation. All 27 non-interactive automatic tests pass.

## Project Structure

```
lynx-capacitor/
├── packages/core/          # npm package - drop-in @capacitor/core adapter
├── packages/runtime/       # npm package - Lynx native library (lynx.lib.json + iOS pod)
├── gems/                   # cocoapods-lynx-capacitor - links plugin pods from node_modules
├── demo/                   # ReactLynx demo gallery of all 35 plugins
├── ios/Demo/               # Standalone iOS host (XcodeGen + CocoaPods)
├── plugins.json            # Plugin coverage reference (documentation only)
├── scripts/                # Build/run/generate scripts
└── VERIFICATION.md         # Detailed plugin-by-plugin verification
```

## License

MIT
