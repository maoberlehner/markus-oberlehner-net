+++
date = "2017-07-02T07:15:33+02:00"
title = "Building a Good Ol' 12 Column CSS Grid Framework with CSS Grid Layout"
description = "Learn how to build a 12 column grid framework using CSS Grid Layout and also how to decide when to use Flexbox and when to use CSS Grid Layout."
intro = "A framework is a tool to provide a solid fundament for building complex systems. By building your own CSS grid framework, we have a solid and - at least after some time - battle tested system to build on top on. After Flexbox we now have a second „official“ way of building CSS powered layouts. As I wrote in a previous article, many people argue, that those new tools make grid frameworks obsolete. Let's prove them wrong..."
draft = false
categories = ["Development"]
tags = ["CSS Architecture"]
+++

Placing elements side by side is one of the oldest challenges in web development. Over the years smart developers have invented a plethora of techniques to achieve the goal of displaying HTML elements in parallel.

One of the first methods to build layouts was using HTML tables. With CSS taking over the rise of grid frameworks began. Most grid frameworks relied on the `float` property to be set either to `right` or `left`. Because of the way how floated elements behave, this approach made it necessary to clear overflowing elements, which lead to the invention of the „clearfix“. To avoid having to use a clearfix altogether, some grid frameworks relied on the `display` property to be set to `inline-block`. This approach didn't need a clearfix to prevent elements from overflowing, but because of the way `inline-block` elements behave, other hacks were needed to deal with the little space which occurs between `inline` and `inline-block` elements.

To cut a long story short: none of those approaches were originally intended to be used to build layouts. If you want to read a little bit more about the history of displaying elements side by side, you can read further about it in the following article: [A (Final?) Look at Grid Frameworks](https://markus.oberlehner.net/blog/a-final-look-at-grid-frameworks/).

I created an [example CodePen](https://codepen.io/maoberlehner/pen/aWarZO) using the concepts explained in the following article: [Good Ol' 12 Column CSS Grid Framework Using CSS Grid Layout](https://codepen.io/maoberlehner/pen/aWarZO)

## Finally: CSS Grid Layout
A framework is a tool to provide a solid fundament for building complex systems. By building your own CSS grid framework, we have a solid and - at least after some time - battle tested system to build on top on.

After Flexbox we now have a second „official“ way of building CSS powered layouts. As I wrote in a previous article, many people argue, that those new tools make grid frameworks obsolete. Let's prove them wrong and build a traditional 12 column grid framework using the new CSS Grid Layout.

### Grid wrapper
```scss
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-column-gap: 1em;
  grid-row-gap: 1em;
}
```

Let's take a closer look at the code above: the `display` property is set to `grid` which activates the CSS Grid Layout. The `grid-template-columns` property is responsible for line names and track sizing functions of grid columns. We're using the `repeat` function to define 12 columns, each spanning across 1 fraction. To set horizontal and vertical gutter, we can use the `grid-column-gap` and `grid-row-gap` properties. By setting those to `1em` both horizontal and vertical gutters between grid items are `1em` wide. If we want to use the same amount of space between columns and rows, like in our example, we can also use the `grid-gap` shorthand property to set both gutters at once.

### Grid items
```scss
.width-1\/12 {
  grid-column: span 1;
}

.width-2\/12 {
  grid-column: span 2;
}

// More of the same...

.width-12\/12 {
  grid-column: span 12;
}
```

By default every element in our grid spans across 1 fraction which represents a 1/12 column in our case. To make it possible to use varying widths for our columns, we define `width` classes. Setting the `grid-column` property makes it possible to create grid items which span across multiple fractions (columns). The reason why we're using a backslash `\` in the class names `.width-2\/12` is because the forward slash `/` needs to be escaped – you can use this class as `<div class="width-2/12">` in your HTML.

One thing to mention is, that by using this approach of defining fixed dimensions for our grid items, we're loosing a lot of the auto layout goodness CSS Grid Layout provides. Be mindful about how you use your CSS Grid Layout powered grid framework. In many cases a custom solution for the problem at hand, might be a better choice.

#### Responsive grid items
```scss
@media (min-width: 48em) {
  .width-1\/12\@m {
    grid-column: span 1;
  }
}

@media (min-width: 48em) {
  .width-2\/12\@m {
    grid-column: span 2;
  }
}

// More of the same...

@media (min-width: 48em) {
  .width-12\/12\@m {
    grid-column: span 12;
  }
}
```

To create responsive grid items, we're adding `width` classes wrapped in media queries. Again, the backslash `\` before the `@` is used to escape the `@` sign – you can use those CSS classes inside your HTML like so: `<div class="width-2/12@m">`. The logic behind the `@m` suffix is to read it like: this item spans across `2` of a total of `12` columns at the `medium` breakpoint.

To define a column which spans across the full width of your layout on mobile resolutions and `6` columns at the `medium` breakpoint (which could be about the size of a tablet) you can write: `<div class="width-12/12 width-6/12@m">`.

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

## Recap
It was never that easy to build powerful layouts with CSS as it is today. Since the implementation of Flexbox in most modern browsers – for the first time in history – we're able to build CSS layouts without having to rely on hacks.

At this point, some of you might wonder when it's appropriate to use Flexbox and when to use CSS Grid Layout? As a rule of thumb: use CSS Grid Layout for building your overall layout like header, main content + sidebar and footer. Use Flexbox on a component level, if you're displaying multiple elements side by side inside your pages header for example. Although there is no definitive answer to this question yet. We as developers have to figure out the best ways of using those new powerful tools that were given to us.

Using an abstraction in the form of a CSS grid framework can still be a useful tool in your toolbox to build complex layouts in an efficient way.
