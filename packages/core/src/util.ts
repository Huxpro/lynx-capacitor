import type { WindowCapacitor } from './runtime';

/**
 * Resolve the Lynx `NativeModules` object. Across Lynx runtime versions it can
 * live in different places:
 *   - `globalThis.NativeModules` (some hosts inject it as a bare global)
 *   - `globalThis.multiApps[globalThis.currentAppId].NativeModules` (PrimJS
 *     background thread on iOS — the App object owns NativeModules)
 *   - `lynx.getNativeApp().nativeModuleProxy` (older API)
 */
export function getNativeModules(): Record<string, any> | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g: any = globalThis as any;

  if (g.NativeModules && typeof g.NativeModules === 'object') {
    return g.NativeModules;
  }

  try {
    const apps = g.multiApps;
    const appId = g.currentAppId;
    if (apps && appId != null && apps[appId]?.NativeModules) {
      return apps[appId].NativeModules;
    }
    // Fallback: any app entry exposing NativeModules.
    if (apps && typeof apps === 'object') {
      for (const key of Object.keys(apps)) {
        if (apps[key]?.NativeModules) {
          return apps[key].NativeModules;
        }
      }
    }
  } catch {
    // ignore
  }

  try {
    const nativeApp = g.lynx?.getNativeApp?.();
    if (nativeApp?.nativeModuleProxy) {
      return nativeApp.nativeModuleProxy;
    }
    if (nativeApp?.NativeModules) {
      return nativeApp.NativeModules;
    }
  } catch {
    // ignore
  }

  return undefined;
}

/**
 * Platform detection. In Capacitor this checks for the injected WebView bridge
 * sentinels. In Lynx there is no WebView; instead we detect the presence of the
 * `CapacitorBridge` native module. We report the OS the native module targets
 * so that unmodified @capacitor/* plugins select their native impl branch.
 */
export function getPlatformId(win: WindowCapacitor): 'android' | 'ios' | 'web' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g: any = win as any;

  // Explicit override wins (useful for testing / android host).
  if (g.CapacitorLynxPlatform === 'android' || g.CapacitorLynxPlatform === 'ios') {
    return g.CapacitorLynxPlatform;
  }

  const nm = getNativeModules();
  const bridge = nm?.CapacitorBridge;
  if (bridge) {
    const declared = typeof bridge.getPlatform === 'function' ? bridge.getPlatform() : undefined;
    if (declared === 'android' || declared === 'ios') {
      return declared;
    }
    return 'ios';
  }

  // Legacy WebView sentinels (in case this ever runs in a hybrid webview).
  if (g.androidBridge) {
    return 'android';
  }
  if (g.webkit?.messageHandlers?.bridge) {
    return 'ios';
  }

  return 'web';
}
