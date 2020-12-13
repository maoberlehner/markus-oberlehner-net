+++
date = "2019-10-20T05:42:42+02:00"
title = "Popup Overlays with Vue Router and Portal Vue"
description = "Learn how to create popup dialogs that have a URL. Building accessible modal dialogs with Portal Vue and Vue Router."
intro = "If we like it or not, modal dialogs and overlays are a recurring pattern on many websites and apps. In this article, we take a look at how to implement popup overlays with Vue Router so that they have a URL. We attach great importance to making our solution accessible so all of our users can use it without frustration. Also, we want to keep it simple but still create a reusable solution..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_crop,f_auto,q_auto,w_1014/v1542158520/blog/2019-10-20/add-to-cart-modal"]
+++

If we like it or not, modal dialogs and overlays are a recurring pattern on many websites and apps. **In this article, we take a look at how to implement popup overlays with Vue Router so that they have a URL.**

We attach great importance to making our solution **accessible** so all of our users can use it without frustration. Also, we want to keep it simple but still create a **reusable** solution.

Reusable means that we want to be able to either use our overlay in a nested child route (which means it has a distinct URL) or use only Portal Vue. Using Portal Vue without nested routes can be beneficial if we don't want our overlay to have a URL. For example, a "Are you sure ... ?" modal dialog doesn't have a URL in most cases.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/popup-overlays-with-vue-router-and-portal-vue-12hf1?fontsize=14" title="Popup Overlays with Vue Router and Portal Vue" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

**Disclaimer:** there seems to be a bug with Vue Router on CodeSandbox. If you try to close the overlay from the Vue Router example, although the URL changes back, the modal does not close. If you run the application locally, it works.

## Minimum requirements

There are a few specifications our overlay must fulfill, which are best achieved using certain technologies.

1. Must be accessible (keyboard controls, screenreader friendly).
2. Can be controlled from everywhere in our application.
3. SRR is possible in certain scenarios.

To achieve point 2, we need to choose one of a few ways, which makes it possible to control Vue.js components from anywhere in our application. Partly I have already covered this in an earlier [article about Vuex alternatives](/blog/should-i-store-this-data-in-vuex/).

In this article, we combine **Portal Vue with nested child routes.** Unfortunately, as I discovered during writing this article, it seems to be very hard to achieve point 1 and 3 at the same time. **Portal Vue helps us with making our solution accessible but it also prevents us from making our popups SSR compatible.**

## The implementation

Because we want to create a very reusable popup overlay solution, **we split up the functionality into multiple components.**

### PopupBase

In the following example, you can see the generic base component which we can use for all of our specific implementations.

```html
<template>
  <div
    role="dialog"
    :aria-label="label"
    aria-modal="true"
    class="PopupWrap"
    :class="{ 'PopupWrap--centered': centered }"
  >
    <div
      class="PopupWrap__backdrop"
      @click="$emit('close')"
    >
      <slot name="backdrop"/>
    </div>
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'PopupWrap',
  props: {
    centered: {
      default: true,
      type: Boolean,
    },
    focusElement: {
      default: null,
      type: Object,
    },
    label: {
      required: true,
      type: String,
    },
  },
  mounted() {
    const close = (e) => {
      const ESC = 27;
      if (e.keyCode !== ESC) return;
      this.$emit('close');
    };
    // Close the modal when the
    // user presses the ESC key.
    document.addEventListener('keyup', close);
    this.$on('hook:destroyed', () => {
      document.removeEventListener('keyup', close);
    });

    // Activate the modal when the component is mounted.
    this.activate();
    this.$on('hook:destroyed', () => {
      // Deactivate when the component is destroyed.
      this.deactivate();
    });
  },
  methods: {
    activate() {
      // Save the current active element
      // so we can restore it when closing
      // the popup overlay.
      this.previousActiveElement = document.activeElement;

      // Prevent the background to be scrollable.
      this.disableScrolling();
      // Make it impossible to focus elements in
      // the background when using the TAB key.
      this.inert();
      // Focus the first focusable element in the dialog.
      this.focusFirstDescendant();
    },
    async deactivate() {
      this.enableScrolling();
      await this.inert(false);
      this.restoreFocus();
    },
    // Disable scrolling on all devices (including iOS).
    disableScrolling() {
      this.scrollPosition = window.pageYOffset;

      const $body = document.querySelector('body');
      $body.style.overflow = 'hidden';
      $body.style.position = 'fixed';
      $body.style.top = `-${this.scrollPosition}px`;
      $body.style.width = '100%';
    },
    enableScrolling() {
      const $body = document.querySelector('body');
      $body.style.removeProperty('overflow');
      $body.style.removeProperty('position');
      $body.style.removeProperty('top');
      $body.style.removeProperty('width');

      window.scrollTo(0, this.scrollPosition);
    },
    // Make all elements except the overlay inert.
    async inert(status = true) {
      await this.$nextTick();
      [...this.$root.$el.children].forEach((child) => {
        if (child === this.$el || child.contains(this.$el)) return;
        child.inert = status;
      });
    },
    focusFirstDescendant(element) {
      const focusable = this.$el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable[0] && focusable[0].focus) focusable[0].focus();
    },
    restoreFocus() {
      const element = this.focusElement || this.previousActiveElement;

      if (element && element.focus) element.focus();
    },
  },
};
</script>

<style>
.PopupWrap {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.PopupWrap--centered {
  display: flex;
  justify-content: center;
  align-items: center;
}

.PopupWrap__backdrop {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>
```

