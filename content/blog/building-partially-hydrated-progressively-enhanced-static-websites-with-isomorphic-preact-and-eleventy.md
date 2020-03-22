+++
date = "2020-03-22T07:33:33+02:00"
title = "Building Partially Hydrated, Progressively Enhanced Static Websites with Isomorphic Preact and Eleventy"
description = "Learn how to use partial hydration with Eleventy and Preact and how to apply the principles of progressive enhancement to build resilient websites."
intro = "One of my top priorities is to create the fastest possible websites (think marketing sites, not web applications), but I also don't want to do without modern tools and a component-based workflow. While there are developments in the right direction, I don't think tools like Gatsby and Nuxt.js are quite there yet when it comes to building content heavy, mostly static sites..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Preact", "Eleventy", "Front-End Architecture"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_rgb:EEDF47,f_auto,q_auto,w_1014,h_510/v1542158520/blog/2020-03-22/partial-hydrated-preact"]
+++

Lately, a [tweet by Jake Archibald](https://twitter.com/jaffathecake/status/1230388412806520833) and a [post by Jeremy Keith](https://adactio.com/journal/16404) reinforced my feeling that **modern frameworks like Gatsby and Nuxt.js are not always the best tool for the job.** In my experience, there are better ways of how to build content-heavy websites (think marketing sites, not web applications).

But working with Nuxt.js and Gatsby also has tremendous advantages. Those are amazingly powerful tools. **Component-based workflows make frontend development fun again,** and it is a lot easier to do with modern frontend frameworks than with using templating languages like Nunjucks or Handlebars. Furthermore, **we can utilize the same code on the server and the browser.** But what if I tell you that we can have it all? We can use a modern JavaScript framework, at least as powerful as React, combine it with an exceptional static site generator, and build our websites in a way that they offer **real progressive enhancement** and a **minimal JavaScript bundle size. Combining Eleventy with Preact makes this possible.**

- [Demo and full code](#demo-and-full-code)
- [Setting up Eleventy and Preact](#setting-up-eleventy-and-preact)
- [Partial hydration](#partial-hydration)
- [The withHydration component wrapper](#the-withhydration-component-wrapper)
- [Progressive enhancement](#progressive-enhancement)
- [Client entry file](#client-entry-file)
- [Lazy hydration](#lazy-hydration)
- [Configuring Babel for Preact](#configuring-babel-for-preact)
- [Bundling Preact with Rollup](#bundling-preact-with-rollup)

## Demo and full code

You can [take a look at a demo of the website on Netlify](https://partial-hydration-eleventy.netlify.com) (like the images), and you can [check out the GitHub repository](https://github.com/maoberlehner/eleventy-preact) to see the full code.

## Setting up Eleventy and Preact

In [my last article](/blog/setting-up-eleventy-with-preact-and-htm/), we already explored how to set up Eleventy to render Preact components statically. So we'll take the setup from the last article as a starting point and add only what we need to enable **partial hydration of only the Preact components that render dynamic content.**

## Partial hydration

The [result of our last article](https://setting-up-eleventy-with-preact.netlify.com/) was a fully server-side rendered static websites built with Preact components. The goal of this article is to **partially hydrate specific components of our website so we can progressively enhance its functionality.** So let's take a look at how we can partially hydrate Preact components, which are pre-rendered by Eleventy.

## The withHydration component wrapper

I'm a believer in keeping things simple, so the `withHydration()` HOC you can see in the following example, is all we need for preparing our components for partial client-side hydration.

```js
// src/components/with-hydration.js
const { html } = require('htm/preact');

const isServer = require('../utils/is-server');

let id = 0;

module.exports = Component => (props) => {
  id += 1;

  const scriptSrc = `
    window.__STATE__.components[${id}]={name:${JSON.stringify(Component.name)},props:${JSON.stringify(props)}}
  `;

  return html`
    ${isServer && html`<script dangerouslySetInnerHTML=${{ __html: scriptSrc }} data-cmp-id=${id}></script>`}
    <${Component} ...${props}/>
  `;
};
```

This concept is heavily inspired by an [article written by Lukas Bombach where he makes the case for partial hydration](https://medium.com/@luke_schmuke/how-we-achieved-the-best-web-performance-with-partial-hydration-20fab9c808d5).

We later use the `data-cmp-id` attribute to determine which component we need to render on the client-side. The data in the global `__STATE__.components` object holds all the information about the props we pass to the client-side hydrated components.

Next, let's take a look at how we use `withHydration()` inside of a component that we want to hydrate on the client.

```js
const { html } = require('htm/preact');
const { useState } = require('preact/hooks');

const likeApi = require('../api/like-api');
const withHydration = require('./with-hydration');

function LikeForm({ id }) {
  const [likes, setLikes] = useState(0);
  const handleClick = (e) => {
    e.preventDefault();
    setLikes(likes + 1);
    likeApi.like(id);
  };

  return html`
    <form
      action=${`/like/${id}`}
      method="post"
      class="LikeForm"
    >
      <button
        aria-label="Like this image"
        class="LikeForm__button"
        onClick=${handleClick}
      >
        ❤️
      </button>
      ${likes}
    </form>
  `;
}

// Here we wrap the component `withHydration`.
module.exports = withHydration(LikeForm);
```

The `LikeForm` component above takes an `id` and outputs a form which, when submitted, updates the like counter for the given `id`. If JavaScript is enabled and the component is successfully hydrated on the client, the click-handler is triggered, and the like counter is immediately updated in the UI.

## Progressive enhancement

**Progressive enhancement is an attitude more than a fixed set of tools and techniques.** The example above is built in a way that **it would also work if client-side hydration fails** (because the download of the JavaScript code fails, or because we use some new ES99 feature older browsers do not support, ...). In this scenario, the form would submit a POST request to the given endpoint, and this endpoint redirects the user back to the site.

**Partial client-side hydration *can be used* to build progressively enhanced websites, but this doesn't happen automatically.**

## Client entry file

Now we have updated our code so we can make use of partial hydration. But to make this work, we need to ship the JavaScript code to the browser. For this, we first need to create an entry file that we can load in the browser.

```js
// src/app.js
const { html, render } = require('htm/preact');

const LikeForm = require('./components/LikeForm');

const componentMap = {
  LikeForm,
};

const $componentMarkers = document.querySelectorAll(`[data-cmp-id]`);

Array.from($componentMarkers).forEach(($marker) => {
  const $component = $marker.nextElementSibling;
  const { name, props } = window.__STATE__.components[$marker.dataset.cmpId];
  const Component = componentMap[name];

  render(html`<${Component} ...${props}/>`, $component.parentNode, $component);
});
```

In the `componentMap` variable, we reference all components which we want to hydrate on the client. Then we iterate over all DOM nodes with a `data-cmp-id` attribute and get the `props` from the global `__STATE__`. The `render()` function replaces the statically rendered HTML with the hydrated components.

We also have to load our bundled entry file in the browser, so we update our layout file `src/_includes/layout.njk` accordingly.

```diff
   <body>
+    <script>window.__STATE__={components:{}}</script>
     {{ content | safe }}
+    <script src="/app.js" async></script>
   </body>
 </html>
```

## Lazy hydration

Although images make up the majority of the total file size of most websites, **increasingly, it is not the images that are to blame when websites are slow to load or feel slow.** We are shipping more and more JavaScript code to our users' browsers. And what is often overlooked is that not only the file size of what is sent over the wire counts but also [the cost of running the JavaScript code](https://v8.dev/blog/cost-of-javascript-2019), which adds up, especially on low-end devices. **By using partial hydration and sending only the bare necessary JavaScript code, we have already achieved a lot. But we can further improve execution time by delaying the execution of our code as long as possible.** We can achieve this by hydrating only visible Preact components

```diff
 const { html, render } = require('htm/preact');

+const whenVisible = require('./utils/when-visible');

 const LikeForm = require('./components/LikeForm');

 const componentMap = {
   LikeForm,
 };

 const $componentMarkers = document.querySelectorAll(`[data-cmp-id]`);

 Array.from($componentMarkers).forEach(($marker) => {
   const $component = $marker.nextElementSibling;

+  whenVisible($component, () => {
     const { name, props } = window.__STATE__.components[$marker.dataset.cmpId];
     const Component = componentMap[name];

     render(html`<${Component} ...${props}/>`, $component.parentNode, $component);
+  });
 });
```

## Configuring Babel for Preact

We can further optimize the code we ship to the browser, by using the `babel-plugin-htm` plugin.

```bash
npm install --save-dev @babel/preset-env babel-plugin-htm
```

After installing the `@babel/preset-env`, which helps us with browser support and `babel-plugin-htm`, which basically compiles the `htm` package away at build time, we are ready to set up our `babel.config.js` file.

```js
// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: false,
      },
    ],
  ],
  plugins: [
    // See https://github.com/developit/htm/tree/master/packages/babel-plugin-htm
    // for configuration options.
    ['babel-plugin-htm', {
      import: 'preact',
    }],
  ],
};
```

## Bundling Preact with Rollup

One of the great features of Preact (in combination with htm) is that we don't need to bundle our JavaScript files to make it work on the server. Unfortunately, the same is not true for the client-side. Although it is possible to run Preact and htm powered apps without using tools like webpack or Rollup to precompile the code, in our case, we have to set up a minimal build pipeline so we can ship the same code we use on the server-side also to the client.

```bash
npm install --save-dev rollup @rollup/plugin-commonjs @rollup/plugin-node-resolve rollup-plugin-babel rollup-plugin-terser
```

After adding all of the Rollup related dependencies, we can configure Rollup to bundle our JavaScript code, which is written mainly for a Node.js (Eleventy) environment, to also work in the browser.

```js
// rollup.config.js
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
  plugins: [
    resolve(),
    commonjs(),
    babel(),
    terser(),
  ],
};
```

Now we can add a new npm script to conveniently run Rollup.

```js
{
  // ...
  "scripts": {
    "build": "NODE_ENV=production concurrently 'eleventy' 'npm run scripts:app' 'npm run styles'",
    "dev": "NODE_ENV=dev concurrently 'eleventy --serve' 'npm run watch'",
    "scripts:app": "rollup --config --file dist/app.js --format iife --name App src/app.js",
    "scripts:app:watch": "npm run scripts:app -- --watch",
    // ...
    "watch": "concurrently 'npm run scripts:app:watch' 'npm run styles:watch'",
    // ...
  },
  // ...
}
```

Although we now can separately run Rollup with the `scripts:app` npm script, usually, you will either run `npm run build` for production or `npm run dev` for development. We updated those commands to run the bundler script for us automatically. We have added a `watch` script to the `dev` npm script. To make this work the same way as in the example, you also need to install `concurrently`.

```bash
npm install --save-dev concurrently
```

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like what you read?</h2>
      <p class="c-twitter-teaser__body">
        Follow me to get my latest Vue.js articles.
      </p>
      <a class="c-button c-button--outline c-twitter-teaser__button" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">
        Find me on Twitter
      </a>
    </div>
  </div>
</div>

## Wrapping it up

**Thanks to the combination of Preact and Eleventy we can build websites using modern technologies without the overhead of a complicated build pipeline.** Furthermore, **by applying the principles of progressive enhancement websites built that way are very resilient** (they also work if JavaScript fails to load or execute) and super fast. **And they are super fast everywhere, not exclusively on the latest and greatest high-end devices.**
