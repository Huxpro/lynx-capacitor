import { Component, Host, h, Prop } from '@stencil/core';

import {
  Heading,
  Paragraph,
  ResponsiveContainer,
} from '@ionic-internal/ionic-ds';
import { BlogData } from 'src/data.server/blog';
import Helmet from '@stencil/helmet';

@Component({
  tag: 'blog-page',
  styleUrl: 'blog-page.scss',
  scoped: true,
})
export class BlogPage {
  @Prop() data: BlogData[];

  Helmet = () => (
    <Helmet>
      <title>Capacitor Blog</title>
      <meta name="description" content={'Capacitor Blog'} />
      <meta name="twitter:description" content={`Capacitor Blog`} />
      <meta
        name="twitter:image"
        content="https://capacitorjs.com/assets/img/og.png"
      />
      <meta
        property="og:image"
        content="https://capacitorjs.com/assets/img/og.png"
      />
    </Helmet>
  );

  render() {
    if (!this.data) console.error('No blog posts received');

    return (
      <Host>
        {/* <blog-subnav breadcrumbs={[['Blog', '/blog']]} /> */}
        <Helmet />
        <ResponsiveContainer>
          <div class="heading-group">
            <Heading level={2} as="h1">
              Capacitor Blog
            </Heading>
            <Paragraph level={2}>
              Articles by the Capacitor team and community
            </Paragraph>
          </div>
          <div class="content">
            {this.data?.map((d, i) => (
              <article key={i}>
                <blog-post data={d} preview={true} />
              </article>
            ))}
            {/* <blog-pagination rssIcon /> */}
            <blog-newsletter />
          </div>
        </ResponsiveContainer>
      </Host>
    );
  }
}
