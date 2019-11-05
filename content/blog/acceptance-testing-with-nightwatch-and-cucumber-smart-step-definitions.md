+++
date = "2017-10-12T19:02:14+02:00"
title = "Acceptance Testing with Nightwatch.js and Cucumber.js Part 2: Smart Step Definitions"
description = "Learn how to build powerful smart step definitions for Nightwatch.js and Cucumber.js powered automated acceptance tests using the Gherkin syntax."
intro = "In an ideal world, it should be possible to write basic acceptance test specifications without having to add any new step definitions. In the real world this is not always possible, because some features, with some very specific functionality, might need special treatment and are impossible to test without writing custom step definitions..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Front-End testing", "acceptance tests"]
+++

In the [first part](https://markus.oberlehner.net/blog/acceptance-testing-with-nightwatch-and-cucumber-setup/) of this three part series, we've [set up an automated system to run acceptance tests with Nightwatch.js and Cucumber.js](https://markus.oberlehner.net/blog/acceptance-testing-with-nightwatch-and-cucumber-setup/). Today we're extending what we've built previously and make our Cucumber.js step definitions a little bit smarter.

In an ideal world, it should be possible to write basic acceptance test specifications without having to add any new step definitions. In the real world this is not always possible, because some features, with some very specific functionality, might need special treatment and are impossible to test without writing custom step definitions. However our goal today, is to write a few very simple step definitions which are smart enough to cover the vast majority of test cases.

## The test subject

To make things more interesting and to also make our example website a little bit more realistic, let's update the code to simulate two occurrences of a newsletter form on the same page.

Usually you'd want to test both occurrences the same way but there might be cases where you want to test such elements separately because they should behave slightly different depending on where they are positioned on the page. Let's assume – in this specific case – that we want to test the functionality of the second newsletter form in the footer.

```html
<div data-qa="hero">
  <h1>Acceptance Testing with Nightwatch.js, Cucumber.js and BrowserStack</h1>
  <form class="js-newsletter-form" data-qa="newsletter form">
    <h2>Newsletter 1</h2>
    <input class="js-newsletter-input" placeholder="Your email address" data-qa="email input">
    <div class="error js-newsletter-error" data-qa="error message">Error</div>
    <div class="success js-newsletter-success" data-qa="success message">Success</div>
    <button data-qa="submit button">Submit</button>
  </form>
</div>

<p>Some very long text. Lorem Ipsum.</p>

<footer data-qa="footer">
  <form class="js-newsletter-form" data-qa="newsletter form">
    <h2>Newsletter 2</h2>
    <input class="js-newsletter-input" placeholder="Your email address" data-qa="email input">
    <div class="error js-newsletter-error" data-qa="error message">Error</div>
    <div class="success js-newsletter-success" data-qa="success message">Success</div>
    <button data-qa="submit button">Submit</button>
  </form>
</footer>
<script>
  const $newsletterForms = document.querySelectorAll('.js-newsletter-form');

  [].slice.call($newsletterForms).forEach(($newsletterForm) => {
    const $newsletterInput = $newsletterForm.querySelector('.js-newsletter-input');
    const $newsletterError = $newsletterForm.querySelector('.js-newsletter-error');
    const $newsletterSuccess = $newsletterForm.querySelector('.js-newsletter-success');

    $newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (/\S+@\S+\.\S+/.test($newsletterInput.value)) {
        $newsletterError.classList.remove('is-visible');
        $newsletterSuccess.classList.add('is-visible');
      } else {
        $newsletterError.classList.add('is-visible');
        $newsletterSuccess.classList.remove('is-visible');
      }
    });
  });
</script>
```

As you can see above, the `qa-` prefixed classes we've used previously to select specific elements in our step definitions, are gone. Instead you can see custom `data-qa` attributes used on certain HTML elements. This makes it possible to use human readable names to select HTML elements in the step definitions. This is only the most important part of the code, if you're intrested in the full code example, you can check out the [GitHub repository](https://github.com/maoberlehner/acceptance-testing-with-nightwatch-cucumber-and-browserstack/tree/part-2-smart-step-definitions) I've created for this article.

## Rewriting the acceptance test feature specification

Because we now have two newsletter forms on the same page and we've slightly tweaked the naming of some elements, we must update our test specification `test/features/newsletter-form.feature` too.

```gherkin
Feature: Newsletter Form

Scenario: Submit the footer form with invalid email address

  Given I open the `home page`
  Then I see the `footer` `newsletter form` `email input`
  When I enter "invalid-address" into the `footer` `newsletter form` `email input`
  And I click the `footer` `newsletter form` `submit button`
  Then I see an `error message` in the `footer` `newsletter form`
  But I don't see a `success message` in the `footer` `newsletter form`
```

As you can see above, we've added `` `footer` `` to precisely specify which newsletter form elements we want to target. If we'd decide to write a test specification for the newsletter form in the hero section of the page, we'd use `` `hero` `` instead.

There are two ways of how to specify, in which section of the page, Nightwatch.js should look for a specific element. One is to chain the elements.

```gherkin
Then I see the `footer` `newsletter form` `email input`
```

In this case we want to target the element with the name `email input` inside the element with the name `newsletter form` inside the element with the name `footer`.

The second way is to specify the container, in which to search for the target element, by providing a `in [the] ELEMENT-NAME` suffix (the `the` is optional).

```gherkin
Then I see an `error message` in the `footer` `newsletter form`
```

In this case we want to target the element with the name `error message`, which again is a child of the element with the name `newsletter form`, which is a child of an element with the name `footer`.

By writing a more specific test case, we are able to test a specific one of the two newsletter forms on the page.

## Writing Smart step definitions

What I mean by smart step definitions is, that they can be reused for different scenarios and are not specific to a certain test case, but they also should be flexible in the way they can be used to make it possible to write test cases in a natural language without having to stick to very strict rules how to phrase the test cases.

```js
const { client } = require('nightwatch-cucumber');
const { defineSupportCode } = require('cucumber');

const { nestedSelector } = require('../../helpers/nested-selector');

const { url } = require('../../conf/default.conf').test_settings.default.globals;

const pages = {
  'home page': `${url}/`,
};

defineSupportCode(({ defineStep }) => {
  defineStep(/^I (?:browse|open|visit).*? `(.*?)`$/, pageName =>
    client.url(pages[pageName]));

  defineStep(/^I (?:find|identify|see|spot).*? (`.*`).*?$/, selectorChain =>
    client.expect.element(nestedSelector(selectorChain)).to.be.visible);

  defineStep(/^I (?:can|don)'t (?:find|identify|see|spot).*? (`.*`).*?$/, selectorChain =>
    client.expect.element(nestedSelector(selectorChain)).to.not.be.visible);

  defineStep(/^I (?:enter|input|supply|type).*? "(.*?)" in.*? (`.*`)$/, (value, selectorChain) =>
    client.setValue(nestedSelector(selectorChain), value));

  defineStep(/^I (?:activate|click).*? (`.*`)$/, selectorChain =>
    client.click(nestedSelector(selectorChain)));
});
```

As you can see above, we're importing a new helper function `nestedSelector()` which we're going to use to create a nested selector from the test specification.

```js
// test/helpers/nested-selector.js
const prefixRegEx = /` in.*? (`.*`)/;

function parseSelectorChain(selectorChain) {
  return selectorChain
    .split('` `')
    .map(x => x.replace(/`/g, ''));
}

function extractPrefixSelectors(selectorChain) {
  const prefixMatch = selectorChain.match(prefixRegEx);

  return prefixMatch ? parseSelectorChain(prefixMatch[1]) : [];
}

function nestedSelector(selectorChain) {
  const prefixSelectors = extractPrefixSelectors(selectorChain);
  const selectors = parseSelectorChain(selectorChain.replace(prefixRegEx, '`'));

  return prefixSelectors
    .concat(selectors)
    .map(x => `[data-qa="${x.replace(/`/g, '')}"]`)
    .join(' ');
}

module.exports = {
  parseSelectorChain,
  extractPrefixSelectors,
  nestedSelector,
}
```

Because we're now using `data-qa` attributes containing the element names which we're also using in the test specification, we can remove the element name to CSS selector mapping, which we've used in the previous article.

The most visible change to the step definitions is the usage of non-capturing groups, like `(?:find|identify|see|spot)`, with a set of synonyms for a specific action. This makes it possible to use different words and a more natural language when writing test specifications.

The biggest change although, is that we're now matching a list of element names ``(`.*`)``, instead of one specific element name `` `(.*)` ``, this makes it possible to nest element names and target an element inside another element. The selector chain, which is matched by ``(`.*`)``, is passed to the `nestedSelector()` function, which returns the nested selector (e.g. `[data-qa="footer"] [data-qa="newsletter form"] [data-qa="error message"]`).

With this set of five simple but smart step definitions, it is already possible to write tests for various use cases. Of course, as your application is growing, you might add several new general purpose definitions or tweak some of those which already exist. And very likely you also have to add a number of custom step definitions to test some more advanced features of your app. But ultimately this is a solid starting point.

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like what you read?</h2>
      <p class="c-twitter-teaser__body">
        Follow me to get my latest articles.
      </p>
      <a class="c-button c-button--outline c-twitter-teaser__button" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">
        Find me on Twitter
      </a>
    </div>
  </div>
</div>

## Wrapping it up

By using `data-qa` attributes on the HTML elements which we want to target in our tests, it is possible to write test specifications in (almost) perfect natural language, without having to map every element in a separate step definition.

Because we're using a lot of very general matching regular expressions in our smart step definitions, there might be situations where you have to tweak a definition to make it work with some other, more specific definition. But overall the benefits of having a set of smart step definitions, which cover a broad range of test cases, outweigh those minor inconveniences.

Although writing tests with Gherkin syntax is something you have to get used to, I begin to see the advantages of such a system. Having the specification of a feature written down in plain english, checked in directly into your repository, can be a huge advantage later on, when you're not quite sure why some feature is implemented in a certain way.

In [the third part of this series](/blog/acceptance-testing-with-nightwatch-and-cucumber-browserstack/), we're going to integrate cross browser testing (powered by BrowserStack) into our Nichtwatch.js and Cucumber.js workflow, [follow me on Twitter](https://twitter.com/MaOberlehner) to not miss the next article.
