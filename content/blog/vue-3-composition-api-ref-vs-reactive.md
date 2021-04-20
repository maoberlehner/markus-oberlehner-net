+++
date = "2021-04-20T21:26:26+02:00"
title = "Vue 3 Composition API: ref() vs. reactive()"
description = "Learn when to use ref() and when to use reactive() and why you should consider always using ref() instead of reactive()."
intro = "One of the first questions that arise when starting with the new Vue Composition API is ref() or reactive()? The initial instinct is to use ref() for primitives (Boolean, String,...) and reactive() for objects. But there is more to it..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:EFEFEF,f_auto,q_auto,w_1014,h_510/v1542158522/blog/2021-04-20/ref-vs-reactive"]
+++

One of the first questions that arise when starting with the new Vue Composition API is `ref()` or `reactive()`? The initial instinct is to use `ref()` for primitives (Boolean, String,...) and `reactive()` for objects. But there is more to it.

- [When to Use `ref()` and When to Use `reactive()`?](#when-to-use-ref-and-when-to-use-reactive)
- [The Downside of Using `ref()`](#the-downside-of-using-ref)
- [Is Mixing `ref()` and `reactive()` a Good Idea?](#is-mixing-ref-and-reactive-a-good-idea)

## When to Use `ref()` and When to Use `reactive()`?

Let's start with the basics: you **must** use `ref()` to create a reactive primitive value.

```js
// Boolean ref
const isVisible = ref(true);

// String ref
const name = ref('Markus');
```

`reactive()`, on the other hand, **can** only be used for creating reactive objects. You can use it as a replacement for the old `data` option in standard Option API-based Vue components, for example.

```js
const state = reactive({
  isVisible: true,
  name: 'Markus',
});
```

But you can also use `ref()` for that. In the following example, we use `ref()` to create a reactive object.

```js
const state = ref({
  isVisible: true,
  name: 'Markus',
});
```

There are two notable differences when using `ref()` instead of `reactive()` for objects. The first one is more of a downside, but I consider the second one a significant advantage.

```js
const state = ref({
  isVisible: true,
  name: 'Markus',
});

// 1. You must use `.value` to access properties
//    of a `ref()` object. With `reactive()` you
//    could do `state.isVisible = false`.
state.value.isVisible = false;

// 2. You can swap the complete object. You can't
//    do that with `reactive()` objects!
state.value = {
  isVisible: false,
  name: 'John',
};
```

<div>
  <hr class="c-hr">
  <a
    style="display: block; margin-top: 1em;"
    href="https://www.creative-tim.com/templates/vuejs/?partner=143346"
  >
    <img
      src="/images/q_auto,f_auto/v1532158515/blog/assets/high-quality-templates"
      alt="Screenshots of three premium Vue.js templates."
      style="max-width: 100%; height: auto;"
      loading="lazy"
      width="1240"
      height="576"
    >
  </a>
  <hr class="c-hr">
</div>

## The Downside of Using `ref()`

Constantly having to use `.value` when working with refs is a bummer. But at least it makes it very clear that you're working with reactive data.

One possible workaround, especially when dealing with data that might or might not be a ref, is to use `unref()`.

```js
import { unref } from 'vue';

// `number` might or might not be a ref.
function addOne(number) {
  return unref(number) + 1;
}
```

## Is Mixing `ref()` and `reactive()` a Good Idea?

Because I think sometimes having to use `.value` and sometimes not is confusing, I tend not to use `reactive()` at all.

Yes, always having to deal with `.value` even if I could avoid it sometimes by using `reactive()` is annoying. But the magic word here is *sometimes*. `ref()` can be used for **every** occasion, `reactive()` can't. I much prefer consistency over a minor annoyance.

