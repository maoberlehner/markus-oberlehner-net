+++
date = "2017-12-03T10:48:34+02:00"
title = "Testing Vuex Powered Vue.js Components with Jest"
description = "Learn how to test Vue single file components with Jest and how to test Vue components which rely on a Vuex store by creating a mock of the store with Jest."
intro = "Thanks to the vue-test-utils testing Vue components has become much easier. But things can still become a little bit more complicated when Vuex is added to the equation..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Front-End testing", "unit tests", "Vue"]
+++

Thanks to the [vue-test-utils](https://vue-test-utils.vuejs.org), testing Vue components has become much easier. But things can still become a little bit more complicated when Vuex is added to the equation. One option would be to not bother mocking the Vuex store altogether and using the regular store implementation for testing too. But in many cases this is not the optimal solution. Usually you want to test only *the thing* and mock everything else which is required for *the thing* to run.

Because of the amazing mocking functionalities which Jest offers out of the box, creating a mock Vuex store can be done very comfortable. In this article we're going to take a look at how to set up Jest to work with Vue single file components and how to use the Jest mocking functionalities to create a mock instance of the Vuex store.

You can find an [example project](https://github.com/maoberlehner/testing-vuex-powered-vue-components-with-jest), containing all the code you'll see in this article, [on GitHub](https://github.com/maoberlehner/testing-vuex-powered-vue-components-with-jest).

## Setting up Jest for testing Vue.js components
First things first, let's start with setting up Jest in our Vue project. The first step is to install all necessary dependencies.

```bash
npm install --save-dev babel-jest jest vue-jest vue-test-utils
```

After installing all the npm dependencies we need for testing Vue single file components, we have to add some additional Jest configuration options. The easiest way to do this, is to add the following JSON snippet to your `package.json` file.

```json
"jest": {
  "moduleFileExtensions": [
    "js",
    "vue"
  ],
  "transform": {
    ".*\\.(vue)$": "vue-jest",
    "^.+\\.js$": "babel-jest"
  },
  "mapCoverage": true
}
```

The configuration you can see above, tells Jest to also look for `.vue` files in addition to `.js` files and that the packages `vue-jest` and `babel-jest` should be used for transforming the respective files. The last option `mapCoverage` enables source map generation when creating a coverage report with Jest.

Because Jest is not able to resolve ES6 modules out of the box, we have to tell Babel to do this for us. You can do this by overriding the Babel default configuration (`.babelrc`) for the `test` environment.

```json
{
  "presets": [
    ["env", {
      "modules": false
    }],
    "stage-2"
  ],
  "env": {
    "test": {
      "presets": ["env", "stage-2"]
    }
  },
  "plugins": ["transform-runtime"]
}
```

Your `.babelrc` configuration file should look similar to the JSON file you can see above. But depending on your setup, you might have to make some modifications.

In order to being able to conveniently run Jest tests, I recommend you to add a new npm script to your `package.json` file.

```json
"scripts": {
  "test": "jest src"
}
```

Now you can trigger the `test` script by running `npm test`. You should get an error for now, because currently no tests can be found in the `src` directory.

## The Vuex store
Now that Jest is set up, let's write some code and create a little example component.

```js
// src/store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const NOT_IN_BASKET = 0;
const IN_BASKET = 1;

export const getters = {
  itemsInBasket: state => state.items.filter(item => item.status === IN_BASKET),
  itemsNotInBasket: state => state.items.filter(item => item.status === NOT_IN_BASKET),
};

export const mutations = {
  addItems(state, items) {
    state.items = state.items.concat(items);
  },
  addItemToBasket(state, itemId) {
    state.items.find(item => item.id === itemId).status = IN_BASKET;
  },
  removeItemFromBasket(state, itemId) {
    state.items.find(item => item.id === itemId).status = NOT_IN_BASKET;
  },
};

// Simulate an API request for fetching data.
export const actions = {
  fetchItems({ commit }) {
    commit('addItems', [
      {
        id: 1,
        name: 'Milk',
        status: NOT_IN_BASKET,
      },
      {
        id: 2,
        name: 'Bread',
        status: NOT_IN_BASKET,
      },
    ]);
  },
};

export const state = {
  items: [],
};

export const store = new Vuex.Store({
  getters,
  mutations,
  actions,
  state,
});
```

What you can see above is the code for the Vuex store of our example project. In this article we're focusing on how to mock a Vuex store and how to test Vue components which are using a Vuex store. Testing the store itself is out of the scope of this article, if you want to learn more about testing Vuex stores, I recommend you to read the [official documentation](https://vuex.vuejs.org/en/testing.html).

### Creating a mock of the Vuex store
Jest has a very smart mocking mechanism which we can utilize to create a mock implementation of our Vuex store you can see above.

First of all, let's create a new directory `__mocks__` in the `src/store` directory containing a new file named `index.js`.

```bash
.
├── ...
└── src
    ├── ...
    └── store
        ├── __mocks__
        │   └── index.js
        └── index.js
```

The `index.js` file in the `__mocks__` directory, can later be automatically used by Jest over the original implementation of the `index.js` in the root of the `src/store` directory.

```js
// src/store/__mocks__/index.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
```

Like in the original implementation, we have to import Vue and Vuex in order to being able to create a new Vuex store instance.

```js
// src/store/__mocks__/index.js
// ...

export const getters = {
  itemsInBasket: jest.fn().mockReturnValue([
    {
      id: 1,
      name: 'Foo',
      status: 1,
    },
    {
      id: 1,
      name: 'Bar',
      status: 1,
    },
  ]),
  itemsNotInBasket: jest.fn().mockReturnValue([
    {
      id: 1,
      name: 'Foo',
      status: 0,
    },
    {
      id: 1,
      name: 'Bar',
      status: 0,
    },
  ]),
};
```

What you can see above, is the mock implementation of the getters we later want to use in our Vue component. Instead of accessing the Vuex store for retrieving data, we're using `jest.fn()` to create a Jest mock function, which always returns the same mock data.

```js
// src/store/__mocks__/index.js
// ...

export const mutations = {
  addItems: jest.fn(),
  addItemToBasket: jest.fn(),
  removeItemFromBasket: jest.fn(),
};

export const actions = {
  fetchItems: jest.fn(),
};
```

The mutations and actions follow the same principle. By returning a Jest mock function, we can later check if a mutation  or an action was called. In the context of our unit tests, we do not care about what the actions and mutations are doing, because we assume they are doing there job correctly (which is a safe assumption, because the correctness of those functions is verified in their own unit tests).

```js
// src/store/__mocks__/index.js
// ...

export const state = {
  items: [
    {
      id: 1,
      name: 'Foo',
      status: 1,
    },
    {
      id: 1,
      name: 'Bar',
      status: 1,
    },
  ],
};
```

The mock state of our mock Vuex store, contains some default data, which might be useful to render the component, or for doing some basic tests.

```js
// src/store/__mocks__/index.js
// ...

export function __createMocks(custom = { getters: {}, mutations: {}, actions: {}, state: {} }) {
  const mockGetters = Object.assign({}, getters, custom.getters);
  const mockMutations = Object.assign({}, mutations, custom.mutations);
  const mockActions = Object.assign({}, actions, custom.actions);
  const mockState = Object.assign({}, state, custom.state);

  return {
    getters: mockGetters,
    mutations: mockMutations,
    actions: mockActions,
    state: mockState,
    store: new Vuex.Store({
      getters: mockGetters,
      mutations: mockMutations,
      actions: mockActions,
      state: mockState,
    }),
  };
}

export const store = __createMocks().store;
```

Now this is where the magic happens. The `__createMocks()` helper function, creates a new Vuex store instance every time it's called. By default the values we've specified above are used to create a new store, but by providing an object containing custom implementations of getters, mutations, actions or the state, we're able to override those for specific test cases. `Object.assign` is used for merging the objects and in order to get a fresh clone of the objects every time the `__createMocks()` function is used.

Last but not least a new store instance is exported. But be aware that using this instance inside your tests might be dangerous, if your tests mutate the state, because the same instance is shared between all of your tests.

```js
// src/store/__mocks__/index.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const getters = {
  itemsInBasket: jest.fn().mockReturnValue([
    {
      id: 1,
      name: 'Foo',
      status: 1,
    },
    {
      id: 1,
      name: 'Bar',
      status: 1,
    },
  ]),
  itemsNotInBasket: jest.fn().mockReturnValue([
    {
      id: 1,
      name: 'Foo',
      status: 0,
    },
    {
      id: 1,
      name: 'Bar',
      status: 0,
    },
  ]),
};

export const mutations = {
  addItems: jest.fn(),
  addItemToBasket: jest.fn(),
  removeItemFromBasket: jest.fn(),
};

export const actions = {
  fetchItems: jest.fn(),
};

export const state = {
  items: [
    {
      id: 1,
      name: 'Foo',
      status: 1,
    },
    {
      id: 1,
      name: 'Bar',
      status: 1,
    },
  ],
};

// eslint-disable-next-line no-underscore-dangle
export function __createMocks(custom = { getters: {}, mutations: {}, actions: {}, state: {} }) {
  const mockGetters = Object.assign({}, getters, custom.getters);
  const mockMutations = Object.assign({}, mutations, custom.mutations);
  const mockActions = Object.assign({}, actions, custom.actions);
  const mockState = Object.assign({}, state, custom.state);

  return {
    getters: mockGetters,
    mutations: mockMutations,
    actions: mockActions,
    state: mockState,
    store: new Vuex.Store({
      getters: mockGetters,
      mutations: mockMutations,
      actions: mockActions,
      state: mockState,
    }),
  };
}

export const store = __createMocks().store;
```

Above you can see the full example code of our mock implementation of the store.

<div>
  <hr class="c-hr">
  <div class="c-service-info">
    <h2>Do you want to learn more about testing Vue.js applications?</h2>
    <p class="c-service-info__body">
      Register for the Newsletter of my upcoming book: <a class="c-anchor" href="https://oberlehner.us20.list-manage.com/subscribe?u=8476a98c5640f6c7b5530ea57&id=8b26bf120b" data-event-category="link" data-event-action="click: newsletter" data-event-label="Newsletter (article content)">Advanced Vue.js Application Architecture</a>.
    </p>
  </div>
  <hr class="c-hr">
</div>

### The example component
To keep this article as simple as possible, I won't guide you through writing tests in a TDD manner but instead show you the finished component immediately – here it is.

```html
<template>
  <div class="shopping-list">
    <div class="basket" v-if="itemsInBasket.length">
      <h2>Items in basket</h2>
      <ul class="items-in-basket">
        <li v-for="item in itemsInBasket" :key="item.id" @click="removeItemFromBasket(item.id)">
          <h3>{{ item.name }}</h3>
        </li>
      </ul>
    </div>

    <h2>Items not in basket</h2>
    <ul class="items-not-in-basket">
      <li v-for="item in itemsNotInBasket" :key="item.id" @click="addItemToBasket(item.id)">
        <h3>{{ item.name }}</h3>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';

export default {
  name: 'ShoppingList',
  computed: {
    ...mapGetters([
      'itemsInBasket',
      'itemsNotInBasket',
    ]),
  },
  methods: {
    ...mapActions([
      'fetchItems',
    ]),
    ...mapMutations([
      'addItemToBasket',
      'removeItemFromBasket',
    ]),
  },
  created() {
    this.fetchItems();
  },
};
</script>
```

Let's take a look at what is happening in this very basic shopping list component. In the template you can see two `<ul>` elements. The first one renders all the items which are already in the basket and the second one renders all the items which are not yet in the basket. Furthermore we don't want to render the basket at all, if no items are in it. By clicking on items, they are either removed from or added to the basket.

In the JavaScript section of this component, you can see that we're using the Vuex mapping helper functions to map certain store functions to our component. The computed properties are containing the getters for items *in* or *not in* the basket. The methods contain all the functions we need for modifying our store. And in the `created()` hook we're triggering the `fetchItems()` function to simulate an API request which initially fills our store with data.

### Writing tests utilizing the Vuex mock store
Now let's check if our component does, what it's supposed to do, by writing tests.

```js
// src/components/ShoppingList.spec.js
import Vuex from 'vuex';
import { shallow, createLocalVue } from 'vue-test-utils';
import { __createMocks as createStoreMocks } from '../store';

import ShoppingList from './ShoppingList';

// Tell Jest to use the mock
// implementation of the store.
jest.mock('../store');

const localVue = createLocalVue();

localVue.use(Vuex);

describe('ShoppingList', () => {
  let storeMocks;
  let wrapper;

  beforeEach(() => {
    // Create a fresh store and wrapper
    // instance for every test case.
    storeMocks = createStoreMocks();
    wrapper = shallow(ShoppingList, {
      store: storeMocks.store,
      localVue,
    });
  });
});
```

In the code snippet above, you can see the basic boilerplate code which is necessary to create a new (mock) instance of the store, and a new instance of the Vue component under test, for every test case.

```js
// src/components/ShoppingList.spec.js
// ...

describe('ShoppingList', () => {
  // ...
  
  test('It should fetch items.', () => {
    expect(storeMocks.actions.fetchItems).toBeCalled();
  });
});
```

In the first test case you can see above, we want to make sure, that the `fetchItems()` action is called. The `storeMocks` object contains all the actions of our mock store, and because we've specified in the mock implementation of the store, that `fetchItems()` should return a mock function created by `jest.fn()`, we're able to test if the function was called when the component was created. After running `npm test`, we can see that the test succeeds and everything works as expected.

```js
// src/components/ShoppingList.spec.js
// ...

describe('ShoppingList', () => {
  // ...
  
  test('It should add items to the basket when an item is clicked.', () => {
    wrapper.find('.items-not-in-basket li:first-child').trigger('click');

    expect(storeMocks.mutations.addItemToBasket).toBeCalled();
  });
});
```

In our next test, we simulate a click on an item inside the list of items which are not yet in the basket and make sure, that the `addItemToBasket()` mutation function was called successfully afterwards. Because we can safely assume that the original implementation of `addItemToBasket()` works correctly, simply checking if it was called is sufficient in this case.

```js
// src/components/ShoppingList.spec.js
// ...

describe('ShoppingList', () => {
  // ...
  
  test('It should remove items from the basket when an item in the basket is clicked.', () => {
    wrapper.find('.items-in-basket li:first-child').trigger('click');

    expect(storeMocks.mutations.removeItemFromBasket).toBeCalled();
  });
});
```

In this test case we're checking if clicking on an item in the basket triggers the mutation to remove items from the basket.

```js
// src/components/ShoppingList.spec.js
// ...

describe('ShoppingList', () => {
  // ...
  
  test('It should not render an empty basket.', () => {
    storeMocks = createStoreMocks({ getters: { itemsInBasket: () => [] } });
    wrapper = shallow(ShoppingList, {
      store: storeMocks.store,
      localVue,
    });

    expect(wrapper.contains('.basket')).toBe(false);
  });
});
```

In this last test case, we wan't to make sure, that an empty basket is not rendered at all. Because by default our mock store implementation returns an array of items which are in the basket, we have to override this behavior to make this test work. In order to do so, we create a new `storeMocks` instance in which we override the `itemsInBasket()` getter function to return an empty array.

## Conclusion
The Jest mocking tools make it a lot easier to deal with complex dependencies like a Vuex store. Thanks to Jest and the vue-test-utils package, there is no excuse anymore not to test your Vue components.

You can find an [example project](https://github.com/maoberlehner/testing-vuex-powered-vue-components-with-jest), containing all the code you've seen in this article, [on GitHub](https://github.com/maoberlehner/testing-vuex-powered-vue-components-with-jest).
