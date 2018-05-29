+++
date = "2018-04-03T12:30:00+02:00"
title = "Setting up a Vue.js Project with webpack 4 and Babel 7"
description = "Learn how to set up a Vue.js project with webpack 4 and Babel 7 which enables code splitting for JavaScript and CSS."
intro = "For my previous article about three different ways of how to structure a Vue.js application, I wanted to set up a build system which not only allows for regular JavaScript code splitting, but also CSS code splitting. Thanks to webpack 4 and the mini-css-extract-plugin (which basically is the successor of the extract-text-webpack-plugin), CSS code splitting is finally possible..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "webpack", "code splitting", "Babel"]
+++

For my previous article about [three different ways of how to structure a Vue.js application](https://markus.oberlehner.net/blog/vue-application-structure-and-css-architecture/), I wanted to set up a build system which not only allows for regular **JavaScript code splitting, but also CSS code splitting**. Thanks to webpack 4 and the [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin) (which basically is the successor of the [extract-text-webpack-plugin](https://github.com/webpack-contrib/extract-text-webpack-plugin)), **CSS code splitting is finally possible**.

I quickly realized tough, that there is currently no official way of how to setup a webpack 4 powered Vue.js development environment. Both the current [Vue.js webpack template](https://github.com/vuejs-templates/webpack) and the [vue-cli](https://github.com/vuejs/vue-cli) (which is currently in beta), are still using webpack 3. So I decided to set up a webpack 4 powered build process myself.

This tutorial focuses exclusively on how to configure webpack, you can see [the application code on GitHub](https://github.com/maoberlehner/setting-up-a-vue-project-with-webpack-4-and-babel-7) and you can checkout a [live demo on Netlify](https://setting-up-a-vue-project-with-webpack-4-and-babel-7.netlify.com/).

## Configuring webpack 4 for Vue.js

In this article, we'll focus on the **bare minimum build setup we need to build a very basic Vue.js application**. If you're planning to set up the build process for a large scale application, you should consider using the new [vue-cli](https://github.com/vuejs/vue-cli) instead of rolling your own. That said, I think it is very useful to know how stuff works, so let's start to explore how to build our own basic webpack configuration for bundling a Vue.js application.

### Basic configuration

First of all, we have to install some (a lot of) dependencies which we'll need for our basic configuration.

```bash
npm install --save-dev @babel/core @babel/plugin-syntax-dynamic-import @babel/preset-env babel-loader@^8.0.0-beta cross-env css-loader html-webpack-plugin node-sass sass-loader vue-loader@^15.0.0-beta webpack webpack-cli
```

Let me explain why we need some of the most important packages in this long list of dependencies. `@babel/core` and `@babel/preset-env` are needed for transpiling ES6 code into code which is also understood by older browsers. The `@babel/plugin-syntax-dynamic-import` package is needed for dynamic imports (which are used for code splitting) to work. We'll use the `cross-env` package, to define environment variables in a way all operating systems can handle.

We're requiring the 8.x beta build of `babel-loader` because the current stable 7.x version, does not work with Babel 7. The 15.x beta build of the `vue-loader` package is mainly used because it is a vast improvement over older versions.

```js
// webpack.config.js
const { VueLoaderPlugin } = require('vue-loader');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const env = process.env.NODE_ENV;

const config = {
  entry: path.join(__dirname, 'src', 'main.js'),
  mode: env,
  output: {
    publicPath: '/',
  },
  optimization: {
    splitChunks: {
      // Must be specified for HtmlWebpackPlugin to work correctly.
      // See: https://github.com/jantimon/html-webpack-plugin/issues/882
      chunks: 'all',
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [path.join(__dirname, 'src')],
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      filename: path.join(__dirname, 'dist', 'index.html'),
      template: path.join(__dirname, 'static', 'index.html'),
      inject: true,
    }),
  ],
};

module.exports = config;
```

What you can see above, is the most basic configuration possible to enable webpack 4 to process `.vue` files and compile Sass into regular CSS. You might notice, that I skipped configuring a regular CSS loader, if you want to also process regular CSS, take a look at [the official vue-loader documentation for an example of how to configure the css-loader](https://github.com/vuejs/vue-loader/tree/v15.0.0-beta.7).

#### Babel 7

Before we can build our application, we still have to configure Babel. Let's create a `.babelrc` file in the root directory of our project.

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "modules": false
      }
    ]
  ],
  "plugins": [
    "@babel/plugin-syntax-dynamic-import"
  ]
}
```

The reason why the `modules` option of the `@babel/preset-env` configuration is set to `false` is because we want webpack to handle module bundling for us.

#### Bonus: node-sass-magic-importer

Thanks to the latest beta version of `vue-loader`, it is finally possible to use [custom node-sass importers](https://github.com/sass/node-sass#importer--v200---experimental) with Vue.js.

This makes it possible to use the [node-sass-magic-importer](https://github.com/maoberlehner/node-sass-magic-importer/tree/master/packages/node-sass-magic-importer) to do fancy things with Sass like [selector-filtering](https://github.com/maoberlehner/node-sass-magic-importer/tree/master/packages/node-sass-magic-importer#selector-filtering) which means importing only specific CSS selectors, [glob imports](https://github.com/maoberlehner/node-sass-magic-importer/tree/master/packages/node-sass-magic-importer#globbing) to enable glob patterns like `**/*.scss` to import multiple `.scss` files at once or [node-filtering](https://github.com/maoberlehner/node-sass-magic-importer/tree/master/packages/node-sass-magic-importer#node-filtering) which makes it possible to only import variables and mixins for example.

<hr class="c-hr">
<div class="c-service-info">
  <h2>Sounds interesting?</h2>
  <p class="c-service-info__body">
    <a class="c-anchor" rel="nofollow" href="https://github.com/maoberlehner/node-sass-magic-importer" data-event-category="link" data-event-action="click: project" data-event-label="node-sass-magic-importer (article content)">Find node-sass-magic-importer on GitHub</a>.
  </p>
</div>
<hr class="c-hr">

```bash
npm install --save-dev node-sass-magic-importer
```

After installing the dependency, we can add the custom importer to the webpack configuration.

```js
// webpack.config.js
// ...
const nodeSassMagicImporter = require('node-sass-magic-importer');

// ...

const config = {
  // ...
  module: {
    rules: [
      // ...
      {
        test: /\.scss$/,
        use: [
          // ...
          {
            loader: 'sass-loader',
            options: {
              importer: nodeSassMagicImporter(),
            },
          },
        ],
      },
    ],
  },
};
```

#### Running the build script

Now we're ready to build our application with webpack. Let's add a new npm script for starting our build process.

```bash
{
  "scripts": {
    "build": "cross-env NODE_ENV=production webpack"
  }
}
```

We can start the build process by running `npm run build`, which creates a bundled version of our application ready to be served from the `dist/`  directory.

### webpack development server with hot reloading

In order to being able to comfortable work on our application, we don't want to run the build process manually every time we make a small change to the code. Instead **we want webpack to watch our code and start the build process automatically after every change**. Also we want our browser to **display those changes immediately without reloading the application**. We can achieve this with the `webpack-serve` package and hot reloading.

```bash
npm install --save-dev webpack-serve opn
```

First we have to install the dependencies we'll need, next we can create a little development server script.

```js
// bin/dev-server.js
#!/usr/bin/env node
const serve = require('webpack-serve');

const openBrowser = require('./lib/open-browser');
const config = require('../webpack.config');

serve({ config, clipboard: false }).then((server) => {
  server.on('listening', () => {
    openBrowser(`http://${server.options.host}:${server.options.port}`);
  });
});
```

The script above starts a development server powered by the `webpack-serve` package. After the server was started, **your browser should automatically be opened and load the application**, thanks to the `openBrowser()` function we'll implement in the next step.

```js
// bin/lib/open-browser.js
const { execSync } = require('child_process');
const opn = require('opn');

module.exports = function openBrowser(url) {
  // If we're on OS X, we can try opening
  // Chrome with AppleScript. This lets us reuse an
  // existing tab when possible instead of creating a new one.
  // See: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-shared-utils/lib/openBrowser.js
  const browser = process.env.BROWSER;
  const shouldTryOpenChromeWithAppleScript =
    process.platform === 'darwin' &&
    (typeof browser !== 'string' || browser === 'google chrome');

  if (shouldTryOpenChromeWithAppleScript) {
    try {
      execSync('ps cax | grep "Google Chrome"');
      execSync(`osascript open-chrome.applescript "${encodeURI(url)}"`, {
        cwd: __dirname,
        stdio: 'ignore',
      });

      return true;
    } catch (error) {
      // Ignore errors.
    }
  }

  try {
    opn(url).catch(() => {}); // Prevent `unhandledRejection` error.

    return true;
  } catch (error) {
    return false;
  }
};
```

The code for the `openBrowser()` function you can see above, is stolen from the [vue-cli](https://github.com/maoberlehner/setting-up-a-vue-project-with-webpack-4-and-babel-7/blob/master/bin/lib/open-chrome.applescript) project. Additionally to the code above, you also need a `.applescript` file which was originally created by Facebook, you can find [the file in the GitHub repository accompanying this article](https://github.com/maoberlehner/setting-up-a-vue-project-with-webpack-4-and-babel-7/blob/master/bin/lib/open-chrome.applescript). What it does is, that (if you're running macOS and using Google Chrome as your default browser) it tries to reuse an existing tab (which is already running our application) every time the development server is started.

```json
{
  "scripts": {
    "start": "npm run serve:dev",
    "serve:dev": "cross-env NODE_ENV=development node bin/dev-server.js"
  }
}
```

By adding a new `serve:dev` script, and also adding a `start` script as an alias of the first, we're now able to run our application in development mode with hot reloading enabled by executing `npm start`.

### Source maps

To enhance the development experience even further, we can enable source maps, which give us the benefit of the browser showing us the correct file names and line numbers in case we're debugging JavaScript or CSS code.

```js
// webpack.config.js
// ...

const env = process.env.NODE_ENV;
const sourceMap = env === 'development';

const config = {
  // ...
  devtool: sourceMap ? 'cheap-module-eval-source-map' : undefined,
  module: {
    rules: [
      // ...
      {
        test: /\.scss$/,
        use: [
          // ...
          {
            loader: 'css-loader',
            options: {
              sourceMap,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              // ...
              sourceMap,
            },
          },
        ],
      },
    ],
  },
  // ...
};
```

### Extract CSS

Although we're now already able to build our application, and thanks to webpack 4 which automatically minifies JavaScript code in production mode, the built code is already kinda production ready. But for now, **all the CSS code is bundled alongside the JavaScript code**. This makes it impossible to cache the CSS code separately from the JavaScript code – if either the CSS or the JavaScript code changes, both have to be downloaded again by the client. Additionally, **the browser has more work to do if the CSS code has to be processed inside the JavaScript code**.

For those two reasons, **we want to extract the CSS code from the JavaScript bundles** and serve regular `.css` files to the client instead.

```bash
npm install --save-dev mini-css-extract-plugin
```

The `mini-css-extract-plugin` makes it possible to extract CSS code from JavaScript bundles.

```js
// webpack.config.js
// ...
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

//...

if (env !== 'development') {
  config.plugins.push(new MiniCssExtractPlugin());

  const sassLoader = config.module.rules.find(({ test }) => test.test('.scss'));
  // Replace the `vue-style-loader` with
  // the MiniCssExtractPlugin loader.
  sassLoader.use[0] = MiniCssExtractPlugin.loader;
}

module.exports = config;
```

To make the `mini-css-extract-plugin` do its work, we have to update our `webpack.config.js` file. If webpack is started in production mode, we add a new instance of the `MiniCssExtractPlugin()` to the list of plugins. Also we're replacing the `vue-style-loader` in the `sass-loader` configuration (the `vue-style-loader` is on position `0` of the `use` array) with the `MiniCssExtractPlugin.loader`.

If we build our application again, we can see, that **the CSS code is now extracted and split into multiple separate CSS files**. Similar to the JavaScript code splitting feature, the `mini-css-extract-plugin` is able to split CSS code so only code necessary for rendering the current chunk is loaded.

### Minification

You might notice that although the JavaScript code is perfectly minified, thats not true for the extracted CSS code. To fix that, we have to configure minification manually.

```bash
npm install --save-dev optimize-css-assets-webpack-plugin uglifyjs-webpack-plugin
```

After installing the necessary plugins, we can update our `webpack.config.js` file.

```js
// webpack.config.js
// ...
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const env = process.env.NODE_ENV;
// ...
const minify = env === 'production';

const config = {
  // ...
  plugins: [
    // ...
    new HtmlWebpackPlugin({
      // ...
      minify: minify ? {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        // More options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      } : false,
    }),
  ],
};

if (minify) {
  config.optimization.minimizer = [
    new OptimizeCSSAssetsPlugin(),
    // Enabled by default in production mode if
    // the `minimizer` option isn't overridden.
    new UglifyJsPlugin({
      cache: true,
      parallel: true,
    }),
  ];
}

// ...
```

<hr class="c-hr">
<div class="c-service-info">
  <h2>Do you have any questions?</h2>
  <p class="c-service-info__body">
    <a class="c-anchor" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">You can find me on Twitter</a>.
  </p>
</div>
<hr class="c-hr">

### Serve the production build

Finally our production build satisfies all our basic needs. We have code splitting enabled (for both JavaScript *and* CSS) and everything is minified nicely. Now let's write a simple SPA server script to serve the production build of our application.

```bash
npm install --save-dev express
```

The only dependency we need, is the `express` server package.

```js
// bin/spa-server.js
#!/usr/bin/env node
const express = require('express');
const path = require('path');

const openBrowser = require('./lib/open-browser');

const app = express();
const publicPath = path.join(process.cwd(), 'dist');
const port = 5000;

app.use('/', express.static(publicPath, { index: false }));
app.get('/*', (request, response) => {
  response.sendFile(`${publicPath}/index.html`);
});

app.listen(port);

// eslint-disable-next-line no-console
console.log('Server started!');
// eslint-disable-next-line no-console
console.log(`http://localhost:${port}`);

openBrowser(`http://localhost:${port}`);
```

The code above, starts a very basic express server which either returns a static file (if one is requested) or the `index.html` inside of our `dist/` directory for every other request.

```json
{
  "scripts": {
    "serve:production": "cross-env NODE_ENV=production node bin/spa-server.js"
  }
}
```

After adding a new npm script for starting our SPA server, we can run `npm run serve:production` to serve our application.

## Wrapping it up

Although I'd not recommend to roll your own build setup for large scale applications (use [vue-cli](https://github.com/vuejs/vue-cli) instead), **I think it is important to know at least the basics of how to configure webpack**.

Also, it can be very useful to set up your own build process for small scale or experimental applications and although doing so is still not as straight forward as I'd wish, webpack 4 is a huge step forward in that regards.
