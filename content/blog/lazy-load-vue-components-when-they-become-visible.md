+++
date = "2018-12-30T06:59:59+02:00"
title = "Lazy Load Vue.js Components When They Become Visible"
description = "Learn how to apply lazy loading techniques to Vue.js components using the Intersection Oberserver API."
intro = "Over the last couple of years as a web developer I've seen the same pattern over and over again: the homepage becomes a political issue within a company because every department wants to present itself and, of course, every department considers itself the most important. Usually two things happen: a slider is added at the top of the page so that each department can get its own slide at the very top, and more and more stuff is added to the homepage..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2018-12-30/lazy-loading-placeholders-twitter"]
+++

Over the last couple of years as a web developer I've seen the same pattern over and over again: **the homepage becomes a political issue within a company** because every department wants to present itself and, of course, **every department considers itself the most important**. Usually two things happen: a slider is added at the top of the page so that each department can get its own slide at the very top, and more and more stuff is added to the homepage because: *everything is important*.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2018-12-30/lazy-loading-placeholders">
      <img
        src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-12-30/lazy-loading-placeholders"
        srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2018-12-30/lazy-loading-placeholders 2x"
        alt="Gray placeholder boxes are shown while components are lazy loaded."
      >
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>Show placeholder boxes initially and lazy load components</small>
  </p>
</div>

It is worth mentioning that this outcome is not necessarily inevitable and is definitely not the best possible outcome. Generally speaking, **users don't scroll very far on the homepage and they don't use sliders very actively most of the time**. But if experience has taught me one thing: although most stakeholders are aware of these problems, it's still a very common outcome.

So what's the problem with very long pages in combination with a typical modern PWA architecture? If those pages consist of many different components, **those components add a lot of weight to the bundle size of our application**. That's especially unfortunate considering that a lot of our users will never scroll down the page to actually see these components.

## Lazy loading to the rescue

It's pretty common practice nowadays to use lazy loading techniques to delay the loading of images until they are visible. You can [read more about lazy loading images with Vue.js in my article about this very topic](https://markus.oberlehner.net/blog/lazy-loading-responsive-images-with-vue/). But what if we could also apply this approach to Vue.js components?

<div class="c-content__figure">
  <video
    data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1532157368/blog/2018-12-30/lazy-loading-components.mp4"
    poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157368/blog/2018-12-30/lazy-loading-components"
    muted
    autoplay
    loop
  ></video>
  <p class="c-content__caption">
    <small>Lazy loading components on a slow connection</small>
  </p>
</div>

In the video above, you can see how components are not loaded until they become visible. Initially, only a gray placeholder box is visible instead of the component itself. The video was recorded on a very slow internet connection.

## Show me the code

Thanks to the relatively new [Intersection Oberserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) and the concept of [Async Components](https://vuejs.org/v2/guide/components-dynamic-async.html#Async-Components) in Vue.js, we can implement a lazy loading utility function rather easily.

```js
// src/utils/lazy-load-component.js
export default function lazyLoadComponent({
  componentFactory,
  loading,
  loadingData,
}) {
  let resolveComponent;

  return () => ({
    // We return a promise to resolve a
    // component eventually.
    component: new Promise((resolve) => {
      resolveComponent = resolve;
    }),
    loading: {
      mounted() {
        // We immediately load the component if
        // `IntersectionObserver` is not supported.
        if (!('IntersectionObserver' in window)) {
          componentFactory().then(resolveComponent);
          return;
        }

        const observer = new IntersectionObserver((entries) => {
          // Use `intersectionRatio` because of Edge 15's
          // lack of support for `isIntersecting`.
          // See: https://github.com/w3c/IntersectionObserver/issues/211
          if (entries[0].intersectionRatio <= 0) return;

          // Cleanup the observer when it's not
          // needed anymore.
          observer.unobserve(this.$el);
          // The `componentFactory()` resolves
          // to the result of a dynamic `import()`
          // which is passed to the `resolveComponent()`
          // function.
          componentFactory().then(resolveComponent);
        });
        // We observe the root `$el` of the
        // mounted loading component to detect
        // when it becomes visible.
        observer.observe(this.$el);
      },
      // Here we render the the component passed
      // to this function via the `loading` parameter.
      render(createElement) {
        return createElement(loading, loadingData);
      },
    },
  });
}
``` 

In the code block above, you can see the `lazyLoadComponent()` function which returns an Async Component factory. It renders a `loading` component until the *real* component, which we pass to the function via the `componentFactory` property, is lazy loaded. We use the Intersection Oberserver API in order to detect when the component becomes visible. Executing the `componentFactory()` triggers a dynamic import of the component.

```js
import SkeletonBox from './components/SkeletonBox.vue';

export default {
  yname: 'App',
  components: {
    MediaObject: lazyLoadComponent({
      componentFactory: () => import('./components/MediaObject.vue'),
      loading: SkeletonBox,
    }),
  },
};
```

Above you can see how to use the `lazyLoadComponent()` function inside of a Vue.js component. If you're interested in the implementation of the `SkeletonBox` component, which we use as a loading placeholder, you can [read my article about how to build it](https://markus.oberlehner.net/blog/skeleton-loading-animation-with-vue/).

## Analyzing the results

In order to find out how this approach affects the loading performance of a *real* application, I built a little demo app. You can [checkout the code at GitHub](https://github.com/maoberlehner/lazy-load-vue-components-when-they-become-visible) and you can [test it yourself on Netlify](https://lazy-load-vue-components-when-they-become-visible.netlify.com/).

If we take a look at the network tab of our browser of choice, we can see that **we can save 126 kb on the initial page load**. To be fair, most of that (115 kb) is because of images, but we're also able to shave off about a third of the JavaScript code needed to initially render the page. Considering that this is a very simple application with some very simple components, it's still not too shabby.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2018-12-30/dev-tools-network">
      <img
        src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-12-30/dev-tools-network"
        srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2018-12-30/dev-tools-network 2x"
        alt="Google Chrome Developer Tools with Network tab opened."
      >
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>JavaScript files in the red box are lazy loaded on demand</small>
  </p>
</div>

In the following screenshot you can see a graphical analysis of the bundles created by webpack. Particularly notable is the fact that the very heavy `marked` package is moved into a separate bundle with the component which uses it. This helps a lot in reducing the file size of the main bundles.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2018-12-30/webpack-bundle-analyze">
      <img
        src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-12-30/webpack-bundle-analyze"
        srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2018-12-30/webpack-bundle-analyze 2x"
        alt="Result page of the webpack bundle analyzer."
      >
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>The marked package is not loaded until it's actually needed</small>
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

Lazy loading can be a huge win if you work to improve the loading performance of your application. But you have to keep in mind that it also has its downsides. You should implement it very carefully and you may consider to only lazy load certain components that add a lot of weight or which are not very important to your users (in which case you should consider removing the component altogether).
