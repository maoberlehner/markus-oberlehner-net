+++
date = "2018-05-21T08:25:25+02:00"
title = "Building Renderless Components to Handle CRUD Operations in Vue.js"
description = "Learn how to build reusable components which can handle basic CRUD operations using the “renderless components” approach."
intro = "In episode 81 of the Full Stack Radio podcast Adam Wathan and Evan You talked about the possibility of utilizing the power of slot scopes to build components which sole purpose is to fetch data and provide the result via slot scope properties to the markup. In today's article we're going to take this into practice and we even go a little further: we'll build “renderless components” to handle all CRUD operations in a reusable way..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
+++

In [episode 81 of the Full Stack Radio podcast](http://www.fullstackradio.com/81) Adam Wathan and Evan You talked about the possibility of utilizing the power of slot scopes to build components which sole purpose is to fetch data and provide the result via slot scope properties to the markup. In today's article we're going to take this into practice and we even go a little further: we'll build “renderless components” to handle all CRUD operations in a reusable way.

Disclaimer: while working on this article I've found out that Adam has already implemented a basic version of this concept in his [Advanced Vue Component Design](https://adamwathan.me/advanced-vue-component-design/) course himself (check out Adams course, it's definitely worth its money), but because in my article, I take the idea one step further, I decided that this article is still worth publishing.

As it is with almost all of my articles, you can find [the full code on GitHub](https://github.com/maoberlehner/building-renderless-components-to-handle-crud-operations-in-vue) or take a look at [the demo page hosted on Netlify](https://building-renderless-components-to-handle-crud-operations-in-vue.netlify.com/).

## Building our first renderless component

The term “renderless component” comes from the react world and, as far as I know, it was first used by [Adam Wathan](https://adamwathan.me/renderless-components-in-vuejs/) in conjunction with Vue.js components – it describes a component, which does not render any HTML itself but instead provides data and functionality to a component via a [scoped slot](https://vuejs.org/v2/guide/components-slots.html#Scoped-Slots). In this step, we'll create a renderless component which fetches data from an API.

```bash
npm install --save axios
```

First of all, let's install `axios` as a dependency, because `axios` makes it easier to handle requests to an API.

```js
// src/components/DataList.js
import axios from 'axios';

export default {
  props: {
    baseUrl: {
      type: String,
      // The JSONPlaceholder API is a fake API
      // basically a Lorem Ipsum JSON API.
      default: 'https://jsonplaceholder.typicode.com',
    },
    endpoint: {
      type: String,
      required: true,
    },
    // Provide a filter to limit the
    // results of the API request.
    filter: {
      type: Object,
    },
  },
  data() {
    return {
      // Create a new axios instance.
      // See: https://github.com/axios/axios#creating-an-instance
      api: axios.create({ baseURL: this.baseUrl }),
      data: null,
      error: null,
      loading: false,
    };
  },
  watch: {
    // Load the data from the given endpoint
    // on initial rendering of the component and
    // every time the filter property changes.
    filter: {
      immediate: true,
      handler: 'load',
    },
  },
  methods: {
    // The `query` method will handle
    // different query types for us.
    async query(type, ...params) {
      // If we're currently loading content
      // we don't submit an additional request.
      if (this.loading) return;

      this.loading = true;
      try {
        const response = await this.api[type](...params);
        this.data = response.data;
        this.error = null;
        this.$emit('success', response);
      } catch (error) {
        this.data = null;
        this.error = error.response;
        this.$emit('error', error);
      }
      this.loading = false;
    },
    load() {
      return this.query('get', this.endpoint, { params: this.filter });
    },
  },
  render() {
    // Render the default scoped slot and
    // provide data and method properties
    // via the slot scope.
    return this.$scopedSlots.default({
      data: this.data,
      error: this.error,
      load: this.load,
      loading: this.loading,
    });
  },
};
```

The code above might look rather complex but I think it becomes more clear when we take a look at how to use the `DataList` component in the next example.

### Declarative data fetching

The `DataList` component is basically a declarative way to fetch data from an API endpoint. We provide an API endpoint and we react to whichever data we receive in a declarative way.

```html
<data-list endpoint="posts">
  <div slot-scope="{ data: posts, error, loading }">
    <span v-if="loading">Loading...</span>
    <span v-else-if="error">Error while fetching data!</span>
    <ul v-else>
      <li v-for="post in posts" :key="post.id">
        <h3>{{ post.title }}</h3>
        <p>{{ post.body }}</p>
      </li>
    </ul>
  </div>
</data-list>
```

In the code snippet above, you can see a basic example for how to use the `DataList` component to fetch a list of posts  and render the data returned by the API endpoint. Displaying a loading state and error handling can be done very easily thanks to the properties provided by the `DataList` component.

#### Pagination

Let's take a look at a more advanced example. With some small tweaks to the code from the previous example, we're able to implement a simple pagination.

```html
<data-list
  endpoint="posts"
  :filter="{ page }"
>
  <div slot-scope="{ data: posts, error, loading }">
    <span v-if="loading">Loading...</span>
    <span v-else-if="error">Error while fetching data!</span>
    <ul v-else>
      <li v-for="post in posts" :key="post.id">
        <h3>{{ post.title }}</h3>
        <p>{{ post.body }}</p>
      </li>
    </ul>
    <button @click="page = 1">1</button>
    <button @click="page = 2">2</button>
    <button @click="page = 3">3</button>
  </div>
</data-list>
```

In the example above, you can see that we now pass a filter object as a property to the `<data-list>` component instance. The buttons at the bottom are our pagination controls, by setting the value of `page` every time a user clicks on a button, the `filter` is updated and the `DataList` component triggers the `load()` method.

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

## Declarative CRUD operations

So far we've only touched the `R` in `CRUD`. Let's take a look at how we can make it possible to also create, update and delete data in a declarative way.

### Refactoring

Before we get started with implementing a component to handle CRUD operations, we should refactor our code first in order to being able to reuse parts of it for our new component.

```diff
-import axios from 'axios';
+import queryMixin from './mixins/query';
 
 export default {
+  mixins: [queryMixin],
   props: {
-    baseUrl: {
-      type: String,
-      // The JSONPlaceholder API is a fake API
-      // basically a Lorem Ipsum JSON API.
-      default: `https://jsonplaceholder.typicode.com`,
-    },
-    endpoint: {
-      type: String,
-      required: true,
-    },
     // Provide a filter to limit the
     // results of the API request.
     filter: {
       type: Object,
     },
   },
