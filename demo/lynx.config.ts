import { defineConfig } from '@lynx-js/rspeedy';
import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

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
  tools: {
    rspack: (config) => {
      config.module ??= {};
      config.module.parser ??= {};
      config.module.parser.javascript ??= {};
      config.module.parser.javascript.dynamicImportMode = 'eager';
    },
  },
});