The code above contains a lot of boilerplate logic for creating accessible modal overlays.

### PopupRouterView

For popups which must have a distinct URL, we create a new helper component.

```html
<template>
  <Portal to="popup">
    <PopupBase
      :label="label"
      @close="$router.back()"
    >
      <slot name="backdrop" slot="backdrop"/>
      <slot/>
    </PopupBase>
  </Portal>
</template>

<script>
import PopupBase from './PopupBase.vue';

export default {
  name: 'PopupRouterView',
  props: {
    label: {
      required: true,
      type: String,
    },
  },
  components: {
    PopupBase,
  },
};
</script>
```

By using a `<Portal>`, we make sure to render our popup at the very end of the DOM tree of our application. **The unique thing about popups rendered as a nested child route is that we can close them by using `$router.back()`.** Other than that, this component is only a thin layer upon the `PopupBase` component.

### Router configuration

For our nested child route popup to render, we must set up our router configuration correctly.

```js
// src/router/index.js
import Vue from 'vue';
import VueRouter from 'vue-router';

import Product from '../components/Product.vue';
import ProductImagePopup from '../components/ProductImagePopup.vue';

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    {
      // In a real world application the path
      // would be something like `/product/:id`.
      path: '/',
      component: Product,
      children: [
        // Here we specify that the `ProductImagePopup`
        // component should be rendered as a nested
        // route of the `Product` component.
        {
          path: '/product/:id/image',
          component: ProductImagePopup,
        },
      ],
    },
  ],
});
```

After adding the child route in our router configuration file, we also have to add a `<RouterView>` reference inside of the main `Product` route component.

```html
<template>
  <div>
    <h1>{{ product.name }}</h1>
    <ul>
      <!-- Feature list -->
    </ul>
    <RouterLink :to="`/product/${product.id}/image`">
      Show preview image
    </RouterLink>
    <AddToCartButton/>
    <!-- The child route is rendered here. -->
    <RouterView/>
  </div>
</template>

<script>
import AddToCartButton from './AddToCartButton.vue';

export default {
  name: 'Product',
  components: {
    AddToCartButton,
  },
};
</script>
```

In this `Product` component, you can also see a `<AddToCartButton>` component, which renders a modal dialog.

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

### AddToCartButton

Next, you can see the code of the `AddToCartButton` component. With this component, it is possible to trigger a modal dialog to open. This modal dialog does not have a distinct URL but uses the same base components as the previous `PopupRouterView` component.

```html
<template>
  <button @click="showDialog = true">
    Add to cart
    <PopupModalDialog
      v-if="showDialog"
      label="Add to cart"
      @yes="addToCart"
      @no="showDialog = false"
      @close="showDialog = false"
    >
      Are you sure you want to add this product to your cart?
    </PopupModalDialog>
  </button>
</template>

<script>
import PopupModalDialog from './PopupModalDialog.vue';

export default {
  name: 'AddToCartButton',
  components: {
    PopupModalDialog,
  },
  data() {
    return {
      showDialog: false,
    };
  },
  methods: {
    addToCart() {
      // Do things...
      this.showDialog = false;
    },
  },
};
</script>
```

If you want to take a closer look at the code, you can do this by browsing the following CodeSandbox.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/popup-overlays-with-vue-router-and-portal-vue-12hf1?fontsize=14" title="Popup Overlays with Vue Router and Portal Vue" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
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

**This implementation is still far from perfect, especially when it comes to a11y and SSR.** I keep this article updated, the more I learn about this topic.

If you have suggestions to improve the CodeSandbox please fork it and [let me know on Twitter](https://twitter.com/MaOberlehner).

## References

- [Ramsay Lanier, Creating and Animating a Modal Component as a Child Route Using Vue](https://medium.com/@rmmmsy/creating-and-animating-a-modal-component-as-a-child-route-using-vue-41a275a51d0c)
- [Bernhard Wittmann, Handling Dialogs with Vue Router](https://dev.to/berniwittmann/handling-dialogs-with-vue-router-29ji)
- [Vue Forum, Vue Router 2.0 and Modals](https://forum.vuejs.org/t/vue-router-2-0-and-modals/898)
- [W3C, Modal Dialog Example](https://www.w3.org/TR/2019/NOTE-wai-aria-practices-1.1-20190814/examples/dialog-modal/dialog.html)
- [Heydon Pickering, Finding the first and last focusable elements](https://twitter.com/heydonworks/status/880773131287359488)
