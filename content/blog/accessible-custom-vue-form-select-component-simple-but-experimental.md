+++
date = "2019-07-21T05:16:16+02:00"
title = "Accessible Custom Vue.js Select Component Part 1: Simple but Experimental"
description = "Learn about a possible solution for building an accessible custom select component with Vue.js."
intro = "Unfortunately, accessibility (a11y) is often treated as an afterthought by many of us developers, including myself. For me, there are two reasons why I often don't treat a11y as a priority: approaching deadlines and lack of knowledge..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "a11y"]
images = ["/images/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1542158516/blog/2019-07-21/simple-vue-custom-select-component"]
+++

Unfortunately, accessibility (a11y) is often treated as an afterthought by many of us developers, including myself. For me, there are two reasons why I often don't treat <abbr title="accessibility">a11y</abbr> as a priority: **approaching deadlines and lack of knowledge.**

In the last two weeks I've taken the time to build a simple but in my opinion also quite nifty custom Multi-Select Vue.js component with the goal of making it work very well for **keyboard and screen reader users.**

## The basics

Making custom form components that behave exactly like their native counterparts can be quite challenging. **Ideally, we can stick to native form inputs such as radio buttons, checkboxes and select elements.** But unfortunately this is not always possible. Sometimes we just don't have enough space to put 10 checkboxes beneath each other, or we have very strict design guidelines that we have to adhere to.

The following experiment is an attempt to combine the best of two worlds: the perfect accessibility of native form elements and the aesthetics of a custom built solution.

## A simple and accessible custom select component

The basic idea of this solution is that because it takes a lot of work to recreate everything that standard form inputs provide out of the box in terms of <abbr title="accessibility">a11y</abbr>, I thought it might actually be smart to simply use native HTML form input elements.

```html
<template>
  <FrameOutside
    @click="optionsVisible = false"
    @focus="optionsVisible = false"
  >
    <div
      class="FormSelect"
      :style="optionsVisible && 'z-index: 300'"
      @focus.capture="handleFocus"
    >
      <fieldset
        class="FormSelect__control"
        :class="{ 'FormSelect__control--focus': optionsVisible }"
      >
        <legend
          class="FormSelect__legend"
          @click="optionsVisible = !optionsVisible"
        >
          <div class="FormSelect__legend-body">
            <span
              class="FormSelect__placeholder"
              :class="{ 'u-visually-hidden': valueString }"
            >
              {{ legend }}
            </span>
            <span
             v-if="valueString"
             aria-hidden="true"
             class="FormSelect__value"
            >
              {{ valueString }}
            </span>
          </div>
          <SvgAngle
            class="FormSelect__icon"
            :class="{ 'FormSelect__icon--rotate-180': optionsVisible }"
          />
        </legend>
        <div
          class="FormSelect__options"
          :class="{ 'u-visually-hidden': !optionsVisible }"
        >
          <label
            v-for="option in options"
            :key="option.label || option"
            class="FormSelect__option"
          >
            <!-- Using a dynamic :type is not possible because of an IE11 bug. -->
            <input
              v-if="multiSelect"
              v-model="localValue"
              :value="option.value || option"
              type="checkbox"
              class="FormSelect__input"
            >
            <input
              v-else
              v-model="localValue"
              :value="option.value || option"
              type="radio"
              class="FormSelect__input"
            >
            {{ option.label || option }}
          </label>
        </div>
      </fieldset>
    </div>
  </FrameOutside>
</template>
```

Above you can see the markup of our custom `FormSelect` component. Instead of only `<div>` and `<span>` tags we use native form elements like `<fieldset>`, `<legend>` and `<input>`. That way we have perfect accessibility out of the box (as long as we don't destroy it by using `display: none` on the wrong things for example).

The `FrameOutside` renderless component takes care of `click` and `focus` events happening **outside** of the component. We react to these events to hide the dropdown if it was previously opened.

In order to make the component work as similar as possible to a normal `<fieldset>`, we open the dropdown as soon as the component receives focus. **We use a `u-visually-hidden` utility class for hiding the element visually, but not from screen readers to achieve this.**

Beware: as [Manuel Matuzović](https://twitter.com/mmatuzo) pointed out when I showed him this concept, **this can be problematic if there are a lot of options.**

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

```html
<script>
// src/components/FormSelect.vue
import FrameOutside from './FrameOutside';
import SvgAngle from './SvgAngle.vue';

export default {
  name: 'FormSelect',
  components: {
    FrameOutside,
    SvgAngle,
  },
  model: {
    event: 'change',
  },
  props: {
    legend: {
      type: String,
      default: 'Select',
    },
    options: {
      type: Array,
      default: () => [],
    },
    value: {
      type: [Array, String, Number],
      default: '',
    }
  },
  data() {
    return {
      optionsVisible: false,
    };
  },
  computed: {
    valueString() {
      return this.multiSelect ? this.value.join(', ') : this.value;
    },
    localValue: {
      get() {
        return this.value;
      },
      set(data) {
        this.$emit('change', data);
      },
    },
    multiSelect() {
      return Array.isArray(this.value);
    },
  },
  methods: {
    handleFocus(e) {
      // Fix IE11 quirks.
      if (e.target.tagName === 'DIV') return;
      this.optionsVisible = true;
    },
  },
};
</script>
```

Above you can see that not much logic is needed to make this component work. As soon as the component receives focus, `handleFocus()` is called and we set `optionsVisible` to `true` to show the list of possible options.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/experimental-accessible-custom-select-fields-with-vuejs-h3c0e?fontsize=14&module=%2Fsrc%2Fcomponents%2FFormSelect.vue" title="Experimental Accessible Custom Select Fields with Vue.js" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

### Caveats

There is one big problem with this solution: **it doesn't work very well with a lot of options.** Imagine you have a list of 10 or more, maybe even dozens of options, in which case a keyboard user must tab over all 10+ options to move to the next form element.

[Manuel Matuzović](https://twitter.com/mmatuzo), who I asked to have a look at this component, suggested to me that **if you only have a few options, why not use checkboxes and radio buttons as usual?** Strictly speaking, **apart from aesthetics, there is no good reason to use this component.** But sometimes you need the extra pixels you can save with this solution instead of displaying a list of checkboxes or radio buttons. And sometimes aesthetics are more important than the most straightforward solution.

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

It took me a lot of time to build this simple component. A lot more than I want to admit. But I've learned a lot and I'm confident that the more I have <abbr title="accessibility">a11y</abbr> in mind when building new components, the faster I'll become, because I already know what works well and what doesn't. In the next article in this two-part series, we will examine how to create a custom select component that is also suitable for dealing with large datasets.

A special thanks goes to [Manuel Matuzović](https://twitter.com/mmatuzo), who challenged my solution and made me aware of its potential flaws, which motivated me to dig deeper and write the second part of this series where we'll learn **how to build a fully accessible custom form select component which behaves exactly like a native select element.**
