+++
date = "2019-06-02T06:24:24+02:00"
title = "Observable REST API with Vue.js"
description = "Learn how to use Vue.observable() to build a reactive REST API service with polling capabilities."
intro = "Just recently, I discovered a rather new feature in Vue.js: Vue.observable. It is used internally in Vue.js to make the object returned by the data() function of a component reactive. In this article, we take a look at how we can use this new feature to build a straightforward reactive polling system for a regular REST API..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1532158513/blog/2019-06-02/vue-observable-wrapper"]
+++

Just recently, I discovered a rather new feature in Vue.js (since 2.6.0+): [Vue.observable()](https://vuejs.org/v2/api/#Vue-observable). `Vue.observable()` is used internally in Vue.js to make the object returned by the `data()` function of a component reactive.

In this article, we take a look at how we can use this new feature to build **a straightforward reactive polling system for a regular REST API.**

## REST API utility function with polling

Let's jump right in. In the following example you can see a simple implementation of a `withPolling()` wrapper function which takes a `callback` function and an `interval` as parameters. **If an `interval` time (in ms) is given, it creates a new observable from the data returned by the given `callback` function.** Otherwise it returns the data in a plain object.

```js
// src/utils/api.js
import Vue from 'vue';
// A simple wrapper around the native
// `fetch()` function.
import quickFetch from './quick-fetch';

async function withPolling(callback, interval) {
  const data = await callback();

  // If no polling interval is given we
  // return a regular object with the data.
  if (!interval) return { data };

  // Otherwise, we create a new `Vue.observable()`
  // instance and refetch the data according to
  // the specified polling interval.
  const observableData = Vue.observable({ data });
  const poll = () => {
    setTimeout(async () => {
      observableData.data = { ...(await callback()) };
      poll();
    }, interval);
  };
  poll();

  return observableData;
}

export default function api({ endpoint, interval }) {
  return withPolling(() => quickFetch(endpoint), interval);
}
```

The `api()` function at the bottom is a convenience function to quickly create API services for various endpoints.

```js
// src/services/todo.js
import api from '../utils/api';

const ENDPOINT = 'https://jsonplaceholder.typicode.com/todos';

export default {
  fetch: id => api({ endpoint: `${ENDPOINT}/${id}` }),
  poll: id => api({ endpoint: `${ENDPOINT}/${id}`, interval: 2000 }),
};
```

The `todo` service shown above uses the util function `api()` to create two methods to either simply fetch a TODO item or fetch a TODO item and also poll for changes to that item.

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

Here you can see how we can use our newly created `todo` API service both ways: for fetching static data or with polling enabled.

```html
<template>
  <div id="app">
    <strong>TODO (static)</strong>
    <input
      type="checkbox"
      :checked="response.data.completed"
    >
    {{ response.data.title }}
    <strong>TODO (polling)</strong>
    <input
      type="checkbox"
      :checked="pollResponse.data.completed"
    >
    {{ pollResponse.data.title }}
  </div>
</template>

<script>
import todoService from './services/todo';

export default {
  name: 'App',
  data() {
    return {
      response: { data: {} },
      pollResponse: { data: {} },
    };
  },
  async created() {
    this.response = await todoService.fetch();
    this.pollResponse = await todoService.poll();
  },
};
</script>
```

If you want to see the code in action you can [take a look at the following CodeSandbox](https://codesandbox.io/s/observable-rest-api-with-vuejs-hv54n). Keep in mind, however, that I had to make some modifications to the code in order to demonstrate polling.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/observable-rest-api-with-vuejs-hv54n?fontsize=14&module=%2Fsrc%2FApp.vue&view=editor" title="Observable REST API with Vue.js" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
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

I think `Vue.observable()` can be a very powerful tool when it is used the right way. But it can also be a possible foot gun. Although, even the official documentation states a simple global store solution as a possible use case, I'd highly recommend you to not use `Vue.observable()` that way.

Changing the contents of an observable object should always be one way. Like in our example the data is only modified by the API response. You absolutely should not change the data directly in the consuming `App.vue` component. Otherwise, as your application is growing, you'll soon be in a world of trouble where a lot of different components make changes to the same global state and there is no way of knowing which component triggered what change (that's why you're only allowed to change the state in Vuex through mutations).
