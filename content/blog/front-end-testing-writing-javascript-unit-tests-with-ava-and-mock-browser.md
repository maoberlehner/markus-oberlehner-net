+++
date = "2017-09-03T10:40:25+02:00"
title = "Front-End Testing Part 1: Writing JavaScript Unit Tests with ava and mock-browser"
description = "Learn how to write JavaScript front-end unit tests using ava and mock-browser. Build fast running front-end unit tests powered by npm scripts."
intro = "In this article, we will examine how to write unit tests for JavaScript code that is intended to run in the browser. We will use use ava as our test runner and the mock-browser package to simulate a browser environment..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Front-End testing", "unit tests"]
+++

In this article, we will examine how to write unit tests for JavaScript code that is intended to run in the browser. We will use use [ava](https://github.com/avajs/ava) as our test runner and the [mock-browser](https://github.com/darrylwest/mock-browser) package to simulate a browser environment.

The code we're testing is the code of a real world project of mine: [perfundo – a pure CSS lightbox](https://github.com/maoberlehner/perfundo).

## Real browser vs. mock browser

There're basically two ways how to run unit tests which depend on a browser environment. Either you're booting up a real browser engine with PhantomJS, Headless Chrome or something similar or you're using a mock browser environment.

There are ups and downs to both approaches. Booting up a real browser environment gives you the real thing. PhantomJS is powered by WebKit and Headless Chrome uses exactly the same browser engine as it is used by the regular Chrome application. You can load real HTML and you can run your tests under almost real world conditions. But the downside of using a real browser environment approach is slow performance. Booting up a browser and running tests in a real browser engine can take quite a lot of time.

Using a mock browser environment gives us the possibility to write blazing fast unit tests. It is not necessary to boot up a browser instance before each test. Unit tests do not run on the (slow) real DOM but on a super fast, pure JavaScript powered DOM.

Saving just a few seconds by choosing a mock browser environment over a real browser engine, might not seem like a big deal, but especially if you're doing TDD, waiting on your unit tests to finish can be a quite frustrating experience.

Another thing to consider is, that we're going to write acceptance test in the second part of this two-part article series. Those acceptance tests will run in real browsers, so there is no need for us to test the functionality of the code in real browsers with our unit tests.

## Setup

First of all we're creating the directory structure for our test code. Because we're also going to add acceptance tests later it makes sense to nest a `unit` directory inside the projects `test` directory.

```bash
.
└── test
    └── unit
```

Next we need to install the tools required to run our unit tests.

```bash
npm install --save-dev ava mock-browser
```

We're installing ava locally, therefore we need to add an npm script to our `package.json` file to conveniently run our tests with a simple command.

```json
"scripts": {
  "test:unit": "ava test/unit/**/*.test.js",
  "test": "npm run test:unit"
}
```

Because we're going to also add acceptance tests in the future, it makes sense to split the test scripts in multiple namespaced scripts. Later we're going to add a `test:acceptance` script – both test scripts can than be triggered by running the `test` script.

## Writing testable code

In oder to being able to write good unit tests, we have to write testable code. If you're following the TDD approach, this happens automatically, because if you write the tests first you're forced to write testable code. What “testable code” basically means is, that we must avoid using global variables in our code. All global dependencies must be injected into our codebase.

```js
function Perfundo(dependencies, target, userOptions = {}) {
  const { configure, context, defaultOptions, swipe } = dependencies;
  // ...
}
```

In this example you can see the `Perfundo` function which takes `dependencies` as it's first parameter. The `dependencies` parameter must be an object with all the external dependencies `Perfundo` needs.

- `configure` is a function to build an options object.
- `context` is the DOM context on which the code should work.
- `defaultOptions` is an object containing all the default settings.
- `swipe` is a third party npm package to add swipe gesture support.

Providing a `dependencies` object as parameter makes it possible to mock those dependencies in our unit tests. Because of that we can provide a mocked DOM as `context` instead of a real DOM for example.

### Providing a nice API for users

At this point you might wonder if the users of perfundo have to provide the dependencies themselves every time they're using perfundo? The answer is no. This would be quite a lot of overhead and our number one priority should always be to provide an easy to use API for our users.

The best way to deal with this problem is to not expose the `Perfundo` function itself but a factory function which automatically returns a new, readily configured instance of the `Perfundo` function instead.

```js
// index.js
import swipe from 'vanilla-touchwipe';

import configure from './lib/configure';
import defaultOptions from './lib/default-options';
import Perfundo from './lib/perfundo';

export default (selector, userOptions, context = document) =>
  new Perfundo({ configure, context, defaultOptions, swipe }, selector, userOptions);
```

As you can see in this example the function we're exposing to the users takes three arguments: the CSS `selector` which should be used to initialize perfundo on, optional `userOptions` for custom configuration settings and an optional DOM `context` which is `document` by default.

```js
import perfundo from 'perfundo';

perfundo('.perfundo-selector');
```

In this example of how to use perfundo as an npm package we can see that the factory function approach also has a second advantage: the factory function returns a new instance of `Perfundo` therefore the users do not have to use the `new` keyword themselves. Because of the way how `new` works in JavaScript it can lead to a lot of problems if users are forgetting to use it. By removing the need for using `new` altogether we're eliminating a potential source of trouble.

## Writing tests

Before we start writing tests I have to say, that in this article I'll only show the test code – if you want to see the code being tested, you can go to the [perfundo GitHub repository](https://github.com/maoberlehner/perfundo/tree/3.0.3) and check out [the code which is being tested](https://github.com/maoberlehner/perfundo/tree/3.0.3/js/lib/perfundo.js) in the following examples.

It is up to you how you structure your test code. Some people like to put their test files alongside the “real” files containing the production code. In this example we're going to place the test files inside a separate direcotry `test/unit`. Let's write our first test.

```js
// test/unit/perfundo.test.js
import test from 'ava';
import swipe from 'vanilla-touchwipe';
import { mocks } from 'mock-browser';

import configure from '../../js/lib/configure';
import defaultOptions from '../../js/lib/default-options';

import Perfundo from '../../js/lib/perfundo';
```

The first thing we need is a rather long list of `import` statements. The `test` function imported from the `ava` package is our test runner. From the `mock-browser` package we import a function `mocks` which we're going to use to create a mock browser. `swipe`, `configure` and `defaultOptions` are the dependencies we need to initialize a new `Perfundo` instance (although we're going to override some of those later). The last thing we import is the actual `Perfundo` function we want to test.

