import { Component, h, Host, Prop, State } from '@stencil/core';
import {
  ResponsiveContainer,
  Col,
  Grid,
  Heading,
  Breakpoint,
  Button,
  PrismicRichText,
  PrismicResponsiveImage,
  Paragraph,
} from '@ionic-internal/ionic-ds';
import { href } from '@stencil/router';
import { firstOf } from '../../utils/prismic-safety';

@Component({
  tag: 'landing-page',
  styleUrl: 'landing-page.scss',
  scoped: true,
})
export class LandingPage {
  @Prop() data: any;

  @State() selectedCodeTab: string = 'notifications';
  @State() ebookModalOpen = false;

  render() {
    const {
      Top,
      Started,
      Native,
      Features,
      Framework,
      Tweets,
      Cta,
      Ebook,
      // IoniconfCta,
    } = this;

    return (
      <Host>
        <meta-tags />
        <Top />
        {/* <IoniconfCta /> */}
        {/* <top-parallax /> */}
        <Started />
        <Ebook />
        <Native />
        <Features />
        <Framework />
        <Tweets />
        <Cta />
        <pre-footer />
        <capacitor-site-footer />
      </Host>
    );
  }

  Top = () => {
    const { Announcement } = this;
    const { top, top__ctas, top__link, top__hero, top__icons } = this.data;
    const { primary, secondary } = firstOf(top__ctas);

    return (
      <section id="top">
        <div class="background"></div>
        <ResponsiveContainer>
          <div class="heading-group">
            <Announcement />
            <PrismicRichText richText={top} paragraphLevel={2} />
            <div class="buttons">
              <Button
                kind="round"
                anchor
                href="/docs/getting-started"
                class="primary"
              >
                {primary} <span class="arrow"> -&gt;</span>
              </Button>
              <Button
                kind="round"
                variation="light"
                anchor
                href="/docs/plugins"
                class="secondary"
              >
                {secondary}
              </Button>
            </div>
            <a class="link | ui-paragraph-4" {...href('/cordova')}>
              {top__link}
              <span class="arrow"> -&gt;</span>
            </a>
            <PrismicResponsiveImage
              loading="eager"
              image={top__icons}
              params={{
                w: '91',
                h: '16',
              }}
            />
          </div>
          <div class="image-wrapper">
            <PrismicResponsiveImage loading="eager" image={top__hero} />
          </div>
        </ResponsiveContainer>
      </section>
    );
  };

  Announcement = () => {
    const {
      tag_text,
      desktop_text,
      mobile_text,
      link,
    } = this.data.announcement;
    const { target, url } = link ?? {};
    if (!url) {
      // No announcement configured (Prismic singleton is gone/empty).
      return null;
    }

    const newUrl = url.replace(window.location.origin, '');

    return (
      <a
        id="announcement"
        class="feature__register"
        href={newUrl}
        target={target}
        rel={target ? 'noopener' : undefined}
      >
        <div class="tag">{tag_text}</div>
        <Breakpoint sm={true} display="inline-block" class="text">
          <span class="text__content">
            {desktop_text} <span class="arrow">-&gt;</span>
          </span>
        </Breakpoint>
        <Breakpoint xs={true} sm={false} display="inline-block" class="text">
          <span class="text__content">
            {mobile_text} <span class="arrow">-&gt;</span>
          </span>
        </Breakpoint>
      </a>
    );
  };

  // IoniconfCta = () => {
  //   return (
  //     <section id="ioniconf-cta">
  //       <ResponsiveContainer>
  //         <div class="section-wrapper">
  //           <div class="start">
  //             <img
  //               class="logo"
  //               src="/assets/img/landing/logo-ioniconf.png"
  //               width="359.38"
  //               height="147.54"
  //               alt="ioniconf logo"
  //             />
  //           </div>
  //           <header>
  //             <div class="overline">May 25 / 100% online / 100% Free</div>
  //             <Heading>Join us at Ioniconf 2022</Heading>
  //             <Paragraph>
  //               Ioniconf is Ionic's annual conference celebrating the future of
  //               cross-platform, the Web, and the makers behind it.&nbsp;
  //               <a
  //                 href="https://ionic.io/ioniconf"
  //                 target="_blank"
  //                 rel="noopener"
  //               >
  //                 Register today,
  //               </a>
  //               for free.
  //             </Paragraph>
  //             <Button
  //               anchor={true}
  //               href="https://ionic.io/ioniconf"
  //               rel="noopener"
  //               target="_blank"
  //               kind="round"
  //               size="md"
  //             >
  //               Register Free&nbsp;
  //               <span style={{ letterSpacing: '0px' }}> -&gt;</span>
  //             </Button>
  //           </header>
  //         </div>
  //       </ResponsiveContainer>
  //     </section>
  //   );
  // };

