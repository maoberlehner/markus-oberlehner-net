+++
date = "2019-09-29T09:08:08+02:00"
title = "Dependency Injection in Vue.js with Functional Component Factories"
description = "Learn how to conveniently inject dependencies into Vue.js components via props and a functional wrapper component."
intro = "If you are a regular reader of my blog (thanks to all of you), you may have noticed that many of my articles are about decoupling components from their dependencies. Over the past few months I have written a few articles on this subject. But today I share with you an additional way to inject dependencies into Vue.js components that I find very interesting: dependerncy injection via functional components and component props..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:50BF54,f_auto,q_auto,w_1014,h_510/v1542158519/blog/2019-09-29/functional-component-factory"]
+++

If you are a regular reader of my blog, you may have noticed that many of my articles are about decoupling components from dependencies. Over the past few months, I have written a few articles on this subject.

- [Vue.js Single File Component Factory](/blog/vue-single-file-component-factory/)
- [The IoC Container Pattern with Vue.js](/blog/the-ioc-container-pattern-with-vue/)
- [Dependency Injection in Vue.js Applications](/blog/dependency-injection-in-vue-applications/)

I regularly use variations of the approaches mentioned in these articles in my daily work. But today, I share with you an additional way to inject dependencies into Vue.js components that I find very interesting: dependency injection via functional components and component props.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/dependency-injection-in-vuejs-with-functional-component-factories-iepwy?fontsize=14&module=%2Fsrc%2Fcomponents%2FProductListing.vue&view=editor" title="Dependency Injection in Vue.js with Functional Component Factories" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

## The usual approach with props

Let's first take a look at how we can use `props` to inject an API service implementation into a generic listing component.

```html
<template>
  <ListingContainer
    :service="productService"
  />
</template>

<script>
// src/components/ProductListing.vue
import productService from '../services/product';

import ListingContainer from './ListingContainer';

export default {
  name: 'ProductListing',
  components: {
    ListingContainer,
  },
  created() {
    this.productService = productService;
  },
};
</script>
```

In this example the `productService` would be a an object exposing at least a `fetch()` method for fetching a list of objects from an API endpoint.

Having to declare `this.productService = productService` in the `created()` hook is not very pretty in my opinion, so there must be a better way to do this.

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

## Injecting props via a functional wrapper component

In the following example you can see how we can use a generic `containerFactory()` function which makes it a lot more straightforward to inject a service via a property.

```html
<script>
// src/components/ProductListing.vue
import containerFactory from './factories/container';
import productService from '../services/product';

import ListingContainer from './ListingContainer';

export default containerFactory(ListingContainer, {
  service: productService
});
</script>
```

A lot less boilerplate code, isn't it? Next you can see the implementation of the `containerFactory()`.

```js
// src/components/factories/container.js
export default (Component, props) => ({
  functional: true,
  render(h) {
    return h(Component, { props });
  }
});
```

With only 6 lines of code we are able to conveniently inject services and other dependencies without having to add a lot of boilerplate code to our components.

As [@karlito40](https://twitter.com/karlito40) [pointed out on Twitter](https://twitter.com/karlito40/status/1178293595130007553?s=20), the container factory could be extended by automatically passing all its props to the wrapped component.

```diff
 // src/components/factories/container.js
 export default (Component, props) => ({
   functional: true,
+  props: Component.props,
-  render(h) {
+  render(h, context) {
-    return h(Component, { props });
+    return h(Component, {
+      props: { ...context.props, ...props },
+    });
   }
 });
```

Depending on your use case, this can be a variant to choose instead.

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

I think this is a nice little improvement over having to abuse the `created()` hook for making dependencies available in the `<template>` section of a component every time you have to inject a service or some other dependency into a component.