```js
const mockBrowser = new mocks.MockBrowser();
const document = mockBrowser.getDocument();
const defaultDependencies = {
  configure,
  context: document,
  defaultOptions,
  swipe,
};
```

In this code example you can see how to initialize a new mock browser and getting the `document` context from it. We're going to use the `defaultDependencies` object as a starting point for initializing new `Perfundo` instances for our tests. Depending on the needs of the test, we can override certain dependencies.

```js
test('Is a function.', (t) => {
  t.true(typeof Perfundo === 'function');
});
```

Our first test is pretty straightforward: we check if `Perfundo` is actually a function. To be fair, some might argue that this test is actually pointless, because if we have done everything correctly, of course this test will succeed. But thats exactly the reason why I like to put this simple test in place, to check if the test environment is set up correctly.

Now we can run `npm run test:unit` and if everything in fact is set up correctly, we'll see our test succeed.

### Test prototypes and mock the DOM

In this article I'm going to focus on the most interesting parts of the test code in order to make the article more compact and easier to follow. If you want to see the complete test code used in the real perfundo project, you can look at [the code at GitHub](https://github.com/maoberlehner/perfundo/tree/3.0.3/test/unit/perfundo.test.js).

Let's write a test for the prototype functions which open and close the perfundo overlay: `Perfundo.prototype.open()` and `Perfundo.prototype.close()`.

