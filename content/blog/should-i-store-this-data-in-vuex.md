+++
date = "2018-05-27T10:33:33+02:00"
title = "Should I Store This Data in Vuex – When Should I use Vuex?"
description = "Learn how to decide which data should be stored in a centralized Vuex store and alternative solutions to share data across Vue.js components."
intro = "When first starting with Vuex, most people wonder what data should be stored in Vuex in the first place? In the journey of answering this question, for many people (including me) comes what I call the “Let's Store Everything in Vuex” phase. But very quickly, after having encountered the first obstacles, comes the realization that this cannot be the be-all and end-all solution to managing state in Vue.js applications..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Vuex"]
+++

When first starting with Vuex, most people wonder what data should be stored in Vuex in the first place? In the journey of answering this question, for many people (including me) comes what I call the “Let's Store Everything in Vuex” phase. But very quickly, after having encountered the first obstacles, comes the realization that this cannot be the be-all and end-all solution to managing state in Vue.js applications.

In this article, I'll try to answer the question in which situations Vuex is a good solution to the problem at hand and when it may be better to use a different approach.

## Table of Contents

- [When use Vuex?](#when-use-vuex)
- [Reasons for storing data in Vuex](#reasons-for-storing-data-in-vuex)
- [Reasons not to store data in Vuex](#reasons-not-to-store-data-in-vuex)
- [Alternatives to storing data in Vuex](#alternatives-to-storing-data-in-vuex)
- [Decision flow chart](#decision-flow-chart)

## When use Vuex?

Out of the box, Vue.js provides us with a very powerful way to handle state with the reactive `data` property and the possibility to pass down properties to child components.

```js
export default {
  name: 'MyComponent',
  data() {
    return {
      someValue: 'Hello World',
    };
  },
}
```

```html
<template>
  <div class="MyComponent">
    <some-component :some-value="someValue"></some-component>
  </div>
</template>
```

If you're working on a rather simple application or if all you do is to replace some parts of your (server rendered) application with some Vue.js magic, you might actually be fine not using Vuex at all.

On the other hand, if you're working on a large scale single-page app, you may encounter situations where you need the same data at two completely different places in your application. This is the point at which a centralized state management tool like Vuex oftentimes makes a lot of sense.

## Reasons for storing data in Vuex

So what are some of the reasons for storing data in a centralized Vuex store?

### The data must be accessible by multiple (independent) components

The number one use case for storing data in a centralized store like Vuex, is, because the data must be accessible in multiple places of your application, by components which oftentimes are not related in any way (they neither are parents or children of each other). An example of this would be certain user settings to configure how your application looks or what date format should be used, to name a concrete example.

### Centralized API / data fetching logic

Let's take a very sophisticated To-Do app as an example: you might fetch a list of all To-Do items from an API but additionally to displaying all of the items chronologically there are also pages for displaying only certain categories of items. By using Vuex you can fetch all of the To-Do items once and store them in the Vuex store, you can then access the data from every component of your application, even if they are distributed across different routes. The alternative would be to fetch only certain To-Do items every time the user navigates to a specific category route. Depending on the nature of your application, this could also make sense.

### Persisting application state on the client

Thanks to Vue.js plugins like [vuex-persistedstate](https://github.com/robinvdvleuten/vuex-persistedstate) it becomes very easy to persist state, managed with Vuex, in the browser. This makes it easier to handle advanced use cases like applications that still work even if the user is offline.

## Reasons not to store data in Vuex

If you've decided to use Vuex for managing the state of your application, now every time you add a new component, you have to make a judgment about wether to store its state in Vuex or not. If you're new to Vuex, it might be tempting to use Vuex for everything, because it's already there, so why not use it?

### Complexity

Although Vuex is much simpler than some of its competitors, it is still more complicated to use than using local component state directly. You have to decide if the additional complexity is justified by the benefits a centralized state adds to your solution.

### Overhead

The use of Vuex in a component always means a certain architectural overhead. Because of that, I recommend you to use local component state as your default and only opt-in to Vuex as soon as a reason to do so arises.

## Alternatives to storing data in Vuex

So there are some downsides of using Vuex, but what are the alternatives in situations where we decide Vuex is not the optimal solution?

### Passing down props

Often times the simplest solution is also the best solution. If it is possible to solve your problem by passing down data from a parent component to a child component via props, you absolutely should go for it.

### Provide / inject

One lesser known feature of Vue.js is [provide / inject](https://vuejs.org/v2/api/#provide-inject). It can be used in situations where you need to pass data from a parent component to one or multiple child components which might not be direct descendants of the parent. A typical example would be an accordion component which consists of a main `AppAccordion` component, a child component `AppAccordionItem` for every accordion item and maybe a separate  `AppAccordionBody` component for the body of the accordion item. Provide / inject makes it possible to pass data from the main component to the component which renders the body of an accordion item. In situations where parent components and child components are directly interdependent (an `AppAccordionBody` component would never be used without having an `AppAccordion` component as an ancestor) this pattern can be pretty powerful and simpler than using Vuex.

### Context Provider Pattern

With Vue 3, Provide / Inject has gotten a big upgrade. With that, it is now possible to [create Context Providers](https://markus.oberlehner.net/blog/context-and-provider-pattern-with-the-vue-3-composition-api/), which enable us to share state between multiple components very similar to Vuex but without its overhead.

### Fetching data from an API / Apollo

Let's revisit one of the pro Vuex examples: the To-Do app with multiple categories. Instead of fetching all the (undone) To-Do items of a user at once, it might be a better approach to only fetch the first 20 or so items to render them on the entry page. If the user navigates to a certain category page we can trigger a new request to the API fetching the first 20 items which match the given category and if the user opens the next category we trigger the next API request and so on and so forth. If the user navigates to a category they've already opened before, we can either make a new API request and freshly fetch the data again or we can implement some kind of caching (Apollo provides caching out of the box).

### Portals

At first glance, the [PortalVue](https://github.com/LinusBorg/portal-vue) plugin doesn't seem to be related with state management in any way. But there are situations in which a portal can be used to have direct access to the state of a component instead of manipulating its state via a centralized store. A poster child example would be a modal dialog you want to display to make sure a user hasn't clicked a delete button by accident.

```html
<template>
  <button class="AppDeleteButton" @click="modal = true">
    Delete
    <portal to="modals" v-if="modal">
      <app-modal>
        Are you sure you want to do this? 
        <button @click="delete(item.id)">Yes</button>
        <button>No</button>
      </app-modal>
    </portal>
  </button>
</template>
```

In the simplified pseudo example above, you can see a `AppDeleteButton` component which contains the modal, which should be opened when it's clicked. This makes it possible to directly use the `id` from the `item` property of the `AppDeleteButton` inside of the modal component instead of making it globally accessible via a centralized store.

I've also written an [article about how to implement a modal component using Vuex](/blog/building-a-modal-dialog-with-vue-and-vuex/) if you're interested in the opposite approach.

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

### GraphQL & Apollo

If you already use GraphQL & Apollo in your application, you might decide to also use it for managing your state. [Natalia Tepluhina](https://twitter.com/N_Tepluhina) has written [a great article about how you can utilize the local state feature of Apollo for state management](https://dev.to/n_tepluhina/apollo-state-management-in-vue-application-8k0).

## Decision flow chart

In order to make it easier to make a decision wether to store data in a centralized Vuex store or not, I made a flow chart to help with that.

<div class="c-content__figure">
  <a class="c-content__broad" href="/images/2018-05-27/should-i-store-this-data-in-vuex-flow-chart.png">
    <img data-srcset="/images/2018-05-27/should-i-store-this-data-in-vuex-flow-charts-small.png 2x" alt="Flow chart to answer the question: Should I Store This Data in Vuex?">
    <noscript>
      <img
        src="/images/2018-05-27/should-i-store-this-data-in-vuex-flow-charts-small.png"
        alt="Flow chart to answer the question: Should I Store This Data in Vuex?"
      >
    </noscript>
  </a>
  <p class="c-content__caption">
    <small>The “Should I Store This Data in Vuex?” flow chart</small>
  </p>
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

## Conclusion

Keep in mind that there is no one size fits all way of how to do things in software development. Everything is situational and although some of the techniques described in this article work great in certain situations, they might not be right for your specific use case.

Be open minded about new (and old) ways of doing things and don't be scared to try out something – if it turns out using some way of sharing state across your app wasn't the right thing to do, at least you've learned how not to do it and there is always the possibility to refactor your code.
