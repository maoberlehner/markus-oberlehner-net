+++
date = "2019-10-27T07:44:44+02:00"
title = "Scrolling Shadows with Vue.js"
description = "Learn how to create a scroll shadow effect and how to build a reusable scrolling shadow Vue.js component."
intro = "Sometimes we find ourselves in a situation where the content of a particular area of our website or web app is too big to fit inside of our layout. In such cases, overflow: auto can come in handy. But usually, this comes with the downside that users with browsers which do not show scrollbars by default (macOS or most mobile devices) might not be aware that it is possible to scroll..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_crop,f_auto,q_auto,w_1014/v1542158521/blog/2019-10-27/vue-scroll-shadow"]
+++

Sometimes we find ourselves in a situation where the content of a particular area of our website or web app is too big to fit inside of our layout. In such cases, `overflow: auto` can come in handy. But usually, this comes with the downside that **users with browsers which do not show scrollbars by default (macOS or most mobile devices) might not be aware that it is possible to scroll.**

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/scrolling-shadows-with-vuejs-r6l5i?fontsize=14" title="Scrolling Shadows with Vue.js" style="width:100%; height:700px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

As you can see in the first demo above, it is not immediately apparent that one can scroll in the first example. But in the second example, it is instantly visible that there is more to see when scrolling.

In this article we explore how we can create a **Vue.js component to show scroll shadows when necessary.** Our main goal is to keep it simple and to create a generic solution that we can reuse in every situation where we need scroll shadows. Furthermore, we want everything to be as performant as possible, so we use Resize Observers to detect if it is necessary to show shadows after the component is resized.

## Scrolling shadow Vue.js component

Without further ado, let's take a look at the code for our component.

