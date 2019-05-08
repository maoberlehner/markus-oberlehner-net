+++
date = "2019-01-13T06:10:10+02:00"
title = "How to Drastically Reduce Estimated Input Latency and Time to Interactive of SSR Vue.js Applications"
description = "Learn how to solve the problem of a very high Estimated Input Latency of pre-rendered Vue.js or Nuxt.js powered Single Page Applications"
intro = "Performance is a huge topic in the web dev world. Furthermore  performance is especially a huge topic in the context of SPAs. Ironically, performance is oftentimes stated as one of the biggest benefits and also as one of the most pressing concerns when it comes to this architectural pattern..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Front-End Architecture"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2019-01-13/lazy-hydration-demo-benchmark-twitter"]
+++

Performance is a huge topic in the web dev world. Furthermore performance is especially a huge topic in the context of SPAs. **Ironically, performance is oftentimes stated as one of the biggest benefits and also as one of the most pressing concerns when it comes to this architectural pattern.** While subsequent page views are typically very fast with client side rendered applications, the initial page load can require to load (and even more importantly: to parse) a few megabytes (!) of JavaScript.

Nuxt.js and other frameworks promise to help with the initial page load dilemma which developers of large scale Vue.js applications oftentimes have to deal with. But there comes the next problem: **rehydrating server side rendered applications is also a huge burden on the CPU** and it shows in benchmarks like Lighthouse.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2019-01-13/high-estimated-input-latency">
      <img
        data-src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-01-13/high-estimated-input-latency"
        data-srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2019-01-13/high-estimated-input-latency 2x"
        alt="High values for Time to Interactive and Estimated Input Latency."
      >
      <noscript>
        <img
          src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-01-13/high-estimated-input-latency"
          alt="High values for Time to Interactive and Estimated Input Latency."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>High values for Time to Interactive and Estimated Input Latency</small>
  </p>
</div>

