---
title: Turn your Angular App Native
slug: turn-your-angular-app-native
date: 2020-08-17 08:00:00
author: Max Lynch <max@ionic.io>
authorUrl: https://twitter.com/maxlynch
description: Any Angular app can be turned into a native app with Capacitor
---

Angular is used to build seriously large applications, but did you know you can target iOS and Android (and PWA) from your codebase without many changes to your existing Angular app?

With Capacitor, any Angular app can be turned into an iOS and Android app with full access to native APIs and OS controls. Capacitor does this by providing a native runtime for web apps with a bridge to communicate from the web app to the native layer, along with many [Native APIs](https://capacitorjs.com/docs/apis) and access to hundreds more from the community.

Perhaps a surprise to many Angular developers, Angular is already used to power a significant number of app store apps ([at least 15%](https://appfigures.com/top-sdks/development/apps)). This is because [Ionic Framework](https://ionicframework.com/) has been widely used as a mobile UI framework for Angular since the AngularJS days and many Cordova apps used Angular over the years.

<preview-end />

## Is this like Cordova?

Capacitor is similar to Cordova (and Electron, for that matter) in that it runs a web app in a native environment and adds Native API access to the web app.

Compared to Cordova, Capacitor is a relatively new, ground up effort to build a modern native mobile runtime for cross-platform iOS, Android, and PWA apps. Capacitor was built by the team behind [Ionic Framework](https://ionicframework.com/) to provide an alternative to Cordova for this native runtime layer. You can read more about the [motivation for creating Capacitor](https://capacitorjs.com/docs/cordova) on the docs.

Capacitor has backwards compatibility with many Cordova plugins so migration is [straightforward](https://capacitorjs.com/cordova).

## How is this different from Ionic Framework?

Capacitor and Ionic Framework is like comparing Apples to Oranges.

Capacitor (like Cordova), provides a native runtime for web apps across multiple platforms. It's the part of your app that supports adding native code and plugins, and manages communication between a web app running in a web view, and the operating system below. Think of Capacitor like Electron but for Mobile (though Capacitor and Electron are very different and Capacitor can be much more efficient, so doesn't have the downsides of Electron). Thus, Capacitor simply provides an empty web frame and extra mobile APIs, it still needs you to provide a UI for the app.

In contrast, Ionic Framework is a mobile-focused UI library for web apps. Think of Ionic Framework like Bootstrap or Material. Ionic Framework provides iOS and Android specific UI controls and experiences such as navigation/transitions, modals, buttons, form controls, swipeable items, and a ton more.

So, your mobile web app will use Capacitor to target iOS and Android (and PWA), and use a UI library like Ionic Framework to provide the mobile experience users expect.

Capacitor does not require Ionic Framework (though it's certainly one of the very best options), so Capacitor can work with any popular web-based UI library.

## How does this compare to React Native or NativeScript?

NativeScript and React Native are two popular mobile app frameworks that enable developers to build native apps using JavaScript.

The biggest difference between Capacitor and these other options is that Capacitor uses standard web development technology, tooling, and developer experience. This means Capacitor can turn _any web app_ into a native app. React Native and NativeScript, in contrast, are frameworks that must be targeted from the beginning of an app's code base and provide a "web like" experience that is not a true browser environment.

This has some advantages in that system controls are used exclusively, but in this case it's important to remember that these solutions will not enable you to take an existing Angular app, or one built with popular Angular libraries like Angular Material or Ionic Framework, and deploy it to the App Store. Instead, your app would need to be written from the ground up to use them and web libraries would not be compatible.

Capacitor, in contrast, supports any app that runs in the browser and provides a true web development experience.

## Who's using Capacitor?

Capacitor is widely used in startups and the Fortune 1000. Companies like RBI (Burger King/Popeyes), Blue Cross Blue Shield, Aflac, and IBM are all using Capacitor to target iOS and Android with their web development teams.

Capacitor is backed by [Ionic](https://ionic.io/), the leader in cross-platform mobile development. Ionic provides [enterprise security features and support](https://ionicframework.com/native) for teams that need more than what's available in the community version.

## Get Started

To get started building iOS, Android, and Progressive Web Apps take a look at the [Angular Getting Started](https://capacitorjs.com/solution/angular) guide or follow the standard [Getting Started](https://capacitorjs.com/docs/getting-started) experience.
