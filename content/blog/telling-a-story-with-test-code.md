+++
date = "2020-04-05T10:04:04+02:00"
title = "Telling a Story with Test Code"
description = "Learn more about how to improve your tests so they can serve as a vital part of your documentation."
intro = "A few weeks ago, I wrote about naming unit tests BDD style using Given/When/Then. In this article, I have expressed the thought that I do not like to repeat information in the description and in the expect statement. After writing some tests the way I've described in this article, I noticed a couple of drawbacks..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Naming things"]
+++

A few weeks ago, I wrote about [naming unit tests BDD style using Given/When/Then](/blog/naming-your-unit-tests-it-should-vs-given-when-then/). In this article, I have expressed the thought that I do not like to repeat information in the description and in the `expect` statement. After writing some tests the way I've described in this article, I noticed a couple of drawbacks.

## Keeping test code DRY?

Generally speaking, the principles of DRY do not apply to test code. And even more, generally speaking: DRY is not a principle you should follow blindly. But still, I find it not ideal to repeat certain information in tests (and code in general).

```js
describe('sum()', async (assert) => {
  assert({
    given: 'no arguments',
    should: 'return 0', // This is the same information as ...
    actual: sum(),
    expected: 0, // ... this.
  });
});
```

The example above is taken directly from an [excellent article about a similar topic from Eric Elliott](https://medium.com/javascript-scene/rethinking-unit-test-assertions-55f59358253f). Although I like the straightforwardness of his <abbr title="Readable, Isolated, Thorough and Explicit">RITE</abbr> way very much, I don't like the repetition of information. But avoiding repetition might not be the best thing to do anyway. What's more is that it's harder to *tell a story* that way, which, in my opinion, makes this approach less practicable for testing UI components. Still, I'm very tempted to take a closer look at Eric's <abbr title="Readable, Isolated, Thorough and Explicit">RITE</abbr> way in the future.

```js
describe('deposit()', () => {
  describe('Given the balance is 1.000 €.', () => {
    const bankAccount = {};

    beforeEach(() => {
      bankAccount.balance = 1000;
    });
  
    describe('When making a deposit of 100 €.', () => {
      const amount = 100;
      const theBalance = deposit({ amount, bankAccount });
    
      test(
        'Then I expect the balance to be 1.100 €.',
        () => expect(theBalance).toBe(1100),
      );
    });
  });
});
```

This example may not seem too bad at first glance, but we all know what happens when time passes, and several developers work on this piece of code: at some point, the text in the description and the value in the `expect` statement no longer match.

```js
// Time has passed, requirements have changed,
// the `expect` statement was updated, the
// test description was not.
test(
  'Then I expect the balance to be 1.100 €.',
  () => expect(theBalance).toBe(1200),
);
```

That was the main reason for me to establish the rule that the description text describes the `When` and the `expect()` statement replaces the `Then`.

```js
describe('deposit()', () => {
  describe('Given the balance is 1.000 €.', () => {
    // ...
    test('When making a deposit of 100 €.', () => {
      // ...
      // Then I ...
      expect(theBalance).toBe(1100);
    });
  });
});
```

Unfortunately, there are situations where this does not work very well.

```js
describe('calcAnswerValueAverage()', () => {
  describe('Given there are unanswered questions.', () => {
    const questions = [
      {
        id: 1,
        // ...
        answer: {
          text: 'Yes',
          value: 2,
        },
      },
      {
        // ...
        answer: {
          text: 'Partially',
          value: 1,
        },
      },
      {
        // ...
        answer: null,
      },
      {
        // ...
        answer: null,
      },
    ];

    test('When calculating the average value.', () => {
      const value = calcAnswerValueAverage(questions);
      expect(value).toBe(1.5);
    });
  });
});
```

In the test code above, there is one critical piece of information missing: **the expectation of how empty answers should be handled.** When taking a closer look, we might find out that it seems like unanswered questions are ignored when calculating the average value. **Ideally, we want to be able to take the test code as a blueprint for writing the implementation.** This is not possible if we write such tests.

```js
describe('calcAnswerValueAverage()', () => {
  describe('Given there are unanswered questions.', () => {
    // ...
    describe('When calculating the average value.', () => {
      const value = calcAnswerValueAverage(questions);

      test(
        'Then I expect unanswered questions to be ignored.',
        () => expect(value).toBe(1.5),
      );
    });
  });
});
```

Now in this example it is absolutely clear how the `calcAnswerValueAverage()` function is expected to behave.

```text
calcAnswerValueAverage()
  Given there are unanswered questions.
  When calculating the average value.
  Then I expect unanswered questions to be ignored.
```

You can give those *instructions* to a developer and they should know how to build something that fulfills those requirements.

If we go back to the deposit example, we can change it up a bit so we can avoid the repetition problem altogether.

```diff
 describe('deposit()', () => {
   describe('Given the balance is 1.000 €.', () => {
     // ...
     describe('When making a deposit of 100 €.', () => {
       // ...
       test(
-        'Then I expect the balance to be 1.000 €.',
+        'Then I expect the balance to be updated.',
         () => expect(theBalance).toBe(1100),
       );
     });
   });
 });
```

I'm not 100% certain if it is better to give up clarity for the sake of avoiding repetition. But in many cases, which are more like the `calcAnswerValueAverage()` example, tests written that way are more useful in comparison to repeating information in the `expect` statement.

## Objections

It may seem like a lot of work to write our tests this way. **I believe that writing the specifications of our components and functions in plain english can help us tremendously in understanding the problem we are trying to solve more thoroughly.** And this, in turn, can help us to write a more straightforward implementation.

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

An important aspect of test code is that it can serve as documentation of how your application should behave in certain (edge) cases. Therefore it might be worth it to have redundancy if, in return, we get a perfectly obvious specification of how our application is expected to behave. It's a trade-off.
