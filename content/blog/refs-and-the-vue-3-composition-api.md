+++
date = "2020-06-07T09:33:33+02:00"
title = "$refs and the Vue 3 Composition API"
description = "Learn how to use $refs with the Vue 3 Composition API and how to create dynamic $refs."
intro = "If you’re used to working with Vue 2 $refs and switch to the Vue 3 Composition API, you might wonder how to use $refs inside the new setup() method. In this article, we find out how to use the new ref() function as a replacement for static and dynamic HTML element references..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
+++

If you’re used to working with Vue 2 `$refs` and switch to the Vue 3 Composition API, you might wonder how to use `$refs` inside the new `setup()` method. In this article, we find out how to use the new `ref()` function as a replacement for static and dynamic HTML element references.

## Static `$refs`

When using the Vue 3 Composition API via the `setup()` method, we don't have access to `this.$refs`, rather, we can use the new `ref()` function for the same result.

```html
<script>
import {
  onMounted,
  ref,
} from 'vue';

export default {
  setup() {
    const headline = ref(null);

    // Before the component is mounted, the value
    // of the ref is `null` which is the default
    // value we've specified above.
    onMounted(() => {
      // Logs: `Headline`
      console.log(headline.value.textContent);
    });

    return {
      // It is important to return the ref,
      // otherwise it won't work.
      headline,
    };
  },
};
</script>

<template>
  <div>
    <h1 ref="headline">
      Headline
    </h1>
    <p>Lorem ipsum ...</p>
  </div>
</template>
```

<div>
  <hr class="c-hr">
  <a
    style="display: block; margin-top: 1em;"
    href="https://www.creative-tim.com/templates/vuejs/?partner=143346"
  >
    <img
      src="/images/q_auto/v1532158514/blog/assets/high-quality-templates"
      alt="Screenshots of three premium Vue.js templates."
      style="max-width: 100%; height: auto;"
      loading="lazy"
      width="1240"
      height="530"
    >
  </a>
  <hr class="c-hr">
</div>

## Dynamic `$refs` in v-for

You might wonder how this can work with dynamic references. Luckily after a short chat with [Carlos Rodrigues](https://github.com/pikax), I knew the answer (the information is also in the [official API documentation](https://composition-api.vuejs.org/api.html#template-refs), but I somehow missed it).

```html
<template>
  <div v-for="(item, i) in list" :ref="el => { divs[i] = el }">
    {{ item }}
  </div>
</template>

<script>
import {
  onBeforeUpdate,
  reactive,
  ref,
} from 'vue';

export default {
  setup() {
    const list = reactive([1, 2, 3]);
    const divs = ref([]);

    // Make sure to reset the refs before each update.
    onBeforeUpdate(() => {
      divs.value = [];
    });

    return {
      list,
      divs,
    };
  },
};
</script>
```

Above you can see the example für dynamic Vue Composition API `$refs` from the [official documentation](https://composition-api.vuejs.org/api.html#template-refs).

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

## Wrapping it up

Although at first, I didn't like the new `$refs` API very much, it gets the job done. I think it's only a matter of time until we get used to the new way of doing things with the Composition API.
