import { Component, Prop, h, Host, Element, State } from '@stencil/core';
import {
  Heading,
  Paragraph,
  DateTime,
  ResponsiveContainer,
} from '@ionic-internal/ionic-ds';
import { Components as DS } from '@ionic-internal/ionic-ds/dist/types/components';

import { href } from '@utils/common';

import parseISO from 'date-fns/parseISO';

import { BlogData } from 'src/data.server/blog';
import Helmet from '@stencil/helmet';
import ResponsiveImage from 'src/components/ResponsiveImage/ResponsiveImage';

@Component({
  tag: 'blog-post',
  styleUrl: 'blog-post.scss',
  assetsDirs: ['assets'],
})
export class BlogPost {
  @Prop() preview?: boolean = false;
  @Prop() data: BlogData;

  @State() ogAssetPath!: string;
  @State() moreResources: DS.MoreResources = {
    resources: [],
    routing: [],
  };

  @Element() el!: HTMLElement;

  componentWillLoad() {
    // const { slug, getRelatedResources, preview } = this;
    // this.data = (posts as RenderedBlog[]).find(p => p.slug === slug);
    // if (!this.data) console.error('Could not find blog post by slug.');
    // if (!preview) getRelatedResources();
  }

  // getRelatedResources = async () => {
  //   const { related } = this.data!;
  //   if (!related) return;

  //   await Promise.all(
  //     related.map(async resource => {
  //       const info = await this.getRelatedDetails(resource);
  //       if (!info || !info.type || !info.uid)
  //         return console.error('Couldnt get type or uid of related resources');

  //       const doc = await this.client.getByUID(
  //         resourceTypeToPrismicType(info.type),
  //         info.uid,
  //         {},
  //       );
  //       this.moreResources.resources?.push(prismicDocToResource(doc));
  //       (this.moreResources.routing as DS.ResourceCard['routing'][]).push(
  //         info.routing,
  //       );
  //     }),
  //   );

  //   this.moreResources = {
  //     resources: [...this.moreResources.resources!],
  //     routing: [
  //       ...(this.moreResources.routing! as DS.ResourceCard['routing'][]),
  //     ],
  //   };
  //   // this.moreResources = {...this.moreResources)};
  // };

  // getRelatedDetails = async (url: string) => {
  //   const matchResults = url.match(/\/resources\/(.*?)$/);
  //   if (!matchResults || !matchResults[1])
  //     return console.error('Invalid url for markdown blog related resources');

  //   const relatedInfo = matchResults[1].split('/');
  //   const uid = relatedInfo.pop();
  //   const type = relatedInfo.pop();
  //   if (!uid)
  //     return console.error(
  //       'Error getting uid from markdown blog related resource url',
  //     );

  //   if (!type) {
  //     const type = await this.getResourceType(uid);
  //     const routing = {
  //       base: '/resources',
  //       includeType: false,
  //       router: Router,
  //     };
  //     return { type, uid, routing };
  //   } else {
  //     return { type: getResourceTypeForParam(type), uid, routing: url };
  //   }
  // };

  // async getResourceType(uid: string) {
  //   const { data } = await this.client.getSingle('appflow_resources', {});

  //   const { type } = Object.values(data).find(
  //     (link: any) => link.hasOwnProperty('uid') && link.uid === uid,
  //   ) as ResourceLink;
  //   if (!type)
  //     console.error(
  //       'Markdown Blog related resource link not found in appflow resource center',
  //     );

  //   return typeToResourceType(type);
  // }

  render() {
    if (!this.data) return;

    const { PostDetail, PostPreview, preview } = this;

    return (
      <Host
        class={{
          'sc-blog-post': true,
          'preview': preview!,
          'detail': !preview,
        }}
      >
        {preview ? <PostPreview /> : <PostDetail />}
      </Host>
    );
  }

  PostHelmet = () => {
    const path = this.data!.featuredImage
      ? `${window.location.origin}/assets/img/blog${this.data!.featuredImage}`
      : `https://capacitorjs.com/assets/img/og.png`;

    return (
      <Helmet>
        <title>Capacitor Blog - {this.data!.title}</title>
        <meta property="twitter:title" content={this.data.title} />
        <meta name="description" content={this.data!.description} />
        <meta
          name="twitter:description"
          content={`${this.data!.description} - Capacitor Blog`}
        />
        <meta name="twitter:image" content={path} />
        <meta
          property="og:url"
          content={`${window.location.origin}${window.location.pathname}`}
        />
        <meta property="og:title" content={this.data.title} />
        <meta
          property="og:description"
          content={`${this.data.description} - Capacitor Blog`}
        />
        <meta property="og:image" content={path} />
        {/* <meta property="og:url" content={router.url.href} /> */}
      </Helmet>
    );
  };

