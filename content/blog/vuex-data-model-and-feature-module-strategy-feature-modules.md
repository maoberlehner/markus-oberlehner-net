+++
date = "2019-12-01T05:28:28+02:00"
title = "Vuex Data Model and Feature Module Strategy Part 2: Feature Modules"
description = "Learn how to use Vuex feature modules in combination with data model modules to centralize data fetching."
intro = "In this article, we extend the functionality of our very simple demo application from the previous article to display multiple paginated lists for the same content type. The paginated list feature module does not fetch any data itself but instead connects to the data model module. Doing so makes it possible to cache requests with the same query across feature modules to reduce the number of requests to your API and make your app feel snappy..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Vuex"]
images = ["/images/c_pad,b_rgb:EFFA27,f_auto,q_auto,w_1014,h_510/v1542158520/blog/2019-12-01/feature-module"]
+++

This is the second part of a series about the separation of Vuex Store modules into **data model modules and feature modules.** If you have not done so, you should [read the first article before proceeding](/blog/vuex-data-model-and-feature-module-strategy-data-model-module/).

In this article, we extend the functionality of our very simple demo application from the previous article to **display multiple paginated lists for the same content type.**

The paginated list feature module does not fetch any data itself but instead connects to the data model module. Doing so makes it possible to cache requests with the same query across feature modules to reduce the number of requests to your API and make your app feel snappy.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/vuex-data-model-and-feature-module-strategy-feature-modules-8s7yv?fontsize=14&hidenavigation=1&module=%2Fsrc%2Fstore%2Fmodules%2Fpaginated-list.js&view=editor" title="Vuex Data Model and Feature Module Strategy Part 2: Feature Modules" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

## Feature modules

In contrast to data model modules, which are very generic and look mostly the same for each data type, feature modules can come in all shapes and sizes.

For demonstration purposes, **we build a paginated list module,** but you can use a similar approach to structure the state tree for a variety of use cases.

### The paginated list module

An everyday use case in many applications is the rendering of paginated content lists. This is the perfect example of a Vuex feature module. **Our pagination module is highly reusable, and each instance can connect to a different data model module, or you can connect multiple feature modules to a single data model module.**

Again, we start with a factory function that helps us quickly create new instances of the paginated list feature module.

```js
// src/store/modules/paginated-list.js
export default function makePaginatedList({ dataModel, name }) {
  return {
    actions: {
      async FETCH_PAGE({ commit, dispatch }, query = {}) {
        const key = `${name}_FETCH_PAGE`;
        const payload = { key, query };
        const queryId = await dispatch(`${dataModel}/FETCH_ITEMS`, payload, {
          root: true
        });
        commit('SET_QUERY_ID', { queryId });
      }
    },
    mutations: {
      SET_QUERY_ID(state, { queryId }) {
        state.queryId = queryId;
      }
    },
    getters: {
      items(state, _, __, rootGetters) {
        return rootGetters[`${dataModel}/items`](state.queryId);
      },
      meta(state, _, __, rootGetters) {
        const response = rootGetters[`${dataModel}/response`](state.queryId);
        if (!response) return { page: 0, pages: 0, pageSize: 0, total: 0 };
        return response.meta;
      }
    },
    state: {
      queryId: null
    },
    namespaced: true,
  };
}
```

Right at the beginning, we can see the vital part of this feature module: **instead of submitting a distinct API request, we dispatch an action to our data model module.** From that, we get back a `queryId`, which we can use to link our feature module to the state of the data model.

As soon as the `queryId` state is set, **the two getters `items` and `meta` return the data of the data model for the associated `queryId`.** The `items` getter gives us a list of all items for the current page, and the `meta` getters return additional information like the current `page` and the number of total `pages`, for example.

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

### Using feature modules

Now let's take a look at how we can use our newly created paginated list feature module to render multiple paginated lists for the same content type. All of which can have an independent state but can reuse cached queries from the data model module.

```js
// src/store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

import articleService from '../services/article';
import makeDataModel from './modules/data-model';
import makePaginatedList from './modules/paginated-list';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    articles: makeDataModel({ service: articleService }),
    latestArticles: makePaginatedList({
      dataModel: 'articles',
      name: 'latestArticles',
    }),
    userArticles: makePaginatedList({
      dataModel: 'articles',
      name: 'userArticles',
    }),
  },
  strict: true,
});
```

Here we register two new instances of our paginated list module: `latestArticles` and `userArticles`. We want to utilize the first one to render a paginated list of the most recently created articles. The second one is responsible for holding the state of all articles the currently logged in user has written.

```html
<!-- src/components/LatestArticles.vue -->
<template>
  <div>
    <h2>Latest Articles</h2>
    <PaginatedList
      :items="articles"
      :meta="meta"
      @page="fetchPage"
    />
  </div>
</template>

<script>
import PaginatedList from './PaginatedList';

import store from '../store';

export default {
  name: 'LatestArticles',
  components: {
    PaginatedList,
  },
  created() {
    this.fetchPage();
  },
  methods: {
    fetchPage(page = 1) {
      store.dispatch('latestArticles/FETCH_PAGE', { page });
    },
  },
  computed: {
    articles() {
      return store.getters['latestArticles/items'];
    },
    meta() {
      return store.getters['latestArticles/meta'];
    },
  },
};
</script>
```

In this component, we connect to the `latestArticles` module to get our state. In the following very similar `MyArticles` component, we connect to the `userArticles` module instead.

```html
<!-- src/components/MyArticles.vue -->
<template>
  <div>
    <h2>My Articles</h2>
    <PaginatedList
      :items="articles"
      :meta="meta"
      @page="fetchPage"
    />
  </div>
</template>

<script>
import PaginatedList from './PaginatedList';

import store from '../store';

export default {
  name: 'MyArticles',
  components: {
    PaginatedList,
  },
  created() {
    this.fetchPage();
  },
  methods: {
    fetchPage(page = 1) {
      store.dispatch('userArticles/FETCH_PAGE', { page, userId: 2 });
    },
  },
  computed: {
    articles() {
      return store.getters['userArticles/items'];
    },
    meta() {
      return store.getters['userArticles/meta'];
    },
  },
};
</script>
```

As you can see, these two components are very similar. In a real-world app, you would most likely want to remove this duplication, but for demonstration purposes, this is fine.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/vuex-data-model-and-feature-module-strategy-feature-modules-8s7yv?fontsize=14&hidenavigation=1&module=%2Fsrc%2Fcomponents%2FMyArticles.vue&view=editor" title="Vuex Data Model and Feature Module Strategy Part 2: Feature Modules" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like What You Read?</h2>
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

Using this pattern makes it possible to adapt to various use cases, but it also adds a certain amount of overhead to the architecture of our application.

Furthermore, especially the caching part of this approach is highly experimental and not tested in production. If you plan to implement something similar in your application, you most likely have to adapt it to your needs and deal with some of the possible caveats.

Other than that, I think this is a good foundation for building a scalable Vuex store.
