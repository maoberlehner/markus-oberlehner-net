+++
date = "2020-08-16T08:08:08+02:00"
title = "Cross-Browser Acceptance Tests with LambdaTest and TestCafe"
description = "Learn how to run automated cross-browser acceptance tests on LambdaTest with TestCafe."
intro = "In this article, we will take a closer look at how we can run automated cross-browser acceptance tests in real browsers on LambdaTest using TestCafe as our test framework..."
draft = true
categories = ["Development"]
tags = ["JavaScript", "TDD", "Front-End testing", "Acceptance testing"]
+++

> This is a sponsored article. Thank you, LambdaTest, for supporting me and this blog!

In this article, we will take a closer look at how we can run automated cross-browser acceptance tests in real browsers on [LambdaTest](http://www.lambdatest.com?fp_ref=markus88) using TestCafe as our test framework. LambdaTest is a modern and fast browser testing service with powerful features when it comes to automated cross-browser testing.

You can check out the code for the final result of this article [on GitHub](https://github.com/maoberlehner/lambda-test-test-cafe).

## Setup

Let's start by creating the directory structure for our test code. As you can see in the following example, we split our tests into `acceptance` and `unit` tests.

```bash
.
├── ...
└── test
    ├── acceptance
    └── unit
```

Next, we install the relevant dependencies we need to run a local server with `http-server` and our test runner of choice TestCafe.

```bash
npm install --save-dev http-server testcafe
```

To keep things simple, we use npm scripts in our `package.json` file to run our tests from the command line.

```json
"scripts": {
  "test:acceptance": "testcafe chrome,firefox test/acceptance/ --app 'http-server dist/ -p 1337 -s'"
}
```

The `test:acceptance` npm script triggers the `testcafe` command to run our tests in Google Chrome and Firefox. You have to make sure that you have installed both browsers for this to work. The `--app` option is telling TestCafe to start an `http-server` on the port `1337` serving files from the `dist/` directory (make sure to run `npm run build` before executing the tests, when working with [my demo GitHub repository](https://github.com/maoberlehner/lambda-test-test-cafe)). The `-s` (silent) option disables the server's log output because we only want to see the output of TestCafe.

## Writing tests with TestCafe

Now that we have set up everything and are ready to go, we can start writing our first test. For demonstration purposes, we test a very simple Vue.js powered demo application. The application is a simple counter: we begin with `0`; when we click on the `+` button, the number should count up, and when we click on the `-` button, the number should be reduced by `1`.

```js
// test/acceptance/index.js
import { Selector } from 'testcafe';

fixture('Index').page('http://localhost:1337/');

test('It should increase the count by 1 when clicking "+".', async (t) => {
  const count = Selector('[data-qa="count"]');
  const increaseButton = Selector('[data-qa="increase button"]');

  await t
    .click(increaseButton)
    .expect(count.innerText)
    .eql('1');
});

test(`It should decrease the count by 1 when clicking "-".`, async (t) => {
  const count = Selector('[data-qa="count"]');
  const increaseButton = Selector('[data-qa="decrease button"]');

  await t
    .click(increaseButton)
    .expect(count.innerText)
    .eql('-1');
});
```

Now that we have created our first TestCafe test file, we can run the test script locally to see if everything works as expected.

<div class="c-content__figure">
  <video
    data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1542158516/blog/2020-08-16/local-firefox-chrome.mp4"
    poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1542158516/blog/2020-08-16/local-firefox-chrome"
    muted
    autoplay
    loop
  ></video>
  <p class="c-content__caption">
    <small>The tests running locally in Firefox and Chrome</small>
  </p>
</div>

Et voilà! Our tests succeed on our locally installed browsers. In the next step, we want to use LambdaTest to check if everything works correctly on older browsers like Edge 18.

## Run tests on LambdaTest

Using LambdaTest also enables us to run our acceptance tests in older versions of popular browsers and even down to IE7 if you still have to support those kinds of browsers.

If you don't have [created an account](http://www.lambdatest.com?fp_ref=markus88), now is the time to do so (there is a free tier). Before we can get started, we need to install an additional npm dependency so that we can run tests in the LambdaTest cloud instead of locally on our machine.

```bash
npm install --save-dev testcafe-browser-provider-lambdatest
```

Next, we need to get our LambdaTest authentication credentials. Go to the [`Automation`](https://automation.lambdatest.com/) tab in the navigation and click on the key icon top right to find your credentials. Those credentials are secret! Make sure never to commit those credentials to a public Git repository!

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2020-08-16/lambda-test-credentials">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-08-16/lambda-test-credentials"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2020-08-16/lambda-test-credentials 2x"
        alt="Screenshot of where to find your LambdaTest credentials."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-08-16/lambda-test-credentials"
          alt="Screenshot of where to find your LambdaTest credentials."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption">
    <small>Find your LamdaTest credentials in the top right</small>
  </p>
</div>

Next, run the following commands in your command line. Make sure to change the values with your credentials.

```bash
export LT_USERNAME=markus.oberlehner
export LT_ACCESS_KEY=XxXxXKazzGcRMgFQ9FXxXxXRQrWnZdpdirmcXxXxX2UmKXxXxX
```

If you use Git to manage your codebase, I recommend adding the following line to your `.gitignore` file to don't accidentally commit this directory, which gets automatically created by LambdaTest.

```text
.lambdatest
```

Now we are set up to run our tests in all kinds of browsers in the LambdaTest cloud. Let's add an additional npm script to conveniently run our tests in the cloud.

```json
"scripts": {
  "test:acceptance": "testcafe chrome,firefox test/acceptance/ --app 'http-server dist/ -p 1337 -s'",
  "test:acceptance:lambdatest": "testcafe 'lambdatest:Edge@18:Windows 10' test/acceptance/ --app 'http-server dist/ -p 1337 -s'"
}
```

```bash
npm run test:acceptance:lambdatest
```

<div class="c-content__figure">
  <video
    data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1542158516/blog/2020-08-16/lambdatest.mp4"
    poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1542158516/blog/2020-08-16/lambdatest"
    muted
    autoplay
    loop
  ></video>
  <p class="c-content__caption">
    <small>Running the tests remotely on LamdaTest</small>
  </p>
</div>

In this example we run our tests only in Edge 18 but if you want, you can add more browsers by separating them with a comma.

```bash
"scripts": {
  "test:acceptance:lambdatest": "testcafe 'lambdatest:Edge@18:Windows 10,lambdatest:Chrome@84:Windows 10' test/acceptance/ --app 'http-server dist/ -p 1337 -s'"
}
```

## The LamdaTest GUI

For now, we have only worked with the CLI of TestCafe and LambdaTest. Let's take a quick look at the GUI too.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2020-08-16/lambda-test-gui">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-08-16/lambda-test-gui"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2020-08-16/lambda-test-gui 2x"
        alt="Screenshot of the LambdaTest automation logs."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2020-08-16/lambda-test-gui"
          alt="Screenshot of the LambdaTest automation logs."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption">
    <small>You can watch videos of all your tests that run on LamdaTest</small>
  </p>
</div>

For every automated test run, you can see the results in the online dashboard. And you can even watch a video of your tests, which can be incredibly useful to understand why your tests fail in a specific browser.

## Next steps

Now we have seen how we can use the LambdaTest API to automate our cross-browser testing process. But there are more things we can do like Visual UI Testing, for example. I am very interested in exploring the Smart Testing capabilities, which make it possible to compare screenshots of your website with previously generated baseline images to detect regressions.

## Wrapping it up

I was impressed with how quick and easy it was to set up automated testing with LambdaTest and TestCafe. Furthermore, I'm also amazed at how fast the tests run automated and, likewise, manual testing. If you are currently looking for a cross-browser test automation service, I recommend you [give LambdaTest a try](http://www.lambdatest.com?fp_ref=markus88).
