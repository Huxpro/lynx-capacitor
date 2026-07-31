import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

import dotenvPlugin from 'rollup-plugin-dotenv';

export const config: Config = {
  devServer: {
    openBrowser: false,
    // logRequests: true,
  },
  globalStyle: './src/global/style.scss',
  namespace: 'site',
  outputTargets: [
    {
      type: 'www',
      prerenderConfig: './prerender.config.ts',
      baseUrl: 'https://capacitorjs.com/',
      serviceWorker: null,
      copy: [
        {
          src: '../node_modules/@ionic-internal/ionic-ds/www/assets/fonts',
          dest: 'assets/fonts',
        },
        {
          src: '../content/lynx-capacitor',
          dest: 'lynx-capacitor',
        },
      ],
    },
  ],
  plugins: [
    sass({
      includePaths: ['ds'],
    }),
    dotenvPlugin(),
  ],
};
