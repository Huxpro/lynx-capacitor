import { Build, Component, Element, Host, Prop, h } from '@stencil/core';
import Helmet from '@stencil/helmet';

@Component({
  tag: 'meta-tags',
})
export class MetaTags {
  site = 'https://capacitorjs.com';
  @Prop() pageTitle =
    'Capacitor by Ionic - Cross-platform apps with web technology';
  @Prop() description =
    'Build iOS, Android, and Progressive Web Apps with HTML, CSS, and JavaScript';
  @Prop() image = 'https://capacitorjs.com/assets/img/og.png';
  @Prop() authorTwitter = '@capacitorjs';
  @Prop() ogType = 'website';
  @Prop() canonicalUrl = `${this.site}${location.pathname}`;

  @Element() el;

  render() {
    const prettyTitle =
      this.pageTitle ===
      'Capacitor by Ionic - Cross-platform apps with web technology'
        ? this.pageTitle
        : `${this.pageTitle} - Capacitor`;

    if (!this.el.isConnected || Build.isServer) {
      return <Host></Host>;
    }

    return (
      <Helmet>
        <title>{prettyTitle}</title>
        <meta name="description" content={this.description} />
        <meta property="og:type" content={this.ogType} />
        <meta property="og:title" content={prettyTitle} />
        <meta property="og:description" content={this.description} />
        <meta property="og:image" content={this.image} />
        {/* Fixed domain and strip out hashtags and query strings */}
        <meta property="og:url" content={`${this.site}${location.pathname}`} />
        <meta name="twitter:title" content={prettyTitle} />
        <meta name="twitter:description" content={this.description} />
        <meta name="twitter:image" content={this.image} />
        <meta name="twitter:creator" content={this.authorTwitter} />
        <link rel="canonical" href={this.canonicalUrl} />
      </Helmet>
    );
  }
}
