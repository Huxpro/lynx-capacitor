import {
  Component,
  Element,
  Listen,
  Prop,
  ComponentInterface,
  State,
  h,
  Fragment,
} from '@stencil/core';
import { RenderJsxAst } from '@stencil/ssg';
import { DocsData } from '../../data.server/models';
import Router, { docsVersionHref } from '../../router';
import { href } from '@utils/common';

@Component({
  tag: 'docs-component',
  styleUrl: 'docs-component.scss',
  scoped: true,
})
export class DocsComponent implements ComponentInterface {
  menuEl!: HTMLDocsMenuElement;

  @Prop() data: DocsData;

  @State() showBackdrop = false;

  @Element() el;

  @Listen('menuToggleClick')
  toggleMenu() {
    this.menuEl.toggleOverlayMenu();
  }

  @Listen('menuToggled')
  menuToggled(ev: CustomEvent) {
    const isOpen = ev.detail;
    this.showBackdrop = isOpen;
  }

  backdropClicked = () => {
    this.menuEl.toggleOverlayMenu();
  };

  render() {
    const { data, showBackdrop } = this;

    if (!data) {
      return (
        <div class="container">
          <strong>Page Not Found</strong>
        </div>
      );
    }

    return (
      <Fragment>
        <meta-tags
          canonicalUrl={this.data.canonicalUrl}
          page-title={this.data.title}
          description={`${this.data.description} - Official Capacitor Documentation`}
        />
        {/* <capacitor-site-platform-bar
          containerClass="sc-docs-component docs-container"
          productName="Capacitor"
        /> */}
        <div class="row">
          <site-backdrop
            visible={showBackdrop}
            onClick={this.backdropClicked}
          />

          <docs-menu
            ref={el => (this.menuEl = el)}
            template={data.template}
            toc={data.tableOfContents}
            activePath={Router.path}
          />
          <div class="content-wrapper">
            <site-header
              class="docs-container"
              template={data.template}
              includeLogo={false}
              includeBurger
            />
            <div class="app-marked  docs-container">
              <div class="doc-content">
                <div class="measure-lg">
                  <RenderJsxAst
                    ast={data.ast}
                    elementProps={elementRouterHref}
                  />
                  <lower-content-nav navigation={data.navigation} />
                  <contributor-list
                    contributors={data.contributors}
                    editUrl={data.editUrl}
                    editApiUrl={data.editApiUrl}
                  />
                </div>
              </div>

              <in-page-navigation
                headings={data.headings}
                editUrl={data.editUrl}
                editApiUrl={data.editApiUrl}
                url={data.navigation.current.url}
              />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

const elementRouterHref = (tagName: string, props: any) => {
  if (tagName === 'a' && typeof props.href === 'string') {
    const currentHost = new URL(document.baseURI).host;
    const gotoHost = new URL(props.href, document.baseURI).host;

    if (currentHost !== gotoHost) {
      return {
        ...props,
        target: '_blank',
        class: props.class ? `${props.class} external-link` : 'external-link',
        rel: 'noopener',
      };
    }

    return {
      ...props,
      ...href(docsVersionHref(props.href)),
    };
  }
  return props;
};
