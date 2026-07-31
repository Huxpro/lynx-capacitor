import { Component, Host, h, Prop, Element, Build } from '@stencil/core';
import { importResource } from 'src/utils/common';

@Component({
  tag: 'code-snippet',
  styleUrl: 'code-snippet.scss',
  shadow: true,
})
export class CodeSnippet {
  @Element() elm: HTMLElement;
  @Prop() language: string;
  @Prop() code!: string;

  // use an exact version so the cdn response is heavily cached
  private static prismCdn = `https://cdn.jsdelivr.net/npm/prismjs@1.21.0`;
  private codeEl: HTMLElement;

  componentWillLoad() {
    importResource(
      { propertyName: 'Prism', link: `${CodeSnippet.prismCdn}/prism.min.js` },
      this.loadInPrismLanguage,
    );
  }

  loadInPrismLanguage = () => {
    importResource(
      {
        propertyName: `Prism.languages.${this.language}`,
        link: `${CodeSnippet.prismCdn}/components/prism-${this.language}.min.js`,
      },
      this.highlightCode,
    );
  };

  highlightCode = async () => {
    if (Build.isServer) return;

    await customElements.whenDefined('code-snippet');

    window.Prism.hooks.add('before-insert', env => {
      switch (env.language) {
        case 'shell-session':
          const lines = env.code.split('\n');

          const code = lines.map(line => {
            return line.trim() === '' || line.trim()[0] === '#'
              ? `<span class="token output">${line}</span>\n`
              : `<span class="dollar-sign token output">${line}</span>\n`;
          });
          env.highlightedCode = code.join('');
          break;
        default:
      }
    });

    window.Prism.highlightElement(this.codeEl, false);
  };

  render() {
    if (!this.code) {
      return null;
    }
    return (
      <Host>
        <pre class={`language-${this.language}`}>
          <code ref={e => (this.codeEl = e)}>{this.code.trim()}</code>
        </pre>
      </Host>
    );
  }
}
