+++
date = "2019-10-06T04:39:39+02:00"
title = "Decouple Vue.js components from the Vuex Store"
description = "Learn how to decouple Vue.js components from the Vuex store by using a provider abstraction."
intro = "One of the main concerns I have when building Vuex-based applications is the tight coupling of components with the Vuex store that seems inevitable when using Vuex. Ideally, I want to be able to switch the data layer of my application at any time without having to touch all my components that rely on data from an external resource..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Vuex"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_rgb:3755B0,f_auto,q_auto,w_1014,h_510/v1542158519/blog/2019-10-06/provider-initialization"]
+++

One of the main concerns I have when building Vuex-based applications is the **tight coupling of components with the Vuex store** that seems inevitable when using Vuex. Ideally, I want to be able to switch the data layer of my application at any time without having to touch all my components that rely on data from an external resource.

Today we will explore how to add an abstraction that completely decouples our Vue.js components from the data layer. This makes our components independent of whether the data comes from Vuex or directly from an API or any other data source (e.g. `localStorage`).

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/decouple-vuejs-components-from-the-vuex-store-l7y18?fontsize=14&module=%2Fsrc%2FApp.vue&view=editor" title="Decouple Vue.js components from the Vuex Store" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

## Why decoupling components from Vuex is hard

One of the main reasons why it seems unavoidably to tightly couple components with Vuex is because it is a completely different way of doing things compared to directly fetching data from an API endpoint.

```html
<script>
// src/components/ProductListing.vue
// Tight coupling: classic way.
import productService from '../services/product';

export default {
  // ...
  data() {
    return { products: [] };
  },
  async created() {
    this.products = await productService.list();
  },
  // ...
};
</script>
```

```html
<script>
// src/components/ProductListing.vue
// Tight coupling: Vuex way.
export default {
  // ...
  computed: {
    products() {
      return store.state.product.items;
    }
  },
  async created() {
    await this.$store.dispatch('product/load');
  },
  // ...
};
</script>
```

Above you see first how you can retrieve a list of products directly from an API endpoint and in the second example how we can do basically the same using Vuex.

If we wanted to decouple the first `ProductListing` component from the data layer we could pass the `productService` as a property and rename the `products` property to the generic term `items`.

```html
<script>
// src/components/ListingContainer.vue
export default {
  // ...
  props: {
    service: {
      required: true,
      type: Object,
    },
  },
  data() {
    return { items: [] };
  },
  async created() {
    this.items = await service.list();
  },
  // ...
};
</script>
```

Now we can reuse the `ListingContainer` component to create not only a `ProductListing` but als an `ArticleListing` (and so on) by passing different services to the component.

**But what if we don't want to fetch our products directly from an API but want to access them via our Vuex store instead?** Because Vuex uses the concept of actions and mutations we can not easily use a generic service to get data from our store.

## Using an abstraction for clean decoupling

If we want to make our `ListingContainer` component completely agnostic about where it gets its data from, we need to add an abstraction layer.

For example, we can use a generic `Provider` class and create specific instances of it with **different drivers to fetch data directly from an API or a Vuex store module.**

```js
// src/providers/Provider.js
import Vue from 'vue';

export class Provider extends Vue {}

export default function makeProvider(driver) {
  return new Provider(driver);
}
```

Above you can see a very simple `Provider` abstraction which basically is a clone of the `Vue` class. You might wonder why we don't use `Vue` directly: one reason is that this way we can add more functionality to our `Provider` class in the future. The second reason is that this makes it possible to later specify `Provider` as prop type in our components.

### The Vuex and service drivers

The factory function for creating a new instance of `Provider` takes a `driver` object (which is nothing more than a Vue.js options object) as its only parameter. In the following examples you can see what our driver implementations look like.

```js
// src/providers/drivers/service.js
export default function makeServiceDriver({ service }) {
  return {
    data() {
      return {
        response: [],
      };
    },
    computed: {
      items() {
        return this.response;
      },
    },
    methods: {
      async list() {
        this.response = await service.list();
      },
    },
  };
}
```

The driver for fetching data directly via an API service takes the service as a parameter and uses it to fetch data in its `list()` method. The result is stored in a reactive `response` variable. We use a computed property `items` for exposing the `response` to the consumers of the provider in order to enforce immutability.

```js
// src/providers/drivers/vuex.js
export default function makeVuexDriver({ namespace, store }) {
  return {
    computed: {
      items() {
        return store.state[namespace].items;
      },
    },
    methods: {
      list() {
        store.dispatch(`${namespace}/load`);
      },
    },
  };
}
```

Here you can see the Vuex driver for our provider system. This driver is basically a wrapper around the Vuex way of fetching and receiving data. The `items` property is mapped to the `items` of our store module with the given `namespace`. And the `list()` method dispatches a Vuex action.

### Creating new provider instances

