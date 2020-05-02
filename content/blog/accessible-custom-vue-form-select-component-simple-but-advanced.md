+++
date = "2019-07-28T06:35:35+02:00"
title = "Accessible Custom Vue.js Select Component Part 2: Advanced"
description = "Learn how to build an accessible custom from select component with Vue.js using ARIA attributes."
intro = "Today, we will follow the W3C guidelines, on how to build a collapsible dropdown, very closely, to create a solid custom form select Vue.js component that works well for both keyboard and screen reader users as well as people who use a mouse or their finger to browse the web..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "a11y"]
images = ["/images/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1542158516/blog/2019-07-28/a11y-custom-vue-select-component"]
+++

This is the second article in a two-part series on how to build accessible, custom form select components with Vue.js. You can read about the first technique, which is more of a concept, [in my previous article](/blog/accessible-custom-vue-form-select-component-simple-but-experimental/).

Today, we will follow [the W3C guidelines](https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-collapsible.html), on how to build a collapsible dropdown, very closely, to create a solid custom form select Vue.js component that works well for both keyboard and screen reader users as well as people who use a mouse or their finger to browse the web.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/advanced-accessible-custom-select-fields-with-vuejs-09dz7?fontsize=14&module=%2Fsrc%2Fcomponents%2FFormSelect.vue" title="Advancced Accessible Custom Select Fields with Vue.js" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

## A more advanced accessible custom select component

Although the simple approach works quite well if you display only a few options, it is not ideal if you have to provide the user with dozens of options. In such cases, the best solution is to use the native `<select>` element. If for some reason this is not possible, the second best solution is to use a custom component which behaves exactly like a regular `<select>` element.

We want our custom component to come as close as possible to a native form element. This means that it should behave exactly like a normal `<select>` element when using either a mouse or a finger or the keyboard or a screenreader to navigate through the page.

```html
<template>
  <div
    class="FormSelect"
    @blur.capture="handleBlur"
  >
    <span :id="`${_uid}-label`">
      {{ label }}
    </span>
    <div class="FormSelect__control">
      <button
        ref="button"
        :id="`${_uid}-button`"
        aria-haspopup="listbox"
        :aria-labelledby="`${_uid}-label ${_uid}-button`"
        :aria-expanded="optionsVisible"
        class="FormSelect__button"
        @click="toggleOptions"
        @keyup.up.down.prevent="showOptions"
        @keyup.up.prevent="selectPrevOption"
        @keyup.down.prevent="selectNextOption"
      >
        {{ value }}
        <span v-if="!value" class="FormSelect__placeholder">
          {{ placeholder }}
        </span>
        <SvgAngle
          class="FormSelect__icon"
          :class="{ 'FormSelect__icon--rotate-180': optionsVisible }"
        />
      </button>
      <ul
        v-show="optionsVisible"
        ref="options"
        tabindex="-1"
        role="listbox"
        :aria-labelledby="`${_uid}-label`"
        :aria-activedescendant="activeDescendant"
        class="FormSelect__options"
        @focus="setupFocus"
        @keyup.up.prevent="selectPrevOption"
        @keyup.down.prevent="selectNextOption"
        @keydown.up.down.prevent
        @keydown.enter.esc.prevent="reset"
      >
        <li
          v-for="(option, index) in options"
          :key="option.label || option"
          :id="`${_uid}-option-${index}`"
          :aria-selected="activeOptionIndex === index"
          :class="activeOptionIndex === index && 'has-focus'"
          class="FormSelect__option"
          role="option"
          @click="handleOptionClick(option)"
        >
          {{ option.label || option }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import SvgAngle from './SvgAngle.vue';

export default {
  name: 'FormSelect',
  components: {
    SvgAngle,
  },
  model: {
    event: 'change',
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: 'Select',
    },
    options: {
      type: Array,
      default: () => [],
    },
    value: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      optionsVisible: false,
    };
  },
  computed: {
    activeOptionIndex() {
      return this.options.findIndex(
        x => x.value === this.value || x === this.value
      );
    },
    prevOptionIndex() {
      const next = this.activeOptionIndex - 1;
      return next >= 0 ? next : this.options.length - 1;
    },
    nextOptionIndex() {
      const next = this.activeOptionIndex + 1;
      return next <= this.options.length - 1 ? next : 0;
    },
    activeDescendant() {
      return `${this._uid}-option-${this.activeOptionIndex}`;
    },
  },
  methods: {
    handleOptionClick(option) {
      this.$emit('change', option);
      this.reset();
    },
    handleBlur(e) {
      if (this.$el.contains(e.relatedTarget)) return;
      this.hideOptions();
    },
    toggleOptions() {
      this.optionsVisible ? this.hideOptions() : this.showOptions();
    },
    async showOptions() {
      this.optionsVisible = true;
      await this.$nextTick();
      this.$refs.options.focus();
    },
    hideOptions() {
      this.optionsVisible = false;
    },
    async reset() {
      this.hideOptions();
      await this.$nextTick();
      this.$refs.button.focus();
    },
    setupFocus() {
      if (this.value) return;
      this.$emit('change', this.options[0]);
    },
    selectPrevOption() {
      this.$emit('change', this.options[this.prevOptionIndex]);
    },
    selectNextOption() {
      this.$emit('change', this.options[this.nextOptionIndex]);
    },
  },
};
</script>

<style lang="scss">
@import '../assets/theme';

.FormSelect {
  &__control {
    @include form-control();

    position: relative;
    padding: 0;
  }

  &__button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: $form-control-padding;
    background-color: transparent;
    border: none;
    outline: none;
  }

  &__placeholder {
    color: $placeholder-color;
  }

  &__icon {
    transition: transform 0.2s;

    &--rotate-180 {
      transform: rotate(180deg);
    }
  }

  &__options {
    margin: 0;
    padding: 0;
    list-style-type: none;
    outline: none;
  }

  &__option {
    padding: $form-control-padding;
    cursor: default;

    &.has-focus {
      background-color: rgba(#80bdff, 0.25);
    }
  }
}
</style>
```

