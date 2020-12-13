+++
date = "2018-02-11T09:12:10+02:00"
title = "Dynamically Loading SVG Icons with Vue.js"
description = "Learn how to create Vue components from SVG files and how to dynamically load them into your application."
intro = "In this article we're going to explore two approaches for dynamically loading SVG icons with Vue.js. We'll use the wonderful vue-svgicon package as a foundation for our SVG icon workflow..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
+++

In this article we're going to explore two approaches for dynamically loading SVG icons with Vue.js. We'll use the wonderful [vue-svgicon](https://github.com/MMF-FE/vue-svgicon) package as a foundation for our SVG icon workflow.

If you want to take a closer look at the example code, you can [find it on GitHub](https://github.com/maoberlehner/dynamically-loading-svg-icons-with-vue). Or you can check out a live example of the code [hosted on Netlify](https://dynamically-loading-svg-icons-with-vue.netlify.com).

<div class="c-content__figure">
  <div class="c-content__broad">
    <video src="/videos/2018-02-11/dynamically-loading-icons.mp4" autoplay loop muted></video>
  </div>
  <p class="c-content__caption">
    <small>Dynamically loading icons with Vue.js</small>
  </p>
</div>

## Installing vue-svgicon

There are multiple ways of how to integrate SVG icons into a website, but because we're using Vue.js, **we want to use an approach which enables us to use components, like we're used too with Vue.js, to load icons**. Luckily, the `vue-svgicon` package makes it possible to automatically convert `.svg` files into Vue components.

```bash
npm install vue-svgicon --save
```

After we've installed `vue-svgicon`, **we can use it to automatically generate icon components of SVG files** for us. The best way to run the script is, to add a new  line to the `scripts` section of our `package.json` file.

```json
{
  "scripts": {
    "icons": "vsvg -s src/assets/icons -t src/components/icons",
    "prebuild": "npm run icons",
    "build": "node build/build.js"
  }
}
```

The `icons` script is responsible for creating Vue components from static `.svg` files located in the `src/assets/icons` directory. We also add a `prebuild` script, which automatically runs before the `build` script, to start the `icons` script before building the page. Keep in mind though, that you have to run `npm run icons` manually every time you add a new icon during development.

## Configuring vue-svgicon

After we've installed `vue-svgicon`, we must configure it in the `src/main.js` file of our application.

```js
// src/main.js
import Vue from 'vue';
import * as svgicon from 'vue-svgicon';

import App from './App';

// We install `vue-svgicon` as plugin
// and configure it to prefix all CSS
// classes with `AppIcon-`.
Vue.use(svgicon, {
  classPrefix: 'AppIcon-',
});

new Vue({
  el: '#app',
  render: h => h(App),
});
```

For this demo application, I downloaded three icons from [flaticon.com](https://www.flaticon.com/), ran them through [SVGOMG](https://jakearchibald.github.io/svgomg/) to save some bytes, and put them into the `src/assets/icons` directory.

```bash
npm run icons
```

Now we can generate the Vue icon components by running the command above. Don't forget to add the directory which contains the automatically generated icon components to your `.gitignore` file, to prevent them from ending up in your Git repository.

```bash
# .gitignore
src/components/icons
```

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

## Dynamically loading icons

Although, most SVG icons are quite small in file size, their size can add up. **To prevent them slowing down the initial page load, we can use dynamic loading to lazy load icons which are not visible on initial page load**.

### Approach 1: Default component + watch

Let's start with the default way of using icons generated with `vue-svgicon` and enhance it with lazy loading powered by dynamic imports and the Vue.js `watch` feature.

```html
<svgicon v-if="showMagicHat" name="magic-hat" height="3em"></svgicon>
<button @click="showMagicHat = !showMagicHat">
  Toggle Magic Hat Icon
</button>
```

In the template code above, you can see that we're defining a `svgicon` component tag which is only rendered if `showMagicHat` is `true`. The `name` property is used to define which icon should be rendered, in this case we're rendering the icon with the file name `magic-hat.svg`. The button beneath the icon toggles the value of `showMagicHat` between `true` and `false`.

```js
export default {
  name: 'App',
  data() {
    return {
      showMagicHat: false,
    };
  },
  watch: {
    // This method is triggered whenever
    // the value of `showMagicHat` changes.
    showMagicHat(value) {
      if (value) import(/* webpackChunkName: "svgicon-magic-hat" */ './components/icons/magic-hat');
    },
  },
};
```

In the code above, you can see that we're using a watcher function named `showMagicHat()` to trigger a dynamic import of the `magic-hat` icon component. By specifying a `webpackChunkName`, we can control the name of the chunk file which is generated by webpack. For the webpack chunk name feature to work, make sure that you're using the `[name]` placeholder in the webpack `chunkFilename` setting (you can look at the [example config on GitHub](https://github.com/maoberlehner/dynamically-loading-svg-icons-with-vue/blob/master/build/webpack.prod.conf.js#L29)).

If we run this code in production mode, you can see in the network tab of the developer tools of your browser, that **the icon is not loaded initially but it is lazy loaded whenever the button is clicked the first time**.

## Approach 2: Wrapper component

Although the first approach is perfectly fine, we still can do better, and add a layer of abstraction to make things a little bit easier to reuse.

```html
<app-icon v-if="showMusic" name="music" size="l" fill></app-icon>
<button @click="showMusic = !showMusic">Toggle Music Icon</button>
```

The template code above looks pretty much the same as what we've seen before. The only major difference is, that we're using an `app-icon` tag, instead of the default `svgicon` tag, to load the icon component.

```js
import AppIcon from './components/AppIcon';

export default {
  name: 'App',
  components: {
    AppIcon,
  },
  data() {
    return {
      showMusic: false,
    };
  },
};
```

In this code snippet, you can see, that we're not loading anything dynamically and we don't have to use a watcher function for dynamic loading. Instead we're importing and using a new `AppIcon` component. Let's take a closer look at the implementation of the `AppIcon` component in the following code snippet.

```html
<template>
  <svgicon
    :class="{
      [$options.name]: true,
      [`${$options.name}--${size}`]: size,
    }"
    :name="name">
  </svgicon>
</template>

<script>
export default {
  name: 'AppIcon',
  props: {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: String,
    },
  },
  created() {
    // The `[request]` placeholder is replaced
    // by the filename of the file which is
    // loaded (e.g. `AppIcon-music.js`).
    import(/* webpackChunkName: "AppIcon-[request]" */ `./icons/${this.name}`);
  },
};
</script>

<style>
.AppIcon {
  display: inline-block;
  height: 1em;
  color: inherit;
  vertical-align: middle;
  fill: none;
  stroke: currentColor;
}

.AppIcon--fill {
  fill: currentColor;
  stroke: none;
}

.AppIcon--s {
  height: 0.5em;
}

.AppIcon--m {
  height: 1em;
}

.AppIcon--l {
  height: 3em;
}
</style>
```

The `AppIcon` component you can see above, is basically a simple wrapper around the `svgicon` component. Let's walk through the code.

In the template you can see, that we're using the components name, which is stored in `$options.name`, to define the CSS class. Additionally to the default CSS class, we're also adding a size class, which can be controlled by passing one of the three sizes (`s`, `m` or `l`) as a property to the component. Because we're using the `svgicon` tag as root tag of the `AppIcon` component, all additional properties are directly passed to the `svgicon` component, so we can use all of the properties provided by the `svgicon` component.

In the components `created()` method, we're dynamically loading the icon component which matches the given `name` property. Because the `created()` method is not executed as long as the component isn't initialized, the icon isn't loaded until the component is rendered.

In the style section of the component, we're adding some default styles which are recommended by `vue-svgicon` and we add the necessary styling to make the size classes work.

## Downsides of dynamic loading

Like with most things in life, dynamically loading SVG icons also has its downsides. Especially if you're displaying a lot of  (different) icons initially, without requiring any user interaction for them to show up, **loading all those icons in separate HTTP requests is most likely slower than loading them all in one JavaScript bundle**.

The wrapper component approach I've shown in this article isn't very flexible in that regard: all icons are always loaded dynamically. No matter if you're showing them instantly or after a certain user interaction.

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

## Recap

Depending on your situation, you might consider to use one of the two approaches I've shown in this article. The first approach, of using the Vue.js `watch` feature to dynamically load icons if needed and bundle them with the main bundle otherwise, is more flexible but also more complicated.

Using a wrapper component for your icons makes them pretty straightforward to use. There might be a performance hit with making a lot of separate HTTP requests in certain situations. Although, the default [Vue.js webpack template](https://github.com/vuejs-templates/webpack) comes with the [CommonsChunkPlugin](https://webpack.js.org/plugins/commons-chunk-plugin/) preconfigured, which should take care of such situations.

Aside from dynamically loading icons only if they are needed, using a wrapper component has two other benefits. First of all, because we've added a layer of abstraction, we're more flexible if we decide to use some other tool instead of `vue-svgicon` in the future. And second, this approach makes it possible to put the icon styling where it belongs: in a separate (icon) component.
