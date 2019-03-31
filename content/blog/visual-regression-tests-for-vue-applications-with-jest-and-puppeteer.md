+++
date = "2019-03-17T06:08:08+02:00"
title = "Visual Regression Tests for Vue.Js Applications with Jest and Puppeteer"
description = "Learn how to use Jest and Puppeteer for Visual Regression Testing Vue.js applications."
intro = "Assuming that we already have integration tests and unit tests in place, it’s time to take a look at how we can build our next line of defense against unwanted regressions in our app. In this article we'll use Jest and Puppeteer to set up Visual Regression Tests..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Front-End Architecture", "TDD"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1200,h_675/v1532158513/blog/2019-03-17/visual-regression-jest-puppeteer-diff"]
+++

> **Note:** This is the seventh part of my “Advanced Vue.js Application Architecture” series on how to structure and test large scale Vue.js applications. Stay tuned, there's more to come! [Follow me on Twitter](https://twitter.com/MaOberlehner) if you don't want to miss the next article.  
> [<< First](/blog/multi-export-vue-single-file-ui-components/) [< Previous](/blog/integration-testing-vue-components-with-jest-and-puppeteer/)

Assuming that we already have [integration tests](/blog/integration-testing-vue-components-with-jest-and-puppeteer/) and [unit tests](/blog/advanced-vue-component-composition-with-container-components/) in place, it’s time to take a look at how we can build our next line of defense against unwanted regressions in our app. In this article, we'll use Jest and Puppeteer to set up Visual Regression Tests to test wether each part of our Vue.js application still looks as intended after making some (possibly unexpected) far-reaching changes.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2019-03-17/visual-regression-jest-puppeteer-diff">
      <img
        src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-03-17/visual-regression-jest-puppeteer-diff"
        srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2019-03-17/visual-regression-jest-puppeteer-diff 2x"
        alt="Diff of Visual Regression."
      >
    </a>
  </div>
  <p class="c-content__caption">
    <small>Diff showing Visual Regression</small>
  </p>
</div>

