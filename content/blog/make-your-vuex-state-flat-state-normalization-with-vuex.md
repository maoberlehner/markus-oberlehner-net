+++
date = "2019-09-15T07:36:36+02:00"
title = "Make your Vuex State Flat: State Normalization with Vuex"
description = "Learn how to design a flat Vuex store architecture in order to avoid deeply nested state trees."
intro = "Listening to one of Full Stack Radio's latest episodes, I was very impressed by the expertise of Matt Biilmann, CEO of Netlify. Adam Wathan and Matt talked a lot about how global state is handled in the Netlify web application. Although the Netlify app is built with React and Redux when he spoke of his philosophy for structuring the global state of the app, it motivated me to think a little more about this topic in the context of Vue.js and Vuex..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Vuex"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_rgb:3CB797,f_auto,q_auto,w_1014,h_510/v1542158518/blog/2019-09-15/flat-vuex-state"]
+++

Listening to one of [Full Stack Radio's latest episodes](http://www.fullstackradio.com/122), I was very impressed by the expertise of Matt Biilmann, CEO of Netlify. Adam Wathan and Matt talked a lot about how global state is handled in the Netlify web application. Although the Netlify app is built with React and Redux when he spoke of his philosophy for structuring the global state of the app, it motivated me to think a little more about this topic in the context of Vue.js and Vuex.

## Global state best practices

The first rule you should bear in mind when dealing with global state is that it is not a panacea for all your state-related problems. I recommend that you always use your Vuex store as a means of last resort and only use it when there is a good reason to do so. Always [consider the alternatives to putting state into Vuex](https://markus.oberlehner.net/blog/should-i-store-this-data-in-vuex/).

The second rule is to keep your global state tree flat. This means that you should not have nested entities like article data with the corresponding author information as nested objects in your state. Instead, lists of articles and authors should be separated.

### Problems with deeply nested Vuex state

One of the main problems with a nested state tree is that it is more difficult to keep all your data up to date and synchronized. Suppose you have a few articles of the same author in your state and now the author changes their profile and at the same time the user loads a new article of that author. Now the newly loaded article shows a different author profile than the rest of the articles that were loaded before the author updated their profile.

```js
const articles = [
  // This article was loaded first.
  {
    author: {
      avatar: 'https://picsum.photos/id/1011/25',
      id: 1,
      name: 'Jane Doe',
    },
    id: 1,
    intro: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
    title: 'Lorem Ipsum',
  },
  // Here you can see that this article,
  // which was loaded later, references a
  // different avatar image.
  {
    author: {
      avatar: 'https://picsum.photos/id/2000/25',
      id: 1,
      name: 'Jane Doe',
    },
    id: 2,
    intro: 'Stet clita kasd gubergren, no sea takimata sanctus est.',
    title: 'Dolor sit',
  },
];
```

If you store author data and article data separately instead, there is only one author entry in your state and you can update this entry every time you fetch a new article.

```js
const articles = {
  // IDs as keys to avoid duplicate
  // entries and enable easy access.
  1: {
    // Reference authors by ID.
    author: 1,
    id: 1,
    intro: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
    title: 'Lorem Ipsum',
  },
  2: {
    author: 1,
    id: 2,
    intro: 'Stet clita kasd gubergren, no sea takimata sanctus est.',
    title: 'Dolor sit',
  },
};

const authors = {
  // No duplicated author data anymore.
  1: {
    avatar: 'https://picsum.photos/id/2000/25',
    id: 1,
    name: 'Jane Doe',
  },
};
```

In addition, nesting your state makes it more complicated to update deeply nested fields because you have to write quite complex code to get to the relevant property you want to update.

## Normalizing Vuex state

In Vuex we can use modules to cleanly separate different entity types. And in addition to that we can use the concept of foreign keys, like in a traditional database, to relate certain entities to each other.

```js
// src/store/modules/article.js
import Vue from 'vue';

import { normalizeRelations, resolveRelations } from '../helpers';
import articleService from '../../services/article';

const state = {
  byId: {},
  allIds: [],
};

const getters = {
  // Return a single article with the given id.
  find: (state, _, __, rootGetters) => id => {
    // Swap ID referenes with the resolved author objects.
    return resolveRelations(state.byId[id], ['author'], rootGetters);
  },
  // Return a list of articles in the order of `allIds`.
  list: (state, getters) => {
    return state.allIds.map(id => getters.find(id));
  },
};

const actions = {
  load: async ({ commit }) => {
    const articles = await articleService.list();
    articles.forEach((item) => {
      // Normalize nested data and swap the author object
      // in the API response with an ID reference.
      commit('add', normalizeRelations(item, ['author']));
      // Add or update the author.
      commit('author/add', item.author, {
        root: true,
      });
    });
  },
};

const mutations = {
  add: (state, item) => {
    Vue.set(state.byId, item.id, item);
    if (state.allIds.includes(item.id)) return;
    state.allIds.push(item.id);
  },
};

export default {
  actions,
  getters,
  mutations,
  namespaced: true,
  state,
};
```

Above you can see a simple implementation of a flat Vuex store module with `find` and `list` getters for conveniently returning a nested representation of our flat state.

The most interesting parts of this are the `normalizeRelations()` and `resolveRelations()` helper functions which help us to convert a nested state into a flat state and vice versa.

```js
// src/store/helpers.js
export function normalizeRelations(data, fields) {
  return {
    ...data,
    ...fields.reduce((prev, field) => ({
      ...prev,
      [field]: Array.isArray(data[field])
        ? data[field].map(x => x.id)
        : data[field].id,
    }), {}),
  };
}

export function resolveRelations(data, fields, rootGetters) {
  return {
    ...data,
    ...fields.reduce((prev, field) => ({
      ...prev,
      [field]: Array.isArray(data[field])
        ? data[field].map(x => rootGetters[`${field}/find`](x))
        : rootGetters[`${field}/find`](data[field]),
    }), {}),
  };
}
```

The use of these two simple helper functions requires that you follow the convention of always having an `id` field for referencing other entities. If you have a more complex data structure you can use the [normalizr](https://github.com/paularmstrong/normalizr) package which was developed exactly for that use case.

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

Let's take a look at how we can consume the data of our Vuex store in our Vue.js application.

```html
<template>
  <div id="app">
    <ArticleList :articles="articles"/>
  </div>
</template>

<script>
// src/App.vue
import { mapActions, mapGetters } from 'vuex';

import ArticleList from './components/ArticleList';

export default {
  name: 'App',
  components: {
    ArticleList,
  },
  computed: {
    ...mapGetters('article', { articles: 'list' }),
  },
  created() {
    this.loadArticles();
  },
  methods: {
    ...mapActions('article', { loadArticles: 'load' }),
  },
};
</script>
```

In our `App.vue` component we map the relevant getter and action from our `article` store module and we pass the `articles` which we load in the `created()` hook via `this.loadArticles()` to an `ArticleList` component.

```html
<template>
  <ul class="ArticleList">
    <li
      v-for="article in articles"
      :key="article.id"
    >
      <h2>{{ article.title }}</h2>
      <p>{{ article.intro }}</p>
      <div class="ArticleList__author">
        <img class="ArticleList__avatar" :src="article.author.avatar" :alt="article.author.name">
        {{ article.author.name }}
      </div>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'ArticleList',
  props: {
    articles: {
      required: true,
      type: Array,
    },
  },
};
</script>
```

Here you can see that thanks to our getter function and the `resolveRelations()` helper, we're able to conveniently access the articles author data.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/state-normalization-with-vuex-pyqyt?fontsize=14&module=%2Fsrc%2Fstore%2Fmodules%2Farticle.js&view=editor" title="State Normalization with Vuex" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
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

If you keep your Vuex state flat and avoid deeply nested state trees, it's much easier to reason about your state architecture. And in my experience, it also makes it a lot easier when it comes to updating data in your Vuex Store.

## References

- [Redux Docs, Normalizing State Shape](https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape)
- [Linus Borg, Vue Forum](https://forum.vuejs.org/t/vuex-best-practices-for-complex-objects/10143/2)
