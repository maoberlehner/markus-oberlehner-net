+++
date = "2020-05-24T09:05:05+02:00"
title = "React Context and Provider Pattern with the Vue 3 Composition API"
description = "Learn how to use the Vue 3 Composition API to replicate the React Context and Provider API."
intro = "The React Context API provides a way to share properties that are required by many components (e.g., user settings, UI theme) without having to pass a prop through every level of the tree (aka prop drilling)..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:F54A23,f_auto,q_auto,w_1014,h_510/v1542158521/blog/2020-05-24/vue-composition-api-context"]
+++

The React Context API provides a way to **share properties that are required by many components** (e.g., user settings, UI theme) **without having to pass a prop through every level of the tree** (aka prop drilling). Although Vue.js does not provide the same abstraction out of the box, in this article, we'll see that **in Vue 3, we have all the tools we need to replicate the same functionality quickly.**

## User settings provider

In this example, we look at how we can use this pattern to **make certain information globally available** everywhere in our entire application.

The `ProvideUserSettings` component you see beneath, provides a reactive `state` with some default values and an `update()` function for setting properties on the `state` object.

```js
// src/components/ProvideUserSettings.js 
import {
  provide,
  reactive,
  readonly,
  toRefs,
} from 'vue';

// We use symbols as unique identifiers.
export const UserSettingsStateSymbol = Symbol('User settings state provider identifier');
export const UserSettingsUpdateSymbol = Symbol('User settings update provider identifier');

export default {
  setup() {
    const state = reactive({
      language: 'en',
      theme: 'light',
    });
    // Using `toRefs()` makes it possible to use
    // spreading in the consuming component.
    // Making the return value `readonly()` prevents
    // users from mutating global state.
    provide(UserSettingsStateSymbol, toRefs(readonly(state)));

    const update = (property, value) => {
      state[property] = value;
    };
    provide(UserSettingsUpdateSymbol, update);
  },
  render() {
    // Our provider component is a renderless component
    // it does not render any markup of its own.
    return this.$slots.default();
  },
};
```

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

Next we take a look at how we can use the `ProvideUserSettings` component in our application.

```html
<!-- src/App.vue -->
<script>
import ProvideUserSettings from './components/ProvideUserSettings';

export default {
  name: 'App',
  components: {
    ProvideUserSettings,
  },
};
</script>

<template>
  <ProvideUserSettings>
    <div>
      <!-- ... -->
    </div>
  </ProvideUserSettings>
</template>
```

We probably need the settings in a lot of different components throughout our application. Because of that, it makes sense to put the provider at the root level inside of our `App` component.

**So we now have access to the user settings from anywhere in our component tree.**

```html
<!-- src/components/ButtonPrimary.vue -->
<script>
import { inject } from 'vue';

import { UserSettingsStateSymbol } from './ProvideUserSettings';

export default {
  setup() {
    const { theme } = inject(UserSettingsStateSymbol);
    
    return { theme };
  },
};
</script>

<template>
  <ButtonBase
    :class="$style[`t-${theme}`]"
  >
    <slot/>
  </ButtonBase>
</template>

<style module>
.t-light { /* ... */ }

.t-dark { /* ... */ }
</style>
```

Above, **we see how to *consume* the state of the injected context.** In the following example, we explore how to *update* the state from any component in our application.

```html
<!-- src/components/ThemeSwitcher.vue -->
<script>
import { inject } from 'vue';

import { UserSettingsUpdateSymbol } from './ProvideUserSettings';

export default {
  setup() {
    const updateUserSettings = inject(UserSettingsUpdateSymbol);
    const updateTheme = value => updateUserSettings('theme', value);
    
    return { updateTheme };
  },
};
</script>

<template>
  <div>
    <button @click="updateTheme('dark')">
      Enable darkmode
    </button>
    <button @click="updateTheme('light')">
      Enable lightmode
    </button>
  </div>
</template>
```

This time we inject the `update()` function with the `UserSettingsUpdateSymbol`. We wrap the injected function in a new `updateTheme()` function which directly sets the `theme` property of our user settings object.

In theory, we could not wrap our state with `readonly()` and mutate it directly. But this can create a maintenance nightmare because it becomes tough to determine where we make changes to the (global) state.

When we click one of the two buttons, the user settings state is updated, and **because it is a reactive object, all components which are using the injected user settings state are updated too.**

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

## Wrapping it up

Although Vue.js does not have the concept of Context built-in like React, as we've seen in this article, it is straightforward to implement something similar to that with Vue 3 `provide/inject` ourselves.
