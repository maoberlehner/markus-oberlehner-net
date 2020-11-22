+++
date = "2020-11-22T10:29:29+02:00"
title = "Group, Extract, Share: Working with the Vue Composition API"
description = "Learn how to extract and share logic to build flexible components with the Vue 3 Composition API."
intro = "One problem with the Vue Options API is that it is hard to share stateful logic that relies on reactive variables. The Composition API offers us an excellent solution to this problem. In this article, we look at a possible workflow for efficiently building components and applications with Vue 3 and the Composition API..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:EFEFEF,f_auto,q_auto,w_1014,h_510/v1542158522/blog/2020-11-22/group-extract-share"]
+++

One problem with the Vue Options API is that it is hard to share stateful logic that relies on reactive variables. The Composition API offers us an excellent solution to this problem. In this article, we look at a possible workflow for efficiently building components and applications with Vue 3 and the Composition API.

- [Group Stateful Logic Inside of Components](#group-stateful-logic-inside-of-components)
- [Extract Logic Into Functions](#extract-logic-into-functions)
- [Share Stateful Logic Between Components](#share-stateful-logic-between-components)

## Group Stateful Logic Inside of Components

With the Options API, we can't group logic by the task it fulfills. In a typical Vue 2 component, we have sections for `data`, `computed`, `methods`, and hooks like `created` or `mounted`. This is okay for simple components that do only one particular thing. And although those are the best kinds of components, sometimes it does not make sense, or it is not possible to create separate components for every piece of logic.

```js
// src/components/UserProfile.vue
// ...

export default {
  name: 'UserProfile',
  setup(props) {
     // User
     let { data: user, error } = useSwrv(() => props.id, userService.find);
     let userName = computed(() => `${user.value.firstName} ${user.value.lastName}`);
     // ... more user logic.
     
     // Latest comments of the user.
     let { data: comments, error } = useSwrv(() => ({ uid: user.value.id }), commentService.findAll);
     let commentCount = computed(() => comments.value.length);
     let deleteComment = commentId => commentService.delete({ id: commentId });
     // ... more comment logic.
     
     // ...
  },
};
```

Above, we can see how, thanks to the Composition API, we can group all the logic regarding user data and the logic dealing with comments. Fetching all comments written by a particular user, computing the `commentCount`, and defining a method for deleting a comment all happens in the second group instead of spreading the logic across different sections as we'd need to do using the Options API.

Although the next two steps are optional, I highly recommend you always follow this step and group logic inside the `setup()` hook of components.

## Extract Logic Into Functions

When we follow the first step to group logic, it is easy to take it one step further and extract specific parts of our components into separate functions.

```diff
+function useUserComments({ user }) {
+  let { data: comments, error } = useSwrv(() => ({ uid: user.value.id }), commentService.findAll);
+  let commentCount = computed(() => comments.value.length);
+  let deleteComment = commentId => commentService.delete({ id: commentId });
+
+  return {
+    comments,
+    commentCount,
+    deleteComment,
+  };
+}

 export default {
   name: 'UserProfile',
   setup(props) {
-    // User
     let { data: user, error } = useSwrv(() => props.id, userService.find);
     let userName = computed(() => `${user.value.firstName} ${user.value.lastName}`);
     
-    // Latest comments of the user.
-    let { data: comments, error } = useSwrv(() => ({ uid: user.value.id }), commentService.findAll);
-    let commentCount = computed(() => comments.value.length);
-    let deleteComment = commentId => commentService.delete({ id: commentId });
+    let {
+      comments,
+      commentCount,
+      deleteComment,
+    } = useUserComments({ user });
   },
 };
```

Here we have extracted all the logic regarding getting the current user's comments into a separate `useUserComments()` composable function. Although it is only a convention, I recommend prefixing composable functions with `use`.

I think there are two scenarios where it makes sense to extract logic into separate functions:

1. When a component becomes complicated and messy, and we want better documentation without adding many comments.
2. When it seems likely that we need to reuse the logic in another component rather sooner than later.

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

## Share Stateful Logic Between Components

Being able to group and extract code of Vue components is nice, but the real killer feature, and the thing that wasn't possible with the Options API, is to share stateful logic between components.

When we already have extracted certain pieces of logic, this step is very straightforward: instead of putting the functions at the top of our component, we move it into a separate file.

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

Now we can reuse the `useUserComments()` wherever we like. But be careful how you define the boundaries of your composables, and always remember to look out for [The Wrong Abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction).

## Wrapping It Up

All of the techniques described in this article were not possible with the Vue Options API; applying them can help us create maintainable applications. But be aware that although it is now much easier to build mighty components consisting of a bunch of composables, you should still strive to keep your components small and simple.

Ideally, components should:

> Do one thing and do it well.
