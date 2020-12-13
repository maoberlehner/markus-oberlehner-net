+++
date = "2018-04-01T13:45:21+02:00"
title = "Vue.js Application Structure and CSS Architecture"
description = "Learn about 3 ways of how to structure the CSS in a Vue.js project and the pros and cons of individual architectural decisions."
intro = "In recent days, I thought a lot about structuring large scale component-based applications. Oftentimes, at the beginning of a project, everything seems to be easy. You build a couple of components, put them together, and without too much effort you've implemented the first feature of your application in a reasonable amount of time..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "CSS Architecture", "Sass"]
+++

In recent days, I thought a lot about structuring large scale component-based applications. Oftentimes, at the beginning of a project, everything seems to be easy. You build a couple of components, put them together, and without too much effort, you've implemented the first feature of your application in a reasonable amount of time.

Deceived by the project's rapid progress, you think, now that you already have a bunch of components, developing the next feature must be even easier and faster. But more often than not, it's more complicated than that. You realize that the components you've built are not that generic as you thought they are. Sometimes you think you can reuse a component fairly easy only to find out that in this particular case, the component should look or work a little different than it does.

In this article, I want to take a closer look at three different approaches of how to structure a component-based Vue.js application. We build one and the same application in three different ways, and we find out the pros and cons of every version of the application.

## Table of Contents

