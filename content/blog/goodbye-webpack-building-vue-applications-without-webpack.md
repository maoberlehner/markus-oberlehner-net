+++
date = "2018-05-13T07:39:00+02:00"
title = "Goodbye webpack: Building Vue.js Applications Without webpack"
description = "Learn how to set up a Vue.js project without webpack or any other complicated build tools, including features like code splitting and automatically refreshing the browser during development."
intro = "First of all, let me say this: webpack is great! Developing JavaScript applications would look quite different if it wasn't for webpack. Having said that, oftentimes it feels pretty foreign to me, having to set up a quite complicated build process to build a rather simple JavaScript app..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "code splitting"]
+++

First of all, let me say this: webpack is great! Developing JavaScript applications would look quite different if it wasn't for webpack. Having said that, oftentimes it feels pretty foreign to me, having to set up a quite complicated build process to build a rather simple JavaScript app.

In the good old times, *in which I had an onion tied to my belt which was the style at the time*, creating a JavaScript application was straightforward: create a `.html` file, add a `<script>` tag, write some JavaScript and open the file in the browser.

But is it really necessary to use webpack in order to build modern JavaScript applications? Is it really necessary to use webpack to build Vue.js powered applications? The answer is no, quite the opposite – thanks to native browser support for **JavaScript modules**, it's easier than ever to build powerful JavaScript applications without using any build tools at all.

The goal of today's article is to set up a Vue.js project without relying on a complicated build process and a lot of third party dependencies. at the same time we don't want to do without powerful functionality like code splitting and the development process should be as comfortable as possible.

