/// <reference types="@lynx-js/react" />

// The Lynx native module our adapter talks to. Declared so TS is happy; the
// actual dispatch lives in @lynx-capacitor/core.
declare module '@lynx-js/types' {
  interface NativeModules {
    CapacitorBridge: {
      handleCall(payload: string, callback: (resultJson: string) => void): void;
      getPluginHeaders(): string;
      getPlatform(): string;
    };
  }
}

export {};
