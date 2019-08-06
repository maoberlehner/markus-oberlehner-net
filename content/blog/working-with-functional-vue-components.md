+++
date = "2019-07-07T06:25:25+02:00"
title = "Working With Functional Vue.js Components"
description = "Learn how to pass classes, attributes and event listerners to functional Vue.js components."
intro = "On my journey to find ways to improve the rendering performance of large scale Vue.js applications, I stumble upon functional components as a possible solution from time to time. But so far I've always found one or two reasons why I can't use them in my application..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1542158516/blog/2019-07-07/transparent-functional-component"]
+++

On my journey to find ways to improve the rendering performance of large scale Vue.js applications, I stumble upon functional components as a possible solution from time to time. But so far I've always found one or two reasons why I can't use them in my application.

## Special characteristics of functional components

Functional components have some restrictions that cause them to behave differently than other components. For example, **attributes are not passed along automatically, i.e. classes or ID's specified on a functional component are ignored by default.**

```html
<!-- src/components/ArticleTeaser.vue -->
<template>
  <div class="ArticleTeaser">
    <UiHeadline
      id="hyphenCase(article.title)"
      class="ArticleTeaser__title"
      @click="readMore"
    >
      {{ article.title }}
    </UiHeadline>
    <p>{{ article.intro }}</p>
  </div>
</template>
```

```html
<!-- src/components/UiHeadline.vue -->
<template functional>
  <h1>
    <slot/>
  </h1>
</template>
```

In the above example, none of the attributes would work on the template-based functional `UiHeadline` component. There would be no `id` or `class` and also the `@click` event handler would not be fired.

The biggest problem with that, in my opinion, is that **this is not transparent in any way.** Imagine that the person who created the `UiHeadline` component is not the same person who is responsible for the `ArticleTeaser` component - developers who only use the `UiHeadline` component might have no idea why these attributes don't work, at least not until they take a closer look at the source code.

But fortunately, there are ways to solve this, and it is the responsibility of the developer who builds the functional component to make it behave like a normal component.

## Passing along attributes and event listeners

Let's start with making it possible to pass along attributes and event listeners just as with regular components.

```html
<template functional>
  <h1
    v-bind="data.attrs"
    v-on="listeners"
  >
    <slot/>
  </h1>
</template>
```

Here you can see that with `v-bind` we can pass on all HTML attributes and we can use `v-on` to do the same with event listeners.

Although you may think that this should do the trick, we are not quite finished yet, because **unfortunately the `class` attribute is not part of `data.attrs`.**

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

## Passing classes and styles to functional components

Because Vue.js applies a special logic to the `class` and `style` attributes, they are not part of `data.attrs`, but instead you can access classes and styles via `data.class` / `data.staticClass` and `data.style` / `data.staticStyle`.

```html
<!-- Goes into `data.class` -->
<UiHeadline :class="['my-class']"/>

<!-- Goes into `data.staticClass` -->
<UiHeadline class="my-class"/>
```

This means that if you want to make your template-based functional components fully transparent, **you have to apply `data.class` and `data.staticClass` as well as `data.style` and `data.staticStyle` manually.**

```html
<template functional>
  <h1
    :class="[data.class, data.staticClass]"
    :style="[data.style, data.staticStyle]"
    v-bind="data.attrs"
    v-on="listeners"
  >
    <slot/>
  </h1>
</template>
```

Now our functional `UiHeadline` component is fully transparent and it doesn't matter to the people who use it that they're actually dealing with a functional component. Many thanks to Nico Prat, who made me aware that [the `style` attribute must also be taken into account](https://twitter.com/nicooprat/status/1148970449776386048).

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/working-with-functional-vuejs-components-7fwe7?fontsize=14&module=%2Fsrc%2Fcomponents%2FUiHeadline.vue&view=editor" title="Working With Functional Vue.js Components" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

## Benchmarks

You may be wondering why you should go the extra mile using functional components when you have to do all this extra work to use them. First, there are situations where you may not need to pass on attributes and event listeners, and second, functional components are usually much faster than normal components. [Take a look at the following benchmark](https://codesandbox.io/s/vue-stateful-vs-functional-yterr) performed by Austin Gil to see the potential performance benefits.

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

## Wrapping it up

If you plan to use template-based functional components, **I highly recommend that you pass on all attributes, classes, and event listeners to avoid confusion for those who need to use these components** as building blocks in their own components.

Apart from these caveats, refactoring parts of your code base to use of functional components can be a great way to improve the performance of your Vue.js powered application.

## References

- [Official documentation](https://vuejs.org/v2/guide/render-function.html#Functional-Components)
- [Austin Gil, Vue.js functional components: What, Why, and When?](https://stegosource.com/vue-js-functional-components-what-why-and-when/)
