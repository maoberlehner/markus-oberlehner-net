+++
date = "2017-12-17T16:22:14+02:00"
title = "Building a Modal Dialog with Vue.js and Vuex"
description = "Learn how to build a modal dialog component in Vue.js powered by Vuex using the TDD methodology."
intro = "Today we're building a modal dialog in Vue using Vuex. In my last article about exploratory TDD I wrote about the lack of tutorials demonstrating TDD in more complex, real world scenarios, so I decided to guide you through the whole process of building a modal dialog using the TDD methodology..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Vue"]
+++

Today we're building a modal dialog in Vue using Vuex. In my last article about [exploratory TDD](https://markus.oberlehner.net/blog/exploratory-tdd/) I wrote about the lack of tutorials demonstrating TDD in more complex, real world scenarios, so I decided to guide you through the whole process of building a modal dialog using the TDD methodology.

We're using [Jest](https://facebook.github.io/jest/) as our test runner of choice and the official [vue-test-utils](https://github.com/vuejs/vue-test-utils) package to drive our tests. You can find [all the code demonstrated in this article on GitHub](https://github.com/maoberlehner/building-a-modal-dialog-with-vue-and-vuex).

In order to keep this article as simple as possible, I won't go into much detail about the technique used to mock the Vuex store. I highly recommend you to read one of my previous articles about [how to mock a Vuex store in Jest](https://markus.oberlehner.net/blog/testing-vuex-powered-vue-components-with-jest/) before you continue reading the following article.

## Prerequisite and considerations

Before we start coding, let's think about some challenges and requirements of our implementation.

### Vuex

Because we want to strictly separate the state from the business logic of our application, we're going to use Vuex to control our modal dialog component.

### Reusability

Thanks to the global nature of Vuex, we're able to control our modal dialog from every component in our application. **But we also want to dynamically inject complex content into our modal dialog component**. In order to solve this problem, we will use dynamic imports to import components containing the content we want to show in the modal.

## Step 0: The Vuex store

Here you can see the code for the Vuex store implementation we're going to use for the following examples.

```js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const mutations = {
  showModal(state, componentName) {
    state.modalVisible = true;
    state.modalComponent = componentName;
  },
  hideModal(state) {
    state.modalVisible = false;
  },
};

export const state = {
  modalVisible: false,
  modalComponent: null,
};

export const store = new Vuex.Store({
  mutations,
  state,
});
```

## Step 1: The modal content

Because we want our modal dialog component to be as flexible as possible, we create a separate component to display the content inside the modal. The `ModalLogin` component will contain a simple user login form.

### Requirements

The modal content should contain a cancel button which closes the modal dialog immediately. Furthermore, after a (simulated) successful login, the modal should close.

### Code

To keep this article as short as possible, we'll keep this component rather simple. Let's write a test to check if the component closes the modal when clicking a cancel button.

```js
describe('ModalLogin', () => {
  // ...

  test('It should close the modal when clicking cancel.', () => {
    wrapper.find('.c-modalLogin__cancel').trigger('click');

    expect(storeMocks.mutations.hideModal).toBeCalled();
  });
});
```

In this example we're cheating a little bit. We're actually not checking if the modal is really closed but if the `hideModal()` mutation is called. But because we can safely assume that everything outside of the scope of the unit we're currently testing is working correctly, and because we're testing the rendering of the modal separately, checking if the `hideModal()` mutation is called is sufficient.

Let's create the `ModalLogin` component and make our first test succeed.

```html
<template>
  <div class="c-modalLogin">
    <div>
      <label for="name">User</label>
      <input name="User">
    </div>

    <div>
      <label for ="password">Password</label>
      <input name="password" type="password">
    </div>

    <button class="c-modalLogin__cancel" @click="hideModal">Cancel</button>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'ModalLogin',
  methods: {
    ...mapMutations([
      'hideModal',
    ]),
  },
};
</script>
```

Next we want to implement a (fake) login button. But let's write the test first.

```js
describe('ModalLogin', () => {
  // ...

  test('It should close the modal after successfully logging in.', () => {
    wrapper.find('.c-modalLogin__login').trigger('click');

    expect(storeMocks.mutations.hideModal).toBeCalled();
  });
});
```

Now we're ready to implement the login function to make our test pass.

