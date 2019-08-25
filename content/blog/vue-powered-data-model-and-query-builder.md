+++
date = "2019-08-25T07:45:45+02:00"
title = "Vue.js Powered Data Model and Query Builder"
description = "Learn how to implement reactive data models with an integrated Query Builder using JavaScript and Vue.js."
intro = "I absolutely love the concept of reactive computed properties in Vue.js. So much so that I miss them in situations where I don't have them available. In this article, we will explore how to create reactive data models with all the features of regular Vue.js components such as computed properties..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1542158518/blog/2019-08-25/reactive-data-models-query-builder"]
+++

I absolutely love the concept of reactive computed properties in Vue.js. So much so that I miss them in situations where I don't have them available. In this article, we will explore how to create reactive data models with all the features of regular Vue.js components such as computed properties. Our goal is to fetch data from an API and store it in a reactive data model.

## Reactive data models

Most of the time we tend to fetch data directly in our components and use computed properties in case we need to process the received data.

```js
// BlogPost.vue
// ...

export default {
  name: 'BlogPost',
  // ...
  computed: {
    authorFullName() {
      return `${this.post.author.firstName} ${this.post.author.lastName}`;
    },
    intro() {
      if (!this.post) return null;

      const wordCount = 20;
      return `${this.post.body
        .split(' ')
        .slice(0, wordCount)
        .join(' ')}...`;
      }
  },
  async created() {
    this.post = await fetch('/posts/1');
  },
  // ...
};
```

But now let's assume we have two or more components in which we want to render the full name of the author of a blog post and a short version of the blog post itself. **This means that we have to repeat the same computed properties over and over again.**

Wouldn't it be nice to actually have the computed properties directly in a data model? **Ideally, we would have to write the logic only once in the data model and the consuming components would access it like any other regular property** - ideally, the data model should work like a Vue.js component.

One possible way to achieve the desired effect is to use Vuex. And there's no reason why you shouldn't use Vuex in such a case, actually I'd say it's perfect for solving such problems. But sometimes it seems a bit over the top to use a global state management solution just to solve a tiny problem.

### Creating a Vue.js powered data model

A lesser-known feature of Vue.js is the ability to create a new instance of `Vue` without the intention of rendering anything.

```js
import Vue from 'vue';

const author = new Vue({
  data() {
    return {
      firstName: 'Joana',
      lastName: 'Doe',
    };
  },
  computed: {
    fullName() {
      return `${this.firstName} ${this.lastName}`;
    },
  },
});

console.log(author.fullName); // Joana Doe
author.firstName = 'John';
console.log(author.fullName); // John Doe
```

Actually, the above code already looks exactly how I imagine a reactive data model should work - and that's not surprising, because that's exactly what Vue.js is all about. Now let's combine this with a simplified prototype of a Query Builder.

## Creating a JavaScript Query Builder

When I first thought of this pattern, I had [Laravel Eloquent models](https://laravel.com/docs/5.8/eloquent) in mind. A very powerful feature of the Laravel Eloquent models is that each model serves as a [Query Builder](https://laravel.com/docs/5.8/queries). For this article I want to implement a very simple version of a Query Builder, which can be improved as needed.

```js
// src/utils/model.js
import Vue from 'vue';

// Helper for creating a new Vue.js
// powered data model instance.
const vueify = ({ data, model }) => {
  const instance = new Vue(model);
  Object.keys(data).forEach(key => {
    // The hash `#` prefix means that
    // this properties should not be
    // modified directly.
    if (typeof instance[`#${key}`] === 'undefined') return;
    instance[`#${key}`] = data[key];
  });
  return instance;
};

function QueryBuilder({ model, provider }) {
  this.query = [];
  this.model = model;
  this.provider = provider;
}

QueryBuilder.prototype.where = function(queryParams) {
  this.query.push(queryParams);
  return this;
};

QueryBuilder.prototype.first = async function() {
  const data = await this.provider.find(this.query);
  return vueify({ data, model: this.model });
};

QueryBuilder.prototype.all = async function() {
  const response = await this.provider.list();
  return response.map(data => vueify({ data, model: this.model }));
};

