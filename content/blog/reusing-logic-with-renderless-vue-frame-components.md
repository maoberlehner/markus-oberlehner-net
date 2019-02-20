+++
date = "2019-02-10T06:18:18+02:00"
title = "Reusing Logic With Renderless Vue.js Frame Components"
description = "Learn how to build highly reusable renderless components for declarative data fetching and building form components."
intro = "Reusing logic and keeping your codebase DRY should be one of your top priorities. In a Vue.js application components are the most important means of code reuse. But usually we think of components as a combination of markup, logic and CSS. At first, it might not be very intuitive to use components to provide only logic and not render anything at all..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Front-End Architecture"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1200,h_675/v1532158513/blog/2019-02-10/renderless-frame-components-twitter"]
+++

> **Note:** This is the second part of my “Advanced Vue.js Application Architecture” series on how to structure and test large scale Vue.js applications. Stay tuned, there's more to come! [Follow me on Twitter](https://twitter.com/MaOberlehner) if you don't want to miss the next article.  
> [< Previous](/blog/multi-export-vue-single-file-ui-components/) [Next >](/blog/advanced-vue-component-composition-with-container-components/)

**Reusing logic and keeping your codebase DRY** should be one of your top priorities. In a Vue.js application components are the most important means of code reuse. But usually we think of components as a combination of markup, logic and CSS. At first, it might not be very intuitive to use components to provide only logic and not render anything at all.

Components which do not render their own markup are called renderless components. I’ve already written a couple of articles about [how to use renderless components to handle CRUD operations](/blog/building-renderless-components-to-handle-crud-operations-in-vue/) and [how to build a renderless reCAPTCHA component](/blog/building-a-renderless-recaptcha-v3-form-component-with-vue/) for example. **Since the term “renderless” is more of a name for the overall pattern, I choose to call this type of component “Frame Components” in my codebase.** They form a frame around other components and offer a range of useful functions or data to everything they encompass.

Today we’ll build a couple of Frame Components to lay the foundation for building a fully functional demo application that we’ll build step by step over the next articles in this series on Advanced Vue.js Application Architecture.

## Consuming promises in a declarative way