```js
test('Should add and remove active class on overlay element.', (t) => {
  const context = document.createElement('div');
  const perfundoElement = document.createElement('div');
  const dependencies = Object.assign({}, defaultDependencies, { context });

  perfundoElement.classList.add('perfundo');
  context.appendChild(perfundoElement);

  const linkElement = document.createElement('a');
  linkElement.classList.add('perfundo__link');
  perfundoElement.appendChild(linkElement);

  const overlayElement = document.createElement('div');
  overlayElement.classList.add('perfundo__overlay');
  overlayElement.setAttribute('id', 'perfundo-element');
  perfundoElement.appendChild(overlayElement);

  const closeElement = document.createElement('a');
  closeElement.classList.add('perfundo__close');
  perfundoElement.appendChild(closeElement);

  const perfundoInstance = new Perfundo(dependencies, '.perfundo');

  perfundoInstance.open();
  let overlayElementHasActiveClass = overlayElement.classList.contains('is-active');

  t.true(overlayElementHasActiveClass);

  perfundoInstance.close();
  overlayElementHasActiveClass = overlayElement.classList.contains('is-active');

  t.false(overlayElementHasActiveClass);
});
```

At first we create a new DOM context using the mock `document`. We also create a new `div` element which is going to be our perfundo HTML element. We're overriding the `context` in the default dependencies with the newly created context to have a clean test base. Elements like `perfundoElement` which are created using the mock `document` can be used like regular DOM nodes. In the next lines we're building the minimal DOM needed for initializing a working `Perfundo` instance.

After initializing a new instance of `Perfundo` with `new Perfundo(dependencies, '.perfundo');` we're triggering the `open()` prototype function. To check if everything worked as it should we're inspecting the `overlayElement` to see if it got a `.is-active` class on it. Now we can trigger the `close()` function and afterwards check if the `.is-active` class on the `overlayElement` was correctly removed again.

### Making things easier

As you can see in the previous example, most of the test code is needed to build the mock DOM for our test. In order to make it easier to write tests and to DRY up the code, I wrote a little helper function called `createContext()` to automate the process of mocking the DOM for further test cases. You can see the code [in the perfundo GitHub repository](https://github.com/maoberlehner/perfundo/blob/3.0.3/test/unit/helper/create-context.js).

```js
test('Should call `close()` on the current, and `click()` on the previous overlay element.', (t) => {
  const context = createContext(defaultOptions, 2);
  const dependencies = Object.assign({}, defaultDependencies, { context });

  let mockCloseCalled = false;
  const mockClose = () => { mockCloseCalled = true; };

  let mockClickCalled = false;
  const mockClick = () => { mockClickCalled = true; };

  const perfundoInstances = new Perfundo(dependencies, '.perfundo');

  perfundoInstances[1].close = mockClose;
  context.querySelector('.perfundo__link').click = mockClick;
  perfundoInstances[1].prev();

  t.true(mockCloseCalled);
  t.true(mockClickCalled);
});
```

Thanks to the `createContext()` helper function, creating the DOM context we need for initializing a new `Perfundo` instance is now a one liner. Again we're overriding the `context` in the default dependencies with our newly created DOM context.

The `mockClose()` function is used to override the `Perfundo.prototype.close()` function, this way we can later check if the function was called by checking the value of the `mockCloseCalled` variable. In a similar way we're using the `mockClick()` function to detect if the element with the selector `.perfundo__link` was clicked or not.

After triggering the `Perfundo.prototype.prev()` function with `perfundoInstances[1].prev();` we check if everything worked as intended by verifying if the `mockClose()` and `mockClick()` functions were called in the process of showing the previous perfundo element.

## Wrapping it up

As a maintainer of several open source projects and as a perfectionist, I live in the constant fear of breaking things with new releases. Testing your codebase can take away a huge chunk of this fear. And even more importantly testing your production code can prevent downtimes and lost revenue because of regressions and bugs in your codebase.

Because of those reasons, testing back-end code is nowadays pretty common in many companies but writing unit tests for the front-end of things is still quite rare in my experience. But it doesn't have to be anymore, with tools like browser mocking and excellent test runners like ava, testing front-end code has become just as easy as testing back-end code.

In the second part of this two-part series we're going to see how to write acceptance tests for your web apps with TestCafe, how to automatically run them on Travis CI and how to implement full blown cross-browser tests by integrating BrowserStack – stay tuned.
