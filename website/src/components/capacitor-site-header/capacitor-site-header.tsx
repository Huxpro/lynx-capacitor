import {
  Element,
  Component,
  ComponentInterface,
  Host,
  Prop,
  State,
  h,
} from '@stencil/core';
import { href } from '@utils/common';
import Router, { docsVersionHref } from '../../router';
import { Button } from '@ionic-internal/ionic-ds';
import { JSXBase } from '@stencil/core/internal';
import { DocsTemplate } from 'src/data.server/models';
import { Translation } from '../../icons';

@Component({
  tag: 'site-header',
  styleUrl: 'capacitor-site-header.scss',
  scoped: true,
})
export class SiteHeader implements ComponentInterface {
  @Element() elm: HTMLElement;
  @Prop() template: DocsTemplate;
  @Prop() includeLogo = true;
  @Prop() includeBurger = false;
  @Prop() theme: 'light' | 'dark' = 'light';
  @Prop() sticky = true;

  @State() collapsed = false;
  @State() expanded = false;
  @State() scrolled = false;

  private routeListener = Symbol();
  private links: { [key: string]: HTMLElement } = {};
  // Could be an announcement banner or platform bar
  private heightAboveBar = 72;

  componentWillLoad() {
    this.createHeaderObserver();
    this.createRouteListener();
  }

  createHeaderObserver() {
    const opts = {
      root: document.body,
      rootMargin: `-${this.heightAboveBar + 1}px 0px 0px 0px`,
      threshold: 1.0,
    };

    const observer = new IntersectionObserver(entries => {
      this.scrolled = !(entries[0].intersectionRatio < 1);
    }, opts);

    observer.observe(this.elm);
  }

  createRouteListener() {
    if (window.hasOwnProperty(this.routeListener)) return;

    window[this.routeListener] = true;
    Router.on('change', this.handleActive);
  }

  handleActive = (url: URL) => {
    const activeRoute = url.pathname.split('/')[1];

    for (const [key, value] of Object.entries(this.links)) {
      if (key === activeRoute) {
        value.classList.add('active');
      } else {
        value.classList.remove('active');
      }
    }
  };

  isActive(path: string): boolean {
    const prefix = new RegExp('^' + path, 'gm');
    const regexRes = prefix.test(Router.path);

    return regexRes;
  }

  toggleExpanded = () => (this.expanded = !this.expanded);

