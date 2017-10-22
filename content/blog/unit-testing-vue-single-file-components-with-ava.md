+++
date = "2017-10-22T13:26:12+02:00"
title = "Unit Testing Vue.js Single File Components with ava"
description = "Learn how to build Vue.js single file components using a TDD approach. Write unit tests for Vue.js components which are powered by Vuex and vue-router."
intro = "Testing Vue.js components is different from testing regular JavaScript modules or classes in two ways. First of all Vue.js components depend on Vue.js, its global state and oftentimes on plugins like Vuex or the vue-router. Second, Vue.js single file components usually are compiled with webpack, the regular workflow of using Babel to compile JavaScript code before testing it, is not sufficient in this case. Let's find out how to deal with those challenges..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Front-End testing", "unit tests", "Vue"]
+++

In todays article, we're going to explore how to unit test Vue.js single file components using the ava test framework and the vue-test-utils package. I've decided to write this article because ava is my favorite test framework, if you're more into the Mocha test framework, I highly recommend you to watch the [Testing Vue series on Laracasts](https://laracasts.com/series/testing-vue).

Testing Vue.js components is different from testing regular JavaScript modules or classes in two ways. First of all Vue.js components depend on Vue.js, its global state and oftentimes on plugins like Vuex or the vue-router. Second, Vue.js single file components usually are compiled with webpack, the regular workflow of using Babel to compile JavaScript code before testing it, is not sufficient in this case.

Let's find out how to deal with those challenges.

## Setting up the test environment
In preparation for this article, I've set up a simple demo project, using the official [Vue.js CLI PWA template](https://github.com/vuejs-templates/pwa). You may view the [complete code used in this article on GitHub](https://github.com/maoberlehner/unit-testing-vue-components-with-ava).

After creating a new project with the Vue.js CLI (already including the `vue-router` package), we can now start by installing all the necessary dependencies that we need to build and test our app.

```bash
npm install vuex
npm install --save-dev ava babel-plugin-transform-object-rest-spread jsdom jsdom-global require-extension-hooks require-extension-hooks-babel require-extension-hooks-vue sinon vue-test-utils
```

Let's take a closer look at this long list of dependencies. The only non development dependency which we're adding is `vuex`, we'll use Vuex to manage the state of our demo component which we're going to build using TDD.

`ava` is the test framework which we're going to use. The `babel-plugin-transform-object-rest-spread` makes it possible to test components which are using the new JavaScript spread operator, we're going to use the spread operator in combination with Vuex' `mapActions()` function. We're going to use `jsdom` and `jsdom-global` to simulate a browser environment in our tests. The `require-extension-hooks-*` packages are required in order to being able to test single file Vue.js components without having to compile them with webpack first. `sinon` is a mocking library which makes it possible to create spies and stubs of objects. Last but not least comes the `vue-test-utils` package, which is the official helper package for testing Vue.js components.

### Configuring ava
Because Vue.js single file components can't be compiled by ava on the fly, we have to create a `setup.js` file in a newly created `test` directory, which runs before the test and compiles the tested single file component into pure JavaScript code which can be interpreted by ava.

```js
// test/setup.js
const hooks = require('require-extension-hooks');

// Set up a virtual browser environment.
require('jsdom-global')();

// Setup `.vue` files to be processed by `require-extension-hooks-vue`.
hooks('vue').plugin('vue').push();
// Setup `.vue` and `.js` files to be processed by `require-extension-hooks-babel`.
hooks(['vue', 'js']).plugin('babel', { plugins: ['transform-object-rest-spread'] }).push();
```

In the code above we're using `jsdom-global` to set up a virtual browser environment, this makes it possible to access browser specific APIs although we're running our tests in a Node.js environment. Using `jsdom` instead of a real browser environment or PhantomJS, helps us to keep our tests as fast as possible.

In the next step, we have to tell ava about the `setup.js` file. To do so we can add the following snippet to our `package.json` file.

```json
"ava": {
  "require": [
    "./test/setup.js"
  ]
}
```

The last thing we have to do before we can get started with writing our first test, is to add a `test` npm script to our `package.json` file, to make it possible to quickly trigger an ava test run.

```js
"scripts": {
  "dev": "node build/dev-server.js",
  "start": "node build/dev-server.js",
  "build": "node build/build.js",
  "test": "ava test/**/*.spec.js"
}
```

## Using TDD to build a component
Now that we've set up our testing environment, let's build a to-do app using the TDD approach.

