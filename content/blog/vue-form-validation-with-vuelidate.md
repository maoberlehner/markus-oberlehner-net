+++
date = "2018-01-14T08:01:21+02:00"
title = "Vue.js Form Validation with Vuelidate"
description = "Learn how to validate forms in Vue.js with Vuelidate and how to trigger the browser to scroll to the first validation error and focus the input element."
intro = "In todays article we're going to build a simple contact form with inline validation powered by Vuelidate. One of the best features of Vuelidate is its relatively small footprint..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
+++

In todays article we're going to build a simple contact form with inline validation powered by [Vuelidate](https://monterail.github.io/vuelidate/). One of the best features of Vuelidate is its relatively **small footprint which is about 4.2 kB** (gzipped). But the small package size comes with a cost: Vuelidate focuses on validation only. It's the task of us programmers to add further functionality like displaying validation error messages and scrolling to the first validation error.

[The full code which is featured in this article is available on GitHub](https://github.com/maoberlehner/vue-form-validation-with-vuelidate).

## Input and textarea components

For this article, I presume that you have a Vue.js app up and running. So let's start right away with building all the necessary components.

Before we can get started building our contact form component, we first need the building blocks which we're going to use. In our contact form we want to ask our users for their name, email and a message which they might want to leave for us. For the name and the email fields we'll use an `<input>` HTML element which we're going to render in an `AppInput` component. For the message field we'll build an `AppTextarea` component which will render a `<textarea>` HTML tag.

### The AppInput component

The only thing special about the `AppInput` component will be that it should have a red border if we pass a property `status` with the value `error`.

```html
<template>
  <input
    class="AppInput"
    :class="{ [`has-status-${status}`]: status }"
    @input="$emit('input', $event.target.value)">
</template>

<script>
export default {
  name: 'AppInput',
  props: {
    status: {
      type: String,
    },
  },
};
</script>

<style>
.AppInput {
  padding: 1em;
  border: 1px solid grey;
  border-radius: 0.25rem;
}

.AppInput.has-status-error {
  border-color: red;
}
</style>
```

In the code above we conditionally set a status class `has-status-*` if the value of the property `status` is truthy (e.g. `error`). In the next line of the template we listen for the `input` event to emit our own `input` event with the current input value. We're doing this to make it possible to bind a `v-model` directive onto our component.

Other than that, we're defining the `status` property and we're adding some very basic styling.

### The AppTextarea component

The component to render a `<textarea>` for our message field looks pretty similar to the `AppInput` component. The only difference is, that we're using a `<textarea>` HTML tag instead of an `<input>` tag.

```html
<template>
  <textarea
    class="AppTextarea"
    :class="{ [`has-status-${status}`]: status }"
    @input="$emit('input', $event.target.value)"
  >
  </textarea>
</template>

<script>
export default {
  name: 'AppTextarea',
  props: {
    status: {
      type: String,
    },
  },
};
</script>

<style>
.AppTextarea {
  padding: 1em;
  border: 1px solid grey;
  border-radius: 0.25rem;
}

.AppTextarea.has-status-error {
  border-color: red;
}
</style>
```

## The contact form component

Now that we've collected all the building blocks necessary for our little `ContactForm` component, we can put them together.

```html
<template>
  <div class="ContactForm">
    <div class="ContactForm__element">
      <label for="name" class="ContactForm__label">Name</label>
      <app-input id="name" v-model="name"></app-input>
    </div>

    <div class="ContactForm__element">
      <label for="email" class="ContactForm__label">Email</label>
      <app-input id="email" type="email" v-model="email"></app-input>
    </div>

    <div class="ContactForm__element">
      <label for="message" class="ContactForm__label">Message</label>
      <app-textarea id="message" v-model="message"></app-textarea>
    </div>

    <button>Submit</button>
  </div>
</template>

<script>
import AppInput from './AppInput';
import AppTextarea from './AppTextarea';

export default {
  name: 'ContactForm',
  components: {
    AppInput,
    AppTextarea,
  },
  data() {
    return {
      name: '',
      email: '',
      message: '',
    };
  },
};
</script>

<style>
.ContactForm > :not(:first-child) {
  margin-top: 1em;
}

.ContactForm__label {
  display: block;
}
</style>
```

What you can see above, is a very basic implementation of a contact form in Vue. We're using the form field components which we've created in the previous steps and bind them to a `data` value with `v-model`.

To render the `ContactForm` component, we must add it in our `App` root component.

```html
<template>
  <div id="app">
    <contact-form></contact-form>
  </div>
</template>

<script>
import ContactForm from './components/ContactForm';

export default {
  name: 'App',
  components: {
    ContactForm,
  },
};
</script>
```

## Installing Vuelidate

Now that we've successfully created a simple contact form component, let's move on by adding validation functionality with Vuelidate.

```bash
npm install --save vuelidate
```

**There are two ways how to integrate Vuelidate into our Vue.js app**. We can either use it globally as a Vue plugin `Vue.use(Vuelidate)` or as a mixin. Because **using it as a mixin, allows for better bundle optimizations via webpack**, we're going to use the second approach.

Furthermore we want to make our code as reusable as possible. Mixins, in Vue.js, are a great way to achieve that goal. Let's create a new form mixin which we'll later use to handle all our generic form related logic for us.

```js
// src/mixins/form.js
import { validationMixin } from 'vuelidate';

export default {
  mixins: [validationMixin],
};
```

Currently, the only purpose of our form mixin is to extend the Vuelidate validation mixin but we'll add more functionality later.

### Integrating the Vuelidate mixin into the contact form

With our form mixin ready, we can use it to extend the functionality of our contact form with validation capabilities.

```js
import { email, required } from 'vuelidate/lib/validators';

import formMixin from '../mixins/form';

// ...

export default {
  name: 'ContactForm',
  mixins: [formMixin],
  // ...
  validations: {
    name: {
      required,
    },
    email: {
      required,
      email,
    },
    message: {
      required,
    },
  },
};
```

In the code above, we're importing the validation rules `email` and `required` from the Vuelidate default validators in the Vuelidate package. We're also importing the form mixin we've created previously and add it to the `mixins` array of our `ContactForm` component. Last but not least, you can see a new `validations` property, which we're using to define the validation rules for our form fields.

### Displaying validation error messages

Theoretically speaking, validation would already work with this configuration, but we're not triggering it yet and furthermore there is absolutely no feedback we're providing for the user to let them know that something is wrong. Let's change that.

```html
<template>
  <div class="ContactForm">
    <div class="ContactForm__element">
      <label for="name" class="ContactForm__label">Name</label>
      <app-input
        id="name"
        v-model="name"
        :status="$v.name.$error ? 'error' : null"
        @blur="$v.name.$touch()"
      >
      </app-input>
      <ul class="ContactForm__messages" v-if="$v.name.$error">
        <li v-if="!$v.name.required">
          This field is required.
        </li>
      </ul>
    </div>

    <div class="ContactForm__element">
      <label for="email" class="ContactForm__label">Email</label>
      <app-input
        id="email"
        type="email"
        v-model="email"
        :status="$v.email.$error ? 'error' : null"
        @blur="$v.email.$touch()"
      >
      </app-input>
      <ul class="ContactForm__messages" v-if="$v.email.$error">
        <li v-if="!$v.email.required">
          This field is required.
        </li>
        <li v-if="!$v.email.email">
          Please enter a valid email address.
        </li>
      </ul>
    </div>

    <div class="ContactForm__element">
      <label for="message" class="ContactForm__label">Message</label>
      <app-textarea
        id="message"
        v-model="message"
        :status="$v.message.$error ? 'error' : null"
        @blur="$v.message.$touch()"
      >
      </app-textarea>
      <ul class="ContactForm__messages" v-if="$v.message.$error">
        <li v-if="!$v.message.required">
          This field is required.
        </li>
      </ul>
    </div>

    <button @click="$v.$touch()">
      Submit
    </button>
  </div>
</template>
```

Let's walk through this step by step. The first thing that's changed is that we're now passing a value for the `status` property to the form field components: `:status="$v.name.$error ? 'error' : null"`. The `$v` object is provided by Vuelidate. With `$v.name.$error` we can check if the value of the `name` property is valid or not – if it's not valid we're passing the string `error` to the form field component, otherwise `null`. Passing `error` as status to the component, will trigger it to change its border color to red.

Next we've added a `blur` event listener onto the form field components: `@blur="$v.name.$touch()`. By calling the `$touch()` method, we're triggering Vuelidate to check the validation status of the field.

To render the error messages, we're using an unordered list. The list will only be rendered if the corresponding field has triggered validation and it wasn't validated successfully.

```js
<ul class="ContactForm__messages" v-if="$v.name.$error">
  <li v-if="!$v.name.required">
    This field is required.
  </li>
</ul>
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

## Scroll to the first error

Now that we've implemented the basic functionality of our contact form and we've also set up validation, let's add one further enhancement. **It's general a good practice to focus the first form field with a validation error**. And oftentimes it's even inevitable to somehow **guide the user to the form field which they've entered incorrectly because the error message might not be visible otherwise**, causing the user to be confused.

```js
// src/mixins/form.js
import { validationMixin } from 'vuelidate';

export default {
  mixins: [validationMixin],
  methods: {
    focusFirstStatus(component = this) {
      if (component.status) {
        component.$el.focus();
        return true;
      }

      let focused = false;

      component.$children.some((childComponent) => {
        focused = this.focusFirstStatus(childComponent);
        return focused;
      });

      return focused;
    },
    validate() {
      this.$v.$touch();
      this.$nextTick(() => this.focusFirstStatus());
    },
  },
};
```

In the code above, we've added two new methods. The `focusFirstStatus()` function recursively searches for the first component with a `status` and sets the focus on the HTML element of the component. **This triggers the browser to automatically scroll the focused element into view, so the user can see the validation error**.

The `validate()` method triggers Vuelidate to check the current validation status with `this.$v.$touch()`. In the next line we're waiting for the next tick in order to make sure that Vue has updated all the components according to the new validation status and then we call the `focusFirstStatus()` function to scroll to the first validation error.

To trigger the newly created validation function, we have to change the event handler on the submit button in the `ContactForm` component.

```html
<button @click="validate">
  Submit
</button>
```

<hr class="c-hr">
<div class="c-service-info">
  <h2>Do you have any questions?</h2>
  <p class="c-service-info__body">
    <a class="c-anchor" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">You can find me on Twitter</a>.
  </p>
</div>
<hr class="c-hr">

## Final thoughts

Vuelidate is one of the most minimal validation plugins for Vue – functionality wise and in terms of file size. I'm personally a fan of minimal plugins and packages, even though it oftentimes means you have to code some important functionality yourself.

**The end result is usually a lightweight, custom tailored solution, which does exactly what you want**, without wasting precious resources for stuff you don't need.

If you want to dive deeper, you can checkout [the code on GitHub](https://github.com/maoberlehner/vue-form-validation-with-vuelidate).
