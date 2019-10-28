+++
date = "2018-04-08T10:06:31+02:00"
title = "Crazy Powerful Nightwatch.js Cucumber Step Definitions"
description = "Learn how to write powerful Cucumber.js step definitions for Nightwatch.js and how to combine multiple step definitions into one."
intro = "Although testing, and especially acceptance testing, seems like a rather boring topic (at least to many developers) in the past few months I acquired an interest in optimizing the test setup and come up with better ways of writing tests. Especially when using Nightwatch.js in combination with Cucumber.js, there is another challenging aspect to it: writing step definitions..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Front-End testing", "acceptance tests"]
+++

Although testing, and especially acceptance testing, seems like a rather boring topic (at least to many developers) in the past few months I acquired an interest in optimizing the test setup and come up with better ways of writing tests. Especially when using [Nightwatch.js](http://nightwatchjs.org/) in combination with [Cucumber.js](https://github.com/cucumber/cucumber-js), there is another challenging aspect to it: writing step definitions.

I've already written an article about writing [smart step definitions](https://markus.oberlehner.net/blog/acceptance-testing-with-nightwatch-and-cucumber-smart-step-definitions/). Although we're using this approach with great success, I'm still not satisfied with all aspects of this technique. There are two problems with the smart step definition approach. First of all the backticks, which are used to mark selectors, destroy the flow when reading the steps. And second, the step definitions lack flexibility.

In today's article we'll explore how we can fix those problems and how to build crazy powerful Cucumber.js step definitions and write better acceptance tests.

In order to keep this article concise, I'll focus on showing the core concepts of Crazy Powerful Step Definitions, you can [check out the GitHub repository containing all the code, to see more examples](https://github.com/maoberlehner/crazy-powerful-nightwatch-cucumber-step-definitions).

## Writing the first scenario

Let's begin with writing our first scenario before writing code for our step definitions. First of all let's create a new feature file `test/features/homepage.feature`.

```gherkin
Feature: Homepage

Scenario: Show latest articles

  When I open "http://localhost:8080"
  Then there should be 3 elements in the article list section
  # Then there should be 3 article preview elements in the article list section
  # Then there should be 3 article preview elements in the article list section in the article section
```

In the `Show latest articles` scenario, we want to make sure that at least three recent articles are listed on the homepage. The third and fourth steps, which are commented out, are alternative variations of the second step – they are more specific about which elements to search for and where they are located.

### The HTML code

Now let's take a look at how we can structure our HTML to not only satisfy the specifications defined in the scenario above but also to make it easier for us to test the code.

```html
<div data-qa="article">
  <ul class="list-group" data-qa="article list">
    <li class="list-group-item" data-qa="article preview">
      Article Headline
    </li>
    <li class="list-group-item" data-qa="article preview">
      Article Headline
    </li>
    <li class="list-group-item">
      Time for advertising
    </li>
    <li class="list-group-item" data-qa="article preview">
      Article Headline
    </li>
  </ul>
</div>
```

In the example markup above, you can see that we've added `data-qa` attributes to the elements we might check in our tests. Using `data-qa` attributes not only makes it possible to decouple the tests from the CSS styling, but also to target certain elements using natural language. If we take a closer look at the following step definition: `Then there should be 3 >article preview< elements in the >article list< section in the >article< section` (`>` and `<` added for clarity) we can see, that we're using exactly the same terms as we're using in the `data-qa` attributes in the markup.

### Regular expression magic

In order to make this work, we need some advanced regular expression magic. What we need, is a regular expression which is able to filter the terms for selecting the `data-qa` attributes from the step.

```js
// test/helpers/selector.js
const PREFIXES = [
  'in a',
  'in the',
  'in',
];
const SUFFIXES = [
  'area',
  'section',
];

function makeMatcher({ prefixes = PREFIXES, suffixes = SUFFIXES } = {}) {
  return new RegExp(`(?:${prefixes.join(`|`)}) ?(.+?) ?(?:${suffixes.join(`|`)})`, `g`);
}
```

The `makeMatcher()` function takes an array of prefixes and an array of suffixes as its parameters. The prefixes and suffixes are strings which must come before and after a `data-qa` term, in order to make it possible to find terms. By passing the prefixes and suffixes as parameters, it's possible to add or remove prefixes and suffixes according to the needs of the step definition where the matcher is used.

Let's take a closer look at the regular expression instance which is returned by the `makeMatcher()` function.

```js
// This is the regular expression generated
// by providing the default parameters.
/(?:in a|in the|in) ?(.+?) ?(?:area|section)/g;
```

The first part `(?:in a|in the|in)` is a so-called non-capturing group. The `?:` at the beginning marks the group as non-capturing which means that the group is matched, but it's not captured in the result when executing the regular expression.

In the middle we have ` ?(.+?) ?` which is responsible for matching a `data-qa` term. The ` ?` at the beginning and the end matches an empty space which is optional. The group `(.+?)` matches every character, as long as there is at least one character, in a non greedy way.

You can [take a look at the regular expression at regex101.com](https://regex101.com/r/b6gKD6/1).

### The step definition

The `makeMatcher()` function we've seen in the previous step, makes it possible to build very powerful step definitions without having to write a lot of complicated regular expressions. Let me walk you through the code which powers the step we've seen above.

```js
// test/step-definitions/base.js
const { client } = require(`nightwatch-cucumber`);
const cssToXPath = require(`css-to-xpath`);

const {
  PREFIXES,
  SUFFIXES,
  fromString,
  makeMatcher,
} = require(`../helpers/selector`);
const { When, Then } = require(`../helpers/step`);

const DEFAULT_TIMEOUT_IN_MS = 3000;

// ...

Then(/^there should be (\d+) (.*)?elements (.*)$/, (n, elementString, string) => {
  const elementMatcher = makeMatcher({
    prefixes: ['^'],
    suffixes: [' $'],
  });
  const elementSelector = fromString({
    string: elementString,
    matcher: elementMatcher,
  });
  
  const matcher = makeMatcher();
  const selector = fromString({ string, matcher });

  const xPathSelector = cssToXPath
    .parse(`${selector} > ${elementSelector || `*`}`)
    .toXPath();

  return client.useXpath().expect
    .element(`${xPathSelector}[${n}]`)
    .to.be.present
    .before(DEFAULT_TIMEOUT_IN_MS);
});

// ...
```

In the code above, we can see that we're making not only one but two matchers with the `makeMatcher()` function. This is because we need custom pre- and suffixes for matching the first element (the `article preview` in the `Then there should be 3 article preview elements in the article list section` step).

The `matcher` and the result of the second capturing group of the step definitions regular expression in `elementString`, are passed to a function called `fromString()` (you can see [the implementation of the `fromString()` method on GitHub](https://github.com/maoberlehner/crazy-powerful-nightwatch-cucumber-step-definitions/blob/master/test/helpers/selector.js#L22-L28)).

```js
// test/step-definitions/base.js
// ...

const elementMatcher = makeMatcher({
  prefixes: ['^'],
  suffixes: [' $'],
});
const elementSelector = fromString({
  string: elementString,
  matcher: elementMatcher,
});

// ...
```

As you can see above, we're initializing the first `elementMatcher` with custom pre- and suffixes which basically match from the beginning of a string to the end. In this case, we could use a custom regular expression (`/^(.+?) $/`) instead of initializing a matcher but using the `makeMatcher()` function makes it easier to adapt in the future.

Provided the string of our example step – `Then there should be 3 article preview elements in the article list section in the article section` – the variable `elementSelector`, returned by the first call of `fromString()`, should be `[data-qa="article preview"]`.

For matching the rest of the selectors, which do define in which part of the markup to look for the given amount of elements, we can use an instance of `makeMatcher()` with the default pre- and suffixes.

```js
// test/step-definitions/base.js
// ...

const matcher = makeMatcher();
const selector = fromString({ string, matcher });

// ...
```

The `fromString()` function takes the provided `string` (from the third capturing group of the step definitions regular expression) and the `matcher` to find the selectors in the given string and it returns a valid CSS selector like the following: `[data-qa="article"] [data-qa="article list"] [data-qa="article preview"]`.

In the last part of the step definition, we're using the [css-to-xpath](https://github.com/featurist/css-to-xpath) package, to create a selector which makes it possible to check if at least `n` instances of a selector can be found.

```js
// test/step-definitions/base.js
// ...

const xPathSelector = cssToXPath
  .parse(`${selector} > ${elementSelector || `*`}`)
  .toXPath();

return client.useXpath().expect
  .element(`${xPathSelector}[${n}]`)
  .to.be.present
  .before(DEFAULT_TIMEOUT_IN_MS);

// ...
```

## Further examples

I took the step definition above as an example because it's one of the more complex step definitions. If you want to take a look at further step definitions built with this technique, please [check out the GitHub repository accommodating this article to see more examples](https://github.com/maoberlehner/crazy-powerful-nightwatch-cucumber-step-definitions/blob/master/test/step-definitions/base.js).

## Composing step definitions

One problem you can run into when using this or a similar approach is that you're end up writing scenarios which are too specific.

```gherkin
Scenario: User gets feedback after registering

  When I open "http://facebook.com"
  And I enter "Markus" in the first name field
  And I enter "Oberlehner" in the last name field
  And I click on the submit button
  Then I should see a success message
```

Although, at first glance, the example scenario above might look fine, it has a little bit of a smell to it. Usually with BDD you want to write scenarios from the users perspective but no user would ever say: “I want to go to facebook.com and enter my first name and enter my last name and click on the submit button and then see a success message.”.

Realistically speaking, a user might think more along the lines of “I want to register a Facebook account and I want to know that it was successful.” (admittedly, the second thought might be subconscious).

```gherkin
Scenario: User gets feedback after registering

  Given I have successfully registered
  Then I should see a success message
```

Although the example above is still not perfect, it much more closer reflects the real (subconscious) thought process of a user using our website.

So let's take a look at how we can combine multiple step definitions ([which you can see on GitHub](https://github.com/maoberlehner/crazy-powerful-nightwatch-cucumber-step-definitions/blob/master/test/step-definitions/base.js)) into one.

```js
// test/step-definitions/user-management.js
const { client } = require('nightwatch-cucumber');

const { Given, run } = require('../helpers/step');

Given(/I have successfully registered/, () => {
  run('When I open "http://localhost:8080"');
  run('And I enter "Markus" in the first name field');
  run('And I enter "Oberlehner" in the last name field');
  run('And I click on the submit button');

  return client;
});
```

Above you can see the step definition for the `I have successfully registered` step. We're using the `run()` function (imported from [the step.js helper package](https://github.com/maoberlehner/crazy-powerful-nightwatch-cucumber-step-definitions/blob/master/test/helpers/step.js)) to consecutively trigger the steps which make up the combined step.

## Wrapping it up

On one hand, having a set of very powerful and generic step definitions, can not only speed up the process of writing acceptance tests, but it can also help by drastically reducing the amount of step definitions which have to be written and, even more important, maintained.

On the other hand, I can see the downsides of building very powerful step definitions which can lead to writing very specific and complicated scenarios.

That said, I had a lot of fun and I've learned a lot working on the Crazy Powerful Step Definitions. Also, I really like the possibility of combining multiple steps into one step definition which can help with writing better, less specific scenarios.

If you want to see the full code and play around with the Crazy Powerful Step Definitions yourself, you can [check out the GitHub repository containing additional examples and step definitions](https://github.com/maoberlehner/crazy-powerful-nightwatch-cucumber-step-definitions).
