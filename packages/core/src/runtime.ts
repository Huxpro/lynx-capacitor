import type {
  CapacitorGlobal,
  PluginHeader,
  PluginListenerHandle,
  ListenerCallback,
  RegisterPluginOptions,
} from './definitions';
import { CapacitorException, ExceptionCode } from './definitions';
import { initNativeBridge } from './native-bridge';
import { getPlatformId, getNativeModules } from './util';

export interface WindowCapacitor {
  Capacitor?: CapacitorGlobal;
  androidBridge?: unknown;
  webkit?: { messageHandlers?: { bridge?: unknown } };
  NativeModules?: Record<string, { postMessage: (s: string) => void; getPluginHeaders?: () => string }>;
  lynx?: unknown;
}

const registeredPlugins = new Map<string, any>();

/** Read the native-declared plugin headers (which native methods exist). */
function loadPluginHeaders(): PluginHeader[] {
  try {
    const nm = getNativeModules();
    const raw = nm?.CapacitorBridge?.getPluginHeaders?.();
    if (typeof raw === 'string') {
      return JSON.parse(raw);
    }
    if (Array.isArray(raw)) {
      return raw;
    }
  } catch {
    // fall through
  }
  return [];
}

export function createCapacitor(win: WindowCapacitor): CapacitorGlobal {
  const capCustomPlatform = (win as any).CapacitorCustomPlatform ?? null;
  const existing = win.Capacitor || ({} as CapacitorGlobal);
  const cap: CapacitorGlobal = existing;

  cap.Plugins = cap.Plugins || {};

  const getPlatform = (): string => {
    return capCustomPlatform?.name ?? getPlatformId(win);
  };

  const isNativePlatform = (): boolean => getPlatform() !== 'web';

  const isPluginAvailable = (pluginName: string): boolean => {
    const plugin = registeredPlugins.get(pluginName);
    if (plugin?.platforms.has(getPlatform())) {
      return true;
    }
    return getPluginHeader(pluginName) !== undefined;
  };

  const convertFileSrc = (filePath: string): string => filePath;

  const logJs = (msg: string, level: string): void => {
    switch (level) {
      case 'error':
        // eslint-disable-next-line no-console
        console.error(msg);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(msg);
        break;
      default:
        // eslint-disable-next-line no-console
        console.log(msg);
    }
  };

  cap.getPlatform = getPlatform;
  cap.isPluginAvailable = isPluginAvailable;
  cap.isNativePlatform = isNativePlatform;
  cap.convertFileSrc = convertFileSrc;
  cap.logJs = logJs;
  cap.handleError = (err: Error) => (win as any).console?.error?.(err);
  cap.Exception = CapacitorException;
  cap.DEBUG = cap.DEBUG ?? false;
  cap.isLoggingEnabled = cap.isLoggingEnabled ?? false;

  // Wire up the transport (toNative / nativePromise / nativeCallback / fromNative).
  initNativeBridge(cap);

  // Populate PluginHeaders from native so registerPlugin knows which methods
  // are natively implemented (mirrors Capacitor's native-injected PluginHeaders).
  cap.PluginHeaders = cap.PluginHeaders ?? loadPluginHeaders();

  const getPluginHeader = (pluginName: string): PluginHeader | undefined =>
    cap.PluginHeaders?.find(h => h.name === pluginName);

  const registerPlugin = (
    pluginName: string,
    jsImplementations: RegisterPluginOptions = {},
  ): any => {
    const cached = registeredPlugins.get(pluginName);
    if (cached) {
      return cached.proxy;
    }

    const platform = getPlatform();
    let jsImplementation: any;

    const loadPluginImplementation = async (): Promise<any> => {
      if (!jsImplementation && platform in jsImplementations) {
        jsImplementation =
          typeof jsImplementations[platform] === 'function'
            ? (jsImplementation = await jsImplementations[platform]())
            : (jsImplementation = jsImplementations[platform]);
      } else if (capCustomPlatform !== null && !jsImplementation && 'web' in jsImplementations) {
        jsImplementation =
          typeof jsImplementations['web'] === 'function'
            ? (jsImplementation = await jsImplementations['web']())
            : (jsImplementation = jsImplementations['web']);
      }
      return jsImplementation;
    };

    const createPluginMethod = (impl: any, prop: PropertyKey): any => {
      const pluginHeader = getPluginHeader(pluginName);
      if (pluginHeader) {
        const methodHeader = pluginHeader?.methods.find(m => prop === m.name);
        if (methodHeader) {
          if (methodHeader.rtype === 'promise') {
            return (options: any) =>
              cap.nativePromise!(pluginName, prop.toString(), options);
          }
          return (options: any, callback: any) =>
            cap.nativeCallback!(pluginName, prop.toString(), options, callback);
        } else if (impl) {
          return impl[prop]?.bind(impl);
        }
      } else if (impl) {
        return impl[prop]?.bind(impl);
      } else {
        throw new CapacitorException(
          `"${pluginName}" plugin is not implemented on ${platform}`,
          ExceptionCode.Unimplemented,
        );
      }
    };

    const createPluginMethodWrapper = (prop: PropertyKey): any => {
      let remove: (() => Promise<void>) | undefined;
      const wrapper = (...args: any[]) => {
        const methodHeader = getPluginHeader(pluginName)?.methods.find(
          method => method.name === prop,
        );
        const implementation = methodHeader
          ? Promise.resolve(undefined)
          : loadPluginImplementation();
        const p = implementation.then(impl => {
          const fn = createPluginMethod(impl, prop);
          if (fn) {
            const p2 = fn(...args);
            remove = p2?.remove;
            return p2;
          }
          throw new CapacitorException(
            `"${pluginName}.${prop as string}()" is not implemented on ${platform}`,
            ExceptionCode.Unimplemented,
          );
        });
        if (prop === 'addListener') {
          (p as any).remove = async () => remove?.();
        }
        return p;
      };
      wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
      Object.defineProperty(wrapper, 'name', { value: prop, writable: false, configurable: true });
      return wrapper;
    };

    const addListener = (eventName: string, callback: ListenerCallback): any => {
      const pluginHeader = getPluginHeader(pluginName);
      const implementation = pluginHeader
        ? Promise.resolve(undefined)
        : loadPluginImplementation();
      const call = implementation.then((impl: any) => {
        if (!pluginHeader && impl) {
          // JS/web implementation with its own addListener (WebPlugin).
          return impl.addListener?.(eventName, callback);
        }
        return cap.addListener!(pluginName, eventName, callback);
      });
      const remove = async (): Promise<void> => {
        const handle = await call;
        handle?.remove?.();
      };
      const p = new Promise<PluginListenerHandle>(resolve =>
        call.then(() => resolve({ remove })),
      );
      (p as any).remove = async (): Promise<void> => {
        await remove();
      };
      return p;
    };

    const proxy = new Proxy(
      {},
      {
        get(_, prop) {
          switch (prop) {
            case '$$typeof':
              return undefined;
            case 'toJSON':
              return () => ({});
            case 'addListener':
              return addListener;
            default:
              return createPluginMethodWrapper(prop);
          }
        },
      },
    );

    (cap.Plugins as any)[pluginName] = proxy;

    registeredPlugins.set(pluginName, {
      name: pluginName,
      proxy,
      platforms: new Set([
        ...Object.keys(jsImplementations),
        ...(getPluginHeader(pluginName) ? [platform] : []),
      ]),
    });

    return proxy;
  };

  cap.registerPlugin = registerPlugin as any;

  return cap;
}

export const registerPlugin = <T>(
  pluginName: string,
  jsImplementations?: RegisterPluginOptions,
): T => {
  return (globalThis as any).Capacitor.registerPlugin(pluginName, jsImplementations);
};
