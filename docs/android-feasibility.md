# Capacitor Android headless bridge feasibility

## Finding

Capacitor 8.4.2's `Plugin` stores a concrete `Bridge`; it cannot be replaced by
a small interface. The public production `Bridge` constructor initializes and
loads an Android WebView, so subclassing also cannot prevent WebView creation.
Plugin invocation itself does not need a WebView: `MessageHandler` creates a
`PluginCall`, `Bridge.callPluginMethod` dispatches it, and `PluginCall` resolves
to a JSON result. UI plugins use the host `AppCompatActivity`, AndroidX Activity
Result launchers, and permission APIs.

## Implemented strategy

`capacitor-headless` compiles the exact `@capacitor/android` source installed by
the application and applies `headless-capacitor.patch` at build time. The patch:

1. Adds a `Bridge(AppCompatActivity, pluginClasses, config, resultListener)`
   constructor that never creates or loads a WebView.
2. Sends `MessageHandler` results to the Lynx callback sink.
3. Keeps Capacitor's plugin registration, lifecycle, permission, saved-call,
   and Activity Result implementation unchanged.
4. Registers the non-WebView core plugins (Cookies, HTTP, System Bars), but
   deliberately omits Capacitor's WebView plugin.

The generated registry is compile-time deterministic and keeps plugin classes
visible to R8. `LynxCapacitorRuntime` owns one bridge per foreground
`AppCompatActivity` and forwards its lifecycle.

Normal and retained results are emitted through Lynx `GlobalEventEmitter`.
NativeModule callbacks are one-shot on Android and therefore cannot carry a
Capacitor listener stream. The runtime also supplies a native SensorManager
implementation for `@capacitor/motion`, whose npm Android entry is otherwise a
browser `window` event fallback.

## Compatibility boundary

Plugins that call `Bridge.getWebView()` inherently require a WebView host and
are outside the headless contract. The official plugins exercised by the Demo's
Device, Preferences, Filesystem, Camera, and Action Sheet paths do not require
one. `Device.getInfo()` may query the installed WebView package through a static
Android API, but no WebView object is constructed.
