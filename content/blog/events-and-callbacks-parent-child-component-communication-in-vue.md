+++
date = "2021-01-10T10:25:25+02:00"
title = "Events and Callbacks: Parent/Child Component Communication in Vue"
description = "Learn why callbacks are considered an anti-pattern in Vue and when to use callbacks instead of events in Vue.js."
intro = "Props Down / Events Up is the standard paradigm for communication between parent and child components in Vue.js. React, on the other hand, uses callback functions instead of events. But why is using callbacks considered an anti-pattern in the Vue.js world? And what are the conceptual differences..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:EFEFEF,f_auto,q_auto,w_1014,h_510/v1542158522/blog/2021-01-10/events-and-callbacks"]
+++

Props Down / Events Up is the standard paradigm for communication between parent and child components in Vue.js. React, on the other hand, uses callback functions instead of events. But why is using callbacks considered an anti-pattern in the Vue.js world? And what are the conceptual differences?

Apart from answers to those questions, we will explore how to solve events' two most significant problems: that **we can't force parent components to handle them and that they can silently break.**

- [Why Are Callbacks Considered an Anti-pattern in Vue?](#why-are-callbacks-considered-an-anti-pattern-in-vue)
- [Strengths and Weaknesses of Events](#strengths-and-weaknesses-of-events)
- [When to Use Callbacks Instead of Events?](#when-to-use-callbacks-instead-of-events)
- [Less Fragile Parent/Child Communication with Callbacks](#less-fragile-parent-child-communication-with-callbacks)

## Why Are Callbacks Considered an Anti-pattern in Vue?

I read a couple of blog posts and searched Stackoverflow and the Vue.js forum to find out why, in Vue.js, we should use events exclusively for communication between components. The answers ranged from "because callbacks are considered an anti-pattern" without any reason why or rather vague answers like "using events is a convention in the Vue.js ecosystem".

In one blog post, I read that callbacks are an anti-pattern because they are a form of tight coupling, which, in my opinion, is wrong. On the contrary, Parameter or Property Injection is a classic Dependency Injection pattern. Although events are possibly the loosest form of coupling, this is not always an advantage.

The best argument I could find why we should consider not to use callbacks in our Vue.js applications is because it is uncommon to do so; not the best reason for not doing something but also not the worst.

## Strengths and Weaknesses of Events

The greatest strength of events is also their greatest weakness: they are the loosest way of coupling components. Very loose coupling is ideal in scenarios where handling a particular event is strictly optional. Think of the `blur` event of an `<input>` element, for example. Or `click` events emitted by virtually all HTML elements. We can add event listeners for those events or not. But it is not so great in situations where we **must** handle a particular user interaction happening in a child component. In these situations, we wished we could mark event listeners as required.

**Pro:**

- Very loose coupling: when a parent component decides not to handle an individual event, so be it.

**Contra:**

- Very loose coupling: handling an event can't be enforced (required events are not possible).
- Changing the name of an emitted event can silently break the functionality of a parent component.

The worst part about events, and what primarily triggered me to write this article, is that communication via events is fragile when things get more complicated than a button. Imagine changing the name of an event emitted by a component in hundreds of places throughout our application. Search & Replace only works reliably for unique event names, which is not the norm. If we miss some instance when renaming the events, **there is no build time warning;** in many situations, **it even fails silently at runtime.** In cases where the event is not triggering an observable UI change but rather some background action like Google Analytics tracking, **we might never notice the error** but only wonder why conversions go down in our Analytics tool.

## When to Use Callbacks Instead of Events?

Before we can answer this question, we need to understand the subtle differences between events and callbacks. The relationship of a child component communicating with its parent component via events is like:

> To whom it may concern: somebody clicked me if you want to do something with that information, that’s awesome; if not, I’m okay with it too, no pressure!

– Child Component, via Event

Let's break it down:

`To whom it may concern` that's the loose coupling part of it. In a loosely coupled system, the child component has no idea who the receiver (parent component) is.

`somebody clicked me` the child component announces what happened to itself, **not what the parent component should do with the information.**

`if you want to do something with that information, that’s awesome; if not, I’m okay with it too, no pressure!` the rest is about the fact that the child component has no control over what the parent component should do with that information or if even somebody is listening at all.

```html
<!-- src/components/Counter.vue -->
<template>
  <div>
    <button @click="count += 1, $emit('add-one')">
      +1
    </button>
    {{ count }}
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    let count = ref(0);
    return { count };
  };
};
</script>
```

Above, we can see a simple counter component. Most importantly, we add `1` to the `count`, and we also emit an `add-one` event. A parent component can do with the emitted event whatever it likes; it is not relevant for the `Counter` component to work.

Now that we know how components using events as their communication channel *sound*, let's listen to two components communicating via callbacks:

> Hi parent, whoever you might be! People are going to click on me; please tell me what to do when that happens!

– Child Component, via Callback

In this example, the conversation starts much earlier. The child component introduces itself, even before something has happened, by letting the parent component know about its required properties (e.g., `EXAMPLE`) that it needs to handle a concrete situation. Note the bangs: now there is no optionality anymore; the child component knows that if its button is clicked, the parent component has to do something about it. The child component also knows *what* should happen but not *how* it should happen; that's still up to the parent.

```html
<!-- src/components/ShoppingCartList.vue -->
<template>
  <ul>
    <li
      v-for="item in items"
      :key="item.id"
    >
      {{ item.name }}
      <button @click="removeFromCart(item)">
        Remove from cart
      </button>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    items: {
      required: true,
      type: Array,
    },
    removeFromCart: {
      required: true,
      type: Function,
    },
  },
};
</script>
```

In this example, the `ShoppingCartList` component is a child component of a `ShoppingCart` parent component. The `ShoppingCart` component is responsible for managing the state and syncing it via an API. The `ShoppingCartList` component from above is only responsible for rendering a list of items and a corresponding `<button>` for removing an item from the shopping cart. In this case, the parent component **must** do something whenever a user clicks the button; if it doesn't, the feature does not work as expected. By marking the `removeFromCart` prop as required, we can prevent programmers from forgetting to handle the button click.

I argue that events and callbacks solve different problems. In my opinion, it is not about if we should only use events or callbacks to build our Vue applications; instead, it is about in which situation which approach is more appropriate.

**In short:**

- Events are perfect in situations where handling them is optional.
- Callbacks have the edge when we want to enforce that a parent component handles something.

When you name your events, imagine that your component is merely informing parent components that something has happened. See the [list of all native events on MDN](https://developer.mozilla.org/en-US/docs/Web/Events) for inspiration.

> [EVENT_NAME] has happened.
> Click has happened.
> Remove (action) has happened.

Callbacks on the other hand should always be in imperative form. Ideally, they form a (somewhat) complete sentence with a bang at the end. They tell the parent component what to do.

> Remove from cart!

**Summary:**

- Use events when handling something is optional.
- Use events when something can be handled in various ways.
- Use callbacks when something must be dealt with.
- Use callbacks when it is clear what must be done.

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

## Less Fragile Parent/Child Communication with Callbacks

Events are fragile. If you change the name of an event but forget to rename it in every component where you are listening to it, your application breaks but no errors are triggered. If you change the parameter signature (data emitted by an event) and you don't update all the event handlers accordingly, your application breaks at runtime.

Ideally, we want our code to break at build time when we make an error like this, so we don't deploy a broken application. I found no feasible way of how to reach this goal using events. There are ways to tackle this with conventions but no way to enforce it.

- We have to use magic strings for event names.
- We can't mark events as `required`, so we can't force a parent component to handle a particular event.
- We can't force parent components to adhere to a specific parameter signature.

With callbacks (and TypeScript) we can solve all of those problems.

```html
<!-- src/components/ShoppingCartList.vue -->
<template>
  <!-- ... -->
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import { LineItem } from '../services/shopping-cart';

export interface RemoveFromCartFunction {
  (lineItem: LineItem): any;
}

export default defineComponent({
  props: {
    // ...
    removeFromCart: {
      required: true,
      type: Function as PropType<RemoveFromCartFunction>,
    },
  },
});
</script>
```

As we can see above, with callbacks via props, we have 1) no magic strings, 2) required props to force consumer components to provide a callback, and 3) prop types to enforce a specific function signature. Suppose we decide to change the function signature of the `removeFromCart` callback to receive the `LineItem.id` as its parameter. In that case, our build will break if we don't update all consumer components accordingly.

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like What You Read?</h2>
      <p class="c-twitter-teaser__body">
        Follow me to get my latest articles.
      </p>
      <a class="c-button c-button--outline c-twitter-teaser__button" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">
        Find me on Twitter
      </a>
    </div>
  </div>
</div>

## Wrapping It Up

Although it is not a very convincing reason, the convention to stick to events for communication between child components and their parent component is reason enough not to use callbacks if you have the feeling that this might be confusing to the developers in your team. But, as we've seen in this article, nothing is stopping us from using callbacks alongside events as a means of less fragile and more direct communication between components.

## References

- [How to Pass a Function as a Prop in Vue, Michael Thiessen](https://michaelnthiessen.com/pass-function-as-prop/)
- [Passing functions as props an anti-pattern in Vue.js, Bryan Lee](https://medium.com/js-dojo/passing-functions-as-props-an-anti-pattern-in-vue-js-b542fc0cf5d)
- [Events are a Vue convention, Stackoverflow](https://stackoverflow.com/a/59826829)
- [Events vs callback props, Vue.js Forum](https://forum.vuejs.org/t/events-vs-callback-props/11451)
