+++
date = "2018-06-10T10:15:15+02:00"
title = "Vue Router Page Transitions"
description = "Learn how to transition between pages with Vue Router and how to combine various animations like zoom, slide and fade."
intro = "In my last article we've explored how to use the powerful Vue.js transition component, to animate an element from zero height to auto height. Today we'll take a look at how we can utilize the transition component to create fancy transitions between different pages of a Vue Router powered Vue.js application..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
+++

In my last article we've explored how to use the powerful Vue.js transition component, to [animate an element from zero height to auto height](https://markus.oberlehner.net/blog/transition-to-height-auto-with-vue/). Today we'll take a look at how we can utilize the transition component to create fancy transitions between different pages of a Vue Router powered Vue.js application.

If you're curious about the result, you can [take a look at the final result hosted on Netlify](https://vue-router-page-transitions.netlify.com) or you can [checkout the full code on GitHub](https://github.com/maoberlehner/vue-router-page-transitions).

## Basic fade transition

Let's get started with the most basic transition effect: **fade out the current page and fade in the next page**.

<div class="c-content__figure">
  <div class="c-content__broad">
    <video src="/videos/2018-06-10/basic-vue-router-fade-transition.mp4" autoplay muted loop></video>
  </div>
  <p class="c-content__caption">
    <small>Basic fade transition between pages</small>
  </p>
</div>

```html
<template>
  <div class="App">
    <nav class="App__nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <main class="App__main">
      <transition
        name="fade"
        mode="out-in"
      >
        <router-view/>
      </transition>
    </main>
    <footer class="App__footer">
      &copy; Fancy Company
    </footer>
  </div>
</template>
```

Because the `<router-view>` is a regular component, we're able to use the `<transition>` component around it to attach transition effects to route changes. In the code snippet above, you can see that we give the transition the name `fade` and we set the `mode` property to `out-in`, so the current page is first faded out before the new page is faded in.

```scss
// src/App.vue

// ...

.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0
}

// ...
```

Next up we have to define our transition styles to make the fade transition work. Above you can see some code of the `<style>` section of our `src/App.vue` component. We could use the shorthand syntax of the `transition` property, but we'll enhance the transition in the next chapter.

## Advanced fade transition (with height)

Thanks to the amazing `<transition>` component, we've already achieved a basic fading page transition effect, but currently it doesn't look very smooth because the footer isn't adapting very well to the new height of the content section. **Let's fix this by not only transition the opacity of the router views but also their height**.

<div class="c-content__figure">
  <div class="c-content__broad">
    <video src="/videos/2018-06-10/advanced-vue-router-fade-transition-with-height.mp4" autoplay muted loop></video>
  </div>
  <p class="c-content__caption">
    <small>Advanced fade transition (with height) between pages</small>
  </p>
</div>

```diff
       <transition
         name="fade"
         mode="out-in"
+        @beforeLeave="beforeLeave"
+        @enter="enter"
+        @afterEnter="afterEnter"
       >
         <router-view/>
       </transition>
```

Because we have to get and set the height of the pages which are transitioned, we have to attach some JavaScript hooks to our `<transition>` component.

```js
// src/App.vue
export default {
  name: 'App',
  data() {
    return {
      prevHeight: 0,
    };
  },
  methods: {
    beforeLeave(element) {
      this.prevHeight = getComputedStyle(element).height;
    },
    enter(element) {
      const { height } = getComputedStyle(element);

      element.style.height = this.prevHeight;

      setTimeout(() => {
        element.style.height = height;
      });
    },
    afterEnter(element) {
      element.style.height = 'auto';
    },
  },
};
```

In the JavaScript code block above, you can see the three new methods which are triggered by our transition hooks. The `beforeLeave()` method gets the element of the current page as its only parameter, we can use this to get the height of the current page and save it for later usage.

Next we can see the `enter()` method which is responsible for actually triggering the transition of the height of the new page which we transition to. First we get the final height of the new page and save it in a `height` variable. Next we set the height of the new page to the height of the current page, this is our starting point for the transition. And finally we set the height of the new page to its original height back again. We do this inside a `setTimeout()` function to make sure the browser has triggered a paint after setting the height of the new page to the height of the current page, because otherwise we'd see no transition effect.

