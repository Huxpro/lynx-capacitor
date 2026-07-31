import { Component, Host, h } from '@stencil/core';
import { Heading, Paragraph } from '@ionic-internal/ionic-ds';
import { importResource } from '../../utils/common';

declare global {
  interface Window {
    hbspt: {
      forms: {
        create: ({}) => any;
      };
    };
  }
}

@Component({
  tag: 'newsletter-signup',
  styleUrl: 'newsletter-signup.scss',
})
export class NewsletterSignup {
  private uniqueFormId = `id-${Math.random().toString().replace('.', '')}`;
  private hubspotCdn = '//js.hsforms.net/forms/v2.js';

  componentWillLoad() {
    importResource(
      { propertyName: 'hbspt', link: this.hubspotCdn },
      this.createForm,
    );
  }

  disconnectedCallback() {
    const scripts = document.head.querySelectorAll('script');
    scripts.forEach(script => {
      if ((script.src = this.hubspotCdn)) script.remove();
    });
  }

  createForm = () => {
    window.hbspt.forms.create({
      portalId: '3776657',
      formId: 'c8d355e3-a5ad-4f91-a2c0-c9dc93e10658',
      cssClass: '',
      target: `#${this.uniqueFormId}`,
    });
  };

  render() {
    return (
      <Host>
        <div class="wrapper">
          <div class="heading-group">
            <Heading>The latest updates. Delivered monthly.</Heading>
            <Paragraph>
              Capacitor is getting better every day. Sign up for a monthly email
              on the latest updates, releases, articles, and news!
            </Paragraph>
          </div>
          <div class="form-group" id={this.uniqueFormId}></div>
        </div>
      </Host>
    );
  }
}
