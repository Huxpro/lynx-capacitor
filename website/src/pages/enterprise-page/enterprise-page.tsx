import { Component, h, Host, Prop } from '@stencil/core';
import {
  ResponsiveContainer,
  Heading,
  Button,
  PrismicRichText,
  PrismicResponsiveImage,
  Paragraph,
} from '@ionic-internal/ionic-ds';
import { getAssetPath, State } from '@stencil/core/internal';
import { firstOf } from '../../utils/prismic-safety';

@Component({
  tag: 'enterprise-page',
  styleUrl: 'enterprise-page.scss',
  scoped: true,
  assetsDirs: ['./assets-enterprise-page'],
})
export class EnterprisePage {
  @Prop() data: any;
  @State() ebookModalOpen = false;

  render() {
    const {
      Top,
      Companies,
      Native,
      Ebook,
      MicroFrontends,
      Plugins,
      Security,
      Delivery,
      SupportGuidance,
      Features,
      Demo,
      Editions,
    } = this;

    return (
      <Host>
        <meta-tags />
        <enterprise-subnav />
        <Top />
        <Companies />
        <Native />
        <Ebook />
        {/* <Approach /> */}
        <MicroFrontends />
        <Plugins />
        <Security />
        <Delivery />
        <SupportGuidance />
        <Features />
        <Editions />
        <Demo />
        <pre-footer />
        <capacitor-site-footer />
      </Host>
    );
  }

  Top = () => {
    const { top } = this.data;
    const { title, text, cta_1, background } = firstOf(top);

    return (
      <section id="top">
        <PrismicResponsiveImage image={background} class="background" />
        <ResponsiveContainer>
          <div class="heading-group">
            <Heading level={1}>{title}</Heading>
            <Paragraph level={2}>{text}</Paragraph>
            <div class="cta-row">
              <Button anchor href="#demo" kind="round">
                {cta_1}
                <span class="arrow"> -&gt;</span>
              </Button>
              {/* <a href="https://ionic.io/contact/sales" class="link btn-link">
                {cta_2}
                <span class="arrow"> -&gt;</span>
              </a> */}
            </div>
          </div>
        </ResponsiveContainer>
      </section>
    );
  };

  Companies = () => {
    const { companies } = this.data;

    const companies__list = [
      ['nationwide', '34x42'],
      ['target', '31x42'],
      ['burger-king', '32x36'],
      ['home-depot', '34x34'],
      ['nbc', '51x30'],
      ['microsoft', '35x35'],
      ['amtrak', '58x25'],
      ['general-electric', '35x35'],
    ];

    return (
      <section id="companies">
        <ResponsiveContainer>
          <Heading level={2}>{companies}</Heading>
          <div class="logos">
            <div class="row1">
              {companies__list.slice(0, 4).map((stats, i) => (
                <img
                  width={stats[1].split('x')[0]}
                  height={stats[1].split('x')[1]}
                  src={getAssetPath(
                    `./assets-enterprise-page/companies/${i}@2x.png`,
                  )}
                  loading="lazy"
                  alt={`${stats[0]} logo`}
                />
              ))}
            </div>
            <div class="row2">
              {companies__list.slice(0, 4).map((stats, i) => (
                <img
                  width={stats[1].split('x')[0]}
                  height={stats[1].split('x')[1]}
                  src={getAssetPath(
                    `./assets-enterprise-page/companies/${
                      i + companies__list.length / 2
                    }@2x.png`,
                  )}
                  loading="lazy"
                  alt={`${stats[0]} logo`}
                />
              ))}
            </div>
          </div>
        </ResponsiveContainer>
      </section>
    );
  };

  Native = () => {
    const { native, native__list } = this.data;
    const { supertext, title, subtext } = firstOf(native);

    const icons = [
      ['three blocks with up arrow', '64x64'],
      ['fingerprint icon with lock symbol', '76x64'],
      ['clock icon with up arrow', '64x64'],
    ];

    return (
      <ResponsiveContainer id="native" as="section">
        <div class="heading-group">
          <p class="ui-heading-6">
            <sup>{supertext}</sup>
          </p>
          <PrismicRichText richText={title} />
          <Paragraph level={2}>{subtext}</Paragraph>
        </div>
        <ul class="list">
          {native__list.map(({ title, text }, i) => (
            <li key={icons[i][0]}>
              <img
                width={icons[i][1].split('x')[0]}
                height={icons[i][1].split('x')[1]}
                src={getAssetPath(
                  `./assets-enterprise-page/native/${i}@2x.png`,
                )}
                loading="lazy"
              />
              <Heading level={4} as="h3">
                {title}
              </Heading>
              <Paragraph leading="prose">{text}</Paragraph>
            </li>
          ))}
        </ul>
      </ResponsiveContainer>
    );
  };

