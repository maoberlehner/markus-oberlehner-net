+++
date = "2019-04-07T07:34:34+02:00"
title = "Distributed Vue.js Applications Part 1: Loading Components via HTTP"
description = "Learn how to load external Vue.js components via HTTP and how to generate standalone component libraries with Vue CLI."
intro = "Imagine the following scenario: We have a central content distribution server responsible for pushing new content (think of news articles for example) to a variety of Vue.js-based client applications. But we not only want to push new content but also describe the shape of the content via Vue.js components..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Front-End Architecture"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1200,h_675/v1532158513/blog/2019-04-07/distribution-architecture-diagram"]
+++

Imagine the following scenario: We have **a central content distribution server** responsible for pushing new content (think of news articles for example) to **a variety of Vue.js-based client applications.** But we not only want to push new content but also describe the shape of the content via Vue.js components. One possibility would be to share those Vue.js components as npm packages but that way every client application must be updated whenever a new version or a completely new component is released. What if we also could manage these components on the central distribution server and create **client applications that are capable of dynamically loading components** from that server?

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2019-04-07/distribution-architecture-diagram">
      <img
        data-src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-04-07/distribution-architecture-diagram"
        data-srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2019-04-07/distribution-architecture-diagram 2x"
        alt="Content and Vue.js component distribution architecture."
      >
      <noscript>
        <img
          src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-04-07/distribution-architecture-diagram"
          alt="Content and Vue.js component distribution architecture."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption">
    <small>Content and Vue.js component distribution architecture</small>
  </p>
</div>

This is the first part of a series of articles about Distributed Vue.js Applications. Over the course of the series **we’ll find out how we can dynamically load Vue.js components via HTTP** from a content and component distribution server. Furthermore, **we’ll explore how we can push updates to components via a WebSocket connection** and how to re-render the client application whenever there is new content or a component was updated.

In this article we'll take a look at **how we can use the Vue CLI to generate a component library** which is ready for being distributed over a remote server. Additionally, we'll look at how we can dynamically load those components from the distribution server into our client application.

You can [find the full code featured in this article on GitHub](https://github.com/maoberlehner/distributed-vue-applications-loading-components-via-http).

## Creating a Vue.js component library

Since the release of Vue CLI v3, it's easier than ever before to package Vue.js Single File Components in a way that they can be used standalone as part of a component library. Let's take a look at how we can achieve this.

```html
<template>
  <h2>Hello from the Distribution Server!</h2>
</template>
```

Above you can see a very simple example component (`server/components/MyComponent/MyComponent.vue`) which we'll convert into a library component in the next step.

```bash
npm install @vue/cli-service
```

After installing the Vue CLI Service, we can run the following command to create a compiled and packaged version of our component.

```bash
npx vue-cli-service build --target lib --formats umd-min --no-clean --dest server/components/MyComponent --name "MyComponent.[chunkhash]" server/components/MyComponent/MyComponent.vue
```

**One important piece here is the `[chunkhash]` in the component name.** We want our library components to be virtually cached forever, so **we need unique URLs for our components in case a new version of a component is released.**

Next up we build a very simple static server based on express to serve our component library.

```bash
npm install express
```

```js
// server/index.js
const express = require('express');
const path = require('path');

const PORT = 8200;

const app = express();

app.use(express.static(path.resolve(__dirname, 'components'), {
  maxAge: '365d',
}));

app.listen(PORT);

console.log(`Listening on: http://localhost:${PORT}`);
```

We can start our server by running `node server/index.js`. Now you should be able to open the following URL in your browser to see the compiled source code of our component: [http://localhost:8200/.../MyComponent.c9c0abb8e999d0e5654e.umd.min.js](http://localhost:8200/MyComponent/MyComponent.c9c0abb8e999d0e5654e.umd.min.js).

**Keep in mind that express is usually not the best fit to serve static files at scale.** In a production environment you’ll most likely reach for something like Nginx or [use a reverse proxy for express](https://expressjs.com/en/advanced/best-practice-performance.html#use-a-reverse-proxy).

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

## Loading Vue.js components over HTTP

Usually, if we want to dynamically load a Vue.js component, we use a dynamic import.

```js
const MyComponent = () => import('./MyComponent.vue');
```

This works great as long as `MyComponent` is part of the code base (either directly or as a npm dependency) of the Vue.js client application. But in our case **we want to manage our components in one central place on our content distribution server** instead of having to install and regularly update it in possible dozens of independent Vue.js based client applications.

```js
// This does not work.
const MyComponent = () => import('https://distribution.server/MyComponent.js');
```

Ideally, we could do it the way you see above. But this does not work because neither webpack nor the native implementation of `import()` can deal with external resources.

In the following example code snippet you can see our own implementation of `import()` which does work with external resources.

```js
// src/utils/external-component.js
export default function externalComponent(url) {
  const name = url.split('/').reverse()[0].match(/^(.*?)\.umd/)[1];

  if (window[name]) return window[name];

  window[name] = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.addEventListener('load', () => {
      resolve(window[name]);
    });
    script.addEventListener('error', () => {
      reject(new Error(`Error loading ${url}`));
    });
    script.src = url;
    document.head.appendChild(script);
  });

  return window[name];
}
```

First we parse the name of the component from the URL. Later we inject a new script tag to load the JavaScript file from the given URL. Component packages created by the Vue CLI add a new global variable for the component on the window object. We can resolve our helper function after the script was loaded and return the globally available component.

Next up you can see how we can use our `externalComponent()` helper function to load external components pretty much the same way as we are used to with `import()`.

```js
import externalComponent from '../utils/external-component';

const MyComponent = () => externalComponent('http://localhost:8200/MyComponent/MyComponent.c9c0abb8e999d0e5654e.umd.min.js');

export default {
  name: 'MyOtherComponent',
  components: {
    MyComponent,
  },
  // ...
}
```

If you now serve the Vue.js application you should be able to see that the external `MyComponent` is rendering correctly.

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

In this first part of this article series we have laid the foundation for more exciting things to come. In the next article of this series **we'll upgrade our content distribution server to dynamically push new versions of components and also content to the client side application.** [Follow me on Twitter](https://twitter.com/MaOberlehner) if you don't want to miss the next article. Stay tuned!

## References

- [Chris Fritz, Hello Vue Components](https://github.com/chrisvfritz/hello-vue-components)
