import {
  PrismicDoc,
  PrismicResource,
  ResourceType,
  ResourceSource,
  ResourceAuthor,
} from './models';

// const apiURL = 'https://ionicframeworkcom.prismic.io/api/v2';

export const prismicResourceToToc = (resource: PrismicResource): string[] => {
  let titles: string[] = [resource.title];
  resource.doc?.data?.body?.forEach((bodyItem: any) => {
    bodyItem.primary?.content?.forEach((content: any) => {
      if (content.type?.includes('heading')) titles.push(content.text);
    });
  });

  return titles;
};

export const prismicDocToResource = (doc: PrismicDoc): PrismicResource => {
  return {
    id: doc.uid!,
    title: doc.data.title || null,
    description: doc.data.tagline || null,
    tags: doc.tags || [],
    publishDate: doc.first_publication_date || null,
    updatedDate: doc.last_publication_date || null,
    type: prismicTypeToResourceType(doc.type),
    authors: getAuthorsForPrismicDoc(doc),
    metaImage: getImage(doc.data.meta_image),
    heroImage: getImage(doc.data.hero_image || doc.data.cover_image),
    source: ResourceSource.Prismic,
    doc,
  };
};

const getImage = (imageObj: any) =>
  imageObj && imageObj.url ? imageObj.url : '';

export const getAuthorsForPrismicDoc = (doc: PrismicDoc): ResourceAuthor[] => {
  if (
    (!doc.data.hosts || !doc.data.hosts.length) &&
    (!doc.data.author || !doc.data.author.length)
  ) {
    return [];
  }

  if (doc.type === 'webinar') {
    return doc.data.hosts.map((h: any) => ({
      name: h.name || '',
      title: h.title || '',
      link: h.profile_link?.url || '',
      avatar: h.photo || '',
    }));
  } else if (doc.data.author && doc.data.author.length) {
    return doc.data.author.map((a: any) => ({
      name: a.name || '',
      title: a.title || '',
      link: a.author_url?.url || '',
      avatar: a.photo || '',
    }));
  } else if (doc.data.author) {
    return [
      {
        name: doc.data.author.name || '',
        title: doc.data.author.title || '',
        link: doc.data.author.author_url?.url || '',
        avatar: doc.data.author.photo || '',
      },
    ];
  }

  return [];
};

export const prismicTypeToResourceType = (type: string) =>
  (({
    article: ResourceType.Article,
    blog: ResourceType.Blog,
    book: ResourceType.Book,
    case_study: ResourceType.CaseStudy,
    course: ResourceType.Course,
    customer_story: ResourceType.CustomerInterview,
    doc: ResourceType.Doc,
    guide: ResourceType.Guide,
    learning: ResourceType.Learning,
    podcast: ResourceType.Podcast,
    tutorial: ResourceType.Tutorial,
    video: ResourceType.Video,
    webinar: ResourceType.Webinar,
    whitepaper: ResourceType.Whitepaper,
  } as { [key: string]: ResourceType })[type]);

export const resourceTypeToPrismicType = (type: ResourceType) =>
  ({
    [ResourceType.Article]: 'article',
    [ResourceType.Blog]: 'blog',
    [ResourceType.Book]: 'book',
    [ResourceType.CaseStudy]: 'case_study',
    [ResourceType.Course]: 'course',
    [ResourceType.CustomerInterview]: 'customer_story',
    [ResourceType.Doc]: 'doc',
    [ResourceType.Guide]: 'guide',
    [ResourceType.Learning]: 'learning',
    [ResourceType.Podcast]: 'podcast',
    [ResourceType.Tutorial]: 'tutorial',
    [ResourceType.Video]: 'video',
    [ResourceType.Webinar]: 'webinar',
    [ResourceType.Whitepaper]: 'whitepaper',
  }[type]);

export function linkResolver(doc: any) {
  // Define the url depending on the document type
  if (doc.type === 'article') {
    return '/resources/articles/' + doc.uid;
  } else if (doc.type === 'case_study') {
    return '/resources/case-studies/' + doc.uid;
  } else if (doc.type === 'customer_story') {
    return '/resources/customer-interviews/' + doc.uid;
  } else if (doc.type === 'enterprise_blog_post') {
    return '/enterprise/blog/' + doc.uid;
  } else if (doc.type === 'integration') {
    return '/integrations/' + doc.uid;
  } else if (doc.type === 'podcast') {
    return '/resources/podcasts/' + doc.uid;
  } else if (doc.type === 'thank_you') {
    return '/thank-you/' + doc.uid;
  } else if (doc.type === 'video') {
    return '/resources/videos/' + doc.uid;
  } else if (doc.type === 'webinar') {
    return '/resources/webinars/' + doc.uid;
  } else if (doc.type === 'whitepaper') {
    return '/resources/whitepapers/' + doc.uid;
  }

  // Default to homepage
  return '/';
}
