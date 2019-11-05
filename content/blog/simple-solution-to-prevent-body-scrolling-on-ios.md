+++
date = "2019-10-30T16:06:06+02:00"
title = "Simple Solution to Prevent Body Scrolling on iOS"
description = "Learn how to prevent body scrolling on iOS and Android devices."
intro = "In my last article about building accessible popup overlays with Vue.js we used a simple technique to prevent scrolling in the background. I think that this little trick for preventing scrolling on the `<body>` element on all devices, including iOS 12 and below (finally, this was fixed in iOS 13 🎉) is worth taking a closer look..."
draft = false
categories = ["Development"]
tags = ["JavaScript"]
+++

In my last article about [building accessible popup overlays with Vue.js](/blog/popup-overlays-with-vue-router-and-portal-vue/) we used a simple technique to prevent scrolling in the background. I think that this little trick for preventing scrolling on the `<body>` element on all devices, including iOS 12 and below (finally, this was fixed in iOS 13 🎉) is worth taking a closer look.

Usually, we can use `overflow: hidden` on the `<body>` element to prevent scrolling. But unfortunately, that does not work on older versions of iOS.

In this article, we check out which possibilities we have to prevent scrolling in all browsers, including mobile devices like iPhones and Android-powered smartphones.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/prevent-scrolling-on-ios-9epvv?fontsize=14&module=%2Fsrc%2Futils%2Fscroll-lock.js" title="Simple Solution to Prevent Body Scrolling on iOS" style="width:100%; height:700px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

## Approaches

The most straightforward way for disabling scrolling on websites is to add `overflow: hidden` on the `<body>` tag. Depending on the situation, this might do the job well enough. If you don't have to support older versions of iOS, you can stop reading here.

```js
// src/utils/scroll-lock.js
const $body = document.querySelector('body');

export default {
  enable() {
    $body.style.overflow = 'hidden';
  },
  disable() {
    $body.style.removeProperty('overflow');
  }
};
```

Another way of how to deal with this problem is to use the [body-scroll-lock](https://www.npmjs.com/package/body-scroll-lock) package. This is definitely the most bulletproof way how you can do this. But it comes with the downside of being a pretty complicated solution, which adds 1.1 kB to your final bundle.

Next, we take a look at a not very elegant but simple solution to this problem.

### The simple solution for preventing scrolling on iOS

The final size this solution adds to our bundle is only 253 bytes, so significantly less than the `body-scroll-lock` package.

```js
// src/utils/scroll-lock.js
const $body = document.querySelector('body');
let scrollPosition = 0;

export default {
  enable() {
    scrollPosition = window.pageYOffset;
    $body.style.overflow = 'hidden';
    $body.style.position = 'fixed';
    $body.style.top = `-${scrollPosition}px`;
    $body.style.width = '100%';
  },
  disable() {
    $body.style.removeProperty('overflow');
    $body.style.removeProperty('position');
    $body.style.removeProperty('top');
    $body.style.removeProperty('width');
    window.scrollTo(0, scrollPosition);
  }
};
```

As you can see above, we use `position: fixed` in combination with storing the scroll position of the user so we can restore the scroll position after the fact.

#### Caveats

There are certainly some downsides to this approach. If you change the size of the browser window while the scroll lock is active, for example, the scroll position does not get restored correctly.

Another thing we have to consider is that setting CSS styles on the body triggers painting in the browser. I don’t think this is a big deal in most cases. But if you need to lock and unlock scrolling very frequently (every couple seconds), this might hurt the frame rate of your application.

But the most critical caveat you have to keep in mind is that this approach changes certain styles on the `<body>` element. If you apply custom styles for `overflow`, `position`, `top`, or `width`, your styles might break when the scroll lock is enabled.

Furthermore, there might be some edge cases I didn't think of, and the developers of `body-scroll-lock` have. But until this point, I got along pretty well using this approach on a couple of sites.

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

It’s unfortunate that for a long time, only using `overflow: hidden` to prevent scrolling did not work on iOS. But with only 18 lines of JavaScript, we can work around the problem.

In the end, you must decide if it is even necessary in your case to support older versions of iOS. Luckily, iOS users usually do update very quickly.

## Ressources

- [Will Po, Body scroll lock — making it work with everything](https://medium.com/jsdownunder/locking-body-scroll-for-all-devices-22def9615177)
- [WebKit Bugzilla, <body> with overflow:hidden CSS is scrollable on iOS](https://bugs.webkit.org/show_bug.cgi?id=153852)
