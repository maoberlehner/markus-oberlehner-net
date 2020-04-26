+++
date = "2017-09-04T08:21:21+02:00"
title = "Front-End Testing Part 2: Cross-Browser Acceptance Tests with TestCafe, BrowserStack, and npm Scripts"
description = "Learn how to implement cross-browser acceptance tests using TestCafe, BrowserStack, and npm Scripts. Automatically test your site in all relevant browsers using BrowserStack."
intro = "In this article we'll build acceptance tests powered by TestCafe, BrowserStack, and npm scripts. After setting up local testing we configure Travis CI to automatically run our tests after pushing new code to a Git repository..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Front-End testing", "Acceptance testing"]
+++

In [the first part](/blog/front-end-testing-writing-javascript-unit-tests-with-ava-and-mock-browser/) of this two-part series about front-end testing, we explored [how to write JavaScript unit tests](/blog/front-end-testing-writing-javascript-unit-tests-with-ava-and-mock-browser/). In this article, we build acceptance tests powered by [TestCafe](https://github.com/DevExpress/testcafe), [BrowserStack](https://www.browserstack.com), and npm scripts. After setting up local testing, we configure Travis CI to automatically run our tests after pushing new code to a Git repository.

## Setup

First of all we're creating the directory structure for our test code. In the first part of this series we've already created a `test` directory containing a sub directory for our unit tests now we add an additional `acceptance` directory for our acceptance test files.

```bash
.
└── test
    ├── acceptance
    └── unit
```

Next we need to install the tools required to run acceptance tests.

```bash
npm install --save-dev http-server testcafe
```

We're installing TestCafe locally, therefore we need to add an npm script to our `package.json` file to conveniently run our tests with a simple command.

```json
"scripts": {
  "test:unit": "ava test/unit/**/*.test.js",
  "test:acceptance": "testcafe chrome,firefox test/acceptance/ --app 'http-server demo/ -p 1337 -s'",
  "test": "npm run test:acceptance"
}
```

The `test:unit` npm script you can see here was created in the first part of this article series about front-end testing. The `test:acceptance` script is the one we're going to focus on in this article. By providing `chrome,firefox` in the command line arguments for the `testcafe` command we're telling TestCafe to run tests in the locally installed browsers Chrome and Firefox. The next argument `test/acceptance/` is telling TestCafe were to look for test scripts.

By specifying the `--app` option we can tell TestCafe to start a new HTTP server using the `http-server` npm package, serving the contents from the `demo/` directory, using port `1337` and suppress (HTTP server) log messages by providing the `-s` (silent) option. The site which is served by `http-server` is the site we're going to test.

## Writing tests

The page we're going to test is the project website of an open source project of mine: [perfundo – a pure CSS lightbox](https://perfundo.oberlehner.net/). You can find [the code of the site and also all the test code on GitHub](https://github.com/maoberlehner/perfundo/tree/3.0.3).

Usually you'll create a separate test file for every page of your website. In some cases – if you want to test very complex pages – you might also create separate files for every feature on a page. In our case there is only one page, the homepage, which we're going to test.

```js
// test/acceptance/index.js
import { Selector } from 'testcafe';

fixture('Index').page('http://localhost:1337/');
```

In the example code above you can see that we're importing `Selector` from the `testcafe` package – `Selector` is a helper function to make it possible to select DOM elements. Next we're defining a new `fixture`, fixtures in TestCafe are a way of categorizing your tests. In this case we're naming our test `Index` and defining the page we want to test. The port we use here, must be the same you've specified in the npm script in your `package.json` file.

```js
test('The hero section is visible.', async (t) => {
  const heroSection = Selector('.c-hero');

  await t.expect(heroSection.exists).ok();
});
```

Our first test is a rather simple one. What we're doing here is that we try to select an element with a `.c-hero` selector and check if it exists on the page.

```js
test(`Click on hero image opens lightbox.`, async (t) => {
  const heroImageLink = Selector(`.c-hero .perfundo__link`);
  const heroImageOverlay = Selector(`.c-hero .perfundo__overlay`);

  await t
    .expect(heroImageOverlay.visible)
    .notOk()
    .click(heroImageLink)
    .expect(heroImageOverlay.visible)
    .ok();
});
```

Now the fun begins. In the test code above we're selecting the first element with a `.perfundo__link` class inside an element that matches the `.c-hero` selector. And we're also selecting the first overlay element inside the hero section.

The `expect` function checks if the `heroImageOverlay` element is visible and we expect it to be not visible at first by using `notOk()`. Next we trigger a `click()` on the `heroImageLink` element. After that we expect that the visibility state of the `heroImageOverlay` element has changed and that it is visible by now.

By running `npm run test:acceptance` we can run our tests locally. Assuming Chrome and Firefox are installed we can see how TestCafe is opening those browsers and we can watch while the provided tests are running.

If you want to see more test examples you can go to the [perfundo GitHub repository](https://github.com/maoberlehner/perfundo/blob/3.0.3/test/acceptance/index.js).

## Configuring Travis CI

In order to automatically run tests when pushing new code to GitHub (or some other system with Travis CI integration) we have to add a `.travis.yml` configuration file and activate our project in the Travis CI dashboard. You can read more about [adding a new project to Travis CI in the official documentation](https://docs.travis-ci.com/user/getting-started/).

```yaml
language: node_js
node_js:
  - "node"
script:
  - npm run lint
  - npm run test

sudo: required

addons:
  firefox: latest
  apt:
    sources:
     - google-chrome
    packages:
     - google-chrome-stable fluxbox

before_script:
  - "export DISPLAY=:99.0"
  - "sh -e /etc/init.d/xvfb start"
  - sleep 3
  - fluxbox >/dev/null 2>&1 &
```

In the Travis CI configuration file you can see above, we're telling Travis CI to run the `lint` and `test` npm scripts. `sudo: required` is needed to install Firefox and Chrome via `apt`. In the `addons` section we're instructing Travis CI to install Firefox, Chrome and the Fluxbox window manager which is needed to run TestCafe tests in Firefox and Chrome. The commands which we're specifying in the `before_script` section are necessary to configure Fluxbox correctly for our use case.

That's it. After enabling your project in the Travis CI dashboard and adding a `.travis.yml` configuration file to your project you're able to automatically run your TestCafe powered acceptance tests on Travis CI every time you push new code.

## Cross-browser testing with BrowserStack

Automatically running your acceptance tests in Chrome and Firefox is nice but we all know that there are several other browsers we have to take care of. BrowserStack makes it possible to boot up an instance of basically every relevant browser on the market. And furthermore BrowserStack provides an automation API which makes it possible to automate cross-browser testing.

Luckily TestCafe makes integrating BrowserStack as easy as it gets by providing an npm package to connect with the BrowserStack automation API.

```bash
npm install --save-dev testcafe-browser-provider-browserstack
```

All we have to do is to install the `testcafe-browser-provider-browserstack` npm package, specify the browsers we want to test in the `test:acceptance` npm script and make our BrowserStack credentials available via environment variables.

```bash
export BROWSERSTACK_USERNAME=perfundo
export BROWSERSTACK_ACCESS_KEY=1234567supersecret
```

First of all we're creating a new `.env` file which is exporting the BrowserStack configuration environment variables and add it to our shell configuration file (e.g. `.bashrc` or `.zshrc` depending on which shell you're using) by adding the following line `source ~/.env`. Restart your shell afterwards for the changes to take affect.

```json
"scripts": {
  "test:acceptance": "testcafe 'browserstack:ie@10.0:Windows 8,browserstack:ie@11.0:Windows 10' test/acceptance/ --app 'http-server demo/ -p 1337 -s'"
}
```

As you can see in the example above I have replaced `chrome,firefox` with the BrowserStack browser identifiers for Internet Explorer 10 and 11. To get a list of all available browser identifiers you can run `testcafe -b browserstack` (assuming you've installed TestCafe globally). If you're getting an error stating that authentication fails you've either provided wrong BrowserStack credentials or there is a problem with loading the `.env` file which exports the BrowserStack environment variables.

While your tests are running you can watch their status in the [BrowserStack Automate dashboard](https://www.browserstack.com/automate). And after the tests are finished you can watch a video of your test.

<video data-src="/videos/2017-09-04/perfundo-testcafe-browserstack-video.mp4" poster="/videos/2017-09-04/perfundo-testcafe-browserstack-video.jpg" controls></video>

### Re-configure Travis CI for BrowserStack cross-browser testing

If you want to test only in BrowserStack browsers, you can cleanup your `.travis.yml` configuration file.

```yaml
language: node_js
node_js:
  - "node"
script:
  - npm run lint
  - npm run test
```

You can remove all the additional settings which were required to install Firefox, Chrome and Fluxbox.

## Configuring ESLint to work with TestCafe

I personally had some troubles to get up and running with linting TestCafe files using ESLint. To save you the headaches here are some things I've learned about using ESLint with TestCafe (following the JavaScript syntax described in the TestCafe documentation) I wish I had known earlier.

```json
{
  "env": {
    "browser": true,
    "node": true
  },
  "globals": {
    "fixture": true,
    "test": true
  },
  "parserOptions": {
    "ecmaVersion": 8
  }
}
```

What you can see above is my `.eslintrc` ESLint configuration file. By defining `fixture` and `test` as globals, ESLint ignores the usage of those variables without defining them. Setting the `ecmaVersion` to `8` makes it possible to use the latest JavaScript syntax which is also used in the TestCafe documentation code examples. There is also an [official TestCafe ESLint configuration package](https://www.npmjs.com/package/eslint-plugin-testcafe) you can use, but the only thing it does is to add the `fixture` and `test` globals.

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

The combination of TestCafe, BrowserStack and Travis CI makes it possible to run all of your acceptance tests on all of your supported platforms automatically whenever you push new code to your repository.

You can save a lot of precious time and money by making sure your new feature runs in all relevant browsers without manually running every test yourself. And even more importantly automated tests can give you the peace of mind that everything still works after a major code overhaul or after implementing a new feature which affects other parts of your site.

With powerful tools like TestCafe and BrowserStack there is no reason not to write acceptance tests for at least the core features of your site.
