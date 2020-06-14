+++
date = "2020-06-14T06:35:35+02:00"
title = "Variable Naming: Arrays and Booleans"
description = "Having a system that helps you find good variable names faster can significantly increase your productivity."
intro = "To become a capable programmer, it is crucial to have systems that free you of the mental burden of thinking about all the little things while programming so you can focus on the big picture..."
draft = false
categories = ["Development"]
tags = ["Naming things"]
+++

To become a capable programmer, it is crucial to have systems that free you of the mental burden of thinking about all the little things while programming so you can focus on the big picture.

I often find myself thinking long and hard about how to name a particular variable or function. This is because I know how important it is to choose proper names so that other programmers and your future self can easily understand your code. But mostly, I think about unimportant details like how to name a boolean variable versus an array.

In this article, we try to define a system that relieves us from thinking about unimportant details.

## Naming Arrays

Recently I started to prefer objects over arrays, e.g., to store data from an API.

```js
const users = {
  1: {
    id: 1,
    name: 'Joana',
    // ...
  },
  2: {
    id: 2,
    name: 'John',
    // ...
  },
  // ...
};
```

This makes it very convenient in certain situations to quickly obtain the user object for a particular `id`. My rule of thumb is to use arrays only when order is important.

But there is a problem with this: When you see the variable `users`, you expect it to be iterable. I tried a lot to solve this problem, for example, with the suffix `byId`: `usersById`. But I wouldn't say I like that very much.

My latest approach is not to suffix the regular case but the exception. Whenever I declare an array, I use the `list` suffix: `usersList`.

```js
const users = { /* ... */ };
const usersList = [ /* ... */ ];
```

## Boolean

For boolean variables I mostly stick to the rules Michael Z. writes about in his [article about naming boolean variables](https://dev.to/michi/tips-on-naming-boolean-variables-cleaner-code-35ig).

```js
// Good
const hasLatestArticles = latestArticles.length > 0;

// Bad (imperative variable name)
const showLatestArticles = latestArticles.length > 0; 
```

Imperative names are reserved for functions only.

```js
// Good
const hasLatestArticles = latestArticles.length > 0;
if (hasLatestArticles) showNotification();

// Bad
const mustShowNotification = latestArticles.length > 0;
if (mustShowNotification) showNotification();
```

In the example above, `mustShowNotification` is not ideal, because the code might change anytime:

```diff
 // Good
 const hasLatestArticles = latestArticles.length > 0;
-if (hasLatestArticles) showNotification();
+if (hasLatestArticles) openNewsletterModal();

 // Bad
-const mustShowNotification = latestArticles.length > 0;
-if (mustShowNotification) showNotification();
+const mustOpenNewsletterModal = latestArticles.length > 0;
+if (mustOpenNewsletterModal) openNewsletterModal();
```

In general, we should name variables according to the data or information they store, not what they are supposed to trigger. This is because the action triggered can change at any time.

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

If you want to become a faster programmer, don't worry too much about how fast you can type. The most time-consuming tasks are reading and understanding code, and thinking up proper names for your variables and functions to make it easier for your colleagues to read and understand your code in the future. Having a system that helps you find good variable names faster can significantly increase your productivity.
