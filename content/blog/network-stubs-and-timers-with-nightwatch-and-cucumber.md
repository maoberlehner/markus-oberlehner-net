+++
date = "2018-03-18T11:05:31+02:00"
title = "Network Stubs and Timers with Nightwatch.js and Cucumber.js"
description = "Learn how to mock API requests and Timers with Nightwatch.js and Cucumber.js to efficiently test single page applications."
intro = "In my previous article about automated acceptance testing with Cypress I explored the possibilities of the `cy.route()` and `cy.clock()` commands. Because I fell in love with how easy it is to stub network requests and manipulate JavaScript timeout functions (like `setTimeout` and `setInterval`) with those two commands, I began to feel bad about not having this functionality in Nightwatch.js und Cucumber.js powered acceptance tests..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Front-End testing", "acceptance tests"]
+++

In my previous article about [automated acceptance testing with Cypress](https://markus.oberlehner.net/blog/automated-acceptance-testing-with-cypress-and-vue-network-stubs-and-timers/) I explored the possibilities of the `cy.route()` and `cy.clock()` commands. Because I fell in love with how easy it is to stub network requests and manipulate JavaScript timeout functions (like `setTimeout` and `setInterval`) with those two commands, I began to feel bad about not having this functionality in Nightwatch.js und Cucumber.js powered acceptance tests.

Making the switch to Cypress in all of my projects, isn't possible for two reasons: changing your testing framework isn't a small task to begin with and furthermore, full blown support for the Gherkin syntax is a must have in my book. So I started to think about ways of how to integrate network stubs and mock timers into my existing Nightwatch.js and Cucumber.js powered test setup.

In the following article I'll show you a basic approach for mocking XHR requests and JavaScript timers, in combination with a Nightwatch.js and Cucumber.js powered test workflow. I'll not go into too much detail about the general Nightwath.js configuration, if you're interested in that, you can checkout the [GitHub repository for this article](https://github.com/maoberlehner/network-stubs-and-timers-with-nightwatch-and-cucumber) or one of [my previous articles about this topic](https://markus.oberlehner.net/blog/tags/acceptance-tests/).

<div class="u-text-align-center">
  <video src="/videos/2018-03-18/nightwatch-mock-timers.mp4" autoplay muted loop></video>
  <p><small>Slow motion video of a Nightwatch.js test run with time traveling and network stubs</small></p>
</div>

## The goal

At the end of this article, we want to be able to control time and stub network requests in our test features written in Gherkin syntax like in the following example.

```gherkin
Scenario: Greet new user

  # Activate mock timers and network stubs.
  Given time traveling is enabled
  And network stubs are enabled
  When I open the `home page`
  # Tell the XHR mock what to return
  # when the given endpoint is called.
  Given the endpoint "/users" returns a `new user` when sending data
  When I click the `create user button`
  Then I expect a `user greeting` to be visible
  And I expect the `user greeting` to contain the text "Hello Markus!"
  # Tell the timer mock to let
  # 5 seconds pass instantly.
  Given "5" seconds have passed
  Then I expect the `user greeting` to not be present
```

## How to build a mocking script

We'll be using the timer API mocking library [Lolex](https://github.com/sinonjs/lolex) and the fake XHR server [nise](https://github.com/sinonjs/nise) to help us with mocking JavaScript timers and the `XMLHttpRequest` object.

### Mocking timers with Lolex

Lolex is a JavaScript implementation of the timer APIs (e.g. `setTimeout`, `setInterval`,...), we'll use it to make it possible, to control the current time in our test features.

```js
// test/server/src/timers.js
import lolex from 'lolex';

window.clock = lolex.install({
  // Start with the current date.
  now: new Date(),
  // Increment timers automatically
  // (otherwise time stands still).
  shouldAdvanceTime: true,
});
```

In the example above, you can see that we're importing the `lolex` package and we're initializing it with `lolex.install()`. This replaces all timer related functions like `setTimeout()` and `setInterval()` with mock implementations.

By specifying the `now` option, we tell `lolex` to start with the current date instead of unix epoch `0`. This is not relevant for the following examples, but depending on your application epoch `0` might lead to strange behavior of your app because you may rely on the fact that it's not 1970 anymore.

Setting `shouldAdvanceTime` to `true` makes timers behave like regular timers – otherwise you always have to control time manually if you want something to happen which is triggered by a timer.

Because we wan't to be able to control the `clock()` in our Nightwatch.js test with the `client.execute()` command, we make the `clock()` globally available in the `window` context.

### Mocking XHR requests with nise

`nise` provides a fake implementation of the `XMLHttpRequest` object and allows us to manipulate its behavior. What's especially useful to us is, that it makes it possible to define how it's responding to certain requests.

```js
// test/server/src/network-stubs.js
import nise from 'nise';

import { IDENTIFIERS } from '../../conf';

const server = nise.fakeServer.create({ respondImmediately: true });

function addNetworkStub({
  body,
  endpoint,
  status = 200,
  type = 'GET',
}) {
  server.respondWith(type, new RegExp(`${endpoint}$`), [
    status,
    { 'Content-Type': 'application/json' },
    JSON.stringify(body),
  ]);
}

// We use the `sessionStorage` in order to make it
// possible to queue stubs in Nightwatch.js
const queuedStubs = sessionStorage.getItem(IDENTIFIERS.networkStubs);

if (queuedStubs) {
  JSON.parse(queuedStubs).forEach(x => addNetworkStub(x));
}

window.addNetworkStub = addNetworkStub;
```

Stubbing network requests with `nise` turns out to be a little bit more complicated. First of all we import the `nise` package and the configuration option `IDENTIFIERS` which is an object of identifiers for cookie names and session storage keys.

Next we start a new `fakeServer` with `nise.fakeServer.create()`. By telling it to `respondImmediately`, there is no fake delay before returning a response when making requests, which makes our tests faster, but also slightly less realistic.

The `addNetworkStub()` function makes it possible to tell the fake server what respond it should send to a certain request.

Because most applications make some XHR requests immediately after they are opened in the browser, we need a way to queue network stubs before the page is opened, in order to immediately provide those for initial requests. We're using the `sessionStorage` which is filled by Nightwatch.js, to tell our mocking script which stubs it has to prepare immediately.

Finally we're making the `addNetworkStub()` function available in the global `window` scope, to make it possible to call it in the test code.

### The build step

Because we're using npm dependencies in our timer and network stub mock scripts, we need to bundle them. Let's configure the Rollup bundler for this task.

```js
// test/server/rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

export default {
  plugins: [
    resolve(),
    commonjs(),
    uglify(),
  ],
};
```

Next we add a new npm script to our `package.json` file to make it easier to run Rollup.

```json
{
  "scripts": {
    "test:build": "rollup test/server/src/network-stubs.js --o public/dist/network-stubs.js --f iife -c test/server/rollup.config.js && rollup test/server/src/timers.js --o public/dist/timers.js --f iife -c test/server/rollup.config.js"
  }
}
```

This rather long npm script, bundles our two scripts to be ready to be served by our test server which we'll setup in the next step. You only have to execute this script once, or every time you make changes to one of the two mock files.

On a side note: you might notice, that the `network-stubs.js` bundle takes several seconds to build and the bundled file is about 500kb in size. This is because nise pulls in a dependency called `text-encoding` which is used to enable `ArrayBuffer` and `Blob` response types ([see GitHub issue #44](https://github.com/sinonjs/nise/issues/44)). If you haven't heard of them, you probably won't need them. I certainly don't, so I created a [fork of nise without text-encoding](https://github.com/maoberlehner/nise). You can use this if you want to save your test browser some time parsing a huge JavaScript file.

### The test server

Because we want to manipulate the client side JavaScript code, we need a way of how to get the code, which is needed for mocking timers and XHR requests, into the browser (which is controlled by Nightwatch.js).

There are multiple ways of how to achieve this goal. You could bundle the mock code with your regular JavaScript bundle, only in the case that the `NODE_ENV` is set to `test` for example. This could be done with the [webpack-conditional-loader](https://www.npmjs.com/package/webpack-conditional-loader). Or you could even create a browser exstension which injects those scripts into the page under test.

I've decided to use a tiny Express server to inject the scripts into the page when needed.

```js
// test/server/index.js
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const { IDENTIFIERS, PORT } = require('../conf');

const rootPath = path.resolve(__dirname, '..', '..');
const publicPath = path.join(rootPath, 'public');

const app = express();

app.use(compression());
app.use(cookieParser());
app.use('/', express.static(publicPath, { index: false }));

app.get('/*', (request, response) => {
  fs.readFile(path.join(publicPath, 'index.html'), { encoding: 'utf-8' }, (error, indexSource) => {
    const networkStubs = request.cookies[IDENTIFIERS.network] === '1';
    const timers = request.cookies[IDENTIFIERS.timers] === '1';
    let html = indexSource;

    if (networkStubs) {
      html = html.replace('<head>', '<head><script src="/dist/network-stubs.js"></script>');
    }

    if (timers) {
      html = html.replace('<head>', '<head><script src="/dist/timers.js"></script>');
    }

    response.send(html);
  });
});

app.listen(PORT);
```

What you can see above, is a very, very basic example of an Express server just capable enough to serve basic single page applications. The server is configured to serve every static file as is and for everything else the `index.html` file is returned.

Before we're returning the `index.html` file to the browser tough, we're checking if cookies for activating timers or network stubs are set. If so, the scripts we've created in the previous steps, are injected immediately after the opening `<head>` element to make sure they run before every other line of JavaScript code.

By using cookies to enable timers and network stubs, we make sure to only load those scripts if we actually need them in our current test.

## The test setup

I won't go into much detail about the general Nightwatch.js configuration. You can take a look at the [GitHub repository for this article](https://github.com/maoberlehner/network-stubs-and-timers-with-nightwatch-and-cucumber) if you're interested to see the full code.

One important thing to mention tough, is that you have to clear cookies and the session storage after every scenario, to make sure to start from a clean slate and that network stubs or timers of a previous test do not interfere with the current one. You can do this by adding the following lines to your Nightwatch.js hooks.

```js
// test/hooks.js
const { After } = require('cucumber');
const { client } = require('nightwatch-cucumber');

After(() => {
  client.deleteCookies();
  client.execute('sessionStorage.clear()');
});
```

### Step definitions

Now that we've set up our test server an we've prepared the code which enables us to manipulate XHR requests and timers, we can proceed to write our step definitions for network stubbing and time traveling.

To keep the code concise, I'll show you only the most important parts of the code. You can see the [full example of the step definitions file on GitHub](https://github.com/maoberlehner/network-stubs-and-timers-with-nightwatch-and-cucumber/blob/master/test/step-definitions/base.js).

#### Enable time traveling

```js
// test/step-definitions/base.js
// ...

let cookies = [];
let networkStubs = [];

Given(/^time traveling is enabled$/, () => {
  const cookie = {
    name: IDENTIFIERS.timers,
    value: '1',
  };

  return cookies.push(cookie);
});
```

At the beginning of the code snippet above, you can see the two variables `cookies` and `networkStubs`, we'll use them to temporary store cookies and network stubs, which we want to inject into the page when the page is loaded.

The step definition for time traveling, sets the cookie which we then check in the test server script to decide if the `timers.js` script should be injected into the page or not.

This step definition has to be called **before** the page is loaded. But it's not possible to set cookies before Nightwatch.js has loaded a page, so we have to queue the cookie in the `cookies` variable, and delay setting the cookie until a page was opened.

#### Manipulating timers

Now that we're able to inject and activate our mock timers, we want to have a step definition to manipulate those mock timers.

```js
// test/step-definitions/base.js
// ...

Given(/^"(.*)" seconds have passed$/, (seconds) => {
  client.execute(`clock.tick(${seconds} * 1000)`);
});
```

With this step definition it's possible, to instantly fast forward the given amount of time. So all timers which are due during the given time span, are executed immediately.

#### Enable network stubs

```js
// test/step-definitions/base.js
// ...

Given(/^network stubs are enabled$/, () => {
  const cookie = {
    name: IDENTIFIERS.network,
    value: '1',
  };

  return cookies.push(cookie);
});
```

The job of the `Given network stubs are enabled` step definition is to queue the cookie, which triggers the test server to inject the `network-stubs.js` script into the page.

#### Set up a mock response

```js
// test/step-definitions/base.js
// ...

// Changing the request type from `GET`
// to `POST` is possible by adding the
// phrase `when sending data` when using
// this step definition.
Given(/^the endpoint "(.*?)" returns.*? `(.*?)`( when sending data)?$/, (endpoint, name, post) => {
  const type = post === undefined ? 'GET' : 'POST';

  return client.url(({ value }) => {
    const networkStub = {
      // The `resolveMockFile()` function
      // tries to find a `.json` file in the
      // `test/mocks` directory, which matches
      // the given name.
      body: resolveMockFile({ endpoint, name }),
      endpoint,
      type,
    };

    // Execute the `addNetworkStub()` function
    // immediately if a page was already loaded.
    if (pageLoaded(value)) return client.execute(`addNetworkStub(${JSON.stringify(networkStub)})`);

    return networkStubs.push(networkStub);
  });
});
```

Next on the line is the step definition for defining responses for certain XHR requests. This step definition can be used before and after the page was loaded. In the case a page was already loaded, the `addNetworkStub()` function we've defined in the `networks-stubs.js` script, is executed immediately, otherwise, adding the stub is deferred to the time when a page is loaded.

The `resolveMockFile()` function takes the endpoint and the name which were provided and tries to find a matching file inside the [test/mocks](https://github.com/maoberlehner/network-stubs-and-timers-with-nightwatch-and-cucumber/tree/master/test/mocks) directory.

#### Load a page

The last step definition at which we take a closer look, is the step definition to load a new page.

```js
// test/step-definitions/base.js
// ...

When(/^I (?:browse|open|visit).*? `(.*?)`$/, (pageName) => {
  const refresh = cookies.length || networkStubs.length;

  // Initially load the page so we
  // are able to set cookies and use
  // the session storage.
  client.url(pages[pageName]);

  if (networkStubs.length) {
    // Fill the clients session storage
    // with network requests we want to
    // stub.
    client.execute(`sessionStorage.setItem('${IDENTIFIERS.networkStubs}', '${JSON.stringify(networkStubs)}')`);
    networkStubs = [];
  }

  // Set the cookies we've prepared
  // and clear the queue.
  cookies = cookies.filter(x => !client.setCookie(x));

  // We have to refresh the page so
  // cookies are sent correctly.
  if (refresh) client.refresh();
});
```

In this step we take the values from `networkStubs` and `cookies` to fill the session storage with network stubs and set the correct cookies to enable the mocking functionality in the browser.

One minor inconvenience of this approach is, that we have to first load the page, then set cookies and fill the session storage and then refresh the page to send all necessary cookies and set up the correct network stubs which are triggered immediately. This can add up to a several hundred milliseconds of loading time to every page open step.

## Writing tests

Now that we've put everything together, the fun begins. Let's write some tests!

### Network stubs

```gherkin
Scenario: Render a list of posts

  Given network stubs are enabled
  # If the XHR request is triggered immediately after the page
  # was loaded, the mock must be specified before triggering
  # the page load.
  And the endpoint "/posts" returns a `list of posts`
  When I open the `home page`
  Then I expect a `list of posts` to be visible
  And I expect the `first post` `title` to contain the text "First Post"
```

In the scenario above, we're testing if a list of posts is rendering correctly. In the first line, you can see the step to enable network stubs and in the next line we're defining what the endpoint `/posts` should return. You can find the [JSON file containing the list of posts in the GitHub repository](https://github.com/maoberlehner/network-stubs-and-timers-with-nightwatch-and-cucumber/blob/master/test/mocks/posts/list-of-posts.json).

As you can see in the [demo `index.html` file](https://github.com/maoberlehner/network-stubs-and-timers-with-nightwatch-and-cucumber/blob/master/public/index.html#L33), the `/posts` endpoint is called immediately after the page is loaded. Because of that, we must define the step before we're opening the home page.

### Timers

```gherkin
Scenario: Greet new user

  Given network stubs are enabled
  And time traveling is enabled
  When I open the `home page`
  # If a request is made on user interaction, it's possible to
  # define the XHR mock after the page was already loaded but
  # before the request is triggered.
  Given the endpoint "/users" returns a `new user` when sending data
  When I click the `create user button`
  Then I expect a `user greeting` to be visible
  And I expect the `user greeting` to contain the text "Hello Markus!"
  Given "5" seconds have passed
  Then I expect the `user greeting` to not be present
```

In the example scenario above, we're also enabling time traveling additionally to network stubs. Because in this case, the POST request to the `/users` endpoint is made after the user clicks a button, we can define the step for defining a mock response after the step for opening the page. It has to be defined before the step for clicking the button tough.

After the user clicks a button, a new user is created and they should be greeted by a message which should disappear after 4 seconds. Because we don't want to actually wait for 4 seconds, we can utilize the power of mock timers, to fast forward 5 seconds instantaneously.

## Wrapping it up

Mock timers and network stubs have huge potential to not only make tests faster, but also much more reliable, because you don't have to rely on external infrastructure outside of your control.

Though, adding the scripts which enable those functionalities comes with the drawback of putting your test environment in a different state than what you serve on your production servers.

The convenience comes with a tradeoff, keep that in mind when you're planing on using this, or a similar approach, in your testing environment.
