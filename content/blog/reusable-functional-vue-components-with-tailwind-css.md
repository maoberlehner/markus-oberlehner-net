+++
date = "2019-11-10T05:01:01+02:00"
title = "Reusable Functional Vue.js Components with Tailwind CSS"
description = "Learn how to work with utility-first CSS frameworks like Tailwind in Vue.js and how to avoid potential pitfalls."
intro = "Tailwind is a CSS framework that I never used extensively, but I always found it interesting enough to keep it on my radar and occasionally play around with it. Today we explore how we can use Tailwind CSS with Vue.js. In this article, we identify potential pitfalls when using utility-first CSS frameworks and how to avoid them. Most importantly, we find out how to use Vue.js functional components to create abstractions for repeating patterns like cards and headlines..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "CSS Architecture", "Vue"]
images = ["/images/c_pad,b_rgb:ed8936,f_auto,q_auto,w_1014,h_510/v1542158520/blog/2019-11-10/tailwind-vue-ui-component"]
+++

Tailwind is a CSS framework that I never used extensively, but I always found it interesting enough to keep it on my radar and occasionally play around with it. **Today we explore how we can use Tailwind CSS with Vue.js.**

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/reusable-functional-vuejs-components-with-tailwind-css-7yo4n?fontsize=14&view=preview" title="Reusable Functional Vue.js Components with Tailwind CSS" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

In this article, **we identify potential pitfalls** when using *utility-first* CSS frameworks and how to avoid them. Most importantly, we find out **how to use Vue.js functional components to create abstractions for repeating patterns like cards and headlines,** for example.

If you're new to using Tailwind CSS, you can [read my previous article to learn how to set up Tailwind to work with Vue CLI powered projects](/blog/setting-up-tailwind-css-with-vue/).

