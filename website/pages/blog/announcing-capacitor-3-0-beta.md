---
title: Announcing Capacitor 3.0 Beta
slug: announcing-capacitor-3-0-beta
date: 2021-01-14 08:00:00
author: Dan Imhoff <dwieeb@gmail.com>
authorUrl: https://twitter.com/dwieeb
description: Announcing Capacitor 3.0 Beta
featuredImage: /v3-beta/cap-3-beta-img.png
featuredImageAlt: Capacitor 3.0 Beta
---

Today I'm thrilled to announce that Capacitor 3 is ready for public beta! The Capacitor team is looking forward to hearing feedback on it from our developer community. 💖

## A New Milestone

Last year [we announced Capacitor 2](/blog/announcing-capacitor-2-0), which brought important platform updates to the ecosystem such as Swift 5 and AndroidX. Since then, we've been delighted to see massive adoption in the community. Usage has more than doubled this year alone! It's clear that developers who use Capacitor share our commitment to staying modern and providing the very best app experiences.

For 3.0, we are focusing our attention on these areas of improvement:

- Community involvement
- Adaptability
- First-class APIs
- Developer experience and productivity

Capacitor 3 is more than just the "next version" of Capacitor. It is a crucial milestone for the project: the core team has grown significantly since the 2.0 release and now has the bandwidth and experience necessary to dedicate more time to the community, more time for prototyping and innovation, more time for stability and maintenance, and more time to deliver on Capacitor's promise of making it easy to build web apps that run natively on iOS, Android, and the Web.

<preview-end />

The Capacitor team is ready to redefine what the web can do in mobile development for years to come. More than ever, we're interested in pulling ideas and inspiration from both web and native, combining both platforms in new, exciting ways that we're not quite ready to talk about yet. Stay tuned! We have a lot planned for 2021.

## Capacitor Community on GitHub