The first component we build is pretty similar to the wonderful [vue-promised](https://github.com/posva/vue-promised) package. You might as well use this component if you like but if you want to roll your own read on.

```js
export default {
  props: {
    promise: {
      default: null,
      type: Promise,
    },
  },
  data() {
    return {
      data: null,
      error: null,
      pending: false,
      resolved: null,
    };
  },
  watch: {
    promise: {
      immediate: true,
      async handler() {
        if (!this.promise) return;

        try {
          this.status({ pending: true });
          const { data } = await this.promise;
          this.status({ data, resolved: true });
        } catch (error) {
          this.status({
            data: null,
            error,
            resolved: false,
          });
        }
      },
    },
  },
  methods: {
    status({
      data = this.data,
      error = null,
      pending = false,
      resolved = null,
    }) {
      this.data = data;
      this.error = error;
      this.pending = pending;
      this.resolved = resolved;
    },
  },
  render() {
    return this.$scopedSlots.default({
      data: this.data,
      status: {
        error: this.error,
        pending: this.pending,
        resolved: this.resolved,
      },
    });
  },
};
```

Above you can see that our `FramePromise` component takes a `promise` property and sets a corresponding status during every phase of resolving the Promise. First a `pending` state is set. If everything works out we assign the resolved data to `this.data` and set a `resolved` state. Otherwise, if an error occurs, an error state is set.

In the render function you can see that we render the default scoped slot and provide the `data` and all three states via properties.

```html
<template>
  <FramePromise
    v-slot="{ data: articles, status: { error, pending } }"
    :promise="articleListPromise"
  >
    <div class="MyArticleListComponent">
      <div v-if="pending">
        Loading ...
      </div>
      <div v-else-if="error">
        Error! Please try again.
      </div>
      <article
        v-else
        v-for="article in articles"
        :key="article.id"
      >
        <h2>{{ article.title }}</h2>
        <p>{{ article.body }}</p>
      </article>
    </div>
  </FramePromise>
</template>
```

The `FramePromise` component takes a Promise and provides the data returned by the given Promise. Thanks to the `error` and `pending` properties, we're able to render a loading or an error state while the Promise is resolved or rejected.

## Declarative data fetching

In one of my previous articles, I’ve already taken the concept of using rendereless Frame Components for data fetching to the extreme by [building a CRUD Frame Component for declarative data fetching](/blog/building-renderless-components-to-handle-crud-operations-in-vue/). For this article we keep things simple and improve the design a bit to make it more generic and easier to reuse.

```js
export default {
  props: {
    endpoint: {
      required: true,
      type: Function,
    },
    immediate: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      response: undefined,
    };
  },
  created() {
    if (this.immediate) this.query();
  },
  methods: {
    query(...params) {
      this.response = this.endpoint(...params);
    },
  },
  render() {
    return this.$scopedSlots.default({
      query: this.query,
      response: this.response,
    });
  },
};
```

The `FrameApi` component you can see above, takes an API endpoint as a property and wraps it in its own generic query method. The Promise returned by the API function is stored in `this.response`. In the render method you can see that we provide the `query()` method and the `response` to the components default scoped slot.

```html
<template>
  <FrameApi
    v-slot="{ response }"
    :endpoint="listArticles"
    immediate
  >
    <FramePromise
      v-slot="{ data: articles, status: { error, pending } }"
      :promise="response"
    >
      <div class="MyArticleListComponent">
        <div v-if="pending">
          Loading ...
        </div>
        <div v-else-if="error">
          Error! Please try again.
        </div>
        <article
          v-else
          v-for="article in articles"
          :key="article.id"
        >
          <h2>{{ article.title }}</h2>
          <p>{{ article.body }}</p>
        </article>
      </div>
    </FramePromise>
  </FrameApi>
</template>
```

In this example you can see how we can combine the two Frame Components to build a component which is able to fetch data and show a loading or error state in a fully declarative and very Vue-ish way.

For now this might look a little confusing and unnecessary complex but let’s take a look at how we can combine the two frame components into a single one to make it easier for us to use in our applications.

## Combining Frame Components 

Because those two components are most likely always used in conjunction we could build a third Frame Component consisting of `FrameApi` and `FramePromise`. But because in my experience the `FrameApi` is never used without `FramePromise`, we can refactor the `FrameApi` component to integrate `FramePromise`.

```diff
+ import FramePromise from './FramePromise';
  
  export default {
    props: {
      endpoint: {
        required: true,
        type: Function,
      },
      immediate: {
        default: false,
        type: Boolean,
      },
    },
    data() {
      return {
        response: undefined,
      };
    },
    created() {
      if (this.immediate) this.query();
    },
    methods: {
      query(...params) {
        this.response = this.endpoint(...params);
      },
    },
-   render() {
-     return this.$scopedSlots.default({
-       query: this.query,
-       response: this.response,
+   render(h) {
+     return h(FramePromise, {
+       props: { promise: this.response },
+       scopedSlots: {
+         default: props => {
+           return this.$scopedSlots.default({
+             data: props.data,
+             methods: {
+               query: this.query,
+             },
+             status: {
+               error: props.status.error,
+               loading: props.status.pending,
+               success: props.status.resolved,
+             },
+           });
+         },
+       },
      });
    },
  };
```

In the `render()` function of the `FrameApi` component, we now render the `FramePromise` component and we pass all of the relevant properties to the default scoped slot. Additionally we rename the `pending` and the `resolved` state to  match the language used when fetching data from an API.

You might wonder why we even have a stand-alone `FramePromise` component in the first place? Because other than the `FrameApi` component the `FramePromise` component can be very useful on its own and we might reuse it in various other components.

```html
<template>
  <FrameApi
    v-slot="{ data: articles, status: { error, loading } }"
    :endpoint="listArticles"
    immediate
  >
    <div class="MyArticleListComponent">
      <div v-if="loading">
        Loading ...
      </div>
      <div v-else-if="error">
        Error! Please try again.
      </div>
      <article
        v-else
        v-for="article in articles"
        :key="article.id"
      >
        <h2>{{ article.title }}</h2>
        <p>{{ article.body }}</p>
      </article>
    </div>
  </FrameApi>
</template>
```

As you can see above, the new version of the `FrameApi` component is much easier to use and also uses a more natural language for providing status informations. Because the term `pending` that we used for the `FramePromise` component is very strongly associated with Promises and not so much with API requests.

<div class="c-content__broad">
  <iframe src="https://codesandbox.io/embed/8yvl6n6652?module=%2Fsrc%2FApp.vue&view=editor" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

## Submitting form data

Let’s say we want to build a contact form next. Again, we can reuse the `FrameApi` component to build a form component for a simple contact form. But because we want to make it possible to redirect our users to a new page after submitting the form, we first have to add a new line of code.

```diff
    methods: {
-     query(...params) {
+     async query(...params) {
-       this.response = this.endpoint(...params);
+       this.response = await this.endpoint(...params);
+       this.$emit('success');
      },
    },
    render() {
```

Above you can see that we now emit a `success` event after successfully querying the API endpoint. You might want to consider to emit events for all possible status changes directly in the `FramePromise` component, but for now we keep it simple and only emit a `success` event from the `FrameApi` component.

```html
<template>
  <FrameApi
    v-slot="{ methods: { query: submit }, status: { error, loading } }"
    :endpoint="contactPost"
    @success="$router.push({ name: 'thank-you' })"
  >
    <form
      class="MyContactForm"
      @submit.prevent="submit(formData)"
	  >
      <div v-if="loading">
        Sending ...
      </div>
      <div v-else-if="error">
        Error! Please try again.
      </div>

      <input v-model="formData.name">
      <textarea v-model="formData.text"/>

      <button :disabled="loading">
        Submit
      </button>
    </div>
  </FrameApi>
</template>

<script>
import * as contactService from '../services/contact';

export default {
  // ...
  data() {
    return {
      formData: {
        name: '',
        text: '',
      },
    };
  },
  created() {
    this.contactPost = contactService.post;
  },
  // ...
};
</script>
```

In the example implementation above you can see how we can use the `FrameApi` component to build a contact form and how we can utilize the newly added `success` event to trigger a redirect after successfully submitting the form.

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

The renderless component pattern makes it very easy to build reusable chunks of logic which, because they are regular components, feel very Vue-ish. If you don’t already use Frame Components in your codebase, I very much recommend you to search for opportunities to refactor your code using this pattern.

This was part two of my series about Advanced Vue.js Application Architecture. In the next article we'll take a closer look at how we can combine the [UI Componets we’ve built in the first article](/blog/multi-export-vue-single-file-ui-components/) with the Frame Components of this article to build an application featuring a product listing and an article listing. Furthermore, we'll explore how to structure our application and how the testability of our application is affected by the way we compose our components.

## References

- [Adam Wathan, Renderless Components in Vue.js](https://adamwathan.me/renderless-components-in-vuejs/)
