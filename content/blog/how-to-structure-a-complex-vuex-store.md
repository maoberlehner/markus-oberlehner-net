+++
date = "2018-02-04T10:01:01+02:00"
title = "How to Structure a Complex Vuex Store with Modules"
description = "Best practices for using Vuex modules to structure a Vuex store. Learn how to enable lazy loading of Vuex store modules and how to fetch data via an API."
intro = "In this article, we take a look at a possible way of how to structure a Vuex store for a large scale application. When I was researching possible approaches for handling the state of big, Vue powered applications with Vuex, it was pretty hard to find any good examples..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Vuex"]
+++

> **Update from 2019:** I wrote this article about a year ago, and I changed my mind about a few things regarding the use of Vuex at scale since then. Although most of this article is still relevant today, I highly recommend you also [read my article about possible alternatives for Vuex and how you can decide when to use Vuex over an alternative solution](/blog/should-i-store-this-data-in-vuex/). Moreover, I plan to write a book about this topic, and you can [follow me on Twitter](https://twitter.com/maoberlehner) or [subscribe to my newsletter](https://oberlehner.us20.list-manage.com/subscribe?u=8476a98c5640f6c7b5530ea57&id=8b26bf120b) if you want to stay up to date.

In this article, we take a look at a possible way to structure a Vuex Store for a large-scale application. When I was researching possible approaches for handling the state of big, Vue powered applications with Vuex, it was pretty hard to find good examples. Most of the Vuex examples out there demonstrate the core concepts of Vuex by showing how to build a reduced version of a shopping cart or a simple to-do list.

Today we build a straightforward application consisting of two pages. The first page makes it possible to create a new customer, and on the second page, the user can enter a shipping address.

<div class="c-content__figure">
  <div class="c-content__broad">
    <video data-src="/videos/2018-02-04/vuex-store-api-model-mapping.mp4" autoplay loop muted></video>
  </div>
  <p class="c-content__caption">
    <small>Form fields are mapped to a Vuex store which is mapped to an API request</small>
  </p>
</div>

## What we're building

You can check out [a demo of the project here](https://how-to-structure-a-complex-vuex-store.netlify.com/) (make sure to open your browsers developer tools to see console output). Furthermore, you can look at [the complete code at GitHub](https://github.com/maoberlehner/how-to-structure-a-complex-vuex-store).

## A new way of structuring a Vuex store

Because I couldn't find any examples of large scale applications using Vuex, which are open source, that would fit the needs of the project I was working on, I decided we can figure stuff out as I we were going. In doing so, **we learned a lot of things, especially how not to do it**, but as I see it, thats OK. One of the great things of writing code is, that you can always go back and refactor things.

I was not happy how things turned out, so I started to think about new ways of how to structure a Vuex store to meet the needs of the project. The following approach is what I came up with so far.

```bash
src
├── App.vue
├── ...
├── store
│   ├── action-types.js
│   ├── index.js
│   ├── modules
│   │   ├── customer.js
│   │   ├── forms
│   │   │   ├── address.js
│   │   │   ├── contact.js
│   │   │   └── name.js
│   │   └── shipping-address.js
│   └── mutation-types.js
└── ...
```

In the directory tree above, you can see the basic structure of the Vuex store. Let's take a closer look at some of those files.

```js
// src/store/index.js

import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  // Making sure that we're doing
  // everything correctly by enabling
  // strict mode in the dev environment.
  strict: process.env.NODE_ENV !== 'production',
});
```

As you can see above, there is not much going on in our main `index.js` file. The reason for this is, that we move most of the logic into separate modules. **This has the advantage of making it possible to reuse certain parts of the code and it also allows us to dynamically load Vuex modules as needed**.

## Form modules

For maximal reusability, we're using form modules representing certain sections of our two forms. The [customer form component](https://github.com/maoberlehner/how-to-structure-a-complex-vuex-store/blob/master/src/components/page/PageCustomer.vue) receives its data from three form modules: `name.js`, `contact.js` and `address.js`. The [shipping address form component](https://github.com/maoberlehner/how-to-structure-a-complex-vuex-store/blob/master/src/components/page/PageShippingAddress.vue) on the other hand, makes use of only the `contact.js` and `address.js` form modules. All three form modules are located in `src/store/modules/forms`.

### The contact form module

Representative for the two other form modules, which are pretty similar, we'll take a closer look at the `contact.js` form module.

```js
// src/store/modules/forms/contact.js

import { getField, updateField } from 'vuex-map-fields';

import { ADD_ROW } from '../../mutation-types';
import { Contact } from '../../../models/Contact';

const mutations = {
  updateField,
  [ADD_ROW](state) {
    // To enable multi-row form handling
    // we make it possible to add new rows.
    state.rows.push(new Contact());
  },
};

const getters = {
  getField,
};

// The state must return a function
// to make the module reusable.
// See: https://vuex.vuejs.org/en/modules.html#module-reuse
const state = () => ({
  // Pre-fill one row with an
  // empty `Contact` model.
  rows: [new Contact()],
});

export default {
  // We're using namespacing
  // in all of our modules.
  namespaced: true,
  mutations,
  getters,
  state,
};
```

This module is responsible for holding the state for our contact related form fields (`email` and `phone`). This might look like overkill, but you'll see in the following steps, how this granular approach allows for maximum reusability.

## The customer module

Because the `customer.js` Vuex module is a lot more complicated than the previous files we've seen so far, to make it a little easier to explain and comprehend, I'll break it up.

```js
// src/store/modules/customer.js

import { createHelpers } from 'vuex-map-fields';

// The API util is used to send the
// data the user enters to our server.
import api from '../../utils/api';

// Models are used to prepare
// store data to be sent to an API.
import { createCustomer } from '../../models/Customer';
import { createRequest } from '../../models/Request';

import { SUBMIT } from '../action-types';
import { ERROR, SUCCESS } from '../mutation-types';

// We're using reusable form modules
// to store the data of our forms.
import address from './forms/address';
import contact from './forms/contact';
import name from './forms/name';

// ...
```

At the beginning of the file, we're importing all the dependencies which we'll use in our module. I won't go into much detail about the things which are not directly related to the structure of the store.

The `createHelpers()` function imported from the [vuex-map-fields](https://github.com/maoberlehner/vuex-map-fields) package, is used to handle form fields with Vuex. Because this is only a demo application, the `api()` util is a fake implementation, which simulates a failing request every other time, to demonstrate both, error and success handling.

We're using models to map the data from the store to a structure which we can send to the API. If you want to take a closer look at those models, you can check out [the code in the GitHub repository](https://github.com/maoberlehner/how-to-structure-a-complex-vuex-store/tree/master/src/models).

### Actions

```js
// src/store/modules/customer.js

// ...

const actions = {
  async [SUBMIT]({ commit, state }) {
    try {
      const customerData = createCustomer({
        // We take only the first row here
        // because the user is not allowed 
        // to enter more than one address
        // (or name).
        address: state.address.rows[0],
        // Because we allow the user to enter
        // multiple contacts, we're sending
        // all rows to the API.
        contacts: state.contact.rows,
        name: state.name.rows[0],
      });
      const requestData = createRequest(customerData);

      await api(requestData);

      commit(SUCCESS);
    } catch (error) {
      commit(ERROR, error.message);
    }
  },
};

// ...
```

The `SUBMIT` action, which you can see above, is responsible for sending the data entered by the user to our API and handling success and error states if the API request succeeds or fails.

We're using the `createCustomer()` model helper function, to create a data structure, which is compatible to what our API expects, from the data stored in our `address`, `contact` and `name` form modules.

### Mutations

We need two mutations for our customer form: `ERROR`, to set an error state when the request fails and `SUCCESS` for doing pretty much the opposite.

```js
// src/store/modules/customer.js

// ...

const mutations = {
  [ERROR](state, error) {
    state.error = error;
    state.success = false;
  },
  [SUCCESS](state) {
    state.error = false;
    state.success = true;
  },
};

// ...
```

### The state and modules

The state object is pretty straight forward, we're defining an error and a success property. In the modules section, we're specifying the three form modules which are used to store the form data.

```js
// src/store/modules/customer.js

// ...

const state = () => ({
  error: false,
  success: false,
});

const modules = {
  address,
  contact,
  name,
};

// ...
```

### Helper functions

To make it a little bit more convenient to wire the state, defined in the form modules, to the form fields in the component, we're exporting custom `vuex-map-fields` helper functions. We'll use them in the next step when building the component for the customer form. At the end of the file, the customer store object is exported.

```js
// src/store/modules/customer.js

// ...

// We're exporting custom field mapper
// functions for mapping form fields to Vuex.
// See: https://github.com/maoberlehner/vuex-map-fields#custom-getters-and-mutations
export const { mapFields: mapAddressFields } = createHelpers({
  getterType: 'customer/address/getField',
  mutationType: 'customer/address/updateField',
});

export const { mapMultiRowFields: mapContactMultiRowFields } = createHelpers({
  getterType: 'customer/contact/getField',
  mutationType: 'customer/contact/updateField',
});

export const { mapFields: mapNameFields } = createHelpers({
  getterType: 'customer/name/getField',
  mutationType: 'customer/name/updateField',
});

export const customer = {
  namespaced: true,
  actions,
  mutations,
  state,
  modules,
};
```

<div>
  <hr class="c-hr">
  <div class="c-service-info">
    <h2>Do you want to learn more about advanced Vuex techniques?</h2>
    <p class="c-service-info__body">
      Register for the Newsletter of my upcoming book: <a class="c-anchor" href="https://oberlehner.us20.list-manage.com/subscribe?u=8476a98c5640f6c7b5530ea57&id=8b26bf120b" data-event-category="link" data-event-action="click: newsletter" data-event-label="Newsletter (article content)">Advanced Vue.js Application Architecture</a>.
    </p>
  </div>
  <hr class="c-hr">
</div>

## The customer form component

Now that we've created our store modules, it's time to wire everything up. The customer form component `PageCustomer.vue` is responsible for displaying several form fields and error or success messages, when the user submits the form.

```html
<template>
  <div :class="$options.name">
    <h1>New Customer</h1>

    <p class="success" v-if="success">
      SUCCESS!
    </p>
    <p class="error" v-if="error">
      ERROR: {{ error }}
    </p>

    <template v-if="!success">
      <div class="form-sections">
        <section class="form-section">
          <div class="form-element">
            <label for="firstName" class="form-label">First name:</label>
            <input id="firstName" v-model="firstName">
          </div>
          <div class="form-element">
            <label for="lastName" class="form-label">Last name:</label>
            <input id="lastName" v-model="lastName">
          </div>
        </section>

        <section class="form-section">
          <div class="form-repeatable" v-for="(contact, index) in contacts" :key="index">
            <div class="form-element">
              <label for="email" class="form-label">E-Mail:</label>
              <input id="email" type="email" v-model="contact.email">
            </div>
            <div class="form-element">
              <label for="phone" class="form-label">Phone:</label>
              <input id="phone" v-model="contact.phone">
            </div>
          </div>
          <button class="form-button" @click="addContact">Add contact</button>
        </section>

        <section class="form-section">
          <div class="form-element">
            <label for="zip" class="form-label">ZIP:</label>
            <input id="zip" v-model="zip">
          </div>
          <div class="form-element">
            <label for="town" class="form-label">Town:</label>
            <input id="town" v-model="town">
          </div>
          <div class="form-element">
            <label for="street" class="form-label">Street:</label>
            <input id="street" v-model="street">
          </div>
        </section>
      </div>

      <button class="form-button" @click="submit">
        Submit
      </button>
    </template>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import { SUBMIT } from '../../store/action-types';
import { ADD_ROW } from '../../store/mutation-types';

import store from '../../store';
import {
  customer,
  mapAddressFields,
  mapContactMultiRowFields,
  mapNameFields,
} from '../../store/modules/customer';

// We're dynamically registering the
// `customer` store module. This has 
// the benefit of only loading this
// module, if it's actually needed.
// Before registering the module, we're
// checking if it's already registered
// which can happen in combination with
// webpacks hot reloading.
if (!store.state.customer) {
  store.registerModule('customer', customer);
}

const {
  mapActions: mapCustomerActions,
  mapState: mapCustomerState,
} = createNamespacedHelpers('customer');
const {
  mapMutations: mapContactMutations,
} = createNamespacedHelpers('customer/contact');

export default {
  name: 'PageCustomer',
  // Here we're wiring everything up.
  computed: {
    ...mapCustomerState(['error', 'success']),
    // You can read more about mapping field
    // values in two of my previous articles.
    // https://markus.oberlehner.net/blog/form-fields-two-way-data-binding-and-vuex/
    // https://markus.oberlehner.net/blog/how-to-handle-multi-row-forms-with-vue-vuex-and-vuex-map-fields/
    ...mapNameFields(['rows[0].firstName', 'rows[0].lastName']),
    ...mapContactMultiRowFields({ contacts: 'rows' }),
    ...mapAddressFields(['rows[0].zip', 'rows[0].town', 'rows[0].street']),
  },
  methods: {
    ...mapContactMutations({
      addContact: ADD_ROW,
    }),
    ...mapCustomerActions({
      submit: SUBMIT,
    }),
  },
};
</script>
```

As you can see above, there is not much actual logic going on inside of the component. Most of what we're doing is to map actions, mutations and fields from the store modules to our component.

**This basic principle of how the Vuex store is structured, can be scaled up to large applications and it enables us to reuse large parts of the module code**. If you want to see the application in action, you can go to [the live demo on Netlify](https://how-to-structure-a-complex-vuex-store.netlify.com/) and you can see [the full code on GitHub](https://github.com/maoberlehner/how-to-structure-a-complex-vuex-store).

<div>
  <hr class="c-hr">
  <div class="c-service-info">
    <h2>Do you want to learn more about using Vuex at scale?</h2>
    <p class="c-service-info__body">
      Register for the Newsletter of my upcoming book: <a class="c-anchor" href="https://oberlehner.us20.list-manage.com/subscribe?u=8476a98c5640f6c7b5530ea57&id=8b26bf120b" data-event-category="link" data-event-action="click: newsletter" data-event-label="Newsletter (article content)">Advanced Vue.js Application Architecture</a>.
    </p>
  </div>
  <hr class="c-hr">
</div>

## Summary

Let's take a short look at what we've achieved and how this approach of structuring a Vuex store is different to more traditional approaches.

### Dynamically loading of modules

Because we're not globally registering all of our modules upfront, it's possible to [use webpacks code splitting feature in combination with the vue-router](https://markus.oberlehner.net/blog/setting-up-a-pwa-with-vue-vue-router-and-webpack-code-splitting/), to **dynamically load components and their associated store modules**. This makes the app bundle size smaller which can have a **huge effect on the initial loading time**, especially with large scale applications.

### Maximum reusability

Designing our store structure in a way which makes certain modules reusable, can have an **enormous positive impact on maintainability and also bundle size**, when the application is getting bigger. The key to success with this strategy, is to come up with strict rules for naming and structuring your modules, so that they all adhere to a certain API and are named in a predictable way.

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

## Closing remarks

Admittedly, the approach we've looked at in this article, is designed to solve a very specific use case. You might have to adapt certain aspects of it to your own needs. But I hope this article will serve as an inspiration for a powerful solution which fits your specific use case.
