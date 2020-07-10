+++
date = "2019-04-28T06:05:05+02:00"
title = "try...catch: The Right Way"
description = "Learn how to use try...catch, when it might be a good idea to handle errors silently and how to deal with the unhandled promise rejection deprecation warning in Node.js."
intro = "Because of a recent bug hunting session where it took me a couple of hours to drill down several levels of npm dependencies in order to finally find a try...catch statement with the catch part being empty, I decided to write an article about this topic. Although, I have to admit, my first instinct was to be angry at the developer who did this..."
draft = false
categories = ["Development"]
tags = ["JavaScript"]
images = ["/images/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1532158515/blog/2019-04-28/try-catch-the-right-way"]
+++

Because of a recent bug hunting session where it took me a couple of hours to drill down several levels of npm dependencies in order to finally find a `try...catch` statement with the `catch` part being empty, I decided to write an article about this topic. Although, I have to admit, my first instinct was to be angry at the developer who did this, I figured **taking a closer look at how to properly deal with exceptions in Node.js and JavaScript** would be a better way to deal with the situation. I also realized that I myself am not entirely innocent in this respect.

## Good reasons for an empty catch block?

There are situations where, just like the developer who caused my several hours of debugging, we might think: I know that in certain situations this could throw an error, but actually I'm okay with that and it is not *really* an error. One example for this, and a situation in which I myself have been guilty of writing an empty `catch` statement, is trying to require a custom config file.

```js
const defaultConfig = { foo: 'bar' };
let customConfig = {};
try {
  customConfig = require(path.resolve(process.cwd(), 'custom.config'));
} catch (error) {
  // It is ok to have no custom config.
}
const config = { ...defaultConfig, ...customConfig };
```

If there is a custom config file, we want to load it, but if not that's fine too. In the case there is no custom config we simply stay with the defaults. Of course we could check if the file exists before trying to require it, but why make the code more complicated?

So what's the problem with using an empty catch block in this situation? The problem is that we catch **all** errors although we don't really know if all the other errors which might occur in the `try` block are actually unimportant for our code to run correctly.

```js
// custom.config.js
const foo = 'bar';
foo = 'baz'; // TypeError: Assignment to constant variable.

module.exports = { foo };
```

If we take a look at the example above requiring this config file would throw a `TypeError` with the message `Assignment to constant variable`. But because we intercept all errors, our code would continue with the default configuration and our user would wonder why their custom configuration is not loaded correctly.

```diff
 const defaultConfig = { foo: 'bar' };
 let customConfig = {};
 try {
   customConfig = require(path.resolve(process.cwd(), 'custom.config'));
 } catch (error) {
   // It is ok to have no custom config.
+  if (error.code !== 'MODULE_NOT_FOUND') throw error;
 }
 const config = { ...defaultConfig, ...customConfig };
```

By checking the error code we can make sure to only suppress errors which we *actually* don't care about like the `MODULE_NOT_FOUND` error code in our example. But if any other error happens we throw the error to end execution.

## Silently handling errors

[This excellent article](https://www.joyent.com/node-js/production/design/errors) differentiates between two kinds of errors: **operational errors** and **programmer errors.** Operational errors are basically errors where our code works correctly but something outside of our control (e.g. an API request) does fail. Programmer errors on the other hand are unknown bugs in our code.

In case of operational errors we can basically decide between three strategies.

1. Catch the error and retry the failed operation.
2. Catch the error and fail silently or show the user an error message they can easily understand.
3. Don't catch the error at all or throw a custom error.

If we deal with a network request we could look for certain error codes and retry the operation a couple of times before we actually throw an error.

Also, especially in the case of certain network errors it could absolutely make sense to catch the error and either fail silently (if the failing API request is not crucial to the functionality of our application) or show the user a nice error message.

```js
// notifications.js
import { fetchNew } from './notification-service';

try {
  const notifications = await fetchNew();
  // ...
} catch (error) {
  // Naive implementation.
  if (error.message.match(/Network Error/)) {
    Sentry.withScope((scope) => {
      scope.setLevel(Sentry.Severity.Info);
	    Sentry.captureException(error);
	  });
  } else {
    throw error;
  }
}
```

In the example above you can see how we could deal with network errors in a non critical part of our application. It isn't a big deal if the user does not see all of their latest notifications at any given time because our notification microservice is down for some reason. Moreover, network errors are usually not the fault of our application but operational errors. Nevertheless, we want to keep an eye on them so we can use a tool like [Sentry](https://sentry.io) to log those errors but we set the error level to `info` instead of `error`.

## Not handling errors

Depending how low level the code you write is, you can also decide do not handle the error yourself but let the consumer code decide how it deals with errors. As a general rule of thumb, error handling should always happen at the highest level. So if you have an `article-service.js` file which contains functions which make API requests to fetch articles and you also have several places in your code where you use this service, you most likely don't want to catch errors in `article-service.js` but in the places where you actually use the service.

```js
// article-service.js
import api from './api';

export async function list() {
  return api.list({ filter: { type: 'article' } });
}
```

```js
// article-listing.js
import { list } from './article-service';

// ...

try {
  const articles = await list();
  renderArticles(articles);
} catch(error) {
  // Naive implementation.
  Sentry.withScope((scope) => {
    scope.setLevel(Sentry.Severity.Warning);
	  Sentry.captureException(error);
  });
  // Render an error in the UI so the
  // user knows somethign went wrong.
  renderError(error);
}
```

Instead of catching the error directly in the article service, where we wouldn't really know what to do with it anyway, we capture it where we actually use the article service. Here we can decide either to render an error message or to handle the error silently, e.g. if we only render a few article teasers in a sidebar, which isn't important at all for the user.

##  How to *really* deal with unhandled promise rejection in Node.js

One thing that many of you have certainly stumbled upon is the infamous, `UnhandledPromiseRejectionWarning` in Node.js.

```text
UnhandledPromiseRejectionWarning: Unhandled promise rejection.
This error originated either by throwing inside of an async
function without a catch block, or by rejecting a promise
which was not handled with .catch().

DeprecationWarning: Unhandled promise rejections are
deprecated. In the future, promise rejections that are not
handled will terminate the Node.js process with a non-zero
exit code.
```

If you encounter this warning and you look on Stack Overflow for solutions, most examples you will find show how to catch the error and they add a simple `console.log()` in the `catch` block, but that's not always a good solution to deal with this situation. What if you actually want to stop execution in case a promise rejects?

```js
try {
  await someCriticalFunction();
} catch (error) {
  console.error(error);
  process.exit(1);
}
```

Above you can see the best solution I could find in order to deal with such situations in a way which not also makes Node.js happy and gets rid of the `DeprecationWarning` but also stops further execution of the script.

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

If there is only one thing you've learned from this article, I hope it is that you never should have an empty `catch` block in your code. Yes, in some situations it might make sense to catch **certain** errors, but I can't think of a situation where you definitely want to catch **all** errors no matter what.

## References

- [Joyent, Error Handling in Node.js](https://www.joyent.com/node-js/production/design/errors)
- [Dr. Axel Rauschmayer, Promise-based functions should not throw exceptions](http://2ality.com/2016/03/promise-rejections-vs-exceptions.html)
