+++
date = "2018-06-17T06:47:47+02:00"
title = "Layouts with Vue.js - How to Create Dynamic Layout Components"
description = "Learn how to build a performant Vue.js layout system with layouts that do not re-render on every route change and how to build flexible layout components with Vue.js."
intro = "Vue.js is flexible enough to serve as a tool for either progressively enhancing certain parts of traditional server-side rendered applications or powering large scale single-page applications, and everything in between. If you build complex single-page applications, you'll most likely encounter situations where you need different page layouts for certain parts of your app..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
+++

Vue.js is flexible enough to serve as a tool for either progressively enhancing certain parts of traditional server-side rendered applications or powering large scale single-page applications, and everything in between. If you build complex single-page applications, you'll most likely encounter situations where you need different page layouts for certain parts of your app.

Today we'll take a look at multiple ways of how to handle layouts in Vue.js, and we'll explore the potential up and downsides of the different approaches.

You can find [the code for this article on GitHub](https://github.com/maoberlehner/dynamic-vue-layout-components), and you can [browse the final result hosted on Netlify](https://dynamic-vue-layout-components.netlify.com/).

## The Vue CLI way

Nowadays, I assume that most of you use the awesome [Vue CLI](https://github.com/vuejs/vue-cli) to kickstart new Vue.js projects (if you don't, you absolutely should check it out). So let's take a look at what the Vue CLI is preparing for us.

```html
<template>
  <div class="App">
    <nav class="App__nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <router-view/>
    <footer>
      &copy; Awesome Company
    </footer>
  </div>
</template>
```

**This is the default approach for structuring a basic layout for a Vue Router powered Vue.js application.** It works fine as long as you don't need different layouts throughout your application. For example, you may have a checkout flow where you don't want to display a navigation. Or you might have product pages with sidebars and other pages without sidebars and so on.

Let's take a look at how we can enhance the default approach provided to us by the Vue CLI to handle cases where we have to display different layouts.

<div>
  <hr class="c-hr">
  <a
    style="display: block; margin-top: 1em;"
    href="https://www.creative-tim.com/templates/vuejs/?partner=143346"
  >
    <img
      src="/images/q_auto/v1532158514/blog/assets/high-quality-templates"
      alt="Screenshots of three premium Vue.js templates."
      style="max-width: 100%; height: auto;"
      loading="lazy"
    >
  </a>
  <hr class="c-hr">
</div>

## Conditional rendering

The most basic and straightforward approach would be to render certain parts of your layout conditionally. So you might add `v-if` directives to certain parts of your layout and toggle the visibility as you wish.

```diff
 <template>
   <div class="App">
-    <nav class="App__nav">
+    <nav v-if="showNav" class="App__nav">
       <router-link to="/">Home</router-link> |
       <router-link to="/about">About</router-link>
     </nav>
     <router-view/>
-    <footer>
+    <footer v-if="showFooter">
       &copy; Awesome Company
     </footer>
   </div>
 </template>
```

One problem of this approach is, that you have to control the visibility of those elements somewhere in your application. There are multiple ways of doing this and you can read about some of those in one of my recent articles about [how to handle global state in Vue.js](/blog/should-i-store-this-data-in-vuex/).

But to be completely honest, I'm not a big fan of this approach. **Although it might be the right way to go if you don't need very complex layouts and you just want to hide some element in certain contexts, this approach can potentially become a maintenance nightmare as your application is growing.**

## Static layout wrapper components

Next we take a look at how we can use an ordinary component, containing one or multiple slots for the different parts of the layout, as a wrapper for our views.

This approach is used by a lot of people (including me) because it offers **a ton of flexibility** and it also **feels not as dirty as the conditional rendering** approach.

```html
<template>
  <div class="App">
    <router-view/>
  </div>
</template>
```

In the template section of the `src/App.vue` base component, we only render the `<router-view>`.

```html
<template>
  <div class="LayoutDefault">
    <nav class="LayoutDefault__nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <main class="LayoutDefault__main">
      <slot/>
    </main>
    <footer class="LayoutDefault__footer">
      &copy; Awesome Company
    </footer>
  </div>
</template>
```

A new `src/layouts/LayoutDefault.vue` component now renders the layout for us and it provides a default `<slot>` for the content. This is basically the layout for all the regular pages (views) of our application.

```html
<template>
  <layout-default>
    <div class="Home">
      <h1>Home</h1>
      <p>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
        amet.
      </p>

      <h2>Amet sit</h2>
      <p>
        Eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
        amet.
      </p>
    </div>
  </layout-default>
</template>

<script>
import LayoutDefault from '../layouts/LayoutDefault.vue';

export default {
  name: 'Home',
  components: {
    LayoutDefault,
  },
};
</script>
```

The `src/Home.vue` component implements the `LayoutDefault` wrapper component to wrap its content.

Although, in terms of flexibility, this approach has everything we need, there is one huge downside of wrapping our views in a static layout component: **the component is destroyed and re-created every time the route changes.** This not only has a negative effect on the performance, because the client has to re-create the layout component (and all the other components nested inside of it) again and again on every route change, but it can also mean you have to fetch certain data, which you use in one of the components of your layout, on every route change.

You can play around with the following demo application to see an example of this in action. Note that the username in the top right will be loaded again and again every time you navigate from one page to another.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/mm2x15m8r9?module=%2Fsrc%2FApp.vue&view=preview" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

**So static layout wrapper components are very powerful and flexible, but they also come with a cost.** Let's check out if we can come up with an approach which has all the positive characteristics of static wrapper components but none of the negative ones.

## Dynamic layout wrapper components

Before we get started, let me say that the component system in Vue.js is very, very powerful. One of those very powerful features of the component system are **dynamic components.**

```html
<component :is="SomeComponent"/>
```

In the example above, `SomeComponent` is a variable, which can be dynamically assigned to any component and each time you assign a different component, the template renders the new component in the place where you defined the `<component>` tag.

**We can use dynamic components, to build a very flexible yet performant dynamic layout system.**

```html
<template>
  <component :is="layout">
    <router-view :layout.sync="layout"/>
  </component>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      layout: 'div',
    };
  },
};
</script>
```

First of all, let's update our `App` base component to prepare it for dynamic layouts. In order to do so, we wrap the `<router-view>` tag with a dynamic component `<component>` tag. The `<component>` tag renders whatever component is defined in the `layout` variable.

Because we want our router views to be able to control which layout component is rendered, we define a synchronous `layout` property on the `<router-view>` tag. This makes it possible to update the `layout` property from within our views by emitting a `update:layout` event.

The `is` property of the dynamic component can also be set to render a regular HTML element. So what we can do is to set the value of `layout` to `div` by default as a fallback if a view has not defined its own layout. But keep in mind that this means such a view is rendered inside a `<div>` if its route is accessed directly but it renders as whichever layout was set by the view before if it is not accessed directly but via following a link in you SPA. **So I recommend you to explicitly set a layout in all of your view components.**

```html
<template>
  <div class="Home">
    <h1>Home</h1>
    <!-- ... -->
  </div>
</template>

<script>
import LayoutDefault from '../layouts/LayoutDefault.vue';

export default {
  name: 'Home',
  created() {
    this.$emit('update:layout', LayoutDefault);
  },
};
</script>
```

Above you can see that we don't wrap the template of our `Home` view inside of the `LayoutDefault` component anymore, but we load the component and emit it as the new value of the `layout` property which we've defined in the `App` base component. This means, as soon as the `Home` component is created, the dynamic component wrapping the `<router-view>`, which renders the `Home` component, is re-rendered to render the component we've emitted in the `created()` hook.

### Why is this better than static wrapper components?

At first glance, this might seem like a more complicated version of the static layout wrapper approach. But let me explain why this approach comes with all the benefits of the static component approach but shares none of the potential problems those can have.

**The main difference is, that the layout component is not part of the router view component but wraps around it.** This means that the layout component is only re-rendered if the view component uses a different layout than the previous view component. So for example, if all of your pages but the login page, use the same layout, the layout is only re-rendered if the user opens the login page, which should be relatively rare.

Next you can see the same demo application as in the static layout wrapper example but now using a dynamic component to load the layout instead. **Note that other than in the first example, the name of the currently logged in user in the top right, is not fetched again and again on every route change because only the router view is re-rendered.**

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/184177316l?module=%2Fsrc%2FApp.vue&view=preview" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

### Building a renderless dynamic layout component

Renderless components are awesome. You can read more about them in one of my previous articles about [how to build renderless declarative data fetching components](/blog/building-renderless-components-to-handle-crud-operations-in-vue/). In our case, we can utilize the power of renderless components to make it easier and more comfortable to use dynamic layout components in our views. So let's refactor our code.

```html
<template>
  <layout-default-dynamic>
    <div class="Home">
      <h1>Home</h1>
      <!-- ... -->
    </div>
  </layout-default-dynamic>
</template>

<script>
import LayoutDefaultDynamic from '../layouts/LayoutDefaultDynamic';

export default {
  name: 'Home',
  components: {
    LayoutDefaultDynamic,
  },
};
</script>
```

Similar to the static layout wrapper approach, we wrap the template of our view in a wrapper component again. But this time, the wrapper component is a renderless component which does not render any markup itself.

```js
// src/layouts/LayoutDefaultDynamic.js
import LayoutDefault from './LayoutDefault.vue';

export default {
  name: 'LayoutDefaultDynamic',
  created() {
    this.$parent.$emit('update:layout', LayoutDefault);
  },
  render() {
    return this.$slots.default[0];
  },
};
```

As you can see above, we've moved the code for emitting the layout component we want to use, into a new `LayoutDefaultDynamic` renderless component. We're doing so by calling the `$emit` method on the `$parent` (this is a reference to the view component which is utilizing the dynamic layout component). Usually reaching for the `$parent` is kind of an anti pattern but in this case it's ok because the `LayoutDefaultDynamic` component **must be used in the context of a view component**, so we can be sure that `$parent` always is a reference to a view component.

**Refactoring our code to utilize the renderless components technique, makes using dynamic layouts much more intuitive.**

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

### Improve bundle size with dynamic imports

Depending on how well your JavaScript code is optimized by webpack and depending on the structure of your application (e.g. if you have a lot of different layouts or one default layout and some rarely used special layouts), with this approach, you might end up in a situation where the same layouts are loaded again and again on every route change. **We can work against that by dynamically importing the layout component only in case it has not been loaded and registered before.**

```js
import Vue from 'vue';

export default {
  name: 'Layout',
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  created() {
    // Check if the layout component
    // has already been registered.
    if (!Vue.options.components[this.name]) {
      Vue.component(
        this.name,
        () => import(`../layouts/${this.name}.vue`),
      );
    }

    this.$parent.$emit('update:layout', this.name);
  },
  render() {
    return this.$slots.default[0];
  },
};
```

```diff
 <template>
-  <layout-default-dynamic>
+  <layout name="LayoutDefault">
     <div class="Home">
       <h1>Home</h1>
       <!-- ... -->
     </div>
-  </layout-default-dynamic>
+  </layout>
 </template>
 
 <script>
-import LayoutDefaultDynamic from '../layouts/LayoutDefaultDynamic';
+import Layout from '../layouts/Layout';
 
 export default {
   name: 'Home',
   components: {
-    LayoutDefaultDynamic,
+    Layout,
   },
 };
 </script>
```

As I've already said, this approach is not necessarily better than the previous way of not using dynamic imports. It highly depends on your application and how well webpack optimizes your bundles. **I'd recommend you to test both approaches and settle for the one which provides better results in terms of performance, or, if the differences are negligible, whichever you like better.**

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

When building large scale single-page applications, it is almost inevitable that you need a robust layout system. Using dynamic rendering can be a quick fix but it can become a maintenance hell as complexity is growing and requirements are changing. Static wrapper layouts can be problematic in terms of rendering performance and also can lead to larger bundle sizes.

By using dynamic renderless layout components we can achieve the same flexibility and functionality as with static wrapper layouts but without forcing the client to re-render the complete layout on every route change and with the potential to improve bundle sizes thanks to dynamic imports.
