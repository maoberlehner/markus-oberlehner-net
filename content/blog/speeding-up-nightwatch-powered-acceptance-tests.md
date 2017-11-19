+++
date = "2017-11-19T08:42:22+02:00"
title = "Speeding up Nightwatch.js Powered Acceptance Tests"
description = "Learn how to run Nightwatch.js tests without Selenium and how to utilize parallelization for speeding up your tests."
intro = "Today we're going to look at two ways of speeding up the process of running tests with Nightwatch.js – because faster is always better. The first small speed improvement can be achieved by eliminating Selenium from the setup..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Front-End testing", "acceptance tests"]
+++

In my last article series about automated testing, we were looking at how to [set up Nightwatch.js](https://markus.oberlehner.net/blog/acceptance-testing-with-nightwatch-and-cucumber-setup/), [write smart step definitions](https://markus.oberlehner.net/blog/acceptance-testing-with-nightwatch-and-cucumber-smart-step-definitions/) and [how to run automated cross browser acceptance tests on BrowserStack with Nightwatch.js](https://markus.oberlehner.net/blog/acceptance-testing-with-nightwatch-and-cucumber-browserstack/). Today we're going to look at two ways of speeding up the process of running tests with Nightwatch.js – because faster is always better.

## Running Nightwatch.js without Selenium
The first small speed improvement can be achieved by eliminating Selenium from the setup. As far as I know, the following approach, of running tests in Nightwatch.js without Selenium, for now is only possible with Google Chrome. If you want to run tests in Browsers other than Google Chrome, you still have to rely on Selenium or you can use BrowserStack, which also doesn't require you to have Selenium installed locally.

To run tests in Google Chrome directly without using Selenium, you have to change your Nightwatch.js configuration.

```js
module.exports = {
  // ...
  selenium: {
    start_process: false,
  },
  test_settings: {
    default: {
      // ChromeDriver default port.
      selenium_port: 9515,
      selenium_host: 'localhost',
      // Clear the default Selenium path prefix.
      default_path_prefix: '',
      desiredCapabilities: {
        browserName: 'chrome',
        acceptSslCerts: true,
      },
    },
  },
  // ...
};
```

Next you have to create a new global script (or add to an already existing one) to start the ChromeDriver in a `before` and to stop the ChromeDriver in an `after` hook.

```js
// globals.js
const chromedriver = require('chromedriver');

module.exports = {
  before: (done) => {
    chromedriver.start();
    done();
  },
  after: (done) => {
    chromedriver.stop();
    done();
  },
};
```

To load the globals file above, you can add the following line to your Nightwatch.js configuration file.

```js
module.exports = {
  // ...
  globals_path: `path/to/your/globals.js`,
  // ...
};
```

Thats it! After amending your configuration and adding the hooks to start and stop the ChromeDriver, you're ready to run your tests without having to rely on Selenium. Although the gains in speed are not huge, depending on your setup, you'll save a few seconds here and there.

## Parallelization with test workers
By default, Nightwatch.js runs your tests sequentially, but most modern computers are multi core machines and are able to run multiple processes in parallel. Luckily Nightwatch.js supports running your tests in parallel with so called test workers. To enable test workers, you have to add the following line to your configuration file.

```js
module.exports = {
  // ...
  test_workers: true,
  // ...
};
```

By default, Nightwatch.js will use all available CPU cores – if you have 2 cores, it will run 2 tests in parallel, if you have 4 cores it will run 4 tests in parallel, and so on.

If you want to limit the number of cores which Nightwatch.js is allowed to use, you can specify a fixed number.

```js
module.exports = {
  // ...
  test_workers: {
    enabled: true,
    workers: 3,
  },
  // ...
};
```

In the example above we're utilizing 3 cores for running tests. But be careful: if you're sharing your configuration in a Git repository with other users, there might be people with less powerful machines and less cores.

You might notice, that the output is slightly obscured when running tests in parallel. But there is a setting to improve readability of the output with test workers enabled.

```js
module.exports = {
  // ...
  test_workers: true,
  detailed_output: false,
  // ...
};
```

## Conclusion
In a world of TDD, there is nothing as annoying as having to wait for your tests to finish.

Eliminating Selenium from your test setup can improve the speed of your tests slightly. Enabling parallelization with test workers takes it a step further by speeding up your tests by a factor equal to the number of cores you have in your machine (at least theoretically speaking).

Happy testing!
