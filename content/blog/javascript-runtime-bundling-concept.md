+++
date = "2020-12-20T08:44:44+02:00"
title = "JavaScript Runtime Bundling Concept"
description = "Learn about a concept for bundling JavaScript files server-side at runtime"
intro = "Imagine a world where you don't need to install a single dependency, but you're still able to use all modern JavaScript features. Where you don't need to run a build script every time you change a file. And you can do all of that knowing that your app will be perfectly minified and optimized for old browsers on production..."
draft = false
categories = ["Development"]
tags = ["Front-End Architecture", "JavaScript"]
images = ["/images/c_pad,b_rgb:ED8936,f_auto,q_auto,w_1014,h_510/v1542158523/blog/2020-12-20/javascript-runtime-bundling"]
+++

Imagine a world where you don't need to install a single dependency, but you're still able to use all modern JavaScript features. Where you don't need to run a build script every time you change a file. And you can do all of that knowing that your app will be perfectly minified and optimized for old browsers on production.

One thing that always bugged me since I've been a web developer is that minification of JavaScript and CSS assets is not done automatically by the server (in addition to compression). Recently I had the idea to take it even a step further: why do we have a build step for our JavaScript applications? Can't the server do this work at runtime? Turns out, it can! With that, we get all the benefits I described above.

## Server-Side Bundling of JavaScript Files

To test the idea, I created the [runtime-bundler](https://github.com/maoberlehner/runtime-bundler) package. It consists of two parts: a default `bundler` using the extremely fast [esbuild](https://github.com/evanw/esbuild) bundler under the hood and an express middleware.

```js
// server.js
const { runtimeBundlerMiddleware } = require('runtime-bundler');
const express = require('express');

const app = express();

app.use('/js', runtimeBundlerMiddleware({ assetDirectory: './public/' }));

// ...
```

Above you can see how to use the express middleware to automatically run `esbuild` on all files served from the `/js` path by the server.

Imagine the following example application.

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html>
  <head>
    <!-- ... -->
    <script src="/js/main.js" type="module"></script>
  </head>

  <body>
    <div class="counter">
      <button class="minus-one">-1</button>
      <strong>Count: <span class="count">0</span></strong>
      <button class="plus-one">+1</button>
    </div>
  </body>
</html>
```

```js
// public/js/main.js
import { makeCounter } from './counter.js';

makeCounter(document.querySelector('.counter'));
```

```js
// public/js/counter.js
export function makeCounter($el) {
  let $count = $el.querySelector('.count');
  let $plus = $el.querySelector('.plus-one');
  let $minus = $el.querySelector('.minus-one');

  let currentCount = parseInt($count.innerText.trim(), 10);
  let data = {
    get count() {
      return currentCount;
    },
    set count(value) {
      currentCount = value;
      $count.innerText = value;
    },
  };

  $plus.addEventListener('click', () => {
    data.count += 1;
  });
  $minus.addEventListener('click', () => {
    data.count -= 1;
  });
}
```

In the `public/index.html` file, we load `public/js/main.js`, and in there, we load `public/js/counter.js`. Thanks to modern JavaScript features, this works perfectly fine in all modern browsers without bundling. But there is one problem remaining: the waterfall. `counter.js` can only be loaded after `index.html` and then `main.js` is loaded. Imagine `counter.js` importing another dependency, and this dependency imports yet another dependency and so on.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2020-12-20/runtime-bunlder-before-after">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-12-20/runtime-bunlder-before-after"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2020-12-20/runtime-bunlder-before-after 2x"
        alt="Before and after comparison of the JavaScript Module loading waterfall."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-12-20/runtime-bunlder-before-after"
          alt="Before and after comparison of the JavaScript Module loading waterfall."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption">
    <small>Before and after comparison of the JavaScript Module loading waterfall</small>
  </p>
</div>

There are two ways to solve this: [Resource Hints](https://www.w3.org/TR/resource-hints/) and bundling. I also thought about automating the injection of preload Resource Hints, but ultimately, I concluded that bundling is still more straightforward.

It is important to note here that **the waterfall problem is not relevant during local development** because files load extremely fast from the hard disk. **During development, we can do without bundling just fine.**

Thanks to the `runtimeBundlerMiddleware` in `server.js`, we don't have to care about bundling. We can use modern JavaScript Module syntax and a static file server during development. When we deploy the application, **the webserver takes care of bundling.** This means developers don't have to deal with maintaining a complicated build toolchain. This can be done by specialized people who are responsible for maintaining the server setup.

## Pros and Cons of Runtime Bundling

Although this is an exciting concept that could be useful for certain projects, there are also some downsides.

**Pros**

- No dependencies have to be installed on dev machines.
- Set up the build process on a single machine / OS (the server).
- Instant deployments.

**Cons**

- Complexity is only moved (to the server) not removed.
- Convenience dev features like HMR not possible without installing dependencies on dev machines.
- Hosting is more complex because of the need to run Node.js.

Building large scale JavaScript applications without HMR does not seem feasible to me. We can use [Browsersync](https://browsersync.io/) instead, but 1. this means you need dependencies on your dev machine again anyway, and 2. it is not nearly as good as HMR.

<hr class="c-hr">
<div class="c-service-info">
  <h2>Do you like what you're reading?</h2>
  <p class="c-service-info__body">
    <a class="c-anchor" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">Follow me on Twitter for more</a>.
  </p>
</div>
<hr class="c-hr">

## Wrapping It Up

This concept is no panacea at all. Still, I think it is promising. Maybe we can reduce the complexity of setting up local dev environments for building JavaScript applications by outsourcing some of it to the server.
