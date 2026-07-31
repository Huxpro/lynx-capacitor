---
title: Announcing Capacitor 3.0 Release Candidate
slug: announcing-capacitor-3-0-rc
date: 2021-03-10 08:00:00
author: Mike Hartington <mike@ionic.io>
authorUrl: https://twitter.com/mhartington
description: Announcing Capacitor 3.0 Release Candidate
featuredImage: /v3-rc/cap-3-rc-img.png
featuredImageAlt: Capacitor 3.0 Beta
---

**Today I'm happy to announce that the release candidate for Capacitor 3.0 is finally here 🎉🎉🎉.**

Not too long ago, [we announced Capacitor 3.0 beta](https://capacitorjs.com/blog/announcing-capacitor-3-0-beta) and put out a call for feedback from the community. Thanks to all your feedback and testing, we've reached the point where we're ready to call Capacitor 3.0 feature complete and ready to move to RC.

If you're curious how to migrate to Capacitor 3.0, check out the [migration guide](https://capacitorjs.com/docs/v3/updating/3-0) we've published in our docs. This is a feature packed release, and we're excited for folks to upgrade. Some key features include:

- Split plugins into their own packages
- CLI `run` command
- TypeScript config file
- Autoloading of Android plugins

In addition to the [Beta release post](https://capacitorjs.com/blog/announcing-capacitor-3-0-beta), which includes more details on these changes, we've also written about the [plugin upgrade process here](https://ionic.io/blog/understanding-changes-to-capacitor-3-core-plugins/). Long story short, install the plugins you need and change your import statements

```bash
npm install @capacitor/<plugin>
```

```ts
// OLD
import { Plugins } from '@capacitor/core';
const { Camera } = Plugins;

// NEW
import { Camera } from '@capacitor/camera';
```

We're excited to ship this release and can't wait for you all to [give us your feedback](https://github.com/ionic-team/capacitor/issues)!

Cheers 🍻

<br />

<div align="center">

<blog-forum-link href="https://forum.ionicframework.com/t/announcing-capacitor-3-0-rc/205868">
👋 Join the discussion on the Forum
</blog-forum-link>

</div>