  render() {
    const { expanded, template, includeLogo, includeBurger } = this;

    return (
      <Host
        class={{
          scrolled: this.scrolled,
          [`theme--${this.theme}`]: true,
          sticky: this.sticky,
        }}
      >
        <site-backdrop
          visible={expanded}
          onClick={() => this.toggleExpanded()}
          mobileOnly
        />

        <header>
          {includeBurger ? <app-menu-toggle /> : null}

          {includeLogo ? (
            <a {...href('/')} aria-label="homepage link">
              {capacitorLogo()}
            </a>
          ) : null}

          {/* <div class="jobs-wrapper">
            <a
              class="jobs"
              href="https://ionic.io/about/jobs#positions"
              target="_blank"
              rel="noopener"
            >
              <svg
                width="12"
                height="12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="sparkle"
              >
                <g clip-path="url(#clip0)" fill="#D0FDFF">
                  <path d="M4.4 2.9a.65.65 0 011.22 0l.8 2.25c.07.18.22.33.4.4l2.25.8a.65.65 0 010 1.22l-2.25.8a.65.65 0 00-.4.4l-.8 2.25a.65.65 0 01-1.22 0l-.8-2.25a.65.65 0 00-.4-.4l-2.25-.8a.65.65 0 010-1.22l2.25-.8c.18-.07.33-.22.4-.4l.8-2.25zM9.04 1.2c.15-.4.72-.4.87 0l.29.81c.04.13.14.23.27.28l.8.29c.41.14.41.72 0 .87l-.8.28a.46.46 0 00-.27.28l-.3.8c-.14.41-.71.41-.86 0l-.29-.8a.46.46 0 00-.28-.28l-.8-.28a.46.46 0 010-.87l.8-.3a.46.46 0 00.28-.27l.29-.8zM1.5.48c.1-.3.5-.3.6 0l.24.65c.03.1.1.16.2.2l.65.23c.29.1.29.5 0 .61l-.65.24c-.1.03-.17.1-.2.2l-.23.65c-.1.28-.51.28-.62 0l-.23-.66a.32.32 0 00-.2-.2l-.65-.23a.32.32 0 010-.6l.65-.24c.1-.04.17-.1.2-.2l.23-.65z" />
                </g>
                <defs>
                  <clipPath id="clip0">
                    <path fill="#fff" d="M0 0h12v12H0z" />
                  </clipPath>
                </defs>
              </svg>
              We're hiring
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="ionicon arrow"
                width="14"
                height="12"
                viewBox="0 0 512 512"
              >
                <title>Arrow Forward</title>
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="48"
                  d="M268 112l144 144-144 144M392 256H100"
                />
              </svg>
            </a>
          </div> */}

          <div class="docs-search-wrapper desktop-only">
            <docs-search theme={this.theme} />
          </div>

          <a
            {...href(docsVersionHref('/docs'))}
            class={{
              'ui-paragraph-4': true,
              'active': template === 'docs',
            }}
          >
            Docs
          </a>
          <a
            {...href(docsVersionHref('/docs/plugins'))}
            class={{
              'ui-paragraph-4': true,
              'active': template === 'plugins',
            }}
          >
            Plugins
          </a>
          <a
            {...href(docsVersionHref('/docs/cli'))}
            class={{
              'ui-paragraph-4': true,
              'active': template === 'cli',
            }}
          >
            CLI
          </a>
          <a
            {...href('/lynx-capacitor')}
            class="ui-paragraph-4"
          >
            Lynx Capacitor
          </a>

          <div class="separator desktop-only"></div>

          <nav
            class={{
              routes: true,
              expanded: this.expanded,
            }}
          >
            <div class="routes__header">
              <a aria-label="homepage link" class="logo-wrapper" {...href('/')}>
                {capacitorLogo()}
              </a>
              <button class="close" aria-label="close">
                <svg
                  onClick={this.toggleExpanded}
                  width="10"
                  height="10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 9L1 1M9 1L1 9"
                    stroke="#B2BECD"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div class="docs-search-wrapper mobile-only">
              <docs-search />
            </div>
            <a
              {...href('/community')}
              class="ui-paragraph-4"
              ref={el => (this.links.community = el)}
            >
              Community
            </a>
            <a
              {...href('https://ionic.io/blog/tag/capacitor')}
              class="ui-paragraph-4"
              ref={el => (this.links.blog = el)}
            >
              Blog
            </a>
            <a
              {...href('/enterprise')}
              class="ui-paragraph-4"
              ref={el => (this.links.enterprise = el)}
            >
              Enterprise
            </a>
            <a
              {...href('/lynx-capacitor')}
              class="ui-paragraph-4"
              ref={el => (this.links['lynx-capacitor'] = el)}
            >
              Lynx Capacitor
            </a>
          </nav>

          <div class="separator desktop-only"></div>

          <more-button onClick={() => this.toggleExpanded()} />

          <div class="ctas">
            <docs-dropdown
              icon={Translation}
              align="right"
              class="label-sm-only"
            >
              <section>
                <a href="https://capacitorjs.com/" class="link-active">
                  English
                  <svg viewBox="0 0 512 512" width="14">
                    <path d="M186.301 339.893L96 249.461l-32 30.507L186.301 402 448 140.506 416 110z"></path>
                  </svg>
                </a>
                <a href="https://capacitorjs.jp/" target="_blank">
                  日本語
                </a>
              </section>
            </docs-dropdown>

            <a
              href="https://github.com/ionic-team/capacitor"
              target="_blank"
              rel="noopener"
            >
              <svg
                class="social"
                width="16"
                height="16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 0a8.1 8.1 0 0 0-8 8.2c0 3.63 2.3 6.7 5.47 7.79l.14.01c.3 0 .4-.22.4-.4v-1.4c-.3.06-.57.1-.81.1-1.54 0-1.89-1.2-1.89-1.2-.36-.95-.89-1.2-.89-1.2-.7-.5 0-.5.05-.5.8.06 1.23.84 1.23.84.4.7.94.9 1.41.9.38 0 .72-.12.92-.21.07-.53.28-.9.5-1.1-1.77-.2-3.64-.91-3.64-4.05 0-.9.31-1.63.82-2.2-.08-.21-.35-1.05.08-2.18l.18-.01c.3 0 .94.1 2.02.86a7.5 7.5 0 0 1 4.01 0c1.08-.75 1.73-.86 2.02-.86l.18.01c.44 1.13.16 1.97.08 2.18.5.57.82 1.3.82 2.2 0 3.15-1.87 3.84-3.65 4.04.28.25.54.75.54 1.52l-.01 2.25c0 .2.1.41.4.41l.15-.01A8.19 8.19 0 0 0 16 8.2 8.1 8.1 0 0 0 8 0Z"
                  fill="#B2BECD"
                />
              </svg>
            </a>
            <a
              href="https://ionic.link/discord"
              target="_blank"
              rel="noopener"
              title="discord link"
            >
              <svg
                class="social"
                width="20"
                height="16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.93 1.33A15.93 15.93 0 0 0 12.86 0c-.03 0-.05 0-.07.03-.17.33-.37.76-.5 1.1a14.52 14.52 0 0 0-4.57 0A11.3 11.3 0 0 0 7.2.03.06.06 0 0 0 7.14 0a15.89 15.89 0 0 0-4.1 1.35 18.4 18.4 0 0 0-2.93 12 16.3 16.3 0 0 0 5 2.65c.02 0 .05 0 .06-.03.39-.55.73-1.13 1.02-1.74a.07.07 0 0 0-.03-.1 10.7 10.7 0 0 1-1.56-.77.07.07 0 0 1 0-.12l.3-.25a.06.06 0 0 1 .07-.01 11.32 11.32 0 0 0 10.05 0h.06c.1.1.21.18.32.26.03.03.03.1-.01.12-.5.3-1.02.56-1.56.78a.07.07 0 0 0-.04.09c.3.6.65 1.2 1.03 1.74.01.03.04.04.07.03a16.24 16.24 0 0 0 5.02-2.7 18.26 18.26 0 0 0-2.98-11.97ZM6.68 10.9c-.98 0-1.8-.95-1.8-2.11 0-1.17.8-2.12 1.8-2.12 1.01 0 1.82.96 1.8 2.12 0 1.16-.8 2.11-1.8 2.11Zm6.65 0c-.99 0-1.8-.95-1.8-2.11 0-1.17.8-2.12 1.8-2.12s1.81.96 1.8 2.12c0 1.16-.8 2.11-1.8 2.11Z"
                  fill="#B2BECD"
                />
              </svg>
            </a>
            <a
              href="https://twitter.com/capacitorjs"
              target="_blank"
              rel="noopener"
            >
              <svg
                class="social"
                width="18"
                height="16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 1.9c-.66.32-1.37.53-2.12.63A4 4 0 0 0 17.5.3c-.7.46-1.5.8-2.34.98A3.55 3.55 0 0 0 12.46 0c-2.04 0-3.7 1.8-3.7 4.04 0 .31.04.62.1.92A10.2 10.2 0 0 1 1.26.74 4.33 4.33 0 0 0 2.4 6.13a3.38 3.38 0 0 1-1.68-.5v.04a3.97 3.97 0 0 0 2.96 3.96 3.42 3.42 0 0 1-1.66.07 3.76 3.76 0 0 0 3.45 2.8A7.02 7.02 0 0 1 0 14.18 9.7 9.7 0 0 0 5.65 16c6.8 0 10.52-6.15 10.52-11.5L16.16 4A7.94 7.94 0 0 0 18 1.89Z"
                  fill="#B2BECD"
                />
              </svg>
            </a>
            <Button
              class="primary | ui-paragraph-4"
              anchor
              {...href('/docs/getting-started')}
              kind="regular"
              color="cyan"
              size="md"
            >
              <svg
                width="10"
                height="12"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 400 520.31"
              >
                <path
                  fill="#fff"
                  d="M179.5 167.9l-.2 167.9-57.76-55.44-57.76-55.43-1.72 1.8L48.1 241.3c-6.73 7.03-12.13 13.03-12 13.34.41 1 163.29 157.08 163.92 157.08.62 0 163.46-156.09 163.88-157.09.13-.3-5.27-6.3-12-13.33l-13.96-14.58-1.72-1.8-57.76 55.44-57.76 55.44-.2-167.9L220.3 0h-40.6l-.2 167.9M0 479.69V500h400v-40.62H0v20.3"
                  fill-rule="evenodd"
                ></path>
              </svg>
              Install
            </Button>
          </div>
        </header>
      </Host>
    );
  }
}

