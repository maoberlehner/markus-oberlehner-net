+++
date = "2018-08-19T05:08:08+02:00"
title = "Building a Simple Ken Burns Slider with Vue.js"
description = "Learn how to build a simple image slider with Vue.js and how to implement the Ken Burns transition effect with pure CSS."
intro = "Clients love them; most web developers hate them: sliders with fancy transition effects. Today we’ll build a straightforward implementation of an image slider featuring the famous Ken Burns transition effect..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
+++

Clients love them; most web developers hate them: sliders with fancy transition effects. Today we’ll build a straightforward implementation of an image slider featuring the famous Ken Burns transition effect (named after the American filmmaker [Kenneth Lauren Burns](https://en.wikipedia.org/wiki/Ken_Burns)).

<div class="c-content__figure">
  <div class="c-content__broad">
    <video
      src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1534649316/blog/2018-08-19/vue-ken-burns-slider.mp4"
      poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157369/blog/2018-08-19/vue-ken-burns-slider"
      controls
      muted
    ></video>
  </div>
  <p class="c-content__caption">
    <small>Vue.js powered slider with Ken Burns transition effect</small>
  </p>
</div>

You can find a [demo of the final result of our work hosted on Netlify](https://building-a-simple-ken-burns-slider-with-vue.netlify.com/), and you can check out [all the code necessary to run the demo on GitHub](https://github.com/maoberlehner/building-a-simple-ken-burns-slider-with-vue).

## Switching between multiple images

Before we add the fancy pan and zoom transition effect, let’s start with the basics. In this step, we build a Vue.js component, which makes it possible to switch between multiple images by clicking buttons.

```html
<template>
  <div class="AppSlider">
    <div
      :style="{ paddingBottom: `${aspectRatio}%` }"
      class="AppSlider__slides"
    >
      <img
        v-for="(image, index) in images"
        v-show="activeIndex === index"
        :key="index"
        :src="image"
        class="AppSlider__image"
        alt=""
      >
    </div>
    <div class="AppSlider__controls">
      <button
        class="AppSlider__control"
        @click="prev"
      >
        &laquo; prev
      </button>
      <button
        class="AppSlider__control"
        @click="next"
      >
        next &raquo;
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppSlider',
  props: {
    height: {
      default: 600,
      type: Number,
    },
    images: {
      default: () => [],
      type: Array,
    },
    width: {
      default: 1280,
      type: Number,
    },
  },
  data() {
    return {
      activeIndex: 0,
    };
  },
  computed: {
    aspectRatio() {
      return (this.height / this.width) * 100;
    },
  },
  methods: {
    goToIndex(index) {
      this.activeIndex = index;
    },
    next() {
      let nextIndex = this.activeIndex + 1;

      // Go to the first image if the active
      // image ist the last one.
      if (!this.images[nextIndex]) {
        nextIndex = 0;
      }

      this.goToIndex(nextIndex);
    },
    prev() {
      let nextIndex = this.activeIndex - 1;

      // Go to the last image if the active
      // image is the first one.
      if (!this.images[nextIndex]) {
        nextIndex = this.images.length - 1;
      }

      this.goToIndex(nextIndex);
    },
  },
};
</script>

<style lang="scss">
.AppSlider {
  &__slides {
    position: relative;
  }

  &__image {
    position: absolute;
    width: 100%;
  }

  &__controls {
    display: flex;
    justify-content: space-between;
  }

  // 1. Reset native button styles.
  &__control {
    padding: 0; // 1
    border: none; // 1
    background-color: transparent; // 1
    font-size: 1.25em;
  }
}
</style>
```

With the code above, we're able to switch between multiple images without any transition at all. This is already pretty useful and might be enough for certain use cases.

We use the `padding-bottom` trick to apply an aspect ratio to the slides container of our slider component. We have to do this, because we use absolute positioning on our images, in order to make it possible to apply a transition to them later.

### Automatically switch images

Next, we want our Vue.js slideshow component, to automatically show the next image after a certain amount of time.

```diff
       default: () => [],
       type: Array,
     },
+    interval: {
+      default: 2000,
+      type: Number,
+    },
     width: {
       default: 1280,
       type: Number,
     },
   },
   data() {
     return {
       activeIndex: 0,
+      time: this.interval,
     };
   },
   // ...
+  created() {
+    this.startInterval();
+  },
   methods: {
     goToIndex(index) {
       this.activeIndex = index;
+      this.time = this.interval;
     },
     // ...
+    startInterval() {
+      const precision = 100;
+      const clock = setInterval(() => {
+        this.time -= precision;
+        if (this.time <= 0) this.next();
+      }, precision);
+
+      // Clear the interval if the component
+      // is destroyed to prevent memory leaks.
+      this.$once('hook:destroyed', () => clearInterval(clock));
+    },
   },
 };
 </script>
```

Because nothing is more frustrating than a slider which automatically transitions to the next image, while the user is still looking at the current image, we add the functionality to pause the slideshow while the cursor hovers it. Keep in mind, though, that this only works on devices which do have a cursor, you might consider to add a pause button for touch devices.

```diff
     <div
       :style="{ paddingBottom: `${aspectRatio}%` }"
       class="AppSlider__slides"
+      @mouseenter="paused = true"
+      @mouseleave="paused = false"
     >
       <img
         v-for="(image, index) in images"
```

```diff
   data() {
     return {
       activeIndex: 0,
+      paused: false,
       time: this.interval,
     };
   },
   methods: {
     // ...
     startInterval() {
       const precision = 100;
       const clock = setInterval(() => {
-        this.time -= precision;
+        if (!this.paused) this.time -= precision;
         if (this.time <= 0) this.next();
       }, precision);
```

After applying those changes to the code of our component, automatically switching to the next image is prevented as soon as the user positions their cursor on the slider.

## Adding the Ken Burns transition effect

Now that we've implemented the core functionality of our very simple Vue.js image slider component, let's beef it up by adding the fancy Ken Burns transition effect.

```diff
 <template>
   <div class="AppSlider">
-    <div
+    <transition-group
+      :duration="1000"
       :style="{ paddingBottom: `${aspectRatio}%` }"
+      tag="div"
+      enter-active-class="AppSlider__enterActive"
+      enter-class="AppSlider__enter"
+      leave-active-class="AppSlider__leaveActive"
+      leave-to-class="AppSlider__leaveTo"
       class="AppSlider__slides"
       @mouseenter="paused = true"
       @mouseleave="paused = false"
     >
       <img
         v-for="(image, index) in images"
         v-show="activeIndex === index"
         :key="index"
         :src="image"
         class="AppSlider__image"
         alt=""
       >
-    </div>
+    </transition-group>
```

First of all we have to replace the `<div>` around the slider images with a `<transition-group>`. We explicitly define the `duration` property because we'll have two transitions with different durations (a short fading transition and a longer Ken Burns transition). `1000` ms is the duration of the simple fade effect. Additionally, we define custom classes for all the transition states we need.

```diff
       type: Array,
     },
     interval: {
-      default: 2000,
+      default: 10000,
       type: Number,
     },
     width: {
```

We have to use a longer interval for the Ken Burns transition to shine.

```diff
<style lang="scss">
 .AppSlider {
   &__slides {
     position: relative;
+    overflow: hidden;
   }
 
   &__image {
     position: absolute;
     width: 100%;
+
+    // Enable the effect only
+    // on large screen devices.
+    @media (min-width: 42em) {
+      animation: kenburns 8s;
+      animation-fill-mode: forwards;
+    }
+  }
+
+  &__enterActive,
+  &__leaveActive {
+    transition: opacity 1s;
+  }
+
+  &__enter,
+  &__leaveTo {
+    opacity: 0;
   }
 
   //...

+  @keyframes kenburns {
+    100% {
+      transform: scale3d(1.25, 1.25, 1.25) translate3d(-10%, -5%, 0);
+    }
+  }
 }
 </style>
```

The CSS code is where the magic happens. We have to apply `overflow: hidden` on the container element to prevent the animated images from breaking out of the container. Next we use a media query to make sure to only apply the Ken Burns effect on large screen devices, because it doesn't look good on smaller screens and it is also not very performant on lower end devices.

The `kenburns` keyframe animation itself, uses a combination of `scale3d` and `translate3d` to create the pan and zoom effect on the images.

## Touch swipe support

Of course, we also want users on touch devices to have a great experience with our slider. In order to enable touch swipe support to switch between images, we have to install the `vue2-touch-events` npm package.

```bash
npm install vue2-touch-events --save
```

Next up, we can make some small adjustments to the code of our app to enable the support for swiping left to see the next and swiping right to see the previous image. `vue2-touch-events` is a Vue.js plugin, so we have to install it in our `src/main.js` entry file first.

```diff
 import Vue from 'vue';
+import Vue2TouchEvents from 'vue2-touch-events';
 
 import App from './App.vue';
 
 Vue.config.productionTip = false;
 
+Vue.use(Vue2TouchEvents);
+
 new Vue({
   render: h => h(App),
 }).$mount('#app');
```

Next we can add two event listeners to the container element of our slider component to enable touch swipe support.

```diff
 <template>
   <div class="AppSlider">
     <transition-group
+      v-touch:swipe.right="next"
+      v-touch:swipe.left="prev"
       :duration="1000"
       :style="{ paddingBottom: `${aspectRatio}%` }"
       tag="div"
```

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

Although there already are a ton of very sophisticated slideshow implementations out there, Vue.js makes it very easy to build your own very quickly and with a very small overall footprint in terms of file size. Depending on your needs, a simple slider might be satisfactory for your use case. On the other hand, if you want to have a lot of different transition effects and if you have other, more advanced requirements, you should consider to use a more mature solution.