```html
<template>
  <div :class="$style.wrap">
    <div
      :class="$style['scroll-container']"
      :style="{ width, height }"
      ref="scrollContainer"
      @scroll.passive="toggleShadow"
    >
      <slot/>
      <span :class="[$style['shadow-top'], shadow.top && $style['is-active']]"/>
      <span :class="[$style['shadow-right'], shadow.right && $style['is-active']]"/>
      <span :class="[$style['shadow-bottom'], shadow.bottom && $style['is-active']]"/>
      <span :class="[$style['shadow-left'], shadow.left && $style['is-active']]"/>
    </div>
  </div>
</template>

<script>
function newResizeObserver(callback) {
  // Skip this feature for browsers which
  // do not support ResizeObserver.
  // https://caniuse.com/#search=resizeobserver
  if (typeof ResizeObserver === 'undefined') return;

  return new ResizeObserver(e => e.map(callback));
}

export default {
  name: 'ScrollShadow',
  data() {
    return {
      width: undefined,
      height: undefined,
      shadow: {
        top: false,
        right: false,
        bottom: false,
        left: false,
      },
    };
  },
  mounted() {
    // Check if shadows are necessary after the element is resized.
    const scrollContainerObserver = newResizeObserver(this.toggleShadow);
    if (scrollContainerObserver) {
      scrollContainerObserver.observe(this.$refs.scrollContainer);
      // Cleanup when the component is destroyed.
      this.$once('hook:destroyed', () => scrollContainerObserver.disconnect());
    }

    // Recalculate the container dimensions when the wrapper is resized.
    const wrapObserver = newResizeObserver(this.calcDimensions);
    if (wrapObserver) {
      wrapObserver.observe(this.$el);
      // Cleanup when the component is destroyed.
      this.$once('hook:destroyed', () => wrapObserver.disconnect());
    },
  },
  methods: {
    async calcDimensions() {
      // Reset dimensions for correctly recalculating parent dimensions.
      this.width = undefined;
      this.height = undefined;
      await this.$nextTick();

      this.width = `${this.$el.clientWidth}px`;
      this.height = `${this.$el.clientHeight}px`;
    },
    // Check if shadows are needed.
    toggleShadow() {
      const hasHorizontalScrollbar =
        this.$refs.scrollContainer.clientWidth <
        this.$refs.scrollContainer.scrollWidth;
      const hasVerticalScrollbar =
        this.$refs.scrollContainer.clientHeight <
        this.$refs.scrollContainer.scrollHeight;

      const scrolledFromLeft =
        this.$refs.scrollContainer.offsetWidth +
        this.$refs.scrollContainer.scrollLeft;
      const scrolledFromTop =
        this.$refs.scrollContainer.offsetHeight +
        this.$refs.scrollContainer.scrollTop;

      const scrolledToTop = this.$refs.scrollContainer.scrollTop === 0;
      const scrolledToRight =
        scrolledFromLeft >= this.$refs.scrollContainer.scrollWidth;
      const scrolledToBottom =
        scrolledFromTop >= this.$refs.scrollContainer.scrollHeight;
      const scrolledToLeft = this.$refs.scrollContainer.scrollLeft === 0;

      this.shadow.top = hasVerticalScrollbar && !scrolledToTop;
      this.shadow.right = hasHorizontalScrollbar && !scrolledToRight;
      this.shadow.bottom = hasVerticalScrollbar && !scrolledToBottom;
      this.shadow.left = hasHorizontalScrollbar && !scrolledToLeft;
    },
  },
};
</script>

<style lang="scss" module>
.wrap {
  overflow: hidden;
  position: relative;
}

.scroll-container {
  overflow: auto;
}

.shadow-top,
.shadow-right,
.shadow-bottom,
.shadow-left {
  position: absolute;
  border-radius: 6em;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.shadow-top,
.shadow-bottom {
  right: 0;
  left: 0;
  height: 1em;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  background-image: linear-gradient(rgba(#555, 0.1) 0%, rgba(#FFF, 0) 100%);
}

.shadow-top {
  top: 0;
}

.shadow-bottom {
  bottom: 0;
  transform: rotate(180deg);
}

.shadow-right,
.shadow-left {
  top: 0;
  bottom: 0;
  width: 1em;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  background-image: linear-gradient(90deg, rgba(#555, 0.1) 0%, rgba(#FFF, 0) 100%);
}

.shadow-right {
  right: 0;
  transform: rotate(180deg);
}

.shadow-left {
  left: 0;
}

.is-active {
  opacity: 1;
}
</style>
```

**One of the first things to notice is that we use the `.passive` modifier on the `@scroll` event.** This helps with keeping the performance as smooth as possible. We use `<span>` elements for our scroll shadows. By using `v-show` instead of `v-if` it is more performant to frequently hide and show shadows.

```html
<template>
  <div :class="$style.wrap">
    <div
      :class="$style['scroll-container']"
      :style="{ width, height }"
      ref="scrollContainer"
      @scroll.passive="toggleShadow"
    >
      <slot/>
      <span :class="[$style['shadow-top'], shadow.top && $style['is-active']]"/>
      <span :class="[$style['shadow-right'], shadow.right && $style['is-active']]"/>
      <span :class="[$style['shadow-bottom'], shadow.bottom && $style['is-active']]"/>
      <span :class="[$style['shadow-left'], shadow.left && $style['is-active']]"/>
    </div>
  </div>
</template>
```

Next, you can see a simple wrapper for conveniently creating a new Resize Observer without having to check manually if the user's browser supports this feature.

```js
// ...
function newResizeObserver(callback) {
  // Skip this feature for browsers which
  // do not support ResizeObserver.
  // https://caniuse.com/#search=resizeobserver
  if (typeof ResizeObserver === 'undefined') return;

  return new ResizeObserver(e => e.map(callback));
}
// ...
```

In the `mounted()` hook, we create two new Resize Observer instances to react whenever our wrapper or the container element resizes. **If we detect a resize, we check if a shadow should be rendered** and also if we have to resize the container element, so it is scrollable.

