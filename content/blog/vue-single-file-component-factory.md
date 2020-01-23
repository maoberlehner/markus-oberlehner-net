+++
date = "2019-08-11T06:52:52+02:00"
title = "Vue.js Single File Component Factory"
description = "Learn how to export a factory function from a Vue.js Single File Component (SFC) and how to inject dependencies that way."
intro = "In my opinion, the best way to inject dependencies is via factory functions that take the dependencies as parameters. Unfortunately, it is not possible to export factory functions from Vue.js Single File Components. According to the specification, the default export should be a Vue.js component options object..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1542158518/blog/2019-08-11/vue-component-factory"]
+++

In my opinion, the best way to inject dependencies is via factory functions that take the dependencies as parameters. Unfortunately, it is not possible to export factory functions from Vue.js Single File Components. According to [the specification](https://vue-loader.vuejs.org/spec.html), the default export should be a Vue.js component options object.

In this article, we examine a solution that makes it possible to overcome this limitation. If you want to see the full code of a working example of the approach described in this article, you can [take a look at this GitHub repository](https://github.com/maoberlehner/vue-single-file-component-factory).

## Why factory functions are awesome

Before we answer the question *How?*, let's take a look at a straightforward example component to clarify *Why?* Factory functions are awesome. **In the following examples, you can see how we can use factory functions to improve the design of our applications.**

```html
<template>
  <button @click="load">
    Load articles
  </button>
</template>

<script>
import article from '../services/article';

export default {
  name: 'LoadArticles',
  methods: {
    async load() {
      const articles = await article.list();
      this.$emit('new-articles', articles);
    },
  },
};
</script>
```

Here you can see a typical Vue.js SFC `.vue` file. We import the `article` service directly inside of our component. **This leads to very tight coupling, which makes our component less flexible and more difficult to test.**

```js
export const loadArticlesFactory = ({ article }) => ({
  name: 'LoadArticles',
  template: '<button @click="load">Load articles</button>',
  methods: {
    async load() {
      const articles = await article.list();
      this.$emit('new-articles', articles);
    },
  },
});
```

In the example above you can see how we could use the factory function pattern with *regular*, non Single File Components. You may be wondering, what's the point? – directly importing dependencies is convenient and Jest makes it convenient to mock those dependencies. Let's take a look at the following example to see how the factory pattern makes it very easy to refactor our component to make it much more versatile.

```js
export const loadEntitiesFactory = ({ loadEntities }) => ({
  name: 'LoadEntities',
  template: '<button @click="load"><slot/></button>',
  methods: {
    async load() {
      const entities = await loadEntities();
      this.$emit('new-entities', entities);
    },
  },
});
```

```html
<template>
  <div>
    <LoadArticles>
      Load articles
    </LoadArticles>
    <LoadComments>
      Load comments
    </LoadComments>
  </div>
</template>

<script>
import article from '../services/article';
import comment from '../services/comment';

import { loadEntitiesFactory } from './LoadEntities';

export default {
  name: 'StuffLoader',
  components: {
    LoadArticles: loadEntitiesFactory({
      loadEntities: article.list,
    }),
    LoadComments: loadEntitiesFactory({
      loadEntities: comment.list,
    }),
  },
};
</script>
```

Now you might think: ok, the `LoadEntities` component is now reusable and easier to test, but we just moved the problem to the `StuffLoader` component – and that's true. But if we think about the `StuffLoader` component as a [container component](https://markus.oberlehner.net/blog/advanced-vue-component-composition-with-container-components/), this absolutely makes sense. If we split up our applications in small and reusable, easily unit testable components on the one hand and container components which are supposed to wire everything up on the other hand, **those container components are now our main integration points of our application.** They are perfectly suited for integration tests or even E2E tests.

## Vue.js SFC factory function

There is only one problem: as I said before, the SFC specification does not allow factory functions. To circumvent this, I used template strings in the examples above. But this means we have to sacrifice the covenience of having a separate `<template>` and `<style>` section all along our JavaScript code, inside of a single file.

So how can we solve this? There are a several options of how to do dependency injection in Vue.js e.g. via props or [provide / inject](https://markus.oberlehner.net/blog/the-ioc-container-pattern-with-vue) and [a couple of other ways](https://markus.oberlehner.net/blog/dependency-injection-in-vue-applications/). But none of those are as clean and elegant as using a factory function.

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

## Hacking SFC default exports

After some mental gymnastics, I found a hacky way to make it possible to export a component factory from a Vue.js SFC. In the following example you can see how we can use the `makeFactory()` utility function to achieve the desired effect.

```html
<template>
  <button @click="load">
    <slot/>
  </button>
</template>

<script>
import { makeFactory, makeGuard } from '../utils/sfc-factory';

// Because in JavaScript objects are passed by reference,
// we can reuse this options object for creating new
// components with the factory function. And because we also
// use this options object as the default export, the Vue
// Loader extends it with a render function which is generated
// of the markup in the <template> section.
const options = {};

export const loadEntitiesFactory = makeFactory(options, ({ loadEntities }) => ({
  name: 'LoadEntities',
  methods: {
    async load() {
      const entities = await loadEntities();
      this.$emit('new-entities', entities);
    },
  },
}));

// It is important to export the (guarded) options
// object as the default export of the component.
export default makeGuard(options);
</script>
```

Next you can see the magic that happens inside of the `makeFactory()` method.

```js
// src/utils/sfc-factory.js
export function makeFactory(options, componentFactory) {
  return (...params) => ({
    ...options,
    // Overwrite the `beforeCreate()` hook added by `makeGuard()`.
    beforeCreate() {},
    ...componentFactory(...params),
  });
}
```

Our `makeFactory()` function takes the `options` object, which is also used as the default export, and a `componentFactory()` and returns a new factory function. The returned function merges the properties of the `options` object (most notably the `render()` function added by the Vue Loader) with the options returned by the `componentFactory()`.

The `makeGuard()` function is totally optional. You could also export the `options` object without *guarding* it. But it prevents other developers from accidentally using the default export instead of the factory function.

```js
// src/utils/sfc-factory.js
export function makeGuard(options) {
  return Object.assign(options, {
    beforeCreate() {
      throw new Error('Do not use the default export but use the factory function instead!');
    },
  });
}
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

I'm not quite sure yet if I want to use this rather hacky approach in one of my productions apps. But I also don't see EINEN DRIFITIGEN GRUND why not.

I hope that one day the Vue.js SFC spec also allows for exporting a factory function which returns a Vue.js component options object or a promise which resolves to an options object. For now we have to make the best out of what we have.

## References

- [Eric Elliott, TDD in ES6 and React Examples](https://github.com/ericelliott/tdd-es6-react/blob/master/examples/dependency-injection/test/index.js)
- [Eric Elliott, Mocking is a Code Smell](https://medium.com/javascript-scene/mocking-is-a-code-smell-944a70c90a6a)
- [Anthony Gore, 7 Ways To Define A Component Template in VueJS](https://medium.com/js-dojo/7-ways-to-define-a-component-template-in-vuejs-c04e0c72900d)
- [Vue Single-File Component (SFC) Spec](https://vue-loader.vuejs.org/spec.html)