const capacitorLogo = (props?: JSXBase.SVGAttributes) => (
  <svg
    class="capacitor-logo"
    width="130"
    height="24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M55.36 6.03v12.84h-3.22V17.3c-.8 1.17-2.26 1.86-4.08 1.86-3.73 0-5.92-2.99-5.92-6.7 0-3.73 2.19-6.72 5.92-6.72 1.82 0 3.26.69 4.08 1.87V6.04h3.22zM48.8 8.81c-1.94 0-3.17 1.56-3.17 3.64 0 2.09 1.23 3.65 3.17 3.65s3.16-1.56 3.16-3.65c.01-2.08-1.21-3.64-3.16-3.64zM60.1 23.2h-3.49V6.05h3.22v1.57c.8-1.17 2.26-1.87 4.08-1.87 3.73 0 5.92 3 5.92 6.71 0 3.73-2.19 6.71-5.92 6.71a4.73 4.73 0 01-3.8-1.66v5.7zm3.07-7.1c1.94 0 3.17-1.56 3.17-3.65 0-2.08-1.23-3.64-3.17-3.64S60 10.37 60 12.45c0 2.09 1.22 3.65 3.17 3.65zM83.76 6.03v12.84h-3.22V17.3c-.8 1.17-2.26 1.86-4.08 1.86-3.73 0-5.92-2.99-5.92-6.7 0-3.73 2.18-6.72 5.92-6.72 1.82 0 3.26.69 4.08 1.87V6.04h3.22zM77.2 8.81c-1.94 0-3.17 1.56-3.17 3.64 0 2.09 1.23 3.65 3.17 3.65s3.16-1.56 3.16-3.65c.01-2.08-1.21-3.64-3.16-3.64zM37.92 14.16c-.41 1.11-1.45 1.73-2.73 1.73a3.4 3.4 0 01-3.39-3.44 3.4 3.4 0 013.4-3.43c1.27 0 2.27.54 2.72 1.73h3.5a6.12 6.12 0 00-6.23-5c-3.7 0-6.66 3-6.66 6.7 0 3.71 2.95 6.71 6.66 6.71 3.12 0 5.82-2.19 6.24-5h-3.5zM93.86 14.16c-.41 1.11-1.45 1.73-2.73 1.73a3.4 3.4 0 01-3.38-3.44 3.4 3.4 0 013.38-3.43c1.28 0 2.29.54 2.74 1.73h3.5a6.12 6.12 0 00-6.24-5c-3.7 0-6.66 3-6.66 6.7 0 3.71 2.96 6.71 6.66 6.71 3.12 0 5.82-2.19 6.24-5h-3.5zM97.78 2.9c0-1.22.89-2.1 2.11-2.1 1.23 0 2.12.88 2.12 2.1 0 1.23-.89 2.08-2.12 2.08a2.02 2.02 0 01-2.1-2.08zm.37 3.13h3.49v12.84h-3.5V6.03zM102.95 6.03V2.85h3.49v3.18h2.68v2.84h-2.68v10h-3.5V8.79"
      fill="#000"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M115.34 15.9a3.44 3.44 0 100-6.89 3.44 3.44 0 000 6.88zm0 3.26a6.71 6.71 0 100-13.42 6.71 6.71 0 000 13.42z"
      fill="#000"
    />
    <path
      d="M129.96 9.2s-.36-.07-.67-.07c-2.02 0-3.06 1-3.06 3.36v6.4h-3.46V6.02h3.19V7.7c.46-.76 1.43-1.78 3.59-1.78l.41.03V9.2z"
      fill="#000"
    />
    <path
      d="M3.74 5.07L.03 8.8l5.72 5.73L0 20.3 3.7 24l5.76-5.77 5.72 5.73 3.71-3.71L3.74 5.07z"
      fill="#53B9FF"
    />
    <path
      d="M13.17 14.52l-3.71 3.71 5.72 5.73 3.71-3.71-5.72-5.73z"
      fill="#119EFF"
    />
    <path
      d="M13.17 14.52l-3.71 3.71 1.43 1.43 2.28-5.14z"
      fill="#000"
      fill-opacity=".2"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M18.24 9.47L24 3.7 20.29 0l-5.76 5.75L8.8.03 5.1 3.74l15.15 15.18 3.7-3.72-5.7-5.73z"
      fill="#53B9FF"
    />
    <path d="M10.81 9.47l3.72-3.72L8.8.03 5.1 3.74l5.71 5.73z" fill="#119EFF" />
    <path
      d="M10.81 9.47l3.72-3.72-1.43-1.42-2.29 5.14z"
      fill="#000"
      fill-opacity=".2"
    />
  </svg>
);
