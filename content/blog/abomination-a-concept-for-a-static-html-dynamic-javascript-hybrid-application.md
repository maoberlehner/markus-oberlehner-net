+++
date = "2018-12-16T08:43:43+02:00"
title = "abomination: a Concept for a Static HTML / Dynamic JavaScript Hybrid Application"
description = "Learn more about a potential solution to the problem of a very high Estimated Input Latency of pre-rendered Single Page Applications"
intro = "Static site generators are on the rise. To be more specific: static site generators like Gatsby.js (React) and VuePress (Vue.js) which are based on modern frontend frameworks are becoming more and more popular. Although those are great projects and especially the developer experience is amazing, there is one huge downside of using those systems to generate mostly static, text and image based websites..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Front-End Architecture"]
+++

Static site generators are on the rise. To be more specific: static site generators like Gatsby.js (React) and VuePress (Vue.js) which are based on modern frontend frameworks are becoming more and more popular.

Although those are great projects and especially the developer experience is amazing, there is one huge downside of using those systems to generate mostly static, text and image based websites (as opposed to web apps, which the underlying frameworks were originally designed for): **they spit out huge JavaScript bundles which can lead to a very high Estimated Input Latency**.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2018-12-16/gatsby-high-estimated-input-latency">
      <img
        src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-12-16/gatsby-high-estimated-input-latency"
        srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2018-12-16/gatsby-high-estimated-input-latency 2x"
        alt="High Estimated Input Latency result for Gatsby.js"
      >
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>Gatsby.js: high Estimated Input Latency</small>
  </p>
</div>

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2018-12-16/vuepress-high-estimated-input-latency">
      <img
        src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-12-16/vuepress-high-estimated-input-latency"
        srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2018-12-16/vuepress-high-estimated-input-latency 2x"
        alt="High Estimated Input Latency result for VuePress"
      >
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>VuePress: high Estimated Input Latency and Time to Interactive</small>
  </p>
</div>

## The Problem

Large text based websites oftentimes do produce large JavaScript bundles because a lot of components are needed to render those websites. **Large JavaScript bundles not only need a certain time to be downloaded but also they are pretty heavy on the CPU. Especially on low end mobile devices, this can become a problem.**

In a lot of cases, those text based websites do not need any dynamic features at all. After they are initially rendered (at build time) their HTML does not change except if the route changes. **So we're essentially loading and parsing a huge JavaScript bundle upfront just to display some static text.**

## A potential solution

The idea of the `abomination` concept is to build static websites with JavaScript but **remove all the JavaScript once the page is pre-rendered at build time**. At the same time it should also be possible to have certain components on the page which remain fully functional dynamic components (think of a slider or some tabbed content).

```html
<DynamicComponent>
  <ImageSlider :slides="imageSlides"/>
</DynamicComponent>
```

As you can see above, the `abomination` prototype provides you with a `DynamicComponent` wrapper component. **At build time, the code for initializing all the dynamic components is extracted from the page.** Instead of all the code for rendering the static content and some dynamic components, **only the code for the dynamic components ends up in the final JavaScript bundle**.

## Potential downsides

There are basically two major downsides to this concept. First of all, the developer experience is not as straightforward anymore because you have to think about which components should be dynamic and which not.

The second downside is that you loose the dynamic routing capabilities that you get with those frontend frameworks. However, I think you can get pretty much the same fast route change user experience with smart usage of preload and prefetch. But you have to work it out yourself instead of relying on what webpack spits out automatically.

## Check it out

`abomination` is meant to be a proof of concept for a possible enhancement to current frontend framework based static site generators. It is not meant to be used in production quite yet. But if you want to play around with it, please feel free to [checkout the GitHub repository](https://github.com/maoberlehner/abomination-a-concept-for-a-static-html-dynamic-javascript-hybrid-application) and [take a look at the demo hosted on Netlify](https://abomination-concept-example.netlify.com/).

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

Building websites – not only web apps – with React and Vue.js seems to be all the rage right now. And I definitely can understand it because the developer experience is great. But I also noticed that, **if you want to build the fastest website possible, purely static websites without any superfluous JavaScript are still the clear winners**.

A concept like `abomination` could help to build React and Vue.js based static site generators which are able to generate the fastest websites possible while at the same time not giving up on the convenience of using modern frontend frameworks.