+++
date = "2020-07-26T07:36:36+02:00"
title = "Retry Failed API Requests with JavaScript"
description = "Learn how to automatically retry failed requests before finally throwing an error."
intro = "One of the most fragile parts of modern web applications is the network connection. Any API request that we make in our code has a significant risk of failing. We can use several techniques to make our applications more resilient in the event of a network connection failure..."
draft = false
categories = ["Development"]
+++

One of the most fragile parts of modern web applications is the network connection. **Any API request that we make in our code has a significant risk of failing.** We can use several techniques to make our applications more resilient in the event of a network connection failure.

In this article, **we take a look at how we can retry a failed request.** This can be especially useful if many people who use our application are on the move, where there can be dead spots or other disruptions, which can lead to short periods without a network connection.

## Creating an error handling wrapper function

Next, you can see the code for our `‌wrapWithRetryHandling()` utility function.

```js
// src/utils/wrap-with-retry-handling.js
export const withRetryHandling = (callback, {
  baseDelay = 400,
  logger = console,
  numberOfTries = 3,
} = {}) => function callbackWithRetryHandling(...params) {
  const retry = async (attempt = 1) => {
    try {
      return await callback(...params);
    } catch (error) {
      if (attempt >= numberOfTries) throw error;

      // Use an increasing delay to prevent flodding the
      // server with requests in case of a short downtime.
      const delay = baseDelay * attempt;

      if (logger) logger.warn('Retry because of', error);

      return new Promise(resolve => setTimeout(() => resolve(retry(attempt + 1)), delay));
    }
  };

  return retry();
};
```

The `‌wrapWithRetryHandling()` function takes a callback function as its only argument. It returns a new `callbackWithRetryHandling()` function with the same signature as the callback function. Inside the `retry()` function the callback function is called. If the callback function throws an error, the error is caught the given `numberOfTries`. Only after the last try, the error is thrown and delegated to where we called the wrapped function.

Now let's take a look at how we can use this function to create new methods with automatic retry handling built-in.

```js
// src/services/blog-post.js
import { api } from '../utils/api';
import { wrapWithRetryHandling } from '../utils/wrap-with-retry-handling.js';

const ENDPOINT = '/api/blog-post';

export const find = wrapWithRetryHandling((id) => {
  return api.get(`${ENDPOINT}/${id}`);
});

// ...
```

Here you can see that we directly wrap our `find()` function with the retry handling functionality. If you're 100% sure that you want that behavior every time you fetch blog posts from your API, this solution is fine. Otherwise, you can create facade functions wherever you need retry error handling instead.

```diff
 const ENDPOINT = '/api/blog-post';

-export const find = wrapWithRetryHandling((id) => {
+export const find = (id) => {
   return api.get(`${ENDPOINT}/${id}`);
-});
+};

 // ...
```

```js
// src/views/blog-post.js
import { find as findBlogPost } from './services/blog-post';
import { wrapWithRetryHandling } from './utils/wrap-with-retry-handling';

const findBlogPostWithRetryHandling = wrapWithRetryHandling(findBlogPost);

// ...

const blogPost = findBlogPostWithRetryHandling(id);

// ...
```

## Wrapping it up

There is no silver bullet when it comes to dealing with flaky network connections. But the technique highlighted in this article of retrying failed requests before throwing an error can be a building block in providing a better experience for our users.