-  data() {
-    return {
-      // Create a new axios instance.
-      // See: https://github.com/axios/axios#creating-an-instance
-      api: axios.create({ baseURL: this.baseUrl }),
-      data: null,
-      error: null,
-      loading: false,
-    };
-  },
   // ...
   methods: {
-    // The `query` method will handle
-    // different query types for us.
-    async query(type, ...params) {
-      // If we're currently loading content
-      // we don't submit an additional request.
-      if (this.loading) return;
-
-      this.loading = true;
-      try {
-        const response = await this.api[type](...params);
-        this.data = response.data;
-        this.error = null;
-        this.$emit('success', response);
-      } catch (error) {
-        this.data = null;
-        this.error = error.response;
-        this.$emit('error', error);
-      }
-      this.loading = false;
     },
     load() {
       return this.query('get', this.endpoint, { params: this.filter });
     },
   },
   // ...
 };
```

We can remove a lot of functionality from the `DataList` component and move it into a generic `query` mixin which we can reuse in other components.

```js
// src/components/mixins/query.js
import axios from 'axios';

export default {
  props: {
    baseUrl: {
      type: String,
      // The JSONPlaceholder API is a fake API
      // basically a Lorem Ipsum JSON API.
      default: `https://jsonplaceholder.typicode.com`,
    },
    endpoint: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      // Create a new axios instance.
      // See: https://github.com/axios/axios#creating-an-instance
      api: axios.create({ baseURL: this.baseUrl }),
      data: null,
      error: null,
      loading: false,
    };
  },
  methods: {
    // The `query` method will handle
    // different query types for us.
    async query(type, ...params) {
      // If we're currently loading content
      // we don't submit an additional request.
      if (this.loading) return;

      this.loading = true;
      try {
        const response = await this.api[type](...params);
        this.data = response.data;
        this.error = null;
        this.$emit(`success`, response);
      } catch (error) {
        this.data = null;
        this.error = error.response;
        this.$emit(`error`, error);
      }
      this.loading = false;
    },
  },
};
```

### The DataModel component

The `create`, `update` and `delete` operations have one thing in common: they're dealing with a single entity. The `DataList` component is meant to handle lists, let's create a new component to handle single records.

```js
// src/components/DataModel.js
import queryMixin from './mixins/query';

