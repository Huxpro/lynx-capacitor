import { PrerenderConfig } from '@stencil/core';

export const config: PrerenderConfig = {
  hydrateOptions() {
    return {
      timeout: 30000,
    };
  },
  filterUrl(url) {
    if (url.pathname.includes('/docs')) {
      return false;
    }
    if (url.pathname.startsWith('/lynx-capacitor')) {
      // Served as a static page (copied from content/lynx-capacitor at build
      // time), not a Stencil route — don't prerender over it.
      return false;
    }
    return true;
  },
  entryUrls: ['/'],
  // normalizeUrl(href, base) {
  //   // temp fix for absolute paths with /docs/v3
  //   href = href.replace('v3/v3', 'v3');
  //   return new URL(href, base);
  // },
};
