+++
date = "2020-10-18T07:15:15+02:00"
title = "useState and useReducer with the Vue 3 Composition API"
description = "Learn how to replicate the useState and useReducer React Hooks with the Vue 3 Composition API."
intro = "In the React world, React Hooks are basically what in the Vue world is the Composition API. Although React Hooks and the Vue Composition API try to solve similar problems (mainly, reusability of stateful logic), how those two frameworks deal with reactivity under the hood is quite different..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1542158517/blog/2020-10-18/react-hooks-vue3"]
+++

In the React world, React Hooks are basically what in the Vue world is the Composition API. Although React Hooks and the Vue Composition API try to solve similar problems (mainly, reusability of stateful logic), how those two frameworks deal with reactivity under the hood is quite different.

In React, we have to use `useState()` and `useReducer()` hooks to declare reactive data. In Vue.js we have `reactive()` and `ref()` instead.

```js
// React
const [count, setCount] = useState(0);
const increment = () => setCount(count + 1);
```

```js
// Vue
const count = ref(0);
const increment = () => {
  count.value += 1;
};
```

As we can see in the two examples above, while in React, we always have to use the setter function returned by `useState()` to manipulate the state; in Vue 3, we are free to modify the state however we want.

At first glance, the very flexible Vue.js approach seems preferable. Still, sometimes it can be useful to have an abstraction like `useState()` so you not have to create a setter function yourself.

## `useState()` Hook as Vue 3 Composable

With Vue 3, we can create composables, which enable us to share stateful logic. So nothing is stopping us from making our own `useState()` composable in Vue.

```js
// src/composables/state.js
import { readonly, ref } from 'vue';

export function useState(initialState) {
  const state = ref(initialState);
  const setState = (newState) => {
    state.value = newState;
  };
  
  return [readonly(state), setState];
}
```

Let's look at how we can utilize our new `useState()` composable to quickly create the state object and the corresponding setter function for a simple counter component.

```html
<!-- src/components/Counter.vue -->
<template>
  <button @click="setCount(count - 1)">
    Decrement
  </button>
  <button @click="setCount(count + 1)">
    Increment
  </button>
  {{ count }}
</template>

<script>
import { useState } from '../composables/state';

export default {
  setup() {
    const [count, setCount] = useState(0);
    // One line instead of:
    // const count = ref(0);
    // const setCount = (newValue) => {
    //   count.value = newValue;
    // };
  
    return {
      count,
      setCount,
    };
  },
};
</script>
```

As we can see above, this tiny little abstraction makes the process of creating a new state object and a corresponding setter function a one-liner.

<blockquote id="use-state-kent">
  When it's just an independent element of state you're managing: `useState()`
  <footer>
    <cite>
      <small>— <a href="https://kentcdodds.com/blog/should-i-usestate-or-usereducer">Kent C. Dodds, Should I useState or useReducer</a></small>
    </cite>
  </footer>
</blockquote>

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

## `useReducer()` Hook as Vue 3 Composable

The `useState()` composable we created in the previous chapter is useful whenever we have a state that we want to overwrite when setting a new value. 

But sometimes, we want to do more complicated state manipulations. This is when `useReducer()` enters the stage. We can use `useReducer()` as an abstraction when we have multiple actions that trigger different state changes or when the new state depends on the previous state.

<blockquote id="use-reducer-react-docs">
  `useReducer()` is usually preferable to `useState()` when you have complex state logic that involves multiple sub-values or when the next state depends on the previous one.
  <footer>
    <cite>
      <small>— <a href="https://reactjs.org/docs/hooks-reference.html#usereducer">React Documentation</a></small>
    </cite>
  </footer>
</blockquote>

```js
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: { state.count }
      <button onClick={() => dispatch({ type: 'decrement' })}>
        -
      </button>
      <button onClick={() => dispatch({ type: 'increment' })}>
        +
      </button>
    </>
  );
}
```

Here we can see a `useReducer()` example from the [official React documentation](https://reactjs.org/docs/hooks-reference.html#usereducer). If you're using Vuex, you might already be familiar with the pattern of dispatching actions to commit state changes. This is a very similar approach.

Let's look at how we can implement a `useReducer()` composable utilizing the Vue API.

```js
// src/composables/reducer.js
import { readonly, ref } from 'vue';

export function useReducer(reducer, initialArg, init) {
  const state = ref(init ? init(initialArg) : initialArg);
  const dispatch = (action) => {
    state.value = reducer(state.value, action);
  };

  return [readonly(state), dispatch];
};
```

As you can see, again, this is very straightforward to do with the Vue 3 Composition API. Now we are ready to use `useReducer()` in our Vue components.

```html
<!-- src/components/Counter.vue -->
<template>
  <div>
    Count: { state.count }
    <button @click="dispatch({ type: 'decrement' })">
      -
    </button>
    <button @click="dispatch({ type: 'increment' })">
      +
    </button>
  </div>
</template>

<script>
import { useReducer } from '../composables/reducer';

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error('Wrong action type!');
  }
}

export default {
  setup() {
    const [state, dispatch] = useReducer(reducer, initialState);
  
    return {
      dispatch,
      state,
    };
  },
};
</script>
```

This pattern can help us encapsulate pieces of our logic into reducers instead of polluting our components. That way, our components only need to know which actions to dispatch, and the reducer takes care of everything else.

One thing to note is that, although most examples of `useReducer()` use a state object, you can use whatever data type you want, `String` or `Number`, for example.

<blockquote id="use-reducer-kent">
  When one element of your state relies on the value of another element of your state in order to update: `useReducer()`
  <footer>
    <cite>
      <small>— <a href="https://kentcdodds.com/blog/should-i-usestate-or-usereducer">Kent C. Dodds, Should I useState or useReducer</a></small>
    </cite>
  </footer>
</blockquote>

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

## Wrapping It Up

Thanks to the fantastic reactivity system in Vue 3, we don't have to use special hooks for state management. But in certain situations, it can still be beneficial to use abstractions like `useState()` and `useReducer()` to save us from writing a few lines of boilerplate code again and again.
