+++
date = "2019-09-22T06:32:32+02:00"
title = "Generic Content Vuex Modules"
description = "Learn how to quickly create new generic Vuex modules for typical CRUD applications with factory functions."
intro = "Today we look at how we can design a system for quickly creating generic Vuex modules for typical CRUD content types. Often when creating applications rather sooner than later we catch ourselves repeating the same boilerplate code over and over again because most of our content types are very similar at their core..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Vuex"]
images = ["/images/c_pad,b_rgb:b5ad3b,f_auto,q_auto,w_1014,h_510/v1542158520/blog/2019-09-22/generic-content-vuex"]
+++

In my [last article, we examined the advantages of a flat Vuex state tree](/blog/make-your-vuex-state-flat-state-normalization-with-vuex/). Today we look at how we can design a system for quickly creating generic Vuex modules for **typical CRUD content types.**

Often when creating applications, rather sooner than later, we catch ourselves **repeating the same boilerplate code** over and over again because **most of our content types are very similar at their core.**

We have several forms for entering data for different content types, which are usually pretty much the same but have different fields. Also, **we display the data in the same list or table views with the same sort and filter mechanisms.** And we use pretty much the same data fetching logic, but with different API endpoints.

In this article, we try to DRY up one aspect of our codebase by building upon the code from the previous article and **making the Vuex part of our application generic and reusable.**

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/generic-content-vuex-modules-yuc3t?fontsize=14&module=%2Fsrc%2Fstore%2Fmodules%2Fcrud.js&view=editor" title="Generic Content Vuex Modules" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

## Building a Vuex module factory

By using a factory function that creates new Vuex store modules for us, we can **reuse all the repeating boilerplate code** and **pass different implementations of specific dependencies** to adapt to the needs of our various content types.

```js
// src/store/modules/crud.js
import Vue from 'vue';

export default function makeCrudModule({
  normalizeRelations = x => x,
  resolveRelations = x => x,
  service
} = {}) {
  return {
    // Actions for `create`, `update` and `delete` omitted for brevity.
    actions: {
      load: async ({ commit }) => {
        // It is not strictly necessary to pass a service,
        // but if none was passed, no data can be loaded.
        if (!service) throw new Error('No service specified!');

        const items = await service.list();
        items.forEach((item) => {
          // Normalize nested data and swap the related objects
          // in the API response with an ID reference.
          commit('add', normalizeRelations(item));
        });
      },
    },
    getters: {
      // Return a single item with the given id.
      find: state => id => {
        // Swap ID referenes with the resolved objects.
        return resolveRelations(state.byId[id]);
      },
      // Return a list of items in the order of `allIds`.
      list: (state, getters) => {
        return state.allIds.map(id => getters.find(id));
      },
    },
    mutations: {
      add: (state, item) => {
        Vue.set(state.byId, item.id, item);
        if (state.allIds.includes(item.id)) return;
        state.allIds.push(item.id);
      },
    },
    namespaced: true,
    state: {
      byId: {},
      allIds: [],
    },
  };
}
```

Here you can see a typical implementation of a Vuex module for handling the data of a generic content type. If you want to read more about what's going on here, you can [read my previous article](/blog/make-your-vuex-state-flat-state-normalization-with-vuex/), which features pretty much the same code, but in a less generic variant.

Instead of exporting a Vuex store module directly, this module exports a function receiving two methods for resolving and normalizing relations (e.g. an article and its author) and a `service` responsible for fetching the data (usually from an API endpoint). All of those three parameters are optional.

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

### Using the CRUD module factory

A huge advantage we gain by using factory functions is that **we can easily test the methods returned by our `crudModuleFactory()`** because we can simply pass fake implementations of all of their dependencies.

Our `src/store/index.js` file serves as an integration point and does not contain any complex logic itself, so we can ignore this file in our unit tests without worrying about it.

```js
// src/store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

import { makeNormalizeRelations, makeResolveRelations } from './helpers';
import articleService from '../services/article';
import makeCrudModule from './modules/crud';

Vue.use(Vuex);

const store = new Vuex.Store({ strict: true });

store.registerModule('article', makeCrudModule({
  normalizeRelations: makeNormalizeRelations({
    fields: ['author'],
    store,
  }),
  resolveRelations: makeResolveRelations({
    fields: ['author'],
    store,
  }),
  service: articleService,
}));
store.registerModule('author', makeCrudModule());

export default store;
```

Because our factory functions for `normalizeRelations()` and `resolveRelations()` need access to the state, we have to create the store first before we can register our `article` and `author` modules. If we want to add additional content types in the future, we can register new store modules using exactly the same approach.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/generic-content-vuex-modules-yuc3t?fontsize=14&module=%2Fsrc%2Fstore%2Fmodules%2Fcrud.js&view=editor" title="Generic Content Vuex Modules" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

## Take it further

Furthermore we could move all of the code necessary to handle a new content type into a separate directory.

```bash
src/
└── modules
    ├── article.js
    ├── author.js
    ├── ...
    └── product.js
```

```js
// src/modules/article.js
import {
  makeNormalizeRelations,
  makeResolveRelations,
} from '../store/helpers';
import articleService from '../services/article';
import makeCrudModule from '../store/modules/crud';
import makeCrudRoutes from '../router/crud';
import router from '../router';
import store from '../store';

// Register routes.
router.addRoutes(makeCrudRoutes('article'));
// `makeCrudRoutes()` could return something like:
// `[
//    { path: 'articles/list', ... },
//    { path: 'articles/edit/:id', ... },
//  ]`

// Register store module.
store.registerModule('article', makeCrudModule({
  normalizeRelations: makeNormalizeRelations({
    fields: ['author'],
    store,
  }),
  resolveRelations: makeResolveRelations({
    fields: ['author'],
    store,
  }),
  service: articleService,
}));

// ...
```

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

Usually, **making your code DRY helps with keeping it maintainable.** But sometimes, as your application evolves, not all of your content types may be as generic as the two we created in this article. In such cases it is important to keep in mind that ***duplication is far cheaper than the wrong abstraction***.

If your content types are vastly different and share only a small amount of logic, you can choose to go a more granular route or even remove the abstraction layer and **re establish minor code duplications where it makes sense.** A glaring sign of this is when you keep adding more `if` statements within your abstractions that change the functionality, depending on the value of the parameters you pass to the factory function. **Almost always this means that you have an error in your abstraction.**

## References

- [Sandi Metz, The Wrong Abstraction](https://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction)