  Started = () => {
    const { started, started__list, started__icons } = this.data;

    const panels = [
      <code-snippet
        language="shell-session"
        code={`npm install @capacitor/cli @capacitor/core\nnpx cap init`}
      />,
      <code-snippet
        language="shell-session"
        code={`npm install @capacitor/ios @capacitor/android\nnpx cap add ios\nnpx cap add android`}
      />,
      <code-tabs
        data={{
          tabs: ['Notifications', 'Geolocation', 'Camera', 'Custom'],
          languages: ['typescript'],
          code: [
            `
import { LocalNotifications } from '@capacitor/local-notifications';

LocalNotifications.schedule({
  notifications: [
    {
      title: "On sale",
      body: "Widgets are 10% off. Act fast!",
      id: 1,
      schedule: { at: new Date(Date.now() + 1000 * 5) },
      sound: null,
      attachments: null,
      actionTypeId: "",
      extra: null
    }
  ]
});`, //-----------------------------------
            `
import { Geolocation } from '@capacitor/geolocation';

// get the users current position
const position = await Geolocation.getCurrentPosition();

// grab latitude & longitude
const latitude = position.coords.latitude;
const longitude = position.coords.longitude;
`,
            `
import { Camera, CameraResultType } from '@capacitor/camera';

// Take a picture or video, or load from the library
const picture = await Camera.getPicture({
  resultType: CameraResultType.Uri
});
`, //-----------------------------------
            `
import Foundation
import Capacitor

// Custom platform code, easily exposed to your web app
// through Capacitor plugin APIs. Build APIs that work
// across iOS, Android, and the web!
@objc(MyAwesomePlugin)
public class MyAwesomePlugin: CAPPlugin {

  @objc public func doNative(_ call: CAPPluginCall) {
  let alert = UIAlertController(title: "Title", message: "Please Select an Option", preferredStyle: .actionSheet)

  // ....
  }
}
`,
          ],
        }}
      />,
    ];

    const dimensions = ['22x26', '27x23'];

    return (
      <ResponsiveContainer id="started" as="section">
        <div class="heading-group">
          <PrismicRichText richText={started} />
        </div>
        {started__list.map(({ number, title, text }, i) => (
          <div class="step">
            <sup class="ui-heading-6">{number}</sup>
            <div class="heading-panel-wrapper">
              <div class="heading-wrapper">
                <Heading>{title}</Heading>
                {i === 1 ? (
                  <div class="platforms">
                    {started__icons.map(({ icon }, i) => (
                      <PrismicResponsiveImage
                        image={icon}
                        width={dimensions[i].split('x')[0]}
                        height={dimensions[i].split('x')[1]}
                      />
                    ))}
                  </div>
                ) : null}
                {text ? <Paragraph>{text}</Paragraph> : null}
              </div>
              <div class="panel">{panels[i]}</div>
            </div>
          </div>
        ))}
      </ResponsiveContainer>
    );
  };