- [Few components + Sass Mixins](#1-few-components-sass-mixins)
- [Few components + CSS classes](#2-few-components-css-classes)
- [Everything is a component](#3-everything-is-a-component)
- [Conclusion](#conclusion)

## 1. Few components + Sass Mixins

The first approach we want to investigate is using **very few Vue.js components but a lot of reusable Sass Mixins** for styling recurring elements of our application.

### Hypothesis

Although Vue.js tends to be very fast, large scale applications consisting of a large number of components can still become slow. **By using fewer components and instead utilizing Sass Mixins for consistent styling, we can save on the number of components** (e.g., a button doesn't have to be a component, but can be styled with a Sass Mixin).

Also, we expect it to be easier to deal with cases when something looks (almost) exactly as something else, but it works (a little) differently. With this approach, we're able to create two components, each doing different things, but sharing the same look without having to duplicate the CSS, thanks to the Sass Mixin.

### Example

To keep this article concise, I will only show a few examples here. You can [take a look at the application running on Netlify](https://vue-css-architecture-sass-mixins.netlify.com/) and you can find [the complete code on GitHub](https://github.com/maoberlehner/vue-application-structure-and-css-architecture).

```html
<template>
  <div :class="$options.name">
    <div :class="`${$options.name}__hero`">
      <h1 :class="`${$options.name}__heroHeadline`">
        Welcome!
      </h1>

      <div :class="`${$options.name}__heroIntro`">
        <p>
          Lorem ipsum dolor sit amet, <router-link
            :to="{ name: 'list' }"
            :class="`${$options.name}__link`">
          consetetur</router-link> adipscing elitr,
          sed diam nonumy eirmod tempor.
        </p>
      </div>

      <router-link
        :to="{ name: 'article' }"
        :class="`${$options.name}__heroAction`">
        Click me!
      </router-link>
    </div>

    <ul :class="`${$options.name}__teaserList`">
      <li :class="`${$options.name}__teaserListItem`">
        <div :class="`${$options.name}__teaser`">
          <h3 :class="`${$options.name}__teaserHeadline`">
            Article
          </h3>

          <div :class="`${$options.name}__teaserText`">
            <p>
              Lorem ipsum dolor sit amet, consetetur
              sadipscing elitr, sed diam nonumy.
            </p>
          </div>

          <router-link
            :to="{ name: 'article' }"
            :class="`${$options.name}__teaserAction`">
            Read more
          </router-link>
        </div>
      </li>
      <!-- ... -->
    </ul>
  </div>
</template>

<script>
export default {
  name: 'PageHome',
};
</script>

<style lang="scss" scoped>
@import '../../scss/components/hero.mixin';
@import '../../scss/components/link.mixin';
@import '../../scss/components/teaser-list.mixin';
@import '../../scss/components/teaser.mixin';

.PageHome {
  $section-spacing: 3em;

  &__link {
    @include link();
  }

  /**
   * Hero
   */
  &__hero {
    @include hero();
  }

  &__heroHeadline {
    @include hero__headline();
  }

  &__heroIntro {
    @include hero__intro();
  }

  &__heroAction {
    @include hero__action();
  }

  /**
   * TeaserList
   */
  &__teaserList {
    @include teaserList();

    margin-top: $section-spacing;
  }

  &__teaserListItem {
    @include teaserList__item();
  }

  /**
   * Teaser
   */
  &__teaser {
    @include teaser();
  }

  &__teaserHeadline {
    @include teaser__headline();
  }

  &__teaserText {
    @include teaser__text();
  }

  &__teaserAction {
    @include teaser__action();
  }
}
</style>
```

In the example above, you can see the code for the homepage component of the [Sass Mixin version of our application](https://vue-css-architecture-sass-mixins.netlify.com/). We're taking the "few components" mantra to the extreme and we don't use any additional components at all.

Every HTML element has at most one CSS class attached to it and in the style block you can see that most CSS classes are implementing an accompanying Sass Mixin which we're importing from our `scss` directory.

**This approach makes it possible to inherit default styles from a Sass Mixin which you can extend with your own styles depending on the context** (or you could even override certain properties).

```scss
// Extend the default `teaserList`
// styles with your own.
&__teaserList {
  @include teaserList();

  margin-top: $section-spacing;
}
```

### Benchmark

**Home:** JavaScript 33.7 KB / CSS 2.1 KB  
**Article:** JavaScript 33.7 KB / CSS 1.8 KB  
**List:** JavaScript 33.7 KB / CSS 2.1 KB

Because our application is very small and has very few components and also very little repetition between pages, we have to take the benchmarks with a grain of salt. But we might spot some trends here and there. In this example we can see webpack doing its work – because the `Home` page and the `List` page share a lot of the same components and styles, their bundle sizes are exactly identical.

### Pros and cons

Let's take a quick look at some pros and cons of this approach of using as few Vue.js components as possible and utilizing Sass Mixins to keep the CSS *dry*.

\+ **Maximum reusability of CSS code**  
\+ **Clean HTML**, only one class per element  
\+ **No issues with specificity** when extending styles  
\- It's **cumbersome to include the Mixins again and again**  
\- **Duplication of styles** in the compiled CSS

## 2. Few components + CSS classes

Next we want to take a closer look at a more classic approach of doing things. In this example we want to, again, use as few components as possible, but instead of using Sass Mixins **we'll use reusable CSS classes to style our HTML**.

### Hypothesis

Although it's gone out of fashion lately to style things with applying CSS classes to HTML elements, in my opinion it's still one of the most straightforward approaches. **CSS classes are reusable and, in theory, it should be more efficient to declare a CSS class once and reuse it as often as you like**. A potential downside of using CSS classes could be that it's harder to maintain large scale applications because it's not always clear if some class is still in use or not.

### Example

Again you can find a [demo of our application implemented using few components and CSS classes on Netlify](https://vue-css-architecture-css-classes.netlify.com/) and [the complete code on GitHub in its own branch](https://github.com/maoberlehner/vue-application-structure-and-css-architecture/tree/css-classes).

```html
<template>
  <div :class="$options.name">
    <div class="hero">
      <h1 class="hero__headline">
        Welcome!
      </h1>

      <div class="hero__intro">
        <p>
          Lorem ipsum dolor sit amet,
          <router-link :to="{ name: 'list' }" class="link">
          consetetur</router-link> adipscing elitr.
        </p>
      </div>

      <router-link
        :to="{ name: 'article' }"
        class="hero__action">
        Click me!
      </router-link>
    </div>

    <ul :class="`teaserList ${$options.name}__teaserList`">
      <li class="teaserList__item">
        <div class="teaser">
          <h3 class="teaser__headline">
            Article
          </h3>

          <div class="teaser__text">
            <p>
              Lorem ipsum dolor sit amet, consetetur
              sadipscing elitr, sed diam nonumy.
            </p>
          </div>

          <router-link
            :to="{ name: 'article' }"
            class="teaser__action">
            Read more
          </router-link>
        </div>
      </li>
      <!-- ... -->
    </ul>
  </div>
</template>

<script>
export default {
  name: 'PageHome',
};
</script>

<style lang="scss">
// The node-sass-magic-importer is used to enable
// importing of specific selectors instead of all the styles.
@import '{
  .hero,
  .hero__headline,
  .hero__intro,
  .hero__action,
} from ../../scss/components/hero';
@import '{ .link } from ../../scss/components/link';
@import '{
  .teaser,
  .teaser__headline,
  .teaser__text,
  .teaser__action,
} from ../../scss/components/teaser';
@import '{
  .teaserList,
  .teaserList__item,
} from ../../scss/components/teaser-list';
</style>

<style lang="scss" scoped>
.PageHome {
  $section-spacing: 3em;

  &__teaserList {
    margin-top: $section-spacing;
  }
}
</style>
```

In this example we can see, that we have a lot less custom CSS code in the `style` block, but instead we explicitly import all the classes we need to style our HTML. We're utilizing the [node-sass-magic-importer](https://github.com/maoberlehner/node-sass-magic-importer) custom `node-sass` importer in order to being able to **import only the CSS classes we actually need**.

In the HTML code we can see, that there are occasions where we might have to combine multiple CSS classes like `teaserList` and `PageHome__teaserList` for example. Keep in mind that this approach can lead to specificity problems. In this example we're solving any kind of specificity issues by using the `scoped` attribute on the style block for the custom styles of the component but not on the block where we're importing the generic CSS classes. By scoping the component styles, we're also raising their specificity as a side effect, so the custom component styles will always win against the generic styles (as long as you're keeping the specificity of the generic classes as low as possible), which is usually what we want to achieve.

### Benchmark

**Home:** JavaScript 33.8 KB / CSS 2.1 KB  
**Article:** JavaScript 33.7 KB / CSS 1.7 KB  
**List:** JavaScript 33.8 KB / CSS 2.1 KB

Interestingly enough, against the prediction we made in the hypothesis, it seems that using this approach isn't more efficient than using Sass Mixins. But the reality is, that we really can't make a final conclusion about this. There are two major reasons why I think we can't see an improvement in file size with this approach.

First, the very small scale test setup, without a lot of repetition, favors the Sass Mixin approach; my guess is, that the results would look quite differently in a real, large scale application.

Second, the test setup is using webpack 4 in combination with the [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin) and although this is a huge improvement over webpack 3 and the [extract-text-webpack-plugin](https://github.com/webpack-contrib/extract-text-webpack-plugin), it still doesn't optimize the CSS bundles perfectly. There are some styles duplicated in the `main.css` file (which is loaded on every page) and the page specific CSS files, which works against this approach and, again, favors the Sass Mixin approach.

Considering that the `mini-css-extract-plugin` is still very young, there might be improvements in the future.

### Pros and cons

\+ **Maximum flexibility** because Mixins are still available for dealing with edge cases  
\+ Adding classes is the **most convenient and fastest way of styling HTML** elements  
\+ **No duplication** (in theory, in practice webpack is currently not able to optimize the CSS output perfectly)  
\- **More CSS classes** in the HTML code  
\- **Potential issues with specificity** (which can be solved by using scoped styles)

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

## 3. Everything is a component

Last but not least we'll build our little example application by using components for everything.

### Hypothesis

On the one hand, using components for everything, which makes it possible to have the styles, the markup and the logic in one place, should help with maintainability because it's easier to find out if some component and its styles are still being used anywhere in the application.

On the other hand, it can be very hard to build components which are generic enough to fit every use case. **In real world applications, this can lead to developers making copies of certain components because, in a certain context, a component might work in a completely different way, but it still looks the same**. So now every time you make changes to the styling of the component, you have to make those changes in two places. This can lead to maintenance hell.

We expect this approach to lead to a bigger bundle size, because we'll have overall more JavaScript code. Though, if this approach is used correctly and with great discipline, it might very well be worth it.

### Example

For this approach, we delete all the files containing component Sass Mixins and CSS classes, we only keep object Mixin files (e.g. layout styles). For every component there is a separate Vue.js component which includes its own CSS styles. You can find [the demo on Netlify](https://vue-css-architecture-everything-is-a-component.netlify.com/) and [the code on GitHub](https://github.com/maoberlehner/vue-application-structure-and-css-architecture/tree/everything-is-a-component).

```html
<template>
  <div :class="$options.name">
    <app-hero :action="{ to: { name: 'article' }, label: 'Click me!' }">
      <template slot="headline">
        Welcome!
      </template>

      <p>
        Lorem ipsum dolor sit amet,
        <app-link :to="{ name: 'list' }"> consetetur</app-link>
        adipscing elitr, sed diam nonumy eirmod.
      </p>
    </app-hero>

    <app-teaser-list :class="`${$options.name}__teaserList`">
      <app-teaser-list-item>
        <app-teaser :action="{ to: { name: 'article' }, label: 'Read more' }">
          <template slot="headline">
            Article
          </template>

          <p>
            Lorem ipsum dolor sit amet, consetetur
            sadipscing elitr, sed diam nonumy.
          </p>
        </app-teaser>
      </app-teaser-list-item>
      <!-- ... -->
    </app-teaser-list>
  </div>
</template>

<script>
import AppHero from '../app/AppHero.vue';
import AppLink from '../app/AppLink.vue';
import AppTeaser from '../app/AppTeaser.vue';
import AppTeaserList from '../app/AppTeaserList.vue';
import AppTeaserListItem from '../app/AppTeaserListItem.vue';

export default {
  name: 'PageHome',
  components: {
    AppHero,
    AppLink,
    AppTeaser,
    AppTeaserList,
    AppTeaserListItem,
  },
};
</script>

<style lang="scss" scoped>
.PageHome {
  $section-spacing: 3em;

  &__teaserList {
    margin-top: $section-spacing;
  }
}
</style>
```

As you can see above, **we've replaced all the regular HTML elements with separate Vue.js components**. Each component is self contained and has its own styles.

### Benchmark

**Home:** JavaScript 34.5 KB / CSS 2.1 KB  
**Article:** JavaScript 34.1 KB / CSS 1.8 KB  
**List:** JavaScript 34.4 KB / CSS 2.2 KB

As we've expected, the file size of the JavaScript output is the largest of the three approaches we've tested. Having said that, I expected a much bigger difference. At least in our demo application, the difference is negligible.

### Pros and cons

\+ Potentially **the easiest to maintain**  
\+ Very **clean application structure**  
\+ **Easy to find styles** attached to a certain component  
\- Makes it **harder to deal with edge cases**  
\- Slightly **larger bundle size**  
\- There might by **performance issues with very large applications**

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

## Conclusion

I'm pretty convinced there isn't the one and only *correct way* of doing things in programming. **Every one of the three approaches we've investigated has its pros and cons**. Though, I have to say, that using *only* Sass Mixins or *only* CSS classes to build Vue.js applications, might be not the best approach.

I think it depends very much on the nature of the application you're building. If you're building a large scale application and you want it to be very fast, even on low end devices, it might be wise to carefully consider if you're adding a new component or you use a regular HTML element and add the styling via a CSS class or a Sass Mixin.

I was very (positively) surprised to see, that the overhead of using components for everything, is not as large as one might think. Personally, I'm working on several projects, using an approach close to the *everything is a component* mantra, and so far, it works out pretty well.
