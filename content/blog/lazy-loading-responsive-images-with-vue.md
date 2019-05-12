+++
date = "2018-07-29T06:30:30+02:00"
title = "Vue.js Responsive Image Lazy Loading"
description = "Learn how to use lazy loading for responsive images with Vue.js and how to maintain the aspect ratio of the lazy loaded images while showing the images dominant color as a placeholder."
intro = "In todays article, we'll take a closer look at how we can build our own custom lazy loading image component with Vue.js. We'll use the very fast and lightweight Lozad.js package for handling the lazy loading logic for us and we'll enhance it with the ability to display the dominant color of the image as a fallback color..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
+++

In todays article, we'll take a closer look at how we can build our own custom lazy loading image component with Vue.js. We'll use the very fast and lightweight [Lozad.js](https://github.com/ApoorvSaxena/lozad.js) package for handling the lazy loading logic for us and **we'll enhance it with the ability to display the dominant color of the image as a fallback color,** which is shown while the original image is loading. **Additionally, the lazy loading component will handle maintaining the correct aspect ratio while a placeholder rectangle is shown.**

<div class="c-content__figure">
  <div class="c-content__broad">
    <video
      src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1532157367/blog/2018-07-29/lazy-load-full.mp4"
      poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157367/blog/2018-07-29/lazy-load-full"
      controls
      muted
    ></video>
  </div>
  <p class="c-content__caption">
    <small>The final result of our work</small>
  </p>
</div>

If you want to take a look at the result of our work, you can [look at a demo hosted on Netlify](https://lazy-loading-responsive-images-with-vue.netlify.com/) and you can [checkout the code on GitHub](https://github.com/maoberlehner/lazy-loading-responsive-images-with-vue).

## Vue-Lazyload

Before we get started: there already is a perfectly fine solution for lazy loading images with Vue.js: [Vue-Lazyload](https://github.com/hilongjw/vue-lazyload). The reason why I'm still writing this article is, that I wanted a more lightweight solution. In the tests that I've done, Vue-Lazyload adds about 19 kB to the final bundle size (overall bundle size: 106 kB). The custom solution only adds about 5 kb (overall bundle size: 92 kB).

If a few kilobytes are not a great concern for you and if you're not interested in how to actually build a lazy loading component, you can stop reading and just use Vue-Lazyload, it's a great plugin. **For those of you who're constantly searching for ways of how to shave off a few kilobytes of your application or who're interested in how to build stuff themselves, read on.**

## Building a custom lazy loading component

Because we don't want to implement the logic for detecting if an image is in the viewport, and therefore should be loaded, ourselves, we use Lozad.js to handle this for us. **Lozad.js has a very small footprint of only 1.8 kB and it's very fast because it uses the Intersection Observer API.** Keep in mind, though, that not every browser (most notably Safari) supports the Intersection Observer API yet, but Lozad.js degrades very gracefully by simply loading all images immediately if the browser does not support the Intersection Observer API. In my opinion, this is a good enough fallback, but you can also use a [polyfill](https://www.npmjs.com/package/intersection-observer) if you want.

```bash
npm install lozad --save
```

After installing the `lozad` package, we can start building our custom Vue.js lazy loading image component.

### The lazy loading image component

There are multiple ways of how to solve this problem in Vue.js. One possible approach would be to use custom directives to handle lazy loading on regular `<img>` tags. However, I'm a huge fan of components because they're very flexible and they enable us to easily add further functionality in the future, if we want to.

```html
<template>
  <img
    :data-src="lazySrc"
    :data-srcset="lazySrcset"
    :style="style"
    class="AppImage"
  >
</template>

<script>
import lozad from 'lozad';

export default {
  name: 'AppImage',
  props: {
    backgroundColor: {
      type: String,
      default: '#efefef',
    },
    height: {
      type: Number,
      default: null,
    },
    lazySrc: {
      type: String,
      default: null,
    },
    lazySrcset: {
      type: String,
      default: null,
    },
    width: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      loading: true,
    };
  },
  computed: {
    aspectRatio() {
      // Calculate the aspect ratio of the image
      // if the width and the height are given.
      if (!this.width || !this.height) return null;

      return (this.height / this.width) * 100;
    },
    style() {
      // The background color is used as a
      // placeholder while loading the image.
      // You can use the dominant color of the
      // image to improve perceived performance.
      // See: https://manu.ninja/dominant-colors-for-lazy-loading-images/
      const style = { backgroundColor: this.backgroundColor };

      if (this.width) style.width = `${this.width}px`;

      // If the image is still loading and an
      // aspect ratio could be calculated, we
      // apply the calculated aspect ratio by
      // using padding top.
      const applyAspectRatio = this.loading && this.aspectRatio;
      if (applyAspectRatio) {
        // Prevent flash of unstyled image
        // after the image is loaded.
        style.height = 0;
        // Scale the image container according
        // to the aspect ratio.
        style.paddingTop = `${this.aspectRatio}%`;
      }

      return style;
    },
  },
  mounted() {
    // As soon as the <img> element triggers
    // the `load` event, the loading state is
    // set to `false`, which removes the apsect
    // ratio we've applied earlier.
    const setLoadingState = () => {
      this.loading = false;
    };
    this.$el.addEventListener('load', setLoadingState);
    // We remove the event listener as soon as
    // the component is destroyed to prevent
    // potential memory leaks.
    this.$once('hook:destroyed', () => {
      this.$el.removeEventListener('load', setLoadingState);
    });

    // We initialize Lozad.js on the root
    // element of our component.
    const observer = lozad(this.$el);
    observer.observe();
  },
};
</script>

<style lang="scss">
// Responsive image styles.
.AppImage {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  vertical-align: middle;
}
</style>
```

Above you can see the code of the `AppImage` component. I've added comments to explain what's going on.

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

## Using the component

There are multiple ways of how to use the component. If you're ok with the image popping up as soon as it's loaded, you can use the component almost the same way as a regular `<img>` tag. The only difference is that you have to prefix the `src` and `srcset` properties with the `lazy-` keyword, if you want to make use of lazy loading that is, otherwise you can use the regular `src` and `srcset` properties.

```html
<app-image
 lazy-src="/my/image.jpg"
 lazy-srcset="/my/image-2x.jpg 2x"
/>
```

<div class="c-content__figure">
  <div class="c-content__broad">
    <video
      data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1532157367/blog/2018-07-29/lazy-load-popping-up.mp4"
      poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157367/blog/2018-07-29/lazy-load-popping-up"
      controls
      muted
    ></video>
  </div>
  <p class="c-content__caption">
    <small>The lazy loaded image pops up as soon as it's loaded</small>
  </p>
</div>

You can optimize this a little bit, by adding the dimensions of the image. By providing a `width` and a `height`, the component can calculate the aspect ratio and reserve the space that the image will take up.

```html
<app-image
  :width="300"
  :height="200"
  lazy-src="/my/image.jpg"
  lazy-srcset="/my/image-2x.jpg 2x"
/>
```

<div class="c-content__figure">
  <div class="c-content__broad">
    <video
      data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1532157367/blog/2018-07-29/lazy-load-gray-rectangle.mp4"
      poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157367/blog/2018-07-29/lazy-load-gray-rectangle"
      controls
      muted
    ></video>
  </div>
  <p class="c-content__caption">
    <small>Maintain the aspect ratio and show a gray rectangle</small>
  </p>
</div>

### Dominant color

To further improve the perceived performance, [you can extract the most dominant color of the image](https://manu.ninja/dominant-colors-for-lazy-loading-images/) as the background color of the placeholder rectangle.

```html
<app-image
  :width="300"
  :height="200"
  :background-color="#b0897e"
  lazy-src="/my/image.jpg"
  lazy-srcset="/my/image-2x.jpg 2x"
/>
```

<div class="c-content__figure">
  <div class="c-content__broad">
    <video
      data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1532157367/blog/2018-07-29/lazy-load-dominant-color.mp4"
      poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157367/blog/2018-07-29/lazy-load-dominant-color"
      controls
      muted
    ></video>
  </div>
  <p class="c-content__caption">
    <small>Show a rectangle in the dominant color of the image</small>
  </p>
</div>

### Low fi blurry image

Another route you can go, is to use a low fi blurry version of the image as a placeholder while the high-resolution version is loading. Keep in mind, though, that by using this technique you have to load two images instead of one, you should absolutely test if this has a beneficial effect overall.

```html
<app-image
  :width="300"
  :height="200"
  src="/my/image-blurry.jpg"
  lazy-src="/my/image.jpg"
  lazy-srcset="/my/image-2x.jpg 2x"
/>
```

<div class="c-content__figure">
  <div class="c-content__broad">
    <video
      data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1532157367/blog/2018-07-29/lazy-load-low-fi.mp4"
      poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157367/blog/2018-07-29/lazy-load-low-fi"
      controls
      muted
    ></video>
  </div>
  <p class="c-content__caption">
    <small>Show a low fi blurry version initially</small>
  </p>
</div>

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

Using lazy loading techniques can have a huge positive effect on the loading performance of a website, especially on pages featuring a lot of large scale, high quality images.

But keep in mind, that using this techniques can also have downsides. Always test the implications of optimizations like that on a broad range of real devices, starting from low end smartphones up to the latest and greatest flagships.