```html
<template>
  <div class="c-modalLogin">
    <div>
      <label for="name">User</label>
      <input name="User">
    </div>

    <div>
      <label for ="password">Password</label>
      <input name="password" type="password">
    </div>

    <button class="c-modalLogin__cancel" @click="hideModal">Cancel</button>
    <button class="c-modalLogin__login" @click="login">Login</button>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'ModalLogin',
  methods: {
    ...mapMutations([
      'hideModal',
    ]),
    login() {
      // ...
      // Login logic would be here.
      // ...

      this.hideModal();
    },
  },
};
</script>
```

As you can see above, we've added a login button in the template and a new method `login()`. In a real world app you'd implement the login logic in this method.

## Step 2: The modal dialog

The `AppModal` component will be responsible for rendering content coming from components inside a modal box.

### Requirements

The component should be visible when the value `modalVisible` in the store is `true` and it should be hidden if it's `false`. When the user clicks on the overlay or presses the escape key on the keyboard, the modal should be closed. Also it should dynamically load and render the component specified by its name in the store as `modalComponent`.

### Code

We're using the Vuex store to handle the visibility of the modal component. For dynamically rendering the component which renders the content of the modal, we'll use a dynamic import.

#### Visibility handling

First of all, let's make sure the component is visible when it should be visible and hidden when it should be hidden.

```js
describe('AppModal', () => {
  // ...

  test('It should render an overlay and the content when active.', () => {
    storeMocks.state.modalVisible = true;
    // Re-render the component because we changed the value of
    // `modalVisible` in the store with the previous line of code.
    wrapper.update();

    expect(wrapper.contains('.c-appModal__overlay')).toBe(true);
    expect(wrapper.contains('.c-appModal__content')).toBe(true);
  });
});
```

Now we can write the necessary code to make the test pass.

```html
<template>
  <div class="c-appModal">
    <div class="c-appModal__overlay" v-if="visible"></div>
    <div class="c-appModal__content" v-if="visible"></div>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';

export default {
  name: 'AppModal',
  computed: {
    ...mapState({
      visible: 'modalVisible',
    }),
  },
};
</script>
```

In the code snippet above we're mapping the `modalVisible` value from the Vuex store to the computed properties of our component and use it to conditionally render the overlay and the content in the template.

Next we want to make sure, that the modal overlay and content is not visible when the modal is deactivated.

```js
describe('AppModal', () => {
  // ...

  test('It should not render an overlay and the content when inactive.', () => {
    storeMocks.state.modalVisible = false;
    wrapper.update();

    expect(wrapper.contains('.c-appModal__overlay')).toBe(false);
    expect(wrapper.contains('.c-appModal__content')).toBe(false);
  });
});
```

The code we've written previously, already is sufficient to pass this test too. We can move on to the next test: making sure the modal gets closed when the user clicks on the background.

```js
describe('AppModal', () => {
  // ...

  test('It should close the modal when the user clicks on the background.', () => {
    storeMocks.state.modalVisible = true;
    wrapper.update();

    wrapper.find('.c-appModal__content').trigger('click');

    expect(storeMocks.mutations.hideModal).toBeCalled();
  });
});
```

Again we're checking if the `hideModal()` mutation was called. As I've written before, this is sufficient because we can assume that the mutation is doing its job correctly.

```html
<template>
  <div class="c-appModal">
    <div class="c-appModal__overlay" v-if="visible"></div>
    <div class="c-appModal__content" v-if="visible" @click.self="hideModal"></div>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'AppModal',
  computed: {
    ...mapState({
      visible: 'modalVisible',
    }),
  },
  methods: {
    ...mapMutations(['hideModal']),
  },
};
</script>
```

We've added a new event listener on the content div for triggering the `hideModal()` mutation when clicking on the element itself. The mutation is mapped to the methods of the component with the Vuex `mapMutations()` helper function.

Next up we want to make sure that pressing the escape key is also closing the modal dialog.

```js
describe('AppModal', () => {
  // ...

  test('It should close the modal when the user presses the escape key.', () => {
    storeMocks.state.modalVisible = true;
    wrapper.update();

    wrapper.trigger('keydown.esc');

    expect(storeMocks.mutations.hideModal).toBeCalled();
  });
});
```

After running our tests and see them fail, we're ready to implement the functionality.

