+++
date = "2020-12-27T11:18:18+02:00"
title = "Building Vue.js Applications Without webpack"
description = "Learn how to set up a Vue.js project without webpack or any other complicated build tools, including features like code splitting and automatically refreshing the browser during development."
intro = "In the good old times, creating a JavaScript-enhanced website was straightforward: create a .html file, add a <script> tag, write some JavaScript, and open the file in the browser. Nowadays, building web applications requires complex build toolchains, a node_modules directory with gigabytes of dependencies, and a complicated webpack configuration file..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:ED8936,f_auto,q_auto,w_1014,h_510/v1542158523/blog/2020-12-27/vue-without-webpack"]
+++

In the good old times, creating a JavaScript-enhanced website was straightforward: create a `.html` file, add a `<script>` tag, write some JavaScript, and open the file in the browser. Nowadays, building web applications requires complex build toolchains, a `node_modules` directory with gigabytes of dependencies, and a complicated webpack configuration file.

But is it really necessary to use webpack to build modern JavaScript applications? Is it really necessary to use webpack to build Vue.js-powered applications? The answer is no. Thanks to native browser support for [JavaScript Modules](https://developer.mozilla.org/de/docs/Web/JavaScript/Guide/Modules), it's easier than ever to build powerful JavaScript applications without using any build tools.

This article discusses ways to build Vue.js applications without relying on a complicated build process and numerous third-party dependencies. At the same time, we don't want to do without powerful functionality like code splitting, and the development process should be as comfortable as possible.

You can [find the final code using `htm` for rendering on GitHub](https://github.com/maoberlehner/goodbye-webpack-building-vue-applications-without-webpack).

- [Building Vue Applications Without a Build Step](#building-vue-applications-without-a-build-step)
- [Using Vue with htm](#using-vue-with-htm)
- [Runtime Bundling with esbuild](#runtime-bundling-with-esbuild)
- [webpack Alternatives: Rollup and Vite](#webpack-alternatives-rollup-and-vite)

## Building Vue Applications Without a Build Step

Thanks to modern browsers and mostly thanks to features like JavaScript Modules, bundling via a separate build step is not strictly necessary even when building medium-sized web apps. But because we're used to `.vue` Single File Component files, it is not that simple in the Vue.js ecosystem.

First things first, there is no way to make `.vue` files work without a build step. But thanks to [htm](https://github.com/developit/htm), we can get pretty close to the Vue SFC experience.

### Setting up a Development Environment with Automatic Reloading

To enhance security, ES6 Modules are subject to [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy), which means we have to run a local server to run JavaScript applications using this technology. Unfortunately, that means we have to install an npm dependency – but that'll be the only one, I promise.

```bash
npm install --save-dev browser-sync
```

[Browsersync](https://browsersync.io/) makes it possible to run a local web server and provides the feature of automatically reloading your browser when a change to a file is detected – this is incredibly convenient during development and a (not quite as sophisticated) replacement for the webpack hot reloading feature.

After installing Browsersync, we can add a new npm script to our `package.json` file, with which we can start a local development server.

```json
{
  "scripts": {
    "start": "browser-sync start --server 'src' --files 'src' --single"
  }
}
```

In the `start` script you can see above, we tell Browsersync to start a server serving the contents of and watching for changes to files inside the `src` directory. The `--single` option triggers the Browsersync server to work in SPA mode.

<div>
  <hr class="c-hr">
  <a
    style="display: block; margin-top: 1em;"
    href="https://www.creative-tim.com/templates/vuejs/?partner=143346"
  >
    <img
      src="/images/q_auto,f_auto/v1532158515/blog/assets/high-quality-templates"
      alt="Screenshots of three premium Vue.js templates."
      style="max-width: 100%; height: auto;"
      loading="lazy"
      width="1240"
      height="576"
    >
  </a>
  <hr class="c-hr">
</div>

### The Project File Structure

So let's take a closer look at how we structure our project directory. Next, you can see the basic directory and file structure of our application.

```bash
.
├── package.json
└── src
    ├── components/
    ├── index.html
    └── main.js
```

The `index.html` file is the core of our application so let's start with this file.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>Hello World!</title>
    <!-- This is a development version of Vue.js! -->
    <script src="https://unpkg.com/vue@3.0.4"></script>
    <script src="/main.js" type="module"></script>
    <!--
      To prevent waterfall-loading, we preload
      all the JS Module files of our application.
    -->
    <link rel="modulepreload" href="/components/App.js">
    <link rel="modulepreload" href="/components/BaseButton.js">
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

Above, you can see the very minimal HTML code needed for our application. The most important part of the application is the JavaScript code. With the first `<script>` tag, we're loading a version of Vue.js with some development console outputs enabled (do not use this in production!). The second JavaScript file is the entry point of our application – note the `type="module"` attribute on the script tag; this tells the browser that this is a JavaScript file using ES6 Modules.

One problem with using JavaScript Modules without a bundler is waterfall-loading. In our example, `main.js` imports `App.js` and `App.js` imports `BaseButton.js`. So the browser needs to load the files in this order before it can mount our little Vue application. But we can speed this up by [using `modulepreload` links](https://developers.google.com/web/updates/2017/12/modulepreload). The preload links tell the browser to load all necessary files, which prevents waterfall-loading.

```js
// src/main.js
import App from './components/App.js';

const app = Vue.createApp({
  render: () => Vue.h(App),
});
app.mount('#app');
```

In the code snippet above, you can see that we're using a native ES6 `import` statement to load our core `App` component and use it to create our Vue app. Note that we don't need to import `Vue` because we load it directly from a CDN in the `index.html` file.

### Vue Single File Component Alternatives

Vue SFC files are not (and very certainly never will be) supported in any modern browser. To build Vue applications without webpack or some other bundler, we need to write our components without using the SFC syntax.

```js
// src/components/App.js
import BaseButton from './BaseButton.js';

export default {
  name: 'App',
  data() {
    return {
      count: 0,
    };
  },
  render() {
    return Vue.h('div', [
      `Count: ${this.count}`,
      Vue.h(BaseButton, {
        onClick: () => { this.count += 1 },
      }, () => '+1'),
    ]);
  },
};
```

The most straightforward way is to use the `render()` function directly without any abstractions for convenience. But being used to abstractions like the `<template>` syntax in Single File Components or JSX, this is not the most appealing way of writing Vue components that we don't need to compile.

```js
// src/components/App.js
import BaseButton from './BaseButton.js';

export default {
  name: 'App',
  components: {
    BaseButton,
  },
  data() {
    return {
      count: 0,
    };
  },
  template: `
    <div>
      Count: {{ count }}
      <BaseButton @click="count += 1">
        +1
      </BaseButton>
    </div>
  `,
};
```

What we see above looks a lot more familiar: instead of raw JavaScript, we can use the `template` option returning a plain HTML*ish* string (the same as we would write in the `<template>` section of an SFC). But not only is this slower than our first approach, but it also requires the Vue Runtime build, which is significantly larger, and we don't get syntax highlighting.

## Using Vue with htm

My recommended way for building Vue applications that don't require a build step is to use [htm](https://github.com/developit/htm). Let's make some modifications to our app to use `htm`.

```diff
     <title>Hello World!</title>
-    <!-- This is a development version of Vue.js! -->
-    <script src="https://unpkg.com/vue@3.0.4"></script>
     <script src="/main.js" type="module"></script>
     <!--
       To prevent waterfall-loading, we preload
       all the JS Module files of our application.
     -->
     <link rel="modulepreload" href="/components/App.js">
     <link rel="modulepreload" href="/components/BaseButton.js">
+    <link rel="modulepreload" href="https://unpkg.com/vue@3.0.4/dist/vue.runtime.esm-browser.js">
+    <link rel="modulepreload" href="https://unpkg.com/htm@3.0.4/dist/htm.module.js?module">
+    <link rel="modulepreload" href="/utils/html.js">
   </head>
```

```js
// src/utils/html.js
import { h } from 'https://unpkg.com/vue@3.0.4/dist/vue.runtime.esm-browser.js';
import htm from 'https://unpkg.com/htm@3.0.4/dist/htm.module.js?module';

export default htm.bind(h);
```

```js
// src/components/App.js
import html from '../utils/html.js';

import BaseButton from './BaseButton.js';

export default {
  name: 'App',
  data() {
    return {
      count: 0,
    };
  },
  render() {
    return html`
      <div>
        Count: ${this.count}
        <${BaseButton} onClick=${() => { this.count += 1 }}>
          +1
        <//>
      </div>
    `;
  },
};
```

If you already know JSX, you'll find the syntax very familiar. It's easy to write and read. Thanks to the [lit-html Visual Studio Code plugin](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html), we even get syntax highlighting.

<div>
  <hr class="c-hr">
  <div class="c-service-info">
    <h2>Do you want to learn more about advanced Vue.js techniques?</h2>
    <p class="c-service-info__body">
      Register for the Newsletter of my upcoming book: <a class="c-anchor" href="https://oberlehner.us20.list-manage.com/subscribe?u=8476a98c5640f6c7b5530ea57&id=8b26bf120b" data-event-category="link" data-event-action="click: newsletter" data-event-label="Newsletter (article content)">Advanced Vue.js Application Architecture</a>.
    </p>
  </div>
  <hr class="c-hr">
</div>

## Runtime Bundling with esbuild

In the main `index.html` file, we have declared a couple of preload `<link>` Resource Hints to prevent waterfall-loading of JavaScript resources. This might be good enough for very simple applications. Still, this quickly becomes a maintenance nightmare because every time we add or remove a new module file or change the name of a file, we also must update the Resource Hints accordingly. If we forget to do this, we might not notice it for a long time.

A potential solution for this is [Runtime Bundling](https://markus.oberlehner.net/blog/javascript-runtime-bundling-concept/). Using Runtime Bundling we can get all of the benefits of using a bundler but circumvent some of the downsides involved in having a build step. If you're interested in this concept, you can [read my article about Runtime Bundling](https://markus.oberlehner.net/blog/javascript-runtime-bundling-concept/).

## webpack Alternatives: Rollup and Vite

If your main concern about webpack is its complicated configuration and sluggishness, you might consider choosing a different build tool instead of entirely ditching the build step.

[Vite](https://github.com/vitejs/vite) is a very great alternative in the Vue.js ecosystem. It almost feels like there is no build step at all. Furthermore, you get incredible fast Hot Module Reloading, which you can only get with sophisticated tooling. Vite uses [esbuild](https://esbuild.github.io/) and Rollup under the hood.

Keep in mind, though, that those tools are very new. If you need a solution for a particular problem, chances are somebody already solved it with webpack.

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like What You Read?</h2>
      <p class="c-twitter-teaser__body">
        Follow me to get my latest Vue.js articles.
      </p>
      <a class="c-button c-button--outline c-twitter-teaser__button" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">
        Find me on Twitter
      </a>
    </div>
  </div>
</div>

## Wrapping It Up

If you build a simple Vue.js application with a couple of modules, there is almost no reason for relying on a complicated build toolchain. Thanks to JavaScript modules and the excellent `htm` package, it is nearly the same development experience as working with Vue Single File Components.

The best way to build large-scale Vue applications today, without relying on webpack, probably is Vite, which uses Rollup behind the scenes.

Where I see the most potential for the future is with [Runtime Bundling](https://markus.oberlehner.net/blog/javascript-runtime-bundling-concept/). Why not let the server do the optimizations for production? This approach reminds me of my PHP days: create a PHP file, FTP it to your server, and let the server do runtime optimizations.