The Capacitor community now has [a home on GitHub](https://github.com/capacitor-community)! This org seeks to bring together the Capacitor plugin authoring community and provide a centralized list of high-quality plugins and other projects.

To track plugin ideas, as well as gauge interest and promote collaboration, we created the [Proposals repo](https://github.com/capacitor-community/proposals/issues). Found a proposal you like? Add a thumbs-up! 👍 Want to add your plugin to the Capacitor community? Create a new proposal! 📣

## Project Transparency

As much as possible, we want to be transparent about how the Capacitor team prioritizes work. We'd love more community feedback into this process. We're still evaluating how best to do this, but we've already started using [milestones](https://github.com/ionic-team/capacitor/milestones) and a [public project board](https://github.com/orgs/ionic-team/projects/7).

## Discussions on GitHub

The Capacitor repo now uses [GitHub Discussions](https://github.com/ionic-team/capacitor/discussions), which work a bit like Stack Overflow. We see this as the perfect solution for community questions, ideas, and discussions. Have a question or need help? Want to show off something you made? Want to talk about ideas for improvement? Create a discussion!

To get notifications for new discussion topics, click **Watch** at the top of [the Capacitor repo](https://github.com/ionic-team/capacitor), then select **Custom** and check **Discussions** (and any others you want!), then click **Apply**.

## Platform Updates

Capacitor 3 brings several updates to iOS and Android. The minimum supported iOS version has been bumped to 12. Xcode 12+ is now required. Capacitor will continue to support Android 5 and will now support Android 11! We recommend updating Gradle in your Android apps and plugins to version 6.5 (see the upgrade guide below).

## Plugins

The team has moved all "core plugins" into their own npm packages. These officially supported plugins are now installed and versioned separately from Capacitor core. Without a doubt, this was the biggest change in architecture for Capacitor 3. As much as we wanted to have Capacitor be "batteries-included", keeping these plugins integrated in the core library proved untenable.

Here's a list of new and updated official plugins for Capacitor 3 (also available [on GitHub](https://github.com/ionic-team/capacitor-plugins)):

- [`@capacitor/action-sheet`](https://www.npmjs.com/package/@capacitor/action-sheet) (previously a part of `Modals`)
- [`@capacitor/app`](https://www.npmjs.com/package/@capacitor/app)
- [`@capacitor/app-launcher`](https://www.npmjs.com/package/@capacitor/app-launcher) (previously a part of `App`)
- [`@capacitor/browser`](https://www.npmjs.com/package/@capacitor/browser)
- [`@capacitor/camera`](https://www.npmjs.com/package/@capacitor/camera)
- [`@capacitor/clipboard`](https://www.npmjs.com/package/@capacitor/clipboard)
- [`@capacitor/device`](https://www.npmjs.com/package/@capacitor/device)
- [`@capacitor/dialog`](https://www.npmjs.com/package/@capacitor/dialog) (previously a part of `Modals`)
- [`@capacitor/filesystem`](https://www.npmjs.com/package/@capacitor/filesystem)
- [`@capacitor/geolocation`](https://www.npmjs.com/package/@capacitor/geolocation)
- [`@capacitor/haptics`](https://www.npmjs.com/package/@capacitor/haptics)
- [`@capacitor/keyboard`](https://www.npmjs.com/package/@capacitor/keyboard)
- [`@capacitor/local-notifications`](https://www.npmjs.com/package/@capacitor/local-notifications)
- [`@capacitor/motion`](https://www.npmjs.com/package/@capacitor/motion)
- [`@capacitor/network`](https://www.npmjs.com/package/@capacitor/network)
- [`@capacitor/push-notifications`](https://www.npmjs.com/package/@capacitor/push-notifications)
- [`@capacitor/screen-reader`](https://www.npmjs.com/package/@capacitor/screen-reader) (previously named `Accessibility`)
- [`@capacitor/share`](https://www.npmjs.com/package/@capacitor/share)
- [`@capacitor/splash-screen`](https://www.npmjs.com/package/@capacitor/splash-screen)
- [`@capacitor/status-bar`](https://www.npmjs.com/package/@capacitor/status-bar)
- [`@capacitor/storage`](https://www.npmjs.com/package/@capacitor/storage)
- [`@capacitor/text-zoom`](https://www.npmjs.com/package/@capacitor/text-zoom) (new plugin!) ✨
- [`@capacitor/toast`](https://www.npmjs.com/package/@capacitor/toast)

Updating to these new plugins should be as easy as installing the package and changing the import, with the exception of a few minor changes (see the upgrade guide below).

```ts
// OLD
import { Plugins } from '@capacitor/core';
const { Camera } = Plugins;

// NEW
import { Camera } from '@capacitor/camera';
```

In Capacitor 3, the use of the `Plugins` object is deprecated. See the upgrade guide for apps and plugins below.

## Run Command

One of the most exciting new features we have to offer is a new CLI command to run your app on iOS and Android devices. This command will run `sync` to copy web assets into place within the native project and then programmatically invoke a native debug build before finally using [`native-run`](https://github.com/ionic-team/native-run/) to deploy the compiled app binary to both hardware and virtual devices.

```bash
npx cap run
```

Previously, developers had to keep Xcode and Android Studio open to deploy and would switch between them and their main editor frequently. This addition to the Capacitor CLI will eliminate unnecessary context switching and free up your computer's resources. Those heavy IDEs only need to be open now when configuring native projects, writing native code, or making a release build of your app.

## TypeScript Configuration Files

You can now use `capacitor.config.ts` files for configuring Capacitor! Not only does this provide autocomplete and inline documentation of configuration values in your editor, but now you have the ability to use environment variables for generating configuration. This means you can now create different environments for dev vs. prod, provide different configuration values per platform, etc.

The configuration file is parsed every time you run `sync` and then a new copy of the generated config is placed into each native platform, just like before.

## Permissions API

Another big addition to Capacitor 3 is the brand new cross-platform Permissions API! Plugins that require permissions will now offer the `requestPermissions()` and `checkPermissions()` methods, which give app developers fine-grained control over which permissions are requested and when. It also gives app developers the ability to query the state of permissions for a given plugin.

This is possible by grouping sets of permissions into "aliases", which are maintained by each plugin. For example, the Camera plugin has a `camera` and `photos` alias for accessing the camera and photo library, respectively. As an app developer, you can request permission for the `camera` alias via the Camera plugin, and the user will be prompted to grant or deny access to their camera. This can now happen at any time, instead of only when the user takes a picture.

Official plugins will continue to automatically request necessary permissions before feature use, so no changes to your app are necessary. This additional functionality is completely opt-in.

## Android Plugin Auto-loading

Ever forget to add those Java classes to `MainActivity.java` after installing plugins? I did. All the time. With Capacitor 3, you no longer have to! The Capacitor CLI will now generate a file that lists plugins to automatically load when the app initializes. Android plugins become available simply after installing them and running `sync`, just like iOS plugins.

This behavior is opt-in. You'll have to follow the upgrade guide below to enable it.

Additionally, we added a new [`includePlugins` option](https://github.com/ionic-team/capacitor/pull/3762) which lets you configure which plugins to include per platform so the list can still be manually controlled.

## Electron

Electron support has been pulled out of Capacitor and given a new home in the Capacitor Community. We want to focus our efforts on iOS, Android, and PWAs for the time being. We are proud to offer [the Electron Platform](https://github.com/capacitor-community/electron) as the first-ever community-maintained platform, which is being led by [Mike Summerfeldt](https://twitter.com/IT_MikeS), the original author.

## Upgrade Guide

Here's an [Upgrade Guide](https://capacitorjs.com/docs/v3/updating/3-0) with the technical changes you'll want to make to your app. For plugin authors, we have a guide for [Updating Plugins](https://capacitorjs.com/docs/v3/updating/plugins/3-0). If we missed something, please [create an issue](https://github.com/ionic-team/capacitor-site) in our docs repo or submit a PR for [these files](https://github.com/ionic-team/capacitor-site/tree/main/pages/docs/v3/updating). You can also share feedback in [this discussion](https://github.com/ionic-team/capacitor/discussions/3994). Thanks! 💙

## Good Vibes

Thanks for checking out the beta! Stay tuned for updates on the RC and final release in the coming weeks.

I cannot emphasize how proud I am of this release and especially the team that made it happen. This beta is the result of months of dedication from the Capacitor core team and our community contributors. That said, I couldn't be more thrilled for what's to come. After 2020, we all need good vibes.

<br />

<div align="center">
  <img width="224" height="224" src="https://user-images.githubusercontent.com/236501/104073592-f4f2f300-51c2-11eb-9cb6-20dff5043338.gif" />
</div>

<br />

<div align="center">

<blog-forum-link href="https://forum.ionicframework.com/t/announcing-capacitor-3-0-beta/202858">
  👋 Join the discussion on the Forum
</blog-forum-link>

</div>
