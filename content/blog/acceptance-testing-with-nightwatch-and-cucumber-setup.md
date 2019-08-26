+++
date = "2017-10-08T07:42:33+02:00"
title = "Acceptance Testing with Nightwatch.js and Cucumber.js Part 1: Setup"
description = "Learn how to set up Nightwatch.js in combination with Cucumber.js to run automated acceptance tests using the Gherkin syntax."
intro = "Nightwatch.js is battle tested and has proven to be a potent tool in the tool belt when it comes to conducting end-to-end tests. The combination of Nightwatch.js and Cucumber.js enables the writing of powerful automated acceptance tests in plain language (Gherkin) so that every project stakeholder can read and understand the test definitions..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Front-End testing", "acceptance tests"]
+++

In my previous article series about front-end testing ([Part 1](https://markus.oberlehner.net/blog/front-end-testing-writing-javascript-unit-tests-with-ava-and-mock-browser/) / [Part 2](https://markus.oberlehner.net/blog/front-end-testing-cross-browser-acceptance-tests-with-testcafe-browserstack-and-npm-scripts/)), I wrote about how to run acceptance tests with TestCafe. Although I'm a huge fan of TestCafe because it's shiny and new and uses the latest JavaScript features, there are a number of good reasons to use established systems like Nightwatch.js and Cucumber.js.

Nightwatch.js is battle tested and has proven to be a potent tool in the tool belt when it comes to conducting end-to-end tests. The combination of Nightwatch.js and Cucumber.js enables the writing of powerful automated acceptance tests in plain language (Gherkin) so that every project stakeholder can read and understand the test definitions.

In this article we will set up a test environment that is ready to perform acceptance tests with Nightwatch.js in the browsers Chrome and Firefox.

If you want to see a full example containing all the code featured in this blog post, you can got to the [GitHub repository](https://github.com/maoberlehner/acceptance-testing-with-nightwatch-cucumber-and-browserstack/tree/part-1-setup).

## Installing the necessary dependencies

First of all let's install all the npm dependencies we're going to need in the following steps.

```bash
npm install --save-dev chromedriver concurrently cucumber geckodriver http-server nightwatch nightwatch-cucumber selenium-server
```

The packages `chromedriver` and `geckodriver` are used by the Selenium browser automation framework `selenium-server` to control the browsers Chrome and Firefox. Nightwatch.js is using Selenium to control instances of browsers.

`concurrently` is a tool to run multiple CLI commands in parallel, we're going to use it to start a test server in parallel with the Nightwatch.js command.

The `nightwatch` and `cucumber` packages are the most important for our goal of running automated acceptance tests, `nightwatch` provides the Nightwatch.js test runner and the `cucumber` (Cucumber.js) package makes it possible to write our tests in Gherkin syntax – `nightwatch-cucumber` melts those two packages together.

If you want to run your tests exclusively in either Chrome or Firefox, you can skip the installation of either `chromedriver` or `geckodriver`. The packages `concurrently` and `http-server` are not necessary if you want to test on a live system or you already have a test server setup.

Because Selenium is a Java application, if you haven't already installed the [Java Development Kit (JDK)](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) on your system, you have to [download](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) and install it before you're able to run tests.

## The directory structure

After we've installed all the required dependencies to run Nightwatch.js powered acceptance tests, we have to setup the basic directory structure.

```bash
.
└── test
    ├── conf
    ├── custom-assertions
    └── features
        └── step-definitions
```

We're going to use the `test/conf` directory to store all of our configuration files. The `test/custom-assertions` directory can be used for [Nightwatch.js custom assertions](https://github.com/nightwatchjs/nightwatch-docs/blob/master/guide/extending-nightwatch/custom-assertions.md).

The acceptance test definitions and the step definitions which are powering them, will be located in the `test/features` and `test/features/step-definitions` directories.

## Configuration

In this step we're creating the default Nightwatch.js configuration file `default.conf.js` in `test/conf`.

```js
const nightwatchCucumber = require('nightwatch-cucumber');
const chromedriverPath = require('chromedriver').path;
const geckodriverPath = require('geckodriver').path;
const seleniumServerPath = require('selenium-server').path;

nightwatchCucumber({
  cucumberArgs: [
    '--require', 'test/features/step-definitions',
    'test/features',
  ],
});

module.exports = {
  output_folder: 'test/reports',
  custom_assertions_path: ['test/custom-assertions'],
  selenium: {
    start_process: true,
    server_path: seleniumServerPath,
    cli_args: {
      'webdriver.chrome.driver': chromedriverPath,
      'webdriver.gecko.driver': geckodriverPath,
    },
  },
  test_settings: {
    default: {
      globals: {
        url: 'http://localhost:1337',
      },
      desiredCapabilities: {
        browserName: 'chrome',
      },
    },
    firefox: {
      desiredCapabilities: {
        browserName: 'firefox',
      },
    },
  },
};
```

As you can see above, we're initializing `nightwatchCucumber` and telling it about the directory structure we've created in the previous step. By doing so, we enable Nightwatch.js to run Cucumber.js powered tests written in Gherkin syntax.

The main Nightwatch.js configuration in the `module.exports` block, basically tells Nightwatch.js where to find the paths to the Selenium server and the paths to the WebDriver packages for Chrome and Firefox.

In the `test_settings` section, you can specify the browser environments in which you want to run your tests. In this example, we're using Chrome as our default browser and we're defining `http://localhost:1337` as the URL of our test server. Firefox is set up as an optional testing environment.

## The website

In order to being able to test anything, we have to create a website we can test first. For this reason, we create a new file `index.html` in the `src` directory. The following example shows only the most important bits of the code, if you want to see the full code you can go to the corresponding [GitHub repository I've created for this blog post](https://github.com/maoberlehner/acceptance-testing-with-nightwatch-cucumber-and-browserstack/tree/part-1-setup).

```html
<form class="js-newsletter-form">
  <h2>Newsletter</h2>
  <input class="js-newsletter-input qa-newsletter-input" placeholder="Your email address">
  <div class="error js-newsletter-error qa-newsletter-error">Error</div>
  <div class="success js-newsletter-success qa-newsletter-success">Success</div>
  <button class="qa-newsletter-submit">Submit</button>
</form>
<script>
  const $newsletterForm = document.querySelector('.js-newsletter-form');
  const $newsletterInput = document.querySelector('.js-newsletter-input');
  const $newsletterError = document.querySelector('.js-newsletter-error');
  const $newsletterSuccess = document.querySelector('.js-newsletter-success');

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
</script>
```

For the purpose of this blog article, we're keeping it very, very simple. The code you can see above, displays a form with an input and a button. In the JavaScript code we're listening for the forms `submit` event to check if the value in the input field qualifies as an email address or not – if it does, we want to show a success message, otherwise an error message should be shown.

## Creating an acceptance test specification

Now that we've set up our website, let's create our first acceptance test definition file `newsletter-form.feature` in `test/features` to test it.

```gherkin
Feature: Newsletter Form

Scenario: Submit with invalid email address

  Given I open the `home page`
  Then I see the `newsletter input`
  When I enter an invalid e-mail address "invalid-address" into `newsletter input`
  And I click the `submit button`
  Then I see an `error message`
  But I don't see a `success message`
```

As you can see above, we can give our feature a name and we have to specify a test scenario which we also can give a name.

The `Given` keyword is supposed to be used, to set a given state at the beginning of a test run. In our case we wan't to navigate to the home page.

Next we're using the `Then` keyword to signal that we want to observe an outcome, in this case we want to make sure that there is a newsletter input field on the home page.

By starting a sentence with the `When` keyword, we're describing the key user action we want to simulate, which is that the user enters an (invalid) email address.

`And` can be used to avoid repeating keywords. In this case we want to specify a second user action and instead of using the `When` keyword again, we can use `And` to achieve a more natural language.

In the next line we're specifying the supposed outcome – again with using the `Then` keyword – which is that an error message should be visible.

Similar to `And`, `But` can be used to avoid repeating keywords. Instead of using `Then` again, we can use `But` to describe, that we expect the success message to be invisible.

## Step definitions

At this point you might wonder “How on earth can Cucumber.js know what to make out of this test definition?”. The answer is: it has no clue. In order to make Cucumber.js understand our test, we have to provide our own step definitions. Let's create a new file `base.js` in `test/features/step-definitions`.

```js
const { client } = require('nightwatch-cucumber');
const { defineSupportCode } = require('cucumber');

const { url } = require('../../conf/default.conf').test_settings.default.globals;

const pages = {
  'home page': `${url}/`,
};

const elements = {
  'newsletter input': '.qa-newsletter-input',
  'submit button': '.qa-newsletter-submit',
  'error message': '.qa-newsletter-error',
  'success message': '.qa-newsletter-success',
};

defineSupportCode(({ Given, Then }) => {
  Given(/^I open the `(.*?)`$/, pageName =>
    client.url(pages[pageName]));

  Then(/^I see.*? `(.*?)`.*?$/, elementName =>
    client.expect.element(elements[elementName]).to.be.visible);

  Then(/^I don't see.*? `(.*?)`.*?$/, elementName =>
    client.expect.element(elements[elementName]).to.not.be.visible);

  Then(/^I enter.*? "(.*?)" into `(.*?)`$/, (value, elementName) =>
    client.setValue(elements[elementName], value));

  Then(/^I click.*? `(.*?)`$/, elementName =>
    client.click(elements[elementName]));
});
```

After requiring some basic helper functions (`client` and `defineSupportCode`) and loading the base URL from the default config file we've created earlier, we're defining a `pages` and an `elements` object. We're going to use those objects to map certain keywords specified in `test/features/newsletter-form.feature` to page URLs and HTML element selectors.

You can see that we're using `.qa-` prefixed selectors, I wrote an [article about why I think separate CSS selectors for testing purposes are a good idea](https://markus.oberlehner.net/blog/css-selector-namespaces-for-stable-acceptance-tests/).

Next we're using the `defineSupportCode` function, to tell Cucumber.js about certain patterns we're using in our feature specification. As you can see, this patterns are based on regular expressions.

## Run Nightwatch.js with an npm script

Now that we've specified step definition patterns for all the sentences we're using to write our acceptance test, we're ready to glue everything together and run our first test.

```json
"scripts": {
  "test": "concurrently 'http-server src/ -p 1337 -s' 'nightwatch -c test/conf/default.conf.js' --success first --kill-others"
}
```

To conveniently run tests we're adding a new `test` script to our `package.json` file. We're using the `concurrently` package to start an HTTP test server and Nightwatch.js in parallel. By specifying the `--kill-others` option, we're telling the `concurrently` package to kill all the processes we've started in parallel if one of the processes is terminated. Usually this means, that the `http-server` process is killed automatically when the `nightwatch` command has finished.

To run the npm script, type `npm test` into your command line tool of choice. You should see that a new browser instance is opened and the browser is navigating to the URL we've specified in our test. The input field is filled automatically and the correct message should show up. If everything went correctly, the `nightwatch` command will exit with a success state.

## Next steps

The result of todays work is a very basic test case and very basic step definitions. We've also learned the general principles of running Cucumber.js powered tests in Nightwatch.js.

In [the next article of this series](/blog/acceptance-testing-with-nightwatch-and-cucumber-smart-step-definitions/) we're exploring more sophisticated ways of writing step definitions and how to create a setup that integrates testing deeply into your general project workflow. Stay tuned.
