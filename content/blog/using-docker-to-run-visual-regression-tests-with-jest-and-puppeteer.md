+++
date = "2019-03-31T06:35:35+02:00"
title = "Using Docker to Run Visual Regression Tests with Jest and Puppeteer"
description = "Learn how to use Docker to run Jest and Puppeteer powered Visual Regression Tests in order to prevent failing tests because of rendering differences between operating systems."
intro = "Today we'll explore how we can use Docker to run our tests in a standardized environment in order to prevent false positives because of differences between operating systems..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD"]
images = ["/images/c_scale,f_auto,q_auto,w_1200,h_675/v1532158513/blog/2019-03-17/visual-regression-jest-puppeteer-diff"]
+++

This is a follow-up to my last article about about [how to create Visual Regression Tests with Jest and Puppeteer for Vue.js applications](/blog/visual-regression-tests-for-vue-applications-with-jest-and-puppeteer/). **Today we'll explore how we can use Docker to run our tests in a standardized environment in order to prevent false positives because of differences between operating systems.** For a detailed explanation of how to set up Jest and Puppeteer please take a look at [the previous article](/blog/visual-regression-tests-for-vue-applications-with-jest-and-puppeteer/).

You can [find the full code of a demo application on GitHub](https://github.com/maoberlehner/visual-regression-tests-for-vue-applications-with-jest-and-puppeteer/tree/docker).

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2019-03-17/visual-regression-jest-puppeteer-diff">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-03-17/visual-regression-jest-puppeteer-diff"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2019-03-17/visual-regression-jest-puppeteer-diff 2x"
        alt="Diff of Visual Regression."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-03-17/visual-regression-jest-puppeteer-diff"
          alt="Diff of Visual Regression."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption">
    <small>Diff showing Visual Regression</small>
  </p>
</div>

## Why Docker?

What our Visual Regression Tests do is run a real browser, take a screenshot of our application, and compare that screenshot to a reference image. As we all know (due to many painful experiences), websites render slightly differently on different operating systems or even just different versions of operating systems. **By using Docker, we can ensure that the screenshots created by Jest and Puppeteer always look the same, no matter what host operating system is used, whether it is MacOS, Windows or Linux.**

## Setup

Before we get started you need to install Docker. You can [read more about how to get started with Docker on the official website](https://www.docker.com/get-started). Next we can proceed with creating our `Dockerfile`.

```bash
# Dockerfile
FROM buildkite/puppeteer:latest
RUN mkdir /app
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn && yarn cache clean
COPY . .
```

**We use the `buildkite/puppeteer` Docker image because it has everything we need to run our Puppeteer powered Visual Regression Tests out of the box.** Other than that this is a pretty standard `Dockerfile` for running Node.js applications. In order to optimize caching of the Docker container we copy the `package.json` and `yarn.lock` files first before installing all of our dependencies with Yarn and copying the rest of the application into our `/app` working directory.

```bash
# .dockerignore
node_modules/
```

We don't want to copy the `node_modules` directory so we add a new `.dockerignore` file which excludes this directory.

```bash
# docker-compose.yml
version: '3'
services:
  visual:
    build:
      context: .
    volumes:
      - "./src:/app/src"
      - "./test:/app/test"
    command: sh -c "npm run serve & wait-for-it.sh localhost:8080 -- npm run test:visual"
```

**Next we add a `docker-compose.yml` file which makes it easier to start our Docker container with some predefined settings.** In order to sync changes between the Docker container and the host system at runtime we link the `src` and `test` directories as `volumes`. We use the `command` property to specify which command should be triggered when starting the container. In our case we serve our application with `npm run serve` and then use `wait-for-it.sh`, which is built into the `buildkite/puppeteer` Docker image, to wait until `localhost:8080` is up so we can start our Visual Regression Tests by running `npm run test:visual`.

```diff
 const DEBUG_MODE = process.argv.includes('--debug');

+const debugLaunchOptions = DEBUG_MODE ? {
+  headless: false,
+  slowMo: 100,
+} : {};
+
 module.exports = {
-  launch: DEBUG_MODE ? {
-    headless: false,
-    slowMo: 100,
-  } : {},
+  launch: {
+    args: [
+      // Required for Docker version of Puppeteer.
+      '--no-sandbox',
+      '--disable-setuid-sandbox',
+      '--disable-dev-shm-usage',
+    ],
+    ...debugLaunchOptions,
+  },
};
```

Because unfortunately Puppeteer does not work inside of a Docker container out of the box, **we have to set some special launch arguments inside of our `jest-puppeteer.config.js` configuration file.**

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

## Running the tests

**After we have everything set up we can start our Visual Regression Tests by running `docker-compose run visual`.** If we have done everything right, our tests should now run inside of a Docker container.

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like What You Read?</h2>
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

The only thing worse than having no tests at all is having unstable tests. By making sure our Visual Regression Tests always run in the same Docker environment, we’re able to perform the tests on different machines and even in our CI pipeline without having to worry about minor rendering differences on these different machines.

## References

- [Docker Puppeteer Example](https://github.com/buildkite/docker-puppeteer/tree/master/example)
- [Alan Foster, Running react unit tests within docker](https://www.alanfoster.me/posts/running-react-unit-tests-within-docker/)
