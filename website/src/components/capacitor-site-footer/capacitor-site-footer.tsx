import { Component, Host, h } from '@stencil/core';
import {
  ResponsiveContainer,
  Grid,
  Col,
  Heading,
  Paragraph,
} from '@ionic-internal/ionic-ds';
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
  tag: 'capacitor-site-footer',
  styleUrl: 'capacitor-site-footer.scss',
})
export class CapacitorSiteFooter {
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
        <footer>
          <ResponsiveContainer>
            <div class="newsletter">
              <div>
                <Heading level={4}>Join our Newsletter</Heading>
                <Paragraph level={4}>
                  Keep up to date with all the latest Capacitor news and updates
                </Paragraph>
              </div>
              <div class="form-group" id={this.uniqueFormId}></div>
            </div>
            <Grid>
              <Col md={6} sm={4} xs={12} cols={12} class="copyright">
                <img
                  src="/assets/img/logo-white2.png"
                  alt="Capacitor Logo"
                  class="logo"
                  width="212"
                  height="40"
                  loading="lazy"
                />
                <p>© {new Date().getFullYear()} Capacitor</p>
                <p>
                  <a href="https://ionic.io">Ionic Open Source</a> | Released
                  under <span id="mit">MIT License</span>
                </p>
              </Col>
              <Col md={6} sm={8} xs={12} cols={12}>
                <div class="routes-group">
                  <div>
                    <Heading level={5}>Developers</Heading>
                    <ul class="routes">
                      <li>
                        <a class="ui-paragraph-4" href="/docs/getting-started">
                          Install
                        </a>
                      </li>
                      <li>
                        <a class="ui-paragraph-4" href="/docs">
                          Docs
                        </a>
                      </li>
                      <li>
                        <a class="ui-paragraph-4" href="/docs/apis">
                          Plugins
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <Heading level={5}>Resources</Heading>
                    <ul class="routes">
                      <li>
                        <a class="ui-paragraph-4" href="/community">
                          Community
                        </a>
                      </li>
                      <li>
                        <a
                          class="ui-paragraph-4"
                          href="https://ionic.io/blog/tag/capacitor"
                        >
                          Blog
                        </a>
                      </li>
                      <li>
                        <a
                          class="ui-paragraph-4"
                          href="https://github.com/ionic-team/capacitor/discussions"
                        >
                          Discussions
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <Heading level={5}>Connect</Heading>
                    <ul class="routes">
                      <li>
                        <a
                          class="ui-paragraph-4"
                          href="https://github.com/ionic-team/capacitor"
                        >
                          GitHub
                        </a>
                      </li>
                      <li>
                        <a
                          class="ui-paragraph-4"
                          href="https://twitter.com/capacitorjs"
                        >
                          Twitter
                        </a>
                      </li>
                      <li>
                        <a class="ui-paragraph-4" href="https://ionic.io">
                          Ionic
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </Col>
            </Grid>
          </ResponsiveContainer>
        </footer>
      </Host>
    );
  }
}
