import { Component, Prop, Host, h } from '@stencil/core';
import type { PageNavigation } from '@stencil/ssg';
import { href } from '@utils/common';

@Component({
  tag: 'lower-content-nav',
  styleUrl: 'lower-content-nav.css',
  scoped: true,
})
export class LowerContentNav {
  @Prop() navigation: PageNavigation;

  render() {
    const n = this.navigation;
    if (!n) {
      return null;
    }
    return (
      <Host role="navigation">
        {n.previous?.url ? (
          <a {...href(n.previous.url)} class="nav-previous link">
            <div class="direction">Previous</div>
            <div>
              <span class="arrow">&lt;- </span>
              <span>{n.previous.title}</span>
            </div>
          </a>
        ) : null}
        {n.next?.url ? (
          <a {...href(n.next.url)} class="nav-next link">
            <div class="direction">Next</div>
            <div>
              <span>{n.next.title}</span>
              <span class="arrow"> -&gt;</span>
            </div>
          </a>
        ) : null}
      </Host>
    );
  }
}
