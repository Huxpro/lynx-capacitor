import { Component, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'blog-forum-link',
  styleUrl: 'blog-forum-link.scss',
  scoped: true,
})
export class BlogForumLink {
  @Prop() href?: string;

  render() {
    return (
      <Host>
        <a href={this.href} class="ui-heading-4 link">
          <slot />
          <span class="arrow">-&gt;</span>
        </a>
      </Host>
    );
  }
}
