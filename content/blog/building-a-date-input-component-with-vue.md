+++
date = "2018-04-15T10:42:42+02:00"
title = "Building a Date Input Component with Vue.js"
description = "Learn how to build a custom date input component with Vue.js including timestamp conversion and automatically focusing the correct input fields."
intro = "Today we're going to build a custom date input component powered by Vue.js. Although there is a native date input type available in all modern browsers, there are certain situations where the native date input field falls short. So let us take a look at how we can build a custom date input field with Vue.js..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
+++

Today we're going to build a custom date input component powered by Vue.js. Although there is a native date input type available in all modern browsers, there are [certain situations where the native date input field falls short](http://html5doctor.com/the-woes-of-date-input/). So let us take a look at how we can build a custom date input field with Vue.js.

<div class="c-content__figure">
  <div class="c-content__broad">
    <video src="/videos/2018-04-15/vue-date-input-component.mp4" autoplay muted loop></video>
  </div>
  <p class="c-content__caption">
    <small>Custom date input field powered by Vue.js</small>
  </p>
</div>

If you want to play around with the component we will build in this article yourself, you can find a working example of [the date input component on GitHub](https://github.com/maoberlehner/building-a-date-input-component-with-vue) or you can take a look at a [demo running on Netlify](https://building-a-date-input-component-with-vue.netlify.com).

## The markup

We begin with defining the basic markup for our date input element. There are two ways of how to achieve the goal we have in mind. One possibility would be to use a single `<input>` element and use some JavaScript magic to limit the input capabilities so that it looks like a date. The second option, which is the one we will use in this article, is to use separate `<input>` elements for every portion of the date (day, month and year).

```html
<template>
  <div class="FormDate">
    <input
      class="FormDate__input FormDate__input--day"
      type="number"
      placeholder="dd">
    <span class="FormDate__divider">/</span>
    <input
      class="FormDate__input FormDate__input--month"
      type="number"
      placeholder="mm">
    <span class="FormDate__divider">/</span>
    <input
      class="FormDate__input FormDate__input--year"
      type="number"
      placeholder="yyyy">
  </div>
</template>
```

Above we can see our template which consists of a wrapper div, which we'll use later to style the date field, and three separate `<input>` elements for the day, month and year parts of the date.

## Conditional rendering

In the next step, because there might be situations where we only need the month and the year of a date but no day, we want to make it possible to conditionally render only certain parts of our date field.

```html
<template>
  <div class="FormDate">
    <input
      v-if="showDay"
      class="FormDate__input FormDate__input--day"
      type="number"
      placeholder="dd">
    <span
      v-if="showDay && showMonth"
      class="FormDate__divider"
    >/</span>
    <input
      v-if="showMonth"
      class="FormDate__input FormDate__input--month"
      type="number"
      placeholder="mm">
    <span
      v-if="showYear && (showDay || showMonth)"
      class="FormDate__divider"
    >/</span>
    <input
      v-if="showYear"
      class="FormDate__input FormDate__input--year"
      type="number"
      placeholder="yyyy">
  </div>
</template>

<script>
export default {
  name: 'FormDate',
  props: {
    showDay: {
      type: Boolean,
      default: true,
    },
    showMonth: {
      type: Boolean,
      default: true,
    },
    showYear: {
      type: Boolean,
      default: true,
    },
  },
};
</script>
```

As you can see above, we've added three properties which make it possible to conditionally show or hide certain parts of the date. To toggle rendering of the `<input>` elements, we've added `v-if` directives onto them. It gets a little bit more complicated when we take a look at the `v-if` directives on the divider `<span>` elements.

The first divider is only shown if the day and the month input field are both activated. If only one of them is activated, the divider is not needed because the next divider element comes into play.

The second divider is only rendered if the year and either the day field or the month field is activated. If neither of the later two is activated, the divider is not needed.

If we want to initialize the component with one (or two) of the date input options disabled, we can do so by specifying the relevant properties when initializing the component.

```html
<form-date :show-day="false"/>
```

## Make it beautiful

Now that the basic functionality is implemented and the template is ready, we can proceed to make our date input form component beautiful.

```scss
.FormDate {
  $spacing: 0.75em;

  display: inline-flex;
  position: relative;
  overflow: hidden;
  border: 1px solid #888;
  border-radius: 0.25em;

  // 1. Hide the spinner button in Chrome, Safari and Firefox.
  &__input {
    padding: $spacing;
    padding-right: $spacing / 2;
    padding-left: $spacing / 2;
    border: none;
    text-align: center;
    -moz-appearance: textfield; // 1

    &::-webkit-inner-spin-button {
      display: none; // 1
    }

    &:first-child {
      padding-left: $spacing;
    }

    &:last-child {
      padding-right: $spacing;
    }

    &:focus {
      outline: none;
    }

    &--day,
    &--month {
      width: 3em;
    }

    &--year {
      width: 4em;
    }
  }

  &__divider {
    padding-top: $spacing;
    padding-bottom: $spacing;
    pointer-events: none;
  }
}
```

In the SCSS code above, we're styling the wrapper `<div>` to look like a form element. The styles of the `<input>` elements itself, are reset so they do not look like `<input>` elements anymore. This is mostly achieved by removing the border.

By setting the `-moz-appearance` to `textfield` and by hiding the `::-webkit-inner-spin-button` pseudo element, we remove the spinner buttons which are displayed by default on `<input>` elements of type number.

Also, we're resetting the focus styles of the `<input>` elements, keep in mind tough, that you absolutely should implement your own (fake) focus styles on the wrapper `<div>`.

Depending on the font you are using, you might have to use different values for the width of the `<input>` elements.

On the divider element, we're disabling `pointer-events` to prevent users from accidentally selecting the divider `/` characters.

## Emitting a value

Now that the foundation is laid, we can start to make our component behave like a real form element. In order to achieve this goal, it must be possible to pass a `value` property to our component, which is automatically updated when the value of the component changes.

```html
<template>
  <div
    class="FormDate"
    @keyup.capture="updateValue"
  >
    <input
      v-if="showDay"
      v-model="day"
      class="FormDate__input FormDate__input--day"
      type="number"
      placeholder="dd">
    <span
      v-if="showDay && showMonth"
      class="FormDate__divider"
    >/</span>
    <input
      v-if="showMonth"
      v-model="month"
      class="FormDate__input FormDate__input--month"
      type="number"
      placeholder="mm">
    <span
      v-if="showYear && (showDay || showMonth)"
      class="FormDate__divider"
    >/</span>
    <input
      v-if="showYear"
      v-model="year"
      class="FormDate__input FormDate__input--year"
      type="number"
      placeholder="yyyy">
  </div>
</template>

<script>
export default {
  name: 'FormDate',
  props: {
    value: {
      type: [Number, String],
      required: true,
    },
    // ...
  },
  data() {
    return {
      day: `${this.value ? new Date(this.value).getDate() : ''}`,
      month: `${this.value ? new Date(this.value).getMonth() + 1 : ''}`,
      year: `${this.value ? new Date(this.value).getFullYear(): ''}`,
    };
  },
  methods: {
    updateValue() {
      const timestamp = Date.parse(`${this.year.padStart(4, 0)}-${this.month}-${this.day}`);

      if (Number.isNaN(timestamp)) return;

      this.$emit('input', timestamp);
    },
  },
};
</script>

<style lang="scss">
.FormDate {
  // ...
}
</style>
```

Let us walk through the changes one by one. First of all we've added a new `@keyup` event handler onto the wrapper `<div>`. Thanks to the `capture` modifier, we're able to listen to all the `keyup` events which are happening inside of our component and we trigger the `updateValue()` method if we register such an event.

### Transforming the value

On the `<input>` elements, we've added `v-model` directives. The `v-model` directives are linking the value of the input field with the corresponding variable which we've defined in the `data()` method of the component.

Next, in the `<script>` part of the code above, we can see a new `value` property which is used to pass an initial value to the component. In this example we're using a combination of the types `Number` and `String` for the value because we want to use a timestamp in milliseconds or an empty string (for no value) as the value of our date component. But you could change this to be an instance of `Date` for example.

The new `data()` method transforms the timestamp which is stored in `value` into a `day`, `month` and `year` representation using the JavaScript `Date` object. Because we want to handle the values of the input fields as strings, we use backticks to transform the values of type `Number`, which are returned by the methods of the date object, to strings. If an empty `value` is set, the values for `day`, `month` and `year` will be set to empty strings.

### Updating the value

At the bottom of the code snippet above, we can see the `updateValue()` function. We're using this function to convert the three separate values for day, month and year into a timestamp which we emit as an `input` event. Emitting an `input` event, triggers a Vue.js component to update its value if it's bound with `v-model` when the component is initialized.

We use `Date.parse()` to create a timestamp (number of milliseconds since January 1, 1970, 00:00:00 UTC) of the values of the three input fields of our component. Because the JavaScript date object has its quirks, although, for example, the year `01.08.10` should be a valid date, JavaScript can't handle years consisting of less than four digits. So we have to use `this.year.padStart(4, 0)` to fill up years below 1000 with `0` – so `01.08.10` becomes `01.08.0010`.

If `Date.parse()` can not successfully parse the given date, the return value is not a number. To prevent emitting an invalid timestamp as the value of the component, we check if the timestamp is not a number with `Number.isNaN()` and only if the timestamp is a valid number, are we emitting an `input` event with the new value of the component.

## Usability improvements

Although, as of now, we already have a working date component, the usability (and the styling) is not that great. Let us make some improvements to our component to enhance the overall usability.

```html
<template>
  <div
    class="FormDate"
    @keyup.capture="updateValue"
  >
    <input
      v-if="showDay"
      ref="day"
      v-model="day"
      class="FormDate__input FormDate__input--day"
      type="number"
      placeholder="dd"
      @input="updateDay"
      @blur="day = day.padStart(2, 0)">
    <span
      v-if="showDay && showMonth"
      class="FormDate__divider"
    >/</span>
    <input
      v-if="showMonth"
      ref="month"
      v-model="month"
      class="FormDate__input FormDate__input--month"
      type="number"
      placeholder="mm"
      @input="updateMonth"
      @blur="month = month.padStart(2, 0)">
    <span
      v-if="showYear && (showDay || showMonth)"
      class="FormDate__divider"
    >/</span>
    <input
      v-if="showYear"
      ref="year"
      v-model="year"
      class="FormDate__input FormDate__input--year"
      type="number"
      placeholder="yyyy"
      @blur="year = year.padStart(4, 0)">
  </div>
</template>

<script>
export default {
  // ...
  watch: {
    year(current, prev) {
      if (current > 9999) this.year = prev;
    },
  },
  methods: {
    updateDay() {
      if (!this.day.length || parseInt(this.day, 10) < 4) return;
      if (this.showMonth) this.$refs.month.select();
      else if (this.showYear) this.$refs.year.select();
    },
    updateMonth() {
      if (!this.month.length || parseInt(this.month, 10) < 2) return;
      if (this.showYear) this.$refs.year.select();
    },
    // ...
  },
};
</script>

<style lang="scss">
.FormDate {
  // ...
}
</style>
```

The first little improvement we can see directly in the template above, is that we've added `@blur` event listeners onto every `input` element. We're using the `blur` event to update the value of the affected field with a padded representation of the original value – so the day `1` becomes `01` or the year `100` becomes `0100` when the focus on an input field is lost.

### Handling focus

We also have added a second new event listener on the `day` and `month` fields. The `@input` event listener triggers an `updateDay()` or an `updateMonth()` method every time the user enters a new value in one of those `<input>` fields.

In the `updateDay()` method, we check if the currently entered day value is not empty (`!this.day.length`) or the newly entered value is below `4`. If a value was entered and if this value is larger than `4` we want to focus the next field (if one is rendered). The logic behind this is the following: there is no day, in any given month, larger than 31, so if the user enters a number larger than 3, they usually (if they made no mistake) are done with entering the day and usually the next step is to enter the month.

The `updateMonth()` function works pretty much the same, but because there is no month in the year with a number larger than 12, we check if the newly entered value is below `2` before, to determine if the next field should be focused or not.

### Limit the year input field

In the code in the `<script>` block above, you can also see a new `watch` section containing a `year()` method. This method is automatically triggered, every time the value of the year changes. We're using this method to effectively limit the digits of the year `<input>` field to 4. Keep in mind tough, that there might be situations where you want to allow more than 4 digits.

## Wrapping it up

It's always risky to re-implement features, which are already implemented in browsers, yourself. Oftentimes something like a `<input>` of type `date` seems much simpler than it really is – for example: in the current version, we're missing `:focus` styles, which is a huge usability no-no.

On the other hand tough, there are certain situations, where the native implementation is not feasibly for the product you are building. Thanks to Vue.js, we're able to build very powerful form components ourself.

You can find a working example of [the date input component we've built on GitHub](https://github.com/maoberlehner/building-a-date-input-component-with-vue) or you can take a look at a [demo running on Netlify](https://building-a-date-input-component-with-vue.netlify.com).