```html
<template>
  <div class="to-do"></div>
</template>

<script>
export default {
  name: 'ToDo',
};
</script>
```

Because we're using TDD, we're starting with an empty `ToDo.vue` component in `src/components`, just so that we can import something.

```js
// test/components/ToDo.spec.js
import { shallow } from 'vue-test-utils';
import test from 'ava';

import ToDo from '../../src/components/ToDo';

test('It should render an `<div>`.', (t) => {
  const wrapper = shallow(ToDo);

  t.true(wrapper.is('div'));
});
```

In the test code above you can see, that we're importing a function named `shallow` from `vue-test-utils`. This function makes it possible to initialize a Vue.js component, but instead of also initializing all its child components, it automatically stubs them. If you want to initialize a component including all its child components, you have to use the `mount` function.

The first test case you can see in the code snippet above, tests if the wrapper element, rendered by the component, is a `<div>` tag. You might wonder what this test is good for: with this very simple test, we test not primarily the functionality of the component but whether the setup works in principle. If this test fails and we've made sure that the component in fact should render a `<div>`, we know that something is wrong with the setup, but not necessarily with the component.

### Implementing the functionality
When following the TDD approach, the test is written before the implementation. The first thing we want to implement is a list of to-do items.

```js
test('It should show a list of to-do items if there are any.', (t) => {
  const wrapper = shallow(ToDo, {
    data() {
      return {
        items: [
          'Hello World',
          'This is a test',
        ],
      };
    },
  });

  t.true(wrapper.contains('.qa-to-do-item'));
});
```

In the test above we're initializing a new instance of our `ToDo` component with some data. We specify that our component should render a list of items and check if this is true by asserting that the wrapper contains an element with the CSS selector `.qa-to-do-item` ([read more about why `qa` prefixes are awesome](https://markus.oberlehner.net/blog/css-selector-namespaces-for-stable-acceptance-tests/)). If we run this test with `npm run test` the test should fail, because we don't have implemented the functionality yet.

```html
<template>
  <div class="to-do">
    <ul class="to-do__list qa-to-do-list">
      <li class="to-do__item qa-to-do-item" v-for="item in items" :key="item">
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'ToDo',
  data() {
    return {
      items: [],
    };
  },
};
</script>
```

In the example above you can see the implementation for displaying a list of to-do items. If we run our test again, this time it should pass.

In the next step we want to specify what happens, if there are no to-do items.

```js
test('It shouldn\'t render a list if there are no items.', (t) => {
  const wrapper = shallow(ToDo);

  t.false(wrapper.contains('.qa-to-do-list'));
});
```

If there are no items, we don't want to display anything at all. If we run our test again we can see that it fails. Let's change that.

```html
<template>
  <div class="to-do">
    <ul class="to-do__list qa-to-do-list" v-if="items.length">
      <li class="to-do__item qa-to-do-item" v-for="item in items" :key="item">
        {{ item }}
      </li>
    </ul>
  </div>
</template>
```

By adding a `v-if` binding, which is checking the length of the `items` array, on the to-do list item, we make sure that this element is only rendered if there are any items to be displayed. If we run our tests again, we can see that now all of them are passing again.

So far so good. The only thing that's missing from our little to-do app, is the possibility to add new items.

```js
test('It can add new to-do items.', (t) => {
  const wrapper = shallow(ToDo);
  const input = wrapper.find('.qa-to-do-input');
  const button = wrapper.find('.qa-to-do-add');

  // Set the value of the input element.
  input.element.value = 'New to-do item';
  // Trigger an input event so Vue.js picks
  // up on the new value of the field.
  input.trigger('input');
  // Trigger a click event on the button.
  button.trigger('click');

  t.is(wrapper.find('.qa-to-do-item').text().trim(), 'New to-do item');
});
```

In the test code above, we specify, that there should be an input and a button element. If text is entered into the input field and the button is clicked, a new to-do item containing the text should be added to the list. We're checking this by comparing the text of the element with the selector `.qa-to-do-item` with the text which we've previously entered into the input element.

```html
<template>
  <div class="to-do">
    <ul class="to-do__list qa-to-do-list" v-if="items.length">
      <li class="to-do__item qa-to-do-item" v-for="item in items" :key="item">
        {{ item }}
      </li>
    </ul>
    <input class="to-do__input qa-to-do-input" v-model="newItem">
    <button class="to-do__add qa-to-do-add" @click="items.push(newItem)">Add</button>
  </div>
</template>

<script>
export default {
  name: 'ToDo',
  data() {
    return {
      items: [],
      newItem: '',
    };
  },
};
</script>
```