  Ebook = () => {
    const { ebook } = this.data;
    const { text, cta1: cta, background, book } = firstOf(ebook);

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

  Native = () => {
    const { native, native__list } = this.data;
    const dimensions = ['48x64', '60x64', '60x64'];

    return (
      <ResponsiveContainer id="native" as="section">
        <div class="heading-group">
          <PrismicRichText richText={native} />
        </div>
        <Grid>
          {native__list.map(({ icon, item }, i: number) => (
            <Col xs={6} sm={4} cols={12}>
              <PrismicResponsiveImage
                image={icon}
                width={dimensions[i].split('x')[0]}
                height={dimensions[i].split('x')[1]}
              />
              <PrismicRichText richText={item} />
            </Col>
          ))}
        </Grid>
      </ResponsiveContainer>
    );
  };

  Features = () => {
    const { features, features__list, features__link } = this.data;
    const dimensions = [
      '40x32',
      '40x32',
      '32x32',
      '33x32',
      '28x32',
      '32x32',
      '32x32',
      '32x30',
    ];

    return (
      <section id="features">
        <ResponsiveContainer>
          <div class="heading-group">
            <PrismicRichText richText={features} />
            <a href="/docs/apis" class="link | ui-heading-4">
              {features__link}
              <span class="arrow">-&gt;</span>
            </a>
          </div>
          <Grid>
            {features__list.map(({ icon, item }, i: number) => (
              <Col xs={6} sm={4} md={3} cols={12}>
                <PrismicResponsiveImage
                  image={icon}
                  width={dimensions[i].split('x')[0]}
                  height={dimensions[i].split('x')[1]}
                />
                <PrismicRichText richText={item} />
              </Col>
            ))}
          </Grid>
        </ResponsiveContainer>
      </section>
    );
  };

  Framework = () => {
    const { framework, framework__list } = this.data;

    const logoTile = (logo: any) => (
      <PrismicResponsiveImage image={logo} width="272" height="200" />
    );

    return (
      <ResponsiveContainer id="framework" as="section">
        <div class="heading-group">
          <PrismicRichText richText={framework} paragraphLevel={2} />
        </div>
        <Grid>
          {framework__list.map(({ logo, link }) => (
            <Col sm={3} cols={6}>
              {link ? <a {...href(link)}>{logoTile(logo)}</a> : logoTile(logo)}
            </Col>
          ))}
        </Grid>
      </ResponsiveContainer>
    );
  };

  Tweets = () => {
    const {
      tweets,
      tweets__list,
      tweets__bottom,
      tweets__bottom__list,
    } = this.data;
    const { title } = firstOf(tweets);
    const { emoji, text } = firstOf(tweets__bottom);

    return (
      <section id="tweets">
        <ResponsiveContainer>
          <div class="heading-group">
            <PrismicRichText richText={title} />
          </div>
          <div class="tweets">
            {tweets__list.map(({ name, handle, text, image, verified }, i) => (
              <article class="tweet" key={i}>
                <div class="title-row">
                  <PrismicResponsiveImage image={image} />
                  <div class="title">
                    <Heading level={5} as="h3">
                      {name}
                      {verified && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                        >
                          <path
                            fill="#1DA1F2"
                            d="M512 268c0 17.9-4.3 34.5-12.9 49.7a92 92 0 01-34.6 35.4c.4 2.7.6 6.9.6 12.6 0 27.1-9.1 50.1-27.1 69.1a86.8 86.8 0 01-65.4 28.6 85.6 85.6 0 01-32.6-6.3 99.2 99.2 0 01-34.6 39.7A86 86 0 01256 512a86.8 86.8 0 01-49.7-14.9 97 97 0 01-34.3-40 85.3 85.3 0 01-32.6 6.3 87.8 87.8 0 01-65.7-28.6 96 96 0 01-26.3-81.7 92.7 92.7 0 01-34.6-35.4A100.3 100.3 0 010 268c0-19 4.8-36.5 14.3-52.3a88.1 88.1 0 0138.3-35.1 98.9 98.9 0 01-6.3-34.3 96 96 0 0127.4-69.1A88.1 88.1 0 01172 54.9a99.2 99.2 0 0134.6-39.7A86.7 86.7 0 01256 0c17.9 0 34.4 5.1 49.4 15.1A100 100 0 01340 54.8a85.3 85.3 0 0132.6-6.3c25.5 0 47.3 9.5 65.4 28.6a96.7 96.7 0 0127.1 69.1c0 12.6-1.9 24-5.7 34.3a88.1 88.1 0 0138.3 35.1A100.4 100.4 0 01512 268zm-266.9 77.1l105.7-158.3c2.7-4.2 3.5-8.8 2.6-13.7-1-4.9-3.5-8.8-7.7-11.4a19.5 19.5 0 00-13.7-2.9c-5 .8-9 3.2-12 7.4l-93.1 140-42.9-42.8a17 17 0 00-13.1-5.4c-5 .2-9.3 2-13.1 5.4a17.5 17.5 0 00-5.1 12.9c0 5.1 1.7 9.4 5.1 12.9l58.9 58.9 2.9 2.3c3.4 2.3 6.9 3.4 10.3 3.4 6.7-.1 11.8-2.9 15.2-8.7z"
                          />
                        </svg>
                      )}
                    </Heading>
                    <Paragraph level={6}>{handle}</Paragraph>
                  </div>
                  <svg
                    width="16"
                    height="13"
                    viewBox="0 0 16 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 1.54036C15.41 1.80104 14.7794 1.97708 14.1149 2.05833C14.793 1.65208 15.3151 1.00885 15.5592 0.24375C14.9252 0.619531 14.2234 0.89375 13.474 1.03932C12.8739 0.399479 12.0195 0 11.0769 0C9.26298 0 7.79487 1.46927 7.79487 3.28047C7.79487 3.53776 7.822 3.78828 7.87963 4.02865C5.15024 3.89323 2.72939 2.58646 1.1121 0.599219C0.830685 1.08333 0.667938 1.6487 0.667938 2.24792C0.667938 3.38542 1.25111 4.39089 2.13266 4.97995C1.59017 4.96641 1.08159 4.81745 0.640814 4.57031V4.61094C0.640814 6.20208 1.77326 7.52578 3.27527 7.82708C3.00064 7.90156 2.70905 7.94219 2.41068 7.94219C2.20047 7.94219 1.99364 7.92188 1.7936 7.88125C2.21064 9.18464 3.42445 10.1326 4.86205 10.1596C3.73978 11.0398 2.32253 11.5646 0.783217 11.5646C0.518754 11.5646 0.257682 11.5477 0 11.5172C1.44776 12.4583 3.17355 13 5.02479 13C11.0701 13 14.3725 7.99974 14.3725 3.66302C14.3725 3.52083 14.3691 3.37865 14.3624 3.23984C15.0032 2.77604 15.5592 2.20052 16 1.54036Z"
                      fill="#1DA1F2"
                    />
                  </svg>
                </div>

                <PrismicRichText
                  richText={text}
                  paragraphLevel={4}
                  className="content"
                />
              </article>
            ))}
          </div>
          <div class="bottom">
            <Paragraph class="emoji">{emoji}</Paragraph>
            <PrismicRichText richText={text} paragraphLevel={1} />
            <div class="links">
              {tweets__bottom__list.map(({ icon, text, link }) => (
                <a href={link.url} target={link.target}>
                  <article>
                    <PrismicResponsiveImage image={icon} />
                    <Heading level={4}>{text}</Heading>
                  </article>
                </a>
              ))}
            </div>
          </div>
        </ResponsiveContainer>
      </section>
    );
  };

