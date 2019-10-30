+++
date = "2018-03-04T10:45:32+02:00"
title = "Automated Acceptance Testing with Cypress and Vue.js Part 1: Setup"
description = "Learn how to set up Cypress for testing Vue.js powered applications to run automated acceptance tests."
intro = "In today's article we're going to take a look at one of the rising stars in the automated end-to-end testing scene: Cypress. When I first discovered Cypress, I thought that it looks very promising but I was skeptical if it can live up to the hype..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Front-End testing", "acceptance tests"]
+++

In today's article we're going to take a look at one of the rising stars in the automated end-to-end testing scene: [Cypress](https://www.cypress.io/). When I first discovered Cypress, I thought that it looks very promising but I was skeptical if it can live up to the hype. Although [Nightwatch.js](http://nightwatchjs.org/) is kinda old and boring, it has proven to be a useful tool, which, even though it has it quirks, does its job well, most of the time. Let's find out if Cypress is a serious competitor.

<div class="c-content__figure">
  <div class="c-content__broad">
    <video src="/videos/2018-03-04/cypress-gui.mp4" autoplay muted controls></video>
  </div>
  <p class="c-content__caption">
    <small>Cypress GUI running a simple test</small>
  </p>
</div>

## Setup

In the following steps, I assume that you have a Vue.js app already up and running. If you don't or you want to see the full code used in this article, you can check out the [GitHub repository for this article](https://github.com/maoberlehner/automated-acceptance-testing-with-cypress-and-vue).

```bash
npm install --save-dev cypress
```

The recommended way of using Cypress is as a npm dependency. With the command above, we can pull Cypress as a dependency into our Vue project.

### Configuration

By default, Cypress is generating an empty configuration file `cypress.json` in your projects root directory. But because we want to make some changes to the default configuration before running Cypress, we create the file ourselves.

```json
{
  "baseUrl": "http://localhost:8080",
  "fixturesFolder": "test/fixtures",
  "integrationFolder": "test/features",
  "pluginsFile": "test/plugins",
  "screenshotsFolder": "test/screenshots",
  "supportFile": "test/support",
  "videosFolder": "test/videos"
}
```

As you can see above, we're using the default webpack development server URL `http://localhost:8080` as our `baseUrl`. We do this for convenience, in a real world application you wan't to run your tests on a version of your app which matches the production environment of your application as close as possible.

By default, Cypress is configured to store all its files in a `cypress` directory which is located at the root level of your project. I'm not a huge fan of this practice so I've changed all the directories to point to a `test` directory instead. I think this is a quite common pattern. If you already have unit-tests in place, which are located in the `test` directory, you might consider to create separate subdirectories for unit and acceptance tests inside of your `test` directory.

Because we're changing some default directories, it's important to create this file _before_ running Cypress initially, because Cypress automatically creates the directories and some default files when it's started for the first time.

### Other stuff

#### Git and Cypress

In the very likely case that you're using Git, there are two directories you want to keep out of your version control system. I recommend you to add the following two directories to your `.gitignore` file.

```bash
test/screenshots
test/videos
# OR, if you're using the default config
cypress/screenshots
cypress/videos
```

#### ESLint and Cypress

In case you're using ESLint for linting your JavaScript files, you also want to configure ESLint for Cypress.

```bash
npm install --save-dev eslint-plugin-cypress
```

The easiest way to make ESLint work well with Cypress, is to install the Cypress ESLint plugin `eslint-plugin-cypress` and add it to your `.eslintrc` configuration file.

```json
{
  "env": {
    "cypress/globals": true
  },
  "plugins": [
    "cypress"
  ]
}
```

<div>
  <hr class="c-hr">
  <div class="c-service-info">
    <h2>Do you want to learn more about advanced Vue.js techniques?</h2>
    <p class="c-service-info__body">
      Register for the Newsletter of my upcoming book: <a class="c-anchor" href="https://oberlehner.us20.list-manage.com/subscribe?u=8476a98c5640f6c7b5530ea57&id=8b26bf120b" data-event-category="link" data-event-action="click: newsletter" data-event-label="Newsletter (article content)">Advanced Vue.js Application Architecture</a>.
    </p>
  </div>
  <hr class="c-hr">
</div>

## Writing the first test

After we've configured Cypress, we're ready to write our first simple test.

```js
// test/features/home.js

describe('Home', () => {
  beforeEach(() => {
    // Because we're only testing the homepage
    // in this test file, we can run this command
    // before each individual test instead of
    // repeating it in every test.
    cy.visit('/');
  });

  it('Should display the main headline.', () => {
    // By using `data-qa` selectors, we can separate
    // CSS selectors used for styling from those used
    // exclusively for testing our application.
    // See: https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements
    cy.get('[data-qa="main headline"]').should('be.visible');
    cy.get('[data-qa="main headline"]').contains('Home');
  });
});
```

To run our newly created test, we have to start the webpack development server first and then execute the Cypress command. To make starting Cypress a little easier, we can add two npm scripts to the `scripts` section of our `package.json` file.

```bash
{
  "scripts": {
    "test:open": "cypress open",
    "test": "cypress run"
  },
}
```

The first command `test:open` opens the Cypress GUI which makes it possible to run specific tests and watch them run live. The second command `test` runs Cypress in headless mode, this is the one you want to run on your CI system or if you want to check if all your tests are passing before pushing a new feature. Let's run `npm run test:open` to open the Cypress GUI. To run our test, click the `Run All Tests` button in the top right corner of the app.

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

## Final thoughts

Although we've only scratched the surface of what Cypress is capable of, the GUI already looks very promising. I'm also very curios to try out some of the advanced features like time traveling, spies, clocks and stubbing network requests.

In [the second part of this article series](https://markus.oberlehner.net/blog/automated-acceptance-testing-with-cypress-and-vue-network-stubs-and-timers/), we're going to dive deeper into the matter of acceptance testing and we'll look into some advanced topics surrounding this very broad topic.
