+++
date = "2020-10-11T07:59:59+02:00"
title = "Application State Management with Vue 3"
description = "Learn about the 4 Principles of State Managment in modern Vue 3 applications: Embrace the Local State, Lift State Up, Utilize the Context Provider Pattern, and Use the SWR Cache Pattern."
intro = "With the new Composition API and Vue 3, there is a lot of talk about whether or not we still need Vuex or if it is possible to replace Vuex completely by making reactive objects globally available. In this article, I argue that thanks to the Composition API's new tools, Vuex is rarely necessary anymore..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1542158517/blog/2020-10-11/application-state-management-with-vue-3"]
+++

With the new Composition API and Vue 3, there is a lot of talk about whether or not we still need Vuex or if it is possible to replace Vuex completely by making reactive objects globally available. In this article, I argue that thanks to the Composition API's new tools, Vuex is rarely necessary anymore. But we have to use the right tools for the job.

In his [phenomenal article about state management in React](https://kentcdodds.com/blog/application-state-management-with-react) applications, Kent C. Dodds writes:

> The "secret" behind my personal solution to the state management problem is to think of how your application's state maps to the application's tree structure.

I very much agree with this sentiment. In this article we take a closer look at my 4 Principles of State Managment in modern Vue 3 applications:

1. [Embrace the Local State](#embrace-the-local-state)
2. [Lift State Up](#lift-state-up)
3. [Utilize the Context Provider Pattern](#utilize-the-context-provider-pattern)
4. [Use the SWR Cache Pattern](#use-the-swr-cache-pattern)

Vue.js, right from the beginning, was also a state management library. With the new APIs of Vue 3, it has become an even more potent tool to manage not only local but also global state.

## Embrace the Local State

By default, every piece of state in our application should be local. If we put all of our state into Vuex, we make our applications unnecessary complicated. Vuex is made for the global application state. Components should manage their state themselves and pass pieces of their state to child components via props. Don't worry too much about prop drilling. Passing state down multiple levels might be tedious, but it doesn't hurt too much, and at the end of the day, it is still easier to comprehend than globally managed state.

```html
<!-- src/components/Counter.vue -->
<template>
  <button @click="increment">
    {{ count }}
  </button>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const increment = () => {
      count.value +=1;
    };
  
    return {
      count,
      increment,
    };
  },
};
</script>
```

Here we can see a straightforward example of how to manage local state with Vue 3. In this example, it is easy to see why managing the state of this component locally is simpler than doing it in a global Vuex store. In the following examples, we will see that even when things get more complicated, it is unnecessary to manage state globally.

One reason to delegate state management to a centralized store was to **share stateful logic between components.** With the Vue 3 Composition API, local state has got a significant upgrade. Now we have the tools necessary to share state management logic between components.

```js
// src/composables/counter.js
import { ref } from 'vue';

export function useCounter(initialValue) {
  const count = ref(initialValue);
  const increment = () => {
    count.value +=1;
  };

  return {
    count,
    increment,
  };
}
```

```html
<!-- src/components/CounterA.vue -->
<template>
  <button @click="increment">
    {{ count }}
  </button>
</template>

<script>
import { useCounter } from '../composables/counter';

export default {
  name: 'CounterA',
  setup() {
    return useCounter(0);
  },
};
</script>
```

```html
<!-- src/components/CounterB.vue -->
<template>
  <button @click="increment">
    {{ count }}
  </button>
</template>

<script>
import { useCounter } from '../composables/counter';

export default {
  name: 'CounterB',
  setup() {
    return useCounter(100);
  },
};
</script>
```

In this example, we can see how we utilize *composables* to reuse stateful logic across components. Here it is **not** about sharing state, but only about **sharing stateful logic!** Each component using `useCounter()` has its own `count` state.

## Lift State Up

We sometimes feel like we need to manage our application state globally because we need access to specific values of the state from within child components. We need to **share state between multiple components.** In such cases, what we often can do is to lift the state up. In Vue.js, we pass down state via props, and child components can trigger state changes by emitting events.

```html
<!-- src/components/Counter.vue -->
<template>
  <div>
    <CounterButton
      :count="count"
      @click="increment"
    />
    <CounterOutput :count="count"/>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const increment = () => {
      count.value +=1;
    };
  
    return {
      count,
      increment,
    };
  },
};
</script>
```

You might argue that this is a very simplified example, and in real-world situations, where components are nested multiple levels deep, this leads to a lot of prop drilling. But thanks to (named) slots and being smart about how we structure our components, we often can avoid passing props multiple levels deep.

```html
<!-- src/components/TheHeader.vue -->
<template>
  <div>
    <TheLogo/>
    <TheNav
      :is-dropdown-open="isDropdownOpen"
      @toggle-dropdown="$emit('toggle-dropdown')"
    />
  </div>
</template>
```

```html
<!-- src/components/App.vue -->
<template>
  <TheHeader
    :is-dropdown-open="isDropdownOpen"
    @toggle-dropdown="toggleDropdown"
  />
  <TheBody/>
  <TheFooter/>
</template>

<script>
import { ref } from 'vue';

export default {
  const isDropdownOpen = ref(false);
  const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value;
  };
  
  return {
    isDropdownOpen,
    toggleDropdown,
  };
};
</script>
```

Assume we need to know whether the dropdown menu is open or not in our `App` component. So we decide our `App` component should own this piece of state. Now in the two code snippets above, we can see how this can lead to prop drilling because we need to pass the state to the `TheHeader` and the `TheNav` components and emit events in the opposite direction. But we can optimize this very easily by utilizing slots.

```html
<!-- src/components/TheHeader.vue -->
<template>
  <div>
    <!--
      In this case we could also use a
      single default slot instead of
      two named slots.
    -->
    <slot name="logo"/>
    <slot name="nav"/>
  </div>
</template>
```

```html
<!-- src/components/App.vue -->
<template>
  <TheHeader>
    <TheLogo slot="logo"/>
    <TheNav
      slot="nav"
      :is-dropdown-open="isDropdownOpen"
      @toggle-dropdown="toggleDropdown"
    />
  </TheHeader>
  <TheBody/>
  <TheFooter/>
</template>

<script>
import { ref } from 'vue';

export default {
  const isDropdownOpen = ref(false);
  const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value;
  };
  
  return {
    isDropdownOpen,
    toggleDropdown,
  };
};
</script>
```

**By utilizing slots, we can eliminate the need for prop drilling.** Instead of passing the state to the `TheHeader` component, which then has to pass it to the `TheNav` component, we can directly communicate with the `TheNav` component inside the `App` component.

It's fine to manage truly global state in Vuex, but you'll find that in most cases, state is not truly global but should be owned by some component instead.

## Utilize the Context Provider Pattern

A new pattern that technically was already possible with Vue 2 but I predict to become much more popular thanks to easier access with Vue 3 APIs is [the Context Provider pattern](/blog/context-and-provider-pattern-with-the-vue-3-composition-api/), which is already well known in the React world.

```js
// src/composables/counter.js
import { provide, inject, ref } from 'vue';

const COUNTER_CONTEXT = Symbol();

export function useCounterProvider(initialValue) {
  const count = ref(initialValue);
  const increment = () => {
    count.value +=1;
  };

  // Instead of returning the `count` state
  // and the `increment()` method, we provide
  // it to every direct or indirect child
  // component of components using this.
  provide(COUNTER_CONTEXT, {
    count,
    increment,
  });
}

export function useCounterContext() {
  const context = inject(COUNTER_CONTEXT);
  
  if (!context) {
    throw new Error('useCounterContext must be used with useCounterProvider');
  }
  
  return context;
}
```

```html
<!-- src/components/Counter.vue -->
<template>
  <div>
    <CounterButton/>
    <CounterOutput/>
  </div>
</template>

<script>
import { userCounterProvider } from '../composables/counter';

export default {
  setup() {
    // This injects the counter context
    // to make it available to all child
    // components of this component.
    useCounterProvider(0);
  },
};
</script>
```

```html
<!-- src/components/CounterButton.vue -->
<template>
  <button @click="increment">
    {{ count }}
  </button>
</template>

<script>
import { userCounterContext } from '../composables/counter';

export default {
  setup() {
    // If used with the correct provider
    // `userCounterContext()` returns
    // `{ count, increment }`.
    return userCounterContext();
  },
};
</script>
```

This is a simplified example to demonstrate the power of the Context Provider pattern. In a real-world application, in such simple cases, you should stick to using local state and pass it to child components via props, as we've seen in earlier examples.

As Anthony Gore showed us, we can [create a global state management system](https://vuejsdevelopers.com/2020/10/05/composition-api-vuex/#diy-vuex-with-composition-api) ourselves with `provide/inject` using a very similar approach.

Injecting state via `provide/inject` is a powerful technique for managing **state shared by loosely coupled components.** We don't have to inject a context at the highest level of our application; we can also inject it deeper down our component tree. I highly recommend you not create one giant global state context but a few tiny specialized contexts for each specific use case.

With great power comes great responsibility. You can easily use `provide/inject` and the Composition API to build maintainability nightmares. **Be very careful when injecting state into your components that is not read-only.** I highly recommend you to only modify global state via setter functions for [easier debugging](https://twitter.com/MaOberlehner/status/1314187607555833858) when you have multiple components changing a particular piece of the global state, leading to race conditions.

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

## Use the SWR Cache Pattern

Last but not least, we often need to deal with **state coming from a server.** In this case, some database is responsible for state management, but we need a local copy of the state because we can't access the database directly from our client application.

In the past, I often reached for Vuex to solve this problem, but if we think about it, what we really need is not a state management solution (the database does this just fine) but a **local cache for the data from the database.**

In the React world, [react-query](https://github.com/tannerlinsley/react-query) and [swr](https://github.com/vercel/swr) are two very successful libraries to solve this problem. In Vue.js, we have [swrv](https://github.com/Kong/swrv).

```html
<template>
  <div>
    <div v-if="error">failed to load</div>
    <div v-if="!data">loading...</div>
    <div v-else>hello {{ data.name }}</div>
  </div>
</template>

<script>
import useSwr from 'swrv';

export default {
  name: 'Profile',
  setup() {
    const { data, error } = useSwr('/api/user', fetcher);

    return {
      data,
      error,
    };
  },
};
</script>
```

`swrv` uses the Stale-While-Revalidate cache pattern to ensure the user sees data as soon as possible and revalidates the data in the background, anytime a component requests fresh data.

## What about Vuex?

Although you most likely don't *need* Vuex to manage state in a Vue.js application, **there are still good reasons to use Vuex.** Because of the excellent developer tools and great debugging capabilities, for example.

If you decide to use Vuex, I recommend you to embrace the local state and use the technique of lifting state up anyway. But you can replace the context provider pattern with Vuex modules, and you can use your Vuex store as a cache for data from a database or API.

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

## Wrapping It Up

**The Vue Composition API is a toolbox to make state management a piece of cake.** But we have to use it wisely. It is no panacea to all state management problems, and it has great potential to be used in ways that harm the long term maintainability of the applications we build.

I highly recommend the original article by Kent C. Dodds by which this article was inspired: [Application State Management with React](https://kentcdodds.com/blog/application-state-management-with-react). Most of the basic principles he touches in his article also apply to Vue.js applications.
