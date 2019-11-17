+++
date = "2019-11-17T05:58:58+02:00"
title = "Thoughts about Utility-First CSS Frameworks"
description = "Learn more about my opinions about utility-first CSS frameworks like Tailwind CSS."
intro = "Many people, including me, are very skeptic about the utility-first approach of Tailwind CSS and other similar CSS frameworks like Tachyons. But I think it is essential to be open-minded about new ideas and techniques, especially if there's a bunch of people who like it."
draft = false
categories = ["Development"]
tags = ["JavaScript", "CSS Architecture"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,f_auto,q_auto,w_1014,h_510/v1542158524/blog/2019-11-17/tailwind-thoughts"]
+++

Many people, including me, are very skeptic about the utility-first approach of [Tailwind CSS](https://tailwindcss.com/) and other similar CSS frameworks like [Tachyons](https://tachyons.io/). But I think it is essential to be open-minded about new ideas and techniques, especially if there's a bunch of people who like it.

In the following paragraphs, I write about my thoughts on this approach. **But keep in mind that I only dipped a toe in the water. So take everything I write with a grain of salt.**

Some of my opinions are rather critical but remember that every approach has disadvantages. If I wrote a similar article about BEM, I would also point out some of the problems with it. Moreover, **I ask you to try out Tailwind and form your own opinion.**

## What I like

There are a couple of very nice things that come along with using a utility-first approach to building your design system.

### Enforcing consistenzy

If you use Tailwind CSS as an API for your design system, **it is a superb tool to enforce the basic rules,** for example, which colors you use or which margins and paddings should be applied.

```html
<div class="header">
  <!-- ... -->
</div>
<div class="content">
  <!-- ... -->
</div>

<style>
.header {
  padding: 14px;
}

.content {
  margin-top: 13px;
  padding: 15px;
}
</style>
```

```html
<div class="p-4">
  <!-- ... -->
</div>
<div class="p-4 mt-4">
  <!-- ... -->
</div>
```

The Tailwind solution definitely looks a lot tidier.

On the other hand, did we actually improve consistency that way? Check out this article if you want to read more about this specific topic: [Variables in Design Systems](https://markus.oberlehner.net/blog/variables-in-design-systems/).

### Reducing decisions

From the designer's point of view, using a rigorous framework like Tailwind CSS can help reduce the time you spend making decisions. Instead of thinking about whether a specific spacing between two elements should be `15px` or `16px`, you are forced to use `mt-4`, which translates to `1em`. The same applies to colors; you don't have to think about the blue tone you want to use; you have to choose from the list of predefined colors.

### Less context switching

Thanks to the fact that you can do all the styling work in your HTML code, you don't have to always switch between different files to change the look of a single component.

This holds if you work with a traditional CMS like Wordpress or a framework like Laravel, but not so much in the new and shiny world of component-based frontend frameworks. Both React and Vue.js have solved this problem. In React, you mostly use CSS in JS, and in Vue.js, we have single-file components.

## What I don't like

Now let's take a look at the things I don't like too much about using a utility-first approach for CSS.

### Readability

Readability is probably the most common point of criticism about Tailwind. And even though I'm sure that this will get better the longer you use it, I'm not convinced that it won't always be a disadvantage.

```scss
.btn {
  @apply font-bold py-2 px-4 rounded;
}

.btn-blue {
  @apply bg-blue-500 text-white;
}

.btn-blue:hover {
  @apply bg-blue-700;
}
```

The first question I ask myself when I see the example code snippet above, taken directly from the Tailwind documentation, is: why not use regular (S)CSS variables in the first place?

```scss
.button {
  font-weight: $font-bold;
  padding: $spacing-2 $spacing-4;
  border-radius: $border-radius-m;
}

.button--primary {
  background-color: $color-blue-500;
  color: $color-white;
  transition: background-color 0.2s;
}

.button--primary:hover {
  background-color: $color-blue-700;
}
```

Is this solution more verbose? Yes, absolutely! Is being verbose a bad thing in this case? Absolutely not! **Code is not for machines to understand us; code is for humans to be understood by them.** Of course, over time, you get used to reading the abbreviated classes of utility-first CSS frameworks. But what about the new developer in the team, who had never seen those classes before? What about the full-stack developer, who mostly works with Node.js but sometimes also helps out in the frontend?

Additionally, it was straightforward to add a transition to our button in the second example. I know that Adam is currently working on transitions, but it still illustrates another disadvantage of Tailwind that **it is only a subset of CSS.**

### Having to write purgeable HTML

[As you can read in the official documentation](https://tailwindcss.com/docs/controlling-file-size/#writing-purgeable-html), you have to change how you write HTML, so PurgeCSS does not remove critical CSS. You always have to keep that in mind; you have to train all of your new developers about that. This is a bummer.

**Writing a Vue.js component like the following is not possible with PurgeCSS** (or you have to manually whitelist the relevant CSS classes).

```html
<template>
  <Component
    :is="tag || `h${level}`"
    :class="`text-${6 - level}xl`"
  >
    <slot/>
  </Component>
</template>
```

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like what you read?</h2>
      <p class="c-twitter-teaser__body">
        Follow me to get my latest articles.
      </p>
      <a class="c-button c-button--outline c-twitter-teaser__button" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">
        Find me on Twitter
      </a>
    </div>
  </div>
</div>

## Wrapping it up

I only use Tailwind CSS occasionally, mostly to get a feel for it. But every time I use it, it doesn't feel *right* to me. I find the idea of *an API for your design system* very appealing. Still, I am more comfortable defining my spacings, colors, and font sizes as variables and write regular CSS instead of using utility classes.

On the other hand, there are many occasions where I find utility classes for certain aspects of my design to be much more straightforward to use. I use utility classes a lot for defining spacings between (unrelated) components, for example.

I can understand that some people like the Tailwind way of doing things. And I think you can build highly maintainable websites and applications doing so if you follow certain best practices like using abstractions for repeating patterns.

## References

- [Michelle Barker, A Year of Utility Classes](https://css-irl.info/a-year-of-utility-classes/)
- [Debra Ohayon, On Moving to a Utility-first CSS Framework](https://familiar.studio/blog/utility-first-css-framework)
