+++
date = "2017-10-29T06:26:53+02:00"
title = "The Ultimative Flexbox Based CSS Layout"
description = "Learn how to build the ultimative Flexbox CSS layout using Sass. The layout adapts automatically to the content and the screen size – no media queries needed."
intro = "Things are looking good on the CSS layout front. Flexbox can be used in all major browsers and CSS Grid Layout is almost at a point where browser support has reached a sweet spot – for some of us it might even be feasible to build production websites using CSS Grid Layout and some form of graceful fallback. Until the rest of us can finally switch to CSS Grid Layout, we have to rely solely on Flexbox to satisfy all our layout needs. But that's not a bad thing at all, Flexbox is pretty powerful by itself already..."
draft = false
categories = ["Development"]
tags = ["CSS Architecture"]
+++

Things are looking good on the CSS layout front. Flexbox can be used in all major browsers and CSS Grid Layout is almost at a point where browser support has reached a sweet spot – for some of us it might even be feasible to build production websites using CSS Grid Layout and some form of graceful fallback.

Until the rest of us can finally switch to CSS Grid Layout, we have to rely solely on Flexbox to satisfy all our layout needs. But that's not a bad thing at all, Flexbox is pretty powerful by itself already.

In today's article, we will create two powerful Sass Mixins to meet all our CSS layout requirements.

## The starting point: Flexbox grid

The challenge of finding smarter and better methods of building grid layouts with CSS is as old as CSS itself. When Flexbox was introduced, things got a lot easier.

```scss
@mixin grid($gutter-vertical: 1rem, $gutter-horizontal: 1rem) {
  display: flex;
  flex-wrap: wrap;

  @if $gutter-vertical > 0 {
    margin-top: -$gutter-vertical;
    
    > * {
      padding-top: $gutter-vertical;
    }
  }
  @if $gutter-horizontal > 0 {
    margin-left: -$gutter-horizontal;
    
    > * {
      padding-left: $gutter-vertical;
    }
  }
}

@mixin grid__item($size: 12/12) {
  width: $size * 100%;
  flex-grow: 1;
  box-sizing: border-box;
}
```

What you can see above is a Sass Mixin for a grid wrapper and a Sass Mixin to generate grid items. We're setting the display property of the wrapper to `flex` and specify that grid items in it should wrap. By doing so, all of the immediate child elements (grid items) of the wrapper element are displayed as columns side by side until the point where there is not enough space anymore and a new row with items begins.

We're applying negative margins for the optional vertical and negative gutter, to compensate for the gutter which is applied to the grid items. Most of the popular grid layouts do not compensate for the gutter of the grid columns, which makes it harder to apply vertical gutters between grid items and it also makes nesting grids more complicated. However there are also two downsides of using negative margins: it might look confusing when inspecting grids with the browser developer tools and there is a problem with [clearing the negative margin under some circumstances](https://codepen.io/maoberlehner/pen/BpJVGO).

We're applying the vertical and horizontal gutters as paddings. By setting the `box-sizing` property in the grid item Mixin to be `border-box`, we make it possible to apply specific widths without having to substract the horizontal padding.

<p data-height="400" data-theme-id="0" data-slug-hash="zPYmrV" data-default-tab="result" data-user="maoberlehner" data-embed-version="2" data-pen-title="Semantic Flexbox Grid Layout" class="codepen">See the Pen <a href="https://codepen.io/maoberlehner/pen/zPYmrV/">Semantic Flexbox Grid Layout</a> by Markus Oberlehner (<a href="https://codepen.io/maoberlehner">@maoberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

(Look at the example at CodePen: https://codepen.io/maoberlehner/pen/zPYmrV)

## Transforming the grid into a layout Swiss Army Knife

Grids can be pretty useful to build certain layouts but oftentimes grids are not the best solution for the problem at hand. Flexbox makes it possible to build flexible and fluid layouts which adapt to the content without using any media queries at all.

```scss
@mixin layout($gutter-vertical: 1rem, $gutter-horizontal: 1rem) {
  display: flex;
  flex-wrap: wrap;

  @if $gutter-vertical > 0 {
    margin-top: -$gutter-vertical;

    > * {
      padding-top: $gutter-vertical;
    }
  }
  @if $gutter-horizontal > 0 {
    margin-left: -$gutter-horizontal;

    > * {
      padding-left: $gutter-horizontal;
    }
  }
}

@mixin layout__item($size: 'auto', $min-width: 0) {
  box-sizing: border-box;

  @if $size == 'auto' {
    flex-grow: 1;
  } @else if $size == 'max' {
    flex-grow: 9999;
  } @else {
    flex-grow: 1;
    width: $size * 100%;
  }
  @if $min-width > 0 {
    flex-basis: $min-width;
  }
}
```

The first Mixin is still the same as before, but we've changed its name to `layout`, `grid` would be misleading because of the new super powers we've added in the second Mixin.

The new `layout__item` Mixin now has a default size of `auto` and a new parameter `min-width` to define a minimal width. By setting the size to `auto` and not setting a `min-width`, the column width is automatically calculated depending on its content and the width of the other columns.

By setting the `size` parameter to `max` we can define that the column should take the most space it can possible get, so all of its surrounding columns shrink to their minimal width to make room for this column.

The last possible value for the size, is the same that it was before: a fraction of the desired grid width (e.g. 6/12).

By additionally specifying a `min-width` we're able to define that the column is not allowed to shrink further than this width, this means that the column is taking a new row if the available space is to little to keep its minimal width intact.

<p data-height="400" data-theme-id="0" data-slug-hash="ZXPNEy" data-default-tab="result" data-user="maoberlehner" data-embed-version="2" data-pen-title="No Media Query Responsive Layout (The Ultimative Flexbox Based CSS Layout)" class="codepen">See the Pen <a href="https://codepen.io/maoberlehner/pen/ZXPNEy/">No Media Query Responsive Layout (The Ultimative Flexbox Based CSS Layout)</a> by Markus Oberlehner (<a href="https://codepen.io/maoberlehner">@maoberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

(Look at the example at CodePen: https://codepen.io/maoberlehner/pen/ZXPNEy)

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

## Final thoughts

Flexbox is a powerful tool which makes it possible to build very complex layouts which adapt to the screen size and the content. However the combinations of flex specific properties to add to the CSS code to achieve certain layouts, might not always be self-explanatory.

Using Sass Mixins can add a layer of abstraction which not only makes it easier to achieve those complex layouts but even more important, it makes it easier to understand the code.
