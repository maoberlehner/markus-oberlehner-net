+++
date = "2019-05-19T06:07:07+02:00"
title = "Implementing the Builder Pattern in Vue.js Part 1: Listings"
description = "Learn how to implement the Builder Design Pattern in a typical Vue.js application and how it can be used to build generic listing views."
intro = "Recently I've seen a great talk by Jacob Schatz about Phenomenal Design Patterns in Vue. One of the patterns he mentioned in his talk was the Builder Pattern. I found his example very interesting, so it was clear to me that I had to experiment with this pattern myself..."
draft = false
categories = ["Development"]
tags = ["Front-End Architecture", "JavaScript", "Vue"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1532158513/blog/2019-05-19/builder-director-pattern-vue"]
+++

Recently I've seen a great talk by Jacob Schatz about [Phenomenal Design Patterns in Vue](https://www.youtube.com/watch?v=RF1bbhRw9sg). One of the patterns he mentioned in his talk was the Builder Pattern. I found his example very interesting, so it was clear to me that I had to experiment with this pattern myself.

In this article, we take a look at a possible implementation of the Builder Pattern that is custom tailored to how I typically structure my Vue.js applications. In the first part of this two-part series, **we use this pattern to create highly reusable listing views** (think of an app with a lot of listing views for a multitude of different content types) and in the second part, we will explore a possible solution for creating many generic forms using this approach.

## The Builder Pattern with Vue.js components

The builder pattern is a creational pattern in Object Oriented Programming. “Creational” means **it is typically used for simplifying the process of creating new objects.** But in Vue.js applications it's all about components. So in our case **we wan't the builder class to create a component for us** (in fact a component is actually nothing else than an object).

### Creating listing views with a builder class

Before we take a look at the code let's start with defining the problem we want to solve. Think of the following scenario: we have to build an application which is used to manage a lot of different content types (e.g. users, products, messages, articles, tags,...). For everyone of those content types we need a listing view. Some of the content types are better suited for table views and others should be displayed in a grid view. Again others need a filter system and most also need a pagination navigation.

In the following code snippet you can see a possible solution for a `ListingBuilder` class, which can be used to build all these different variants of list views for us.

```js
// src/builders/ListingBuilder.js
import EntityListing from '../components/EntityListing.vue';

export default class ListingBuilder {
  constructor() {
    this.props = {};
  }

  withProvider(provider) {
    this.provider = provider;
    return this;
  }

  withListingItem(item) {
    this.item = item;
    return this;
  }

  showFilter() {
    this.props.showFilter = true;
    return this;
  }

  showPagination() {
    this.props.showPagination = true;
    return this;
  }

  view(view) {
    this.props.view = view;
    return this;
  }

  build() {
    const Provider = this.provider;
    const Item = this.item;
    const props = this.props;

    return {
      render(h) {
        return h(Provider, [
          h(
            EntityListing,
            {
              props,
              scopedSlots: { default: props => h(Item, { props }) },
            },
            [Item],
          ),
        ]);
      },
    };
  },
};
```

As you can see above, our `ListingBuilder` has multiple methods which we can use to control which kind of listing view is going to be built for us as soon as we call the `build()` method.

```html
<template>
  <div id="app">
    <h2>Product Listing</h2>
    <ProductListing/>
  
    <h2>User Listing</h2>
    <UserListing/>
  </div>
</template>

<script>
// src/App.vue
import ListingBuilder from './builders/ListingBuilder';

import ProductListingItem from './components/ProductListingItem.vue';
import ProductProvider from './components/ProductProvider.vue';

import UserListingItem from './components/UserListingItem.vue';
import UserProvider from './components/UserProvider.vue';

export default {
  name: 'App',
  components: {
    ProductListing: new ListingBuilder()
      .withProvider(ProductProvider)
      .withListingItem(ProductListingItem)
      .showFilter()
      .showPagination()
      .view('grid')
      .build(),
    UserListing: new ListingBuilder()
      .withProvider(UserProvider)
      .withListingItem(UserListingItem)
      .showPagination()
      .view('table')
      .build(),
  },
};
</script>
```

In this example you can see how we can use the `ListingBuilder` class to quickly create two different listing components. The `ProductListing` component has its own `ProductProvider` and `ProductListingItem` implementations, it has filters and a pagination. Furthermore it uses the `grid` view of the generic `EntityListing` component. The `UserListing` component, on the other hand, uses a slightly different configuration.

In the following code snippet you can see how we could achieve the same result by using a separate `ProductListing` component instead.

```html
<template>
  <ProductProvider>
    <EntityListing
      view="grid"
      show-filter
      show-pagination
      v-slot="{ entity }"
    >
      <ProductListingItem :entity="entity"/>
    </EntityListing>
  </ProductProvider>
</template>

<script>
// src/components/ProductListing.vue
import EntityListing from './EntityListing.vue';
import ProductListingItem from './ProductListingItem.vue';
import ProductProvider from './ProductProvider.vue';

export default {
  name: 'ProductListing',
  components: {
    EntityListing,
    ProductListingItem,
    ProductProvider,
  },
};
</script>
```

The result of the code you can see above is exactly the same as what we get when using our `ListingBuilder` class for creating the `ProductListing` component. If you are interested in seeing the rest of the code, you can take a look at the following CodeSandbox.

<div class="c-content__broad">
  <iframe src="https://codesandbox.io/embed/implementing-the-builder-pattern-in-vuejs-listings-y2p0m8v5zz?fontsize=14&module=%2Fsrc%2FApp.vue&view=editor" title="Implementing the Builder Pattern in Vue.js: Listings" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

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

### Enhance reusability with the Director Pattern

Although we have seen that we can save ourselves a lot of work initially by letting the `ListingBuilder` class do the heavy lifting, this pattern could lead to more work in the end if we have to reuse the component `ProductListing` in several places. With the separate component, we can simply import and reuse the component, but when we use the `ListingBuilder`, we have to repeat the initialization logic over and over again wherever we need the component.

**But there is a solution to this problem: the Director Pattern.**

```js
// src/builders/ListingDirector.js
import ProductListingItem from '../components/ProductListingItem.vue';
import ProductProvider from '../components/ProductProvider.vue';

import UserListingItem from '../components/UserListingItem.vue';
import UserProvider from '../components/UserProvider.vue';

export default class ListingDirector {
  constructor(builder) {
    this.builder = builder;
  }

  makeProductListing() {
    return this.builder
      .withProvider(ProductProvider)
      .withListingItem(ProductListingItem)
      .showFilter()
      .showPagination()
      .view('grid')
      .build();
  }

  makeUserListing() {
    return this.builder
      .withProvider(UserProvider)
      .withListingItem(UserListingItem)
      .showPagination()
      .view('table')
      .build();
  }
}
```

```html
<script>
// src/App.vue
import ListingBuilder from './builders/ListingBuilder';
import ListingDirector from './builders/ListingDirector';

export default {
  name: 'App',
  components: {
    ProductListing: new ListingDirector(
      new ListingBuilder()
    ).makeProductListing(),
    UserListing: new ListingDirector(
      new ListingBuilder()
    ).makeUserListing(),
  },
};
</script>
```

Above you can see how we can use the `ListingDirector` for reusing existing configurations of listing components.

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

Although I can definitely see the strengths of this pattern, it feels like a foreign body in a typical Vue.js application. I don't think it's a pattern that you will use very often in every app you build, but rather a pattern that you only reach for in very specific situations.

But this was only the first part of this two-part series. You can [follow me on Twitter](https://twitter.com/MaOberlehner) or [sign up for my newsletter](https://oberlehner.us20.list-manage.com/subscribe?u=8476a98c5640f6c7b5530ea57&id=8b26bf120b) if you don't want to miss the second part where we use this pattern to build a system for creating flexible forms.

## References

- [Jacob Schatz, Phenomenal Design Patterns in Vue](https://www.youtube.com/watch?v=RF1bbhRw9sg)
- [Enmanuel Durán, Building objects progressively with the builder pattern in javascript](https://enmascript.com/articles/2019/03/18/building-objects-progressively-with-the-builder-pattern-in-javascript)
- [Akshar Takle, Design Patterns in Javascript](https://itnext.io/design-patterns-in-javascript-f533632556c1)
