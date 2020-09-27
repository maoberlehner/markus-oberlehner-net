+++
date = "2020-09-27T09:13:13+02:00"
title = "Vue.js Style Provider Pattern"
description = "Learn how to use the Provider Pattern to build components for sharing styles."
intro = "I recently played around with the idea of using renderless provider components not only for data but for styles too. This pattern seems especially promising when it comes to building base components with style modifier props..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:1BCE69,f_auto,q_auto,w_1014,h_510/v1542158521/blog/2020-09-27/provide-style-padding"]
+++

I recently played around with the idea of using **renderless provider components not only for data but for styles** too. This pattern seems especially promising when it comes to building base components with style modifier props.

```html
<template>
  <BaseCard class="ArticleTeaser">
    <BaseCardImage src="..." alt="...">
    <BaseCardBody padding="['m', 'l@m']">
      <!-- ... -->
    </BaseCardBody>
  </BaseCard>
</template>
```

In the example code snippet above, you can see that we use `BaseCard` components to build an `ArticleTeaser` component. The `BaseCardBody` has a padding of `m` (medium) by default and `l` (large) starting from the `m` (medium) breakpoint. The `padding` property is a *style modifier prop.*

## Padding Style Provider Component

In the following example, you can see a simplified version of a `ProvideStylePadding` component. You can [take a closer look at it at GitHub](https://github.com/maoberlehner/vue-style-provider/blob/main/src/components/ProvideStylePadding.vue) if you want to see a more advanced example, making it possible to set the padding for different sides individually.

```html
<template>
  <slot
    :$$padding="{
      class: $style.root,
      style,
    }"
  />
</template>

<script>
import { spacings } from '../style.config.json';

const RESPONSIVE_SUFFIX_SEPARATOR = `@`;
const VARIABLE_BREAKPOINT_SEPARATOR = `-bp-`;

export default {
  name: 'ProvideStylePadding',
  props: {
    padding: {
      default: ['m'],
      type: Array,
    },
  },
  setup(props) {
    let style = {};
  
    for (let propertyValue of props.padding) {
      let [option, breakpoint] = propertyValue.split(RESPONSIVE_SUFFIX_SEPARATOR);
      let name = [`--padding`, breakpoint]
        .filter(x => x) // Remove `undefined` breakpoint.
        .join(VARIABLE_BREAKPOINT_SEPARATOR);

      style[name] = spacings[option];
    }

    return { style };
  },
};
</script>

<style lang="scss" module>
.root {
  /**
   * Default values.
   * These are overwritten if they are
   * explicitly set in the styles.
   */
  --padding-bp-s: var(--padding);
  --padding-bp-m: var(--padding-bp-s);
  --padding-bp-l: var(--padding-bp-m);

  padding: var(--padding);

  @media (min-width: 376px) {
    padding: var(--padding-bp-s);
  }

  @media (min-width: 768px) {
    padding: var(--padding-bp-m);
  }

  @media (min-width: 1024px) {
    padding: var(--padding-bp-l);
  }
}
</style>
```

The component you can see above might look complicated, but it helps us to achieve a few fantastic things.

- It serves as an abstraction for responsive style modifier properties.
- It helps us enforce our design system by only allowing the use of predefined values for padding.
- No global styles; if we remove the last instance of this component, the styles also disappear from our output bundle.
- It enables us to reuse (CSS) code without the problems that typically come with globally reusable CSS.
- Fixed number of lines of code regardless of the number of spacing sizes, thanks to CSS custom properties.

## Using Style Provider Components

Now let's take a look at how we can use our `ProvideStylePadding` component to build the `BaseCardBody` component we've seen at the beginning.

```html
<template>
  <ProvideStylePadding
    v-slot="{ $$padding }"
    :padding="padding"
  >
    <div
      :class="$$padding.class"
      :style="$$padding.style"
    >
      <slot/>
    </div>
  </ProvideStylePadding>
</template>

<script>
import ProvideStylePadding from './ProvideStylePadding.vue'

export default {
  name: 'BaseCardBody',
  components: {
    ProvideStylePadding,
  },
  props: {
    padding: {
      default: ['m'],
      type: Array,
    },
  },
};
</script>
```

Instead of implementing the logic for converting responsive style modifier props (e.g., `m@l`) again and again in every component like `BaseCardBody` that need such props, we now can use the abstraction in every place where we need it.

```html
<template>
  <BaseCard>
    <BaseCardImage src="..." alt="...">
    <BaseCardBody padding="['m', 'l@s', 'xl@l']">
      <!-- ... -->
    </BaseCardBody>
  </BaseCard>
</template>
```

In this example, we pass through the `padding` prop as is. But in your app, you might want to allow only specific padding sizes on card bodies. You can use either TypeScript or prop validation to limit the permitted modifiers.

## Wrapping It Up

Although I like the concept, there are also a few downsides to this. Debugging becomes more complicated because of the heavy use of custom properties. Overall, this seems to be a lot of overhead compared to using global CSS classes or even a utility class-based framework.
