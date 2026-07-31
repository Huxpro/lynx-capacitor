import { Component, h, Host, Prop } from '@stencil/core';
import { JSXBase } from '@stencil/core/internal';

@Component({
  tag: 'blog-pagination',
  styleUrl: 'blog-pagination.scss',
  scoped: true,
})
export class BlogPagination {
  @Prop() linkText: [string, string] = ['Older posts', 'Newer posts'];
  @Prop() rssIcon: boolean = false;

  render = () => (
    <Host>
      <a href="#" class="link back ui-paragraph-3">
        <ion-icon name="chevron-back-outline"></ion-icon>
        {this.linkText[0]}
      </a>
      {this.rssIcon ? rssIcon({}, { height: 32, width: 32 }) : ''}
      <a href="#" class="link forward ui-paragraph-3">
        {this.linkText[1]}
        <ion-icon name="chevron-forward-outline"></ion-icon>
      </a>
    </Host>
  );
}

const rssIcon = (
  { main = '#E3EDFF', second = '#597EFF' } = {},
  props?: JSXBase.SVGAttributes,
) => (
  <svg viewBox="0 0 32 32" {...props}>
    <circle fill={main} cx="16" cy="16" r="16" />
    <path
      fill={second}
      d="M11.139 18.861a2 2 0 00-1.996 1.993c0 1.1.896 1.986 1.996 1.986a1.99 1.99 0 001.996-1.986 1.997 1.997 0 00-1.996-1.993z"
    />
    <path
      fill={second}
      d="M9.143 13.714v2.854c1.714 0 3.36.507 4.571 1.718 1.21 1.21 1.714 2.853 1.714 4.571h2.857c0-4.996-4.142-9.143-9.142-9.143z"
    />
    <path
      fill={second}
      d="M9.143 9.143v2.853c6.107 0 10.853 4.75 10.853 10.861h2.86c0-7.56-6.142-13.714-13.713-13.714z"
    />
  </svg>
);
