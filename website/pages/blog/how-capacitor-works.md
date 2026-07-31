---
title: How Capacitor Works
slug: how-capacitor-works
description: How does Capacitor, a cross-platform native runtime for web apps, work on the inside?
date: 2020-08-13 08:00:00
author: Max Lynch <max@ionic.io>
authorUrl: https://twitter.com/maxlynch
---

Capacitor is a cross-platform native runtime for Web Native apps.

At a high level, that means Capacitor takes a modern web app, and then packages it up to run on iOS, Android, and PWA with access to native platform features and OS-level controls.

Capacitor then acts as the _runtime_ facilitating communication between the web app and the underlying OS.

Let's dig in and explore how Capacitor works under the hood.

<preview-end />

## The basics

At a high level, Capacitor does this:

![Basic Capacitor Diagram](/assets/img/blog/how-capacitor-works/basic.png)

But that's pretty simplistic, if we zoom in a bit and bring in your app code, we see that Capacitor is made up of a few individual components:

![Zoomed Capacitor App](/assets/img/blog/how-capacitor-works/zoomed.png)

In this diagram, we see that your web app runs inside of a Web View. A Web View is a native OS control that provides a streamlined, chrome-less browser instance. If you imagine a typical web browser, a ton of overhead comes from the chrome and experience around the actual browsing frame. A Web View is just one instance of that browsing frame, so it's very light weight.

Most of the magic happens in the Native Bridge and the Runtime, so let's explore those:

## Native Bridge

![Bridge](/assets/img/blog/how-capacitor-works/bridge.png)

That Web View needs a way to access native functionality, interact with OS level native controls, and access custom native code or 3rd party plugins. It does that using the Native Bridge inside of Capacitor.

The Native Bridge is where Capacitor's _runtime_ JS API, including all known native plugins and their methods, are exported to the Web View. The runtime API is different from the `@capacitor/core` API that is imported directly into your web app, but they work together to enable Capacitor APIs to work across all supported platforms.

Capacitor loads all known plugins that have been installed or coded directly into the native project, and then exports `window.Capacitor.Plugins` containing every loaded plugin and every known method that plugin has exported to the Web View.

Finally, the bridge manages message passing and tracking native invocations between the Web View and the native runtime.

## Runtime

![Runtime](/assets/img/blog/how-capacitor-works/runtime.png)

The Native runtime is where calls from the Web View get routed to native plugins and custom native code.

When the app first starts, the runtime loads any installed plugins and custom native plugins. The runtime also initializes the Web View and injects the JavaScript Symbols for all known plugins into the Web View.

When plugins are invoked, the runtime processes each invocation as a message, constructs a method call to the corresponding plugin, and executes it.

All calls in Capacitor are asynchronous, so the runtime manages a set of "active" calls that have yet to be completed. These calls might be as simple as calling a Native API, or as complicated as opening an intent and processing the result of another app (such as the Camera on Android).

Once those calls complete, a message is constructed and sent back to the Web View, which ultimately causes the original plugin call in your app to resolve.

## Capacitor apps are native

![Native](/assets/img/blog/how-capacitor-works/native.png)

Capacitor works by extending a Web View with additional functionality and indirect access to full native functionality through plugins and custom native code.

Capacitor apps _are native apps_. The project files used to build the native iOS and Android binaries is a plain iOS app for Xcode and a plain Android app using Gradle. This means teams can add arbitrary native code to the app and invoke it from the Web View through the Capacitor Plugin API. If you'd like to explore this in detail, read how [Capacitor Apps are Native Apps](https://medium.com/@maxlynch/cordova-ionic-apps-are-native-apps-64f9e1a995d9).

In the diagram above, the native project contains our built web assets which will be some kind of modern JS app that is built and copied to the native project. That modern JS app imports the `@capacitor/core` library to code against the JavaScript symbols Capacitor generates at runtime (and to support Web APIs like [Camera](https://capacitorjs.com/docs/apis/camera) or [Share](https://capacitorjs.com/docs/apis/share) for PWAs).

During the `copy` step from the Capacitor CLI tools, the `native-bridge.js` is copied to the project which contains Capacitor's message passing bridge on the Web View side.

Finally, any Capacitor plugins or custom native code will be in the project as well, along with any libraries that code requires.

One note about Progressive Web Apps (PWA): when building a PWA, you simply need to deploy your built web app somewhere to the web. There really is no additional step because the `@capacitor/core` library contains all the functionality needed for Capacitor plugins that have web support, such as [Camera](https://capacitorjs.com/docs/apis/camera), [Filesystem](https://capacitorjs.com/docs/apis/filesystem), or [Share](https://capacitorjs.com/docs/apis/share).

## Conclusion

Capacitor provides a runtime for Web Apps, so teams typically spend most of their time building their web app, making sure it works well on mobile form factors and has a mobile UI experience that users expect (UI frameworks like [Ionic Framework](https://ionicframework.com/) provide this experience out of the box).

This is in contrast to many other cross-platform mobile technologies that use native system controls. While there are benefits to doing that, the benefits to using Capacitor are a pure web development experience, truly write once run anywhere, and compatibility with the full web development ecosystem and hiring market.
