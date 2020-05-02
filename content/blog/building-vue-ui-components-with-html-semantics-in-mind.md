+++
date = "2019-07-14T05:09:09+02:00"
title = "Building Vue.js UI Components With HTML Semantics in Mind"
description = "Learn how to create Vue.js components that enable you to build applications with semantic HTML."
intro = "When building modern, component-based client-side applications, we often tend to forget about the foundations of web development: HTML and CSS. Sometimes we act as if the rules of writing semantic HTML are somehow no longer relevant. But the opposite is true..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "HTML"]
images = ["/images/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1542158516/blog/2019-07-14/semantic-html-ui-components"]
+++

When building modern, component-based client-side applications, we often tend to forget about the foundations of web development: HTML and CSS. Sometimes we act as if the rules of writing semantic HTML are somehow no longer relevant. But the opposite is true. More and more people use web applications every day, and **the reasons why we should strive to write semantic and accessible HTML are at least as valid today as they were in the past.**

Inspired by [this Full Stack Radio podcast episode in which Adam Wathan talks to Aaron Gustafson about writing semantic HTML](http://www.fullstackradio.com/118), **I thought about how we could make it a little easier to use semantic HTML with modern web frameworks.** In this article, we explore how we can build our Vue.js components in a way that makes it easier to create applications that render semantic HTML.

## The problem

Modern single-page web applications are based on reusable, generic components. But often, when we create these generic, low-level building blocks of our applications, **we don't know where and how these components will later be used.** This means that in most cases, we fall back to elements without semantic meaning (most notably divs and spans).

## Examples

Let's take a look at a few examples of how we can build components that can be easily adapted so that they render the appropriate HTML tag.

### Semantic Media Object component

[The Media Object](http://www.stubbornella.org/content/2010/06/25/the-media-object-saves-hundreds-of-lines-of-code/) is a rather simple yet powerful pattern consisting of three parts: a wrapper, a body and a figure element.

```html
<template>
  <Component
    :is="tag"
    class="UiMedia"
  >
    <slot/>
  </Component>
</template>

<script>
// src/components/UiMedia.vue
export default {
  name: 'UiMedia',
  props: {
    // Pass the name of the HTML
    // element you want to render.
    tag: {
      default: 'div',
      type: String
    }
  }
};
</script>

<style>
.UiMedia {
  display: flex;
}
</style>
```

Above, you can see the wrapper component of our Media Object implementation. The component (and all our other UI components) declare a `tag` property that allows us to change which HTML element is rendered. If you want to see all parts of our Vue.js Media Object implementation, you can [check out the CodeSandbox for this article](https://codesandbox.io/s/building-vuejs-ui-components-with-html-semantics-in-mind-we17z?fontsize=14&module=%2Fsrc%2FApp.vue).

```html
<template>
  <UiMedia tag="figure">
    <UiMediaFigure
      tag="img"
      src="https://via.placeholder.com/100x100"
      alt="Gray rectangle with text 100x100."
    />
    <UiMediaBody tag="figcaption">
      A gray rectangle
    </UiMediaBody>
  </UiMedia>
</template>
```

Here you can see how the `UiMedia` component can be used to render semantic `<figure>` and `<figcaption>` elements to describe an `<img>` element.

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

### Semantic headline component

In many cases, the visual hierarchy of the headlines of an application does not correspond to their semantic hierarchy. In such cases, **it can be handy to have a headline component that allows you to set the visual size independently of the rendered tag.**

Furthermore, I'm pretty sure you know the feeling when you get handed over a new design with some huge text (h1 or h2 style) that simply isn't a headline in the semantic meaning. In such situations, **it can be useful to overwrite the tag which is used to render our headline component.**

```html
<template>
  <Component
    :is="tag || `h${level}`"
    :class="`UiHeadline UiHeadline--${size || level}`"
  >
    <slot/>
  </Component>
</template>

<script>
export default {
  name: 'UiHeadline',
  props: {
    level: {
      default: '1',
      type: String
    },
    size: {
      default: null,
      type: String
    },
    // Pass the name of the HTML
    // element you want to render.
    tag: {
      default: null,
      type: String
    }
  }
};
</script>

<style>
.UiHeadline {
  font-size: 1.25em;
  font-weight: bold;
}

.UiHeadline--1 {
  font-size: 2em;
}

.UiHeadline--2 {
  font-size: 1.75em;
}

.UiHeadline--3 {
  font-size: 1.5em;
}
</style>
```

Three properties can control this `UiHeadline` component. The `level` property controls which tag (h1-h6) is rendered. Changing the `size` property affects the CSS class applied to the heading, thus changing the visual size of the headline. Last but not least, you can choose to render a completely different HTML element by changing the `tag` property.

```html
<template>
  <UiHeadline level="3" size="2">
    h3 headline looking like h2
  </UiHeadline>
  <UiHeadline level="2" size="3">
    h2 headline looking like h3
  </UiHeadline>
  <UiHeadline tag="p" size="1">
    Fake headline looking like h1
  </UiHeadline>
</template>
```

Here you can see how to use the `UiHeadline` component. Additionally you can take a look at the following CodeSandbox to see all of the examples live.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/building-vuejs-ui-components-with-html-semantics-in-mind-we17z?fontsize=14&module=%2Fsrc%2FApp.vue" title="Building Vue.js UI Components With HTML Semantics in Mind" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

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

**Modern component based web applications don't have to be a completely inaccessible mess.** There is no good reason why we should not reach for semantic HTML elements when building our applications.

Note that this only scratches the surface. Writing semantic HTML is merely the basis for creating truly accessible web applications.

## Resources

- [HTML5 Doctor, HTML5 Element Flowchart](http://html5doctor.com/downloads/h5d-sectioning-flowchart.pdf)
