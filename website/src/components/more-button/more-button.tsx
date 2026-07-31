import { Component, Prop, h, Host } from '@stencil/core';

@Component({
  tag: 'more-button',
  styleUrl: 'more-button.scss',
})
export class MoreButton {
  @Prop() icon = 'ellipsis-vertical';

  render() {
    const { icon } = this;

    return (
      <Host>
        <button>
          <ion-icon icon={icon} />
        </button>
      </Host>
    );
  }
}
