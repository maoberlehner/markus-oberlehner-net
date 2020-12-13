+++
date = "2020-04-19T07:31:31+02:00"
title = "Simple Solution for Anchor Links Behind Sticky Headers"
description = "Learn how to prevent a sticky header from covering anchor links when scrolling to them."
intro = "In my experience, customers love sticky headers. And indeed, they prove to be very useful in certain situations. But there are also terrible implementations of this pattern out there. And I cannot blame the developers who created them. Getting sticky headers right is harder than you might think..."
draft = false
categories = ["Development"]
tags = ["CSS"]
+++

In my experience, customers love sticky headers. And indeed, they prove to be very useful in certain situations. But there are also terrible implementations of this pattern out there. And I cannot blame the developers who created them. **Getting sticky headers right is harder than you might think.**

In this article, we take a look at one of the pieces you need to solve to make sticky headers work great, rather than being a nuisance: **anchor links disappearing behind sticky headers.**

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2020-04-19/anchor-link-behind-sticky-header">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-04-19/anchor-link-behind-sticky-header"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2020-04-19/anchor-link-behind-sticky-header 2x"
        alt="Sticky header covering an anchor target headline."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-04-19/anchor-link-behind-sticky-header"
          alt="Sticky header covering an anchor target headline."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>Sticky header covering an anchor target headline</small>
  </p>
</div>

## How to make anchor links work with sticky headers

In the past, I worked around this problem by adding some padding around potential anchor link targets. **But probably the most elegant solution is to use `scroll-margin-top`.**

```scss
// src/scss/navigation.scss

$sticky-breakpoint: 32em;

// 1. Approximate height of sticky navigation.
[id] {
  @media (min-height: $sticky-breakpoint) {
    scroll-margin-top: 100px; // 1
  }
}

.navigation {
  // ...

  @media (min-height: $sticky-breakpoint) {
    position: sticky;
    top: 0;
  }
}
```

As you can see in the example above, **I highly recommend you to place the CSS `scroll-margin-top` to compensate the sticky header, as close to the styling of the sticky element itself.** You have to make sure that if the height of the sticky element changes or if it's only sticky on specific screen sizes, the `scroll-margin-top` is adapted accordingly.

The `[id]` selector targets all elements that have an `id` attribute because all of those potentially can become the target of an anchor link.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2020-04-19/anchor-link-behind-sticky-header-fixed">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-04-19/anchor-link-behind-sticky-header-fixed"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2020-04-19/anchor-link-behind-sticky-header-fixed 2x"
        alt="Anchor target with scroll-margin-top."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-04-19/anchor-link-behind-sticky-header-fixed"
          alt="Anchor target with scroll-margin-top."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>Anchor target with scroll-margin-top</small>
  </p>
</div>

## Alternative solution with `scroll-padding-top`

Depending on your use case, using `scroll-padding-top` directly on the `html` (or any other scroll container) element might be the more appropriate solution.

```scss
// src/scss/navigation.scss

$sticky-breakpoint: 32em;

// 1. Approximate height of sticky navigation.
html {
  @media (min-height: $sticky-breakpoint) {
    scroll-padding-top: 100px; // 1
  }
}

.navigation {
  // ...
}
```

## Browser support

[Browser support](https://caniuse.com/#search=scroll-margin-top) for `scroll-margin-top` and [support](https://caniuse.com/#search=scroll-padding-top) for `scroll-padding-top` is pretty good. Because I consider hidden scroll anchors a minor inconvenience more than a serious issue, you most likely we'll be fine without using a fallback for older browsers.

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

Like so often, the devil is in the details. If you use a sticky header and if you also use anchor links, make sure that they work well together. Thanks to `scroll-margin-top` this is easy to do.

## References

- [How to prevent anchor links from scrolling behind a sticky header with one line of CSS, Chris Ferdinandi](https://gomakethings.com/how-to-prevent-anchor-links-from-scrolling-behind-a-sticky-header-with-one-line-of-css/)
- [Fixed Headers and Jump Links? The Solution is scroll-margin-top, Chris Coyier](https://css-tricks.com/fixed-headers-and-jump-links-the-solution-is-scroll-margin-top/)
