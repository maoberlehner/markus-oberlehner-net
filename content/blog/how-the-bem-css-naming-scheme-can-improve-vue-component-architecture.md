+++
date = "2018-09-30T12:21:21+02:00"
title = "How the BEM CSS Naming Scheme Can Improve Vue.js Component Architecture"
description = "Quick tip about how the BEM CSS naming scheme can be useful to decide when to split up a large Vue.js component into multiple smaller ones."
intro = "In todays quick tip we'll take a look at how the BEM CSS naming scheme can be quite useful to detect when it might be better to split up a large component into multiple smaller ones..."
draft = false
categories = ["Development"]
tags = ["CSS Architecture", "BEM", "Front-End Architecture", "Vue"]
+++

In todays quick tip we'll take a look at how the BEM CSS naming scheme can be quite useful to detect when it might be better to split up a large component into multiple smaller ones.

Let's say you have a component for displaying a list of the latest articles of your blog in a grid layout.

```html
<template>
  <div class="LatestArticles">
    <h2 class="LatestArticles__headline">
      Latest articles
    </h2>
    <ul
      v-for="article in articles"
      :key="article.id"
      class="LatestArticles__list"
    >
      <li class="LatestArticles__list-item">
        <h3 class="LatestArticles__list-headline">
          {{ article.headline }}
        </h3>
        <p class="LatestArticles__list-intro">
          {{ article.intro }}
        </p>
      </li>
    </ul>
  </div>
</template>
```

In this simplified example of a `LatestArticles` component, we can see a pattern emerge: the *Element* part of the class names is prefixed (e.g. `LatestArticles__list-item` and `LatestArticles__list-headline`). In the first example, you might think about simply removing the prefix and defining a class name like `LatestArticles__item` but a name like that might be too generic and as we can see with the class `LatestArticles__list-headline` this approach won't work, because we already have a class named `LatestArticles__headline`.

**Prefixing class names like that, might be a good indicator for when it's time to refactor your component and splitting it up into multiple smaller components might be a good idea.**

```html
<template>
  <div class="LatestArticles">
    <h2 class="LatestArticles__headline">
      Latest articles
    </h2>
    <article-list :articles="latestArticles"/>
  </div>
</template>
```

```html
<template>
  <ul
    v-for="article in articles"
    :key="article.id"
    class="ArticleList"
  >
    <li class="ArticleList__item">
      <h3 class="ArticleList__headline">
        {{ article.headline }}
      </h3>
      <p class="ArticleList__intro">
        {{ article.intro }}
      </p>
    </li>
  </ul>
</template>
```

Not only does this approach prevent you from running out of class names, but it also makes it possible to reuse the `ArticleList` component in other places without having to duplicate any of the CSS.

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

In the days of scoped styles or even CSS in JS, following the BEM naming scheme might not seem to be necessary anymore. But I'd argue that there is still a lot to be gained by following this battle tested approach for structuring your CSS. Having an indicator when to split up your components into multiple smaller ones, is one of the benefits of this approach which may not be the first thing that comes to mind when you think about BEM.
