+++
date = "2020-08-09T08:18:18+02:00"
title = "Context-Aware Props in Vue.js Components"
description = "Learn how to derive default values for properties from the context of a component."
intro = "Recently I saw an interesting Tweet by Mark Dalgleish, about the idea of contextual defaults for React components. I was especially interested in this because I had to solve a similar problem only a few days before..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:EFEFEF,f_auto,q_auto,w_1014,h_510/v1542158521/blog/2020-08-09/dark-and-light-button"]
+++

Recently I saw an [interesting Tweet by Mark Dalgleish](https://twitter.com/markdalgleish/status/1291180726218563590), about the idea of contextual defaults for React components. I was especially interested in this because I had to solve a similar problem only a few days before.

## The basic concept

In the following screenshot, you can see two buttons: a dark button on a white background and a light button on a black background.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2020-08-09/dark-and-light-button">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-08-09/dark-and-light-button"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2020-08-09/dark-and-light-button 2x"
        alt="A dark button on a light background and a light button on a dark background."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-08-09/dark-and-light-button"
          alt="A dark button on a light background and a light button on a dark background."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption">
    <small>The style of the buttons depends on their context</small>
  </p>
</div>

```html
<template>
  <div>
    <BaseIsland background="white">
      <BaseButton>
        Dark Button
      </BaseButton>
    </BaseIsland>
    <BaseIsland background="black">
      <BaseButton>
        Light Button
      </BaseButton>
    </BaseIsland>
  </div>
</template>
```

You can see that both buttons are initialized the same way, without any modifier properties. This means that the buttons are context-aware and change their looks according to the context instead of us having to set a property explicitly.

## A pure CSS solution

If you are an old school CSS ninja, you immediately know how we can utilize nesting to solve this problem.

```scss
.c-button {
  // ...
  background-color: #444;
  color: #fff;
}

.s-background-dark .c-button {
  background-color: #fff;
  color: #444;
}
```

But there is a reason why we mostly avoid to write nested styles. It requires a lot of discipline to keep our CSS sane in the long run if we liberally rely on nesting.

## The Context-Aware Component Pattern

In one of my earlier articles, I wrote about [how to replicate React Context in Vue.js](/blog/context-and-provider-pattern-with-the-vue-3-composition-api/). Let's take a look at how we can use this pattern to provide context-aware default properties for our `BaseButton` component.

```html
<!-- src/components/ProvideBackgroundColor.vue -->
<script>
import { computed, provide, reactive, toRefs } from 'vue';

export const BackgroundColorProviderSymbol = Symbol('Background color provider identifier');

const darkColors = ['black', 'darkGray'];
const lightColors = ['white', 'lightGray'];
const colors = [...darkColors, ...lightColors];

export default {
  props: {
    backgroundColor: {
      default: 'white',
      type: String,
      // Check if the given color is valid.
      validator(value) {
        return colors.includes(value);
      },
    },
  },
  setup(props) {
    // We can have unlimited background colors but only two tones.
    // But depending on your use-case, there can also be more tones.
    const tone = computed(() => {
      if (darkColors.includes(props.backgroundColor)) return 'dark';
      return 'light';
    });
    const state = reactive({
      backgroundColor: props.backgroundColor,
      tone,
    });

    provide(BackgroundColorProviderSymbol, toRefs(state));
  },
  render() {
    // Our provider component is a renderless component
    // it does not render any markup of its own.
    return this.$slots.default();
  },
};
</script>
```

The renderless provider component we can see above takes a `backgroundColor` property and, depending on its value, decides if the `tone` of the background color is `dark` or `light`. Child components can now get the information in which background context they are rendered and change their look or even their behavior accordingly.

```html
<!-- src/components/BaseIsland.vue -->
<template>
  <ProvideBackgroundColor :background-color="backgroundColor">
    <div :class="`bg-${backgroundColor} p-${padding}`">
      <slot/>
    </div>
  </ProvideBackgroundColor>
</template>

<script>
import ProvideBackgroundColor from './ProvideBackgroundColor.vue';

export default {
  components: {
    ProvideBackgroundColor,
  },
  props: {
    backgroundColor: {
      default: 'white',
      type: String,
    },
    padding: {
      default: '4',
      type: String,
    },
  },
};
</script>

<style>
.bg-white {
  background-color: white;
}

.bg-black {
  background-color: black;
}

/* ... */
</style>
```

The [`BaseIsland` component](https://csswizardry.com/2011/10/the-island-object/) above is a simple abstraction for some boxed-off content with some padding around it and a background color. We use the `ProvideBackgroundColor` component to inform all child components about the background color of one of their parent components.

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

```html
<!-- src/components/BaseButton.vue -->
<template>
  <button
    class="root"
    :class="contextAwareTone"
  >
    <slot/>
  </button>
</template>

<script>
import { computed, inject } from 'vue';

import { BackgroundColorProviderSymbol } from './ProvideBackgroundColor.vue';

export default {
  props: {
    tone: {
      default: null,
      type: String,
    },
  },
  setup(props) {
    // Her we inject the `tone` provided by the BackgroundColorProvider context.
    const { tone: toneFromContext } = inject(BackgroundColorProviderSymbol, {});
    const defaultTone = 'dark';
    const contextAwareTone = computed(() => {
      // If a `tone` is explicitly set as a prop, we always use that.
      if (props.tone) return props.tone;
      // If no `tone` is provided by the context, we use the `defaultTone`.
      if (!toneFromContext) return defaultTone;

      // Here we specify that we want to render a `light` variant of our button
      // on a `dark` background and vice versa.
      return toneFromContext.value === 'dark' ? 'light' : 'dark';
    });

    return { contextAwareTone };
  },
};
</script>

<style>
.dark {
  background-color: black;
  color: white;
}

.light {
  background-color: white;
  color: black;
}

/* ... */
</style>
```

In the `BaseButton` component, we inject the data of the `BackgroundColorProvider` context and use the `tone` value to decide if we want to render a `dark` or a `light` button. But only if no `tone` prop is set directly on the `BaseButton` itself, do we consider the background color context.

## Wrapping it up

Although this is a potent pattern, it suffers from some of the same problems as using nested CSS: it is not always immediately apparent where certain styles do come from. On the other hand, this pattern is even more powerful because we can modify not only the looks of a component but also its functionality based on its context. If you decide to use a similar approach in your codebase, be aware of its potential downsides and make sure that everybody who works with the codebase is on the same page.
