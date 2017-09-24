+++
date = "2017-09-24T09:39:12+02:00"
title = "CSS Selector Namespaces for Stable Acceptance Tests"
description = "Prevent tightly coupled code in your acceptance tests, by specifying separate, namespaced CSS classes for testing purposes only."
intro = "Today we're going to look at the approach of using CSS selector namespaces to help us with detecting changes which have to be considered in the tests. Using separate selectors for testing also leads to a more stable way of structuring our code without tightly coupling our tests with the markup and CSS styles of the implementation..."
draft = false
categories = ["Development"]
tags = ["CSS", "Front-End Architecture", "Front-End testing", "TDD", "acceptance tests"]
+++

For some weeks now, I'm experimenting with acceptance testing – you can read more about my journey in my article about [implementing cross browser acceptance tests with TestCafe](https://markus.oberlehner.net/blog/front-end-testing-cross-browser-acceptance-tests-with-testcafe-browserstack-and-npm-scripts/). One problem often encountered when working with acceptance tests is, that the implementation and the tests get out of sync. For example: somebody changes the markup of a module which leads to a failing test.

Today we're going to look at the approach of using separate, namespaced CSS selectors to help us with detecting changes, which have to be considered in the tests, before even running them. Using separate selectors for testing also leads to a more stable way of structuring our code without tightly coupling our tests with the markup and CSS styles of the implementation.

I first read about this concept in an article by Harry Roberts about [more transparent UI code with namespaces](https://csswizardry.com/2015/03/more-transparent-ui-code-with-namespaces#qa-namespaces-qa-). If you're not familiar with the approach of using namespaces in CSS, I highly recommend you to read the whole article.

## Tightly coupled acceptance tests
Methodologies like OOCSS and BEM have tackled the problem of tightly coupling markup and styling. But when we're writing acceptance tests, many of us fall into the old pattern of tightly coupling the selectors used in the acceptance tests to the markup of the tested module, even worse, we often use selectors intended to represent a certain styling of a module, which has nothing to do with the functionality we're testing.

```js
// Tightly coupled selectors, don't to this!
test(`Some test case.`, async (t) => {
  const heroLink = Selector(`.hero > .hero-body > .button`);
  // ...
});
```

```html
<div class="hero">
  <h2 class="hero-headline">Headline</h2>
  <div class="hero-body">
    <a class="button">Click me!</a>
  </div>
</div>
```

Take a look at the code above – imagine the `.hero-body` element is moved somewhere else or the `.hero` section is renamed or the `.button` class is removed from the element because somebody decides it should look like a regular link... All of those changes break the test but won't affect the functionality in any way.

```js
// Separate `qa-` namespaced selector.
test(`Some test case.`, async (t) => {
  const heroLink = Selector(`.qa-hero-link`);
});
```

```html
<div class="hero">
  <h2 class="hero-headline">Headline</h2>
  <div class="hero-body">
    <a class="button qa-hero-link">Click me!</a>
  </div>
</div>
```

In this example you can see that we've added a separate class `qa-hero-link`. The `qa-` prefix signals that this selector is used for quality assurance purposes only. This selector is not allowed to be used for styling or as a JavaScript hook.

There are two main benefits of this approach: no more tight coupling between a specific implementation of the markup or styling and it's clearly visible to the programmer, that there are changes to be made to the tests if an element with a `qa-` prefixed class is removed or its behavior is changed.

## Removing quality assurance classes in production
If you're obsessed about performance and you want to eliminate every unnecessary byte which is delivered to the user, you might think about removing those `qa-` classes before deploying to production. If you're planning to go this way, keep in mind the following caveat: what you're delivering to production, is not what you've tested – there might be side effects you don't catch because, well, you ran your tests on a different output.

```js
const declassify = require('declassify');
const fs = require('fs');

const html = fs.readFileSync('index.html', { encoding: 'utf8' });
const declassifiedHtml = declassify.process(html, {
	ignore: [/js-.+/, /is-.+/], (process.env.NODE_ENV === `test` ? /qa-.+/ : undefined),
});

fs.writeFileSync('index.html', declassifiedHtml);
```

In the very basic example above you can see how you can use [declassify](https://github.com/jrit/declassify) to remove CSS classes, which are not declared anywhere in your CSS code, from HTML tags.

By specifying the `ignore` option we can configure `declassify` to keep certain selectors which are not used for styling but which we still want to keep. If the script is started with the `NODE_ENV` variable set to `test`, selectors prefixed with `qa-` are ignored and not removed although they are not declared in the CSS code.
