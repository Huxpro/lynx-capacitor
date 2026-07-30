import { defineConfig } from '@lynx-js/rspeedy';
import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// The heart of the adapter: every unmodified @capacitor/* plugin imports
// `@capacitor/core`. We alias that to @lynx-capacitor/core, which reimplements
// Capacitor's bridge over the Lynx NativeModule API. The plugins are none the
// wiser — they call registerPlugin / Capacitor exactly as on a real device.
export default defineConfig({
  plugins: [pluginQRCode(), pluginReactLynx()],
  resolve: {
    alias: {
      '@capacitor/core': require.resolve('@lynx-capacitor/core'),
    },
  },
  output: {
    filename: '[name].[platform].bundle',
  },
});
