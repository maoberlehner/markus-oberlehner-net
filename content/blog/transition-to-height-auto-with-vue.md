+++
date = "2018-06-03T07:14:14+02:00"
title = "Transition to Height Auto With Vue.js"
description = "Learn how to animate the height of an HTML element from height: 0px to height: auto with Vue.js transitions."
intro = "Every now and then, I end up in a situation where I need to animate an HTML element from `height: 0` to its natural height (`height: auto`). Based on my experience, I already know that there are only three ways of achieving this: transitioning from `max-height: 0` to `max-height: Xpx`, transitioning from `transform: scaleY(0)` to `transform: scaleY(1)` and JavaScript magic..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
+++

Every now and then, I end up in a situation where I need to animate an HTML element from `height: 0` to its natural height (`height: auto`). Based on my experience, I already know that there are only three ways of achieving this: transitioning from `max-height: 0` to `max-height: Xpx`, transitioning from `transform: scaleY(0)` to `transform: scaleY(1)` and JavaScript magic (you can [read about all three of them in this Stack Overflow thread](https://stackoverflow.com/questions/3508605/how-can-i-transition-height-0-to-height-auto-using-css)).

Although I already know about the possible solutions, because all three of those methods have their disadvantages, I tend to head over to Google doing some research to see if there now is a better way to do this. And after finding the same resources I've already found the last time I had this problem, I usually go with the `max-height` approach.

<div class="c-content__figure">
  <div class="c-content__broad">
    <video src="/videos/2018-06-03/transition-to-height-auto-with-vue.mp4" autoplay muted loop></video>
  </div>
  <p class="c-content__caption">
    <small>Transition the height of an element from 0 to auto</small>
  </p>
</div>

You can find a [live demo of the component we build in this article on Netlify](https://transition-to-height-auto-with-vue.netlify.com/) and you can also [checkout the complete code on GitHub](https://github.com/maoberlehner/transition-to-height-auto-with-vue).

## Why not use JavaScript?

In the past, I mostly worked on traditional server side rendered applications. In this context, using JavaScript for transitioning the height of an element, although all other transitions on the page are made of pure CSS, just felt wrong. But nowadays most projects I'm working on are powered by Vue.js, so using JavaScript for triggering and controlling transitions is almost inevitable. Also Vue.js provides us with the wonderful `<transition>` component which makes animating HTML elements a very pleasant experience.

So there are hardly any reasons not to use (at least a little bit of) JavaScript to animate elements when using Vue.js.

## Wrapping the core transition component

Because `<transition>` (almost) behaves like a regular component, it's also possible to compose a new component using the `<transition>` component as its root “element” (although the `<transition>` element does not render an HTML element).

```html
<template>
  <transition>
    <slot/>
  </transition>
</template>
```

As you can see in the example code snippet above it's possible to build a custom component which basically wraps the Vue.js core `<transition>` component. We'll use this concept to build our own `TransitionExpand` component which makes it possible to transition the height of an element from `0` to `auto`.

## A reusable height transition component

Let's start with the HTML template for our `TrasitionExpand` component. In order to being able to control the transition of our element from `height: 0` to `height: auto`, we need to attach some event listeners to the `<transition>` element.

```html
<template>
  <transition
    name="expand"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave"
  >
    <slot/>
  </transition>
</template>
```

### Calculating the auto height of an element

First of all, let's implement the `enter()` method which is triggered by the `enter` event of the `<transition>` instance.

```js
export default {
  name: 'TransitionExpand',
  methods: {
    enter(element) {
      const width = getComputedStyle(element).width;

      element.style.width = width;
      element.style.position = 'absolute';
      element.style.visibility = 'hidden';
      element.style.height = 'auto';

      const height = getComputedStyle(element).height;

      element.style.width = null;
      element.style.position = null;
      element.style.visibility = null;
      element.style.height = 0;

      // Force repaint to make sure the
      // animation is triggered correctly.
      getComputedStyle(element).height;

      // Trigger the animation.
      // We use `setTimeout` because we need
      // to make sure the browser has finished
      // painting after setting the `height`
      // to `0` in the line above.
      setTimeout(() => {
        element.style.height = height;
      });
    },
  },
};
```

You might wonder why we have to set style properties like `width`, `position` and `visibility` in order to get the `auto` height of the element, so let me explain it to you.

The element we want to animate starts out with a height of `0`, so if we use JavaScript to get its height, we'd get `0`. In order to get the height of the element it would have if it was `height: auto` we have to set its height to `auto`. But because this would affect other elements and because the element would be visible (at least for a short period of time) we have to position it `absolute` to prevent it having an effect on other elements and we have to set its `visibility` to `hidden` so it is invisible. And because positioning an element `absolute` means its dimensions are no longer defined by its parent, we have to get the `width` of the element before we set its `position` to `absolute` and then set the width explicitly so the element still has the same dimensions as it would have if it was not positioned `absolute`.

After we've retrieved the height of the element it would have if it was `height: auto`, we're able to use this value to start the animation. But before we can do this, we have to reset all the values we've set before. Because otherwise the browser does not repaint after setting the `height` the first two times, we need to set the final height in a `setTimeout()` function.

```css
.expand-enter-active,
.expand-leave-active {
  transition: height 1s ease-in-out;
  overflow: hidden;
}

.expand-enter,
.expand-leave-to {
  height: 0;
}
```

In the CSS code snippet above, you can see the basic styling we need in order to make our `height` transition work. Note that our CSS classes are prefixed with `expand` because we've set the `name` property on the `<transition>` element to `expand`.

### Animate back to 0 height and cleanup

Now it's already possible to use the `TransitionExpand` component to animate the height of an element from `0` to `auto`. But there are still two problems we have to solve.

```js
export default {
  name: 'TransitionExpand',
  methods: {
    enter(element) {
      // ...
    },
    afterEnter(element) {
      element.style.height = 'auto';
    },
    leave(element) {
      const height = getComputedStyle(element).height;
      
      element.style.height = height;

      // Force repaint to make sure the
      // animation is triggered correctly.
      getComputedStyle(element).height;

      setTimeout(() => {
        element.style.height = 0;
      });
    },
  },
};
```

The new `afterEnter()` method you can see above, is triggered as soon as the transition of the height is done. By setting the `height` to `auto` we make sure that the elements height is flexible in case its content is changed after the transition has finished.

The `leave()` method, which is triggered as soon as the element is hidden or removed from the DOM, retrieves the current height of the element and sets it explicitly in order to make it possible to animate back to `0`.

### Hardware acceleration

One thing you have to keep in mind, when you're animating the `height` of an element, are the performance implications. Changing the `height` of an element means, that the browser has to repaint all the elements which are affected by the dimensions of this element. Depending on the circumstances, this can lead to a jerky animation. You can try to optimize the performance by tricking the browser into using hardware acceleration. At least we can force the browser into optimizing the animation of the element itself.

```html
<style scoped>
* {
  will-change: height;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>
```

By using the `*` selector inside a `scoped` style block, and because our custom transition will always only have one root element, we're able to apply styles to the root element of whatever is passed into our component via its `<slot>`. Applying those styles should trigger the browser into trying to optimize the animation of the element as best as he can.

### Using the TransitionExpand component

Now that our component is ready, let's take a look at how we can use this component.

```html
<template>
  <div id="app">
    <div>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
      sed diam nonumy eirmod tempor invidunt ut labore et dolore.
    </div>
    <transition-expand>
      <div v-if="expanded">
        Magna aliquyam erat, sed diam voluptua. At vero eos et
        accusam et justo duo dolores et ea rebum. Stet clita.
      </div>
    </transition-expand>
    <button @click="expanded = !expanded">
      {{ expanded ? `Shrink` : `Expand` }}
    </button>
  </div>
</template>
```

In the template above, you can see the component in action. Every time the `<div>` inside the `<transition-expand>` block is added or removed from the DOM, our `TransitionExpand` component does its magic and the height is animated from `0` to `auto`.

#### Add an additional transition

Sometimes you might want to change the transition behavior or you want to add an additional transition to also animate the `opacity` of the element for example. Let's take a look at how we can achieve this.

```scss
// src/App.vue
.expand-enter-active,
.expand-leave-active {
  transition-property: opacity, height;
}

.expand-enter,
.expand-leave-to {
  opacity: 0;
}
```

In the CSS code snippet above, you can see how you can override certain style properties of the transition. You'd apply those styles inside of the component in which you're using the `<transition-expand>` component.

<hr class="c-hr">
<div class="c-service-info">
  <h2>Did you find this useful?</h2>
  <p class="c-service-info__body">
    <a class="c-anchor" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">Follow me on Twitter for more</a>.
  </p>
</div>
<hr class="c-hr">

## Making the component a functional component

As a little bonus, let's take a look at how we can transform our regular component into a functional component. Functional components are basically what functions are to classes in “regular” JavaScript (although Vue.js is basically regular JavaScript so you can think about regular components as Objects or Classes and functional components as Functions).

```diff
-<template>
-  <transition
-    name="expand"
-    @enter="enter"
-    @after-enter="afterEnter"
-    @leave="leave"
-  >
-    <slot/>
-  </transition>
-</template>
-
 <script>
 export default {
   name: 'TransitionExpand',
-  methods: {
-    afterEnter(element) {
-      element.style.height = 'auto';
-    },
-    enter(element) {
-      const width = getComputedStyle(element).width;
-      
-      element.style.width = width;
-      element.style.position = 'absolute';
-      element.style.visibility = 'hidden';
-      element.style.height = 'auto';
-      
-      const height = getComputedStyle(element).height;
+  functional: true,
+  render(createElement, context) {
+    const data = {
+      props: {
+        name: 'expand',
+      },
+      on: {
+        afterEnter(element) {
+          element.style.height = 'auto';
+        },
+        enter(element) {
+          const width = getComputedStyle(element).width;
+
+          element.style.width = width;
+          element.style.position = 'absolute';
+          element.style.visibility = 'hidden';
+          element.style.height = 'auto';
+
+          const height = getComputedStyle(element).height;
+
+          element.style.width = null;
+          element.style.position = null;
+          element.style.visibility = null;
+          element.style.height = 0;
+
+          // Force repaint to make sure the
+          // animation is triggered correctly.
+          getComputedStyle(element).height;
+
+          setTimeout(() => {
+            element.style.height = height;
+          });
+        },
+        leave(element) {
+          const height = getComputedStyle(element).height;
 
-      element.style.width = null;
-      element.style.position = null;
-      element.style.visibility = null;
-      element.style.height = 0;
+          element.style.height = height;
 
-      // Force repaint to make sure the
-      // animation is triggered correctly.
-      getComputedStyle(element).height;
-
-      setTimeout(() => {
-        element.style.height = height;
-      });
-    },
-    leave(element) {
-      const height = getComputedStyle(element).height;
-      
-      element.style.height = height;
+          // Force repaint to make sure the
+          // animation is triggered correctly.
+          getComputedStyle(element).height;
+
+          setTimeout(() => {
+            element.style.height = 0;
+          });
+        },
+      }
+    };
 
-      // Force repaint to make sure the
-      // animation is triggered correctly.
-      getComputedStyle(element).height;
-
-      setTimeout(() => {
-        element.style.height = 0;
-      });
-    },
+    return createElement('transition', data, context.children);
   },
 };
 </script>
```

## Conclusion

Thanks to the awesomeness of the Vue.js core `<transition>` component, making powerful custom transition components is very easy to do. By applying some JavaScript magic, it's even possible to solve the age-old problem of transitioning from `height: 0` to `height: auto` and thanks to the concept of components, we're able to reuse this logic anywhere in our application without having to know anything about the implementation.