```html
<template>
  <div class="c-appModal" @keydown.esc="hideModal">
    <div class="c-appModal__overlay" v-if="visible"></div>
    <div class="c-appModal__content" v-if="visible" @click.self="hideModal"></div>
  </div>
</template>
```

The only thing we have to change is adding a `keydown` event listener to the components root element.

#### Dynamically render a content component

Now we want to implement the functionality for dynamically loading the content of the modal. Unfortunately it's not possible to mock a non-existing module with Jest, therefore we have to use the real thing in our test.

```js
describe('AppModal', () => {
  // ...

  test('It should render the given component.', async () => {
    storeMocks.state.modalVisible = true;

    wrapper = mount(AppModal, {
      store: storeMocks.store,
      localVue,
    });
    wrapper.setComputed({
      modalComponent: 'ModalLogin',
    });

    // For some reason the dynamic import is triggered
    // twice in tests (but not in production) to compensate
    // for that, we have to wait twice for the next tick
    // (I guess this is a bug in vue-test-utils).
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.contains('.c-modalLogin')).toBe(true);
  });
});
```

When I initially wrote the test above, I didn't call `$nextTick()` twice but once, which lead to at least an hour of debugging because I couldn't figure out why the test was still failing although my implementation already did work in the browser. There seems to be a bug in the vue-test-utils which leads to methods specified in the `watch` object of the component, are triggered twice. Calling `$nextTick()` twice is a workaround for this problem.

```html
<template>
  <div class="c-appModal" @keydown.esc="hideModal">
    <div class="c-appModal__overlay" v-if="visible"></div>
    <div class="c-appModal__content" v-if="visible" @click.self="hideModal">
      <div class="c-appModal__innerContent">
        <component :is="component"></component>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'AppModal',
  data() {
    return {
      component: null,
    };
  },
  computed: {
    ...mapState({
      visible: 'modalVisible',
      modalComponent: 'modalComponent',
    }),
  },
  methods: {
    ...mapMutations(['hideModal']),
  },
  watch: {
    modalComponent(componentName) {
      if (!componentName) return;

      Vue.component(componentName, () => import(`./modal/${componentName}`));

      this.component = componentName;
    },
  },
};
</script>
```

Above you can see the final code of our modal component. The method in the `watch` object is dynamically loading the given component by name. The component is rendered as soon as it's loaded.

Because it's outside of the scope of this article, I don't show you how to style or animate the modal component. You can find [the full code with styling and transitions on GitHub](https://github.com/maoberlehner/building-a-modal-dialog-with-vue-and-vuex).

## Step 3: Glue it together

Now that we've implemented the separate building blocks for creating a user login modal popup, we're ready to glue everything together. First we create a new `PageHome` component in `src/components` which contains a button to trigger the modal popup.

```html
<template>
  <div class="c-pageHome">
    <button class="c-pageHome__login" @click="showModal('ModalLogin')">Login</button>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'PageHome',
  methods: {
    ...mapMutations(['showModal']),
  },
};
</script>
```

Next we must add the `AppModal` and the `PageHome` components in our `App.vue` root component.

```html
<template>
  <div id="app">
    <page-home></page-home>
    <app-modal></app-modal>
  </div>
</template>

<script>
import AppModal from './components/AppModal';
import PageHome from './components/PageHome';

export default {
  name: 'app',
  components: {
    AppModal,
    PageHome,
  },
};
</script>
```

In the example code above we're initializing the modal component and we render a button which triggers the `showModal()` mutation when it's clicked. By providing the component name `ModalLogin` we're telling our modal which component it should load for rendering in the content section.

<hr class="c-hr">
<div class="c-service-info">
  <h2>Do you have any questions?</h2>
  <p class="c-service-info__body">
    <a class="c-anchor" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">You can find me on Twitter</a>.
  </p>
</div>
<hr class="c-hr">

## Final thoughts

By using Vuex for controlling the rendering of the modal dialog we don't have to make the modal dialog instance globally available like many other Vue modal solutions are doing it.

Using dynamic imports for rendering content inside of the modal, can be very helpful in large scale applications, with many different modal dialogs.

On the other hand, the solution demonstrated in this article, might be too complex for smaller applications.

If you enjoyed this article, please **make sure to also read one of my previous articles about [how to structure a complex Vuex store](https://markus.oberlehner.net/blog/how-to-structure-a-complex-vuex-store/)**.