This article builds upon my previous article about [integration testing with Jest and Puppeteer](/blog/integration-testing-vue-components-with-jest-and-puppeteer/). If you want to follow along you can [checkout the repository of the previous article](https://github.com/maoberlehner/advanced-vue-component-composition-with-container-components/tree/jest-and-puppeteer-integration-tests). Additionally, you can [find the full code covered in this article on GitHub](https://github.com/maoberlehner/visual-regression-tests-for-vue-applications-with-jest-and-puppeteer) and you can also [take a look on the demo application running on Netlify](https://advanced-vue-component-composition-with-container-components.netlify.com/).

## The setup

Let’s start with setting up everything we need in order to run Visual Regression Tests. **All of the following code examples assume that you already have a basic test setup, [as described in my article about integration testing](/blog/integration-testing-vue-components-with-jest-and-puppeteer/), up and running.**

```bash
npm install jest-image-snapshot --save-dev
```

After installing the `jest-image-snapshot` dependency we can integrate it into our test setup.

```diff
 const { defaults } = require('jest-config');

-const puppeteerModes = ['acceptance', 'integration'];
+const puppeteerModes = ['acceptance', 'integration', 'visual'];
 const { TEST_MODE } = process.env;
 const PUPPETEER_MODE = puppeteerModes.includes(TEST_MODE);

+const testMatchers = {
+  integration: ['**/?(*.)+(integration).[tj]s?(x)'],
+  visual: ['**/?(*.)+(visual).[tj]s?(x)'],
+};

 module.exports = {
   moduleFileExtensions: [
     'js',
     'jsx',
     'json',
     'vue',
   ],
   preset: PUPPETEER_MODE ? 'jest-puppeteer' : defaults.preset,
   setupTestFrameworkScriptFile: '<rootDir>/test/setup/after-env.js',
   snapshotSerializers: [
     'jest-serializer-vue',
   ],
-  testMatch: TEST_MODE === 'integration' ? [
-    '**/?(*.)+(integration).[tj]s?(x)',
-  ] : defaults.testMatch,
+  testMatch: testMatchers[TEST_MODE] || defaults.testMatch,
   testURL: 'http://localhost:8080',
   transform: {
     '^.+\\.vue$': 'vue-jest',
     '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
     '^.+\\.jsx?$': 'babel-jest',
   },
 };
```

Here you can see the changes in our `jest.config.js` file. **We add a new matcher which is activated in `visual` mode for only handling files ending with `.visual.js`.**

```diff
     "test:acceptance": "TEST_MODE=acceptance vue-cli-service test:unit -- test/**/*",
     "test:integration": "TEST_MODE=integration vue-cli-service test:unit -- src/**/*"
     "test:integration": "TEST_MODE=integration vue-cli-service test:unit -- src/**/*",
+    "test:visual": "TEST_MODE=visual vue-cli-service test:unit -- test/**/*"
   },
   "dependencies": {
     "@vue/cli-plugin-babel": "^3.5.1",
```

In our `package.json` file we add a new npm script `test:visual` which is a shortcut for starting our visual integration tests by running `npm run test:visual`.

```diff
-const puppeteerModes = ['acceptance', 'integration'];
+const puppeteerModes = ['acceptance', 'integration', 'visual'];
 const { TEST_MODE } = process.env;
 const PUPPETEER_MODE = puppeteerModes.includes(TEST_MODE);
```

We also have to update the code regarding the `PUPPETEER_MODE` detection in our `test/setup/after-env.js` file. This could be refactored so we only have to maintain this logic in one place, but I leave this as an exercise for you.

```diff
+import { toMatchImageSnapshot } from 'jest-image-snapshot';
 import Vue from 'vue';

 const SERVE_MODE = !global.describe;
 const TEST_MODE = !SERVE_MODE && process.env.TEST_MODE;

+if (TEST_MODE === 'visual') {
+  expect.extend({ toMatchImageSnapshot });
+}

 export const setup = SERVE_MODE ? cb => cb() : () => {};

 export const mount = (asyncComponent, options = {}) => {
```

In our `test/utils.js` file we have to make two changes. **Above you can see the new code for activating the `toMatchImageSnapshot` `expect` extension.**

```diff
   return matches.length > 0;
 };

-export const open = url => page.goto(`http://localhost:8080${url}`);
+export const open = url => page.goto(`http://localhost:8080${url}`, { waitUntil: 'networkidle0' });
```

Additionally to activating the `expect` extension **we also have to make Puppeteer wait until the network is idle to make sure that everything is ready for screenshotting.**

```diff
 Thumbs.db

 # Folders to ignore
+__diff_output__
 /dist
 node_modules
 /test/screenshots/
```

Last but not least you can see that we've added the `__diff_output__` directory, which is used to store screenshots of diffs if a test fails, to our `.gitignore` file because we usually don't want to add those images to our repository.

## Writing a Visual Regression Test

Now that everything is set up correctly we can write our first Visual Regression Test.

```js
// test/features/homepage.visual.js
import { open } from '../utils';

describe('Homepage', () => {
  test('It should render correctly.', async () => {
    await open('/');
    const image = await page.screenshot({ fullPage: true });

    expect(image).toMatchImageSnapshot();
  });
});
```

**Above you can see that we first have to create a screenshot before we can use `toMatchImageSnapshot` to check if the newly created screenshot matches the reference screenshot taken earlier.** If the test is run for the first time, the fresh screenshot is saved as reference image, this means the first test run always succeeds.

<div>
  <hr class="c-hr">
  <div class="c-service-info">
    <h2>Do you want to learn more about testing Vue.js applications?</h2>
    <p class="c-service-info__body">
      Register for the Newsletter of my upcoming book: <a class="c-anchor" href="https://oberlehner.us20.list-manage.com/subscribe?u=8476a98c5640f6c7b5530ea57&id=8b26bf120b" data-event-category="link" data-event-action="click: newsletter" data-event-label="Newsletter (article content)">Advanced Vue.js Application Architecture</a>.
    </p>
  </div>
  <hr class="c-hr">
</div>

## The testing process

Before we can check if a Visual Regression has happened, we have to create a reference image. **Reference images are created automatically for us as soon as we run the test command the first time. The generated images should be checked in into version control.**

```bash
npm run serve
# In a new Terminal window
npm run test:visual
```

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2019-03-17/new-diff-screenshot">
      <img
        data-src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-03-17/new-diff-screenshot"
        data-srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2019-03-17/new-diff-screenshot 2x"
        alt="A new reference image is automatically created."
      >
      <noscript>
        <img
          src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-03-17/new-diff-screenshot"
          alt="A new reference image is automatically created."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-3.5em;">
    <small>A new reference image is automatically created</small>
  </p>
</div>

Now, as soon as you make some changes, you can run the Visual Regression Tests again to see if your changes have unintended side effects. Otherwise, if there are changes but they are all intended changes, you can delete the old reference image so a new one is created automatically for you as soon as you run the tests again. **But don't delete a reference image before you're absolutely sure that all the detected differences are actually intended.**

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like what you read?</h2>
      <p class="c-twitter-teaser__body">
        Follow me to get my latest Vue.js articles.
      </p>
      <a class="c-button c-button--outline c-twitter-teaser__button" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">
        Find me on Twitter
      </a>
    </div>
  </div>
</div>

## Wrapping it up

Visual Regression tests can be a great way of detecting unexpected Visual Regressions. But they also take quite long to execute. The longer your test suite runs the less useful it is. Keep that in mind when implementing Visual Regression Tests.

## Follow-up

If you have troubles with failing tests due to rendering inconsistencies between different operating systems, you can read my article about [how to run Visual Integration Tests with Docker](/blog/using-docker-to-run-visual-regression-tests-with-jest-and-puppeteer).

## References

- [Andres Escobar, Smile for the Camera: Using Mocks for Reliable Image Snapshots](https://americanexpress.io/smile-for-the-camera/)
- [loadfocus.com, Visual UI Regression Testing with Jest, Puppeteer and Headless Chrome](https://loadfocus.com/blog/2018/02/06/visual-ui-regression-testing-with-jest-puppeteer-and-headless-chrome/)