In the code above, you can see that we've added a new input and a button element. By using `v-model` on the input element we're binding its value to the `newItem` data key. The click event listener on the button element pushes the value of `newItem` into the `items` array when activated.

### Testing Vuex powered components
We now have a working to-do app. But this is a rather simple example of how to build a Vue.js component, in a real world application you'll most likely use a global state to store your data. This is the right time to bring Vuex into the equation.

To get Vuex up and running we need to add the following directories and files.

```bash
.
└── src
    └── store
        ├── index.js
        └── modules
            └── todo.js
```

```js
// src/store/index.js
import Vue from 'vue';
import Vuex from 'vuex';
import todo from './modules/todo';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    todo,
  },
});
```

```js
// src/store/modules/todo.js
const getters = {
  items: state => state.items,
};

const mutations = {
  ADD(state, { item }) {
    state.items.push(item);
  },
};

const state = {
  items: [],
};

export default {
  namespaced: true,
  getters,
  mutations,
  state,
}
```

One thing to mention is, that we're using the Vuex namespace feature. This prevents naming collisions from happening.

Additionally we have to register our newly created Vuex powered store in our Vue instance which is created in the `src/main.js` file.

```js
import Vue from 'vue';

import App from './App';
import router from './router';
import store from './store';

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
});
```

If you're not quite sure whats happening in the files above, please head over to the [official Vuex documentation](https://vuex.vuejs.org/en/intro.html) – explaining how Vuex works is out of the scope of this article.

After creating and registering our Vuex store, we have to update our to-do app component to make use of the global store instead of relying on its own local state.

```html
<template>
  <div class="to-do">
    <ul class="to-do__list qa-to-do-list" v-if="items.length">
      <li class="to-do__item qa-to-do-item" v-for="item in items" :key="item">
        {{ item }}
      </li>
    </ul>
    <input class="to-do__input qa-to-do-input" v-model="newItem">
    <button class="to-do__add qa-to-do-add" @click="add({ item: newItem})">Add</button>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

const { mapGetters, mapMutations } = createNamespacedHelpers('todo');

export default {
  name: 'ToDo',
  data() {
    return {
      newItem: '',
    };
  },
  computed: {
    ...mapGetters(['items']),
  },
  methods: {
    ...mapMutations({
      add: 'ADD',
    }),
  },
};
</script>
```

In the code above you can see, that we've changed the click handler in the template. The click handler now calls a new `add` method. We're using Vuex map functions to map getter and mutation functions.

If we'd run our tests again, we'd see them fail. In order to make them pass again, we have to mock the store and pass the mocked store instance to the instance of the component under test.

```js
// test/components/ToDo.spec.js
import Vuex from 'vuex';
import sinon from 'sinon';
import { createLocalVue, shallow } from 'vue-test-utils';
import test from 'ava';

import ToDo from '../../src/components/ToDo';

const localVue = createLocalVue();
localVue.use(Vuex);

// Mock the `ADD` mutation to make it
// possible to check if it was called.
const mutations = {
  ADD: sinon.spy(),
};

// This function creates a new Vuex store
// instance for every new test case.
function createStore(items = []) {
  const modules = {
    todo: {
      namespaced: true,
      getters: {
        items: () => items,
      },
      mutations,
    },
  };

  return new Vuex.Store({
    modules,
  });
}

test('It should render an `<div>`.', (t) => {
  const wrapper = shallow(ToDo, { localVue, store: createStore() });

  t.true(wrapper.is('div'));
});

test('It should show a list of to-do items if there are any.', (t) => {
  const wrapper = shallow(ToDo, {
    localVue,
    store: createStore([
      'Hello World',
      'This is a test',
    ]),
  });

  t.true(wrapper.contains('.qa-to-do-item'));
});

test('It shouldn\'t render a list if there are no items.', (t) => {
  const wrapper = shallow(ToDo, { localVue, store: createStore() });

  t.false(wrapper.contains('.qa-to-do-list'));
});

test('It can add new to-do items.', (t) => {
  const wrapper = shallow(ToDo, { localVue, store: createStore() });
  const input = wrapper.find('.qa-to-do-input');
  const button = wrapper.find('.qa-to-do-add');

  // Set the value of the input element.
  input.element.value = 'New to-do item';
  // Trigger an input event so Vue.js picks
  // up on the new value of the field.
  input.trigger('input');
  // Trigger a click event on the button.
  button.trigger('click');

  t.true(mutations.ADD.calledWith({}, { item: 'New to-do item' }));
});
```

