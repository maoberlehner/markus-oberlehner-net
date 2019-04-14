+++
date = "2018-11-11T06:24:24+02:00"
title = "Building a Simple Content Slider with Vue.js"
description = "Learn how to build a reusable content slider component, for displaying tabbed content or an image slider, with Vue.js."
intro = "Today we'll take a look at how we can build a simple content slider with Vue.js. We'll use the renderless component technique to create a reusable component which we then use to build multiple versions of a content slider..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
+++

Today we'll take a look at how we can build a simple content slider with Vue.js. We'll use the renderless component technique to create a reusable component which we then use to build multiple versions of a content slider. Thanks to the flexibility of the renderless component pattern, **we'll be able to use one and the same component to power a simple content slider, a component for tabbed content and an image slider component.**

<div class="c-content__figure">
  <video
    src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1532157367/blog/2018-11-11/tabbed-content-and-image-slider.mp4"
    poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157367/blog/2018-11-11/tabbed-content-and-image-slider"
    muted
    autoplay
    loop
  ></video>
  <p class="c-content__caption">
    <small>The final result: tabbed content and an image slider</small>
  </p>
</div>

[The complete code for this article is available on GitHub](https://github.com/maoberlehner/building-a-simple-content-slider-with-vue) and you can [take a look at a live demo hosted on Netlify](https://building-a-simple-content-slider-with-vue.netlify.com/).

## The renderless slider component

First of all let's build a renderless component that serves as a base for handling all the logic that is necessary to dynamically hide and show content.

```js
// src/components/SliderFrame.js
export default {
  data() {
    return {
      activeIndex: 0,
    };
  },
  computed: {
    slides() {
      // All slides must be children of the `SliderSlides` component.
      return this.$children
        .find(x => x.$options.name === 'SliderSlides').$children;
    },
    slidesCount() {
      return this.slides.length;
    },
    nextIndex() {
      const nextIndex = this.activeIndex + 1;

      return nextIndex <= this.slidesCount - 1 ? nextIndex : 0;
    },
    prevIndex() {
      const prevIndex = this.activeIndex - 1;

      return prevIndex >= 0 ? prevIndex : this.slidesCount - 1;
    },
  },
  mounted() {
    // Immediately activate the first slide.
    this.goToIndex(this.activeIndex);
  },
  methods: {
    goToIndex(index) {
      // Find out the direction we're moving.
      // This is useful for animations.
      const direction = index > this.activeIndex ? 'left' : 'right';
      // Call the `hide()` method on the currently
      // active `SliderSlide` component.
      this.slides[this.activeIndex].hide(direction);
      // Call the `show()` method on the `SliderSlide`
      // component with the correspondign index.
      this.slides[index].show(direction);
      this.activeIndex = index;
    },
    next() {
      this.goToIndex(this.nextIndex);
    },
    prev() {
      this.goToIndex(this.prevIndex);
    },
  },
  render() {
    return this.$scopedSlots.default({
      // Data
      activeIndex: this.activeIndex,
      // Methods
      goToIndex: this.goToIndex,
      next: this.next,
      prev: this.prev,
    });
  },
};
```

In the code block above, you can see the logic for hiding and showing certain slides. You might notice, that we're calling methods (`show()` and `hide()`) on child components (`$children`) of the component. Usually this is considered an anti pattern.

### Breaking the rules

You're not supposed to access the methods of child components directly. But rules are made to be broken. This doesn't mean you should break this (or other rules for that matter) all the time, but **if there is a good reason for breaking a certain rule, which outweighs the cons: go ahead.**

In this case the arguments against calling methods on child components from the parent, do not apply. Calling methods on a child component leads to tightly coupled components which usually is a bad thing, because you have to use those tightly coupled components in a certain way which might not be immediately obvious to those who use your code. **But in our case there is no problem with tight coupling because the components are tightly coupled by design** – a `SliderFrame` component is always used in combination with the `SliderSlides` and `SliderSlide` components.

## A simple content slider component

Now let's take a look at how we can use the `SliderFrame` component to build a simple content slider.

```html
<template>
  <div class="App o-container o-container--s o-vertical-spacing o-vertical-spacing--xl">
    <h1>Building a Simple Content Slider with Vue.js</h1>

    <section class="App__example o-vertical-spacing o-vertical-spacing--l">
      <h2>Basic Slider</h2>

      <SliderFrame>
        <div slot-scope="{ next, prev }">
          <SliderSlides>
            <SliderSlide class="o-vertical-spacing">
              <h3>Lorem Ipsum dolor</h3>
              <p>
                Lorem ipsum dolor sit amet, consetetur...
              </p>
            </SliderSlide>
            <SliderSlide class="o-vertical-spacing">
              <h3>Dolor Sit</h3>
              <p>
                Dolor sit amet, consetetur sadipscing...
              </p>
            </SliderSlide>
          </SliderSlides>

          <div class="App__basic-example-controls">
            <button @click="prev">
              &laquo; Prev
            </button>
            <button @click="next">
              Next &raquo;
            </button>
          </div>
        </div>
      </SliderFrame>
    </section>
  </div>
</template>

<script>
import SliderFrame from './components/SliderFrame';
import SliderSlide from './components/SliderSlide.vue';
import SliderSlides from './components/SliderSlides.vue';

export default {
  name: 'App',
  components: {
    SliderFrame,
    SliderSlide,
    SliderSlides,
  },
};
</script>
```

Above you can see, that we're using the `SliderFrame` component, which we've built in the previous step, in combination with a `SliderSlides` wrapper component and a `SliderSlide` component to build a simple content slider. In the following two code blocks you can see how to implement those two new components.

```html
<template>
  <div class="SliderSlides">
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'SliderSlides',
};
</script>

<style lang="scss">
.SliderSlides {
  position: relative;
}
</style>
```

```html
<template>
  <transition :name="transition">
    <div
      v-show="active"
      class="SliderSlide"
    >
      <slot/>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'SliderSlide',
  data() {
    return {
      active: false,
      transition: '',
    };
  },
  methods: {
    // Deactivate and hide the slide and
    // also activate the correct transition.
    hide(direction) {
      this.transition = `SliderSlide--transition-${direction}`;
      this.active = false;
    },
    // Activate and show the slide and
    // also activate the correct transition.
    show(direction) {
      this.transition = `SliderSlide--transition-${direction}`;
      this.active = true;
    },
  },
};
</script>

<style lang="scss">
.SliderSlide--transition-left-enter-active,
.SliderSlide--transition-left-leave-active,
.SliderSlide--transition-right-enter-active,
.SliderSlide--transition-right-leave-active {
  transition-duration: 0.5s;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
  overflow: hidden;
}

.SliderSlide--transition-left-leave-active,
.SliderSlide--transition-right-leave-active {
  top: 0;
  position: absolute;
}

.SliderSlide--transition-left-enter,
.SliderSlide--transition-right-leave-active {
  opacity: 0;
  transform: translate(2em, 0);
}

.SliderSlide--transition-left-leave-active,
.SliderSlide--transition-right-enter {
  opacity: 0;
  transform: translate(-2em, 0);
}
</style>
```

<div class="c-content__figure">
  <video
    data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1532157367/blog/2018-11-11/simple-content-slider.mp4"
    poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157367/blog/2018-11-11/simple-content-slider"
    controls
    muted
  ></video>
  <p class="c-content__caption">
    <small>A simple content slider</small>
  </p>
</div>

## Tabs component

Now that our first little content slider is working, let's take a look at how we can reuse the `SliderFrame` component to render tabbed content.

```html
<template>
  <div class="App o-container o-container--s o-vertical-spacing o-vertical-spacing--xl">
    <h1>Building a Simple Content Slider with Vue.js</h1>

    <!-- Basic Slider -->
    
    <section class="App__example o-vertical-spacing o-vertical-spacing--l">
      <h2>Tabs</h2>

      <SliderFrame>
        <div slot-scope="{ activeIndex, goToIndex }">
          <ul class="App__tabs-example-tabs">
            <li>
              <button
                @click="goToIndex(0)"
                :class="{ 'is-active': activeIndex === 0 }"
                class="App__tabs-example-tab"
              >
                Tab 1
              </button>
            </li>
            <li>
              <button
                @click="goToIndex(1)"
                :class="{ 'is-active': activeIndex === 1 }"
                class="App__tabs-example-tab"
              >
                Tab 2
              </button>
            </li>
            <li>
              <button
                @click="goToIndex(2)"
                :class="{ 'is-active': activeIndex === 2 }"
                class="App__tabs-example-tab"
              >
                Tab 3
              </button>
            </li>
          </ul>

          <div class="App__tabs-example-content">
            <SliderSlides>
              <SliderSlide class="o-vertical-spacing">
                <h3>Lorem Ipsum dolor</h3>
                <p>
                  Lorem ipsum dolor sit amet, consetetur...
                </p>
              </SliderSlide>
              <SliderSlide class="o-vertical-spacing">
                <h3>Dolor Sit</h3>
                <p>
                  Dolor sit amet, consetetur sadipscing...
                </p>
              </SliderSlide>
              <SliderSlide class="o-vertical-spacing">
                <h3>Consetetur</h3>
                <p>
                  Consetetur sadipscing elitr, sed...
                </p>
              </SliderSlide>
            </SliderSlides>
          </div>
        </div>
      </SliderFrame>
    </section>
  </div>
</template>

<script>
import SliderFrame from './components/SliderFrame';
import SliderSlide from './components/SliderSlide.vue';
import SliderSlides from './components/SliderSlides.vue';

export default {
  name: 'App',
  components: {
    SliderFrame,
    SliderSlide,
    SliderSlides,
  },
};
</script>

<style lang="scss">
// ...

.App__tabs-example-tabs {
  display: flex;
}

.App__tabs-example-tab {
  padding: setting-spacing(s) setting-spacing(l);
  border: 1px solid #999;
  border-bottom: none;
  background-color: #efefef;
  cursor: pointer;
  outline: none;

  &:hover,
  &:focus,
  &.is-active {
    background-color: #999;
  }

  :not(:first-child) > & {
    border-left: none;
  }
}

.App__tabs-example-content {
  padding: setting-spacing(m);
  border: 1px solid #999;
  overflow: hidden;
}
</style>
```

As you can see above, the basic structure of our tabbed content section is not so different from the simple content slider example. We've added new controls and applied some CSS to the markup, that's it.

<div class="c-content__figure">
  <video
    data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1532157367/blog/2018-11-11/tabbed-content.mp4"
    poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157367/blog/2018-11-11/tabbed-content"
    controls
    muted
  ></video>
  <p class="c-content__caption">
    <small>A tabbed content component</small>
  </p>
</div>

## Image slider component

Last but not least, we take a look at how we can build a simple image slider using the very same techniques as before. But this time, we'll create a new component which wraps the `SliderFrame` component in order to make it easier to reuse the image slider.

```html
<template>
  <SliderFrame>
    <div
      slot-scope="{ goToIndex, next, prev }"
      class="ImageSlider"
    >
      <SliderSlides>
        <SliderSlide
          v-for="slide in slides"
          :key="slide.image"
          class="ImageSlider__slide"
        >
          <img
            :src="slide.image"
            :alt="slide.headline"
            class="ImageSlider__image"
          >
          <h2 class="ImageSlider__headline">
            {{ slide.headline }}
          </h2>
        </SliderSlide>
      </SliderSlides>

      <button
        class="ImageSlider__direction ImageSlider__direction--prev"
        @click="prev"
      >
        &laquo; Prev
      </button>
      <button
        class="ImageSlider__direction ImageSlider__direction--next"
        @click="next"
      >
        Next &raquo;
      </button>

      <ol class="ImageSlider__dots">
        <li
          v-for="n in slides.length"
          :key="n"
        >
          <button @click="goToIndex(n - 1)">
            {{ n }}
          </button>
        </li>
      </ol>
    </div>
  </SliderFrame>
</template>

<script>
import SliderFrame from './SliderFrame';
import SliderSlide from './SliderSlide.vue';
import SliderSlides from './SliderSlides.vue';

export default {
  name: 'ImageSlider',
  components: {
    SliderFrame,
    SliderSlide,
    SliderSlides,
  },
  props: {
    slides: {
      default: () => [],
      type: Array,
    },
  },
};
</script>

<style lang="scss">
.ImageSlider {
  position: relative;
}

.ImageSlider__headline,
.ImageSlider__direction {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.ImageSlider__direction--prev {
  left: 0.5em;
}

.ImageSlider__direction--next {
  right: 0.5em;
}

.ImageSlider__slide,
.ImageSlider__image {
  width: 100%;
}

.ImageSlider__slide {
  &::before {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(#000, 0.2);
    content: '';
  }
}

.ImageSlider__headline {
  width: 100%;
  text-align: center;
  font-size: 2.5em;
  color: #fff;
  text-shadow: 0 0 0.75em rgba(#000, 0.4);
}

.ImageSlider__image {
  vertical-align: middle;
}

.ImageSlider__dots {
  position: absolute;
  right: 0;
  bottom: 0.5em;
  left: 0;
  display: flex;
  justify-content: center;
}
</style>
```

After setting up the `ImageSlider` component, we're able to use it in our `App` component.

```diff
         </div>
       </SliderFrame>
     </section>
+
+    <section class="App__example o-vertical-spacing o-vertical-spacing--l">
+      <h2>Image Slider</h2>
+
+      <ImageSlider :slides="imageSlides"/>
+    </section>
   </div>
 </template>
 
 <script>
+import ImageSlider from './components/ImageSlider';
 import SliderFrame from './components/SliderFrame';
 import SliderSlide from './components/SliderSlide.vue';
 import SliderSlides from './components/SliderSlides.vue';

 export default {
   name: 'App',
   components: {
+    ImageSlider,
     SliderFrame,
     SliderSlide,
     SliderSlides,
   },
+  data() {
+    return {
+      imageSlides: [
+        {
+          headline: 'Lorem Ipsum',
+          image: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=36540868671b0e7942ab946c0e44503d&auto=format&fit=crop&w=400&h=300&q=80',
+        },
+        {
+          headline: 'Dolor sit',
+          image: 'https://images.unsplash.com/photo-1483119624769-b1a73c256500?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjExMDk0fQ&s=1f605cd0d214c866787dc3c2924ba07f&auto=format&fit=crop&w=400&h=300&q=80',
+        },
+        {
+          headline: 'Lorem Dolor',
+          image: 'https://images.unsplash.com/photo-1517362302400-873b4e30f5c0?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=fbd75d3010ba4abe9a4e747b96f57c93&auto=format&fit=crop&w=400&h=300&q=80',
+        },
+        {
+          headline: 'Dolor Lorem sit',
+          image: 'https://images.unsplash.com/photo-1516750930166-ed88ab1adb61?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=65c8f6fcafaf68f5fa434b5f076780fd&auto=format&fit=crop&w=400&h=300&q=80',
+        },
+      ],
+    };
+  },
 };
 </script>
```

<div class="c-content__figure">
  <video
    data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1532157367/blog/2018-11-11/image-slider-component.mp4"
    poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157367/blog/2018-11-11/image-slider-component"
    controls
    muted
  ></video>
  <p class="c-content__caption">
    <small>A simple image slider component</small>
  </p>
</div>

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

I'm a huge fan of the renderless component pattern in Vue.js. As we've seen in this article, it makes it possible to reuse and combine small pieces of code to build very powerful components with ease. We've also seen that it might make sense to break the rules from time to time if there is a strong case for doing so.
