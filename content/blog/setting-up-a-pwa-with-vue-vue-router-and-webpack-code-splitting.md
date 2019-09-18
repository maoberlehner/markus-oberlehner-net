+++
date = "2017-10-01T09:47:23+02:00"
title = "Setting up a PWA with Vue, Vue Router and webpack Code Splitting"
description = "Learn how to build a progressive web app using Vue, Vue Router, code splitting with webpack and the Extract Text Plugin."
intro = "Today we will create a progressive web app (PWA) based on Vue.js with Vue Router, featuring code splitting with webpack. Luckily, building progressive web apps has never been easier. Thanks to the hard work of many wonderful people in the open source community, every major JavaScript framework comes with an effortless way of kickstarting a new PWA powered project via a simple CLI command..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "PWA", "webpack", "code splitting"]
+++

Today we will create a progressive web app (PWA) based on Vue.js with Vue Router, featuring code splitting with webpack.

Luckily, building progressive web apps has never been easier. Thanks to the hard work of many wonderful people in the open source community, every major JavaScript framework comes with an effortless way of kickstarting a new PWA powered project via a simple CLI command.

A special thanks goes to [Addy Osmani](https://twitter.com/addyosmani) who is a driving force behind the [Vue PWA template](https://github.com/vuejs-templates/pwa) and also a contributor to many PWA related open source projects like [preact-cli](https://github.com/developit/preact-cli).

## Getting started

First of all, let's start with installing the Vue CLI tool.

```bash
# Install the Vue CLI globally.
npm install -g vue-cli
```

After installing the Vue CLI tool globally, we're able to create a new Vue powered project with a simple CLI command.

```bash
# Initialize a new Vue project using the PWA
# template and giving it the name `pwa-demo`.
vue init pwa pwa-demo
```

The Vue CLI tool is asking you some questions – don't worry, they're easy. When the CLI tool is asking you if it should install the Vue Router, choose `y` for yes.

After finishing the installation process, we're just three more CLI commands away from launching our new PWA powered Vue project.

```bash
# Change into the newly created project directory.
cd pwa-demo

# Install all necessary dependencies.
npm install

# Run the webpack powered development server.
npm run dev
```

Now we're ready for developing an awesome new PWA powered application with Vue. By running `npm run build` we can build our PWA and deploy the contents of the `dist` directory, which is created by this command, on our web server.

## Code splitting

Client side rendered single page applications (SPA) are currently the way to go if you're planning to build an app like experience in the browser. Although they are awesome and with tools like webpack, ES6 and npm, developing single page JavaScript applications has never been more enjoyable, there are many things you can do wrong when developing a SPA.

One major downside of single page applications is that they can grow to an enormous size. I've seen single page applications which are sending multiple megabytes of JavaScript on initial page load. This is a huge burden not only on the loading time of the website, but also on the time it takes to render the site for the first time, because the browser has to parse this huge amount of JavaScript first before it can render anything meaningful. And although many people argue, that the first load doesn't matter as much with an SPA, because subsequent visits are loading very fast thanks to caching, the time the browser takes to parse several megabytes of JavaScript is still critical, especially on low end smartphones.

Luckily tools like webpack can help us dealing with those problems. By utilizing the webpack code splitting functionality, we can reduce the JavaScript code which is shipped to the client to view a specific page of our SPA. With code splitting, webpack determines which parts of the code are necessary to render a certain view of our SPA and creates a separate file (chunk) containing only this code. Those chunks are prefetched by the browser, therefore rendering other parts of your SPA, which depend on code in those separate chunks, works almost as fast as if you were loading all the code upfront, but the initial loading time can be decreased drastically.

## Adding a new Vue Router route

First of all, to make things more interesting, let's add a new route to the existing `Hello` route. To do so, we make a copy of the `Hello.vue` component (located in the `src/components` directory) named `World.vue`. Change the contents of `World.vue` as you like.

Now open your Vue Router configuration file `src/router/index.js` and add a new route to display our newly created `World.vue` component.

```js
import Vue from 'vue';
import Router from 'vue-router';
import Hello from '@/components/Hello';
import World from '@/components/World';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello,
    },
    {
      path: '/world',
      name: 'World',
      component: World,
    },
  ],
});
```

After making those changes, you can already access the newly created route by pointing your browser to `http://localhost:8080/#/world`.

Let's add a simple navigation to make it a little bit more convenient to switch between our two routes.

```html
<template>
  <div id="app">
    <header>
      <span>Vue.js PWA</span>
    </header>
    <main>
      <img src="./assets/logo.png" alt="Vue.js PWA">
      <ul>
        <li><router-link to="/">Hello</router-link></li>
        <li><router-link to="/world">World</router-link></li>
      </ul>
      <router-view></router-view>
    </main>
  </div>
</template>
```

What you can see above is the template code of the apps main component `src/App.vue` with a new unordered list element containing router links to our two routes `/` and `world`. If you go to your browser, you can see two links, which you can use to navigate to the two routes, beneath the Vue logo.

## Serving the production app

Currently we are serving our app in development mode, to see how our app will be served to our users, we have to build the app for production and serve the generated production app instead of the webpack development version.

```bash
npm install --save-dev http-server
```

The http-server package can be used to quickly start a new http web server, serving the contents of any directory we wish.

```json
"scripts": {
  "dev": "node build/dev-server.js",
  "start": "node build/dev-server.js",
  "build": "node build/build.js",
  "lint": "eslint --ext .js,.vue src",
  "serve-production": "npm run build && http-server dist -p 8888"
}
```

To quickly start a new web server, serving the production code of our PWA, we can add a new script to the scripts section of our `package.json` file. Run `npm serve-production` and after the http-server booted, open `http://localhost:8888/#/` in your browser, to view the production version of our web app.

<div class="c-content__figure">
  <div class="c-content__broad">
    <img srcset="/images/2017-10-01/vue-pwa-network-tab1.png 2x" alt="Vue PWA requests without code splitting">
  </div>
  <p class="c-content__caption">
    <small>Vue PWA requests without code splitting</small>
  </p>
</div>

If you're looking at the network tab of your browser, you can see, that the browser is loading three JavaScript and one CSS file. The file called `app.SOME-RANDOM-HASH.js` currently contains all the code needed to render our application, including the code of `World.vue` although we're currently viewing `Hello.vue`.

## Configuring the Vue Router for code splitting

To make webpacks code splitting feature work with our newly created Vue PWA, we have to modify our Vue Router configuration accordingly.

Let's change the current, wasteful approach of loading all the code needed to render all our routes upfront, by configuring Vue Router to utilize the power of webpacks code splitting feature.

```js
import Vue from 'vue';
import Router from 'vue-router';

const Hello = () => import('@/components/Hello');
const World = () => import('@/components/World');

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello,
    },
    {
      path: '/world',
      name: 'World',
      component: World,
    },
  ],
});
```

Instead of immediately importing our components like we did before by using `import Hello from '@/components/Hello';` we're now using the new dynamic import JavaScript feature `const Hello = () => import('@/components/Hello');`. Using dynamic imports, triggers webpack to split the code and create separate chunks for every dynamically imported file.

Because we're currently running the `serve-production` script, we have to manually start a new build by running `npm run build` to see the effects of the changes to our code in the production version of our app. Be aware that our progressive web app is using a Service Worker to cache certain assets, make sure to hard reload the web app after the build process is ready, otherwise you may see the cached version of the web app instead.

## Lazy loading and prefetching

If you take a look at the network tab after hard reloading our PWA, you can see that we're now loading two additional files: `0.SOME-RANDOM-HASH.js` and `1.SOME-RANDOM-HASH.js`.

<div class="c-content__figure">
  <div class="c-content__broad">
    <img srcset="/images/2017-10-01/vue-pwa-network-tab2.png 2x" alt="Vue PWA requests with code splitting">
  </div>
  <p class="c-content__caption">
    <small>Vue PWA requests with code splitting</small>
  </p>
</div>

Those are the separate chunks which webpack is automatically creating for us. Two things might seem confusing at first: Why is `1.SOME-RANDOM-HASH.js` (the chunk containing `Hello.vue`) loaded two times and why is `0.SOME-RANDOM-HASH.js` (the chunk containing `World.vue`) loaded at all?

The answer is prefetching. There are two `1.SOME-RANDOM-HASH.js` requests, because the script is prefetched and then loaded immediately because it is needed to render the current page. And `0.SOME-RANDOM-HASH.js` is loaded (although it is not needed yet) because it is prefetched by the browser, which makes loading the `/hello` route blazing fast.

## Configuring the Extract Text Plugin for code splitting

The Vue PWA template we've used to set up our app, is utilizing the Extract Text Plugin for webpack to extract the CSS code from the JavaScript code. This has the advantage of faster rendering and, under some circumstances, faster loading of the app.

If you closely inspect the `dist/static/css/app.SOME-RANDOM-HASH.css`, file generated by `npm run build`, you might notice that the styles of `Hello.vue` and `World.vue` are missing. This is because the Extract Text Plugin does not extract styles from dynamically imported chunks by default. Instead the styles are contained in the JavaScript code of the chunks.

There is one upside to this approach: all the code needed to render a dynamically imported module is lazy loaded. However there is also the downside of slower rendering of CSS inlined in JavaScript code by the browser. The perfect solution would be to create separate chunks for the CSS code as well and lazy load them when they are needed. But this is not possible by now.

If you want to extract the CSS styles from the generated JavaScript chunks too, you can configure the Extract Text Plugin to also extract the CSS code from dynamically loaded chunks by setting the `allChunks` option to `true`. That way all the styles of our application end up in one single CSS file. This has the upside of better gzip compression and faster rendering but the downside of having to load all the styles upfront.

```js
// build/webpack.prod.conf.js
new ExtractTextPlugin({
  filename: utils.assetsPath('css/[name].[contenthash].css'),
  allChunks: true,
})
```

## Wrapping it up

When deciding which way to go when building a new website or platform, keep in mind that not every website has to be a web app. There still are a multitude of use cases where you might be better off building a traditional, server rendered, or even static website.

On the other hand, if you're planning to build a product with an app like experience, there is currently no better approach than building a progressive web app. But keep in mind: with new technologies come new challenges.
