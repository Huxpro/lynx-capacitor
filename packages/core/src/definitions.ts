// Public type surface, mirroring @capacitor/core's definitions closely enough
// that unmodified @capacitor/* plugins compile and run against this adapter.

export interface PluginListenerHandle {
  remove: () => Promise<void>;
}

export interface ListenerCallback<T = any> {
  (data: T): void;
}

export type PluginResultData = Record<string, unknown>;

export interface PluginResultError {
  message: string;
  code?: string;
  [key: string]: unknown;
}

/** The message a JS plugin call posts to native. Matches Capacitor's MessageCallData. */
export interface MessageCallData {
  callbackId: string;
  pluginId: string;
  methodName: string;
  options: PluginResultData;
}

/** The result native posts back. Matches Capacitor's PluginResult. */
export interface PluginResult {
  callbackId?: string;
  methodName?: string;
  pluginId?: string;
  success: boolean;
  data?: PluginResultData;
  error?: PluginResultError;
  save?: boolean;
}

export interface StoredCallback {
  callback?: (data: any, error?: any) => void;
  resolve?: (data: any) => void;
  reject?: (error: any) => void;
}

/** Describes one native plugin and its methods, exactly like Capacitor's PluginHeader. */
export interface PluginHeaderMethod {
  name: string;
  rtype: 'promise' | 'callback' | '' | undefined;
}

export interface PluginHeader {
  name: string;
  methods: PluginHeaderMethod[];
}

export type CapacitorPlatform = 'web' | 'ios' | 'android';

export interface PluginConfig {
  [key: string]: any;
}

export interface RegisterPluginOptions {
  [platform: string]: () => Promise<any> | any;
}

export interface CapacitorGlobal {
  DEBUG?: boolean;
  isLoggingEnabled?: boolean;
  Plugins: Record<string, any>;
  PluginHeaders?: PluginHeader[];
  Exception: typeof CapacitorException;
  getPlatform: () => string;
  isPluginAvailable: (name: string) => boolean;
  isNativePlatform: () => boolean;
  convertFileSrc: (filePath: string) => string;
  registerPlugin: typeof registerPlugin;
  logJs?: (message: string, level: string) => void;
  handleError?: (err: Error) => void;
  // transport surface (native-bridge equivalents)
  toNative?: (
    pluginName: string,
    methodName: string,
    options: any,
    storedCallback?: StoredCallback,
  ) => string;
  nativePromise?: (pluginName: string, methodName: string, options?: any) => Promise<any>;
  nativeCallback?: (
    pluginName: string,
    methodName: string,
    options: any,
    callback: (data: any, error?: any) => void,
  ) => string;
  fromNative?: (result: PluginResult) => void;
  addListener?: (
    pluginName: string,
    eventName: string,
    callback: ListenerCallback,
  ) => PluginListenerHandle;
  removeListener?: (
    pluginName: string,
    eventName: string,
    callbackId: string,
    callback: ListenerCallback,
  ) => void;
}

export enum ExceptionCode {
  /** API is not implemented. */
  Unimplemented = 'UNIMPLEMENTED',
  /** API is not available for the platform. */
  Unavailable = 'UNAVAILABLE',
}

export class CapacitorException extends Error {
  constructor(
    readonly message: string,
    readonly code?: ExceptionCode | string,
    readonly data?: PluginResultData,
  ) {
    super(message);
  }
}

// Forward declaration type used above; real impl lives in runtime.ts.
export declare function registerPlugin<T>(
  pluginName: string,
  jsImplementations?: RegisterPluginOptions,
): T;
