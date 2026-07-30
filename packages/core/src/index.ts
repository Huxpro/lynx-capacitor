export * from './definitions';
export { Capacitor, registerPlugin } from './global';
export { WebPlugin } from './web-plugin';
export type { WebPluginConfig } from './web-plugin';
export { createCapacitor } from './runtime';
export { buildRequestInit, normalizeHttpHeaders, buildUrlParams } from './http';
export type { HttpOptions, HttpHeaders } from './http';

import { Capacitor } from './global';

/** Convenience alias matching @capacitor/core's `Plugins` export. */
export const Plugins = Capacitor.Plugins;

// @capacitor/core ships these two plugins bundled. Real plugin packages and app
// code do `import { CapacitorHttp, CapacitorCookies } from '@capacitor/core'`,
// so the adapter must export them too. They route through the Lynx bridge.
export const CapacitorHttp = Capacitor.registerPlugin('CapacitorHttp');
export const CapacitorCookies = Capacitor.registerPlugin('CapacitorCookies');
export const SystemBars = Capacitor.registerPlugin('SystemBars');

export enum SystemBarsStyle {
  Dark = 'DARK',
  Light = 'LIGHT',
  Default = 'DEFAULT',
}

export enum SystemBarType {
  StatusBar = 'StatusBar',
  NavigationBar = 'NavigationBar',
}
