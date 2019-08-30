+++
date = "2017-08-20T07:50:21+02:00"
title = "Building a Responsive Priority+ Horizontal Scroll Navigation"
description = "Learn how to build a responsive Priority+ horizontal scroll navigation with CSS and JavaScript."
intro = "One of the most difficult problems to solve when designing websites that are supposed to work well on small screens is creating user-friendly navigations. For a long time the goto solution was to hide the navigation items behind a hamburger button. Although the hamburger button is still going strong, there are some new approaches coming up and gaining traction..."
draft = false
categories = ["Development"]
tags = ["CSS Architecture", "JavaScript"]
+++

One of the most difficult problems to solve when designing websites that are supposed to work well on small screens is creating user-friendly navigations. For a long time the goto solution was to hide the navigation items behind a hamburger button. Although the hamburger button is still going strong, there are some new approaches coming up and gaining traction.

One of this (kinda) new approaches is a variant of the Priority+ pattern (coined by [Michael Scharnagl](https://justmarkup.com/)) combined with horizontal scrolling. The Priority+ pattern describes a horizontal navigation which shows the most important items first, as the screen size shrinks the least important navigation items are hidden and you have to press a button to show all the navigation items again.

The Priority+ horizontal scroll navigation pattern works the same way but instead of pressing a button, the user has to scroll horizontally to the right or to the left to show hidden navigation items.

<div class="c-content__figure">
  <div class="c-content__broad">
    <img srcset="/images/2017-08-20/google-priority-plus.png 2x" alt="Google Search Priority+ scroll navigation">
  </div>
  <p class="c-content__caption">
    <small>Google Search Priority+ scroll navigation</small>
  </p>
</div>

## The markup

In the first step we're going to build the HTML markup for our Priority+ scroll navigation.

```html
<nav class="nav">
  <ul class="nav__list">
    <li class="nav__item">
      <a class="nav__link is-active" href="#dashboard">Dashboard</a>
    </li>
    <li class="nav__item">
      <a class="nav__link" href="#lorem">Lorem</a>
    </li>
    <li class="nav__item">
      <a class="nav__link" href="#ipsum">Ipsum</a>
    </li>
    <li class="nav__item">
      <a class="nav__link" href="#dolor">Dolor</a>
    </li>
  </ul>
  <div class="nav__shadow nav__shadow--start"></div>
  <div class="nav__shadow nav__shadow--end"></div>
</nav>
```

As you can see we're using a very basic approach of marking up a navigation. Using the `<nav>` tag as our wrapper for the navigation, gives the navigation the correct semantic meaning. Although using an `<ul>` for building navigations is not strictly necessary, it has become more or less the standard way of marking up navigations.

## The (S)CSS

We're using Sass and the BEM methodology for styling things.

```scss
$nav-height: 3em;
$nav-scrollbar-height: 1.5em;
$nav-shadow-width: 4.5em;

.nav {
  position: relative;
  height: $nav-height;
  display: flex;
  align-items: center;

  @media (pointer: coarse) {
    // Hide the scrollbar on devices with touch input.
    overflow: hidden;
  }
}

.nav__list {
  position: relative;
  display: flex;
  margin-left: 1em;
  margin-right: 1em;
  padding: 0;
  align-items: center;
  list-style-type: none;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;

  @media (pointer: coarse) {
    // Move the scrollbar outside of the visible area
    // by making the element taller than the parent element.
    height: $nav-height + $nav-scrollbar-height;
  }
}

.nav__item {
  flex-shrink: 0;
  
  &:not(:first-child) {
    margin-left: 1em;
  }
}

.nav__link {
  display: inline-flex;
  height: $nav-height;
  align-items: center;
  text-decoration: none;
  
  &.is-active {
    font-weight: bold;
  }
}

.nav__shadow {
  width: $nav-shadow-width;
  height: $nav-height;
  position: absolute;
  top: 0;
  // Using 0% rgba value instead of transparent because of Safari.
  background: linear-gradient(to right, rgba(#fff, 0), #fff 80%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.1s;
  
  &.is-visible {
    opacity: 1;
  }
}

.nav__shadow--start {
  left: 0;
  transform: rotate(180deg);
}

.nav__shadow--end {
  right: 0;
}
```

On the top you can see three variables which we can use to control some basic parameters of our scroll navigation.

- `$nav-height`: Because we later want to hide the horizontal scrollbar which appears if the navigation does not fit on the screen, we have to set a certain height for our navigation.
- `$nav-scrollbar-height`: This variable basically defines the vertical space which might be used by a horizontal scrollbar, it is not important that this matches exactly the height of the scrollbar, it is sufficient if it is at least as tall as the scrollbar or taller.
- `$nav-shadow-width`: To make it obvious to the user that navigation items are hidden, we're going to use shadows which show just enough of the next navigation item to make it clear that there is more to explore. This variable defines the width of those shadows.

Although horizontal scrolling is quite convenient on touch devices it can be very cumbersome (or even impossible if we hide the scrollbar) on devices without touch input. Therefore we're using `@media (pointer: coarse)` to hide the scrollbar only on devices with touch input. Keep in mind that showing the scrollbar might look ugly but if you're limiting the number of navigation items to a reasonable amount, this should happen very rarely because only very few devices with very small screens don't have support for touch input.

The `-webkit-overflow-scrolling: touch;` CSS property enables momentum-based scrolling on iOS devices. Momentum-based scrolling is the default for vertical scrolling on iOS, enabling this for horizontal scrolling too makes it feel “right”.

Setting `pointer-events: none;` on the shadow elements is recommended because otherwise the user might tap on a navigation item which is partly hidden by a shadow and therefore the tap does not reach the navigation item but the shadow element which would lead to a rather frustrating user experience.

## The JavaScript

In order to show and hide the shadows on the left and the right side to make it clear that navigation items are hidden, we have to use some JavaScript magic.

```js
const $navList = document.querySelector('.nav__list');
const $shadowStart = document.querySelector('.nav__shadow--start');
const $shadowEnd = document.querySelector('.nav__shadow--end');

function handleShadowVisibility() {
  const maxScrollStartReached = $navList.scrollLeft <= 0;
  const maxScrollEndReached = $navList.scrollLeft >= $navList.scrollWidth - $navList.offsetWidth;

  toggleShadow($shadowStart, maxScrollStartReached);
  toggleShadow($shadowEnd, maxScrollEndReached);
}

function toggleShadow($el, maxScrollReached) {
  const shadowIsVisible = $el.classList.contains('is-visible');
  const showShadow = !maxScrollReached && !shadowIsVisible;
  const hideShadow = maxScrollReached && shadowIsVisible;

  // Using requestAnimationFrame for optimal scroll performance.
  // https://stackoverflow.com/a/44779316
  if (showShadow) {
    window.requestAnimationFrame(() => $el.classList.add('is-visible'));
  } else if (hideShadow) {
    window.requestAnimationFrame(() => $el.classList.remove('is-visible'));
  }
}

handleShadowVisibility();
$navList.addEventListener('scroll', (e) => handleShadowVisibility(e));
```

The `handleShadowVisibility()` determines if and if yes which shadow(s) should be shown considering the current scrolling position of the horizontal navigation. If there are items hidden to the right, the right shadow is shown. If the user starts scrolling to the right, the left shadow is shown immediately. As soon as the user reaches the right end of the horizontal navigation the shadow on the right disappears.

Inside the `toggleShadow()` function, we're determining if the shadow element should get hidden or shown. Because scrolling can become sluggish if layout repaints are triggered during scrolling, we're using `requestAnimationFrame` to reduce layout thrashing.

## Demo

<p data-height="350" data-theme-id="0" data-slug-hash="WOmobd" data-default-tab="js,result" data-user="maoberlehner" data-embed-version="2" data-pen-title="Priority+ Scroll Navigation" class="codepen">See the Pen <a href="https://codepen.io/maoberlehner/pen/WOmobd/">Priority+ Scroll Navigation</a> by Markus Oberlehner (<a href="https://codepen.io/maoberlehner">@maoberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
