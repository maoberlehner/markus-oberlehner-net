+++
date = "2020-03-01T08:56:56+02:00"
title = "Naming Your Unit Tests: It Should vs. Given/When/Then"
description = "Learn more about my thoughts about naming unit tests applying patterns from BDD."
intro = "For the most time, when writing unit tests, I favored the it should ... pattern for naming my tests. But time and time again, I noticed that when following this naming convention, I either had to write very long test cases or omit important information..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Naming things"]
+++

For the most time, when writing unit tests, I favored the `it should ...` pattern for naming my tests. But time and time again, I noticed that when following this naming convention, I either had to write very long test cases or omit important information.

Let's take a look at the following example where I use the `it should` pattern.

```js
import { deposit } from './bank-account';

// Meant as: it `describes` the method `deposit()`.
describe('deposit()', () => {
  const bankAccount = {};

  beforeEach(() => {
    bankAccount.balance = 1000;
  });

  it('should increase the balance when making a deposit of 100 €', () => {
    const amount = 100;
    const balance = deposit({ amount, bankAccount });
    expect(balance).toBe(1100);
  });
});
```

Although it is not too bad, the unit test name is already rather long, and it still misses vital information: the starting balance of `1000`.

## Using Given/When/Then for naming your unit tests

I used to write BDD-style Given/When/Then end-to-end tests, and I think that this way of structuring your test cases can also be advantageous when writing unit tests.

```js
import { deposit } from './bank-account';

describe('Given the balance is 1.000 €', () => {
  const bankAccount = {};

  beforeEach(() => {
    bankAccount.balance = 1000;
  });

  test('When making a deposit of 100 €', () => {
    const amount = 100;
    const theBalance = deposit({ amount, bankAccount });
    // Then I ...
    expect(theBalance).toBe(1100);
  });
});
```

I think the above example reads very nicely, but there is one problem with that: the output of Jest reads somewhat weird.

```bash
> Given the balance is 1.000 € ✅
>> When making a deposit of 100 € ✅
```

It is missing the `Then` to make sense. Fortunately, I think there is a pretty easy way to fix this.

```js
// `Given` is now implicit.
describe('The balance is 1.000 €', () => {
  // `When` is now implicit.
  test('Making a deposit of 100 €', () => {
    // ...
  });
});
```

With this simple change, the Jest output reads a lot nicer.

```bash
> The balance is 1.000 € ✅
>> Making a deposit of 100 € ✅
```

Another possibility is to add a `describe()` block.

```js
describe('Given the balance is 1.000 €', () => {
  describe('When making a deposit of 100 €', () => {
    test('Then I expect the balance to be 1.100 €', () => {
      // ...
      expect(theBalance).toBe(1100);
    });
  });
});
```

```bash
> Given the balance is 1.000 € ✅
>> When making a deposit of 100 € ✅
>>> Then I expect the balance to be 1.100 € ✅
```

Although this generates the best output, what I dislike about this approach is that the information that I expect the balance to be a certain amount is represented two times in the test code. Because, except if they fail, nobody ever reads the output of the tests, I'd recommend favoring the conciseness and readability of the code over the completeness of the output. In code, we already have all the information for Given/When/Then. I think that is what counts most.

## Nesting multiple Givens

Sometimes we might have more complex cases with multiple Givens. We can solve this with nesting.

```js
// Given ...
describe('The balance is 1.000 €', () => {
  // And ...
  describe('The account is locked', () => {
    // When ...
    test('Making a deposit of 100 €', () => {
      // ...
    });
  });
});
```

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

Equally to well-written commit messages, thoughtfully crafted names and descriptions for your unit tests can increase the value they provide to your codebase in the long run by order of magnitude.

Take the time to do it right, even if you might think that it slows you down. Eventually, it will pay off.
