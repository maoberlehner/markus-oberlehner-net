+++
date = "2020-01-26T08:18:18+02:00"
title = "Weekly Recap: Data Sanitizing and Reducing Complexity up the Tree"
description = "My personal recap of the last week with thoughts about sanitizing data and reducing complexity up the tree."
intro = "Last week I had two insights: sanitizing data as early as possible can make it much easier to reason about your code. And reducing the complexity of your components, the deeper down they are in the component tree can lead to a cleaner architecture..."
draft = false
categories = ["Development"]
tags = ["Weekly Recap"]
+++

Last week I had two insights: sanitizing data as early as possible can make it much easier to reason about your code. And reducing the complexity of your components, the deeper down they are in the component tree can lead to a cleaner architecture.

## Sanitize (reactive) data as early as possible

A few days ago, I got frustrated when I was working on some piece of code that needed to process a bunch of data from multiple sources. To obtain the data, I had to make multiple async API requests and pass it to a function to process the data.

There are multiple ways how to deal with this. Initially, I choose the worst one, which was to trigger the function as soon as the first API request succeeded. This meant that I had to check if this or that data has already arrived before proceeding with what the function is doing.

This got complicated and messy very quickly. The solution was quite easy: first, I figured out what is the least amount of data I need so that the function can return a useful result (or some component can render something meaningful). And then, I made sure only to call the function as soon as I had all the necessary data ready.

The most straightforward solution would be to use `Promise.all()` and wait until all the data is available. But in my case, this wasn't practical because parts of the data regularly updated. Furthermore, I wanted to render at least some of the data as early as possible.

## Reduce the complexity of your code up the tree

My first thought was that this is only about components, but I think this rule of thumb can be useful for functions as well.

> The higher up in the tree a function or component is, the simpler it should be.

*Bad* example:

```html
<!-- LoginForm.vue -->
<template>
  <div>
    <input name="firstName">
    <input name="lastName">
    <LoginButton
      :first-name-valid="firstNameValid"
      :last-name-valid="lastNameValid"
    />
	</div>
</template>

<!-- LoginButton.vue -->
<template>
  <BaseButton
    :disabled="!firstNameValid || !lastNameValid"
  >
    Login
  </BaseButton>
</template>
```

*Good* example:

```html
<!-- LoginForm.vue -->
<template>
  <div>
    <input name="firstName">
    <input name="lastName">
    <LoginButton
      :valid="firstNameValid && lastNameValid"
    />
  </div>
</template>

<!-- LoginButton.vue -->
<template>
  <BaseButton
    :disabled="!valid"
  >
    Login
  </BaseButton>
</template>
```

Above, you can see some pseudo-code to demonstrate what I mean. Even in this simple example, we can see one of the key benefits when following this rule: in the second example, we don't have to touch `LoginButton.vue` at all if a third required field is added to `LoginForm.vue`. A change in one component does not automatically lead to a change in the second component.

I'm not sure if this is a rule to follow in every situation blindly, but as a rule of thumb, it seems useful.
