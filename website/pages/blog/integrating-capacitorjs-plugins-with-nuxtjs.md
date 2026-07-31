---
title: Integrating CapacitorJS Plugins with NuxtJS
slug: integrating-capacitorjs-plugins-with-nuxtjs
description: Learn how to integrate Capacitor with NuxtJS
date: 2020-08-28 08:00:00
author: Dan Pastori <dan@521dimensions.com>
authorUrl: https://twitter.com/danpastori
---

> The following is a guest blog post from Dan Pastori of [Server Side Up](https://serversideup.net). Server Side Up is an online community that shares tutorials and resources about Vuejs, Laravel, WordPress, and more recently have started creating resources on how to deliver native apps with Capacitor.

Using CapacitorJS with NuxtJS is a perfect combination. NuxtJS allows you to develop powerful, modern fronteneds using VueJS. Combined with CapacitorJS, you can take those modern frontends, compilie them to mobile, and deploy to the platform of your choice.

Working with CapacitorJS, the power of native device features is there for you to integrate into your application. These features include GPS, Haptics, Camera, Filesystem, etc. When I structure a NuxtJS frontend, I like to design it in a way that allows me to re-use important modules through-out components, pages, and layouts.

<preview-end />

## Making CapacitorJS Plugins Globally Availble

After you've run through the install of CapacitorJS, you have a variety of plugins available for you to [integrate into your app](https://capacitorjs.com/docs/apis). Let's check out the [Geolocation plugin](https://capacitorjs.com/docs/apis/geolocation) for a good example. To use the Geolocation plugin, you have to first import `Plugins` from the `@capacitor/core` library:

```typescript
import { Plugins } from '@capacitor/core';
```

Then decouple the `Geolocation` plugin from the `Plugins` object:

```typescript
const { Geolocation } = Plugins;
```

From here, you can make calls to the `Geolocation` plugin within your components. This works really well! However, in a NuxtJS setting I like to make these plugins globaly avaliable by wrapping them in a NuxtJS plugin. Why would you need to do this? Doesn't this add more work? Besides allowing you to access the plugins globally which cleans up how much you need to import, there's one main reason you'd do this: Server-side Rendering.

Server-side Rendering is extremely important if you using NuxtJS with CapacitorJS for mobile AND web. Besides the speed of your application, if you don't server-side render, your app won't be optimized for search engines. Since NuxtJS makes the headaches of SSR a thing of the past, let's optimize our app to make use of both SSR and CapcitorJS Plugins.

Using [NuxtJS plugin architecture](https://nuxtjs.org/guide/plugins/#inject-in-root--context), you can make a function available across the entire application. This is what we will be doing with the CapacitorJS plugins. Let's use the Geolocation plugin as our example.

Within the root directory of your NuxtJS install, there's a `/plugins` directory. In that directory add a file `geolocation.js` and populate it with the following code:

```typescript
import { Plugins } from '@capacitor/core';

const { Geolocation } = Plugins;

export default function ({ app }, inject) {
  inject('CapacitorGeolocation', Geolocation);
}
```

This should look very similar to how you would normally incorporate a CapacitorJS plugin into your application, however, we are wrapping it within a NuxtJS plugin. What this does is creates a function that accepts a decoupled `app` variable (your entire NuxtJS app), and an `inject()` method as parameters. We then take `inject()` method and pass two parameters. The first parameter is the key in how you will globally access the plugin (we will discuss soon). The second parameter is the `Geolocation` plugin from Capacitor that we included on top of our plugin.

We now have a NuxtJS plugin that injects a CapacitorJS plugin globally. This will work with pretty much any of the CapacitorJS plugins. The next step is to make NuxtJS aware of this plugin and make sure we don't run into any SSR errors!

## Preventing Server-side Rendering (SSR) errors

Now that we have our plugin created, we have to make NuxtJS aware of it. NuxtJS ships with a wonderful `nuxt.config.js` file that sits at the root of the install. In this file, there's a key called `plugins` that contains an array.
In this array, we need to register our NuxtJS plugin that wraps our CapacitorJS plugin. To do that, add the following code:

```typescript
plugins: [
    {
      src: '~/plugins/capacitor.js',
      mode: 'client'
    },
}
```

The reason we chose this way is so we can use `mode: 'client'`. This is the crucial piece that makes CapacitorJS plugins work in your NuxtJS app without any SSR errors. So most CapacitorJS plugins require a Browser object to work with. When loading up the compiled code in the browser of your choice, this isn't an issue, a Browser object exists. However, when server-side rendering your application, the Browser object does NOT exist. This will cause a variety of errors and your app won't build correctly.

The small object that we included in the `plugins` array includes a `src` key which is the source of the plugin. It also includes a `mode` key which is set to `client`. This will ignore the plugin if you are building it through SSR, but include the plugin in the final package when it's sent to the browser.

If you are just building a mobile application, you are probably just compiling as a Single Page Application. Choosing to compile as an SPA or SSR, the plugin will be included the same. If you are building a web and mobile application from the same code-base, you can swap out the compilation mode and your CapacitorJS plugin will work as expected!

Now that we have our plugin registered globally, how do we access it?

## Accessing Plugins within NuxtJS Pages and Components

Since we have our plugin registered globally within our NuxtJS app, we can access it from any component. Let's say we want to get the current coordinates of our user on all platforms. We'd call the following method within our component:

```typescript
const coordinates = await this.$CapacitorGeolocation.getCurrentPosition();
```

Since the method itself is asynchronous, we can use the `async/await` syntax and grab the coordinates. Let's break down the structure of this method call: First we have `this` which references our NuxtJS application. Next, we reference the injected CapacitorJS Geolcation plugin by the name we provided, `$CapacitorGeolocation`. From there, we have full access to any of the CapacitorJS Geolocation plugin's methods that have been documented! In this example we call the `getCurrentPosition()` method which returns the coordinates of the current user.

By structuring the plugins this way, we can use either SPA/SSR build methods and have access to the CapacitorJS plugins from anywhere within the application. If you want to learn more aobut how to build an API along with your own Web + Mobile Applications, we have [a book available](https://serversideup.net/ultimate-guide-to-building-apis-and-spas-with-laravel-and-vuejs/). In this book we go through the entire process of centralizing front end codebases and developing your own API with secure authentication practices. The book uses Laravel PHP for the API and NuxtJS + CapacitorJS for the frontend. You will learn how to build an app called ROAST which is available on the [web](https://roastandbrew.coffee/), [iOS App Store](https://apps.apple.com/us/app/roast-brew-coffee/id1510419686) and [Android App Store](https://play.google.com/store/apps/details?id=coffee.roastandbrew.mobile) and browse the source code behind it.

Hope this helps and I can't wait to see what gets created with CapacitorJS!
