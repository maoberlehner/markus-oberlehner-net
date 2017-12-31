+++
date = "2017-12-31T11:22:24+02:00"
title = "Form Fields, Two-Way Data Binding and Vuex"
description = "Learn how to handle form data the Vuex way and how to use Vue.js two-way data binding in combination with Vuex."
intro = "One of the most valuable features that Vue.js has to offer, is painless two-way data binding. By using the `v-model` directive, you can quickly set up two-way data binding on form elements..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Vuex"]
+++

One of the most valuable features that Vue.js has to offer, is painless two-way data binding. By using the `v-model` directive, you can quickly set up two-way data binding on form elements.

```html
<template>
  <input v-model="message">
</template>

<script>
export default {
  data() {
    // Changing the value of `message` here
    // or changing the value of the `input`
    // directly, updates the value in both
    // places.
    return { message: '' },
  },
};
</script>
```

So far so good. But as our application is growing, we might want to use a more powerful, but also a more complex state management pattern like Vuex. One of the core principles of state management patterns like Vuex is immutability: we're not allowed to change the state in a Vuex store directly, but we have to use so called “mutations” to trigger state changes.

## Vuex form handling

Let's take our first example and modify it to use a Vuex store for state management.

```html
<template>
  <input v-model="form.message">
</template>

<script>
export default {
  data() {
    return {
      // Attention: this is the
      // wrong way of doing this!
      form: this.$store.state.form,
    };
  },
};
</script>
```

To make this work we need to set up a new Vuex store instance.

```js
// ...

export default new Vuex.Store({
  strict: true,
  state: {
    form: { message: '' },
  },
});
```

If we check this out in the browser, it works – kinda. Although updating the value of the input field directly will update the value in the store and updating the value in the store will update the text in the input, if we take a look at the browser console, we can see, that this is not the correct way of implementing this.

```
Error: [vuex] Do not mutate vuex store state outside mutation handlers.
```

Because we've initialized the Vuex store in strict mode (which you should definitely do in your development environment), we get an error message telling us that it is not allowed to mutate the Vuex store outside of a mutation handler.

### Correct ways of handling form data with Vuex

If we take a look at the [chapter about form handling in the official Vuex documentation](https://vuex.vuejs.org/en/forms.html) we can read about two recommended ways of how to handle form data with Vuex.

Although both recommendations are pretty straightforward as long as you're dealing with just a few form fields, they quickly become cumbersome when dealing with a lot of form fields.

```html
<template>
  <input v-model="firstName">
  <input v-model="lastName">
  <input v-model="message">
  <!-- ... -->
</template>

<script>
export default {
  computed: {
    firstName: {
      get() {
        return this.$store.state.form.firstName;
      },
      set(value) {
        this.$store.commit('updateFirstName', value);
      },
    },
    lastName: {
      get() {
        return this.$store.state.form.lastName;
      },
      set(value) {
        this.$store.commit('updateLastName', value);
      },
    },
    message: {
      get() {
        return this.$store.state.form.message;
      },
      set(value) {
        this.$store.commit('updateMessage', value);
      },
    },
    // ...
  },
};
</script>
```

As you can see in the example above, although the officially recommended way of using two-way computed properties is pretty straightforward and works perfectly fine, it becomes tedious to handle more than a few form fields this way. If we take a closer look, we can see there is a lot of repetition in this code. Where there's repetition, there's potential to do some refactoring / abstraction.

### Using vuex-map-fields for simple Vuex form handling

After fiddling around with some code to come up with a reusable implementation of the two-way computed property approach, I decided to create a new npm package for handling Vuex powered form fields: [vuex-map-fields](https://github.com/maoberlehner/vuex-map-fields).

With `vuex-map-fields` we can take the code from above and refactor it.

```html
<template>
  <input v-model="firstName">
  <input v-model="lastName">
  <input v-model="message">
  <!-- ... -->
</template>

<script>
import { mapFields } from 'vuex-map-fields';

export default {
  computed: {
    ...mapFields([
      'form.firstName',
      'form.lastName',
      'form.message',
      // ...
    ]),
  },
};
</script>
```

`vuex-map-fields` also provides the mutation and getter functions needed to retrieve and mutate data.

```js
// ...

import { getField, updateField } from 'vuex-map-fields';

export default new Vuex.Store({
  strict: true,
  state: {
    form: {
      firstName: '',
      lastName: '',
      message: '',
      // ...
    },
  },
  getters: {
    getField,
  },
  mutations: {
    updateField,
  },
});
```

`vuex-map-fields` is taking care of creating the necessary getter and setter functions for the two-way computed properties. The `updateField()` mutation in the store takes care of mutating the corresponding field value when the field is updated.

## Final thoughts

I was really surprised to learn that there is no convenient way, how to handle form field data with Vuex. Usually with Vue we're used to an amazing “out of the box experience” but not so much with handling two-way data binding on form fields in combination with Vuex.

`vuex-map-fields` can help with dealing with this problem and doing so without having a very large footprint – the file size of `vuex-map-fields` is just about 690 bytes (gziped).

I hope this article and the `vuex-map-fields` package are helpful for some people.
