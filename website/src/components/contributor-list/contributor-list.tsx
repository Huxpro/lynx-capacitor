import { Button } from '@ionic-internal/ionic-ds';
import { Component, Prop, Host, h } from '@stencil/core';

@Component({
  tag: 'contributor-list',
  styleUrl: 'contributor-list.css',
})
export class ContributorList {
  @Prop() contributors: string[];
  @Prop() editUrl: string;
  @Prop() editApiUrl: string;

  render() {
    const c = this.contributors;

    return (
      <Host>
        {c?.length > 0 && (
          <ul class="img-list">
            {c.reverse().map(contributor => (
              <li>
                <a
                  class="contributor-img"
                  target="_blank"
                  href={`https://github.com/${contributor}`}
                >
                  <img
                    src={`https://github.com/${contributor}.png?size=90`}
                    title={`Contributor ${contributor}`}
                    loading="lazy"
                  />
                </a>
              </li>
            ))}
          </ul>
        )}
        {this.editUrl && (
          <Button
            anchor
            href={this.editUrl}
            target="_blank"
            rel="noopener"
            size="md"
            kind="round"
            color="cyan"
            variation="muted"
          >
            Contribute
            <span class="arrow"> -&gt;</span>
          </Button>
        )}
        {/* {this.editApiUrl && (
          <Button
            anchor
            href={this.editApiUrl}
            target="_blank"
            rel="noopener"
            size="md"
            kind="round"
            color="cyan"
            variation="muted"
          >
            API Edit
            <span class="arrow"> -&gt;</span>
          </Button>
        )} */}
      </Host>
    );
  }
}