export default {
  mixins: [queryMixin],
  props: {
    // Make it possible to (optinally) provide
    // initial data via an `entity` property.
    entity: {
      type: Object,
    },
    // By providing an initial ID, we can link
    // the model instance with a specific record.
    id: {
      type: [Number, String],
    },
  },
  data() {
    return {
      data: this.entity || null,
    };
  },
  created() {
    // If an ID but no initial data entity
    // was provided, the specified record
    // is fetched from the API.
    if (this.id && !this.data) this.find();
  },
  methods: {
    create(data) {
      return this.query('post', this.endpoint, data);
    },
    destroy() {
      return this.query('delete', `${this.endpoint}/${this.id}`);
    },
    find() {
      return this.query('get', `${this.endpoint}/${this.id}`);
    },
    update(data) {
      return this.query('patch', `${this.endpoint}/${this.id}`, data);
    },
  },
  render() {
    return this.$scopedSlots.default({
      create: this.create,
      data: this.data,
      destroy: this.destroy,
      loading: this.loading,
      update: this.update,
    });
  },
};
```

#### Create

Let's take a look how to use the `DataModel` component to create a new record.

```html
<data-model endpoint="posts">
  <div slot-scope="{ data: post, loading, create }">
    <span v-if="loading">Loading...</span>
    <template v-if="post">
      <h3>{{ post.title }}</h3>
      <p>{{ post.body }}</p>
    </template>

    <form @submit.prevent="create(newPost);">
      <label>
        Title: <input v-model="newPost.title">
      </label>
      <label>
        Body: <input v-model="newPost.body">
      </label>
      <button :disabled="loading">
        <template v-if="loading">Loading...</template>
        <template v-else>Create</template>
      </button>
    </form>
  </div>
</data-model>
```

In the example code snippet above, you can see, that we're not passing an `entity` or `id` property to the `<data-model>` component. Therefore, initially, no API call is made and no resource is loaded. But we can create a new `post` resource, by calling the `create` method provided by the `DataModel` via the `slot-scope`. As soon as the API call was successful, the `DataModel` instance is linked to the newly created `post` resource returned by the API and we render the `post.title` and the `post.body` above the form.

#### Update

The markup for updating a resource, looks almost identical to the markup for creating a new resource you've seen above, but this time we provide an ID property to the `DataModel`.

```html
<data-model endpoint="posts" :id="1">
  <div slot-scope="{ data: post, loading, update }">
    <span v-if="loading">Loading...</span>
    <template v-if="post">
      <h3>{{ post.title }}</h3>
      <p>{{ post.body }}</p>
    </template>

    <form @submit.prevent="update(post);">
      <label>
        Title: <input v-model="post.title">
      </label>
      <label>
        Body: <input v-model="post.body">
      </label>
      <button :disabled="loading">
        <template v-if="loading">Loading...</template>
        <template v-else>Update</template>
      </button>
    </form>
  </div>
</data-model>
```

#### Delete

Basically, the `destroy` method, does almost the same as the `create` and `update` methods but after successfully deleting a resource, we don't have any data anymore to render, instead we can listen to the `success` event of the `DataModel` instance to react in some way to successful deletion of the resource.

```html
<data-model endpoint="posts" :id="1" @success="deleted = true">
  <div slot-scope="{ delete }">
    <p v-if="deleted">
      The post was successfully deleted.
    </p>
    <button :disabled="loading">
      <template v-if="loading">Loading...</template>
      <template v-else>Delete</template>
    </button>
  </div>
</data-model>
```

## Combining DataList and DataModel

Now let's imagine the following scenario: you want to render a list of posts and additionally you want to render a `Delete` button for every post. We can combine the `DataList` and `DataModel` components to deal with this requirements.

```html
<data-list endpoint="posts">
  <div slot-scope="{ data: posts, error, load, loading }">
    <span v-if="loading">Loading...</span>
    <span v-else-if="error">Error while fetching data!</span>
    <ul v-else>
      <li v-for="post in posts" :key="post.id">
        <data-model
          :entity="post"
          :id="post.id"
          endpoint="posts"
          @success="load"
        >
          <div slot-scope="{ destroy, loading }">
            <h3>{{ post.title }}</h3>
            <p>{{ post.body }}</p>
            <button
              :disabled="loading"
              @click="destroy"
            >
              <template v-if="loading">Loading...</template>
              <template v-else>Delete</template>
            </button>
          </div>
        </data-model>
      </li>
    </ul>
  </div>
</data-list>
```

In the example above, you can see that we can nest `DataList` and `DataModel` components. By passing a `post` object as an entity to the `DataModel` component, no API call is made initially, but we're able to run CRUD operations on the model. A post can be deleted by clicking on the `Delete` button, the `@success` event handler on the `<data-model>` is triggered after a successful request, so if the post was deleted successfully, we trigger the `load()` method provided by the `DataList` component, which triggers a reload of the data provided by the `DataList` (which now shouldn't contain the deleted post anymore).

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

The power of `slot-scope` makes it possible to build generic wrapper components to provide all kinds of data or functionality to the wrapped component. Handling CRUD operations is only one of the plentiful possibilities. But I think it is one of the most useful ways of how to utilize renderless components.

The examples provided in this article only scratch the surface of what is possible to achieve with the `DataList` and `DataModel` components. If you're interested in seeing additional examples, you can check out [the GitHub repository](https://github.com/maoberlehner/building-renderless-components-to-handle-crud-operations-in-vue) or take a look at [the demo page hosted on Netlify](https://building-renderless-components-to-handle-crud-operations-in-vue.netlify.com/).
