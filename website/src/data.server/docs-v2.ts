import type { MapParamData } from '@stencil/router';
import {
  getPageNavigation,
  parseMarkdown,
  parseTableOfContents,
  TableOfContents,
} from '@stencil/ssg/parse';
import { join } from 'path';
import { getGithubData } from './github';
import { hookUpDesignSystem } from './blog';
import { queryPrismic } from './prismic';
import { DocsData, DocsTemplate } from './models';

const repoRootDir = join(__dirname, '..', '..');
const pagesDir = join(repoRootDir, 'pages');
const docsDir = join(pagesDir, 'docs', 'v2');

export const getDocsDataV2: MapParamData = async ({ id }) => {
  if (!id) {
    id = 'index.md';
  }

  const results: DocsData = await parseMarkdown(join(docsDir, id), {
    headingAnchors: true,
    beforeHtmlSerialize(frag: DocumentFragment) {
      hookUpDesignSystem(frag);
    },
  });

  results.template = getTemplateFromPath(results.filePath);

  results.tableOfContents = await getTableOfContents(results.template);

  results.navigation = await getPageNavigation(pagesDir, results.filePath, {
    tableOfContents: results.tableOfContents,
  });

  const githubData = await getGithubData(repoRootDir, results.filePath);

  results.lastUpdated = githubData.lastUpdated;
  results.editUrl = githubData.repoFileUrl;

  results.contributors = [];
  if (Array.isArray(githubData.contributors)) {
    results.contributors.push(...githubData.contributors);
  }
  if (Array.isArray(results.attributes?.contributors)) {
    results.contributors.push(...results.attributes.contributors);
  }
  results.contributors = Array.from(new Set(results.contributors));

  results.announcement_bar = await queryPrismic('announcement_bar');
  results.canonicalUrl = results.attributes.canonicalUrl;

  return results;
};

const cachedToc = new Map<string, TableOfContents>();

const getTableOfContents = async (template: DocsTemplate) => {
  let toc = cachedToc.get(template);
  if (!toc) {
    let tocPath: string;
    if (template === 'cli' || template === 'plugins') {
      tocPath = join(docsDir, template, 'README.md');
    } else {
      tocPath = join(docsDir, 'README.md');
    }
    toc = await parseTableOfContents(tocPath, pagesDir);
    cachedToc.set(template, toc);
  }
  return toc;
};

const getTemplateFromPath = (path: string): DocsTemplate => {
  // For when I'm testing on my windows boot -Jared
  // const isDev = !globalThis.location.origin.includes('https://');

  // if (isDev) {
  //   const path = globalThis.location.href;

  //   if (path.includes('/plugins') || path.includes('/apis')) {
  //     return 'plugins';
  //   }
  //   if (path.includes('/cli')) {
  //     return 'cli';
  //   }
  // }

  if (typeof path === 'string') {
    if (path.includes('/plugins') || path.includes('/apis')) {
      return 'plugins';
    }
    if (path.includes('/cli')) {
      return 'cli';
    }
  }
  return 'docs';
};
