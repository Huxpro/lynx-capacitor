# Lynx Capacitor Demo

A ReactLynx plugin gallery that runs unmodified Capacitor plugins through the
Lynx Capacitor adapter. The app includes all 37 official Capacitor v8 APIs and
3 Community plugins, with executable actions and native results shown inline.

<p align="center">
  <img src="../docs/assets/android-device-smoke.png" alt="Lynx Capacitor demo running on an Android cloud device" width="360">
</p>

<p align="center"><sub>Android 10 cloud-device build running the automatic native smoke checks.</sub></p>

## Prerequisites

Install these for every platform:

- Node.js 18 or newer
- pnpm 10.30.3 (the version declared by the workspace)

Then install the workspace dependencies from the repository root:

```bash
pnpm install
```

## Build the Lynx bundle

Build the adapter first, followed by the ReactLynx app:

```bash
pnpm build:core
pnpm build:demo
```

The generated bundle is written to:

```text
demo/dist/main.lynx.bundle
```

## Android

Android builds require JDK 21 and an Android SDK containing API 36. The Gradle
wrapper is checked in, so a separate Gradle installation is not required.

Build the app from the repository root:

```bash
pnpm android:build
```

This rebuilds the Lynx bundle, copies it into the Android assets, autolinks the
installed Capacitor plugins, and produces:

```text
android/Demo/app/build/outputs/apk/debug/app-debug.apk
```

To build, install, and launch it on a connected device:

```bash
pnpm android:run
```

When more than one device is connected, select one explicitly:

```bash
ANDROID_SERIAL=<adb-serial> pnpm android:run
```

## iOS

iOS builds require macOS, Xcode, XcodeGen, Ruby/Bundler, and a local
[`lynx-family/lynx`](https://github.com/lynx-family/lynx) checkout. The build
script runs XcodeGen and CocoaPods automatically.

```bash
LYNX_ROOT=/path/to/lynx pnpm ios:build
```

To build, install, and launch on the currently booted simulator:

```bash
LYNX_ROOT=/path/to/lynx pnpm ios:run
```

Override the simulator used for the build when needed:

```bash
SIMULATOR='iPhone 17 Pro' LYNX_ROOT=/path/to/lynx pnpm ios:run
```

## Development server

Start Rspeedy in development mode:

```bash
pnpm dev:demo
```

## Verification

Run the TypeScript checks, build the final Android APK, verify the embedded
bundle, and test the Gradle autolink plugin with:

```bash
pnpm verify:android
```

The running app also exposes `globalThis.runCapacitorSmokeMatrix()` for Lynx
DevTool automation. Cloud-device evidence is recorded in
[`docs/android-verification.md`](../docs/android-verification.md).
