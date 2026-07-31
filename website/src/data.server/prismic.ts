import { Document as PrismicDocument } from 'prismic-javascript/d.ts/documents';
import { Client } from './prismic-configuration';
import { PrismicDocsResponse } from './models';
import Prismic from 'prismic-javascript';
import { MapParamData } from '@stencil/router';

export const getPage: MapParamData = async (_params, url) => {
  // Prismic is a live external CMS: the Capacitor community/enterprise docs
  // were removed upstream, so queries can return no document. Instead of
  // crashing page renders, default every missing field to an empty array
  // (components iterate/map over these fields) so pages degrade gracefully.
  const emptyFields = (): any =>
    new Proxy({} as Record<string, unknown>, {
      get: (target, prop: string) =>
        prop in target ? target[prop] : [],
    });

  const data: any = emptyFields();
  const source = await (async () => {
    switch (url.pathname) {
      case '/':
        return {
          ...(await queryPrismic('capacitor_homepage')),
          whitepaper_ad: await queryPrismic('capacitor_whitepaper_ad'),
          announcement: await queryPrismic('capacitor_homepage_announcement'),
        };
      case '/community':
        return await queryPrismic('capacitor_community');
      case '/enterprise':
        return await queryPrismic('capacitor_enterprise');
    }
  })();

  if (source) {
    // Skip undefined values (e.g. a Prismic singleton that no longer has a
    // document) so the fallback proxy kicks in instead of crashing renders.
    Object.entries(source).forEach(([key, value]) => {
      if (value !== undefined) {
        data[key] = value;
      }
    });
  }

  const announcementBar = await queryPrismic('announcement_bar');
  if (announcementBar !== undefined) {
    data.announcement_bar = announcementBar;
  }

  return data;
};

export const getBlogPost = async (slug: string): Promise<PrismicDocument> => {
  const prismicClient = Client();
  return prismicClient.getByUID('blog', slug, {});
};

export const getBlogPosts = async (
  _page: number = 0,
  pageSize = 10,
): Promise<PrismicDocsResponse> => {
  const prismicClient = Client();

  const res = await prismicClient.query(
    Prismic.Predicates.at('document.type', 'blog'),
    { pageSize },
  );

  return {
    docs: res.results,
    _prismic: {
      ...res,
    },
  };
};

export const queryPrismic = async (prismicId: string) => {
  try {
    const prismicClient = Client();
    const response: PrismicDocument = await prismicClient.getSingle(
      prismicId,
      {},
    );

    return response.data;
  } catch (e) {
    console.warn(e);
  }
};
