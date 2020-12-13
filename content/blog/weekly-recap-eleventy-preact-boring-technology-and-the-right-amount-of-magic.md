+++
date = "2020-02-16T09:43:43+02:00"
title = "Weekly Recap: Eleventy + Preact, Boring Technology and the Right Amount of Magic"
description = "My personal recap of the last week with thoughts about using Elevent with Preact, the advantages of boring technology and what is the right amount of magic."
intro = "In the last week, I enjoyed working with Eleventy and Preact very much. Furthermore, I realized that boring but proven technology is often better than new and shiny tools..."
draft = false
categories = ["Development"]
tags = ["Weekly Recap"]
+++

In the last week, I enjoyed working with Eleventy and Preact very much. Furthermore, I realized that boring but proven technology is often better than new and shiny tools.

## Table of Contents

- [Eleventy + Preact](#eleventy-preact)
- [Boring technology](#boring-technology)
- [The right amount auf magic](#the-right-amount-of-magic)

## Eleventy + Preact

I'm currently tinkering with using Preact as the template language for the excellent static website generator Eleventy. So far, I am quite impressed with how fast Eleventy is at generating pages. **But I am even more impressed with how fast purely static pages with little to no client-side JavaScript code can be loaded and parsed by the browser.**

I plan to build a mostly static site with some [sprinkles of progressive enhancement with JavaScript](https://adactio.com/journal/16404). The idea is to use specific Preact components, which I use to render the purely static HTML with Eleventy, also for rehydration on the client.

For example, I want to build an image carousel that, when viewed without JavaScript, shows only the first image and is progressively enhanced to work as a dynamic carousel once the client-side hydration of the Preact component kicks in.

## Boring technology

A [tweet from Zach Holman](https://twitter.com/holman/status/1225919360385994753) resonated with me. Many of the modern and hip tools and techniques we like to use these days have been developed to solve very specific problems. Chances are you don't have these problems, and **well-established simple and boring tools are much better able at solving the *not so unique as you think* problems you have in your daily business.**

Playing with new technologies is exciting, and I enjoy learning new things this way. But the next time I have to decide which technology stack to use to develop a new product which is supposed to make money, I'm pretty sure I'll choose proven technologies, rather than the latest and greatest tool developed by some companies to solve their very specific problems.

## The right amount of magic

[DHH tweeted about the word "magic" in programming](https://twitter.com/dhh/status/1226296264469336064). I think I have a somewhat different understanding of the word regarding programming. For me, Vue.js Single File Components are a typical example of "magic". They are not a standard language feature, but they need a build step to work.

I have nothing against the kind of "magic" DHH has in mind. Framework abstractions and features that make your life easier without you having to know all the implementation details. But I sometimes wonder if tools like Vue.js and Svelte have too much build time magic going on.

Working with tools like Eleventy and [Preact (with htm)](https://github.com/developit/htm), on the other hand, feels like a breath of fresh air. It is *just* JavaScript with (almost) no build time magic, but a lot of ease of use magic. I like that very much.

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like What You Read?</h2>
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

Lately, I've been longing for simplicity. Simplicity is the only way we can keep our applications maintainable in the long run. And I realized that I find much more joy working on projects I can quickly understand.
