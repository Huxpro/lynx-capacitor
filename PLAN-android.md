# Lynx Capacitor — Android Support Plan

## Goal

Port the full iOS Lynx-Capacitor integration to Android, achieving feature parity:
unmodified `@capacitor/*` npm plugins running on Lynx via a NativeModule bridge,
with zero hand-written plugin registration and no Podfile-equivalent boilerplate.

---

## Phase 0 — Feasibility: Capacitor Android Bridge Decoupling

**Risk:** Capacitor Android's `Bridge.java` assumes a `WebView` host. We need to
know exactly which parts of the plugin call chain touch `WebView` vs. just
`PluginCall` → `PluginResult`.

### Tasks

- [x] Read `@capacitor/android` source: `Bridge.java`, `Plugin.java`, `PluginCall.java`, `PluginResult.java`
- [x] Map which Bridge methods are called during a typical plugin invoke (e.g. Device.getInfo)
- [x] Identify the minimal Bridge interface subset needed for non-UI plugins
- [x] For UI-presenting plugins (Camera, ActionSheet, etc.): identify Activity/Fragment requirements
- [x] Write a short spike: a bare Android app with a manual Capacitor Plugin.execute() call, no WebView
- [x] Document the decoupling strategy: stub Bridge vs. real Bridge subclass vs. interface extraction

**Exit criteria:** A working `Device.getInfo()` call from a plain Activity, no WebView anywhere.

---

## Phase 1 — Kotlin LynxModule Bridge

Implement the Android equivalent of `LynxCapacitorRuntime.swift` + `LynxCapacitorBridge.m`.

### Architecture

```
JS (Lynx)                    Kotlin (Android)
─────────────────────────────────────────────
registerPlugin('Device')
  → callMethod('getInfo')
    → NativeModule.callNative('CapacitorBridge', 'handleCall', {
        pluginId: 'Device',
        methodName: 'getInfo',
        callbackId: '...',
        options: {}
      })
      → LynxCapacitorBridge.handleCall()
        → finds DevicePlugin instance
        → plugin.execute(pluginCall)
        → result → resolveCallback(callbackId, data)
```

### Tasks

- [x] Create `packages/runtime/android/` with `build.gradle.kts`
- [x] Implement `LynxCapacitorBridge.kt` as a `@LynxNativeModule`
- [x] Implement `LynxCapacitorBridgeImpl.kt`: the headless Bridge that satisfies plugin requirements
- [x] Implement plugin discovery: use `@CapacitorPlugin` annotation + ServiceLoader or class scanning
- [x] Handle PluginCall → JSObject result serialization back to Lynx callback
- [x] Handle Activity result forwarding (for Camera, FilePicker, etc.)
- [x] Handle permissions dispatch (ActivityCompat.requestPermissions bridge)
- [x] Add `platforms.android` to `lynx.lib.json`
- [x] Verify with Device, Preferences, Filesystem plugins (non-UI)
- [x] Verify with Camera, ActionSheet (UI-presenting)

**Exit criteria:** `Device.getInfo()`, `Preferences.set/get`, `Camera.getPhoto()` all work from Lynx on a real device.

---

## Phase 2 — Gradle Autolink Plugin

The Android equivalent of `cocoapods-lynx-capacitor`. Simpler than the iOS gem because
Gradle's resolution is more flexible.

### Strategy

A Gradle settings/project plugin that:
1. Scans `node_modules` for packages with `capacitor.android` in `package.json`
2. Dynamically adds them as `include`'d project modules (or composite builds)
3. Adds dependency on `@capacitor/android` runtime from node_modules

### Tasks

- [x] Create `packages/runtime/gradle-plugin/` with a convention plugin
- [x] Implement node_modules scanner (reuse logic from the Ruby gem, port to Kotlin DSL)
- [x] Auto-include discovered plugin modules in `settings.gradle.kts`
- [x] Auto-add `implementation project(':capacitor-device')` etc. to the app module
- [x] Handle pnpm symlink resolution (same concern as the iOS gem)
- [x] Handle include/exclude filtering (`:include`, `:exclude` options)
- [x] Handle missing/skipped plugins with warnings (like iOS gem does for `@capacitor/motion`)
- [x] Write tests (build a fixture node_modules, assert correct includes)
- [x] Ship the included Gradle build inside `@lynx-capacitor/runtime` on npm

