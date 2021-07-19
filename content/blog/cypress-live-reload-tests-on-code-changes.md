+++
date = "2021-07-19T20:10:10+02:00"
title = "Cypress Live-Reload Tests on Code Changes"
description = "Learn how to set up Cypress to automatically rerun your tests when you make changes to your code."
intro = "Out of the box, Cypress offers an amazing live-reloading feature. But there is one caveat: live-reloading only works when changing test code, not when updating the application code. Nowadays, we are used to live-reloading in the browser thanks to webpack hot module replacement (HMR) and other fantastic development tools like Vite or Snowpack. If we had something similar in Cypress, practicing TDD would be a lot easier..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD"]
images = ["/images/c_pad,b_rgb:EFEFEF,f_auto,q_auto,w_1014,h_510/v1542158522/blog/2021-07-19/cypress-live-reload-code-changes"]
+++

Out of the box, Cypress offers an amazing live-reloading feature. But there is one caveat: live-reloading only works when changing test code, not when updating the application code. Nowadays, we are used to live-reloading in the browser thanks to webpack hot module replacement (HMR) and other fantastic development tools like Vite or Snowpack. If we had something similar in Cypress, practicing TDD would be a lot easier: write a failing test and update the code until the Cypress test turns green, all without ever manually testing the application ourselves. With live-reloading, we can let Cypress do all the time-consuming manual clicking and typing while focusing on coding.

## How to Enable Automatic Reloading on Code Changes in Cypress

Thanks to the `cypress-watch-and-reload` package, rerunning our Cypress integration tests whenever we update our code is straightforward.

```bash
npm install --save-dev cypress-watch-and-reload
```

After installing the `cypress-watch-and-reload` npm package, we need to enable it in our Cypress setup.

```js
// cypress/plugins/index.js
// ...
import 'cypress-watch-and-reload/plugins';
// or
require('cypress-watch-and-reload/plugins');
```

```js
// cypress/support/index.js
// ...
import 'cypress-watch-and-reload/support';
// or
require('cypress-watch-and-reload/support');
```

Now that we've enabled the plugin, we can update or `cypress.json` configuration file and tell Cypress which directories it should watch for file changes.

```json
{
  "cypress-watch-and-reload": {
    "watch": ["src/**"]
  }
}
```

You can be more granular, but for a typical Vue or React project, watching for changes in the `src` directory should be fine.

After setting everything up, Cypress now watches for any change to our application code and automatically reruns our tests for us. Because we probably don't want to run many tests every time we change our application, I highly recommend using the watch mode in combination with the `only` attribute.

```js
// Only this test is executed.
it.only('should not ...', () => {
  // ...
});

// This one is skipped.
it('should show ...', () => {
  // ...
});
```

## Wrapping It Up

With live reloading, we can practice TDD very effectively. After all, we can save a lot of time because we don't need to do any manual clicking and typing anymore to test if our frontend application code works correctly.
