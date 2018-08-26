+++
date = "2018-08-26T05:31:31+02:00"
title = "Implementing a Simple Middleware with Vue Router"
description = "Learn how to build a simple route Middleware for protecting routes from being accessed by unauthenticated users."
intro = "The concept of Middleware in frameworks like Laravel makes it fairly easy to do things like requiring an authenticated user for certain routes. Today we‘ll explore how we can implement a similar concept in the Vue.js world using the Vue Router..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
+++

The concept of Middleware in frameworks like Laravel makes it fairly easy to do things like requiring an authenticated user for certain routes. Today we‘ll explore how we can implement a similar concept in the Vue.js world using the Vue Router.

If you want to see the Middleware powered application in action, you can [view a demo hosted on Netlify](https://implementing-a-simple-middleware-with-vue-router.netlify.com/) and you can [checkout the full code on GitHub](https://github.com/maoberlehner/implementing-a-simple-middleware-with-vue-router).

## The Middleware functions

For our example application we create two Middleware functions. The `auth()` function will check if a JWT exists in the local storage and if not, will redirect the user to the login route. The `log()` Middleware function will simply log the name of the current route to the console, we’ll do this, mostly to demonstrate how we can combine two (or more) Middleware functions to run before a single route.

### Authentication Middleware

The authentication Middleware function is pretty straightforward. We check if an item named `jwt` exists in the clients local storage, if not, the user is redirected to the `login` route.

```js
// src/middleware/auth.js
export default function auth({ next, router }) {
  if (!localStorage.getItem('jwt')) {
    return router.push({ name: 'login' });
  }

  return next();
}
```

### Logging Middleware

The log Middleware is for demonstration purposes only. The only thing we're doing here, is, to log the name of the current route to the console.

```js
// src/middleware/log.js
export default function log({ next, to }) {
  console.log(to.name);

  return next();
}
```

## Running the Middleware before each route change

First of all, we have to associate the routes we want to be processed by Middleware with the Middleware functions. Let's update our `src/router.js` file to make it possible to use Middleware.

```diff
 import Vue from 'vue';
 import Router from 'vue-router';
 
+import auth from './middleware/auth';
+import log from './middleware/log';
+
 import Home from './views/Home.vue';
 import Login from './views/Login.vue';
 import User from './views/User.vue';

 Vue.use(Router);

 const router = new Router({
   routes: [
     {
       path: '/',
       name: 'home',
       component: Home,
+      meta: {
+        middleware: log,
+      },
     },
     {
       path: '/login',
       name: 'login',
       component: Login,
+      meta: {
+        middleware: log,
+      },
     },
     {
       path: '/user',
       name: 'user',
       component: User,
+      meta: {
+        // Hint: try to switch those two around to see
+        // how this affects execution of the callbacks.
+        middleware: [auth, log],
+      },
     },
   ],
   mode: 'history',
 });

 export default router;
```

In the code snippet above, you can see how to attach Middleware to certain routes.

Next we have to find a way to process the attached Middleware functions before the route changes. Luckily Vue Router provides us with the `beforeEach` hook, which we can use to run our Middleware.

```diff
       meta: {
         middleware: [auth, log],
       },
     },
   ],
   mode: 'history',
 });
 
+// Creates a `nextMiddleware()` function which not only
+// runs the default `next()` callback but also triggers
+// the subsequent Middleware function.
+function nextFactory(context, middleware, index) {
+  const subsequentMiddleware = middleware[index];
+  // If no subsequent Middleware exists,
+  // the default `next()` callback is returned.
+  if (!subsequentMiddleware) return context.next;
+
+  return (...parameters) => {
+    // Run the default Vue Router `next()` callback first.
+    context.next(...parameters);
+    // Than run the subsequent Middleware with a new
+    // `nextMiddleware()` callback.
+    const nextMiddleware = nextFactory(context, middleware, index + 1);
+    subsequentMiddleware({ ...context, next: nextMiddleware });
+  };
+}
+
+router.beforeEach((to, from, next) => {
+  if (to.meta.middleware) {
+    const middleware = Array.isArray(to.meta.middleware)
+      ? to.meta.middleware
+      : [to.meta.middleware];
+
+    const context = {
+      from,
+      next,
+      router,
+      to,
+    };
+    const nextMiddleware = nextFactory(context, middleware, 1);
+
+    return middleware[0]({ ...context, next: nextMiddleware });
+  }
+
+  return next();
+});
+
 export default router;
```

The `nextFactory()` function you can see above, is responsible for creating a new `nextMiddleware()` callback function, which is basically a wrapper around the default `next()` callback.

Next, in the `beforeEach` hook, you can see that we're looking for a `middleware` property in the `meta` object of the route which is currently processed. If the property is found, the Middleware function (or multiple functions, if an array is given) is executed with the `nextMiddleware()` callback as its third parameter. That way each Middleware can control if the next Middleware is executed or not.

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

As the title suggests, this is a very simple implementation. Depending on your use case, you might have to make some adjustments. You also might be interested in checking out existing packages like [vue-router-middleware](https://www.npmjs.com/package/vue-router-middleware) instead of rolling your own custom solution
