import { Component, Host, h, Prop, ComponentInterface } from '@stencil/core';

import {
  ResponsiveContainer,
  Heading,
  Paragraph,
} from '@ionic-internal/ionic-ds';

import { SolutionAngular } from './solution-angular';
import { SolutionReact } from './solution-react';
import { SolutionPreact } from './solution-preact';
import { SolutionVue } from './solution-vue';
import { SolutionEmber } from './solution-ember';
import { SolutionSvelte } from './solution-svelte';
import { SolutionStencil } from './solution-stencil';

@Component({
  tag: 'solution-page',
  styleUrl: 'solution-page.scss',
  scoped: true,
})
export class SolutionPage implements ComponentInterface {
  @Prop() solutionId: string;

  framework: {
    id: string;
    name: string;
    theme: string;
    logo: string;
    dimensions: string;
  };
  componentWillLoad() {
    this.framework = solutions.find(entry => entry.id === this.solutionId);
  }
  getComponent() {
    switch (this.solutionId) {
      case 'angular':
        return <SolutionAngular />;
      case 'react':
        return <SolutionReact />;
      case 'preact':
        return <SolutionPreact />;
      case 'vue':
        return <SolutionVue />;
      case 'ember':
        return <SolutionEmber />;
      case 'svelte':
        return <SolutionSvelte />;
      case 'stencil':
        return <SolutionStencil />;
    }
  }
  render() {
    return (
      <Host>
        <meta-tags
          page-title={'Using Capacitor with ' + this.framework.name}
          description={
            'Build iOS, Android, and Progressive Web Apps with ' +
            this.framework.name
          }
        />
        <ResponsiveContainer id="top" as="section">
          <div class="heading-group">
            <img
              width={this.framework.dimensions?.split('x')[0]}
              height={this.framework.dimensions?.split('x')[1]}
              loading="eager"
              src={this.framework.logo}
              alt={this.framework.name}
              class="react"
            />
            <Heading level={2} as="h1">
              {this.framework.name} &amp; Capacitor
            </Heading>
            <Paragraph level={2}>
              Build native mobile apps with web technology and{' '}
              {this.framework.name}
            </Paragraph>
            {/* <Button
              anchor
              href="#install"
              id="get-started"
              style={{ '--button-background': this.framework.theme }}
            >
              Get Started
            </Button> */}
          </div>
        </ResponsiveContainer>

        {this.getComponent()}

        <ResponsiveContainer id="newsletter">
          <newsletter-signup />
        </ResponsiveContainer>

        <pre-footer />
        <capacitor-site-footer />
      </Host>
    );
  }
}

const solutions = [
  {
    id: 'react',
    name: 'React',
    theme: '#3DD3FF',
    logo: '/assets/img/solutions/react.png',
    dimensions: '252x224',
  },
  {
    id: 'vue',
    name: 'Vue',
    theme: '#42b983',
    logo: '/assets/img/solutions/vue.png',
    dimensions: '222x196',
  },
  {
    id: 'preact',
    name: 'Preact',
    theme: '#673ab8',
    logo: '/assets/img/solutions/preact.png',
    dimensions: '256x256',
  },
  {
    id: 'angular',
    name: 'Angular',
    theme: '#DD002E',
    logo: '/assets/img/solutions/angular.png',
    dimensions: '276x276',
  },
  {
    id: 'svelte',
    name: 'Svelte',
    theme: '#FF3D00',
    logo: '/assets/img/solutions/svelte.png',
    dimensions: '228x212',
  },
  {
    id: 'stencil',
    name: 'Stencil',
    theme: '#4c48ff',
    logo: '/assets/img/solutions/stencil.png',
    dimensions: '228x172',
  },
  {
    id: 'ember',
    name: 'Ember',
    theme: '#E04E39',
    logo: '/assets/img/solutions/ember.png',
    dimensions: '297x284',
  },
];