If you want to dive directly into the code, you can [take a look at the GitHub repository](https://github.com/maoberlehner/how-to-drastically-reduce-estimated-input-latency-and-time-to-interactive-of-ssr-vue-applications) for [the demo application](https://drastically-reduce-estimated-input-latency.netlify.com/) and you can also [checkout the vue-lazy-hydration plugin GitHub project](https://github.com/maoberlehner/vue-lazy-hydration).

## Solutions to high Estimated Input Latency and Time to Interactive

One of the most important techniques to deal with those kind of problems is code splitting on a per route level. Nuxt.js and most other tools with SSR baked in (like VuePress or Gridsome) already handle this automatically for you, so in my opinion, this problem is solved.

But we can also use code splitting on a per component level as you can see in the following example.

```html
<template>
  <div class="MyComponent">
    <ImageSlider v-if="showImageSlider"/>
  </div>
</template>

<script>
export default {
  components: {
    ImageSlider: () => import('./ImageSlider.vue'),
  },
  data() {
    return {
      showImageSlider: false,
    };
  },
  // ...
};
</script>
```

So far so good, but although this is another step in the right direction there is still a lot of room for improvement. 

Consider the following example: a very long page is viewed on a small screen, there are a lot of components rendered which are not even visible to the user and they might very well never be if the user decides to navigate to the next page without scrolling. What a waste of resources.

### The vue-lazy-hydration plugin

Over the last couple of days I was working on the [vue-lazy-hydration Vue.js plugin](https://github.com/maoberlehner/vue-lazy-hydration). This plugin makes it pretty easy to utilize certain techniques for lazy loading Vue.js components on demand. Furthermore it makes it possible to delay the hydration of server side rendered HTML until it’s really needed. In the following examples we‘ll use `vue-lazy-hydration` to improve the Estimated Input Latency of our [demo application](https://drastically-reduce-estimated-input-latency.netlify.com/).

### Conditionally loading components

I've already written an [article about conditionally loading components as soon as they become visible](/blog/lazy-load-vue-components-when-they-become-visible/). But as of writing the previous article I did not realize the further implications of this technique when combined with SSR. Instead of rendering a placeholder box, like in the example of the article, we can do without such tricks because the user already sees the pre-rendered HTML which is generated on the server. **So we can conditionally load components as soon as they become visible without our users noticing any of it.**

#### Load and hydrate components based on visibility

First we have to install the `vue-lazy-hydration` package via npm so we can use it in our application.

```bash
npm install vue-lazy-hydration
```

Now we can import the `<LazyHydrate>` wrapper component and use it to only hydrate components which are actually visible to the user.

```html
<template>
  <div class="IndexPage">
    <!-- ... -->
    <LazyHydrate when-visible>
      <ImageSlider/>
    </LazyHydrate>
    <!-- ... -->
  </div>
</template>

<script>
import LazyHydrate from 'vue-lazy-hydration';

export default {
  name: 'IndexPage',
  components: {
    // ...
    LazyHydrate,
    ImageSlider: () => import('../components/ImageSlider.vue'),
    // ...
  },
  // ...
};
</script>
```

In the example above you can see how to use the `<LazyHydrate>` component to dynamically hydrate components only when they become visible.

**One thing to keep in mind: if we don't add a condition directive onto the wrapped component, the component bundle is still loaded immediately.** But we can change that by adding a condition.

```html
<template>
  <div class="IndexPage">
    <!-- ... -->
    <LazyHydrate when-visible>
      <ImageSlider
        slot-scope="{ hydrated }"
        v-if="hydrated"
      />
    </LazyHydrate>
    <!-- ... -->
  </div>
</template>
```

The `<LazyHydrate>` wrapper component passes a `hydrated` property to its child component. We can use this property to only load the `<ImageSlider>` component bundle if it is actually hydrated.

<div>
  <hr class="c-hr">
  <div class="c-service-info">
    <h2>Do you enjoy this article?</h2>
    <p class="c-service-info__body">
      You can buy me a ☕️ on Ko-fi!<br>
      <div style="margin-top: 0.75em;">
        <script type="text/javascript" src='https://ko-fi.com/widgets/widget_2.js'></script>
        <script type="text/javascript">kofiwidget2.init('Support Me on Ko-fi', '#00acc1', 'O4O7U55Y');kofiwidget2.draw();</script>
      </div>
    </p>
  </div>
  <hr class="c-hr">
</div>

#### Hydrate components as soon as users start interacting

Next we take a look at the `on-interaction` loader mode provided by `vue-lazy-hydration`.

```html
<template>
  <div class="IndexPage">
    <!-- ... -->
    <LazyHydrate when-visible>
      <ImageSlider/>
    </LazyHydrate>
    <LazyHydrate :on-interaction="['click', 'focus']">
      <AppCounter/>
    </LazyHydrate>
    <!-- ... -->
  </div>
</template>

<script>
import LazyHydrate from 'vue-lazy-hydration';

export default {
  name: 'IndexPage',
  components: {
    // ...
    LazyHydrate,
    ImageSlider: () => import('../components/ImageSlider.vue'),
    AppCounter: () => import('../components/AppCounter.vue'),
    // ...
  },
  // ...
};
</script>
```

Above you can see how we can use the `on-interaction` property to initialize the `AppCounter` component in a way that it is only really hydrated as soon as either a `click` event or a `focus` event is fired.

### Not loading and hydrating components at all

So much about conditionally hydrating components. But what about all those components which are only representational? They might only show some text and an image but they don't have any functionality other than just rendering content. Why even bother with loading the JavaScript code and doing expensive rehydrating of server side rendered code if the rendered HTML output of those components doesn't change no matter what?

```html
<template>
  <div class="IndexPage">
    <!-- ... -->
    <LazyHydrate when-visible>
      <ImageSlider/>
    </LazyHydrate>
    <LazyHydrate :on-interaction="['click', 'focus']">
      <AppCounter/>
    </LazyHydrate>
    <LazyHydrate ssr-only>
      <AppMediaObject
        slot-scope="{ hydrated }"
        v-if="hydrated"
      />
    </LazyHydrate>
    <!-- ... -->
  </div>
</template>

<script>
import LazyHydrate from 'vue-lazy-hydration';

export default {
  name: 'IndexPage',
  components: {
    // ...
    LazyHydrate,
    ImageSlider: () => import('../components/ImageSlider.vue'),
    AppCounter: () => import('../components/AppCounter.vue'),
    AppMediaObject: () => import('../components/AppMediaObject.vue'),
    // ...
  },
  // ...
};
</script>
```

In the example code snippet above, the `AppMediaObject` component is only ever loaded when the page is rendered on the server. No expensive parsing of JavaScript code or rehydrating of pre-rendered HTML necessary.

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

## Benchmarks

I’ve built a little demo application to do some benchmarks. There are two versions of the application. [One which does not utilize the techniques described above](https://no-lazy-hydration--drastically-reduce-estimated-input-latency.netlify.com/) and [another one which does](https://drastically-reduce-estimated-input-latency.netlify.com/). Let's see the results.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2019-01-13/no-lazy-hydration-demo-benchmark">
      <img
        data-src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-01-13/no-lazy-hydration-demo-benchmark"
        data-srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2019-01-13/no-lazy-hydration-demo-benchmark 2x"
        alt="The baseline Lighthouse benchmark result showing high value for Estimated Input Latency."
      >
      <noscript>
        <img
          src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-01-13/no-lazy-hydration-demo-benchmark"
          alt="The baseline Lighthouse benchmark result showing high value for Estimated Input Latency."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>The baseline: High value for Estimated Input Latency</small>
  </p>
</div>

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2019-01-13/lazy-hydration-demo-benchmark">
      <img
        data-src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-01-13/lazy-hydration-demo-benchmark"
        data-srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2019-01-13/lazy-hydration-demo-benchmark 2x"
        alt="The improved Lighthouse benchmark result showing lower values for Estimated Input Latency and Time to Interactive."
      >
      <noscript>
        <img
          src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-01-13/lazy-hydration-demo-benchmark"
          alt="The improved Lighthouse benchmark result showing lower values for Estimated Input Latency and Time to Interactive."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>Lower values for Estimated Input Latency and Time to Interactive</small>
  </p>
</div>

As you can see in the screenshots above, **both Estimated Input Latency and Time to interactive, are much lower in the second screenshot** which shows the Lighthouse results of the optimized version of the demo application.

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

Lazy loading and hydration of Vue.js components for SSR powered applications can bring huge performance benefits. Keep in mind though, that this technique is highly experimental and as of writing this the `vue-lazy-hydration` plugin is in a very early alpha stage.

If you're trying out `vue-lazy-hydration` yourself, please let me know how it's going.

Special thanks to [Rahul Kadyan](https://github.com/znck) who took up my initial idea and improved it greatly. The latest version of `vue-lazy-hydration` is basically an opinionated fork of his lazy hydration package: [lazy-hydration](https://github.com/znck/lazy-hydration).
