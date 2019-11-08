+++
date = "2017-10-15T13:04:52+02:00"
title = "Acceptance Testing with Nightwatch.js and Cucumber.js Part 3: BrowserStack"
description = "Learn how to run Nightwatch.js powered, automated cross-browser acceptance tests on BrowserStack."
intro = "Today, in the third and final part of this series about acceptance testing with Nightwatch.js and Cucumber.js, we will integrate automated cross-browser testing powered by BrowserStack into our workflow..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Front-End testing", "acceptance tests"]
+++

In the first part of this three-part series we've [set up a Nightwatch.js and Cucumber.js powered test environment](https://markus.oberlehner.net/blog/acceptance-testing-with-nightwatch-and-cucumber-setup/). In the second part we've looked at [how to write smart step definitions for Cucumber.js](https://markus.oberlehner.net/blog/acceptance-testing-with-nightwatch-and-cucumber-smart-step-definitions/).

Today, in the third and final part of this series about acceptance testing with Nightwatch.js and Cucumber.js, we will integrate automated cross-browser testing powered by BrowserStack into our workflow.

## Configuration

Currently we're using the default configuration file `test/conf/default.conf.js` (you can find the code in [the GitHub repository I've created for this article](https://github.com/maoberlehner/acceptance-testing-with-nightwatch-cucumber-and-browserstack/tree/part-3-browserstack)) for running our tests with Nightwatch.js and Selenium.

There are multiple ways of how to configure Nightwatch.js to run tests in BrowserStack, I prefer to create a separate configuration file which extends and overrides the default configuration. By following this approach, you can keep the configuration files relatively small and simple.

Let's create the new Nightwatch.js BrowserStack configuration file.

```js
// test/conf/browserstack.conf.js
const defaultConfig = require('./default.conf');

const browserstackConfig = {
  selenium: {
    start_process: false,
    host: 'hub-cloud.browserstack.com',
    port: 80,
  },
  test_settings: {
    default: {
      desiredCapabilities: {
        'browserstack.user': process.env.BROWSERSTACK_USERNAME,
        'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
        'browserstack.local': true,
      },
      globals: defaultConfig.test_settings.default.globals,
    },
    ie: {
      desiredCapabilities: {
        os: 'Windows',
        os_version: '8',
        browser: 'IE',
      },
    },
    edge: {
      desiredCapabilities: {
        os: 'Windows',
        os_version: '10',
        browser: 'edge',
      },
    },
    safari: {
      desiredCapabilities: {
        os: 'OS X',
        os_version: 'Sierra',
        browser: 'safari',
      },
    },
    firefox: {
      desiredCapabilities: {
        os: 'Windows',
        os_version: '10',
        browser: 'firefox',
      },
    },
    chrome: {
      desiredCapabilities: {
        os: 'Windows',
        os_version: '10',
        browser: 'chrome',
      },
    },
  },
};

const nightwatchConfig = Object.assign({}, defaultConfig, browserstackConfig);

Object.keys(nightwatchConfig.test_settings).forEach((key) => {
  const config = nightwatchConfig.test_settings[key];

  config.selenium_host = nightwatchConfig.selenium.host;
  config.selenium_port = nightwatchConfig.selenium.port;
  config.desiredCapabilities = Object.assign(
    {},
    nightwatchConfig.test_settings.default.desiredCapabilities,
    config.desiredCapabilities,
  );
});

module.exports = nightwatchConfig;
```

In the configuration file above we've set up Selenium to use the BrowserStack host to run its tests on. In the `default` `test_settings` we're providing our credentials for the BrowserStack API. Theoretically speaking you could provide your credentials directly in the configuration file, but even for private projects it's bad practice to check in credentials into the repository. There are multiple ways of how to deal with this problem, in our case we're using environment variables to provide the credentials. This approach also works with third party continuous integration systems like Travis CI.

```bash
# ~/.env
export BROWSERSTACK_USERNAME=perfundo
export BROWSERSTACK_ACCESS_KEY=1234567supersecret
```

One way of adding your BrowserStack credentials to your environment variables is to create a new `.env` file in your home directory and source it in the configuration file of your bash by adding the following line `source ~/.env`. Don't forget to restart your shell or manually run `source ~/.env` to make the changes take effect.

The code at the bottom of the configuration file merges the default configuration and the settings of the `default` `test_settings`.

## Local test runner

With BrowserStack it is possible to test an instance of a website, which is running on a local server on your machine, in the remote BrowserStack testing environment. But we need to install a new package to make this work: `browserstack-local`.

```bash
npm install --save-dev browserstack-local
```

To run Nightwatch.js tests using the `browserstack-local` package, we have to create our own custom local test runner script `test/local.runner.js`.

```js
#!/usr/bin/env node

const Nightwatch = require('nightwatch');
const browserstack = require('browserstack-local');

try {
  // Code to start browserstack local before start of test.
  console.log('Connecting local');

  Nightwatch.bs_local = new browserstack.Local();
  Nightwatch.bs_local.start({ key: process.env.BROWSERSTACK_ACCESS_KEY }, (error) => {
    if (error) throw error;

    console.log('Connected. Now testing...');

    Nightwatch.cli((argv) => {
      Nightwatch.CliRunner(argv)
        .setup(null, () => {
          // Code to stop browserstack local after end of parallel test.
          Nightwatch.bs_local.stop(() => {});
        })
        .runTests(() => {
          // Code to stop browserstack local after end of single test.
          Nightwatch.bs_local.stop(() => {});
        });
    });
  });
} catch (error) {
  console.log('There was an error while starting the test runner:\n\n');

  process.stderr.write(`${error.stack}\n`);
  process.exit(2);
}
```

The code above runs Nightwatch.js tests with BrowserStack which is able to access your local test server, thanks to the `browserstack-local` package.

## Parallel testing limit

Depending on your BrowserStack plan, you're only allowed to run a limited amount of automated tests in parallel. To prevent exceeding this amount let's write a little shell script `test/browserstack.sh` to start the tests consecutively.

```bash
#!/bin/bash

browsers=( "ie" "edge" "safari" "firefox" "chrome" )

for i in "${browsers[@]}"
do
  # Kill obsolete `browserstack-local` instance.
  kill $(lsof -t -i:45691)

  # Run tests sequentially.
  node test/local.runner.js -c test/conf/browserstack.conf.js -e ${i}
done
```

The shell script above, sequentially runs tests in the browser environments specified in the `browsers` variable.

Finally, to conveniently start the tests, let's add a new npm script.

```json
"scripts": {
  "test": "concurrently 'http-server src/ -p 1337 -s' 'nightwatch -c test/conf/default.conf.js' --success first --kill-others",
  "test-browserstack": "concurrently 'http-server src/ -p 1337 -s' 'sh test/browserstack.sh' --success first --kill-others"
},
```

This makes it possible to execute the tests with the command: `npm run test-browserstack`.

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

Cross-browser testing can be a tedious task. By automating this process, you can save a lot of boring, manual work. BrowserStack and Nightwatch.js make it pretty easy to run your tests on a wide variety of browsers. Happy testing.