If you wan't to check out a live example of the code you'll see in this article, [you can take a look at it on Netlify](https://goodbye-webpack-building-vue-applications-without-webpack.netlify.com/) or you can [view the full code on GitHub](https://github.com/maoberlehner/goodbye-webpack-building-vue-applications-without-webpack).

## Setting up a Vue.js application without webpack

We're going to use **ES6 modules** to build our application, which, since May 9th, are supported in all major browsers. If you haven't had the time yet to catch up on this new technology, I recommend you to [read the relevant MDN page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import).

### Setting up a web server

To enhance security, ES6 modules are subject to [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy) which means we have to run a local server in order to being able to run JavaScript applications using this technology. Unfortunately, that means we have to install a npm dependency – but that'll be the only one, I promise.

```bash
npm install --save-dev browser-sync
```

[Browsersync](https://browsersync.io/) not only makes it possible to run a local web server, but also provides the feature of automatically reloading your browser when a change to a file is detected – this is especially convenient during development and a (not quite as sophisticated) replacement for the webpack hot reloading feature.

After installing Browsersync, we can add a new npm script to our `package.json` file with which we can start a local development server.

```json
{
  "scripts": {
    "start": "browser-sync start --server 'src' --files 'src' --single"
  }
}
```

In the `start` script you can see above, we tell Browsersync to start a server serving the contents of and watching for changes to files inside the `src` directory. The `--single` option triggers the Browsersync server to work in SPA mode.

### The basic directory and file structure

So let's get started with building our application. In the code block beneath, you can see the basic directory and file structure of our application.

```bash
.
├── package.json
└── src
    ├── components
    ├── index.html
    └── main.js
```

The `index.html` file is the core of our application so it might be a good idea to start with this file.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>Hello World!</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css" rel="stylesheet">
    <!-- This is a development version of Vue.js! -->
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
    <script src="/main.js" type="module"></script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

Above you can see the very minimal HTML code needed for our application. As you can see, we'll use [Tailwind CSS](https://tailwindcss.com/) as our CSS framework of choice. But the most important part of the application is the JavaScript code. With the first `<script>` tag we're loading a version of Vue.js with some development console outputs enabled (do not use this in production!). The second JavaScript file is the entry point of our application – note the `type="module"` attribute on the script tag, this tells the browser that this is a JavaScript file which is making use of ES6 modules. The `main.js` file doesn't exist yet – so let's create it.

```js
// src/main.js
import App from './components/App.js';

new Vue({
  render: h => h(App),
}).$mount(`#app`);
```

In the code snippet above, you can see that we're using a native ES6 `import` statement to load our core `App` component and use it to create our root instance of `Vue`. Note that we don't need to import `Vue` because we load it directly from a CDN in the `index.html` file.

### The App

If we'd run our application now, we'd be greeted with a JavaScript error because we don't have an `App.js` file yet, let's fix this.

```js
// src/components/App.js
export default {
  name: 'App',
  template: `
    <div class="container mx-auto p-4">
      <h1>Hello World</h1>
    </div>
  `,
};
```

Above you can see a very basic implementation of our core `App` component. We've added the `container`, `mx-auto` and `p-4` [Tailwind CSS utility classes](https://tailwindcss.com/docs/container) for at least some minimal styling of the application.

Now we're ready to run our application and view it in the browser. `npm start` starts a local server and opens your default browser.

<div class="c-content__figure">
  <div class="c-content__broad">
    <img srcset="/images/2018-05-13/basic-application.png 2x" alt="Screenshot of the application opened in Google Chrome">
  </div>
  <p class="c-content__caption" style="margin-top:-2.5em;">
    <small>Our very simple application opened in Google Chrome</small>
  </p>
</div>

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

## Building an example application

So far so good, we're done setting up our basic application structure and, at least in my opinion, it was an awful lot easier than if webpack was involved. But as of now, our application doesn't do anything useful, so let's change that in order to make sure our approach meets real world demands.

### Building a user list component

In this example, we'll build a very simple component to render a list of users. We also want to be able to load more information regarding the user to test the native ES6 dynamic import feature (a.k.a. native code splitting). Keep in mind, though, that ES6 dynamic imports are currently [not supported in every modern browser](https://caniuse.com/#feat=es6-module-dynamic-import). I won't go into much detail explaining the components itself, because the point of this article is to show what we're capable of doing without webpack, not how to build stuff with Vue.js in general.

```js
// src/components/UserList.js
const UserInfo = () => import('./UserInfo.js');

export default {
  name: 'UserList',
  components: {
    UserInfo,
  },
  data() {
    return {
      users: [
        {
          img: 'https://placeimg.com/50/50/people/1',
          name: 'Kentigern Paul',
          department: 'Development',
          info: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam.',
          showInfo: false,
        },
        // ...
      ],
    };
  },
  template: `
    <ul class="list-reset">
      <li v-for="user in users" :key="user.name" class="flex items-start mb-6">
        <img :src="user.img" :alt="user.name" class="rounded-full mr-4">
        <div>
          <h3 class="text-black">{{ user.name }}</h3>
          <p class="text-grey-dark mb-2">{{ user.department }}</p>
          <button
            class="bg-blue hover:bg-blue-dark text-white py-1 px-2 rounded"
            @click="user.showInfo = !user.showInfo"
          >
            {{ !user.showInfo ? 'Learn more' : 'Less' }}
          </button>
          <user-info v-if="user.showInfo" class="mt-2">
            {{ user.info }}
          </user-info>
        </div>
      </li>
    </ul>
  `,
};
```

```js
// src/components/UserInfo.js
export default {
  name: 'UserInfo',
  template: '<p><slot></slot></p>',
};
```

```diff
+import UserList from './UserList.js';
+
 export default {
   name: 'App',
+  components: {
+    UserList,
+  },
   template: `
     <div class="container mx-auto p-4">
-      <h1>Hello World</h1>
+      <h1>Users</h1>
+      <user-list class="mt-6"></user-list>
     </div>
   `,
 };
```

In the first two snippets we've created a `UserList` and a `UserInfo` component. Note that we use a **dynamic import** statement to load the `UserInfo` component. This means the `UserInfo` component is not loaded initially but only after the user clicks on one of the `Learn more` buttons. In the third snippet you can see how to initialize the new `UserList` component inside of our `src/components/App.js` file.

<div class="c-content__figure">
  <div class="c-content__broad">
    <img srcset="/images/2018-05-13/no-userinfo-component.png 2x" alt="Screenshot of browser dev tools showing the UserInfo component is not loaded initially">
  </div>
  <p class="c-content__caption">
    <small>The UserInfo component is not loaded initially</small>
  </p>
</div>

If you take a look at the application in your browser and open the Network tab of the browsers development tools, you can see that the `UserInfo.js` file is **not** loaded on initial page load. Click on one of the `Learn more` buttons an keep an eye on the Network tab to see the `UnserInfo.js` file being loaded dynamically. That's right, "code splitting" basically for free.

<hr class="c-hr">
<div class="c-service-info">
  <h2>Do you like what you're reading?</h2>
  <p class="c-service-info__body">
    <a class="c-anchor" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">Follow me on Twitter for more</a>.
  </p>
</div>
<hr class="c-hr">

## Wrapping it up

Although it is pretty impressive what, thanks to the features of modern browsers, we can achieve with almost any tooling at all, it has to be mentioned, that you most likely can't build a production ready website without relying on a build step in some way. Our little app is lacking minification of the code and browser support is limited to only the latest versions of browsers (provided we replace the dynamic imports with regular imports, with dynamic imports browser support currently is very, very poor).

Vue.js single file components are also greatly missed. We have to rely on global styling or use inline styling directly in the JavaScript templates instead, which is not ideal, to say the least.

Still, I think it's interesting to see, that it is very much possible to build something like a quick prototype or maybe a simple application which is only used internally by people with modern browsers, without having to rely on a complicated and high-maintenance webpack build setup.

If you wan't to check out a live example of the code you've seen in this article, [you can take a look at it on Netlify](https://goodbye-webpack-building-vue-applications-without-webpack.netlify.com/) or you can [view the full code on GitHub](https://github.com/maoberlehner/goodbye-webpack-building-vue-applications-without-webpack).
