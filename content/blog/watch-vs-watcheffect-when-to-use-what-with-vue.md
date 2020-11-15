+++
date = "2020-11-15T11:20:20+02:00"
title = "watch vs. watchEffect when to use what with Vue.js"
description = "Learn about the differences between watch and watchEffect hooks, when to use what, and how watchEffect is similar to computed."
intro = "When I first studied the new Composition API, I was confused that there are two watch hooks: `watch()` and `watchEffect()`. From the documentation alone, it was not immediately apparent to me what's the difference..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
+++

When I first studied the new Composition API, I was confused that there are two watch hooks: `watch()` and `watchEffect()`. From [the documentation](https://v3.vuejs.org/guide/reactivity-computed-watchers.html#watcheffect) alone, it was not immediately apparent to me what's the difference.

## The Difference Between `watch` and `watchEffect`

Assuming you already know how `watch()` works with the Options API, it is easy to understand how the `watch()` hook works.

> The `watch()` hook works like the `watch` option.

The `watchEffect()` hook's main difference is that you don't watch one specific reactive value but every reactive value inside its callback function.

> The `watchEffect()` hook works like the `computed()` hook or the `computed` option, but instead of returning a value, you use it to trigger side-effects.

```js
// The callback is called whenever `refA` changes.
watch(refA, () => {
  console.log(refA.value);
  console.log(refB.value);
});

// The callback is called immediately, and
// whenever `refA` or `refB` changes ...
watchEffect(() => {
  console.log(refA.value);
  console.log(refB.value);
});

// ... this is the same behavior as for `computed()`.
const aPlusB = computed(() => {
  console.log(refA.value);
  console.log(refB.value);
  return refA.value + refB.value;
});
```

## When Should I Use `watch`?

At first glance, `watchEffect()` seems superior to `watch()`. Because you simply define a callback function, and it is automatically triggered if one of the reactive variables you use inside of it changes. But this behavior can be problematic. If you only want to trigger the callback function when one or multiple *specific* variables change, you must use `watch()` instead of `watchEffect()`.

Furthermore, using `watch()` also enables us to access the previous value of the watched variables.

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

## Wrapping It Up

I think the easiest way to remember the difference between `watch` and `watchEffect()` is to think of `watchEffect()` like a variant of `computed()` that doesn't return a value but triggers side-effects.
