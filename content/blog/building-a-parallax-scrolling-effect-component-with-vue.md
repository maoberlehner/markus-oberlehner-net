+++
date = "2018-11-25T08:54:54+02:00"
title = "Building a Parallax Scrolling Effect Component with Vue.js"
description = "Learn how to build a parallax scrolling effect component and how to apply a parallax scrolling effect to images with Vue.js"
intro = "In this article you'll learn how to build a Vue.js component for handling parallax scrolling. We'll structure the components in a way, which makes them very flexible and highly reusable..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
+++

In this article you'll **learn how to build a Vue.js component for handling parallax scrolling.** We'll structure the components in a way, which makes them very flexible and highly reusable.

<div class="c-content__figure">
  <video
    src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1532157367/blog/2018-11-25/parallax-scrolling-with-vue.mp4"
    poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157367/blog/2018-11-25/parallax-scrolling-with-vue"
    muted
    autoplay
    loop
  ></video>
  <p class="c-content__caption">
    <small>The final result</small>
  </p>
</div>

You can [take a look at a live demo of the final result hosted on Netlify](https://building-a-parallax-scrolling-effect-component-with-vue.netlify.com/) and you can [check out the code on GitHub](https://github.com/maoberlehner/building-a-parallax-scrolling-effect-component-with-vue).

## The parallax scrolling wrapper component

Let's start with building a wrapper component for handling all the calculations necessary for the parallax effect.

```html
<template>
  <div class="ParallaxContainer">
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'ParallaxContainer',
  provide() {
    return {
      parallaxContainer: this.data,
    };
  },
  data() {
    return {
      data: {
        height: 0,
        scrollFactor: 0,
        width: 0,
      },
    };
  },
  mounted() {
    this.calcParallax();

    // We're using a `requestAnimationFrame()`
    // for optimal performance.
    const eventHandler = () => requestAnimationFrame(this.calcParallax);
    window.addEventListener('resize', eventHandler);
    window.addEventListener('scroll', eventHandler);
    // Remove the scroll hanlder when the
    // component is destroyed.
    this.$on(`hook:destroyed`, () => {
      window.removeEventListener('resize', eventHandler);
      window.removeEventListener('scroll', eventHandler);
    });
  },
  methods: {
    calcParallax() {
      const containerRect = this.$el.getBoundingClientRect();

      this.data.height = containerRect.height;
      this.data.width = containerRect.width;

      const viewportOffsetTop = containerRect.top;
      const viewportOffsetBottom = window.innerHeight - viewportOffsetTop;

      this.data.scrollFactor = viewportOffsetBottom / (window.innerHeight + this.data.height);
    },
  },
};
</script>

<style lang="scss">
.ParallaxContainer {
  overflow: hidden;
}
</style>
```

In the code block above, you can see the calculations necessary to make the parallax effect work. **We use provide / inject to inject data into child components of this component.** The `scrollFactor` is determined by the position of the container relative to the viewport.

As soon as the element becomes visible at the bottom of the screen, the `scrollFactor` is slightly above `0`. Exactly at the moment the container element disappears at the top of the screen, the `scrollFactor` is `1`. If the element is exactly in the middle of the viewport, the `scrollFactor` is `0.5`.

## The parallax scrolling child component

The `ParallaxElement` component is responsible for applying the parallax effect. Thanks to the injected values of the ParallaxContainer component, we're able to create the parallax effect using `translate3d` for optimal performance.

```html
<template>
  <div
    :style="{
      transform: `translate3d(0, ${offset}px, 0)`,
    }"
    class="ParallaxElement"
  >
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'ParallaxElement',
  inject: ['parallaxContainer'],
  props: {
    factor: {
      default: 0.25,
      type: Number,
    },
  },
  computed: {
    offset() {
      const { height, scrollFactor } = this.parallaxContainer;
      // The offset is relative to the height of
      // the element. This means, if the factor is
      // 0.5, the element is moved half its height
      // over the full scroll distance of the viewport.
      return scrollFactor * height * this.factor;
    },
  },
};
</script>
```

## Putting it all together

In the following code snippet, you can see how we can combine the `ParallaxContainer` and the `ParallaxElement` components.

```html
<template>
  <div class="App o-container o-container--s o-vertical-spacing o-vertical-spacing--xl">
    <h1>Building a Parallax Scrolling Effect Component with Vue.js</h1>

    <section class="App__example o-vertical-spacing o-vertical-spacing--l">
      <h2>Single element</h2>

      <ParallaxContainer class="App__example-single-element">
        <ParallaxElement
          :factor="0.25"
          class="App__example-element"
        >
          <h2>Lorem Ipsum</h2>
          <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</p>
        </ParallaxElement>
      </ParallaxContainer>
    </section>

    <section class="App__example o-vertical-spacing o-vertical-spacing--l">
      <h2>Multiple elements</h2>

      <ParallaxContainer class="App__example-double-element">
        <ParallaxElement
          :factor="0.25"
          class="App__example-element"
        >
          <h2>Lorem Ipsum</h2>
          <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</p>
        </ParallaxElement>
        <ParallaxElement
          :factor="0.5"
          class="App__example-element"
        >
          <h2>Sadipscing Ipsum</h2>
          <p>Sadipscing ipsum dolor sit amet, consetetur lorem elitr.</p>
        </ParallaxElement>
      </ParallaxContainer>
    </section>
  </div>
</template>

<script>
import ParallaxContainer from './components/ParallaxContainer.vue';
import ParallaxElement from './components/ParallaxElement.vue';

export default {
  name: 'App',
  components: {
    ParallaxContainer,
    ParallaxElement,
  },
};
</script>

<style lang="scss">
// ...

.App__example-single-element {
  height: 20em;
  background-color: lightblue;
}

.App__example-double-element {
  display: flex;
  height: 20em;
  background-color: lightgreen;
}

.App__example-element {
  padding: 1em;
  max-width: 12em;
}
</style>
```

## Applying the parallax effect to an image

**Next we can take a look at how we can use what we’ve built so far to create a parallax image component.** The special thing about images is, that we most likely want them to do their parallax thing without seeing a blank space or the image scrolling over the element next to it. Therefore we need a container around it.

```html
<template>
  <div
    :style="{
      height: `${compensatedHeight}px`,
    }"
    class="ParallaxImage"
  >
    <ParallaxElement
      :factor="compensatedFactor"
      :style="{
        paddingTop: `${aspectRatio * 100}%`,
      }"
      class="ParallaxImage__aspect-ratio-wrap"
    >
      <div
        ref="inside"
        class="ParallaxImage__aspect-ratio-inside"
      >
        <slot/>
      </div>
    </ParallaxElement>
  </div>
</template>

<script>
import ParallaxElement from './ParallaxElement.vue';

export default {
  name: 'ParallaxImage',
  components: {
    ParallaxElement,
  },
  props: {
    width: {
      required: true,
      type: Number,
    },
    height: {
      required: true,
      type: Number,
    },
    factor: {
      default: 0.25,
      type: Number,
    },
  },
  data() {
    return {
      innerHeight: 0,
    };
  },
  computed: {
    aspectRatio() {
      return this.height / this.width;
    },
    compensatedFactor() {
      // Because the parallax effect is relative
      // to the containers height and because we
      // shrink the containers height by the given
      // factor, we have to compensate this by
      // increasing the factor.
      return this.factor * 2;
    },
    compensatedHeight() {
      // We want the image to scroll inside of a
      // container to prevent the image scrolling
      // above its sourounding elements. The
      // container must be shrinked by the given
      // factor to make sure we don't have any
      // whitespace when scrolling.
      return this.innerHeight - (this.innerHeight * this.factor);
    },
  },
  mounted() {
    this.setInnerHeight();

    const eventHandler = () => requestAnimationFrame(this.setInnerHeight);
    window.addEventListener('resize', eventHandler);
    this.$on('hook:destroyed', () => {
      window.removeEventListener('resize', eventHandler);
    });
  },
  methods: {
    setInnerHeight() {
      this.innerHeight = this.$refs.inside.getBoundingClientRect().height;
    },
  },
};
</script>

<style lang="scss">
.ParallaxImage__aspect-ratio-wrap {
  position: relative;
  top: -100%;
  height: 0;
  overflow: hidden;
}

.ParallaxImage__aspect-ratio-inside {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
```

**Here you can see, that we're using the CSS aspect ratio hack to make it possible to determine the final size of the component instance even before the image is loaded.** We need the aspect ratio size of the image to calculate the wrapper container size (determined by the given `factor`) in order to display a nice parallax scrolling effect.

```diff
       </ParallaxContainer>
     </section>
 
+    <section class="App__example o-vertical-spacing o-vertical-spacing--l">
+      <h2>Image element</h2>
+
+      <ParallaxContainer>
+        <ParallaxImage
+          :width="432"
+          :height="289"
+          :factor="0.5"
+        >
+          <img
+            src="https://images.unsplash.com/photo-1516750930166-ed88ab1adb61?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=65c8f6fcafaf68f5fa434b5f076780fd&auto=format&fit=crop&w432&h=289&q=80"
+            alt="Road that leads to a mountain"
+          >
+        </ParallaxImage>
+      </ParallaxContainer>
+    </section>
   </div>
 </template>

 <script>
 import ParallaxContainer from './components/ParallaxContainer.vue';
 import ParallaxElement from './components/ParallaxElement.vue';
+import ParallaxImage from './components/ParallaxImage.vue';
 
 export default {
   name: 'App',
   components: {
     ParallaxContainer,
     ParallaxElement,
+    ParallaxImage,
   },
 };
 </script>
```

Above, you can see how to use the newly created `ParallaxImage` component. We must provide a `width` and a `height` property in order to make it possible to calculate the aspect ratio. The final size of the component is determined by the available width and can be larger or smaller than the given dimensions, they are only used to calculate the aspect ratio of the component.

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

Usually I'm not a huge fan of fancy scrolling effects. But if it's done right, some animations here and there can make for a very pleasant viewing experience.

By using a `requestAnimationFrame()` we make sure that the performance is good even though we bind event listeners on the `scroll` and resize events.
