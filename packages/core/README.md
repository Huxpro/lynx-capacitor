# @lynx-capacitor/core

The JavaScript half of [Lynx Capacitor](https://github.com/Huxpro/lynx-capacitor):
a drop-in `@capacitor/core` adapter that transports Capacitor plugin calls over
the Lynx NativeModule API.

Install it at the package name expected by Capacitor plugins:

```bash
npm install @capacitor/core@npm:@lynx-capacitor/core
```

Install the native runtime, the Capacitor plugin you want to use, and the
Capacitor package for your target platform:

```bash
# Android
npm install @lynx-capacitor/runtime @capacitor/android @capacitor/device

# iOS
npm install @lynx-capacitor/runtime @capacitor/ios @capacitor/device
```

Native Android and iOS setup, compatibility details, and the verified plugin
matrix are documented in the
[project README](https://github.com/Huxpro/lynx-capacitor#readme).