  PostDetail = () => {
    const {
      PostAuthor,
      PostAuthorLarge,
      PostFeaturedImage,
      MoreResources,
      PostHelmet,
      data,
    } = this;

    return [
      <PostHelmet />,
      <blog-subnav
        breadcrumbs={[
          ['Blog', '/blog'],
          [data?.title!, `/blog/${data.slug}`],
        ]}
      />,
      <ResponsiveContainer>
        <article class="post">
          {/* <PostHelmet /> */}

          {/* <Breakpoint md={true} class="sticky-wrapper">
            <blog-social-actions post={data} column class="top" />
          </Breakpoint> */}

          <Heading class="ui-theme--editorial" level={1}>
            {data!.title}
          </Heading>
          <PostAuthor post={data!} />
          <PostFeaturedImage preview={this.preview} post={data} />

          <div class="post-content" innerHTML={data!.html} />

          {/* <blog-social-actions post={data} class="bottom" /> */}
          <PostAuthorLarge post={data!} />
          <MoreResources />
          {/* <disqus-comments url={`https://useappflow.com/blog/${post.slug}`} siteId="ionic"/> */}
        </article>
      </ResponsiveContainer>,
    ];
  };

  PostPreview = () => {
    const { PostAuthor, PostFeaturedImage } = this;

    return (
      <article class="post">
        <Heading
          class="ui-theme--editorial"
          level={1}
          onClick={() => {
            window.scrollTo(0, 0);
          }}
        >
          <a {...href(`/blog/${this.data.slug}`)}>{this.data!.title}</a>
        </Heading>
        <PostAuthor />
        <PostFeaturedImage preview={this.preview} post={this.data} />

        <div class="post-content" innerHTML={this.data!.html} />

        <a
          class="continue-reading ui-paragraph-2"
          {...href(`/blog/${this.data.slug}`)}
        >
          <span onClick={() => window.scrollTo(0, 0)}>
            Continue reading <span class="arrow">-&gt;</span>
          </span>
        </a>
      </article>
    );
  };

  PostAuthor = () => {
    const { date, authorName, authorUrl } = this.data!;
    const dateString = parseISO(date);
    // const imageParts = authorImageName?.split('.');
    // if (!imageParts || !imageParts[0] || !imageParts[1])
    //   return console.error(
    //     'Markdown Blog author image name not formatted correctly.  It should look like: max-lynch.png',
    //   );

    // const data = {
    //   name: imageParts[0],
    //   type: imageParts[1],
    // };

    return (
      <div class="author-date">
        {/* {authorImageName ? (
          <ResponsiveImage
            {...data}
            path="/assets/blog/author/"
            dimensions="56x56"
            alt={authorName}
          />
        ) : null} */}
        <Paragraph>
          By{' '}
          {authorUrl ? (
            <a href={authorUrl} target="_blank">
              {authorName}
            </a>
          ) : (
            authorName
          )}{' '}
          on <DateTime date={dateString} />
        </Paragraph>
      </div>
    );
  };

  PostAuthorLarge = () => {
    const {
      authorImageName,
      authorName,
      authorUrl,
      authorDescription,
    } = this.data!;
    if (!authorImageName) return null;

    return (
      <a href={authorUrl} target="_blank" class="author-info">
        <img
          src={`/assets/blog/author/${authorImageName}`}
          alt={authorName}
          width="56"
          height="56"
        />
        <div class="description">
          <Heading level={5}>{authorName}</Heading>
          {authorDescription ? (
            <Paragraph level={4}>{authorDescription}</Paragraph>
          ) : null}
        </div>
      </a>
    );
  };

  MoreResources = () => {
    if (
      !this.moreResources.resources ||
      this.moreResources.resources.length <= 0
    )
      return;

    return [
      <Heading level={4} class="more-resources__title | ui-theme--editorial">
        You might also like...
      </Heading>,
      <more-resources {...this.moreResources} />,
    ];
  };

  PostFeaturedImage = ({
    post,
    preview,
  }: {
    post: BlogData;
    preview: boolean;
  }) => {
    if (!post.featuredImage) return null;

    const imageParts = post.featuredImage?.split('.');
    if (!imageParts || !imageParts[0] || !imageParts[1]) {
      console.log(post);
      return console.error(
        'Markdown Blog featured image name not formatted correctly.  It should look like: what-is-mobile-ci-cd.png',
      );
    }

    const data = {
      name: imageParts[0],
      type: imageParts[1],
      alt: post.featuredImageAlt,
    };

    return (
      <div class="featured-image-wrapper">
        {preview ? (
          <a {...href(`/blog/${post.slug}`)}>
            <ResponsiveImage
              {...data}
              fallback
              onClick={() => {
                window.scrollTo(0, 0);
              }}
              class="featured-image"
              dimensions="1600x840"
              path={'/assets/img/blog'}
            />
          </a>
        ) : (
          <ResponsiveImage
            {...data}
            fallback
            class="featured-image"
            dimensions="1600x840"
            path={'/assets/img/blog'}
          />
        )}
      </div>
    );
  };
}
