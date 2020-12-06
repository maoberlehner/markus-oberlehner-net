+++
date = "2020-12-06T11:11:11+02:00"
title = "Utilize the File Structure to Decide When to Use Vue.js Slots"
description = "Learn how you can decide when to use slots in Vue.js components based on the file structure of your project."
intro = "I recently discovered that we can let the file structure of our projects guide us to find out which components we should inject into other components via slots and which components we can import directly..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:EFEFEF,f_auto,q_auto,w_1014,h_510/v1542158522/blog/2020-12-06/file-structure-slots"]
+++

One of my biggest aha moments in the last couple of months was when I realized that Loose Coupling makes the most sense when dependencies trigger side-effects.

So my first principle for when to use Dependency Injection is:

> *Always* inject dependencies that trigger side effects.

I recently discovered that we can let the file structure of our projects guide us to find out which components we should inject into other components via slots and which components we can import directly.

> *Never* import components from a parent directory.

But keep in mind that in programming, there are no absolute truths. So take `always` and `never` with a grain of salt. Depending on several factors, e.g., your application's size and complexity, Dependency Injection might be overkill.

If you sometimes struggle to determine if you should use a slot or import a component directly, this article is for you. We will learn how we can utilize the file system to help us decide when to use slots.

## Let the File Structure Determine Whether We Should Use Slots

Imagine the following tree structure:

```bash
├─ base
│  ├─ BaseCard.vue
│  └─ ... 
├─ ProductDetails.vue
└─ ...
```

If we want to build a card component that displays product details, what we shouldn't do, is modify the `BaseCard` component.

```html
<!-- /base/BaseCard.vue -->
<template>
  <div class="BaseCard">
    <!-- Don't do this! -->
    <ProductDetails/>
  </div>
</template>
```

Instead we apply the Inversion of Control principle.

```diff
 <template>
   <div class="BaseCard">
-    <ProductDetails/>
+    <slot/>
   </div>
 </template>
```

Slots in Vue.js components are a form of Dependency Injection; instead of tightly coupling a specific component by importing and rendering it directly inside another component, we can use a slot to decouple both components.

**Generic base components should never rely on components with specific functionality.** But it's not always that straightforward. In some instances, you might wonder if you should apply the rules of loose coupling and use slots or if tightly coupling two or more components is the better approach.

We can use the file system to make it easier to develop rules that guide us in making decisions about tight and loose coupling. In the example above, we can see that `BaseCard` is nested one level deeper than `ProductDetails`. If we follow this pattern with other types of components, we can make the following rule:

> *Never* import components from a parent directory.

For example, the `BaseCard` component is not allowed to import any parent directory component. But the `ProductDetails` component is allowed to import any `Base` component it wants.

## Domain-Driven Design

Suppose we want to build our applications using the [Domain-Driven Design](https://vueschool.io/articles/vuejs-tutorials/domain-driven-design-in-nuxt-apps/) paradigm; in that case, we can create a `modules` directory containing components and all other code specific to a particular module or feature.

```bash
├─ base
│  ├─ BaseCard.vue
│  └─ ... 
├─ modules
│  ├─ products
│  │  ├─ ProductDetails.vue
│  │  └─ ...
│  └─ ... 
└─ ...
```

All components at the root level of our file tree are allowed to use both `Base` components and components inside the `modules` directory (another possible name is `features`). But `Base` components are only allowed to import components inside of their scope. If a module needs the `BaseCard` component, we need to inject it via a slot or other means of dependency injection.

That way, we get the following benefits:

- completely decoupled components;
- shareable modules (across projects or micro frontends);
- components are explicit about which dependencies they need;
- components do not rely on a specific implementation (style) of a dependency but only on a specific *interface*.

The three types of components:

- `Base` components are the most generic building blocks of our applications. They should be easily reusable across projects. (e.g. `BaseButton`, `BaseCard`, `BaseDialog`)
- Root level components can be generic or specific, but they are always project-specific. (e.g. `TheHeader`, `TheSidebar`, `PromoBlackFriday`)
- Module components are specific to a certain feature (e.g. `ProductList`, `ArticleBody`, `ShoppingCartTotal`).

## Exceptions

If we decide to follow this principle, I'd say that we should always follow the rule of not importing components from a parent directory except for `Base` components. In the case of those generic building blocks, we **might** decide to break the rule. But only if it makes sense for the app we're building. By default, there should not be an exception for `Base` components.

Exceptions, in the other direction, are always acceptable. If it makes sense for an individual component to provide slots for other components on the same level or even nested deeper than the component, it is ok to do so.

Keep in mind that exceptions are always hard to document, and especially for larger teams, too many exceptions can lead to chaos.

## Wrapping It Up

Following this principle can be helpful for certain types of projects. But keep in mind that this highly depends on the circumstances. You can decide to use it because it helps you and your team make architecture decisions faster, but you can also determine that it is not worth it for the project you're working on.