Here you can see the code necessary to handle the basic functionality of a custom select field. We have to bind a lot of event listeners in order to deal with a ton of different ways how to control the dropdown with the keyboard. This solution already behaves very similar to a native form element, but there are two exceptions. First, in iOS it is not possible to jump to this field with the little arrows on the keyboard. Second, it is not possible to focus the custom selection component and press a key on the keyboard to jump to the first option that starts with the entered letters.

<div class="c-content__figure">
  <video
    data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1542158516/blog/2019-07-28/a11y-custom-vue-select-component-no-arrow.mp4"
    poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1542158516/blog/2019-07-28/a11y-custom-vue-select-component-no-arrow"
    muted
    autoplay
    loop
  ></video>
  <p class="c-content__caption">
    <small>The field doesn't receive focus</small>
  </p>
</div>

### iOS tab behavior

Let's take a look at what we can do about the iOS arrow problem. The only way I found around this is to add an invisible `<input>` element to trap the focus. As soon as this element gets focus it triggers the dropdown to open.

```diff
 <template>
   <div
     class="FormSelect"
+    @keydown.tab="tabKeyPressed = true"
     @blur.capture="handleBlur"
   >
     <span :id="`${_uid}-label`">
```

If we detect a real tab keypress (which means the user is not using the arrows on the iOS keyboard), we remove the focus trap because we don't need it in this case.

```diff
           :class="{ 'FormSelect__icon--rotate-180': optionsVisible }"
         />
       </button>
+      <!-- Focus trap for iOS keyboard navigation. -->
+      <input
+        v-if="!tabKeyPressed"
+        aria-hidden="true"
+        class="u-visually-hidden"
+        @focus="handleFocusTrap"
+      >
       <ul
         v-show="optionsVisible"
         ref="options"
```

```diff
   },
   data() {
     return {
+      tabKeyPressed: false,
       optionsVisible: false,
     };
   },
```

```diff
     }
   },
   methods: {
+    handleFocusTrap(e) {
+      this.optionsVisible = true;
+      this.$refs.button.focus();
+    },
     handleOptionClick(option) {
       this.$emit('change', option);
       this.reset();
```

As you can see in the following video, now we can detect if an iOS user is using the little arrows on the keyboard to navigate through the form and we can open the dropdown as soon as we trap the focus. Although it kinda works, this solution is far from ideal because the keyboard disappears and it doesn't feel exactly like with a regular `<select>` field.

<div class="c-content__figure">
  <video
    data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1542158516/blog/2019-07-28/a11y-custom-vue-select-component-arrow.mp4"
    poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1542158516/blog/2019-07-28/a11y-custom-vue-select-component-arrow"
    muted
    autoplay
    loop
  ></video>
  <p class="c-content__caption">
    <small>The field doesn't receive focus</small>
  </p>
</div>

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

### Select option based on first letter

A lesser-known feature of native `<select>` elements is that you can type the initial letters of an option to immediately select the first option that matches your input. This is especially important for very long lists of options. Let's take a look at how we can replicate this functionality in our custom component.

```diff
         @focus="setupFocus"
         @keyup.up.prevent="selectPrevOption"
         @keyup.down.prevent="selectNextOption"
+        @keydown="search"
         @keydown.up.down.prevent
         @keydown.enter.esc.prevent="reset"
       >
```

First, we bind a `keydown` event onto our options `<ul>` list in order to detect if the user uses the keyboard to search for an option.

```diff
 <script>
 import SvgAngle from './SvgAngle.vue';

+let resetKeysSoFarTimer;

 export default {
   name: 'FormSelect',
```

```diff
   },
   data() {
     return {
+      keysSoFar: '',
       tabKeyPressed: false,
       optionsVisible: false,
     };
   },
```

```diff
     selectNextOption() {
       this.$emit('change', this.options[this.nextOptionIndex]);
     },
+    search(e) {
+      clearTimeout(resetKeysSoFarTimer);
+      // No alphanumeric key was pressed.
+      if (e.key.length > 1) return;
+
+      resetKeysSoFarTimer = setTimeout(() => {
+        this.keysSoFar = '';
+      }, 500);
+
+      this.keysSoFar += e.key;
+      const matchingOption = this.options.find(x =>
+        (x.value || x).toLowerCase().startsWith(this.keysSoFar)
+      );
+
+      if (!matchingOption) return;
+
+      this.$emit('change', matchingOption);
+    },
   },
 };
 </script>
```

Here you can see how we handle user keyboard input while the options list has the focus. As long as the user is typing, we clear the `resetKeysSoFarTimer` so the user can search for the first option that starts with a sequence of letters.

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

## Wrapping it up

Making a custom form input component work exactly like their native counterparts is almost impossible to do. At least if our goal ist to target all common browsers and platforms. I myself have decided to use regular HTML form field elements wherever possible. But if you have to use a custom built solution, always try to make it work as good as possible for keyboard and screen reader users.

If you only have to make some minor tweaks to the looks of the select element I recommend you to read the following article by Scott Jehl: [Styling a Select Like It’s 2019](https://www.filamentgroup.com/lab/select-css.html).

## References

- [W3C, Collapsible Dropdown Listbox Example](https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-collapsible.html)
- [W3C, WAI-ARIA Authoring Practices – Listbox](https://www.w3.org/TR/wai-aria-practices-1.1/#Listbox)
- [Scott Jehl, Styling a Select Like It’s 2019](https://www.filamentgroup.com/lab/select-css.html)
