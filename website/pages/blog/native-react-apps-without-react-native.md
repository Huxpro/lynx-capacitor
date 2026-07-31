---
title: Native React Apps Without React Native
slug: native-react-apps-without-react-native
date: 2020-07-14 08:00:00
author: Max Lynch <max@ionic.io>
authorUrl: https://twitter.com/maxlynch
description: Build app store apps using React web libraries and Capacitor
featuredImage: /native-wout-react-native.png
featuredImageAlt: Native React Apps Without React Native
---

In the React world, the primary way to build native iOS and Android apps has been React Native. Created by Facebook in 2015, React Native enables developers to use their React skills to build iOS and Android apps using platform native UI elements. React Native is popular and widely used, and it’s a great solution for many teams.

However, React Native comes with a number of tradeoffs. First, it requires developers to build in a React Native specific way, using views/JSX for each platform, and using libraries that support react-native (as opposed to most React libraries that support react-dom). But perhaps most importantly, React Native is not a web environment, so it’s not possible for teams to take their web-based React apps and libraries to deploy native apps.

The net effect is that it’s not possible to take, say, a Material-UI React web app, and deploy it natively to the Apple App Store or Google Play Store with React Native.

To do that, we need to take a look at [Capacitor](https://capacitorjs.com/) -- a native runtime for cross-platform web apps, including any and all React web apps.

<preview-end />

## Capacitor: Native Runtime for Web Apps

[Capacitor](https://capacitorjs.com/) is sort of an “electron for mobile” that provides a native runtime for any modern web app, so it can run natively on iOS, Android, and the web using the same code. Capacitor provides full native API access through a [powerful plugin system](https://capacitorjs.com/docs/plugins), so apps can access the same level of functionality as any other pure native (or React Native) app.

Capacitor is focused on enabling modern web apps to run on multiple platforms, and embraces browser-built apps. Capacitor is not a native UI abstraction like React Native, though native UI can certainly be used alongside a Capacitor app.

Capacitor apps for iOS and Android [are native apps](https://medium.com/@maxlynch/cordova-ionic-apps-are-native-apps-64f9e1a995d9), they just happen to do a large amount of their work in a primary WebView.

As a side effect of being web-focused, Capacitor provides a standard web development experience where apps can be built largely in the browser, bringing the experience and tooling web developers have come to love.

## Build Native Apps with Material-UI, Chakra, Ant, Prime, and more

Because Capacitor provides a native runtime environment for web apps, that means it can be used to turn any React web app into a native app. So apps using [Material-UI](https://material-ui.com/) or [Chakra](https://chakra-ui.com/) or [Prime](https://www.primefaces.org/primereact/) or [Ant](https://ant.design/) or [Ionic Framework](https://ionicframework.com/), or any other React UI library, can be turned into native apps using Capacitor (see our [examples repo](https://github.com/capacitor-community/examples) for real code in a variety of libraries).

This simply isn’t possible with React Native. Most popular React UI libraries target the web and react-dom, and most web libraries use web technologies like CSS that aren’t supported in React Native (at least not in their native format)

## Bonus: Deploy Progressive Web Apps and Native Apps

One additional bonus feature of Capacitor is that it works on the web for Progressive Web Apps. That means an app using Capacitor can access many of the same APIs on native mobile but on the web instead. For example, the [Camera](https://capacitorjs.com/docs/apis/camera) and [Share](https://capacitorjs.com/docs/apis/share) APIs work across iOS, Android, and the web with the same code.

With this capability, teams often can build and ship on three platforms on day one, or even embrace [Progressive Web App First Development](https://ionic.io/blog/forget-mobile-first-progressive-web-app-first-is-the-future/), by using Capacitor.

## Transform your React Web App into Native with Capacitor

Adding native functionality and deploying to iOS, Android, and PWA with your existing React web app is easy. Just install Capacitor, drop it into to your project, and add a platform:

```shell
npm install @capacitor/cli @capacitor/core
npx cap init
npx cap add ios
```

Then, to start using in a web app, import from `@capacitor/core`:

```typescript
import { Plugins } from '@capacitor/core';

const { Share } = Plugins;
await Share.share({
  title: 'My awesome thing',
  text: 'Check out this really awesome thing',
  url: 'https://capacitorjs.com/',
});
```

Then run your web app:

```shell
npm start
```

Capacitor apps can be built primarily in the browser, but to deploy and test on iOS or Android (simulator or device), open the IDE of choice and run directly in the IDE:

```shell
npx cap open ios
```

For the full getting started instructions, check out the [Capacitor documentation](https://capacitorjs.com/docs/getting-started).

## Conclusion

React Native is no longer the only option for React devs to build iOS and Android apps. Capacitor provides a web-focused solution for teams building React web apps to enable them to ship to the app stores and the web with the same code base.

And, for teams that are building a new app and interested in exploring a mobile-focused UI library for their Capacitor apps, [Ionic React](https://ionicframework.com/) is a great and popular option.

Beyond React, Capacitor can be used with any modern web app technology, so is a good fit for teams with a diversity of frontend technologies in use, which is another challenge with React Native.

We're excited about Capacitor in the React ecosystem, and many teams are as well. Today, Capacitor is powering React apps with hundreds of millions of users, and for major brands and [enterprise customers](https://ionicframework.com/customers) like Burger King and Popeye's. Capacitor adoption has been [growing quickly](https://twitter.com/maxlynch/status/1280531102650769408) and given that given that web development with React represents the largest area of React development ([> 17x React Native](https://npmcharts.com/compare/react-native,react-dom?interval=7)), we're thrilled about the potential to help more web devs build cross-platform apps.

Check out Capacitor today and stay tuned for some exciting updates with the project coming soon: [capacitorjs.com](https://capacitorjs.com/)
