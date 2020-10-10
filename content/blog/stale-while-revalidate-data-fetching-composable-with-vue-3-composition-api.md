+++
date = "2020-05-10T10:28:28+02:00"
title = "Stale-While-Revalidate Data Fetching Composable with Vue 3 Composition API"
description = "Learn how to use the Vue 3 Composition API to build a data fetching composable implementing the Stale-While-Revalidate pattern."
intro = "When building apps that rely on data from an API, two things are essential: we want our data to be fresh, and we want it fast. The Stale-While-Revalidate cache pattern helps us to strike a balance between both..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:F5D423,f_auto,q_auto,w_1014,h_510/v1542158521/blog/2020-05-10/vue-3-swr-composable"]
+++

> This article covers the basics of how to build a simple implementation of the SWR pattern. If you want to use it in a production application, I recommend using a fully-equipped package like [swrv](https://github.com/Kong/swrv).

When building apps that rely on data from an API, two things are essential: **we want our data to be fresh, and we want it fast.** The Stale-While-Revalidate cache pattern helps us to strike a balance between both.

If our cache already contains a copy of the requested information, **we can immediately show the (potentially stale) data.** But at the same time, **we revalidate our cache and fetch a new version.** This can make navigating our apps feel instantaneously while also making sure that the user sees the latest data eventually.

<div class="c-content__figure">
  <div class="c-content__broad">
    <video
      data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1532157367/blog/2020-05-10/vue-3-swr-composable-demo.mp4"
      poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157367/blog/2020-05-10/vue-3-swr-composable-demo"
      muted
      autoplay
      loop
    ></video>
  </div>
  <p class="c-content__caption">
    <small>Multiple components fetching the same data with `useSwrCache()`</small>
  </p>
</div>

In the video above, you can see two components which both fetch their data from the same API endpoint. **Thanks to the SWR composable, the data is always in sync.** Even if a new component is added, **it immediately has access to the cached data while fetching a fresh copy in the background.**

If you want to try it yourself, you can check out the demo hosted on [Netlify](https://vue-3-composition-api-data-fetching-composable.netlify.app/) and [take a closer look at the code on GitHub](https://github.com/maoberlehner/vue-3-composition-api-data-fetching-composable).

## Inspiration in the React world

In the last couple of weeks, I played around with Preact, and I learned a thing or two about how to do things in the React ecosystem. I discovered that because of how React Hooks work, there are a few special requirements on how to fetch data in React components.

This is why since the introduction of Hooks, two quite similar data fetching libraries saw the light of day: [React Query](https://github.com/tannerlinsley/react-query) and [SWR](https://github.com/zeit/swr). What we build today is inspired by those libraries.

## SWR Data Fetching Composable with Vue 3

I kept an eye on the development of the Vue 3 Composition API since the first RFC was published, but I never got around actually using it extensively. **After experimenting with it for a couple of days, I can say this: it is fantastic!** Now that I have (minimal) knowledge about how things are done in React, I can even more appreciate how powerful and straightforward to use the Composition API is.

So without further ado, let's take a look at a naive implementation of a Stale-While-Revalidate data fetching composable for Vue 3.

```js
// src/composables/swr-cache.js
import { reactive, readonly, toRefs } from 'vue';
import LRU from 'lru-cache';

import { asArray } from '../utils/as-array';

const CACHE = new LRU({ max: 1024 });

const DEFAULT_OPTIONS = {
  dedupingInterval: 2000,
};

// We use `Symbol` for the state properties to prevent
// consumers of this package to use raw strings.
// See: https://bit.ly/2Lh2lEM
export const STATE = {
  error: Symbol('error'),
  idle: Symbol('idle'),
  loading: Symbol('loading'),
  revalidating: Symbol('revalidating'),
};

export function useSwrCache(parameter, callback, customOptions) {
  const options = {
    ...DEFAULT_OPTIONS,
    ...customOptions,
  };

  // Wrap `parameter` in an array if it is not an array already.
  const parameters = asArray(parameter);
  // Naive way of creating a unique cache key.
  const cacheKey = `${JSON.stringify(parameters)}${callback.toString()}`;
  const cacheKeyDedupe = `${cacheKey}_dedupe`;
  const cachedResponse = CACHE.get(cacheKey);

  // Use the reactive object from the cache or create a new one.
  const response = cachedResponse || reactive({
    data: null,
    error: null,
    reload: undefined,
    state: undefined,
  });

  if (!cachedResponse) CACHE.set(cacheKey, response);

  const load = async () => {
    try {
      // Dedupe requests during the given interval.
      if (CACHE.get(cacheKeyDedupe)) return;

      CACHE.set(cacheKeyDedupe, true, options.dedupingInterval);

      response.state = response.data ? STATE.revalidating : STATE.loading;
      // Wait for the result of the callback and set
      // the reactive `data` property.
      response.data = Object.freeze(await callback(...parameters));
      response.state = STATE.idle;
    } catch (error) {
      console.error(error);
      
      CACHE.del(cacheKeyDedupe);
      
      response.error = error;
      response.state = STATE.error;
    }
  };

  response.reload = load;
  load();

  // Using `toRefs()` makes it possible to use
  // spreading in the consuming component.
  // Making the return value `readonly()` prevents
  // users from mutating global state.
  return toRefs(readonly(response));
}
```

One beautiful thing about this approach but also a potential gotcha is that every instance that resolves to the same cache key shares the same reactive object. **So if one component triggers a reload, the data is updated everywhere. It almost works like a global Vuex store.**

One thing to mention is that the way how the `cacheKey` is created is not very reliable. Because: `JSON.stringify({ a: 'a', b: 'b' }) !== JSON.stringify({ b: 'b', a: 'a' })`. Property order does matter! But as long as you only use strings as parameters, that's no problem.

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

## Usage

Now let's take a look at how we can use our newly created `useSwrCache()` composable.

```html
<template>
  <div>
    <h2>Profile</h2>

    <template v-if="user">
      Name: {{ user.name }}
      <!-- ... -->
    </template>
    <template v-else-if="state === STATE.loading">
      LOADING ...
    </template>
    <template v-else-if="state === STATE.error">
      {{ error }}
    </template>

    <!-- Stale data is shown while revalidating! -->
    <template v-if="state === STATE.revalidating">
      <small>REVALIDATING ...</small>
    </template>
  </div>
</template>

<script>
import { fetcher } from '../utils/fetcher';
import { useSwrCache, STATE } from '../composables/swr-cache';

export default {
  name: 'UserProfile',
  setup() {
    const {
      data: user,
      error,
      state,
    } = useSwrCache('https://jsonplaceholder.typicode.com/users/1', fetcher);

    return {
      STATE,
      error,
      state,
      user,
    };
  },
};
</script>
```

The `fetcher` utility is a simple wrapper around `fetch()`. `useSwrCache` returns a reactive object with the `data`, the current `state` and, if applicable, an `error`.

We have two different states for `loading` (no cached data) and `revalidating`.

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

Although it works perfectly fine, this is a quite raw implementation and in no way as comprehensive as React Query or SWR. If you consider using something like this in production, you might want to use a more bulletproof approach for generating unique cache keys.
