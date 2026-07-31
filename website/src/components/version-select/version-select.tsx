import { Component, Host, h, State, Listen } from '@stencil/core';
import Router from '../../router';
import { href } from '@utils/common';

@Component({
  tag: 'version-select',
  styleUrl: 'version-select.scss',
  scoped: true,
})
export class VersionSelect {
  @State() expanded = false;

  @Listen('click', { target: 'window' })
  closeSelect() {
    if (this.expanded) {
      this.expanded = false;
    }
  }

  openSelect = (ev: UIEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.expanded = !this.expanded;
  };

  render() {
    const selectedVersion = Router.path.includes('/v2') ? 2 : 3;
    return (
      <Host role="navigation" aria-label="Documentation Version Selector">
        <a
          {...href('/docs')}
          aria-label={`Version ${selectedVersion}.x Docs`}
          class="version-selected"
          onClick={this.openSelect}
        >
          <span>v{selectedVersion}</span>
          <ion-icon name="chevron-down-outline" />
        </a>
        <div class="version-selector" hidden={!this.expanded}>
          <a
            {...href('/docs/v2')}
            aria-label="Version 2.x Docs"
            class={{ selected: selectedVersion === 2 }}
          >
            <span>v2</span>
            {checkmark()}
          </a>
          <a
            {...href('/docs')}
            aria-label="Version 3.x Docs"
            class={{ selected: selectedVersion === 3 }}
          >
            <span>v3</span>
            {checkmark()}
          </a>
          <a
            href="https://github.com/ionic-team/capacitor/releases"
            target="_blank"
            class="releases"
          >
            <span>All Releases</span>
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.6875 7.5L7.25 0.5M7.25 0.5H2.98437M7.25 0.5V5.05"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
        </div>
      </Host>
    );
  }
}

const checkmark = () => (
  <svg
    width="12"
    height="8"
    viewBox="0 0 12 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11 0.5L4 8.5L1 5.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
