+++
date = "2018-09-14T06:51:51+02:00"
title = "Using Cloudinary and Storyblok to Handle Assets for a Vue.js Application"
description = "Learn how you can use Cloudinary to manage assets in Storyblok and how to use those in a Vue.js application."
intro = "In this article we‘ll learn how we can combine the awesome digital asset management platform Cloudinary with the power of Storyblok to automatically handle image optimazation for us. We‘ll also explore how we can use the additional data, like the dominant color or the aspect ratio of an image, provided by the Storyblok Cloudinary Assets plugin, to implement enhanced image lazy loading..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "headless CMS"]
+++

In one of my recent articles, we took a closer look at [how to build websites with the Headless CMS Storyblok and Vue.js](/blog/building-a-website-with-vue-the-storyblok-visual-editor-and-netlify/). In this article we‘ll learn how we can combine the awesome digital asset management platform Cloudinary with the power of Storyblok to automatically handle image optimazation for us. We‘ll also explore how we can use the additional data, like the dominant color or the aspect ratio of an image, provided by the [Storyblok Cloudinary Assets plugin](https://github.com/maoberlehner/storyblok-cloudinary-assets), to implement enhanced image lazy loading.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2018-09-14/lazy-loading-with-dominant-color">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-09-14/lazy-loading-with-dominant-color"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2018-09-14/lazy-loading-with-dominant-color 2x"
        alt="Dominant color is shown as a placeholder while loading images."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-09-14/lazy-loading-with-dominant-color"
          alt="Dominant color is shown as a placeholder while loading images."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>Dominant color is shown as a placeholder while loading images</small>
  </p>
</div>

You can find a [demo of the result hosted on Netlify](https://storyblok-cloudinary-assets-vue-demo.netlify.com/) and you can take a look at [the code at GitHub](https://github.com/maoberlehner/using-cloudinary-and-storyblok-to-handle-assets-for-a-vue-application).

## Installing Storyblok Cloudinary Assets

Storyblok Cloudinary Assets is a custom field type plugin for the headless CMS Storyblok. In order to use it, we have to build and install it first. You can do this by cloning the [Storyblok Cloudinary Assets plugin Git repository](https://github.com/maoberlehner/storyblok-cloudinary-assets) and then run the build command and copy and paste the generated code into Storyblok when it's done.

```bash
git clone git@github.com:maoberlehner/storyblok-cloudinary-assets.git
cd storyblok-cloudinary-assets
npm install
npm run build
```

The `build` script generates the `dist/export.js` file. You can copy all the code in the file and paste it into a new custom Storyblok field type plugin which you can create in the Storyblok UI. To do this, go to the [Plugins page](https://app.storyblok.com/#!/me/plugins) and click the `New` button in the top right.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2018-09-14/create-new-cloudinary-asset-storyblok-plugin">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-09-14/create-new-cloudinary-asset-storyblok-plugin"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2018-09-14/create-new-cloudinary-asset-storyblok-plugin 2x"
        alt="Creating a new plugin in Storyblok."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-09-14/create-new-cloudinary-asset-storyblok-plugin"
          alt="Creating a new plugin in Storyblok."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>Creating a new plugin in Storyblok</small>
  </p>
</div>

**It is important to name your new custom field type plugin `cloudinary-assets`, otherwise it won't work correctly.** Next you can see the Storyblok plugin editor. Replace the demo code with the contents of `dist/export.js`. After publishing your newly created plugin, you're able to select it as the custom type of your fields.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2018-09-14/storyblok-plugin-editor">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-09-14/storyblok-plugin-editor"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2018-09-14/storyblok-plugin-editor 2x"
        alt="Screenshot of the Storyblok UI for creating a new plugin."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-09-14/storyblok-plugin-editor"
          alt="Screenshot of the Storyblok UI for creating a new plugin."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>The Storyblok UI for creating a new plugin</small>
  </p>
</div>

### Usage in Storyblok

After you've configured one of your fields to use the Cloudinary Assets plugin as its field type, you're ready to add assets to your stories via Cloudinary.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2018-09-14/storyblok-cloudinary-assets-options">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-09-14/storyblok-cloudinary-assets-options"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2018-09-14/storyblok-cloudinary-assets-options 2x"
        alt="You have to configure the field options correctly."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-09-14/storyblok-cloudinary-assets-options"
          alt="You have to configure the field options correctly."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>You have to configure the field options correctly</small>
  </p>
</div>

**It is important to configure the plugin options correctly. You can find the `apiKey` and the `cloudName` in your Cloudinary account settings.** The `maxFiles` option is optional, you can use it to limit the max files a user is allowed to add.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2018-09-14/selecting-images-with-storyblok-cloudinary-assets-plugin">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-09-14/selecting-images-with-storyblok-cloudinary-assets-plugin"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2018-09-14/selecting-images-with-storyblok-cloudinary-assets-plugin 2x"
        alt="The Cloudinary media library overlay in Storyblok."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-09-14/selecting-images-with-storyblok-cloudinary-assets-plugin"
          alt="The Cloudinary media library overlay in Storyblok."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>The Cloudinary media library overlay in Storyblok</small>
  </p>
</div>

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2018-09-14/storyblok-cloudinary-assets-dominant-color">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-09-14/storyblok-cloudinary-assets-dominant-color"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2018-09-14/storyblok-cloudinary-assets-dominant-color 2x"
        alt="A dominant color is determined automatically for each image."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-09-14/storyblok-cloudinary-assets-dominant-color"
          alt="A dominant color is determined automatically for each image."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>A dominant color is determined automatically for each image</small>
  </p>
</div>

As you can see in the screenshot above, there is a hex color associated with the images. **This is the dominant color of the image. Let's take a look at how we can use this information to enhance the perceived performance of lazy loaded images.**

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

### Usage in Vue.js

I've already written a dedicated article about the topic of [lazy loading images with Vue.js](/blog/lazy-loading-responsive-images-with-vue/). We can reuse the `AppImage` component we've built in the previous article.

```html
<app-image
  :background-color="image.dominant_color"
  :height="300 / image.aspect_ratio"
  :lazy-src="https://res.cloudinary.com/yourcloudname/image/upload/c_thumb,f_auto,g_center,q_auto,w_300/${image.id}"
  :lazy-srcset="`https://res.cloudinary.com/yourcloudname/image/upload/c_thumb,f_auto,g_center,q_auto,w_600/${image.id} 2x`"
  :width="300"
/>
```

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2018-09-14/lazy-loading-with-dominant-color">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-09-14/lazy-loading-with-dominant-color"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2018-09-14/lazy-loading-with-dominant-color 2x"
        alt="Dominant color is shown as a placeholder while loading images."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-09-14/lazy-loading-with-dominant-color"
          alt="Dominant color is shown as a placeholder while loading images."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>The final result</small>
  </p>
</div>

You can take a look at [the full code at GitHub](https://github.com/maoberlehner/using-cloudinary-and-storyblok-to-handle-assets-for-a-vue-application) and you can see a [demo of this hosted on Netlify](https://storyblok-cloudinary-assets-vue-demo.netlify.com/).

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

**Cloudinary provides us with a lot of awesome features to reduce the load time of images.** It automatically optimizes not only the quality of your images, but also in which format the images are delivered to the browser. Browsers which do support `webp` for example, get images in this very efficient format, which can dramatically decrease the load time of your images.

By integrating Storyblok with Cloudinary, you get the best of two worlds: **automatic image optimization with Cloudinary and the flexibility of the headless CMS Storyblok.**
