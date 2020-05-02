+++
date = "2018-09-02T06:11:11+02:00"
title = "Using Docker to run BackstopJS Powered Visual Regression Tests"
description = "Learn more about how I updated one of my open source projects to run visual regression tests with BackstopJS in Docker mode."
intro = "My very own CSS framework avalanche, uses BackstopJS for regression testing. Unfortunately, for the most time, this didn't work as expected on my continuous integration service of choice: Travis CI. The rendering of fonts is slightly different on the Linux image which is used on Travis CI compared to macOS which I use for development..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Front-End testing", "Acceptance testing"]
+++

My very own CSS framework [avalanche](https://avalanche.oberlehner.net/), uses [BackstopJS](https://github.com/garris/BackstopJS) for regression testing. Unfortunately, for the most time, this didn't work as expected on my continuous integration service of choice: Travis CI. **The rendering of fonts is slightly different on the Linux image which is used on Travis CI compared to macOS which I use for development on my end.** This prevents visual regression tests from being useful in this configuration, because, the reference images, taken on my macOS machine, do not match the comparison images on Travis CI.

Luckily BackstopJS now provides a way to run visual regression tests inside of a Docker container. This eliminates differences across different environments because tests always run in the same Docker container, no matter which OS is used by the developers or the CI system.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="/images/c_scale,f_auto,q_auto/v1532158513/blog/2018-09-02/backstopjs-os-font-rendering-diff">
      <img
        data-src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-09-02/backstopjs-os-font-rendering-diff"
        data-srcset="/images/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2018-09-02/backstopjs-os-font-rendering-diff 2x"
        alt="Screenshot of the different default font on Linux and macOS."
      >
      <noscript>
        <img
          src="/images/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-09-02/backstopjs-os-font-rendering-diff"
          alt="Screenshot of the different default font on Linux and macOS."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption">
    <small>Different default font on Linux (left) and macOS (right)</small>
  </p>
</div>

In this short article you can see the configuration changes I made to my existing BackstopJS powered regression tests in order to run them inside a Docker container.

## Running BackstopJS in Docker mode

Depending on your configuration, this might be the only change you have to make to your existing BackstopJS powered testing environment.

```diff
-backstop test
+backstop test --docker
```

Because my configuration is slightly more complicated, I had to make the following changes.

```diff
     bash "$DIR/scripts/build-test-html.sh" --package $(basename $f)
     # Build CSS
     bash "$DIR/scripts/build-test-css.sh" --package $(basename $f)
+    cp backstop.json "$f"
     # Test
-    ( cd "$f" && ../../node_modules/.bin/backstop test --configPath=../../backstop.json )
+    ( cd "$f" && ../../node_modules/.bin/backstop test --docker )
     # Cleanup
     rm -Rf "$f/test/tmp"
+    rm "$f/backstop.json"
   fi
 done
```

Because avalanche is structured as a Monorepo with multiple packages in one repository, I have to run the `backstop` command in all of the packages separately. But because I want to use only one configuration file, I added the `configPath` configuration option to point to a single `backstop.json` configuration file. As it turned out, this does not work correctly anymore and I got the following error message.

```bash
TypeError: Path must be a string. Received [ '../../backstop.json', '../../backstop.json' ]
```

To work around this issue, I changed my script to copy the configuration file into the package directory and delete it again after the test.

**Keep in mind, that you most likely have to generate new reference images after changing your setup to run in Docker.**

## Configuring Travis CI to run Docker

In order to make it possible to run docker commands on Travis CI, you have to add the following two lines to your `.travis.yml` configuration file.

```diff
language: node_js
+services:
+  - docker
node_js:
  - "node"
```

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

Running your BackstopJS powered visual regression tests inside a Docker container works really great and **it finally makes it possible to use visual regression tests efficiently on teams with different operating systems and even on continuous integration services like Travis CI.**
