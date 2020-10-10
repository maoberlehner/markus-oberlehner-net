+++
date = "2020-10-04T10:36:36+02:00"
title = "Wrap Third-Party Libraries"
description = "Wrapping Third-Party Libraries can make refactoring a lot easier. But it also has some downsides."
intro = "Certain coding practices seem superfluous when you first encounter them, but sooner rather than later you get into a situation where you wish you had stuck with them. Wrapping third-party libraries instead of using them directly in your codebase is one of those practices..."
draft = false
categories = ["Development"]
tags = ["JavaScript"]
images = ["/images/c_pad,b_rgb:0087FF,f_auto,q_auto,w_1014,h_510/v1542158523/blog/2020-10-04/wrapped-third-party-library"]
+++

Certain coding practices seem superfluous when you first encounter them, but sooner rather than later you get into a situation where you wish you had stuck with them. Wrapping third-party libraries instead of using them directly in your codebase is one of those practices.

Although I won't advise you to wrap all of your dependencies 100% of the time, especially when it comes to libraries with a large API surface area, you should definitely consider it.

## 1:1 Re-Export

The 1:1 Re-Export variant is the most basic form of this pattern: we re-export `axios` directly from our own `http` util file.

```js
// utils/http.js
export * from 'axios';
```

```js
// services/user.js
import http from '../utils/http';

export const user = {
  get({ id }) {
    return http.get(`/user/${id}`);
  },
  // ...
};
```

Instead of scattering the `axios` dependency all over our application, we only have one place where we are allowed to use this external dependency. This means that if the time comes when we have to replace it (because it is no longer maintained or we realize that `fetch()` is good enough for us, for example), we can easily do this because we only have one file we need to update.

## Reducing the Surface Area of Dependencies

Wrapping third-party dependencies opens up the opportunity to reduce the API surface area of external dependencies.

```js
// utils/http.js
import axios from 'axios';

export default {
  get: axios.get,
  post: axios.post,
};
```

Here you can see that we can choose only to export the `get` and `post` methods from `axios`. That way, we can nudge the developers of our project in the right direction by not making it possible to use `axios.request`, for example.

## Make It Your Own

We can even go a step further and make the API our own, so it matches our project's code style.

```js
// utils/http.js
import axios from 'axios';

export default {
  get: ({ url, config }) => axios.get(url, config),
  post: ({ url, data, config }) => axios.post(url, data, config),
};
```

In this example, we make the API of the `get()` and `post()` methods our own and use a [single object instead of multiple parameters](/blog/weekly-recap-single-parameter-object-and-craftsmanship-vs-engineering/#single-parameter-object).

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

## Downsides

One downside of this practice is that we lose the benefit of having an externalized documentation where we can point our developers to. In the case of the 1:1 re-export, we can tell developers to go to the original documentation.

```js
// utils/http.js
// See https://github.com/axios/axios for docs.
export * from 'axios';
```

But you have to consider this if you change the API of the dependency. Though as long as the API is not too complicated, this should not be a big deal.

## Wrapping It Up

As so often, also the practice of wrapping third-party dependencies is not without some downsides. But when it comes to dependencies that are likely to change or that are heavily used throughout your codebase, more often than not, the benefits outweigh the costs. Still you have to XXX at this on a case to case basis.
