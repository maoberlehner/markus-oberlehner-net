+++
date = "2018-01-28T11:11:11+02:00"
title = "How to Handle Multi-row Forms with Vue, Vuex and vuex-map-fields"
description = "Learn how to handle multi-row form data the Vuex way with the vuex-map-fields package."
intro = "In one of my previous articles about form field handling in combination with Vuex, I introduced the vuex-map-fields package, which allows to conveniently map a list of fields to Vuex conform getter and setter functions. In today's article we take it a step further and we'll explore how we can use the latest release of vuex-map-fields to build a Vuex powered multi-row form..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Vuex"]
+++

In one of my previous articles about [form field handling in combination with Vuex](/blog/form-fields-two-way-data-binding-and-vuex/), I introduced the [vuex-map-fields](https://github.com/maoberlehner/vuex-map-fields) package, which allows to conveniently [map a list of fields to Vuex conform getter and setter functions](/blog/form-fields-two-way-data-binding-and-vuex/#using-vuex-map-fields-for-simple-vuex-form-handling).

In today's article we take it a step further and we'll explore how we can use the latest release of [vuex-map-fields](https://github.com/maoberlehner/vuex-map-fields) to build a Vuex powered multi-row form.

<div class="c-content__figure">
  <div class="c-content__broad">
    <video src="/videos/2018-01-28/vuex-map-fields-multi-row.mp4" autoplay loop muted></video>
  </div>
  <p class="c-content__caption">
    <small>Add and edit rows of form fields</small>
  </p>
</div>

## Multi-row form with Vue and Vuex

In our example form component, we want to have a form which makes it possible to enter and edit multiple rows of addresses. Also it should be possible to add new addresses on the fly. We want to handle the state of our multi-row form with Vuex.

### The Vuex store

Let's start with our basic data structure which we'll later fill with data from our multi-row form.

```js
// src/store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

// The `getField()` and `updateField()`
// helper functions, are needed to update
// the mapped fields in a Vuex conform manner.
import { getField, updateField } from 'vuex-map-fields';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // We add one empty address to
    // render the first form row.
    addresses: [
      {
        zip: '',
        town: '',
        street: '',
      },
    ],
  },
  getters: {
    getField,
  },
  mutations: {
    updateField,
    // We'll use this mutation to
    // dynamically add new rows.
    addAddressRow(state) {
      state.addresses.push({
        zip: '',
        town: '',
        street: '',
      });
    },
  },
});
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

### The component

We want the component to render all items of the `addresses` property, which we defined in the store above, as one row with form elements. **Also we want to be able, to dynamically add new rows to add additional addresses when needed**.

```html
<template>
  <div id="app">
    <div class="row" v-for="address in addresses">
      <div class="form-element">
        <label>
          ZIP: <input v-model="address.zip">
        </label>
      </div>
      <div class="form-element">
        <label>
          Town: <input v-model="address.town">
        </label>
      </div>
      <div class="form-element">
        <label>
          Street: <input v-model="address.street">
        </label>
      </div>
    </div>
    <button class="add-row" @click="addAddressRow">
      Add new address
  </button>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import { mapMultiRowFields } from 'vuex-map-fields';

export default {
  computed: {
    // The `mapMultiRowFields()` function of
    // the vuex-map-fields package, makes it
    // possible to dynamically map the fields
    // of multiple rows of data, to Vuex conform
    // getter and setter functions.
    ...mapMultiRowFields(['addresses']),
  },
  methods: {
    // We're using the native Vuex function
    // `mapMutations()` to map our mutation
    // for adding a new address row, to a
    // method with the same name as the mutation.
    ...mapMutations(['addAddressRow']),
  },
};
</script>

<style>
/* Some very basic styling */
.row:not(:first-child) {
  margin-top: 1em;
  padding-top: 1em;
  border-top: 1px solid #e2e2e2;
}

.form-element:not(:first-child) {
  margin-top: 0.5em;
}

.add-row {
  margin-top: 2em;
}
</style>
```

In the Vue component you can see above, we're using `v-for` to render rows of form elements to enter new, or edit existing addresses. We're using `mapMultiRowFields()` to map the array of address rows from the store, to a computed property named `addresses`. In the `methods` section of the component, we're using the native Vuex `mapMutations()` function to create a mapping from the store mutation to a method with the same name in our component.

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

## Recap

Handling form data with Vue in a way which does not mutate the Vuex store, can be a tricky thing to do. Even more tricky can it be to handle multi-row forms.

I hope for [vuex-map-fields](https://github.com/maoberlehner/vuex-map-fields) to be a useful tool in the utility belt of Vue developers to make handling form data with Vue and Vuex a more pleasant experience.

If you enjoyed this article, please **make sure to also read one of my previous articles about [form field handling in combination with Vuex](/blog/form-fields-two-way-data-binding-and-vuex/)**.
