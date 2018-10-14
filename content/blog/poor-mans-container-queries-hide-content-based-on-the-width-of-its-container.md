+++
date = "2018-10-14T06:45:45+02:00"
title = "Poor Man's Container Queries: Hide Content Based on the Width of Its Container"
description = "Learn how to hide content based on the width of its container using pure CSS Flexbox and calc() magic."
intro = "The more we think about websites as collections of separate components (or atoms, molecules and organisms, to use the terms of the popular Atomic Design methodology), the more clear it becomes, that Media Queries are not the best solution for building truly responsive websites and applications..."
draft = false
categories = ["Development"]
tags = ["CSS", "Flexbox", "Container Queries"]
+++

The more we think about websites as collections of separate components (or atoms, molecules and organisms, to use the terms of the popular Atomic Design methodology), the more clear it becomes, that Media Queries are not the best solution for building truly responsive websites and applications.

I've already written about [how to build responsive layouts without relying on Media Queries](/blog/creating-a-responsive-alternating-two-column-layout-with-flexbox/) in this article we've explored how to change the layout of a component based on the available space. In todays article we'll take a look at how we can use a CSS only approach, to hide certain elements inside of a component as soon as the available space inside of it becomes too narrow to contain its entire content.

I recommend you to [view the following CodePen demo in fullscreen mode](https://codepen.io/maoberlehner/full/LgjxPw/) for it to make sense.

<div class="c-content__broad">
  <p data-height="400" data-theme-id="dark" data-slug-hash="LgjxPw" data-default-tab="result" data-user="maoberlehner" data-pen-title="Poor Man's Container Queries" class="codepen">See the Pen <a href="https://codepen.io/maoberlehner/pen/LgjxPw/">Poor Man's Container Queries</a> by Markus Oberlehner (<a href="https://codepen.io/maoberlehner">@maoberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>
  <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
</div>

## What's the problem with Media Queries?

Because Media Queries are relative to the viewport size, we can't use them to change the look of separate components depending on how wide the component itself, but only on how wide the viewport is. But I've already articulated my thoughts about this in more detail in [my article about how to build a responsive alternating two column layout](https://markus.oberlehner.net/blog/creating-a-responsive-alternating-two-column-layout-with-flexbox#what-s-the-problem-with-media-queries).

## Using CSS to hide content based on container width

Unfortunately, as of writing this, no browser has implemented Container Queries yet. But we can use existing CSS features to simulate Container Queries for hiding certain elements of a component depending on its width.

```scss
.media {
  display: flex;
}

.media__figure {
  $container-min-width: 25em;

  // 100% is relative to the container (`.media`)
  // if 100% container width minus `$container-min-width`
  // is equal to or less than 0, the `max-width` is 0 or
  // negative which makes the element disappear.
  // By multiplying the result of the calculation by a very
  // large number, we make sure that the value for `max-width`
  // is larger than the actual width of the element as long as
  // 100% - $container-min-width > 0.
  max-width: calc((100% - #{$container-min-width}) * 9999);
}

.media__body {
  // Make the element take all the available space
  // but not at the cost of shrinking `.media__figure`.
  flex-basis: 0;
  flex-grow: 1;
}
```

In the code block above, you can see a special implementation of [the famous Media Object](http://www.stubbornella.org/content/2010/06/25/the-media-object-saves-hundreds-of-lines-of-code/) enhanced with some `calc()` magic to hide the `figure` part of the Media Object as soon as the width of the component is less than what we've defined with the `$container-min-width` variable.

<div class="c-content__broad">
  <p data-height="400" data-theme-id="dark" data-slug-hash="LgjxPw" data-default-tab="css,result" data-user="maoberlehner" data-pen-title="Poor Man's Container Queries" class="codepen">See the Pen <a href="https://codepen.io/maoberlehner/pen/LgjxPw/">Poor Man's Container Queries</a> by Markus Oberlehner (<a href="https://codepen.io/maoberlehner">@maoberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>
  <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
</div>

## Caveats

This approach does not work in every situation. You have to keep in mind, that although the element with a `max-width` equal to or less than `0` has no width, **it still keeps its height which basically means that this approach does not work very well in situations where you want to hide elements containing textual content.** Or basically everything which is not an image or video for that matter.

**Another thing to consider is accessibility. Although the content is not visible anymore visually, it's still reachable via keyboard navigation and it's most likely still processed by Screenreaders.** Depending on your use case, this either might be a good thing or a deal breaker.

Furthermore, this approach is kind of a hack. It might not be immediately obvious to other people reading your code how this works. So keep that in mind and add comments when you think it's appropriate.

## Wrapping it up

As I discovered this approach for hiding content based on the container width, after fiddling around with some HTML and CSS for a few hours, I couldn't believe it. In this moment, it almost felt like CSS is powerful enough that everything you can imagine is possible as long as you can come up with some crazy way to achieve it.

I don't know yet if I'll use this little hack in production but I'm quite optimistic that it can be pretty useful in certain situations.