  Ebook = () => {
    const { ebook } = this.data;
    const { text, cta, background, book } = firstOf(ebook);

    return (
      <section id="ebook">
        <ResponsiveContainer>
          <site-modal
            open={this.ebookModalOpen}
            onModalClose={() => (this.ebookModalOpen = false)}
          >
            <Heading level={2}>
              Building Cross-platform Apps with Capacitor
            </Heading>
            <hubspot-form formId="9151dc0b-42d9-479f-b7b8-649e0e7bd1bc" />
          </site-modal>
          <div class="wrapper">
            <PrismicResponsiveImage image={background} class="background" />
            <div class="content">
              <div class="image-wrapper">
                <PrismicResponsiveImage image={book} />
              </div>
              <div class="heading-group">
                <PrismicRichText paragraphLevel={1} richText={text} />
                <Button
                  kind="round"
                  size="md"
                  onClick={() => (this.ebookModalOpen = true)}
                >
                  {cta} <span class="arrow"> -&gt;</span>
                </Button>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </section>
    );
  };

  // Approach = () => {
  //   const {
  //     approach,
  //     approach_traditional,
  //     approach_traditional__list,
  //     approach_web,
  //     approach_web__list,
  //   } = this.data;
  //   const { supertext, title } = approach[0];

  //   return (
  //     <section id="approach">
  //       <ResponsiveContainer>
  //         <div class="heading-group">
  //           <p class="ui-heading-6">
  //             <sup>{supertext}</sup>
  //           </p>
  //           <PrismicRichText richText={title} />
  //         </div>
  //         <div class="split">
  //           <article class="traditional column">
  //             <Heading>{approach_traditional[0]['title']}</Heading>
  //             <Paragraph>{approach_traditional[0]['text']}</Paragraph>
  //             <PrismicResponsiveImage
  //               image={approach_traditional[0]['image']}
  //             />
  //             <div class="list">
  //               <Heading level={4}>
  //                 {approach_traditional[0]['subtitle']}
  //               </Heading>
  //               <ul>
  //                 {approach_traditional__list.map(({ text, icon }) => (
  //                   <li>
  //                     <PrismicResponsiveImage image={icon} />
  //                     <Paragraph>{text}</Paragraph>
  //                   </li>
  //                 ))}
  //               </ul>
  //             </div>
  //           </article>
  //           <article class="web column">
  //             <Heading>{approach_web[0]['title']}</Heading>
  //             <Paragraph>{approach_web[0]['text']}</Paragraph>
  //             <PrismicResponsiveImage image={approach_web[0]['image']} />
  //             <div class="list">
  //               <Heading level={4}>{approach_web[0]['subtitle']}</Heading>
  //               <ul>
  //                 {approach_web__list.map(({ text, icon }) => (
  //                   <li>
  //                     <PrismicResponsiveImage image={icon} />
  //                     <Paragraph>{text}</Paragraph>
  //                   </li>
  //                 ))}
  //               </ul>
  //             </div>
  //           </article>
  //         </div>
  //       </ResponsiveContainer>
  //     </section>
  //   );
  // };

  MicroFrontends = () => {
    const { micro_frontends } = this.data;
    const { supertext, title, subtext, image } = firstOf(micro_frontends);

    return (
      <section id="micro-frontends">
        <ResponsiveContainer>
          <div class="wrapper">
            <div class="image-wrapper">
              <PrismicResponsiveImage image={image} />
            </div>
            <div class="heading-group">
              <p class="ui-heading-6">
                <sup>{supertext}</sup>
              </p>
              <PrismicRichText richText={title} />
              <PrismicRichText richText={subtext} paragraphLevel={2} />
            </div>
          </div>
        </ResponsiveContainer>
      </section>
    );
  };

  Plugins = () => {
    const { plugins } = this.data;
    const { supertext, title, subtext, image } = firstOf(plugins);

    return (
      <section id="plugins">
        <ResponsiveContainer>
          <div class="wrapper">
            <div class="heading-group">
              <p class="ui-heading-6">
                <sup>{supertext}</sup>
              </p>
              <PrismicRichText richText={title} />
              <Paragraph level={2}>{subtext}</Paragraph>
            </div>
            <div class="image-wrapper">
              <PrismicResponsiveImage image={image} />
            </div>
          </div>
        </ResponsiveContainer>
      </section>
    );
  };

  Security = () => {
    const { security } = this.data;
    const { supertext, title, subtext, image } = firstOf(security);

    return (
      <section id="security">
        <ResponsiveContainer>
          <div class="wrapper">
            <div class="image-wrapper">
              <PrismicResponsiveImage image={image} />
            </div>
            <div class="heading-group">
              <p class="ui-heading-6">
                <sup>{supertext}</sup>
              </p>
              <PrismicRichText richText={title} />
              <PrismicRichText richText={subtext} paragraphLevel={2} />
            </div>
          </div>
        </ResponsiveContainer>
      </section>
    );
  };