After the entrance transition of the new page has finished, the `afterEnter()` method is triggered and we set the height of the page back to `auto` to make sure its height is dynamic again, in case new content is rendered or the size of the browser window changes or something like that.

```diff
 .fade-enter-active,
 .fade-leave-active {
   transition-duration: 0.3s;
-  transition-property: opacity;
+  transition-property: height, opacity;
   transition-timing-function: ease;
+  overflow: hidden;
 }
```

In order to animate the change of the height, we have to add the `height` to the list of transition properties. Also we have to add `overflow: hidden` to make sure the height of the page is actually cut off and not visible until it has transitioned to its final height.

## Slide transition

So far so good, the combination of transitioning the opacity and the height of the pages, already looks pretty decent. But we still can do better and make an even more fancy page transition: **we can use a sliding effect to transition between pages**.

<div class="c-content__figure">
  <div class="c-content__broad">
    <video src="/videos/2018-06-10/vue-router-slide-transition.mp4" autoplay muted loop></video>
  </div>
  <p class="c-content__caption">
    <small>Slide transition between pages</small>
  </p>
</div>

The following code is loosely based on some code from [the official Vue Router documentation about route transitions](https://router.vuejs.org/guide/advanced/transitions.html#per-route-transition).

```diff
 import Vue from 'vue';
 import Router from 'vue-router';

 import Home from './views/Home.vue';
 import About from './views/About.vue';
+import AboutMore from './views/AboutMore.vue';

 Vue.use(Router);

 export default new Router({
   routes: [
     {
       path: '/',
       name: 'home',
       component: Home,
     },
     {
       path: '/about',
       name: 'about',
       component: About,
     },
+    {
+      path: '/about/more',
+      name: 'about-more',
+      component: AboutMore,
+      meta: { transitionName: 'slide' },
+    },
   ],
   mode: 'history',
 });
```

As you can see in the diff above, we add a new route for a [sub page](https://github.com/maoberlehner/vue-router-page-transitions/blob/master/src/views/AboutMore.vue) of the `About` page. Note that we define a `meta` property on that new route. We can use the `meta` property to define a property, in this case we named it `transitionName` (but you can name it however you want), which we can use to define the page transition we want to use for this page.

```diff
     </nav>
     <main class="App__main">
       <transition
-        name="fade"
+        :name="transitionName"
         mode="out-in"
         @beforeLeave="beforeLeave"
         @enter="enter"
```

Next we make the transitions `name` property dynamic by assigning it a variable instead of a string.

```diff
+const DEFAULT_TRANSITION = 'fade';
+
 export default {
   name: 'App',
   data() {
     return {
       prevHeight: 0,
+      transitionName: DEFAULT_TRANSITION,
     };
   },
+  created() {
+    this.$router.beforeEach((to, from, next) => {
+      let transitionName = to.meta.transitionName || from.meta.transitionName;
+
+      if (transitionName === 'slide') {
+        const toDepth = to.path.split('/').length;
+        const fromDepth = from.path.split('/').length;
+        transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left';
+      }
+
+      this.transitionName = transitionName || DEFAULT_TRANSITION;
+
+      next();
+    });
+  },
   methods: {
     beforeLeave(element) {
       this.prevHeight = getComputedStyle(element).height;
```

Now it gets a little bit more complicated. Because we want to use both, the fade transition we've made earlier and our new sliding transition in tandem, on a per route base, we have to implement some logic in order to do so.

At the top of the JavaScript code, we define a constant for our default transition, which should be `fade`. We assign this constant as the initial value of our new `transitionName` data property.

In the `created()` hook of the `App.vue` component, we use the `beforeEach()` router instance method, to run some code before every route change. If the route changes, the function we've defined here is triggered and we check if either the `to` page or the `from` page has a `transitionName` `meta` property, if so, we use this transition name. If the `transitionName` equals `slide` we check if we're either navigating deeper into the tree of pages (e.g. from `/about` to `/about/more`) or if we're navigating in the opposite direction. Depending on the direction in which the user is navigating we either want to show a sliding transition from left to right or right to left.

```scss
// src/App.vue

// ...

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition-duration: 0.5s;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
  overflow: hidden;
}

.slide-left-enter,
.slide-right-leave-active {
  opacity: 0;
  transform: translate(2em, 0);
}

.slide-left-leave-active,
.slide-right-enter {
  opacity: 0;
  transform: translate(-2em, 0);
}

// ...
```

Above you can see the CSS code necessary for the left to right and right to left transitions to work.

## Zoom transition

Ok, those sliding transitions are already pretty fancy but we can still make an even more fancy transition. **Let's build a zoom transition**.

<div class="c-content__figure">
  <div class="c-content__broad">
    <video src="/videos/2018-06-10/vue-router-zoom-transition.mp4" autoplay muted loop></video>
  </div>
  <p class="c-content__caption">
    <small>Zoom transition between pages</small>
  </p>
</div>

```diff
       component: AboutMore,
       meta: { transitionName: 'slide' },
     },
+    {
+      path: '/overlay',
+      name: 'overlay',
+      component: Overlay,
+      meta: { transitionName: 'zoom' },
+    },
   ],
   mode: 'history',
 });
```

A zoom transition is best suited for something like an overlay, so we add a new route for a [new overlay view](https://github.com/maoberlehner/vue-router-page-transitions/blob/master/src/views/Overlay.vue). And we set the `transitionName` `meta` property to `zoom`.

```diff
     <main class="App__main">
       <transition
         :name="transitionName"
-        mode="out-in"
+        :mode="transitionMode"
+        :enter-active-class="transitionEnterActiveClass"
         @beforeLeave="beforeLeave"
         @enter="enter"
         @afterEnter="afterEnter"
```

Because the zoom transition of an overlay behaves a little bit different than the other two transition we've built before, we have to change the `mode` and the `enter-active-class` properties to be dynamic.

```diff
 const DEFAULT_TRANSITION = 'fade';
+const DEFAULT_TRANSITION_MODE = 'out-in';

 export default {
   name: 'App',
   data() {
     return {
       prevHeight: 0,
       transitionName: DEFAULT_TRANSITION,
+      transitionMode: DEFAULT_TRANSITION_MODE,
+      transitionEnterActiveClass: '',
     };
   },
   created() {
     this.$router.beforeEach((to, from, next) => {
-      let transitionName = to.meta.transitionName || from.meta.transitionName;
+      let transitionName = to.meta.transitionName || from.meta.transitionName || DEFAULT_TRANSITION;
 
       if (transitionName === 'slide') {
         const toDepth = to.path.split('/').length;
         const fromDepth = from.path.split('/').length;
         transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left';
       }
 
-      this.transitionName = transitionName || DEFAULT_TRANSITION;
+      this.transitionMode = DEFAULT_TRANSITION_MODE;
+      this.transitionEnterActiveClass = `${transitionName}-enter-active`;
+
+      if (to.meta.transitionName === 'zoom') {
+        this.transitionMode = 'in-out';
+        this.transitionEnterActiveClass = 'zoom-enter-active';
+        // Disable scrolling in the background.
+        document.body.style.overflow = 'hidden';
+      }
+
+      if (from.meta.transitionName === 'zoom') {
+        this.transitionMode = null;
+        this.transitionEnterActiveClass = null;
+        // Enable scrolling again.
+        document.body.style.overflow = null;
+      }
+
+      this.transitionName = transitionName;
 
       next();
     });
```

There is a lot of new code in the JavaScript snippet above, let's walk through it. First we define a new `DEFAULT_TRANSITION_MODE` constant and set it to the value we've used previously directly in the template: `out-in`. In the router `beforeEach` hook, we now check if the `to` route or the `from` route have set their `transitionName` `meta` property to `zoom` and we change the transition properties accordingly if this is the case.

If the user navigates to a route with a `zoom` transition, we change the transition mode to `in-out` which means we first zoom in the overlay view and then we hide the current page. Because the current page is hidden behind the overlay page, we don't see this transition, which is exactly what we want.

In the case the user navigates away from the overlay page, we want to immediately show the new page the user is navigating to and then zoom out the overlay page, so the new page appears behind the overlay page. To make this possible, we reset the transition mode which means hiding the current and showing the new page happens at the same time and we also set the `enter-active-class` to `null` which means no class is applied which has the effect, that no transition is applied for showing the new page which means it appears immediately.

```scss
// src/App.vue

// ...

.zoom-enter-active,
.zoom-leave-active {
  animation-duration: 0.5s;
  animation-fill-mode: both;
  animation-name: zoom;
}

.zoom-leave-active {
  animation-direction: reverse;
}

@keyframes zoom {
  from {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }

  100% {
    opacity: 1;
  }
}

// ...
```

Above you can see the CSS code which makes the zoom animation happen.

<hr class="c-hr">
<div class="c-service-info">
  <h2>Do you like what you're reading?</h2>
  <p class="c-service-info__body">
    <a class="c-anchor" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">Follow me on Twitter for more</a>.
  </p>
</div>
<hr class="c-hr">

## Refactoring

Now everything works as we've imagined it to work but our code has become rather complex. In order to keep our `App.vue` component clean, we can refactor our code and move all of the transition logic into a separate component.

```diff
       <router-link to="/about">About</router-link>
     </nav>
     <main class="App__main">
-      <transition
-        :name="transitionName"
-        :mode="transitionMode"
-        :enter-active-class="transitionEnterActiveClass"
-        @beforeLeave="beforeLeave"
-        @enter="enter"
-        @afterEnter="afterEnter"
-      >
+      <transition-page>
         <router-view/>
-      </transition>
+      </transition-page>
     </main>
     <footer class="App__footer">
       &copy; Fancy Company
```

```diff
 </template>
 
 <script>
-const DEFAULT_TRANSITION = `fade`;
-const DEFAULT_TRANSITION_MODE = `out-in`;
+import TransitionPage from './transitions/TransitionPage.vue';
 
 export default {
   name: `App`,
-  data() {
-    return {
-      prevHeight: 0,
-      transitionName: DEFAULT_TRANSITION,
-      transitionMode: DEFAULT_TRANSITION_MODE,
-      transitionEnterActiveClass: ``,
-    };
-  },
-  created() {
-    this.$router.beforeEach((to, from, next) => {
-      let transitionName = to.meta.transitionName || from.meta.transitionName || DEFAULT_TRANSITION;
-
-      if (transitionName === `slide`) {
-        const toDepth = to.path.split(`/`).length;
-        const fromDepth = from.path.split(`/`).length;
-        transitionName = toDepth < fromDepth ? `slide-right` : `slide-left`;
-      }
-
-      this.transitionMode = DEFAULT_TRANSITION_MODE;
-      this.transitionEnterActiveClass = `${transitionName}-enter-active`;
-
-      if (to.meta.transitionName === `zoom`) {
-        this.transitionMode = `in-out`;
-        this.transitionEnterActiveClass = `zoom-enter-active`;
-        document.body.style.overflow = `hidden`;
-      }
-
-      if (from.meta.transitionName === `zoom`) {
-        this.transitionMode = null;
-        this.transitionEnterActiveClass = null;
-        document.body.style.overflow = null;
-      }
-
-      this.transitionName = transitionName;
-
-      next();
-    });
-  },
-  methods: {
-    beforeLeave(element) {
-      this.prevHeight = getComputedStyle(element).height;
-    },
-    enter(element) {
-      const { height } = getComputedStyle(element);
-
-      // eslint-disable-next-line no-param-reassign
-      element.style.height = this.prevHeight;
-
-      setTimeout(() => {
-        // eslint-disable-next-line no-param-reassign
-        element.style.height = height;
-      });
-    },
-    afterEnter(element) {
-      // eslint-disable-next-line no-param-reassign
-      element.style.height = `auto`;
-    },
+  components: {
+    TransitionPage,
   },
 };
 </script>
```

```diff
   }
 }
 
-.fade-enter-active,
-.fade-leave-active {
-  transition-duration: 0.3s;
-  transition-property: height, opacity;
-  transition-timing-function: ease;
-  overflow: hidden;
-}
-
-.fade-enter,
-.fade-leave-active {
-  opacity: 0
-}
-
-.slide-left-enter-active,
-.slide-left-leave-active,
-.slide-right-enter-active,
-.slide-right-leave-active {
-  transition-duration: 0.5s;
-  transition-property: height, opacity, transform;
-  transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
-  overflow: hidden;
-}
-
-.slide-left-enter,
-.slide-right-leave-active {
-  opacity: 0;
-  transform: translate(2em, 0);
-}
-
-.slide-left-leave-active,
-.slide-right-enter {
-  opacity: 0;
-  transform: translate(-2em, 0);
-}
-
-.zoom-enter-active,
-.zoom-leave-active {
-  animation-duration: 0.5s;
-  animation-fill-mode: both;
-  animation-name: zoom;
-}
-
-.zoom-leave-active {
-  animation-direction: reverse;
-}
-
-@keyframes zoom {
-  from {
-    opacity: 0;
-    transform: scale3d(0.3, 0.3, 0.3);
-  }
-
-  100% {
-    opacity: 1;
-  }
-}
-
 .App {
   max-width: 42em;
   margin-right: auto;
```

In the diff snippets above, you can see that we can remove all of the code related to our page transitions. Instead we add a new `TransitionPage` component you can see in the next code snippet.

```html
<template>
  <transition
    :name="transitionName"
    :mode="transitionMode"
    :enter-active-class="transitionEnterActiveClass"
    @beforeLeave="beforeLeave"
    @enter="enter"
    @afterEnter="afterEnter"
  >
    <slot/>
  </transition>
</template>

<script>
const DEFAULT_TRANSITION = 'fade';
const DEFAULT_TRANSITION_MODE = 'out-in';

export default {
  name: 'TransitionPage',
  data() {
    return {
      prevHeight: 0,
      transitionName: DEFAULT_TRANSITION,
      transitionMode: DEFAULT_TRANSITION_MODE,
      transitionEnterActiveClass: '',
    };
  },
  created() {
    this.$router.beforeEach((to, from, next) => {
      let transitionName = to.meta.transitionName || from.meta.transitionName || DEFAULT_TRANSITION;

      if (transitionName === 'slide') {
        const toDepth = to.path.split('/').length;
        const fromDepth = from.path.split('/').length;
        transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left';
      }

      this.transitionMode = DEFAULT_TRANSITION_MODE;
      this.transitionEnterActiveClass = `${transitionName}-enter-active`;

      if (to.meta.transitionName === 'zoom') {
        this.transitionMode = 'in-out';
        this.transitionEnterActiveClass = 'zoom-enter-active';
        document.body.style.overflow = 'hidden';
      }

      if (from.meta.transitionName === 'zoom') {
        this.transitionMode = null;
        this.transitionEnterActiveClass = null;
        document.body.style.overflow = null;
      }

      this.transitionName = transitionName;

      next();
    });
  },
  methods: {
    beforeLeave(element) {
      this.prevHeight = getComputedStyle(element).height;
    },
    enter(element) {
      const { height } = getComputedStyle(element);

      element.style.height = this.prevHeight;

      setTimeout(() => {
        element.style.height = height;
      });
    },
    afterEnter(element) {
      element.style.height = 'auto';
    },
  },
};
</script>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: height, opacity;
  transition-timing-function: ease;
  overflow: hidden;
}

.fade-enter,
.fade-leave-active {
  opacity: 0
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition-duration: 0.5s;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
  overflow: hidden;
}

.slide-left-enter,
.slide-right-leave-active {
  opacity: 0;
  transform: translate(2em, 0);
}

.slide-left-leave-active,
.slide-right-enter {
  opacity: 0;
  transform: translate(-2em, 0);
}

.zoom-enter-active,
.zoom-leave-active {
  animation-duration: 0.5s;
  animation-fill-mode: both;
  animation-name: zoom;
}

.zoom-leave-active {
  animation-direction: reverse;
}

@keyframes zoom {
  from {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }

  100% {
    opacity: 1;
  }
}
</style>
```

## Wrapping it up

Applying a simple transition to route changes in a Vue.js application is pretty straight forward. But things can become tricky very quickly if you want to combine multiple complex page transitions in one application.

The Vue.js transition component is very powerful out of the box and you can make your code a lot cleaner by wrapping it in your own custom transition component.