Now everything is ready to create new instances of our providers. Our first `articleProvider` uses the service driver to directly fetch data from an API.

```js
// src/providers/article.js
import makeProvider from './Provider';
import makeServiceDriver from './drivers/service';
import service from '../services/article';

export default makeProvider(
  makeServiceDriver({ service }),
);
```

The product provider initialized in the following example utilizes the Vuex driver to obtain its data.

```js
// src/providers/product.js
import makeProvider from './Provider';
import makeVuexDriver from './drivers/vuex';
import store from '../store';

export default makeProvider(
  makeVuexDriver({ namespace: 'product', store }),
);
```

### Usage of generic providers in components

Last but not least we want to use our newly created providers to feed our components with data.

```html
<script>
// src/components/ArticleListing.vue
import containerFactory from './factories/container';
import provider from '../providers/article';

import ListingContainer from './ListingContainer';

export default containerFactory(ListingContainer, {
  provider
});
</script>
```

In this example we use a `containerFactory` helper to inject the `provider` into a generic `ListingContainer` component as a prop and create a new specific `ArticleListing` component by doing so.

If you want to learn more about the `containerFactory` approach you can [read my previous article about this very topic](https://markus.oberlehner.net/blog/dependency-injection-in-vue-with-functional-component-factories/).

```html
<script>
// src/components/ProductListing.vue
import containerFactory from './factories/container';
import provider from '../providers/product';

import ListingContainer from './ListingContainer';

export default containerFactory(ListingContainer, {
  provider
});
</script>
```

Now with this second example, in which we create a `ProductListing` component, you can see the beauty of the provider abstraction: although the data layer driving the product provider is completely different from the article provider, inside of our `ProductListing`, `ArticleListing` and also the `ListingContainer` component we do not care at all. As long as we get a provider which has a `list()` method and exposes data via a property named `items` we are fine.

```html
<template>
  <div>
    <ul>
      <li
        v-for="item in provider.items"
        :key="item.title"
      >
        {{ item.title }}
      </li>
    </ul>
  </div>
</template>

<script>
// src/components/ListingContainer.vue
import { Provider } from '../providers/Provider';

export default {
  name: 'ListingContainer',
  props: {
    provider: {
      required: true,
      type: Provider,
    },
  },
  created() {
    this.provider.list();
  },
};
</script>
```

Here you can see that we can use the `Provider` class as the `type` we expect for our `provider` property. The generic `ListingContainer` component can be reused for every content type of our application no matter if we fetch the data directly from an API, retrieve it from a Vuex store or maybe even get the data from the `localStorage` of the user. As long as the component receives a provider which handles calls to a `list()` method and exposes its data via an `items` property the `ListingContainer` can deal with it.

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

## Caveats and things to consider

You may wonder if this approach causes too much overhead in a lot of use cases, and I think that is very true. Depending on how you use Vuex, it might already serve you as a form of abstraction around the way how to fetch data from various (third party) sources. In this case, it would only be problematic if you decide to either remove or refactor your Vuex store. If so, and you access your Vuex store directly in a lot of places throughout your application, you will need to touch each component to make it work with the new system.

But if you use the approach described in this article and one day decide to change your provider's API, you must also touch every component that receives its data from a provider. However, it is much more likely that you will need to make changes to one of your API services or Vuex modules, and in such cases you would only need to change your drivers and nothing else.

## Providers and GraphQL

If you are a GraphQL user, you may be wondering how this could fit into your application. Unfortunately, I don't have a good answer to that yet. Although [it is possible to use GraphQL with Vuex](https://markus.oberlehner.net/blog/combining-graphql-and-vuex/) and you also could implement a GraphQL driver you basically lose one of the coolest features of GraphQL which is to only load the properties you actually need for your components.

At the beginning of the article I said that I worry about how tightly coupled Vue.js applications become to the Vuex store if you use Vuex the way it is recommended to be used. The same applies all the more to GraphQL and especially when used with Apollo.

Don't get me wrong, GraphQL and Apollo are great. But you have to be aware that heavily relying on those technologies basically means you have to rewrite a huge chunk of your application if you should ever decide to move away from them.

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

Generally speaking, it is good practice to avoid tight coupling whenever possible. But in this article, we push it to the limit. **Be aware that abstraction sometimes has the potential to make a simple application complicated.**

There are several factors that you should consider when deciding whether to introduce a layer of abstraction or it is better to accept a certain amount of coupling. If you are working on a small to medium sized application, it could be a complete overkill to add layer upon layer of abstraction.

Even if you're working on a large-scale application but your team has a clear vision of the architecture of the app and the communication between team members is great and all the knowledge about how to handle things is evenly distributed between them, you might very well be fine without having too many strict rules about how to do things.

On the other hand, if you are working on an application that will be maintained and constantly updated for at least the next 10 years, it can make your life much easier if your application consists of strictly independent and not tightly coupled components.