Let's walk through the changes we've made to make the test work with Vuex. First of all, we're importing three new dependencies: `Vuex`, `sinon` and `createLocalValue`.

`createLocalValue` is a helper function which makes it possible to pass globals into the Vue instance of our component – we need this functionality to pass our mock store to the component with `localVue.use(Vuex)` later we use `localVue` and the `store` instance to create a new component instance with `shallow(ToDo, { localVue, store: createStore() })`.

In the last test case, we've changed the assertion from checking if the list of to-do items was updated, to making sure, that the `ADD` mutation was called. In unit tests, we assume that everything outside of the scope of the current test works as expected. By applying this logic, we can safely assume that the `ADD` mutation does its job correctly, and it will indeed add a new to-do item to the store. In a previous test we've already tested if items in the store render correctly, therefore in this test it is sufficient to check if the mutation function was called with the correct parameters.

### Testing vue-router powered components
Now that we've built a Vuex powered to-do app, let's take a look  at how to test Vue.js components, which are using the vue-router package.

In this example we'll assume that we want to link to a statistics page and we want to handle a click event on the router link. Usually, if you're using the `shallow` function, the vue-test-utils will stub all child components of the component under test, but this makes it impossible to handle a click event on a child component. Vue.js requires you to use `@click.native` if you want to handle (click) events on child components, but `native` events are not fired if the component is not initialized. Because of this, we have to use the `mount` function instead of `shallow` whenever we want to test if an event bound to a child component was emitted correctly.

```js
// src/router/index.js
import Vue from 'vue';
import Router from 'vue-router';
import ToDo from '@/components/ToDo';
import ToDoStats from '@/components/ToDoStats';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'To-Do',
      component: ToDo,
    },
    {
      path: '/stats',
      name: 'Stats',
      component: ToDoStats,
    },
  ],
});
```

```html
<template>
  <div class="to-do-stats">
    <h1>Stats</h1>
  </div>
</template>

<script>
export default {
  name: 'ToDoStats',
};
</script>
```

In the code snippets above, you can see that we've added a new route and a new component (`src/components/ToDoStats.vue`) to render at this route. The `ToDoStats` component has no other functionality than to make it possible to add the new route.

```html
<template>
  <div class="to-do">
    <ul class="to-do__list qa-to-do-list" v-if="items.length">
      <li class="to-do__item qa-to-do-item" v-for="item in items" :key="item">
        {{ item }}
      </li>
    </ul>
    <input class="to-do__input qa-to-do-input" v-model="newItem">
    <button class="to-do__add qa-to-do-add" @click="add({ item: newItem})">Add</button>
    <router-link
      class="to-do__stats-link qa-to-do-stats-link"
      to="/stats"
      @click.native="$emit('clickStatsLink')">
      Go to the stats
    </router-link>
  </div>
</template>
```

The code you can see above is the modified template of our `ToDo` component. The only thing which has changed is that we've added a `<router-link>` and bound a click handler to it. Now we wan't to test if the event is emitted correctly.

```js
import Vuex from 'vuex';
import Router from 'vue-router';
import sinon from 'sinon';
import { createLocalVue, shallow, mount } from 'vue-test-utils';
import test from 'ava';

import ToDo from '../../src/components/ToDo';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Router);

// ...

// Initialize a new router with
// the route data needed for the test.
const router = new Router({
  routes: [
    {
      path: '/stats',
    },
  ],
});

// ...

test('It should emit an event when clicking the stats link.', (t) => {
  const wrapper = mount(ToDo, { localVue, store: createStore(), router });

  wrapper.find('.qa-to-do-stats-link').trigger('click');

  t.truthy(wrapper.emitted().clickStatsLink);
});
```

In order to mount our `ToDo` component with the `<router-link>` handled by the vue-router, we have to import the vue-router and register it with our Vue.js instance. In the test case we trigger a click event on the `<router-link>` element and we check if a `clickStatsLink` event was emitted. If we've done everything correctly our test should pass.

## Wrapping it up
Thanks to the vue-test-utils package, using a TDD approach for building Vue.js components has become a breeze. However, things can become tricky when external plugins and dependencies are being used. I hope this article answers some questions about how to test Vuex and vue-router powered Vue.js single file components.
