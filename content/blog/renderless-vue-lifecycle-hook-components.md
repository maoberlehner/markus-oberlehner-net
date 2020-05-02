+++
date = "2019-03-10T06:14:14+02:00"
title = "Renderless Vue.js Lifecycle Hook Components"
description = "Learn how to build renderless Vue.js components for handling component lifecycle hooks directly inside the components template section."
intro = "Reusing logic and keeping your codebase DRY should be one of your top priorities. In a Vue.js application components are the most important means of code reuse. But usually we think of components as a combination of markup, logic and CSS. At first, it might not be very intuitive to use components to provide only logic and not render anything at all..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Front-End Architecture"]
images = ["/images/c_scale,f_auto,q_auto,w_1200,h_675/v1532158513/blog/2019-03-10/renderless-hooks-twitter"]
+++

> **Note:** This is the third part of my “Advanced Vue.js Application Architecture” series on how to structure and test large scale Vue.js applications. Stay tuned, there's more to come! [Follow me on Twitter](https://twitter.com/MaOberlehner) if you don't want to miss the next article.  
> [<< First](/blog/multi-export-vue-single-file-ui-components/) [< Previous](/blog/reusing-logic-with-renderless-vue-frame-components/) [Next >](/blog/advanced-vue-component-composition-with-container-components/)

Today we’ll take a look at how we can build renderless Vue.js components which make it possible to **react to lifecycle hooks and route changes directly in the template section of a component.**

If you are curious about the result, you can [see the final outcome of what we build on CodeSandbox](https://codesandbox.io/s/1y2r3q4j93?module=%2Fsrc%2Fviews%2FHome.vue).

## Lifecycle hooks

Let’s take a look at how we can build a simple renderless component for handling lifecycle hooks.

```js
// src/components/FrameHooks.vue
export default {
  created() {
    // As soon as this component is created, it's parent component
    // must have already been created, so we immediately trigger the hook.
    this.$emit('created');

    const triggerMounted = () => this.$emit('mounted');
    this.$parent.$on('hook:mounted', triggerMounted);

    const triggerUpdated = () => this.$emit('updated');
    this.$parent.$on('hook:updated', triggerUpdated);

    this.$once('hook:beforeDestroy', () => {
      this.$parent.$off('hook:mounted', triggerMounted);
      this.$parent.$off('hook:updated', triggerUpdated);
    });
  },
  render() {
    // Render the first child of the default slot.
    return this.$slots.default[0];
  },
};
```

In the following example you can see how we can use our newly created `FrameHooks` component in combination with a renderless `ArticleListFrame` component to trigger an API request for fetching a list of articles.

```html
<template>
  <ArticleListFrame
    v-slot="{ articles, methods: { fetchList } }"
  >
    <FrameHooks @created="fetchList">
      <ul class="ArticleList">
        <li v-for="article in articles">
          {{ article.title }}
        </li>
      </ul>
    </FrameHooks>
  </ArticleListFrame>
</template>
```

**As you can see above, the `FrameHooks` component is especially useful for consuming methods provided by other renderless components.** This is only one of many possible use cases for how to utilize the `FrameHooks` component.

<div>
  <hr class="c-hr">
  <div class="c-service-info">
    <h2>Do you want to learn more about building advanced Vue.js applications?</h2>
    <p class="c-service-info__body">
      Register for the Newsletter of my upcoming book: <a class="c-anchor" href="https://oberlehner.us20.list-manage.com/subscribe?u=8476a98c5640f6c7b5530ea57&id=8b26bf120b" data-event-category="link" data-event-action="click: newsletter" data-event-label="Newsletter (article content)">Advanced Vue.js Application Architecture</a>.
    </p>
  </div>
  <hr class="c-hr">
</div>

## Route changes

Another area where it can be very useful to use hooks to react to certain changes in the app is routing.

```js
// src/components/FrameHooks.vue
export default {
  watch: {
    $route: {
      handler(current, prev) {
        const currentQueryString = JSON.stringify(current.query);
        const prevQueryString = JSON.stringify(prev.query);
        const queryChanged = currentQueryString !== prevQueryString;
        if (queryChanged) {
          this.$emit('route-query-change', current.query);
        }
      },
    },
  },
  created() {
    // ...
  },
  // ...
};
```

**Next you can see how we can use the `route-query-change` hook to call the `fetchList()` method every time a query parameter of the route changes.** If for example the route changes from `/articles?page=1` to `/articles?page=2` the `fetchList()` method is called and the articles for page `2` are fetched.

```html
<template>
  <ArticleListFrame
    v-slot="{
      articles,
      methods: { fetchList }
    }"
  >
    <FrameHooks
      @created="fetchList({ page: $route.query.page });"
      @route-query-change="fetchList({ page: $event.page });"
    >
      <div class="Home">
        <ul class="ArticleList">
          <li v-for="article in articles" :key="article.title">
            {{ article.title }}
          </li>
        </ul>
        <RouterLink
          :to="{ query: { page: 1 } }"
        >
          Page 1
        </RouterLink> |
        <RouterLink
          :to="{ query: { page: 2 } }"
        >
          Page 2
        </RouterLink>
      </div>
    </FrameHooks>
  </ArticleListFrame>
</template>
```

I think this simple example already demonstrates very well how powerful this pattern can be. **We can reuse existing Frame Components throughout our application to integrate something like pagination functionality without even writing a single line of custom JavaScript code** (not counting the function call).

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/1y2r3q4j93?module=%2Fsrc%2Fviews%2FHome.vue&view=preview" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
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

By using the renderless component pattern, to build wrapper components which **provide access to hook events directly in the template section of our components,** we can build components which are more transparent, easier to understand and highly reusable.

However, there are also a number of things to consider: if you’re using a lot of renderless components **you can run into the problem that you have to nest multiple renderless components.** This can be problematic in certain cases. Therefore **you should aim for building very simple components** to keep the number of renderless components required to build a single component at a minimum.
