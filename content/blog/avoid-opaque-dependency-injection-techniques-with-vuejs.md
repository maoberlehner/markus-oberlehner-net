+++
date = "2020-09-20T08:27:27+02:00"
title = "Avoid Opaque Dependency Injection Techniques with Vue.js"
description = "Learn which dependency injection techniques to avoid when building Vue.js applications."
intro = "We use Dependency Injection to achieve loose coupling. But loose coupling and Dependency Injection can make it harder to understand how our code works. It can make it more challenging to determine where a particular dependency is coming from..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Front-End Architecture"]
images = ["/images/c_pad,b_white,f_auto,q_auto,w_1014,h_510/v1532158513/blog/2020-09-20/opaque-dependency-injection"]
+++

We use Dependency Injection to achieve loose coupling. But loose coupling and Dependency Injection can make it harder to understand how our code works. It can make it more challenging to determine where a particular dependency is coming from.

Especially in the Vue.js ecosystem, we have many techniques for injecting dependencies into our application that do this in an opaque way. This means it is not always transparent where a dependency is initialized and injected.

**Disclaimer:** I use the term "Dependency Injection" liberally for every technique that makes functions or objects available in certain parts of your codebase.

## Opaque and Transparent Dependency Injection Techniques in Vue.js

**Opaque techniques for Dependency Injection in Vue.js applications are Plugins, Mixins, and extending the `Vue.prototype`.** But one could also consider global CSS classes a form of injecting dependencies (styles, in this case) into our application's components.

In the case of Plugins, extending `Vue.prototype` and CSS classes, it all comes down to their global nature. Functions, objects, and styles injected that way are just there; you don't know where they're coming from, and on top of that, you can run into namespacing issues. You can counter some of their downfalls by following some strict conventions, like only allowing to inject plugins in a single place of your application, but still, it's not ideal to rely on conventions only.

```js
MyPlugin.install = (Vue, options) => {
  Vue.myGlobalMethod = () => {
    // some logic ...
  };

  Vue.mixin({
    methods: {
      myMixinMethod() {
        // some logic ...
      },
    },
  })

  Vue.prototype.$myMethod = () => {
    // some logic ...
  };
};
```

```js
// Globally registering/injecting components.
Vue.component('MyComponentName', { /* ... */ })
```

**Transparent techniques for Dependency Injection,** on the other hand, are using `provide/inject` or injecting dependencies via properties of components or functions.

When injecting dependencies via properties, it is 100% clear where dependencies are coming from. If you also want to make it 100% clear what dependencies a component expects, you can either use TypeScript or, if applicable, JavaScript classes.

```js
class User { /* ... */ }

export default {
  name: 'MyComponent',
  props: {
    // Make it transparent that this
    // component needs a `User` instance.
    user: {
      required: true,
      type: User,
    },
  },
  // ...
};
```

With `provide/inject`, it is a little bit more complicated. Suppose you use strings as identifiers for injecting provided functions or objects. In that case, you have the same problem as with plugins: namespacing issues, and you can't be sure where dependencies are coming from.

```js
export default {
  name: 'MyComponent',
  // Using a string identifier
  // can be problematic.
  inject: ['userService'],
  // ...
};
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

But there are two ways around that. You can either import the identifier from the provider itself or import the identifier from a service container file. However, the former variant has the downside of some coupling to a specific implementation of a dependency.

```js
import { inject } from 'vue';

// Some coupling because we rely on
// a specific service implementation.
import { UserServiceProviderSymbol } from '../services/user-service';

export default {
  name: 'MyComponent',
  setup() {
    const userService = inject(UserServiceProviderSymbol);
  },
};
```

```js
import { inject } from 'vue';

// 100% transparent decoupling by using a
// service container for wiring up dependencies.
import { UserServiceProviderSymbol } from '../service-container';

export default {
  name: 'MyComponent',
  setup() {
    const userService = inject(UserServiceProviderSymbol);
  },
};
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

## Wrapping It Up

Dependency Injection is an essential architectural pattern to decouple your components from functions that cause side effects or to make global state available to them. But if you do it wrong and it is opaque where specific dependencies are coming from, you will hurt your application's maintainability.
