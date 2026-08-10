import type {
  CapacitorGlobal,
  MessageCallData,
  PluginResult,
  StoredCallback,
  PluginListenerHandle,
  ListenerCallback,
} from './definitions';
import { CapacitorException, ExceptionCode } from './definitions';
import { getNativeModules } from './util';

/**
 * The Lynx transport layer. This is the moral equivalent of Capacitor's
 * `native-bridge.ts`, except instead of posting messages to
 * `window.webkit.messageHandlers.bridge` (iOS WKWebView) it dispatches to the
 * Lynx `NativeModules.CapacitorBridge` native module and receives results via
 * the Lynx GlobalEventEmitter.
 *
 * The contract with native is identical to Capacitor's:
 *   JS -> native:  { callbackId, pluginId, methodName, options }
 *   native -> JS:  { callbackId, pluginId, methodName, success, data|error, save }
 */

interface LynxNativeModule {
  /**
   * Dispatch a Capacitor call to native. `payload` is the JSON-encoded
   * MessageCallData; `callback` is a JS function native invokes with the
   * JSON-encoded PluginResult. For listeners native retains and re-invokes it.
   */
  handleCall: (payload: string, callback: (resultJson: string) => void) => void;
  getPluginHeaders?: () => string;
  getPlatform?: () => string;
}

interface LynxGlobalEventEmitter {
  addListener: (eventName: string, listener: (...args: unknown[]) => void) => void;
}

interface LynxGlobal {
  getJSModule?: (name: 'GlobalEventEmitter') => LynxGlobalEventEmitter;
}

const RESULT_EVENT = 'lynx-capacitor-result';

declare const NativeModules: Record<string, LynxNativeModule> | undefined;

function getNativeModule(): LynxNativeModule | undefined {
  try {
    const nm = getNativeModules();
    return nm?.CapacitorBridge as LynxNativeModule | undefined;
  } catch {
    return undefined;
  }
}

function getGlobalEventEmitter(): LynxGlobalEventEmitter | undefined {
  const global = globalThis as typeof globalThis & {
    lynx?: LynxGlobal;
    currentAppId?: string;
    multiApps?: Record<string, { GlobalEventEmitter?: LynxGlobalEventEmitter }>;
  };
  const current = global.currentAppId != null
    ? global.multiApps?.[global.currentAppId]?.GlobalEventEmitter
    : undefined;
  if (current) return current;
  for (const app of Object.values(global.multiApps ?? {})) {
    if (app.GlobalEventEmitter) return app.GlobalEventEmitter;
  }
  return global.lynx?.getJSModule?.('GlobalEventEmitter');
}

export function initNativeBridge(cap: CapacitorGlobal): void {
  // Randomize so callback ids don't collide across reloads, matching Capacitor.
  let callbackIdCount = Math.floor(Math.random() * 134217728);
  const callbacks = new Map<string, StoredCallback>();

  const nativeModule = getNativeModule();

  const parseResult = (raw: PluginResult | string): PluginResult =>
    typeof raw === 'string' ? JSON.parse(raw) : raw;

  // native -> JS. Mirrors Capacitor's returnResult().
  const returnResult = (result: PluginResult): void => {
    const storedCall = result.callbackId ? callbacks.get(result.callbackId) : undefined;

    if (result.error) {
      // Rehydrate into a real Error so `error.message` / `error.code` survive.
      const src = result.error;
      result.error = Object.keys(src).reduce((err: any, key) => {
        err[key] = (src as any)[key];
        return err;
      }, new CapacitorException(src.message ?? '', src.code as ExceptionCode));
    }

    if (storedCall) {
      if (typeof storedCall.callback === 'function') {
        result.success
          ? storedCall.callback(result.data)
          : storedCall.callback(null, result.error);
      } else if (typeof storedCall.resolve === 'function') {
        if (result.success) {
          storedCall.resolve!(result.data);
        } else {
          storedCall.reject!(result.error);
        }
        // Promises are one-shot.
        callbacks.delete(result.callbackId!);
      }
    } else if (!result.success && result.error) {
      // eslint-disable-next-line no-console
      console.warn(result.error);
    }

    if (result.save === false && result.callbackId) {
      callbacks.delete(result.callbackId);
    }

    delete result.data;
    delete result.error;
  };

  const globalEventEmitter = getGlobalEventEmitter();
  globalEventEmitter?.addListener(RESULT_EVENT, (value: unknown) => {
    if (value == null) return;
    try {
      const unwrapped = Array.isArray(value) && value.length === 1 ? value[0] : value;
      if (unwrapped == null) return;
      const resultJson = typeof unwrapped === 'string' ? unwrapped : JSON.stringify(unwrapped);
      const result = parseResult(resultJson);
      if (!result || typeof result !== 'object') return;
      returnResult(result);
    } catch (e) {
      console.error('[lynx-capacitor] Failed to parse native event result', e);
    }
  });

  cap.fromNative = returnResult;

  const postToNative = (data: MessageCallData): void => {
    const mod = nativeModule ?? getNativeModule();
    if (!mod || typeof mod.handleCall !== 'function') {
      // No native bridge present (e.g. running on web/dev without the module).
      queueMicrotask(() => {
        returnResult({
          callbackId: data.callbackId,
          pluginId: data.pluginId,
          methodName: data.methodName,
          success: false,
          error: {
            message: `Capacitor native bridge (NativeModules.CapacitorBridge) is not available; cannot call ${data.pluginId}.${data.methodName}`,
            code: ExceptionCode.Unavailable,
          },
        });
      });
      return;
    }
    // The callback is a compatibility fallback. Lynx NativeModule callbacks
    // are one-shot, so Android sends normal and retained results through the
    // GlobalEventEmitter instead.
    mod.handleCall(JSON.stringify(data), (resultJson: string) => {
      try {
        returnResult(parseResult(resultJson));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Capacitor bridge failed to parse native result', e, resultJson);
      }
    });
  };

  // JS -> native. Mirrors Capacitor's Capacitor.toNative.
  cap.toNative = (pluginName, methodName, options, storedCallback): string => {
    let callbackId = '-1';
    if (
      storedCallback &&
      (typeof storedCallback.callback === 'function' ||
        typeof storedCallback.resolve === 'function')
    ) {
      callbackId = String(++callbackIdCount);
      callbacks.set(callbackId, storedCallback);
    }
    postToNative({
      callbackId,
      pluginId: pluginName,
      methodName,
      options: options || {},
    });
    return callbackId;
  };

  cap.nativeCallback = (pluginName, methodName, options, callback) =>
    cap.toNative!(pluginName, methodName, options, { callback });

  cap.nativePromise = (pluginName, methodName, options) =>
    new Promise((resolve, reject) => {
      cap.toNative!(pluginName, methodName, options, { resolve, reject });
    });

  // Event helper used by the per-plugin JS shim (addListener bridging).
  cap.addListener = (
    pluginName: string,
    eventName: string,
    callback: ListenerCallback,
  ): PluginListenerHandle => {
    const callbackId = cap.nativeCallback!(pluginName, 'addListener', { eventName }, callback);
    return {
      remove: async () => {
        cap.removeListener!(pluginName, eventName, callbackId, callback);
      },
    };
  };

  cap.removeListener = (
    pluginName: string,
    eventName: string,
    callbackId: string,
    _callback: ListenerCallback,
  ): void => {
    callbacks.delete(callbackId);
    cap.toNative!(pluginName, 'removeListener', { eventName, callbackId });
  };
}
