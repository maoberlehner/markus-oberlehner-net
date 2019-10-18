+++
date = "2018-11-04T05:32:32+02:00"
title = "Skeleton Loading Animation with Vue.js"
description = "Learn how to build a pure CSS skeleton loading animation with a pure CSS shimmer animation."
intro = "Although there is some debate as to whether skeleton loading screens do enhance the perceived performance or not, there seems to be some evidence that they do work if they are done right. So today we'll take a look at how we can implement the skeleton loading animation pattern with Vue.js..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
+++

Although there is some debate as to whether skeleton loading screens do enhance the perceived performance [or not](https://www.viget.com/articles/a-bone-to-pick-with-skeleton-screens/), there seems to be some evidence that [they do work if they are done right](https://uxdesign.cc/what-you-should-know-about-skeleton-screens-a820c45a571a?fbclid=IwAR0pcp6tQg2gmUPjsnfRrpA3-l1qDQKjjtZbawagxBvRozM1vxTAF67NHQE#845d). **So today, we take a look at how we can implement the skeleton loading animation pattern with Vue.js.**

<div class="c-content__figure">
  <div class="c-content__broad">
    <video
      data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1532157367/blog/2018-11-04/skeleton-loading-with-shimmer.mp4"
      poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157367/blog/2018-11-04/skeleton-loading-with-shimmer"
      muted
      autoplay
      loop
    ></video>
  </div>
  <p class="c-content__caption">
    <small>The final result of our work: a skeleton loading screen with a shimmer animation</small>
  </p>
</div>

## The baseline

Let's take a look at our example application which we want to improve with a loading animation. As you can see in the following example, we're loading a list of blog posts, which can take up to a couple of seconds. While the blog posts are loaded, the only thing our users can see is a blank page.

<div class="c-content__figure">
  <div class="c-content__broad">
    <video
      data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1532157367/blog/2018-11-04/blank-page-loading.mp4"
      poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157367/blog/2018-11-04/blank-page-loading"
      muted
      autoplay
      loop
    ></video>
  </div>
  <p class="c-content__caption">
    <small>The baseline: a blank page is shown while loading new blog posts</small>
  </p>
</div>

In the following code block you can see the `BlogPost` component which is responsible for rendering the individual blog posts.

```html
<template>
  <div class="BlogPost o-media">
    <div class="o-media__figure">
      <slot name="figure"/>
    </div>
    <div class="o-media__body">
      <div class="o-vertical-spacing">
        <h3 class="BlogPost__headline">
          <slot name="headline"/>
        </h3>
        <p>
          <slot/>
        </p>
        <div class="BlogPost__meta">
          <slot name="meta"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BlogPost',
};
</script>

<style lang="scss">
.BlogPost {
  &__headline {
    font-size: 1.25em;
    font-weight: bold;
  }

  &__meta {
    font-size: 0.85em;
    color: #6b6b6b;
  }
}
</style>
```

## The skeleton component

At the end of the day the various parts of a skeleton loading screen are just grey boxes and lines. **We can build a rather simple Vue.js component which renders grey bars and boxes in various sizes.**

```html
<template>
  <span
    :style="{ height, width: computedWidth }"
    class="SkeletonBox"
  />
</template>

<script>
export default {
  name: 'SkeletonBox',
  props: {
    maxWidth: {
      // The default maxiumum width is 100%.
      default: 100,
      type: Number,
    },
    minWidth: {
      // Lines have a minimum width of 80%.
      default: 80,
      type: Number,
    },
    height: {
      // Make lines the same height as text.
      default: '1em',
      type: String,
    },
    width: {
      // Make it possible to define a fixed
      // width instead of using a random one.
      default: null,
      type: String,
    },
  },
  computed: {
    computedWidth() {
      // Either use the given fixed width or
      // a random width between the given min
      // and max values.
      return this.width || `${Math.floor((Math.random() * (this.maxWidth - this.minWidth)) + this.minWidth)}%`;
    },
  },
};
</script>

<style lang="scss">
.SkeletonBox {
  display: inline-block;
  vertical-align: middle;
  background-color: #DDDBDD;
}
</style>
```

In the code block above, you can see that we make it possible to configure the dimensions of the skeleton component via properties. By default, a skeleton component is as tall as a single line of text and its width is randomly determined between 80 and 100% of its parent container.

### Adding a shimmer animation

Most studies conducted to the efficiency of skeleton loading screens, come to the conclusion: **moderately slow animations from left to right work best to improve the perceived performance.** Let's update our skeleton component accordingly.

```diff
 <style lang="scss">
 .SkeletonBox {
   display: inline-block;
+  position: relative;
+  overflow: hidden;
   vertical-align: middle;
   background-color: #DDDBDD;
+
+  &::after {
+    position: absolute;
+    top: 0;
+    right: 0;
+    bottom: 0;
+    left: 0;
+    transform: translateX(-100%);
+    background-image: linear-gradient(
+      90deg,
+      rgba(#fff, 0) 0,
+      rgba(#fff, 0.2) 20%,
+      rgba(#fff, 0.5) 60%,
+      rgba(#fff, 0)
+    );
+    animation: shimmer 5s infinite;
+    content: '';
+  }
+
+  @keyframes shimmer {
+    100% {
+      transform: translateX(100%);
+    }
+  }
 }
 </style>
```

Above you can see, that we've added a subtle shimmer animation to our `SkeletonBox` component by using an `::after` pseudo element, with a gradient background image, wich we move from left to right.

## Combining the blog post and skeleton components 

Now we're ready to use the skeleton component inside of our blog post component to make the time it takes to load the articles appear shorter.

```diff
 <template>
   <div class="BlogPost o-media">
     <div class="o-media__figure">
-      <slot name="figure"/>
+      <skeleton-box
+        v-if="loading"
+        width="100px"
+        height="80px"
+      />
+      <slot
+        v-else
+        name="figure"
+      />
     </div>
     <div class="o-media__body">
       <div class="o-vertical-spacing">
         <h3 class="BlogPost__headline">
-          <slot name="headline"/>
+          <skeleton-box
+            v-if="loading"
+            :min-width="50"
+            :max-width="70"
+          />
+          <slot
+            v-else
+            name="headline"
+          />
         </h3>
         <p>
-          <slot/>
+          <template v-if="loading">
+            <skeleton-box/>
+            <skeleton-box/>
+            <skeleton-box/>
+            <skeleton-box/>
+          </template>
+          <slot v-else/>
         </p>
         <div class="BlogPost__meta">
-          <slot name="meta"/>
+          <skeleton-box
+            v-if="loading"
+            width="70px"
+          />
+          <slot
+            v-else
+            name="meta"
+          />
         </div>
       </div>
     </div>
   </div>
 </template>
 
 <script>
+import SkeletonBox from './SkeletonBox.vue';
+
 export default {
   name: 'BlogPost',
+  components: {
+    SkeletonBox,
+  },
+  props: {
+    loading: {
+      default: false,
+      type: Boolean,
+    },
+  },
 };
 </script>
```

Above you can see the changes necessary to update the `BlogPost` component to make use of the new `SkeletonBox` component. Combining the default view and the skeleton view keeps the code DRY and makes it easier to maintain your codebase. But you might not like the idea of loading the skeleton component every time you're using the `BlogPost` component. Depending on your use case you should consider to use a separate `BlogPostSkeleton` component instead.

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

## Using the blog post component

Finally, let's take a look at how we can use the `BlogPost` component.

```html
<template>
  <div class="App o-container o-container--s o-vertical-spacing o-vertical-spacing--xl">
    <h1>Skeleton Loading Animation with Vue.js</h1>

    <section class="App__example o-vertical-spacing o-vertical-spacing--l">
      <data-frame>
        <div slot-scope="{ data: blogPosts, error, loading }">
          <p
            v-if="error"
            class="error"
          >
            There was an error! Please try again.
          </p>
          <ul
            v-else
            class="o-vertical-spacing"
          >
            <template v-if="loading">
              <li
                v-for="n in 3"
                :key="n"
              >
                <blog-post loading/>
              </li>
            </template>
            <template v-else>
              <li
                v-for="blogPost in blogPosts"
                :key="blogPost.id"
              >
                <blog-post>
                  <img
                    slot="figure"
                    :src="blogPost.image"
                    alt=""
                  >
                  <template slot="headline">
                    {{ blogPost.title }}
                  </template>
                  {{ blogPost.snippet }}
                  <span slot="meta">
                    {{ blogPost.date }}
                  </span>
                </blog-post>
              </li>
            </template>
          </ul>
        </div>
      </data-frame>
    </section>
  </div>
</template>

<script>
import BlogPost from './components/BlogPost.vue';
import DataFrame from './components/DataFrame';

export default {
  name: 'App',
  components: {
    BlogPost,
    DataFrame,
  },
};
</script>
```

You can take a look at a [live demo of the final result hosted on Netlify](https://skeleton-loading-animation-with-vue.netlify.com/) and you can check out [the code on GitHub](https://github.com/maoberlehner/skeleton-loading-animation-with-vue).

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

**Oftentimes perceived performance is even more important than real performance.** Although your API queries might be very fast (assuming optimal conditions on the users end), a competitor might outperform you in perceived performance because they use techniques for making the load time feel faster.

Skeleton screens are not a panacea to all of your perceived performance needs but there seems to be some evidence, that, if done right, they can work pretty well in certain situations.
