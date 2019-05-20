+++
date = "2019-05-05T08:45:45+02:00"
title = "The IoC Container Pattern with Vue.js"
description = "Learn how to apply the IoC container pattern to Vue.js applications using provide / inject, and what the ups and downs are when using this pattern with JavaScript."
intro = "In this article we will experiment with implementing the IoC container pattern in Vue.js. The IoC container pattern is very popular in other languages and frameworks, but not so much in the JavaScript world – we'll also take a look at why that might be so..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Front-End Architecture"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_white,f_auto,q_auto,w_1014,h_510/v1532158513/blog/2019-05-05/vue-service-container"]
+++

In this article we will experiment with implementing the IoC container pattern in Vue.js. The IoC container pattern is very popular in other languages and frameworks, but not so much in the JavaScript world – we'll also take a look at why that might be so. The implementation we'll build is inspired by [the IoC container solution in Laravel](https://laravel.com/docs/5.8/container).

In the first step **we'll build a rather simple service container, which imports all services of our application in one place.** Although this may work very well for applications with rather few services or very simple services, for large applications with a multitude of injected dependencies it might be better to load only those services that are actually needed to display the current view.

To solve this problem, **in the second part of the article we take a look at how we can load services on demand only when they are actually used.** For this we will use code splitting via dynamic imports, and thus load certain services on demand.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2019-05-05/vue-service-container">
      <img
        data-src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-05-05/vue-service-container"
        data-srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2019-05-05/vue-service-container 2x"
        alt="Vue.js service container pattern schema."
      >
      <noscript>
        <img
          src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-05-05/vue-service-container"
          alt="Vue.js service container pattern schema."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption">
    <small>Vue.js service container pattern schema</small>
  </p>
</div>

## Using a service container in Vue.js

Let's start with the specification of the application we want to build: We want to render a list of products and we also want to render a list of users of our app. So first we need two repositories for these two content types.

```js
// src/repositories/product.js
import axios from 'axios';

const endpoint = '/products';

export default {
  find(id) {
    return axios.get(endpoint, { params: { id } });
  },
  list() {
    return axios.get(endpoint);
  },
};
```

Above you can see a very straightforward example repository. We use `axios` to fetch either a single product with the `find()` method or a list of products via the `list()` method.

```js
// src/service-container.js
import productRepository from './repositories/product';
import userRepository from './repositories/user';

export default {
  productRepository,
  userRepository,
};
```

In this example you can see our service container. The service container is the place where you register all of your services. **This makes it very easy to swap out certain parts of your application later on.** The user repository looks pretty much the same as the product repository we've seen in the previous code snippet.

```js
// src/main.js
import Vue from 'vue';

import serviceContainer from './service-container';

import App from './App.vue';

new Vue({
  provide: serviceContainer,
  render: h => h(App),
}).$mount("#app");
```

In our `main.js` app entry point we import the service container and we use the `provide` property of our root Vue instance to provide it to every component of our application.

```html
<template>
  <ul>
    <li
      v-for="product in products"
      :key="product.id"
    >
      {{ product.title }}
    </li>
  </ul>
</template>

<script>
export default {
  name: 'ProductListing',
  inject: ['productRepository'],
  data() {
    return { products: [] };
  },
  async created() {
    this.products = await this.productRepository.list();
  },
};
</script>
```

In the `ProductListing.vue` component above we use `inject` to inject the `productRepository` provided by our service container. We now can use it everywhere in our component, even in the `<template>` part if we like.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/034pk6vl8n?module=%2Fsrc%2Fservice-container.js&view=editor" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

Although this works great and I think it is a nice pattern, there is one downside to this approach: it does not scale very well. Imagine you have a huge app with dozens of repositories and other services, which have a few hundred lines of code each. By using this approach, we always have to load all services, even if we use code splitting for our routes and each route may only require one or two of those services.

### Dynamically import services

We can make a few adaptions to our service container in order to dynamically load services only when they're actually needed.

```js
// src/service-container.js
const RepositoryInterface = {
  find() {},
  list() {},
};

function bind(repositoryName, Interface) {
  return {
    ...Object.keys(Interface).reduce((prev, method) => {
      const resolveableMethod = async (...args) => {
        const repository = await import(`./repositories/${repositoryName}`);
        return repository.default[method](...args);
      };
      return { ...prev, [method]: resolveableMethod };
    }, {}),
  };
}

export default {
  productRepository: bind('product', RepositoryInterface),
  userRepository: bind('user', RepositoryInterface),
};
```

As you can see above, we have added a new `bind()` helper function that takes an interface (which is an ordinary object with dummy methods for each method of our real repositories) and the name of the repository to be dynamically resolved, and **it returns an object with all the methods of the original repository, but wrapped in a way that the repository itself is dynamically imported the first time a method is called.**

We don't have to make any changes to the rest of our application because the public API remains unchanged. By using this pattern, only the services that are actually needed are loaded on the client. The only drawback is that we have to adhere to predefined interfaces, but I think that could also be seen as an advantage.

I have prepared a CodeSandbox to show you a live example of this approach, but unfortunately CodeSandbox does not seem to support dynamic imports (at least in my case). The following example was therefore modified to work on CodeSandbox, which made it necessary to still use static imports.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/kxqm109nvo?module=%2Fsrc%2Fservice-container.js&view=editor" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

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

### Dynamically import services when they are injected

In the above example we wait until the service is actually used before loading it. Although this is the most efficient way in terms of bandwidth, it might not be the most ideal solution in terms of perceived performance because we not only have to wait for the API request but also for the repository code to be loaded. By making some slight modifications to our code, we can make it possible to either load a service when it's actually used (like above) or immediately load it when it's injected in a component.

```diff
-function bind(repositoryName, Interface) {
+function bind(repositoryFactory, Interface) {
   return {
     ...Object.keys(Interface).reduce((prev, method) => {
       const resolveableMethod = async (...args) => {
-        const repository = await import(`./repositories/${repositoryName}`);
+        const repository = await repositoryFactory();
         return repository.default[method](...args);
       };
       return { ...prev, [method]: resolveableMethod };
     }, {}),
   };
 }

 export default {
-  productRepository: bind('product', RepositoryInterface),
+  get productRepository() {
+    // Delay loading until a method of the repository is called.
+    return bind(() => import('./repositories/product'), RepositoryInterface);
+  },
-  userRepository: bind('user', RepositoryInterface),
+  get userRepository() {
+    // Load the repository immediately when it's injected.
+    const userRepositoryPromise = import('./repositories/user');
+    return bind(() => userRepositoryPromise, RepositoryInterface);
+  },
 };
```

In the above example you can see that we bind the product repository in a way that it's still only loaded when one of its methods is actually called. The user repository on the other hand is now immediately loaded as soon as it's injected in at least one component. But it is **not** loaded as long as it's not injected anywhere – so we still only load it if it (might) be needed.

## What's all this good for?

That's a really good question. **Arguably the IoC container pattern is actually a lot less useful in a language like JavaScript.** Why is that? Because you don't need it for a lot of the benefits you gain from it in other languages like PHP. E.g. you can easily mock imported modules in JavaScript with tools like Jest. Additionally we can use the concept of higher order functions to pass dependencies via parameters to the function (or via `props` in Vue.js components).

How useful this pattern can be depends largely on the type of application(s) you build. **If you want to create highly reusable components that are not dependent on a particular instance of a service, this pattern can still be useful.** Imagine you want to deploy a component across multiple applications, but each application uses a different repository for fetching users (and they all share the same interface). Another use case would be if you reuse a component on multiple routes but you want to use a different repository (fetching data from different APIs) for each route - **you could inject different implementations of the repository for each view.**

### Slightly more convenient

Another benefit of this approach ist that injected properties are automatically available everywhere in your component, even in the `<template>` section. So you don’t have to assign the imported module to a property of your component to make it available in the `<template>` section.

```html
<template>
  <button @click="doSomethingService">
    Do something
  </button>
</template>

<script>
import doSomethingService from '../services/do-something-service';

export default {
  name: 'DoSomethingButton',
  created() {
    this.doSomethingService = doSomethingService;
  },
};
</script>
```

In the following code snippet you can see the same component using provide / inject and the service container pattern instead.

```html
<template>
  <button @click="doSomethingService">
    Do something
  </button>
</template>

<script>
export default {
  name: 'DoSomethingButton',
  inject: ['doSomethingService'],
};
</script>
```

### Why not use a plugin?

Another possibility would be to use plugins to make certain services globally available. Although this is also a valid approach, there are some disadvantages: First, normal plugins are not code splittable, but you could solve this with a similar approach as we did in the second example of our service container.

In addition, plugins are always global. With the provide / inject approach, **you can decide to provide the service container on a route level and have different service containers with different implementations of your services for each route.**

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

Although IoC might not be necessary for building scalable applications with JavaScript and Vue.js, it’s still an interesting pattern which can be pretty useful in certain situations.

## References

- [Nahidul Hasan, Laravel IoC Container: Why we need it and How it works](https://medium.com/@NahidulHasan/laravel-ioc-container-why-we-need-it-and-how-it-works-a603d4cef10f)
- [Lee Owen, Dependency Injection in JavaScript](https://medium.com/@fleeboy/dependency-injection-in-javascript-9db9ea6e4288)
- [Laravel, Service Container](https://laravel.com/docs/5.8/container)
