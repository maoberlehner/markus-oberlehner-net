+++
date = "2019-11-03T06:38:38+02:00"
title = "Setting up Tailwind CSS v2 with Vue.js"
description = "Set up Tailwind CSS v2 with Vue.js and configure PurgeCSS to work with a Vue CLI powered app."
intro = "Tailwind CSS is one of the rising stars in the CSS framework world. It's especially popular in the Laravel and Vue.js community. In this article, we learn how to set up Tailwind CSS to work with a Vue CLI powered application..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "CSS Architecture", "Vue"]
images = ["/images/c_crop,f_auto,q_auto,w_1014/v1542158520/blog/2019-11-03/tailwind-vue"]
+++

Tailwind CSS is one of the rising stars in the CSS framework world. It's especially popular in the Laravel and Vue.js community. In this article, we learn how to **set up Tailwind CSS to work with a Vue CLI powered application.** Because Tailwind CSS is a utility-first CSS framework which provides **a lot** of utility classes out of the box, its file size without any optimizations is pretty massive. But luckily, **we can use PurgeCSS to improve the final bundle size of our application tremendously.** Unfortunately, we can't use the Just-in-Time mode yet with Vue CLI because it requires the latest version of PostCSS (v8) to work.

If you want to take a look at the final code, you can [check out the full code on GitHub](https://github.com/maoberlehner/setting-up-tailwind-css-with-vue).

> In this article, you learn how to set up Tailwind CSS v2 and PurgeCSS with Vue.js manually. But if you use the Vue CLI, you can also use [`vue-cli-plugin-tailwind`](https://github.com/forsartis/vue-cli-plugin-tailwind) to get up and running even faster.

## Table of Contents

- [Using Tailwind with Vue CLI](#using-tailwind-with-vue-cli)
- [Customizing the Tailwind configuration](#customizing-the-tailwind-configuration)
- [Reducing the file size with PurgeCSS](#reducing-the-file-size-with-purgecss)
- [Writing purgeable Vue components](#writing-purgeable-vue-components)

## Using Tailwind with Vue CLI

Before we can get started building Tailwind CSS powered Vue.js applications, we have to set it up.

```bash
npm uninstall tailwindcss postcss autoprefixer
npm install --save-dev tailwindcss@npm:@tailwindcss/postcss7-compat postcss@^7 autoprefixer@^9
```

```js
// postcss.config.js
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');

module.exports = {
  plugins: [
    tailwindcss,
    autoprefixer,
  ],
};
```

If you get an error like `TypeError: Invalid PostCSS Plugin found at: plugins[0]` make sure that you installed the `compat` versions of the package.

After installing `tailwindcss` as a dependency of our project and adding it to the list of PostCSS plugins inside of our `postcss.config.js` file, we are ready to import Tailwind CSS into our project.

```scss
// src/assets/styles/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```diff
 // src/main.js
 import Vue from 'vue';
 import App from './App.vue';

+import './assets/styles/index.css';

 Vue.config.productionTip = false;

 new Vue({
   render: h => h(App),
 }).$mount(`#app`);
```

First, we create a new `index.css` file in `src/assets/styles` and load all Tailwind related styles in it. Next, we import this newly created file inside of our main `main.js` entry point of our app.

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

## Customizing the Tailwind configuration

If we want to change certain aspects of our Tailwind CSS setup, we can create a configuration file. This makes it possible to change things like the font family, colors, margins, and even the media query breakpoints, for example.

```bash
npx tailwind init
```

This creates a new file, `tailwind.config.js` in the root directory of our application. We can use this configuration file to [adapt Tailwind CSS to our needs](https://tailwindcss.com/docs/configuration/).

```js
// tailwind.config.js
module.exports = {
  purge: [],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
```

## Reducing the file size with PurgeCSS

Now we have everything set up to start building Tailwind powered applications. But if we take a closer look at the final bundle size of our app, we notice that Tailwind adds a considerable large chunk of CSS. Fortunately, we can work around this by enabling PurgeCSS.

```diff
 // tailwind.config.js
 module.exports = {
-  purge: [],
+  purge: [
+    './public/**/*.html',
+    './src/**/*.vue',
+  ],
   theme: {
     extend: {},
   },
   variants: {},
   plugins: [],
 };
```

We add the `./public/**/*.html` add all `*.html` and `*.vue` files to the list of files PurgeCSS should check for classes that must be not removed. Make sure to add all relevant paths here. By default PurgeCSS does only run when building for production, so make sure that `NODE_ENV` is set to `production` when deploying to production.

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

## Writing purgeable Vue components

As it's stated [in the official Tailwind CSS documentation](https://tailwindcss.com/docs/controlling-file-size/#writing-purgeable-html), we have to follow some rules to avoid PurgeCSS removing CSS styles, which it is not supposed to remove.

```html
<template>
  <Component
    :is="`h${level}`"
    :class="`font-light leading-tight text-${size}xl`"
  >
    <slot/>
  </Component>
</template>
```

In the example headline component above, we use template-strings to programmatically set the tag rendered for the component and the text size class. This is problematic when using PurgeCSS. Because that way, it does not know that the styles for the `h1-6` tags and the `text-1xl`, `text-2xl`, ... classes are necessary and must not be purged.

```diff
 <template>
   <Component
-    :is="`h${level}`"
+    :is="['h1', 'h2', 'h3', 'h4', 'h5', 'h6'][level - 1]"
-    :class="`font-light leading-tight text-${size}xl`"
+    class="font-light leading-tight"
+    :class="[
+      ...(size <= 1 ? ['text-1xl'] : []),
+      ...(size === 2 ? ['text-2xl'] : []),
+      ...(size === 3 ? ['text-3xl'] : []),
+      ...(size === 4 ? ['text-4xl'] : []),
+    ]"
   >
     <slot/>
   </Component>
 </template>
```

Unfortunately, this approach is a lot more verbose than the initial solution, but this is one of the tradeoffs we have to take when using PurgeCSS.

Keep in mind that every CSS class or HTML tag has to appear as plain text string somewhere in your Vue.js components if you don't want PurgeCSS to remove the corresponding styles.

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

## Wrapping it up

Although setting up Tailwind CSS to work with Vue.js is rather straightforward, things become a little more tricky after also adding PurgeCSS into the mix.

But this was only the beginning: now you are ready to [read the next article about how to build reusable functional components with Tailwind CSS and Vue.js](/blog/reusable-functional-vue-components-with-tailwind-css/).

## References

- [kyis, Vue + Tailwind + PurgeCSS — The right way](https://medium.com/@kyis/vue-tailwind-purgecss-the-right-way-c70d04461475)
