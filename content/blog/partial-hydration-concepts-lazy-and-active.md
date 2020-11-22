+++
date = "2020-11-08T08:58:58+02:00"
title = "Partial Hydration Concepts: Lazy and Active"
description = "Learn about different Partial Hydration stategies and a new concept for Active Hydration."
intro = "I am currently working on porting vue-lazy-hydration to Vue 3. With that comes the potential to make some significant improvements since Vue 3 has an API that allows controlling the hydration of VNodes. Working with the new APIs got me thinking about the general concept of hydration..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Front-End Architecture"]
images = ["/images/c_pad,b_rgb:ED8936,f_auto,q_auto,w_1014,h_510/v1542158523/blog/2020-11-08/partial-hydration-lazy-active"]
+++

I am currently working on porting `vue-lazy-hydration` to Vue 3. With that comes the potential to make some significant improvements since Vue 3 has an API that allows controlling the hydration of VNodes. Working with the new APIs got me thinking about the general concept of hydration.

## Partial Hydration vs. Lazy Hydration

First, start with the shared word: Hydration. In the context of client-side frameworks, this means making server-side rendered HTML interactive without completely re-rendering it from scratch. The goal of rendering HTML server-side, and hydrating it on the client, is to deliver HTML to the browser as fast as possible. The hydration process makes the HTML interactive as if it were rendered client-side. But especially for big sites with deeply nested HTML, the hydration process can be very costly. This is why we ideally want to hydrate as little as possible.

If we don't hydrate the complete app at once but only certain parts, we call it Partial Hydration. Typically, Partial Hydration means hydrating only those components of an application that need to be interactive. For example, on a blog, you might have a component rendering static text only. There is no need for hydrating that component because it is not interactive.

Lazy Hydration is a form of Partial Hydration where you can trigger hydration at a later point and not immediately after loading the site. A good example is components outside of the viewport. You don’t need to hydrate them instantly, but you can delay hydration until the component is visible.

```html
<template>
  <TheNavigation/>
  <LazyHydrate skip>
    <TheBlogArticle/>
  </LazyHydrate>
  <LazyHydrate when-visible>
    <TheFooter/>
  </LazyHydrate>
</template>
```

In this simplified example, you can see that we render `<TheNavigation>` as usual. But we wrap `<TheBlogArticle>` in a `<LazyHydrate>` component that `skip`s hydration completely because it only renders static text; there is no need for hydration. In the `<TheFooter>`, we have interactive `<RouterLink>`s, which we want to make interactive and therefore need to hydrate. But we only have to do this when the footer is visible.

## Active Hydration

The Lazy Hydration concept you can see above works best when we have a mostly interactive application, but we want to exclude some parts from the hydration. Let's imagine the other way around: we have a huge application with deeply nested components, it is a static website, but there is this one deeply nested component, which must be interactive.

```bash
App > ShoppingCart > ProductList > ProductListItem > ProductQuantity
```

In this example, the whole `App` component is static HTML but not `ProductQuantity`.

```html
<template>
  <LazyHydrate skip>
    <App/>
  </LazyHydrate>
</template>
```

```html
<!-- src/components/ProductListItem.vue -->
<template>
  <ActiveHydrate>
    <ProductListItem/>
  </ActiveHydrate>
</template>
```

In this example, you can see that we skip hydration for `<App>` altogether. But we explicitly mark `<ProductListItem>` for Active Hydration.

This is only a concept right now but what this would mean is that only the JavaScript code for the single `<ProductListItem>` is loaded and executed. Even when your site consists of hundreds of components, the final client-side bundle would only be a couple of kilobytes.

## Wrapping It Up

I think the way how we currently build websites with client-side frameworks is very wasteful. So wasteful that I often wonder if it was a big mistake by us to move in this direction before we've solved the problems that come with this technological choice. Partial, Lazy, and maybe Active Hydration can help us build super-fast websites with modern client-side frameworks.