The CodeSandbox above is slightly modified because I was not able to configure it to run PurgeCSS; if you want to see the original code, you can [check out this GitHub repository](https://github.com/maoberlehner/reusable-functional-vue-components-with-tailwind-css).

## Preface

A few days ago I saw [a video of Adam Wathan talking about Tailwind CSS at Laracon 2019](https://www.youtube.com/watch?v=J_7_mnFSLDg). In this talk, he explains **how to build maintainable sites with Tailwind by creating abstractions and components.**

```html
<button class="rounded-lg px-4 md:px-5 xl:px-4 py-3 md:py-4 xl:py-3 bg-teal-500 hover:bg-teal-600 md:text-lg xl:text-base text-white font-semibold leading-tight shadow-md">
  Click me!
</button>
<button class="rounded-lg px-4 md:px-5 xl:px-4 py-3 md:py-4 xl:py-3 bg-teal-500 hover:bg-teal-600 md:text-lg xl:text-base text-white font-semibold leading-tight shadow-md">
  Or maybe click ME!
</button>
```

Above, you can see how we can use Tailwind CSS to create a nice looking button. At first glance, this must look horribly wrong for most people who are used to write *regular* CSS.

And apart from the first impression, there definitely is a huge problem with this approach: **as soon as you have multiple instances of a button on your site, it becomes an unmaintainable mess.**

But as Adam explained in his Laracon talk, we can use abstractions to make our button reusable.

```scss
.button {
  @apply rounded-lg px-4 md:px-5 xl:px-4 py-3 md:py-4 xl:py-3 bg-teal-500 hover:bg-teal-600 md:text-lg xl:text-base text-white font-semibold leading-tight shadow-md;
}
```

```html
<button class="button">
  Click me!
</button>
<button class="button">
  Or maybe click ME!
</button>
```

That solution is fine for simple single element components like the button example above. **But as soon as we have more complicated components consisting of multiple elements, there are better ways of how to solve this problem.**

## Tailwind CSS powered Vue.js components

For more complex patterns, with multiple HTML elements, we can create abstractions with Vue.js components. **First, let's take a look at how we can build reusable functional UI components with Tailwind.**

### Functional UI components

In one of my previous articles, I wrote about [how we can build super-fast functional components](/blog/working-with-functional-vue-components/). **Because stateless functional components can render much faster than regular Vue.js components, this is the ideal approach for creating the building blocks of our UI.**

```html
<template functional>
  <Component
    :is="props.tag"
    :ref="data.ref"
    class="rounded overflow-hidden shadow-lg"
    :class="[
      data.class,
      data.staticClass,
    ]"
    :style="[
      data.style,
      data.staticStyle,
    ]"
    v-bind="data.attrs"
    v-on="listeners"
  >
    <slot/>
  </Component>
</template>

<script>
export { default as UiCardBody } from './UiCardBody.vue';
export { default as UiCardFigure } from './UiCardFigure.vue';

export const UiCard = {
  name: 'UiCard',
  props: {
    tag: {
      default: 'div',
      type: String,
    },
  },
};

export default UiCard;
</script>
```

Here you can see an example of a simple card component. Unfortunately, we need a lot of boilerplate code (binding classes, styles, refs, ...) in the `<template>` section to [make our functional component behave exactly like a regular component](/blog/working-with-functional-vue-components/).

For the matter of this article, the most important part is the `class="rounded overflow-hidden shadow-lg"` definition, which applies our styles via Tailwind utility classes.

In the `<script>` section, [we use a little trick to export multiple Vue.js components from a single file](/blog/multi-export-vue-single-file-components-with-proxy-exports/). Let's take a quick look at one of those additional components which make up our card abstraction.

```html
<template functional>
  <Component
    :is="props.tag"
    :ref="data.ref"
    class="px-6 py-4"
    :class="[
      data.class,
      data.staticClass,
    ]"
    :style="[
      data.style,
      data.staticStyle,
    ]"
    v-bind="data.attrs"
    v-on="listeners"
  >
    <slot/>
  </Component>
</template>

<script>
export const UiCardBody = {
  name: 'UiCardBody',
  props: {
    tag: {
      default: 'div',
      type: String,
    },
  },
};

export default UiCardBody;
</script>
```

Again, mostly functional component-specific boilerplate code. **The important part is the `class="px-6 py-4"` where we add some vertical and horizontal padding.**

```html
<template>
  <UiCard>
    <UiCardFigure
      tag="img"
      :alt="product.image.alt"
      :src="product.image.alt"
    />
    <UiCardBody>
      <h2 class="font-bold text-xl mb-2">
        {{ product.name }}
      </h2>
      <p class="text-gray-700 text-base">
        {{ product.excerpt }}
      </p>
    </UiCardBody>
  </UiCard>
</template>

<script>
import {
  UiCard,
  UiCardBody,
  UiCardFigure,
} from './ui/UiCard.vue';

export default {
  name: 'ProductCard',
  components: {
    UiCard,
    UiCardBody,
    UiCardFigure,
  },
  props: {
    product: {
      required: true,
      type: Object,
    },
  },
};
</script>
```

**In this example, you can see how we can utilize our generic `UiCard` component to build a specific `ProductCard`.** In the same way, you might create additional card components for articles, for example.

Thanks to the multi export approach we choose in the `UiCard` component, we can import all of the building blocks of our `UiCard` component via named exports from a single file.

You might wonder why we didn't use slots instead of multiple `UiCard` components. The reason is that **this approach is more flexible than using slots.** For example, if we decide we want to show a card with the body at the top followed by the figure, we can easily do this but not so much if we used slots. With slots, we might decide to use a `v-if` statement, which makes the component more complicated, or we decide to change the order with CSS, which most of the time is not ideal for accessibility.

### Tailwind for regular Vue.js components

In the previous example, we saw how to create generic UI components with Tailwind and how those can be used as building blocks for *regular,* more specific components. **Now let's take a closer look at how we can create more specific abstractions with Tailwind's utility-first approach in mind.**

```html
<template>
  <div class="xl:flex py-12 items-center -mx-6">
    <div class="px-6 text-left md:text-center xl:text-left max-w-2xl md:max-w-3xl mx-auto">
      <slot/>
    </div>
    <div class="mt-12 px-6 xl:mt-0 flex-shrink-0 max-w-2xl md:max-w-3xl">
      <slot name="figure"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppHero',
};
</script>
```

In this example, we use a remarkable number of Tailwind utility classes to create a simple layout for a reusable `AppHero` component.

**This begs the question: how to distinguish between what's a UI component and what's a regular component?** In short: UI components are **strictly generic components** which are reusable for a lot of different use cases. But this can also be true for some other components as well. **The key factor is that they always have only a single slot and basically serve as HTML elements on steroids.**

### Modifying styles with props

Although it is possible to modify the styles of the root element of a component by directly applying additional classes, in my opinion, **you should be very careful when doing so** (or avoid doing this all together). You can [read more about this further down in my guidelines for efficiently working with utility-first CSS frameworks](#guidelines).

Let's take a look at another functional UI component to see how we can modify the styles of a component via props.

```html
<template functional>
  <Component
    :is="props.tag || ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'][props.level - 1]"
    :ref="data.ref"
    class="font-light leading-tight"
    :class="[
      ...((props.size || props.level) === 1 ? ['text-3xl sm:text-4xl md:text-5xl'] : []),
      ...((props.size || props.level) === 2 ? ['text-2xl sm:text-3xl md:text-4xl'] : []),
      ...((props.size || props.level) === 3 ? ['text-1xl sm:text-2xl md:text-3xl'] : []),
      ...((props.size || props.level) >= 4 ? ['text-xl sm:text-1xl md:text-2xl'] : []),
      data.class,
      data.staticClass,
    ]"
    :style="[
      data.style,
      data.staticStyle,
    ]"
    v-bind="data.attrs"
    v-on="listeners"
  >
    <slot/>
  </Component>
</template>

<script>
export const UiHeadline = {
  name: 'UiHeadline',
  props: {
    level: {
      required: true,
      type: Number,
    },
    size: {
      default: null,
      type: Number,
    },
    tag: {
      default: null,
      type: String,
    },
  },
};

export default UiHeadline;
</script>
```

Here you can see that we can use the `size` and the `level` properties to change which classes are applied to our component. Unfortunately we can't use string interpolation (`text-${4 - level}xl sm:text-${5 - level}xl md:text-${6 - level}xl`) to apply the classes because [this would prevent PurgeCSS from doing its job](/blog/setting-up-tailwind-css-with-vue/#writing-purgeable-vue-components).

#### Validating props

In some instances, we can use [custom property validators](https://vuejs.org/v2/guide/components-props.html#Prop-Validation) to *trick* PurgeCSS and also make our components **more intelligent and less prone to human error.**

```diff
 <template functional>
   <Component
-    :is="props.tag || ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'][props.level - 1]"
+    :is="props.tag || `h${props.level}`"
     :ref="data.ref"
     class="font-light leading-tight"
     :class="[
       ...((props.size || props.level) === 1 ? ['text-3xl sm:text-4xl md:text-5xl'] : []),
       ...((props.size || props.level) === 2 ? ['text-2xl sm:text-3xl md:text-4xl'] : []),
       ...((props.size || props.level) === 3 ? ['text-1xl sm:text-2xl md:text-3xl'] : []),
       ...((props.size || props.level) >= 4 ? ['text-xl sm:text-1xl md:text-2xl'] : []),
       data.class,
       data.staticClass,
     ]"
     :style="[
       data.style,
       data.staticStyle,
     ]"
     v-bind="data.attrs"
     v-on="listeners"
   >
     <slot/>
   </Component>
 </template>

 <script>
 export const UiHeadline = {
   name: 'UiHeadline',
   props: {
     level: {
       required: true,
       type: Number,
+      validator(value) {
+        // Here PurgeCSS picks up the selectors and
+        // does not remove their styles from the CSS.
+        const headlines = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
+        return headlines.includes(`h${value}`);
+      },
     },
     size: {
       default: null,
       type: Number,
     },
     tag: {
       default: null,
       type: String,
     },
   },
 };

 export default UiHeadline;
 </script>
```

Because PurgeCSS only looks if a specific selector (like `h1`) appears *somewhere* in your code, and now it does in the validator function, we can use string interpolation in the `<template>` for dynamically determining the tag used to render the headline.

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

## Guidelines

Although I don't have extensive experience in working with utility-first CSS frameworks, **I certainly have learned a thing or two about writing bad CSS and creating footguns for future me.** Many of those learnings, I think, also apply to this approach of adding styles to websites and apps.

### Don't modify the styles of a component from outside of the  component

This principle is true, no matter if you use Tailwind CSS or some other methodology. But I think it's particularly tempting to violate it when working with utility classes. Let's consider the following example.

```html
<AppHero class="items-stretch"/>
```

By default, our `AppHero` component has the class `items-center` applied to its root element. Adding `items-stretch` onto the component from *outside* we create two potential footguns. **First of all, we have a specificity issue. Because now we have both classes on the rendered HTML element of the component.**

```html
<!-- Rendered output -->
<div class="xl:flex py-12 items-center -mx-6 items-stretch">
  <!-- ... -->
</div>
```

Which one of those two classes *wins* is determined by order of occurrence in the CSS. **If the order changes in a future release of Tailwind, your layout breaks.**

The second problem is that `items-stretch` depends on the `xl:flex` class being applied onto the root element of the component. **If The component itself is refactored to use CSS grid instead of Flexbox, again, your layout breaks.**

**Solution:** if you want to modify the styles of a component from outside of a component, you should use props to do so. If you find yourself in a situation where it feels cumbersome to add more and more modifier props onto a component, it is an evident sign that you have a wrong abstraction. Consider to split such components into multiple components or don't use an abstraction at all.

**Exceptions to this rule:** applying margins (e.g. `mt-*`) directly on components is fine and even is one of the best applications of utility classes, in my opinion.

### Letting patterns emerge

One thing to keep in mind is the mantra of *letting patterns emerge*. Far too often, we reach for an abstraction way too early although we don't even know yet which variations of *the thing* we'll need in the future.

As I already wrote before, adding more and more properties to modify the appearance of a component is a clear sign that something is wrong with your abstraction.

**Don't be afraid to let patterns emerge and wait until you are sure you can see the pattern before deciding to create a new abstraction for avoiding repetition.**

In the `ProductCard` example, I explained how you could reuse the `UiCard` component to also build an `ArticleCard` component. When creating the `ArticleCard` component, you might notice that it needs the same styles for its headline and the text as the `ProductCard`. In this case, you either decide to add an abstraction, or you decide that it's not yet time to make a decision about that and keep the repetition. **The tricky part is to always keep an eye on it and continuously refactor your code as soon as you actually see patterns emerge.**

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

I don't think that using a utility-first approach when working with CSS is a silver bullet for avoiding all of the CSS related problems many people face in their day to day work. It solves certain problems some people have with more traditional approaches like BEM, but it also introduces a set of new challenges.

**The key to success is to be smart about when to use abstractions. I think it's very easy to either make the mistake of using too few or too many abstractions.** In the first case, you might have to regularly use search and replace across your whole codebase only to change how your buttons look. Contrary to that, using too many or wrong abstractions can lead to constantly fighting against your CSS styles because it's too hard to make changes. Or you are afraid to change anything at all because you don't know exactly which places are affected by that change.

In my next article, [I write about my thoughts and opinions when it comes to working utility-first CSS](/blog/thoughts-about-utility-first-css-frameworks/).

## Resources

- [Adam Wathan, Tailwind CSS Best Practice Patterns](https://www.youtube.com/watch?v=J_7_mnFSLDg)