  Delivery = () => {
    const { delivery } = this.data;
    const { supertext, title, subtext, image } = firstOf(delivery);

    return (
      <section id="delivery">
        <ResponsiveContainer>
          <div class="wrapper">
            <div class="heading-group">
              <p class="ui-heading-6">
                <sup>{supertext}</sup>
              </p>
              <PrismicRichText richText={title} />
              <PrismicRichText richText={subtext} paragraphLevel={2} />
            </div>
            <div class="image-wrapper">
              <PrismicResponsiveImage image={image} />
            </div>
          </div>
        </ResponsiveContainer>
      </section>
    );
  };

  SupportGuidance = () => {
    const { support_guidance } = this.data;

    return (
      <section id="support-guidance">
        <ResponsiveContainer>
          <div class="wrapper">
            {support_guidance.map(({ image, title, text }) => (
              <article>
                <PrismicResponsiveImage image={image} />
                <Heading level={3}>{title}</Heading>
                <Paragraph level={2}>{text}</Paragraph>
              </article>
            ))}
          </div>
        </ResponsiveContainer>
      </section>
    );
  };

  Features = () => {
    const { features, features__list } = this.data;
    const { supertext, title, subtext } = firstOf(features);

    return (
      <section id="features">
        <ResponsiveContainer>
          <div class="wrapper">
            <div class="heading-group">
              <p class="ui-heading-6">
                <sup>{supertext}</sup>
              </p>
              <PrismicRichText richText={title} />
              <Paragraph level={2}>{subtext}</Paragraph>
            </div>
            <ul>
              {features__list.map(({ icon, title, text }) => (
                <li>
                  <div class="image-wrapper">
                    <PrismicResponsiveImage image={icon} />
                  </div>
                  <div>
                    <Heading level={4} as="h3">
                      {title}
                    </Heading>
                    <Paragraph>{text}</Paragraph>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </ResponsiveContainer>
      </section>
    );
  };

  Editions = () => {
    const { editions } = this.data;
    const { supertext, title, paragraph_1, paragraph_2, cta_1 } = firstOf(editions);

    const images = [
      ['burger-king', '36x38'],
      ['fidelity', '113x32'],
      ['hr-block', '32x32'],
      ['communo', '102x24'],
      ['usaa', '27x32'],
      ['ibm', '64x26'],
      ['bcbs', '62x32'],
      ['test-kitchen', '77x28'],
      ['home-depot', '32x32'],
    ];

    return (
      <section id="editions">
        <ResponsiveContainer>
          <div class="wrapper">
            <div class="heading-group">
              <p class="ui-heading-6">
                <sup>{supertext}</sup>
              </p>
              <PrismicRichText richText={title} />
              <PrismicRichText richText={paragraph_1} paragraphLevel={2} />
              <PrismicRichText richText={paragraph_2} paragraphLevel={2} />
              <div class="cta-row">
                <Button href="#demo" anchor kind="round">
                  {cta_1}
                  <span class="arrow"> -&gt;</span>
                </Button>
                {/* <a href="https://ionic.io/contact/sales" class="link btn-link">
                  {cta_2}
                  <span class="arrow"> -&gt;</span>
                </a> */}
              </div>
            </div>
            <div class="logos">
              <div class="row0">
                {images.slice(0, 3).map((stats, i) => (
                  <div class="image-wrapper">
                    <img
                      src={getAssetPath(
                        `./assets-enterprise-page/editions/${i}@2x.png`,
                      )}
                      width={stats[1].split('x')[0]}
                      height={stats[1].split('x')[1]}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              <div class="row1">
                {images.slice(3, 6).map((stats, i) => (
                  <div class="image-wrapper">
                    <img
                      src={getAssetPath(
                        `./assets-enterprise-page/editions/${i + 3}@2x.png`,
                      )}
                      width={stats[1].split('x')[0]}
                      height={stats[1].split('x')[1]}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              <div class="row2">
                {images.slice(6, 9).map((stats, i) => (
                  <div class="image-wrapper">
                    <img
                      src={getAssetPath(
                        `./assets-enterprise-page/editions/${i + 6}@2x.png`,
                      )}
                      width={stats[1].split('x')[0]}
                      height={stats[1].split('x')[1]}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </section>
    );
  };

  Demo = () => {
    const { demo } = this.data;
    const { supertext, title } = firstOf(demo);

    return (
      <section id="demo">
        <ResponsiveContainer>
          <div class="heading-group">
            <p class="ui-heading-6">
              <sup>{supertext}</sup>
            </p>
            <Heading level={2}>{title}</Heading>
          </div>
          <hubspot-form formId="d0019a78-110e-4d28-b356-56357b4abe4b" />
        </ResponsiveContainer>
      </section>
    );
  };
}
