+++
date = "2020-03-29T07:37:37+02:00"
title = "Cut Your Nuxt.js generate Build Time in Half with context.payload"
description = "Learn how to cut your Nuxt.js generate build time in half by using context.payload."
intro = "One of my freelancing projects is a Nuxt.js project powered by the headless CMS Storyblok. Because performance is critical, I decided to use Nuxt.js in generate mode outputs static HTML files for each page at build time. But because Nuxt.js needs to generate 1.000+ pages, the build time got long..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_rgb:23C9F5,f_auto,q_auto,w_1014,h_510/v1542158520/blog/2020-03-29/nuxt-generate-payload"]
+++

One of my freelancing projects is a Nuxt.js project powered by the wonderful [headless CMS Storyblok](https://www.storyblok.com/). Because performance is critical, I decided to use Nuxt.js in generate mode outputs static HTML files for each page at build time. But because Nuxt.js needs to generate 1.000+ pages, the build time got long (over 10 minutes).

The way that I've set up my Nuxt.js project, every page made a separate request to fetch the data it needs. So 1.000 pages make 1.000 API requests. But making 1.000 API requests takes its time. Luckily, with the Nuxt.js `context.payload` option, it is possible to fetch all the data for all the pages upfront. This drastically reduces the number of requests that are made when generating all the static HTML files.

## Table of Contents

- [Passing data to the view with `context.payload`](#passing-data-to-the-view-with-context-payload)
- [Usage with `asyncData()`](#usage-with-asyncdata)
- [Usage with `fetch()` (Nuxt.js <= 2.11)](#usage-with-fetch-nuxt-js-2-11)
- [Usage with `middleware()` (Nuxt.js >= 2.12)](#usage-with-middleware-nuxt-js-2-12)

## Passing data to the view with `context.payload`

Usually, Nuxt.js is very fast when rendering pages, but fetching the necessary data from an external API can take some time.

Thanks to the `context.payload` feature, we can load all of the data we need to render our pages upfront in a single request (or at least only a few requests if there is a maximum of items we can fetch at once).

```js
// nuxt.config.js
import api from './utils/api';

export default {
  // ...
  generate: {
    async routes() {
      const [articles, pages] = await Promise.all([
        api.list('/articles'),
        api.list('/pages'),
      ]);
      
      return [
        // Instead of returning only the slug of
        // each article or page, we provide an object
        // which also contains the data as payload.
        ...articles.map(article => ({
          route: article.slug,
          payload: article.data,
        })),
        ...pages.map(page => ({
          route: page.slug,
          payload: page.data,
        })),
      ];
    },
  },
  // ...
};
```

## Usage with `asyncData()`

Because we are providing the data via the `payload` property, for every route in the `nuxt.config.js`, we can access the data in our pages without making an additional API request.

```html
<template>
  <div class="PageArticle">
    <!-- ... -->
  </div>
</template>

<script>
// pages/articles/_slug.vue
import api from '../../utils/api';

export default {
  name: 'PageArticle',
  data() {
    return {
      article: null,
    };
  },
  async asyncData({ params, payload }) {
    // If a payload is provided,
    // no API request is made.
    if (payload) return { article: payload };

    const response = await api.find(`/articles/${params.id}`);
    return { article: response.data };
  },
};
</script>
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

## Usage with `fetch()` (Nuxt.js <= 2.11)

As we can see, using the payload context property is pretty straightforward when using the `asyncData()` hook. But what if we use Vuex and the `fetch()` hook for managing our data? It pretty much works the same.

```js
export default {
  name: 'PageArticle',
  // ...
  async fetch({ params, payload, store }) {
    if (payload) return store.commit('article/add', payload);

    await store.dispatch('article/get', {
      id: params.id,
    });
  },
  // ...
};
```

In the example above, we have a namespaced Vuex store module `article` with an `add` mutation for adding a new article and a `get` action for fetching a new article from an API endpoint. If the `payload` attribute is set, the mutation is triggered immediately without hitting the API again.

## Usage with `middleware()` (Nuxt.js >= 2.12)

With the latest Nuxt.js release, using `fetch(context)` is deprecated but you can use an [anonymous middleware](https://nuxtjs.org/api/pages-middleware#anonymous-middleware) instead.

```js
export default {
  name: 'PageArticle',
  // ...
  async middleware({ params, payload, store }) {
    if (payload) return store.commit('article/add', payload);

    await store.dispatch('article/get', {
      id: params.id,
    });
  },
  // ...
};
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

Thanks to this little trick, I was able to cut my build time in half. Although this feature is probably known to most people for a long time, I didn't know about it. As so often, I should have read the documentation much earlier.

## References

- [Speeding up dynamic route generation with `payload`, Nuxt.js documentation](https://nuxtjs.org/api/configuration-generate/#speeding-up-dynamic-route-generation-with-code-payload-code-)
