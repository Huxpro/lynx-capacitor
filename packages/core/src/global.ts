import { createCapacitor } from './runtime';
import type { CapacitorGlobal } from './definitions';

/**
 * Global bootstrap. Mirrors @capacitor/core's global.ts: on import we ensure a
 * single `globalThis.Capacitor` exists and is augmented with the runtime.
 */
function initCapacitorGlobal(win: any): CapacitorGlobal {
  win.Capacitor = createCapacitor(win);
  return win.Capacitor;
}

export const Capacitor: CapacitorGlobal = initCapacitorGlobal(
  typeof globalThis !== 'undefined'
    ? (globalThis as any)
    : typeof self !== 'undefined'
      ? (self as any)
      : typeof window !== 'undefined'
        ? (window as any)
        : {},
);

export const registerPlugin = Capacitor.registerPlugin;