QueryBuilder.prototype.get = async function() {
  const response = await this.provider.list(this.query);
  return response.map(data => vueify({ data, model: this.model }));
};

// ...
```

Above you can see a very simple implementation of a Query Builder. In a real world application, you would most likely add more features like logical operators, but for demo purposes that's good enough.

```js
// src/utils/model.js
// ...

export const makeModel = ({ computed, fields, provider }) => {
  const model = {
    data: () =>
      // Create prefilled data properties
      // for each field of the model.
      Object.keys(fields).reduce(
        (prev, key) => ({
          ...prev,
          [`#${key}`]: fields[key].default,
        }),
        {},
      ),
    // The values of the fields of the model
    // should not be changed directly, so we
    // expose them as immutable computed
    // properties.
    computed: {
      ...Object.keys(fields).reduce(
        (prev, key) => ({
          ...prev,
          [key]() {
            return this[`#${key}`];
          },
        }),
        {},
      ),
      ...computed
    }
  };
  return new QueryBuilder({ model, provider });
};
```

The `makeModel()` function above, takes an object of computed properties, the fields of the model and a provider for the Query Builder and returns a new Query Builder object.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/vuejs-powered-data-model-and-query-builder-17jzf?fontsize=14&module=%2Fsrc%2Futils%2Fmodel.js&view=editor" title="Vue.js Powered Data Model and Query Builder" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

```js
import { makeModel } from '../utils/model';
import fakeProvider from './providers/fake';

export const makePost = ({ ellipsis = '...', words = 10 }) =>
  makeModel({
    fields: {
      author: { default: {} },
      body: { default: null },
      title: { default: null },
    },
    computed: {
      authorFullName() {
        if (!this.author.firstName) return null;

        return `${this.author.firstName} ${this.author.lastName}`;
      },
      intro() {
        if (!this.body) return null;

        return `${this.body
          .split(' ')
          .slice(0, words)
          .join(' ')}${ellipsis}`;
      }
    },
    provider: fakeProvider
  });
```

Here you can see how we can utilize `makeModel()` in our new `makePost()` function. `makePost()` takes some configuration options and returns a new `post` model which we can use to query our (fake) API exposed via the `fakeProvider`. In a production application you would have an `apiProvider` or a `vuexProvider` or maybe even a `localStorageProvider` which are abstraction layers to fetch data from an API, a Vuex store or the local storage of your browser.

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

## Put it together

Next you can see how we can use the `post` model returned by `makePost()` in a regular Vue.js component.

```html
<template>
  <div v-if="post">
    <h1>{{ post.title }}</h1>
    <span>Author: {{ post.authorFullName }}</span>
    <p>
      <template v-if="showBody">
        {{ post.body }}
      </template>
      <template v-else>
        {{ post.intro }}
        <button @click="showBody = true">
          read more
        </button>
      </template>
    </p>
  </div>
</template>

<script>
import { makePost } from '../models/post';

export default {
  name: 'BlogPost',
  data() {
    return {
      post: null,
      showBody: false,
    };
  },
  async created() {
    // Create a new post model and fetch
    // the first post where the `id` is `1`.
    this.post = await makePost({ words: 20 })
      .where({ id: 1 })
      .first();
  },
};
</script>
```

This example is a simplified version for demonstration purposes. In a real application the `BlogPost` component would take the `post` as a required property so it doesn't care if it is a static object or a reactive data model.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/vuejs-powered-data-model-and-query-builder-17jzf?fontsize=14&module=%2Fsrc%2Fcomponents%2FBlogPost.vue&view=editor" title="Vue.js Powered Data Model and Query Builder" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
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

In the future, the reuse of computed properties can be easily achieved by using the [Vue.js Composition API](https://vue-composition-api-rfc.netlify.com/). But even then, I think it's very valuable to add a layer of abstraction and not directly fetch data within your Vue.js components.

I think using data models can be a very elegant solution not only for reusing code, but also for decoupling your data fetching and rendering logic. If you use some form of dependency injection to make your models available to your components, you could even inject different implementations into different components (think of different computed properties for example).
