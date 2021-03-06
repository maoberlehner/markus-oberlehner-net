+++
date = "2019-03-24T05:24:24+02:00"
title = "Vue.js Error Handling with Renderless Components"
description = "Learn how to build renderless Vue.js components for catching errors in child components."
intro = "Reliable error handling is one of those things which can make the difference between a good application and a great application. In today's article we'll take a look at how we can build renderless components to help us capture errors in our Vue.js applications..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Front-End Architecture"]
images = ["/images/c_scale,f_auto,q_auto,w_1200,h_675/v1532158513/blog/2019-03-24/vue-error-wrapper-component"]
+++

Reliable error handling is one of those things which can make the difference between a good application and a great application. **In today's article we take a look at how we can build renderless components to help us capture errors in our Vue.js applications.** We build a generic error handling component which we can use to wrap other components to catch errors and notify the user that something went wrong. Furthermore, we explore how we can use our generic renderless error component to create a more specific component that displays a toast popup each time an error occurs.

If you're interested in the complete code featured in this article, you can [check out the CodeSandbox](https://codesandbox.io/s/1889llp297?fontsize=14&module=%2Fsrc%2FApp.vue) where you can also see a live demo.

## How to capture errors in Vue.js

Since version `2.5.0` Vue.js has support for [the errorCaptured hook](https://vuejs.org/v2/api/#errorCaptured) which can be used to capture errors of child components. Initially the `errorCaptured` hook was not able to capture errors in custom methods but this has been fixed with Vue.js `2.6.0`.

```html
<template>
  <div class="MyComponent">
    <ComponentWithErrors/>
  </div>
</template>

<script>
import ComponentWithErrors from './ComponentWithErrors.vue';

exports default {
  name: 'MyComponent',
  components: {
    ComponentWithErrors,
  },
  errorCaptured(error) {
    console.log('An error has occurred!', error);
  },
};
</script>
```

In the code snippet above you can see a very simple example of how the `errorCaptured` hook can be used to capture errors of child components. Keep in mind though that `errorCapture` does not really `capture` errors unless you return `false` in order to prevent the error from propagating further.

## Building an error handler component

Now that we know the basics of how the `errorCaptured` hook works let's build our own generic error handler component.

```js
// src/components/FrameError.js
export default {
  props: {
    capture: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      error: null,
    };
  },
  methods: {
    reset() {
      this.error = null;
      this.$emit('reset');
    },
  },
  errorCaptured(error) {
    this.error = error;
    this.$emit('error', error);
    // Optionally capture errors.
    if (this.capture) return false;
  },
  render() {
    return this.$scopedSlots.default({
      error: this.error,
      reset: this.reset,
    });
  },
};
```

The renderless component you can see above takes one property `capture` to determine if the `errorCaptured` hook should return `false` to stop error propagation. Additionally you can see that we set an `error` variable as soon as an error is captured and we're also emitting a corresponding error event. The `error` and a `reset()` method are passed as props to the child component via the default scoped slot.

```html
<template>
  <FrameError @error="showSnackbar">
    <div class="GenericDemo">
      <ErrorThrowerButton/>
      <UiSnackbarContainer
        ref="snackbar"
        :duration="6000"
      />
    </div>
  </FrameError>
</template>

<script>
import { UiSnackbarContainer } from 'keen-ui';

import ErrorThrowerButton from './ErrorThrowerButton';
import FrameError from './FrameError';

export default {
  components: {
    ErrorThrowerButton,
    FrameError,
    UiSnackbarContainer,
  },
  methods: {
    showSnackbar(error) {
      // Trigger a Keen UI snackbar to open.
      this.$refs.snackbar.createSnackbar({
        message: error.message
      });
    },
  },
};
</script>
```

Above you can see an example of how we can use the generic `FrameError` renderless component to trigger some action like showing a snackbar containing the error message.

<div>
  <hr class="c-hr">
  <div class="c-service-info">
    <h2>Do you want to learn more about building advanced Vue.js applications?</h2>
    <p class="c-service-info__body">
      Register for the Newsletter of my upcoming book: <a class="c-anchor" href="https://oberlehner.us20.list-manage.com/subscribe?u=8476a98c5640f6c7b5530ea57&id=8b26bf120b" data-event-category="link" data-event-action="click: newsletter" data-event-label="Newsletter (article content)">Advanced Vue.js Application Architecture</a>.
    </p>
  </div>
  <hr class="c-hr">
</div>

### Making a snackbar error capturing component

Let's take the code from above and create a more specific and easily reusable `CaptureErrorSnackbar` component.

```html
<template>
  <FrameError @error="showSnackbar">
    <div class="CaptureErrorSnackbar">
      <slot/>
      <UiSnackbarContainer ref="snackbar" :duration="6000"/>
    </div>
  </FrameError>
</template>

<script>
import { UiSnackbarContainer } from 'keen-ui';

import FrameError from './FrameError';

export default {
  components: {
    FrameError,
    UiSnackbarContainer,
  },
  methods: {
    showSnackbar(error) {
      this.$refs.snackbar.createSnackbar({
        message: error.message,
      });
    },
  },
};
</script>
```

As you can see above we replaced the direct usage of the child component `<ErrorThrowerButton/>` with a generic `<slot/>`. This makes it possible to reuse this component whenever you need to catch errors.

```html
<template>
  <div class="MyContainerComponent">
    <CaptureErrorSnackbar>
      <ErrorThrowerButton/>
    </CaptureErrorSnackbar>
  </div>
</template>
```

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/1889llp297?fontsize=14&module=%2Fsrc%2FApp.vue" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

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

## Wrapping it up

**When building modern, API powered single-page applications, it is important to plan for errors.** HTTP requests can fail and they occasionally will fail. **We always have to keep that in mind and build our code in a way that it fails gracefully.**

As developers we should always try to make our code as simple as possible. By utilizing the power of generic error handling wrapper components, we’re able to build resilient applications without having to repeat the same error handling logic again and again in different components.
	
## References

- [Dillon Chanis, Handling Errors in Vue with Error Boundaries](https://medium.com/@dillonchanis/handling-errors-in-vue-with-error-boundaries-91f6ead0093b)
- [Evan You, Vue 2.6 released](https://medium.com/the-vue-point/vue-2-6-released-66aa6c8e785e)
- [Giraud Florent, Vue 2.6.6 Release part1](https://dev.to/f3ltron/vue-266-release-part1-23b4)
