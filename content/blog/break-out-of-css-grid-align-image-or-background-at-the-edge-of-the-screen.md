+++
date = "2020-06-21T07:16:16+02:00"
title = "Break out of CSS Grid: Align Image or Background at the Edge of the Screen"
description = "Learn how to build a CSS Grid layout where an image is on the one side and text on the other side and the image reaches the edge of the screen."
intro = "In the following screenshot, you can see a popular pattern for landing pages: repeating sections of an image on the one side and text on the other side where the image reaches the edge of the screen..."
draft = false
categories = ["Development"]
tags = ["CSS Architecture"]
images = ["/images/c_pad,b_rgb:FFFFFF,f_auto,q_auto,w_1014,h_510/v1542158521/blog/2020-06-21/edge-background"]
+++

Break out of CSS Grid: Align Image or Background at the Edge of the Screen

In the following screenshot, you can see a popular pattern for landing pages: repeating sections of an image on the one side and text on the other side where the image reaches the edge of the screen.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2020-06-21/alternating-edge-image">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-06-21/alternating-edge-image"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2020-06-21/alternating-edge-image 2x"
        alt="Alternating image / text layout."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-06-21/alternating-edge-image"
          alt="Alternating image / text layout."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption">
    <small>Alternating image / text layout</small>
  </p>
</div>

There are a couple of ways how we can achieve something like this, but if you want to align the text block precisely to a 12 column grid, things can get a little bit tricky.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2020-06-21/edge-image-grid-overlay">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-06-21/edge-image-grid-overlay"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2020-06-21/edge-image-grid-overlay 2x"
        alt="The image and the text block are aligned to a 12 column grid."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-06-21/edge-image-grid-overlay"
          alt="The image and the text block are aligned to a 12 column grid."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption">
    <small>The image and the text block are aligned to a 12 column grid</small>
  </p>
</div>

Fortunately, thanks to CSS Grid, we can now solve this layout relatively easy.

<div class="c-content__broad">
  <p data-height="450" data-theme-id="0" data-slug-hash="poggMMR" data-default-tab="result" data-user="maoberlehner" data-pen-title="Break out of CSS Grid and Align Image at the Edge of the Screen" class="codepen">See the Pen <a href="https://codepen.io/maoberlehner/pen/poggMMR/">Break out of CSS Grid and Align Image at the Edge of the Screen</a> by Markus Oberlehner (<a href="https://codepen.io/maoberlehner">@maoberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>
  <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
</div>

If you look at the code of the CodePen above, you can also see that we implemented a fallback for browsers which don't support `display: grid`.

## Align a Background at the Edge of the Screen

Let's take a look at a slightly different variant of the same problem you can see in the following screenshot.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2020-06-21/edge-background">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-06-21/edge-background"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2020-06-21/edge-background 2x"
        alt="The background reaches the edge of the screen."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-06-21/edge-background"
          alt="The background reaches the edge of the screen."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption">
    <small>The background reaches the edge of the screen</small>
  </p>
</div>

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2020-06-21/edge-background-grid-overlay">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-06-21/edge-background-grid-overlay"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2020-06-21/edge-background-grid-overlay 2x"
        alt="The image, the text block and the background are aligned to a 12 column grid."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-06-21/edge-background-grid-overlay"
          alt="The image, the text block and the background are aligned to a 12 column grid."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption">
    <small>The image, the text block and the background are aligned to a 12 column grid</small>
  </p>
</div>

In the second screenshot, you can see that the image, the block of text, and the background perfectly align to a 12 column grid.

<div class="c-content__broad">
  <p data-height="450" data-theme-id="0" data-slug-hash="OJMbxMB" data-default-tab="result" data-user="maoberlehner" data-pen-title="Break out of CSS Grid and Align Background at the Edge of the Screen" class="codepen">See the Pen <a href="https://codepen.io/maoberlehner/pen/OJMbxMB/">Break out of CSS Grid and Align Background at the Edge of the Screen</a> by Markus Oberlehner (<a href="https://codepen.io/maoberlehner">@maoberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>
  <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
</div>

As you can see, the solution to this is very similar to the first example.

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

Thanks to CSS Grid, we can do many things that were impossible to achieve with Flexbox and other techniques. But this comes at the cost of a slightly more complicated syntax.
