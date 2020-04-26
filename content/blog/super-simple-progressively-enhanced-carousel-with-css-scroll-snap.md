+++
date = "2020-04-26T08:16:16+02:00"
title = "Super Simple Progressively Enhanced Carousel with CSS Scroll Snap"
description = "Learn how to build a carousel image slideshow with pure CSS and HTML."
intro = "In this article, we explore how to create a simple carousel with only HTML and CSS. Recently, when I was reminded of the existence of the CSS property scroll-snap, I thought it should be easy to create a simple carousel component with it. After outlining a quick proof of concept in a simple HTML file, my assumption was confirmed..."
draft = false
categories = ["Development"]
tags = ["HTML", "CSS"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_crop,f_auto,q_auto/v1542158520/blog/2020-04-26/pure-css-and-html-carousel-twitter"]
+++

In this article, **we explore how to create a simple carousel with only HTML and CSS.** Recently, when I was reminded of the existence of the CSS property `scroll-snap`, I thought it should be easy to create a simple carousel component with it. After outlining a quick proof of concept in a simple HTML file, my assumption was confirmed.

<div class="c-content__figure">
  <video
    data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1542158516/blog/2020-04-26/pure-css-and-html-carousel.mp4"
    poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1542158516/blog/2020-04-26/pure-css-and-html-carousel"
    muted
    autoplay
    loop
  ></video>
  <p class="c-content__caption">
    <small>Simple image carousel with pure HTML and CSS</small>
  </p>
</div>

## Pure HTML and CSS solution

In the past, I absolutely loved to implement things with pure HTML and CSS for which other people used JavaScript. Things like the checkbox hack come to my mind. It wasn't always very practical to do it that way, but it was fun. But in this case, it makes absolute sense to implement a simple carousel with pure HTML and CSS.

```html
<div class="carousel">
  <div id="skyline" class="carousel__item">
    <img src="..." alt="..." class="carousel__image">
  </div>
  <div id="great-wall-of-china" class="carousel__item">
    <img src="..." alt="..." class="carousel__image">
  </div>
  <div id="sunset-on-the-li-river" class="carousel__item">
    <img src="..." alt="..." class="carousel__image">
  </div>
</div>
<div id="controls" class="controls">
  <a href="#skyline" class="controls__dot">
    <span class="visuallyhidden">Skyline of Wai Tan, Shanghai</span>
  </a>
  <a href="#great-wall-of-china" class="controls__dot">
    <span class="visuallyhidden">Great wall of China</span>
  </a>
  <a href="#sunset-on-the-li-river" class="controls__dot">
    <span class="visuallyhidden">Sunset on the Li River</span>
  </a>
</div>
```

```scss
.carousel {
  display: flex;
  scroll-snap-type: x mandatory;
  overflow-x: scroll;
  scroll-behavior: smooth;
}

.carousel__item {
  width: 100%;
  flex-shrink: 0;
  scroll-snap-align: start;
}

.carousel__image {
  display: block;
}

// Styles for controls omitted because you
// can style them however you want.
```

In the example above, you can see all the necessary parts we need to make everything work. Have a look at the following demo to see how far this little code takes us.

<p class="codepen" data-height="500" data-theme-id="dark" data-default-tab="result" data-user="maoberlehner" data-slug-hash="rNOyPNY" data-preview="true" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="CSS Scroll Snap Carousel (1)">
  <span>See the Pen <a href="https://codepen.io/maoberlehner/pen/rNOyPNY">
  CSS Scroll Snap Carousel (1)</a> by Markus Oberlehner (<a href="https://codepen.io/maoberlehner">@maoberlehner</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

## Hiding the scrollbar despite `overflow: scroll`

The solution works pretty well, but although there are advantages and disadvantages to having the scrollbar visible, it's not very pretty. At least not in operating systems that show a scrollbar by default. But luckily, there is a rather simple trick for hiding the scrollbar with CSS.

```scss
.carousel {
  // ...
  // Hide scrollbar in IE.
  -ms-overflow-style: none;
}

// Hide scrollbar in WebKit and Blink powered browsers.
.carousel::-webkit-scrollbar {
  display: none;
}
```

As you can see above, by using the `::-webkit-scrollbar` pseudo selector for WebKit and Blink powered browsers and `-ms-overflow-style: none` for IE, there is no scrollbar anymore in most browsers.

<p class="codepen" data-height="500" data-theme-id="dark" data-default-tab="result" data-user="maoberlehner" data-slug-hash="abvJPVy" data-preview="true" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Super Simple Progressively Enhanced Carousel with CSS Scroll Snap">
  <span>See the Pen <a href="https://codepen.io/maoberlehner/pen/abvJPVy">
  Super Simple Progressively Enhanced Carousel with CSS Scroll Snap</a> by Markus Oberlehner (<a href="https://codepen.io/maoberlehner">@maoberlehner</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

## Progressive Enhancement with JavaScript

Our current solution already works (almost) perfectly fine with pure CSS and HTML. But there is one annoying thing about it: when you click an anchor link to skip to the next carousel item, the browser scrolls not only horizontally but also vertically. Luckily we can make this a little less annoying in situations where the carousel already is fully visible.

```js
document.querySelector('#controls').addEventListener('click', (event) => {
  const $slide = document.querySelector(event.target.getAttribute('href'));
  if (!$slide) return;
  
  if ($slide.scrollIntoViewIfNeeded) {
    event.preventDefault();
    $slide.scrollIntoViewIfNeeded();
  } else if ($slide.scrollIntoView) {
    event.preventDefault();
    $slide.scrollIntoView();
  }
});
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

Thanks to modern features like `scroll-snap`, we don't have to reach for a massive library if we want to create a simple carousel for our website. This solution also works even if the loading or execution of JavaScript fails for some reason. What's more, is that this also works for older browsers that don't support `scroll-snap`. Of course, the solution is not perfect in those browsers, but it's usable. That's the spirit of progressive enhancement.
