import { Component, Prop, h, getAssetPath } from '@stencil/core';
@Component({
  tag: 'plugin-platforms',
  styleUrl: 'plugin-platforms.scss',
  assetsDirs: ['assets'],
})
export class PluginPlatforms {
  @Prop() platforms: string = '';

  render() {
    const platforms = this.platforms.split(',');
    return (
      <div class="platforms">
        {platforms.map(platform => {
          return (
            <img
              src={`${getAssetPath(
                './assets/plugin-platforms/img/',
              )}${platform}@2x.png`}
              alt={`${platform}`}
              title={`${platform}`}
              width="32"
              height="32"
            />
          );
        })}
      </div>
    );
  }
}
