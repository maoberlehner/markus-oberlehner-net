+++
date = "2019-06-09T06:42:42+02:00"
title = "Build Decoupled Vue.js Applications with Hooks"
description = "Learn how to use a Hook system to decouple tracking logic from the rest of your business logic."
intro = "Recently, I was wondering how best to decouple the code needed to track certain form submissions (e.g. conversion tracking in Google Analytics or Matomo) from the business logic of the forms..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1532158513/blog/2019-06-09/with-hooks"]
+++

Recently, I was wondering how best to decouple the code needed to track certain form submissions (e.g. conversion tracking in Google Analytics or Matomo) from the business logic of the forms.

Hooks are often used to solve these types of problems. **Using hooks makes it possible to decouple our components responsible for handling business logic from the purely optional tracking logic,** which we can then keep in one place instead of scattering across all our components.

## The setup

Before we take a look at how this technique can decouple tracking from the rest of the application logic, we begin by setting up our hook system.

```js
// src/utils/hooks.js
const hooks = [];

export function addHook(hook) {
  hooks.push(hook);
}

export function runHooks(context) {
  return hooks
    // Only run hooks that fulfill their condition.
    .filter(hook => hook.condition(context))
    .map(hook => hook.callback(context));
}

export function withHooks(func, context) {
  return (...args) => {
    const result = func(...args);

    if (result.then) {
      result
        .then(payload => runHooks({ ...context, payload }))
        .catch(error => runHooks({ ...context, error }));
      return result;
    }

    runHooks({ ...context, payload: result });
    return result;
  };
}
```

The code above makes it possible to add Hook objects to a stack of Hooks which are triggered as soon as `runHooks()` is called. Each Hook is an object with a `condition` and a `callback`. The given `callback()` function is only called if the `condition()` function returns `true`. Both functions are passed the `context` of the current method which is called.

## Event tracking with Hooks

Now we're ready to use our Hook module to build a decoupled event tracking system. In the following code snippet you can see the code of the `ContactFormContainer` component which is responsible for injecting the dependencies for the `ContactForm` component.

```html
<template>
  <ContactForm/>
</template>

<script>
// src/components/ContactFormContainer.vue
import { post } from '../services/contact-form';
import { withHooks } from '../utils/hooks';

import ContactForm from './ContactForm.vue';

export default {
  components: {
    ContactForm,
  },
  provide: {
    // We pass an additional `id` context
    // property to make it easier to identify
    // calls of `post()` when running our Hooks.
    post: withHooks(post, { id: 'contact-form.post' }),
  },
};
</script>
```

If you're also interested in the code of the `ContactForm` component you can [take a look at it here](https://codesandbox.io/s/build-decoupled-vuejs-applications-with-hooks-8twcc?fontsize=14&module=%2Fsrc%2Fcomponents%2FContactForm.vue).

By wrapping the `post()` method `withHooks()` all Hooks are now executed every time the provided `post()` method is called in the `ContactForm` component.

### Register tracking event Hooks

There are currently no Hooks that could be executed as we have not added any Hooks yet. Let's change that by adding a new file where we can register all our tracking Hooks.

```js
// src/utils/tracking.js
import { addHook } from './hooks';

const CONTACT_FORM = 'contact-form.post';

addHook({
  condition({ error, id }) {
    return !error && id === CONTACT_FORM;
  },
  callback(context) {
    // This is where you'd trigger your Google
    // Analytics or Matomo tracking event.
    console.log('track contact form submission', context);
  }
});
```

Here you can see that we add a new Hook which is only fired if there is no error and the `id` context parameter matches the `CONTACT_FORM` id. In the `callback()` function we'd usually trigger an event in our tracking service of choice but because this is only a demo we simply trigger a `console.log()`.

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

### Prevent tracking in certain environments

You most likely do not want to send tracking events in your development environment or, for example, when running unit tests. Because we have everything in one place with this approach, we can easily prevent tracking in certain environments.

```js
// src/utils/tracking.js
import { addHook } from './hooks';

const CONTACT_FORM = 'contact-form.post';
const TRACKING_ENABLED = process.env.NODE_ENV !== 'development';

if (TRACKING_ENABLED) {
  addHook({
    condition({ error, id }) {
      return !error && id === CONTACT_FORM;
    },
    callback(context) {
      // This is where you'd trigger your Google
      // Analytics or Matomo tracking event.
      console.log('track contact form submission', context);
    }
  });
}
```

## Error tracking with Hooks

In the following example you can see how we can also use Hooks to implement a centralized error tracking system.

```js
// src/utils/tracking.js
// ...

addHook({
  condition({ id }) {
    return id === USER_CREATED;
  },
  callback(context) {
    if (context.error) {
      // This is where you'd trigger an event in
      // Sentry or some other error tracking service.
      return console.log('track error', context.error);
    }
    console.log('track new user', context);
  }
});
```

If the `context` contains an `error` property we don't track a Google Analytics or Matomo event but send an error event to our error tracking service instead.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/build-decoupled-vuejs-applications-with-hooks-8twcc?fontsize=14&module=%2Fsrc%2FApp.vue&view=editor" title="Build Decoupled Vue.js Applications with Hooks" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

## Click tracking with Hooks

Hooks are especially useful for intercepting API requests but we can basically use it for everything we want. **But keep in mind that this pattern is best with an all or nothing approach.** You might run Hooks for every API request and you might build a custom router link or button component to run Hooks every time a link or a button is clicked. **But I'd recommend you to not use `withHooks()` for individual cases.**

If you use `withHooks()` to trigger Hooks only if a certain button in you application is clicked, you might later remove the Hook which is listening for this button click which means it is now unnecessary to run Hooks when this specific button is clicked. You might later add a Hook listening for this button to be clicked again but other people on your team might have no idea that this is even an option. On the other hand **if you have a generic button component which always runs Hooks you're free to add or remove Hooks at any time.**

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

As with almost every advanced pattern in programming, hooks also have their downsides. First of all, they add another layer of complexity. **Adding tracking logic directly into the code of your components may not be the cleanest solution, but it is definitely the most straightforward.** Especially if your application is very small, using Hooks might only make your codebase more complicated instead of making it simpler.

**I strongly recommend that you first think about all the advantages and disadvantages before deciding whether you want to implement this pattern or not.** However, in the right circumstances, it can greatly improve the overall architecture of your Vue.js app.
