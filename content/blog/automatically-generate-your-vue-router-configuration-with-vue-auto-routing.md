+++
date = "2020-05-17T08:38:38+02:00"
title = "Automatically Generate your Vue Router Configuration with vue-auto-routing"
description = "Learn how to use the vue-auto-routing package to automatically generate the router configuration based on the directory structure."
intro = "When designing very large JavaScript applications, you have to be very careful about how you structure your dependencies. One particular example of this is the `router.js` configuration file..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:53F523,f_auto,q_auto,w_1014,h_510/v1542158521/blog/2020-05-17/vue-auto-routing"]
+++

When [designing very large JavaScript applications](https://medium.com/@cramforce/designing-very-large-javascript-applications-6e013a3291a3), you have to be very careful about how you structure your dependencies. One particular example of this is the `router.js` configuration file.

```js
// src/router.js
// ...

export default createRouter({
  routes: [
    {
      path: '/',
      name: 'dashboard',
      // Here, this `router.js` file depends
      // on the `Dashboard.vue` component and ...
      component: () => import('./pages/Dashboard.vue'),
    },
    {
      path: '/holiday-special-2017',
      name: 'holiday-special-2017',
      // ... all the other page components.
      component: () => import('./pages/HolidaySpecial2017.vue'),
    },
    // ... 100+ other pages.
  ],
});
```

As you can see in the example above, the `router.js` file depends on all of the page components of the application. If you want to delete the `HolidaySpecial2017.vue` component, you have to delete the import in the `router.js` file, and only then can you delete the `HolidaySpecial2017.vue` component itself.

This doesn't sound like a big deal, but remember that we are talking about [very large JavaScript applications](https://medium.com/@cramforce/designing-very-large-javascript-applications-6e013a3291a3). Over the years, many pages can accumulate that are no longer needed. Many different programmers work on the application, and nobody knows what all these pages are good for. Sooner or later, someone deletes a route, but not the corresponding component. And this is just the beginning; this is just one example of a problem that comes in many forms and variations.

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

## Automatically generate the router configuration based on the file structure

An elegant solution to this problem is to use the [`vue-auto-routing`](https://github.com/ktsn/vue-auto-routing) package or the [`vue-cli-plugin-auto-routing`](https://github.com/ktsn/vue-cli-plugin-auto-routing) plugin if you happen to use the Vue CLI (which you should). That way, the  routes in our `router.js` file are generated automatically. This means that as soon as we delete the `HolidaySpecial2017.vue` component, its route is gone.

```js
// src/router.js
import Vue from 'vue';
// Import generated routes.
import routes from 'vue-auto-routing';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  // Pass the generated routes into the routes option.
  routes,
});
```

By not having all of our page components listed as dependencies inside of our  `router.js` file anymore, we've made it very easy to delete obsolete pages.

## Caveats

Of course, this approach of decentralized route handling also has disadvantages. This is also why, for example, the following two JavaScript frameworks decided to take the opposite approach.

<blockquote id="redwoodjs">
  Redwood Router is designed to list all routes in a single file, without any nesting. We prefer this design, as it makes it very easy to track which routes map to which pages.
  <footer>
    <cite>
      <small>— <a href="https://redwoodjs.com/guides/redwood-router.html#redwood-router">RedwoodJS</a></small>
    </cite>
  </footer>
</blockquote>

<blockquote id="adonisjs">
  Many MVC framework also uses controllers as the hotspot for configuring routes and defining middleware using decorators or instance properties [...] however it has certain drawbacks. [...] A developer working on the codebase for the first time has to scan many controllers in order get a complete view of the application. [...] One should be able to see all the registered routes, controllers and middleware attached to them at a single place [...].
  <footer>
    <cite>
      <small>— <a href="https://preview.adonisjs.com/guides/http/controllers">AdonisJS</a></small>
    </cite>
  </footer>
</blockquote>

These are legitimate objections. However, in our case, the router structure is represented by the directory structure, which also makes it not too complicated to understand the composition of our application.

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

There is rarely a silver bullet, especially when it comes to building very large applications. By removing the need for a hardcoded dependency in a router file to a page component, we can make it a little easier to delete things. And making things easy to delete is the key to success when striving for a maintainable codebase.