  // Companies = () => {
  //   const { companies, companies__list } = this.data;

  //   //array structure matches css div placement
  //   const dimensions = [
  //     //groups of 4 (2 groups of 2)
  //     [
  //       //groups of 2
  //       ['38x40', '62x32'],
  //       ['102x30', '82x28'],
  //     ],
  //     [
  //       ['41x40', '152x26'],
  //       ['40x40', '79x32'],
  //     ],
  //   ];

  //   return (
  //     <ResponsiveContainer id="companies" as="section">
  //       <div class="heading-group">
  //         <Paragraph level={2}>{companies}</Paragraph>
  //       </div>
  //       <div class="images">
  //         {dimensions.map((_, i1: number) => (
  //           //row of 4 images (2 groups of 2)
  //           <div class="image-row">
  //             {dimensions[i1].map((_, i2: number) => (
  //               //group of 2 images
  //               <div class="image-group">
  //                 {dimensions[i1][i2].map((dimensions, i3) => (
  //                   <PrismicResponsiveImage
  //                     image={companies__list[i1 * 4 + i2 * 2 + i3].logo}
  //                     width={dimensions.split('x')[0]}
  //                     height={dimensions.split('x')[1]}
  //                   />
  //                 ))}
  //               </div>
  //             ))}
  //           </div>
  //         ))}
  //       </div>
  //     </ResponsiveContainer>
  //   );
  // };

  Cta = () => {
    const { cta } = this.data;
    const { image, title, text, cta1 } = firstOf(cta);

    const { companies__list2 } = this.data;

    const { get_started2: get_started, get_started__ctas } = this.data;
    const { title: get_started_title, text: get_started_text } = firstOf(get_started);
    const { primary, secondary } = firstOf(get_started__ctas);

    const dimensions = [
      '33x42',
      '31x42',
      '32x36',
      '34x34',
      '51x30',
      '35x35',
      '58x25',
      '35x35',
    ];

    return (
      <section id="multisection">
        <ResponsiveContainer>
          <div id="cta">
            <PrismicRichText richText={title} />
            <div class="wrapper">
              <div class="card">
                <PrismicResponsiveImage image={image} class="background" />
                <div class="heading-group">
                  <PrismicRichText richText={text} paragraphLevel={1} />
                  <Button kind="round" {...href('/enterprise')}>
                    {cta1} <span class="arrow"> -&gt;</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div id="companies">
            <div class="wrapper">
              <div class="image-group first">
                {companies__list2.slice(0, 4).map(({ logo }, i) => (
                  <PrismicResponsiveImage
                    image={logo}
                    width={dimensions[i].split('x')[0]}
                    height={dimensions[i].split('x')[1]}
                  />
                ))}
              </div>
              <div class="image-group second">
                {companies__list2.slice(4, 8).map(({ logo }, i) => (
                  <PrismicResponsiveImage
                    image={logo}
                    width={dimensions[i + 4].split('x')[0]}
                    height={dimensions[i + 4].split('x')[1]}
                  />
                ))}
              </div>
            </div>
          </div>
          <div id="get-started">
            <div class="heading-group">
              <Heading level={2}>{get_started_title}</Heading>
              <Paragraph level={2}>{get_started_text}</Paragraph>
            </div>
            <div class="ctas">
              <Button
                href="/docs/getting-started"
                kind="round"
                anchor
                class="secondary"
                color="cyan"
              >
                {primary}
                <span class="arrow"> -&gt;</span>
              </Button>
              <Button
                href="/docs/plugins"
                anchor
                kind="round"
                variation="light"
                class="primary"
                color="cyan"
              >
                {secondary}
                <span class="arrow"> -&gt;</span>
              </Button>
            </div>
          </div>
        </ResponsiveContainer>
      </section>
    );
  };
}
