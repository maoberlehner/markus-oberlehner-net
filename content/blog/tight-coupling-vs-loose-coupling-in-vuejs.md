+++
date = "2020-08-02T08:20:20+02:00"
title = "Tight Coupling vs. Loose Coupling in Vue.js"
description = "Learn how to differentiate between situations where you should use loose coupling or tight coupling in your Vue.js applications."
intro = "When talking about loose coupling and tight coupling, often, the impression arises that tight coupling is something we always have to avoid. But this is almost impossible. What's essential is that we use loose coupling when bridging the gap between layers of our application..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:23F5BF,f_auto,q_auto,w_1014,h_510/v1542158521/blog/2020-08-02/tight-coupling-vs-loose-coupling"]
+++

When talking about loose coupling and tight coupling, often, the impression arises that tight coupling is something we always have to avoid. But this is almost impossible. What's essential is that **we use loose coupling when bridging the gap between layers of our application.** Within a layer, though, it is often no problem if there is tight coupling. In this article, we will look at when tight coupling is unproblematic, and when it is better to use loose coupling.

## When tight coupling is ok

Tight coupling is ok when we want to do **specific things generically,** there is **no variability depending on the use case,** and **we do not cross layers of our application.** Let's take a look at an example: we want to render a list of blog articles or comments. It's always the same table view with a sort functionality. The sort function always does sort the entries alphabetically; it does not care if the entries are blog articles or comments. So in this example, our list component must be loosely coupled to its content (blog articles, comments,...), but there is no problem with tightly coupling the sorting function (or component).

```html
<template>
  <div class="ListContent">
    <table>
      <thead>
        <th @click="sort">Label</th>
        <!-- ... -->
      </thead>
      <!-- Tabular representation of entries -->
    </table>
  </div>
</template>

<script>
// Importing `sortAlphabetically()` here means that this
// component is **tightly coupled** to exactly this 
// implementation. But that's ok!
import { sortAlphabetically } from '../utils/sort-alphabetically';

export default {
  name: 'ListContent',
  props: {
    // "Injecting" the `entries` as a prop is a simple yet
    // effective form of **loose coupling**. The component
    // does not care if the entries are blog articles or
    // comments.
    entries: {
      default: () => [],
      type: Array,
    },
  },
  // ...
  methods: {
    // Pseudo code!
    sort() {
      this.sortedEntries = sortAlphabetically(this.entries);
    },
  },
  // ...
};
</script>
```

`sortAlphabetically()` does one specific thing, and it does not care about which data it gets passed (as long as the entries adhere to an underlying interface). Also, there is no crossing of layers; `sortAlphabetically()` does not access an API or a database, for example, and it also is not concerned with any business logic.

But what about testing? Contrary to popular belief, **loose coupling can make testing more difficult in some cases.** Let's imagine that we've used loose coupling to inject `sortAlphabetically()` into our application. For example, by using a Vue.js plugin, which makes this helper function globally available as `this.$sortAlphabetically()`.

```js
mount(ListContent, {
  // ...
  mocks: {
    $sortAlphabetically: entries => entries,
  },
  // ...
})
```

As we can see above, if we want to test our component, we now have to manually mock `$sortAlphabetically()`. Of course, we could write a helper method for mounting components with all the plugins we also have in the production app. But this makes our test code more complicated, slower, and harder to maintain. And this for virtually no benefit other than to not have to import `sortAlphabetically()` in our component.

But sometimes, as we will see in the next chapter, the benefits of loose coupling are much more significant, so it's worth to accept the hassle of having to use mocking in our tests. Or we have to mock the dependency anyway (to avoid sending requests to a real API, for example).

## When loose coupling is preferred

Let's take a look at the following example where we change the way our `ListContent` gets its contents a little bit.

```html
<template>
  <div class="ListContent">
    <table>
      <thead>
        <th @click="sort">Label</th>
        <!-- ... -->
      </thead>
      <!-- Tabular representation of entries -->
    </table>
  </div>
</template>

<script>
import { sortAlphabetically } from '../utils/sort-alphabetically';

export default {
  name: 'ListContent',
  props: {
    // Here we "inject" a generic service object; this can be a blog article
    // service, a comment service,... you name it.
    service: {
      required: true,
      type: Object,
    },
  },
  data() {
    return { entries: [] },
  },
  created() {
    this.loadEntries();
  },
  methods: {
    async loadEntries() {
      this.entries = await this.service.list();
    },
    // ...
  },
  // ...
};
</script>
```

Instead of passing in the entries via a property, delegating the responsibility for fetching them from an API to the parent component, **we pass in a `service` object so that this component can fetch the data itself.** In this architecture, **services adhere to the same interface,** so in our `ListContent` component, we can rely on calling the `list()` method on our `service` object to get an array of entries. The service itself can either be an implementation to load blog articles or comments or anything else.

We loosely couple the `ListContent` component to the `service` by passing it via a prop. The critical difference between the `service` and `sortAlphabetically()` is that 1) **we can pass in different services to get different results,** and 2) **services cross layers of our application** because they typically access an API and they often contain business logic.

When it comes to testing, we must mock our `service` implementation anyway because we don't want to make network requests in our unit tests. Additionally, because we pass in the `service` as a property, testing becomes a little bit easier as if we would import (tightly couple) a specific `service` implementation.

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

## Different forms of (loose) coupling in Vue.js

If you want to learn more about different ways of how to use loose coupling in Vue.js, you can [read one of my earlier articles](/blog/dependency-injection-in-vue-applications/) about this very topic.

- [Importing modules](/blog/dependency-injection-in-vue-applications/#importing-modules) (tight coupling)
- [Decoupled component composition](/blog/dependency-injection-in-vue-applications/#decoupled-component-composition)
- [Plugins](/blog/dependency-injection-in-vue-applications/#plugins)
- [Provide / inject](/blog/dependency-injection-in-vue-applications/#provide-inject)
- [Functional component factories](/blog/dependency-injection-in-vue-applications/#functional-component-factories)

## Wrapping it up

As we've seen, sometimes some tight coupling in the right place can improve your application because it makes it easier to test individual parts. As with so many things, there is no simple answer to whether tight coupling is right or wrong. It depends on the use case.
