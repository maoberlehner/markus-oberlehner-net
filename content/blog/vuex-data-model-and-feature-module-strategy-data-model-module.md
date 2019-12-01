+++
date = "2019-11-24T07:25:25+02:00"
title = "Vuex Data Model and Feature Module Strategy Part 1: The Data Model Module"
description = "Learn how to structure your Vuex store using a combination of data model and feature modules."
intro = "The data model approach builds on the idea that you have a separate Vuex module for every data model of your application (e.g., users, posts, comments). Following this pattern makes it very straightforward to structure your Vuex store. But there are also some problems with a pure data model paradigm..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Vuex"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_rgb:3FED36,f_auto,q_auto,w_1014,h_510/v1542158520/blog/2019-11-24/data-model-module"]
+++

A few days ago, I read this [excellent article about building and maintaining large Vue.js projects by Nada Rifki](https://www.telerik.com/blogs/10-good-practices-building-maintaining-large-vuejs-projects). **The one section I'm most interested in is about organizing your Vuex store.** I have experimented with both approaches she mentions in her article and also ended up mostly using data model modules.

The data model approach builds on the idea that **you have a separate Vuex module for every data model of your application** (e.g., `users`, `posts`, `comments`). Following this pattern makes it very straightforward to structure your Vuex store.

**But there are also some problems with a pure data model paradigm.** For example, you may find yourself in a situation where you want to display multiple listings for the same content type on a single page. Or you may want different listings (e.g., with different filters) of the same content type on different pages. This is not easily possible with a single Vuex module per content type approach. At least if you want to keep your data model modules very generic.

In the following two articles, you can read about an approach I have developed that is particularly useful in such cases. **With this method, we have one data model module per content type, but we can also have several feature modules that obtain their data from the data model modules.** The data model module can be used to perform the data fetching actions of typical CRUD operations. Additionally, **the data model module serves as a caching layer.**

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/vuex-data-model-and-feature-module-strategy-the-data-model-module-le03t?fontsize=14&hidenavigation=1&module=%2Fsrc%2Fstore%2Fmodules%2Fdata-model.js&view=editor" title="Vuex Data Model and Feature Module Strategy Part 1: The Data Model Module" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

This is the first part of a two-part article series. You can [follow this link to read the second part about Vuex feature modules](/blog/vuex-data-model-and-feature-module-strategy-data-model-module/).

## The data model module factory

Similar to one of my previous articles about [dynamic Vue.js CRUD applications](/blog/dynamic-vue-crud-applications/), we use a factory function, which makes it very convenient to create new Vuex module instances for different data models.

```js
// src/store/modules/data-model.js
import Vue from 'vue';

import asArray from '../../utils/as-array';

export default function makeDataModel({
  service,
}) {
  return {
    namespaced: true,
    actions: {
      async FETCH_ITEMS({ commit, state }, {
        key,
        query,
        useCache = true,
      }) {
        if (!key) throw new Error('Missing `key` attribute.');
        const queryId = `ITEMS_${JSON.stringify(query)}`;

        // By saving the `queryId` with the given `key` in the usage table, we can later
        // determine which queries are still active and can not be pruned from cache.
        state.cache.usage[key] = queryId;

        const cacheHit = useCache && state.cache.queries[queryId];
        if (cacheHit) console.log('From cache:', queryId);
        if (!cacheHit) {
          const response = await service.list(query);
          commit('ADD_QUERY', {
            response,
            id: queryId,
            query,
          })
        }

        return queryId;
      },
      async FETCH_ITEM({ commit, state }, {
        key,
        query,
        useCache = true,
      }) {
        if (!key) throw new Error('Missing `key` attribute.');
        const queryId = `ITEM_${JSON.stringify(query)}`;

        state.cache.usage[key] = queryId;
        const cacheHit = useCache && state.byId[queryId];
        if (cacheHit) console.log('From cache:', queryId);
        if (!cacheHit) {
          const response = await service.find(query);
          commit('ADD_QUERY', {
            response,
            id: queryId,
            query,
          });
        }

        return queryId;
      },
    },
    mutations: {
      ADD_QUERY(state, { response, id, query }) {
        const queryDetails = {
          createdAt: Date.now(),
          id,
          response: {
            ...response,
            data: Array.isArray(response.data) ? response.data.map(x => `${x.id}`) : `${response.data.id}`,
          },
          query,
        };
        Vue.set(state.cache.queries, id, queryDetails);
        asArray(response.data).forEach(item => Vue.set(state.byId, item.id, item));
      },
    },
    getters: {
      items: state => queryId => {
        if (!state.cache.queries[queryId]) return [];
        return state.cache.queries[queryId].response.data.map(id => state.byId[id]);
      },
      item: state => id => {
        return state.byId[id] || null;
      },
      response: state => queryId => {
        if (!state.cache.queries[queryId]) return null;
        const response = state.cache.queries[queryId].response;
        const data = response.data;
        return {
          ...response,
          data: Array.isArray(data) ? data.map(id => state.byId[id]) : state.byId[data.id],
        };
      },
    },
    state: {
      cache: {
        usage: {},
        queries: {},
      },
      byId: {},
    }
  };
}
```

Let's briefly walk through this. For now, the factory function takes a `service` as its only parameter. The `service` is an API service object with two methods `list()` and `find()`. `list()` returns a list of entries and `find()` returns a single entry from an API.

```js
     // ...
     async FETCH_ITEMS({ commit, state }, {
        key,
        query,
        useCache = true,
      }) {
        if (!key) throw new Error('Missing `key` attribute.');
        const queryId = `ITEMS_${JSON.stringify(query)}`;

        // By saving the `queryId` with the given `key` in the usage table, we can later
        // determine which queries are still active and can not be pruned from cache.
        state.cache.usage[key] = queryId;

        const cacheHit = useCache && state.cache.queries[queryId];
        if (cacheHit) console.log('From cache:', queryId);
        if (!cacheHit) {
          const response = await service.list(query);
          commit('ADD_QUERY', {
            response,
            id: queryId,
            query,
          })
        }

        return queryId;
      },
      // ...
```

The `FETCH_ITEMS` and `FETCH_ITEM` actions most importantly take a `key` and a `query` parameter. The `key` is later used to determine if a query is still used by some component or not. The `query` is sent to the API service and is used to create the cache identifier.

If we don't hit the cache, we fetch data from the API and put it in the state; otherwise, we immediately return the `queryId`. This `queryId` will later be used to connect feature modules to our data model.

```js
    // ...
    mutations: {
      ADD_QUERY(state, { response, id, query }) {
        const queryDetails = {
          createdAt: Date.now(),
          id,
          response: {
            ...response,
            data: Array.isArray(response.data) ? response.data.map(x => `${x.id}`) : `${response.data.id}`,
          },
          query,
        };
        Vue.set(state.cache.queries, id, queryDetails);
        asArray(response.data).forEach(item => Vue.set(state.byId, item.id, item));
      },
    },
    // ...
```

The `ADD_QUERY` mutation is responsible for filling the state with new data from the API. Here we also [normalize the `response`](/blog/make-your-vuex-state-flat-state-normalization-with-vuex/).

```js
    // ...
    getters: {
      items: state => queryId => {
        if (!state.cache.queries[queryId]) return [];
        return state.cache.queries[queryId].response.data.map(id => state.byId[id]);
      },
      item: state => id => {
        return state.byId[id] || null;
      },
      response: state => queryId => {
        if (!state.cache.queries[queryId]) return null;
        const response = state.cache.queries[queryId].response;
        const data = response.data;
        return {
          ...response,
          data: Array.isArray(data) ? data.map(id => state.byId[id]) : state.byId[data.id],
        };
      },
    },
    // ...
```

In this snippet, we can see the getters which we can later use to consume the data of our data model. The `items` getter also denormalizes the data again. Here you can see that we need a `queryId` to receive lists of data or a specific response from the data model. This will become important in the second article of this series.

Please note that in this case, the data model is only responsible for retrieving and storing data. If you have to structure the data differently, for example, if you want to sort or filter your data according to the use case, this is not the right place. In the second part of this article series, we create feature modules to deal with such use cases.

### Cleaning up the cache

One of the core features of our data model module is that it automatically caches every response by query string. This is one of the core principles of this pattern. But there is also a problem with this.

Imagine you have 20+ content types, and you have at least one paginated list for every one of those. Every time the user navigates through pages with paginated lists, a query and all of the objects associated with it, is kept in memory. This can quickly become a performance issue. Let's take a look at how we can clean up unused results after a certain time.

```diff
 import asArray from '../../utils/as-array';

 export default function makeDataModel({
+  maxCacheAge = 60000, // 1 Minute.
   service,
 }) {
   return {
     namespaced: true,
     actions: {
       async FETCH_ITEMS({ commit, state }, {
         key,
         query,
         useCache = true,
       }) {
         if (!key) throw new Error('Missing `key` attribute.');
         const queryId = `ITEMS_${JSON.stringify(query)}`;
+        // Cleanup the cache.
+        commit('CLEANUP');

         // ...

         return queryId;
       },
       async FETCH_ITEM({ commit, state }, {
         key,
         query,
         useCache = true,
       }) {
         if (!key) throw new Error('Missing `key` attribute.');
         const queryId = `ITEM_${JSON.stringify(query)}`;
+        // Cleanup the cache.
+        commit('CLEANUP');

         state.cache.usage[key] = queryId;
         const cacheHit = useCache && state.byId[queryId];
```

```js
    // ...
    mutations: {
      ADD_QUERY(state, { response, id, query }) {
        // ...
      },
      CLEANUP(state) {
        const queriyIdsInUse = Object.values(state.cache.usage);
        const unusedQueries = Object.values(state.cache.queries)
          .filter(x => !queriyIdsInUse.includes(x.id));
        const expiredQueries = unusedQueries
          .filter(x => x.createdAt < Date.now() - maxCacheAge);
       // Delete quries from cache if they are expired.
        expiredQueries.forEach((queryDetail) => {
          delete state.cache.queries[queryDetail.id];
        });

        const itemIdsInUse = Object.values(state.cache.queries)
          .reduce((prev, queryDetail) => [...prev, ...asArray(queryDetail.response.data)], []);
        const expiredItems = Object.keys(state.byId).filter(x => !itemIdsInUse.includes(x));
        // Delete items which are not referenced anymore in the cache.
        expiredItems.forEach((id) => {
          delete state.byId[id];
        });
      },
    },
    // ...
```

We have to clean up the cached queries and also all of the objects we have stored in the state `byId`. The tricky part is to determine which parts of our store are still in use and which parts are stale. We can solve this by checking the keys in the `usage` object of our cache.

Unfortunately, this is not a bullet-proof solution. Because if you access the state of the data model module without dispatching a new action to fetch the required object(s) but rely on the fact, that some other component has already dispatched an action so the data is already there, the module can't know that this component relies on the data in the cache. You have to make sure that every component which needs data from the store dispatches the correct action.

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

In the following example code you can see how we can use the data model module pattern by its own. But keep in mind that this will become a lot more useful when combining this approach with feature modules.

```js
// src/store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

import articleService from '../services/article';
import makeDataModel from './modules/data-model'

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    // Use the factory function to create a new instance.
    articles: makeDataModel({ service: articleService }),
  },
  strict: true,
});
```

By providing different API service implementations to the `makeDataModel()` factory function, we can quickly create new data model instances for different content types.

```js
// src/App.vue
// ...

import ViewArticle from './components/ViewArticle';

import store from './store';
const articleId = 2;

export default {
  name: 'App',
  components: {
    ViewArticle,
  },
  computed: {
    article() {
      // Use the getter to retrieve the article from the store.
      return store.getters['articles/item'](articleId);
    },
  },
  created() {
    // Fetch an article with a specific ID.
    store.dispatch('articles/FETCH_ITEM', {
      key: 'APP_VIEW_ARTICLE',
      query: { id: articleId },
    });
  },
};

// ...
```

In the example above, we fetch a specific article by dispatching the `FETCH_ITEM` action in the `created()` method. To access the data we can use the `item` getter of the `articles` module.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/vuex-data-model-and-feature-module-strategy-the-data-model-module-le03t?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue&view=editor" title="Vuex Data Model and Feature Module Strategy Part 1: The Data Model Module" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
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

As we can see in this example, the caching layer adds a lot of complexity to our architecture. It is certainly a weak point in this implementation because if you don’t use it correctly, you can introduce hard to debug bugs into your code base. You have to decide yourself if this is worth it for you.

Out of the box solutions like the Apollo caching layer can hide this complexity from you so you don’t have to deal with it (as long as everything works).

But this was only the first part of a two part series. [In the second part we explore how we can combine data model modules with feature modules for paginated lists and other use cases](/blog/vuex-data-model-and-feature-module-strategy-data-model-module/).

## References

- [Nada Rifki, 10 Good Practices for Building and Maintaining Large Vue.js Projects](https://www.telerik.com/blogs/10-good-practices-building-maintaining-large-vuejs-projects)