**Exit criteria:** A clean Android app loads the settings and app plugins from
`node_modules/@lynx-capacitor/runtime/gradle-plugin`, and the installed
Capacitor packages appear as dependencies without a Maven publication.

---

## Phase 3 — Demo Host App

An Android app equivalent to `ios/Demo/` that uses the same JS bundle.

### Tasks

- [x] Create `android/Demo/` with a single-Activity Lynx host
- [x] Wire LynxView with the demo's `main.lynxbin` bundle
- [x] Apply the Gradle autolink plugin
- [x] Call `LynxGeneratedLibraryRegistry` (or Android equivalent) on LynxConfig
- [x] Add run script: `scripts/android-run.sh` (build + install + launch)
- [x] Verify all 27 non-interactive plugins pass the smoke matrix
- [x] Verify the 8 interactive plugins work with user action

**Exit criteria:** `pnpm android:run` launches the full plugin gallery on an emulator/device.

---

## Phase 4 — Documentation & Parity

- [x] Update root `README.md` with Android usage section (mirror iOS steps)
- [x] Add `packages/runtime/README.md` Android section
- [x] Create `packages/runtime/gradle-plugin/README.md`
- [x] Update plugin coverage table if any plugins differ on Android
- [x] Add `pnpm verify:android` script

---

## Key Technical Decisions

### 1. Headless Bridge vs. Full Bridge Subclass

**Recommendation:** Start with a minimal interface stub ("headless bridge") that
implements only what plugins actually call. Most plugins only need:
- `getActivity()` → for UI presentation and permissions
- `getContext()` → for Android system services
- `triggerJSEvent()` → for event listeners (we bridge this to Lynx callbacks)

They do NOT typically need `getWebView()`, `getLocalUrl()`, `getServerUrl()`.

### 2. Plugin Discovery Strategy

**Recommendation:** Compile-time via the Gradle plugin generating a registry class
(like iOS's `LynxGeneratedLibraryRegistry`), rather than runtime reflection.
Reasons:
- ProGuard/R8 strips unreferenced classes → runtime scan is fragile
- Compile-time is deterministic and debuggable
- Matches how Capacitor's own CLI generates `PluginConfig` for Android

### 3. Gradle Plugin Scope

**Recommendation:** A single combined plugin that handles both:
- Lynx library registration (the `lynx.lib.json` android entry)
- Capacitor plugin module discovery

This avoids the two-gem split needed on iOS (where CocoaPods constrains the architecture).

### 4. @capacitor/android Dependency

The Android runtime framework. Unlike iOS where we depended on `@capacitor/ios`'s
podspec, on Android this is an AAR published to Maven. Options:
- Use it from `node_modules/@capacitor/android` as a local project (like iOS does with the podspec path)
- Use the Maven artifact directly

**Recommendation:** Local project from node_modules, for version consistency with the
plugins (they all declare `implementation project(':capacitor-android')`).

---

## Estimated Effort

| Phase | Effort | Depends on |
|-------|--------|-----------|
| Phase 0 | 1-2 days | Nothing |
| Phase 1 | 3-5 days | Phase 0 |
| Phase 2 | 2-3 days | Phase 1 (can start in parallel) |
| Phase 3 | 1-2 days | Phase 1 + 2 |
| Phase 4 | 0.5 day  | Phase 3 |

**Total: ~8-12 days**, with Phase 0 being the critical unknown.

---

## Completion

SG1 completed on 2026-08-10. Local build/type/plugin-scanner verification and
Lynx Sandbox Android cloud-device validation passed. See
[`docs/android-verification.md`](docs/android-verification.md) for the device,
smoke-matrix, interactive-plugin, and screenshot evidence.

---

## Environment

- Work on SG1 (`/data00/home/xuan.huang/project/lynx-capacitor`)
- Android SDK + emulator available on SG1
- Use `lynx-sandbox` cloud devices for final verification
- JS bundle shared with iOS demo (same `demo/` source)