```js
  // ...
  mounted() {
    // Check if shadows are necessary after the element is resized.
    const scrollContainerObserver = newResizeObserver(this.toggleShadow);
    if (scrollContainerObserver) {
      scrollContainerObserver.observe(this.$refs.scrollContainer);
      // Cleanup when the component is destroyed.
      this.$once('hook:destroyed', () => scrollContainerObserver.disconnect());
    }

    // Recalculate the container dimensions when the wrapper is resized.
    const wrapObserver = newResizeObserver(this.calcDimensions);
    if (wrapObserver) {
      wrapObserver.observe(this.$el);
      // Cleanup when the component is destroyed.
      this.$once('hook:destroyed', () => wrapObserver.disconnect());
    },
  },
  // ...
```

The `calcDimensions()` method sets the dimensions of the container element to match the size of the wrapper element. This is necessary to make the scroll container scrollable.

```js
  // ...
  async calcDimensions() {
      // Reset dimensions for correctly recalculating parent dimensions.
      this.width = undefined;
      this.height = undefined;
      await this.$nextTick();

      this.width = `${this.$el.clientWidth}px`;
      this.height = `${this.$el.clientHeight}px`;
    },
  // ...
```

The heart of the component is the `toggleShadow()` method. **Based on the dimensions of the scroll container element, we determine if a scrollbar is visible. Depending on the scroll position, we decide if a scroll shadow should be visible or not.**

```js
    // ...
    toggleShadow() {
      const hasHorizontalScrollbar =
        this.$refs.scrollContainer.clientWidth <
        this.$refs.scrollContainer.scrollWidth;
      const hasVerticalScrollbar =
        this.$refs.scrollContainer.clientHeight <
        this.$refs.scrollContainer.scrollHeight;

      const scrolledFromLeft =
        this.$refs.scrollContainer.offsetWidth +
        this.$refs.scrollContainer.scrollLeft;
      const scrolledFromTop =
        this.$refs.scrollContainer.offsetHeight +
        this.$refs.scrollContainer.scrollTop;

      const scrolledToTop = this.$refs.scrollContainer.scrollTop === 0;
      const scrolledToRight =
        scrolledFromLeft >= this.$refs.scrollContainer.scrollWidth;
      const scrolledToBottom =
        scrolledFromTop >= this.$refs.scrollContainer.scrollHeight;
      const scrolledToLeft = this.$refs.scrollContainer.scrollLeft === 0;

      this.shadow.top = hasVerticalScrollbar && !scrolledToTop;
      this.shadow.right = hasHorizontalScrollbar && !scrolledToRight;
      this.shadow.bottom = hasVerticalScrollbar && !scrolledToBottom;
      this.shadow.left = hasHorizontalScrollbar && !scrolledToLeft;
    },
    // ...
```

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

### Using the scroll shadow component

Thanks to the concept of slots, using this component is pretty straightforward.

```html
<template>
  <!-- ... -->
  <ScrollShadow class="box">
    <p>Very tall or wide content...</p>
  </ScrollShadow>
  <!-- ... -->
</template>

<style>
// For vertical shadows you most likely
// want to limit the height of the box.
.box {
  max-height: 400px;
}
</style>
```

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/scrolling-shadows-with-vuejs-r6l5i?fontsize=14" title="Scrolling Shadows with Vue.js" style="width:100%; height:700px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

## Pure CSS solutions

Although there are [pure CSS solutions to solve this problem](http://lea.verou.me/2012/04/background-attachment-local/) out there, they all (as far as I've seen) fall short in more complex scenarios where the scrollable content has a background for example.

That is because those solutions use `background-attachment` to simulate this effect. But there is one problem: the shadow is in the background, behind the scrollable content, not on top of it.

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

## Wrapping it up

There might be situations where you can get away with using a pure CSS approach to achieve this effect. And if that's the case, you should go for it.

In more complex situations, you can use this Vue.js component to add the scroll shadow effect to your application.

## References

- [Lea Verou, Pure CSS scrolling shadows with background-attachment: local](http://lea.verou.me/2012/04/background-attachment-local/)
