+++
date = "2021-07-03T08:29:29+02:00"
title = "Vue 3 Composition API vs. Options API"
description = "Learn about the differences between the Composition API and the Options API and why I think you should use the Composition API exclusively."
intro = "When migrating from Vue 2 to Vue 3 or starting a new Vue 3 project, many people wonder if they should continue using the Options API or go all-in on the Composition API. I advise using the Composition API (for new components) exclusively ASAP and never looking back..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:EFEFEF,f_auto,q_auto,w_1014,h_510/v1542158522/blog/2021-07-03/composition-api-vs-options-api"]
+++

When migrating from Vue 2 to Vue 3 or starting a new Vue 3 project, many people wonder if they should continue using the Options API or go all-in on the Composition API. I advise using the Composition API (for new components) exclusively ASAP and never looking back.

- [What Makes the Composition API Better than the Options API?](#what-makes-the-composition-api-better-than-the-options-api)
- [Code Sharing with Composables](#code-sharing-with-composables)
- [Make Constants and Dependencies Available in the Template](#make-constants-and-dependencies-available-in-the-template)
- [Using the Composition API with Vue 2](#using-the-composition-api-with-vue-2)

```js
// Options API
export default {
  data() {
    return {
      name: 'John',
    };
  },
  methods: {
    doIt() {
      console.log(`Hello ${this.name}`);
    },
  },
  mounted() {
    this.doIt();
  },
};
```

```js
// Composition API
export default {
  setup() {
    const name = ref('John');
    
    const doIt = () => console.log(`Hello ${name.value}`);
    
    onMounted(() => {
      doIt();
    });
    
    return { name };
  },
};
```

[The Options API](https://v3.vuejs.org/api/options-api.html) uses *options* like `data`, `methods`, and `mounted`. With the Composition API, we have a single `setup` hook in which we write our reactive code.

## What Makes the Composition API Better than the Options API?

[**Short answer: code sharing.**](https://v3.vuejs.org/guide/composition-api-introduction.html#why-composition-api) Inside the `setup` hook, we can **group** parts of our code by logical concern. We then can **extract** pieces of reactive logic and [**share** the code with other components](/blog/group-extract-share-working-with-the-vue-composition-api/).

On the other hand, with the Options API, we had two main approaches for sharing code between components: **Mixins** and **Renderless Components.** Thanks to the Composition API we never have to use Mixins again. Mixins make it hard to determine where certain parts of logic are coming from inside a component that uses them. But I think Renderless Components are still a valuable tool even with the possibility of using Composables for sharing code between components.

## Code Sharing with Composables

Thanks to the Composition API, we can write reactive code anywhere. We're not bound to the scope of a Vue component anymore. **We call those pieces of reusable reactive code Composables.**

```js
// src/composables/user-comments.js
// ...

export function useUserComments({ user }) {
  let { data: comments, error } = useSwrv(() => ({ uid: user.value.id }), commentService.findAll);
  let commentCount = computed(() => comments.value.length);
  let deleteComment = commentId => commentService.delete({ id: commentId });

  return {
    comments,
    commentCount,
    deleteComment,
  };
}
```

```js
// src/components/UserProfile.vue
// ...
import { useUserComments } from '../composables/user-comments';

export default {
  name: 'UserProfile',
  // ...
  setup(props) {
    let { data: user, error } = useSwrv(() => props.id, userService.find);
    const { commentCount } = useUserComments({ user });

    // ...
  },
};
```

In the `user-comments` Composable, we can encapsulate all the reactive logic to deal with comments. We reactively fetch a user's comments, and in the example, we also create a computed property for the `commentCount`. We can reuse this piece of logic everywhere in our application. Most likely in Vue components, but theoretically, we could also run this code in a Node.js environment.

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

## Make Constants and Dependencies Available in the Template

Imagine you need access to a constant or some imported dependency inside the `<template>` section of your component. When using the Options API, this feels very awkward. You either have to add them to your `data` option (which can have a significant performance overhead) or use the `created` hook to add those non-reactive variables to the `this` context.

Thanks to the Composition API and the `setup` hook, this feels a lot more natural to do. We can export constants, and dependencies from the `setup` hook to make them available inside our component's `<template>` section.

```html
<template>
  <div>
    <!-- ... -->
    <button @click="create">
      Save
    </button>
    <div>(max. {{ MAX_COMMENTS }} allowed)</div>
  </div>
</template>

<script>
import { create } from '../services/comment';

const MAX_COMMENTS = 3;

export default {
  setup() {
    return {
      MAX_COMMENTS,
      create,
    };
  },
};
</script>
```

## Using the Composition API with Vue 2

If you can't migrate to Vue 3 today, then you can still use the Composition API already. You can do this by installing [the official Composition API Vue 2 Plugin](https://github.com/vuejs/composition-api).
