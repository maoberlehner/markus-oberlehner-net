+++
date = "2020-03-08T07:20:20+02:00"
title = "Naming Things: Staying in Line with the System"
description = "The systems and tools we work with already have naming conventions in place. Stick to them to avoid discussions with your team."
intro = "When multiple people are working together on a project, it is important to define some rules to make sure that everything stays tidy and chaos does not arise. How to name things is one of the areas in which there are always differences in opinion..."
draft = false
categories = ["Development"]
tags = ["Naming things"]
+++

When multiple people are working together on a project, it is important to define some rules to make sure that everything stays tidy and chaos does not arise. How to name things is one of the areas in which there are always differences in opinion.

But it does not have to be a struggle to make a decision, often the systems and tools we work with already have naming conventions in place. If you stick to them, you can avoid discussions.

## Grammar

In my opinion, it makes sense to stick to the basic rules of the language you are using. If in doubt how to name your test cases or if you should start a commit message with an uppercase letter or not, follow the fundamental rules of the (English) language.

```js
// Sentences start with an uppercase letter
// and end with a punctuation mark.
describe('The balance is 1.000 €.', () => {
  test('Making a deposit of 100 €.', () => {
    // ...
  });
});
```

In the following example of a Git commit message, headlines start with an uppercase letter, and again, sentences start with an uppercase letter and end with a punctuation mark.

```bash
git commit
# Add benchmark script for measuring performance
# 
# This makes it easier to optimize performance in the future.
```

## Git commit messages

Like in our example above, automatically generated Git commit messages also start with an uppercase letter. Another reason why you should stick to this when writing commit messages.

```bash
# Merge pull request #76 from maoberlehner/bugfix/fix-security-issues
```

## Node.js and JavaScript modules

It is an eternal debate: some developers prefer camelCase, and others prefer kebab-cases. But when it comes to the naming of Node.js and JavaScript modules, there is a simple answer: kebab-case. npm modules, as well as built-in JavaScript standard modules, both use kebab-case by default. So why deviate from it?

```js
// npm modules.
const leftPad = require('left-pad');

// JavaScript built-in Module
// https://developers.google.com/web/updates/2019/03/kv-storage
import storage from 'std:kv-storage';

// Therefore you might use kebab-case yourself.
import myLib from './my-lib';
```

## Deliberately step out of line

Although I generally recommend going with the current, sometimes it makes sense to turn everything upside down and use the opposite convention than the system does.

You might decide to separate external npm modules and local modules strictly. In this case, it can be a good idea to use a differing naming convention.

```js
const leftPad = require('left-pad');

// camelCase naming to make it obvious
// that this is a local module.
import myLib from './myLib';
```

Or you might decide to use a different naming convention for React or Vue.js component modules because you want to make it evident that those are UI components.

```js
// PascalCase instead of kebab-case to make it clear
// that this is a UI component meant to be rendered.
import MyComponent from './MyComponent.vue';
```

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

People have different tastes, and there is nothing wrong with that. But when several people work together, it is essential to follow some common rules. But you do not have to reinvent the wheel. Use what is already there and stick to the conventions dictated by the systems and tools you use.
