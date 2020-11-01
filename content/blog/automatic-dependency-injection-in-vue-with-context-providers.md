+++
date = "2020-11-01T08:15:15+02:00"
title = "Automatic Dependency Injection in Vue with Context Providers"
description = "Learn how to implement Automatic Dependency Injection in Vue.js with the Context Provider Pattern."
intro = "I'm kind of obsessed with Dependency Injection. But for a good reason. I believe that an essential factor when it comes to building maintainable, large-scale applications is to get Dependency Injection right..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:ED8936,f_auto,q_auto,w_1014,h_510/v1542158523/blog/2020-11-01/automatic-dependency-injection"]
+++

I'm kind of obsessed with Dependency Injection. But for a good reason. I believe that an essential factor when it comes to building maintainable, large-scale applications is to get Dependency Injection right. I'm not saying there is only one right way; I know for a fact that there are many ways. But it is crucial to find a way that fits the overall architecture of your application.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1542158523/blog/2020-11-01/automatic-dependency-injection">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1542158523/blog/2020-11-01/automatic-dependency-injection"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1542158523/blog/2020-11-01/automatic-dependency-injection 2x"
        alt="Automatic Dependency Injection via a Context Provider."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1542158523/blog/2020-11-01/automatic-dependency-injection"
          alt="Automatic Dependency Injection via a Context Provider."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption">
    <small>Automatic Dependency Injection via a Context Provider</small>
  </p>
</div>

With `provide/inject`, we always had a [powerful tool in Vue.js to develop patterns for globally injecting dependencies](https://markus.oberlehner.net/blog/dependency-injection-in-vue-applications/#provide-inject). But only with the improvements to Vue 3, I'm convinced that we will see widespread use of `provide/inject` in real-world Vue.js applications. In the last weeks, I already wrote about how we can use [the Context Provider Pattern in Vue.js](https://markus.oberlehner.net/blog/context-aware-props-in-vuejs-components/) and utilize this technique to help us [implement feature toggles](https://markus.oberlehner.net/blog/vuejs-feature-toggle-context-provider/). But only a few days ago, I realized that the Context Provider Pattern allows us to build the ultimate Dependency Injection system with Vue.js.

## Service Container Context Provider

For the first part of our solution, we create a Service Container Context Provider. This Context Provider is responsible for setting up all of our services and making them available to our application's components.

```js
// src/service-container.js
import { api } from './utils/api';
import { makeCommentService } from './services/comment';
import { makeUserService } from './services/user';

export const serviceContainer = {
  commentService: makeUserService({ api }),
  userService: makeUserService({ api }),
};
```

In this generic `service-container.js` file, we create all of our service instances. Services usually contain all the business logic of our application. Typically they are responsible for fetching data and sending data to an API but depending on the type of our application; they can do anything business logic related.

```js
// src/composables/service-container.js
import { provide, inject } from 'vue';

import { serviceContainer } from '../service-container';

export const ServiceContainerProviderSymbol = Symbol('Service container provider identifier');

export function useServiceContainerProvider() {
  provide(ServiceContainerProviderSymbol, serviceContainer);
}

export function useServiceContainerContext() {
  return inject(ServiceContainerProviderSymbol);
}
```

The `useServiceContainerProvider()` composable provides the generic Service Container to the components of our application. Now every child component of a component using `useServiceContainerProvider()` can `useServiceContainerContext()` to inject the Service Container Context.

```html
<!-- src/components/App.vue -->
<template>
  <UserDashboard
    :user-id="currentUserId"
  />
</template>

<script>
import { useServiceContainerProvider } from '../composables/service-container';

import UserDashboard from './UserDashboard.vue';

export default {
  name: 'App',
  components: {
    UserDashboard,
  },
  setup() {
    // Provide the Service Container Context
    // to all child components of `App.vue`.
    useServiceContainerProvider();
    // ...
  },
};
</script>
```

```js
// src/components/UserDashboard.vue
import { ref } from 'vue';

import { useServiceContainerContext } from '../composables/service-container';

export default {
  name: 'UserDashboard',
  props: {
    userId: {
      required: true,
      type: String,
    },
  },
  setup(props) {
    // Manually injecting the `userService`.
    let { userService } = useServiceContainerContext();
    let user = ref(null);
    let getUser = async () => {
      user.value = await userService.find(props.userId);
    };
    
    return { getUser, user };
  },
};
```

In the above example, we can see how we can `useServiceContainerContext()` to manually inject the `userService` from the Service Container Context. But this is tedious; what we want is automatic injection.

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

## Automatic DI with Context-Aware Components

Instead of manually injecting the Service Container Context via the `useServiceContainerContext()` composable, we can use the Context-Aware Component Pattern to do this for us automatically.

```diff
 // src/components/UserDashboard.vue
 import { ref } from 'vue';

-import { useServiceContainerContext } from '../composables/service-container';
+import { ServiceContainerProviderSymbol } from '../composables/service-container';
+import { contextAwareComponentFactory } from '../utils/context-aware-component-factory';

-export default {
+export default contextAwareComponentFactory({
   name: 'UserDashboard',
   props: {
+    userService: {
+      context: ServiceContainerProviderSymbol,
+      required: true,
+      type: Object,
+    }
     userId: {
       required: true,
       type: String,
     },
   },
   setup(props) {
-    let { userService } = useServiceContainerContext();
     let user = ref(null);
     let getUser = async () => {
-      user.value = await userService.find(props.userId);
+      user.value = await props.userService.find(props.userId);
     };
    
     return { getUser, user };
   },
 };
```

Although the above approach is not necessarily shorter, changing our code to use the `contextAwareComponentFactory()` and getting the dependency from the component's props has a significant advantage. The component is now explicitly telling its consumers that it requires a `userService` property. This means that developers immediately know that they either have to pass a `userService` prop manually or wrap the component in a Service Container Context. Furthermore, this also helps with testing. Instead of providing a mock implementation of `userService` we can pass it as a prop.

If you're interested to learn more about how the `contextAwareComponentFactory()` works, you can read my [article about the Context-Aware Component Pattern](https://markus.oberlehner.net/blog/context-aware-props-in-vuejs-components/).

## Wrapping It Up

This approach to dependency injection is very similar to how popular backend frameworks like Laravel do it. I think it is the cleanest solution to this problem without the overhead of using a separate Dependency Injection framework. But I have to say that I didn't test this in a real-world application yet. There might be rough edges and maybe even unintended side-effects coming from wrapping Context-Aware Components with a functional component. But so far, it works great for the simple use cases I tested it with.
