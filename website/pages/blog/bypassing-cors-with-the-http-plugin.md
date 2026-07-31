---
title: Bypassing CORS with the Capacitor Community HTTP Plugin
slug: bypassing-cors-with-the-http-plugin
date: 2021-03-18 08:00:00
author: Tessa <mike@ionic.io>
authorUrl: https://twitter.com/halftes6
description: How to bypass CORS with the Http Plugin
featuredImage: /http/header-img.jpg
featuredImageAlt: Http Header image
---

> This is a guest post from Tessa. Tessa enjoys drawing and eating snacks, and currently works as a developer experience engineer. She frequently speaks about Vuejs and is a host on the [Enjoy The Vue](https://enjoythevue.io) podcast.

[CORS](https://www.codecademy.com/articles/what-is-cors), or Cross-Origin Resource Sharing, is not a popular word among developers working with front-end tech. A browser-enforced restriction mainly to protect users from a type of attack known as [cross-site request forgery](https://owasp.org/www-community/attacks/csrf), CORS is more well known for the headaches it causes web developers, and that’s before we even think about mentioning mobile applications! But what if there were another way?

Thanks to the [Capacitor Community](https://github.com/capacitor-community/welcome), there is! The Capacitor Community is an open-source working group that builds and maintains useful tools and plugins for Ionic’s [Capacitor runtime](https://github.com/ionic-team/capacitor), and today we’ll be looking at how to use its HTTP plugin to sidestep CORS and smoothly make successful [HTTP requests](https://www.tutorialspoint.com/http/http_requests.htm) across desktop and mobile devices.

Let’s use the plugin to power an advice-a-day app to familiarize ourselves with its inner workings and API.

![Sample quote from our app](/assets/img/blog/http/image.jpeg)

<!-- more -->

## What we’ll build

A Vue.js app loads and displays one cross-stitched piece of advice per day from the [Advice Slip JSON API](https://api.adviceslip.com/) and can be deployed cross platform.

## What we’ll learn

- How to make a GET request with the HTTP plugin
- How to get, set, and delete cookies

**Prior knowledge**

In order to follow along, it might be helpful to have some understanding of the following technologies:

- [Ionic](https://ionicframework.com/docs/vue/overview)
- [Vue.js](https://v3.vuejs.org/)
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [Async/Await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [Git](https://www.udacity.com/course/version-control-with-git--ud123)
- [Yarn](https://yarnpkg.com/getting-started) or [NPM](https://flaviocopes.com/npm)
- [Bash](https://www.educative.io/blog/bash-shell-command-cheat-sheet)

## Getting started

You can either [clone the startingPoint branch](https://github.com/tessaSAC/stitch-in-time/tree/startingPoint) or start your own project from scratch with the following steps:

1. Create a new Ionic Vue project as per [Creating a project with the Ionic CLI](https://ionicframework.com/docs/vue/quickstart#creating-a-project-with-the-ionic-cli)
2. `cd` into your project and [install the HTTP plugin](https://github.com/capacitor-community/http) with the following commands:

```shell
npm install @capacitor-community/http
npx cap sync
```

**😬 Tip**

If, after running both commands, you see the error `Capacitor could not find the web assets directory "pathToYourRepo/dist"`, try running `yarn build` or `npm build` and before `npx cap sync` a second time.

1. Open your project in your favorite code editor; I like to use [VSCode](https://code.visualstudio.com/).
2. _Optional:_ Download [HovdenStitch](https://www.fontspace.com/hovden-stitch-font-f43700), a free cross-stitch font, and move the `otf` file to your `public/assets` folder as `HovdenStitchRegular.otf`. Then in `src/App.vue`, copy and paste the below style tag at the bottom of the file to allow this custom font to be used across your app.

```html
<style>
  @font-face {
    font-family: 'HovdenStitch';
    src: url('../public/assets/HovdenStitchRegular.otf');
  }
</style>
```

**💡 Tip:**

Although for the purposes of this tutorial CSS styles will be contained within Vue’s [Single File Components](https://v3.vuejs.org/guide/single-file-component.html) for clarity, when it comes to your own projects, consider putting global styles in your [`src/theme folder`](https://ionicframework.com/docs/theming/themes).

## Designing the order of operations

The basic idea for this app’s functionality is that it will fetch and display a max of one piece of advice per 24 hours, regardless of whether the user refreshes the page or leaves the app, and erase the current advice approximately one hour before new advice is fetched.

While this concept may seem simple on its face, it requires quite a bit of state-tracking in order to ensure the expected behavior, and therefore you might be helpful to draw or write out a rough plan for how you expect things to go as I’ve done here:

![Overview of our app](/assets/img/blog/http/image-2.jpeg)

## Preparing HTTP helper functions

In `src/views/Home.vue`, replace your `script` tag with the below starter code:

```html
<script>
  import { defineComponent } from 'vue';
  import { IonPage } from '@ionic/vue';

  export default defineComponent({
    name: 'Home',
    components: { IonPage },

    data: () => ({
      advice: '', // Advice currently being displayed
      animationState: '', // Dynamic class that determines whether to fade advice in or out
      hourToFetchNewAdvice: null,
      lastSaveDate: null, // The last time we fetched new Advice
      today: new Date(),
    }),

    computed: {
      currentDate() {
        return this.today.getDate();
      },

      currentHour() {
        return this.today.getHours();
      },

      hourToEraseCurrentAdvice() {
        let oneHourPrior = this.hourToFetchNewAdvice - 1;
        if (oneHourPrior < 0) oneHourPrior = 23;
        return oneHourPrior;
      },
    },

    // When we'll check if advice data needs to be changed
    async ionViewWillEnter() {
      // For more on`ionViewWillEnter`
      // see: https://ionicframework.com/docs/vue/lifecycle#guidance-for-each-lifecycle-method
    },

    methods: {},
  });
</script>
```

> Optional: Move the `script` tag to be at the top of the file, above the `template` tag as per the [Vue Style Guide](https://vuejs.org/v2/style-guide/#Single-file-component-top-level-element-order-recommended). Once you get used to this pattern it can speed up your development process by reducing the scrolling between `script` and `template` and between `template` and `style`.

The first thing we’ll need to do is import our HTTP plugin by adding the following code to the top of the `script` tag as per the [README](https://github.com/capacitor-community/http/blob/455dc0cb0add1b872dbc914077b9754df4d8c0f3/src/definitions.ts#L106):

```typescript
import '@capacitor-community/http';
import { Plugins } from '@capacitor/core';
const { Http } = Plugins;
```

Now we have access to the HTTP plugin and its helper methods inside this component, so we can add the following functions to our component’s `methods`:

```typescript
async fetchAdvice() {
  return await Http.request({
    method: 'GET',
    url: 'https://api.adviceslip.com/advice',
  })
  .then(({ data }) => {
    // Set dynamic class to fade in text
    this.animationState = 'fadeIn'
    this.resetAnimationState()

    // Save new advice
    this.advice = JSON.parse(data).slip.advice.toUpperCase()
      // In other words:
      // const dataInJs = JSON.parse(data)
      // const slip = dataInJs.slip
      // this.advice = slip.advice
      // this.advice = this.advice.toUpperCase() — // font supports upper case only

    // Update lastSaveDate
    this.lastSaveDate = this.currentDate
  })
},

updateAdvice() {
  // If 24h have passed, fetch new advice
  if(this.currentHour === this.hourToFetchNewAdvice && this.currentDate != this.lastSaveDate) this.fetchAdvice()

  // If 23 hours have passed, start fading out current advice
  else if (this.currentHour === this.hourToEraseCurrentAdvice && this.advice) {
    // Set dynamic class to fade out text
    this.animationState = 'fadeOut'
    this.resetAnimationState()

    // Clear advice from state after the fade out animation ends
    setTimeout(() => {
      this.advice = ''
    }, 10000)
  }

  // Check every 10m if it's time to fetch/erase advice
  setTimeout(this.updateAdvice, 600000)
},

// Clear animation from advice after one playthrough
// A safer approach might be to listen for `transistionend`
resetAnimationState() {
  setTimeout(() => {
    this.animationState = ''
  }, 10000)
}
```

The `fetchAdvice` method is almost identical to the `GET` example in the HTTP Plugin’s README, but its syntax has been reordered to fit within Vue’s `methods` style. The `HTTP.request` method allows us to make [HTTP calls](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) across different deploy targets without worrying about CORS issues. Here we’re using it to request advice from the [Advice Slip JSON API’s random advice GET endpoint](https://api.adviceslip.com/#endpoint-random).

Next, we’ll want to add the following code to `ionViewWillEnter` to fetch advice when the page loads:

```typescript
async ionViewWillEnter() {
  // If we haven't stored an hourToFetchNewAdvice before, calculate and store that and hourToEraseCurrentAdvice
  if(!this.hourToFetchNewAdvice) this.hourToFetchNewAdvice = this.currentHour

  this.updateAdvice()
},
```

## Displaying our cross-stitched advice

Open `views/Home.vue` and replace the existing `template` with the below code:

```html
<template>
  <IonPage>
    <div class="Home">
      <img src="yourImageHere" alt="Don't forget to add alt text!" />
      <p class="embroidery" :class="animationState">{{ advice }}</p>
      <img src="yourImageHere" alt="Don't forget to add alt text!" />
    </div>
  </IonPage>
</template>
```

We won’t need to mess with this too much going forward, but let’s briefly about what’s happening here:

- This _view_, or page, is wrapped in the `IonPage` component to [enable us to leverage component lifecycle hooks](https://ionicframework.com/docs/vue/lifecycle).
- The `Home` class will be used to visually center and style advice in the viewport.
- The `img` tags are placeholders for you to add personalized decorative flourishes to surround your advice; feel free to also [copy the images from the base repo](https://github.com/tessaSAC/stitch-in-time/tree/main/public/assets) or remove them altogether.
- The `p` tag is where we’ll render advice from the Advice Slip JSON API.
- The [v-bound](https://v3.vuejs.org/api/directives.html#v-bind) `animationState` class enables us to dynamically fade advice in and out as necessary.

Next, replace the `style` tag with the following:

```html
<style scoped>
  /* Center and style the content */
  .Home {
    background: white;
    height: 100%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;

    /* Apply the custom font and style the text */
    font-family: 'HovdenStitch';
    font-size: 5rem;
    color: #002657;
    text-align: center;
  }

  /* Allow the flourishes to visually curve more closely around the text */
  .embroidery {
    max-width: 686px;
    position: absolute;
    top: 53%;
    transform: translateY(-75%);
  }

  /* Animate new advice being added and old advice being removed */
  .fadeIn {
    animation: fadeIn ease 10s;
  }
  .fadeOut {
    animation: fadeOut ease 10s;
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  @keyframes fadeOut {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
</style>
```

Now if you run `yarn serve` or `npm serve`, you should be able to see some advice in your local preview in your browser!

## Persisting state

While it’s great that our advice is rendering and all, you may have noticed a small catch: we get a new piece of advice on every page load, even though our `updateAdvice` method is supposed to wait 24 hours before fetching new advice. This is because our state is stored only within the component, which means when the component disappears, so does our data.

To get around this, we’ll store some of our state in [cookies](https://en.wikipedia.org/wiki/HTTP_cookie), which can outlive the component lifecycle.

To get started, add the following helpers to the component’s `methods`:

```typescript
async setCookie(optionsObject) {
  const cookie = await Http.setCookie({
    ...optionsObject,
    ageDays: 2,  // Set max number of days to save cookie
  })
},
```

This method is very similar to the `setCookie` example in the HTTP Plugin’s README, but its syntax has been reordered to fit within Vue’s `methods` style. It has also been augmented to expire any cookies after two days.

One potential point of confusion here is that when looking at the [Http.setCookie source code](https://github.com/capacitor-community/http/blob/455dc0cb0add1b872dbc914077b9754df4d8c0f3/src/web.ts#L112), it may seem like this method is behaving essentially identically to the [browser’s HTTP Set-Cookie approach](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie); however, if you try to pass in a value for `name` or `SameSite`, you will quickly discover this is not so. The [method’s interface](https://github.com/capacitor-community/http/blob/455dc0cb0add1b872dbc914077b9754df4d8c0f3/src/definitions.ts#L99) reveals that this method will only take four potential pieces of data: `url`, `key`, `value`, and `ageDays`, where `key` becomes the cookie’s `name`, and `ageDays` its <code>Expires</code> value.

```typescript
async deleteCookie(optionsObject) {
  return await Http.deleteCookie(optionsObject)
},
```

This method is similar to the `deleteCookie` example in the HTTP Plugin’s README, with the addition of an optional `optionsObject` argument which can be passed to the HTTP Plugin’s `deleteCookie` method. If we check out [the interface for this method in the source code](https://github.com/capacitor-community/http/blob/455dc0cb0add1b872dbc914077b9754df4d8c0f3/src/definitions.ts#L112), we can see that it will accept either a `key` or a `url` to specify which cookie should be deleted.

```typescript
async getCookie(key) {
  const allCookiesWrapper = await Http.getCookies()
  const allCookies = allCookiesWrapper.value

  for (let i = 0; i < allCookies.length; ++i) {
    const currentCookie = allCookies[i]
    if(currentCookie.key === key) return currentCookie.value
  }

  return null
},
```

This method is similar to the `getCookies` example in the HTTP Plugin’s README. However, that method will return an Array of all cookies, so if we want to get a specific one we’ll have to filter the list ourselves.

Note that `forEach` will not work here as the loop cannot be short-circuited by a `return` statement.

Now that we have access to some cookie helper methods, let’s use them.

First, add them to `ionViewWillEnter`:

```typescript
async ionViewWillEnter() {
  // Check if there are a stored date, hour, and advice in cookies, i.e. outside component/session state
  await Promise.all([
    this.getCookie('lastSaveDate').then(lastSaveDate => this.lastSaveDate = +lastSaveDate),
    this.getCookie('hourToFetchNewAdvice').then(hourToFetchNewAdvice => this.hourToFetchNewAdvice = +hourToFetchNewAdvice),
    this.getCookie('advice').then(advice => this.advice = advice)
  ])

  if(!this.hourToFetchNewAdvice) this.hourToFetchNewAdvice = this.currentHour

  // Store the hourToFetchNewAdvice in cookies regardless so it doesn't expire
  this.setCookie({
    key: 'hourToFetchNewAdvice',
    value: this.hourToFetchNewAdvice,
  })

  this.updateAdvice()
},
```

Next, update `fetchAdvice`:

```typescript
async fetchAdvice() {
  return await Http.request({
    method: 'GET',
    url: 'https://api.adviceslip.com/advice',
  })
  .then(({ data }) => {
    this.animationState = 'fadeIn'
    this.resetAnimationState()

    this.advice = JSON.parse(data).slip.advice.toUpperCase()

    // Save the advice to a cookie, too
    this.setCookie({
      key: 'advice',
      value: this.advice,
    })

    this.lastSaveDate = this.currentDate

    // Update lastSaveDate in cookies also
    this.setCookie({
      key: 'lastSaveDate',
      value: this.currentDate,
    })
  })
},
```

And `updateAdvice`:

```typescript
updateAdvice() {
  if(this.currentHour === this.hourToFetchNewAdvice && this.currentDate != this.lastSaveDate) this.fetchAdvice()

  else if (this.currentHour === this.hourToEraseCurrentAdvice && this.advice) {
    this.animationState = 'fadeOut'
    this.resetAnimationState()

    setTimeout(() => {
      this.advice = ''

      // Erase the advice from cookies as well
      this.deleteCookie({ key: 'advice' })
    }, 10000)
  }

  setTimeout(this.updateAdvice, 600000)
},
```

## **Celebrate!**

We did it! Now the app will fetch and erase advice once every 24 hours as designed. 🎉

## **Review**

We covered a lot of concepts from the Capacitor Community HTTP Plugin today including:

- How to make an HTTP `GET` request
- How to save a cookie
  - Which properties of a cookie can be set with the plugin
- How to get a _specific_ cookie
- How to delete a _specific cookie_
- How to use the source code to answer questions not covered by the README

## Next steps

What’s next in the exciting world of cross-platform Vue apps? If you’re short on ideas, here’s a few suggestions for next steps

- [Offline first](https://ionic.io/blog/best-practices-for-building-offline-apps): Try persisting state using another method, such as service-worker caching
- PWA/mobile: Try deploying the app to your phone as a [Progressive Web App](https://ionicframework.com/docs/vue/your-first-app/6-deploying-mobile) or a native [Android/iOS one](https://ionicframework.com/docs/vue/your-first-app/6-deploying-mobile)
  - Note: If you opted to generate your own project for this tutorial instead of cloning from the repo, you may need to follow some [additional installation steps](https://github.com/capacitor-community/http#installation) to get the HTTP Plugin working on Android
- Loading state: How might you save the state of the app such that if the user exits while advice is fading in or out, the transition will resume at the same spot tnext time they reopen the app?
- [Another API](https://dev.to/biplov/15-fun-apis-for-your-next-project-5053): There are lots of free APIs out there; how would you apply the HTTP Plugin to a new project?

🎉 Happy coding! 🎉
