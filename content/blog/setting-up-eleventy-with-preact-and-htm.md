+++
date = "2020-03-15T08:09:09+02:00"
title = "Setting up Eleventy with Preact and htm"
description = "Learn how to use Eleventy in combination with Preact to build super fast websites with a modern component-based workflow."
intro = "One of my top priorities is to create the fastest possible websites (think marketing sites, not web applications), but I also don't want to do without modern tools and a component-based workflow. While there are developments in the right direction, I don't think tools like Gatsby and Nuxt.js are quite there yet when it comes to building content heavy, mostly static sites..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Preact", "Eleventy", "Front-End Architecture"]
images = ["/images/c_pad,b_rgb:EE3A97,f_auto,q_auto,w_1014,h_510/v1542158520/blog/2020-03-15/eleventy-preact"]
+++

One of my top priorities is to create **the fastest possible websites** (think marketing sites, not web applications), but I also don't want to do without **modern tools and a component-based workflow.** I have already written [a few articles about the problems I've encountered](https://markus.oberlehner.net/blog/how-to-drastically-reduce-estimated-input-latency-and-time-to-interactive-of-ssr-vue-applications/) when using state-of-the-art tools that promise to achieve this. While there are developments in the right direction, I don't think tools like Gatsby and Nuxt.js are quite there yet when it comes to building content heavy, mostly static sites.

Lately, I have been playing around with [Preact](https://preactjs.com/) and the excellent static website generator [Eleventy](https://www.11ty.dev/). I found out that it is straightforward to bring these two together. And as we'll see in my next article, **we can use the combination of these two technologies to create progressively enhanced static websites with a universal/isomorphic code base.**

In this article, we explore how to **set up Eleventy so that we can use Preact in combination with htm as its templating layer.**

## Demo and full code

You can take a [look at a demo of the website on Netlify](https://setting-up-eleventy-with-preact.netlify.com/), and you can [check out the GitHub repository](https://github.com/maoberlehner/eleventy-preact/tree/setting-up-eleventy-with-preact-and-htm) to see the full code.

## Configuring Eleventy for Preact

In this article, I assume that you already have Eleventy up and running, and we only look at what is specific to setting up Preact to work with Eleventy. In my setup, I use the following Eleventy configuration.

```js
// You don't have to use the same configuration
// but be aware that I have overwritten the
// default `input` and `output` directories when
// following the rest of this article.
module.exports = function eleventy() {
  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
};
```

First, let's start by installing all the necessary dependencies to build components with Preact.

```bash
npm install preact preact-render-to-string htm
```

Now we're ready to integrate Preact components into our Eleventy setup.

## Rendering Preact components with Eleventy

Let's start by creating a basic layout file for our website. For this, we create a new file `src/_includes/layout.njk`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>{{ title }}</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" href="/index.css">
  </head>
  <body>
    {{ content | safe }}
  </body>
</html>
```

This is the only place where we do not use Preact components to render the HTML of our website. We create a separate Preact layout component for the basic HTML structure like header, navigation, and footer in the next step. The `content` variable holds the rendered HTML of our Preact entry component, so we have to use the `safe` filter to make sure it outputs the HTML instead of a string with the escaped HTML.

### The Preact layout component

Next, you can see our Preact layout component generating the necessary HTML skeleton for our website.

```js
// src/components/LayoutDefault.js
const { html } = require('htm/preact');

const BaseWrapper = require('./BaseWrapper');

module.exports = ({ children }) => html`
  <div class="LayoutDefault">
    <main>
      ${children}
    </main>
    <footer class="LayoutDefault__footer">
      <${BaseWrapper}>
        © Markus Oberlehner
      <//>
    </footer>
  </div>
`;

```

You might wonder about the syntax inside of the `html` tagged template string. This is not a pseudo-language that requires a build step like JSX; what you can see here is [htm](https://github.com/developit/htm). **Thanks to htm, we don't need an extra build step** but are still able to use JSX*ish* syntax for our components.

### The Preact entry component

Here, you can see the code for the entry component of our server-side pre-rendered website. We dynamically generate a page by rendering section components based on which data we receive from Eleventy. You can [take a look at the data](https://github.com/maoberlehner/eleventy-preact/blob/setting-up-eleventy-with-preact-and-htm/src/_data/pages.js) used to render [the demo application](https://setting-up-eleventy-with-preact.netlify.com/) directly [on GitHub](https://github.com/maoberlehner/eleventy-preact/blob/setting-up-eleventy-with-preact-and-htm/src/_data/pages.js).

```js
// src/components/App.js
const { html } = require('htm/preact');

const LayoutDefault = require('./LayoutDefault');

const sections = {
  content: require('./SectionContent'),
  hero: require('./SectionHero'),
  teaser: require('./SectionTeaser'),
};

module.exports = ({ page }) => html`
  <${LayoutDefault}>
    <div class="App">
      ${page.sections.map(({ data, name }) => html`
        <${sections[name]} data=${data}/>
      `)}
    </div>
  <//>
`;
```

One thing you have to keep in mind is that although we are using Preact to build our website, Eleventy still is a **static** site generator. **So by using Preact as a server-side templating language, you can't build anything interactive like buttons that react to click events, for example.** The code only runs once on the server, and the generated HTML output is rendered in the browser. **No JavaScript is loaded or executed on the client!** At least for now. **If you want to use certain interactive elements like image carousels or contact forms on your website, you can [read about it in my next article](/blog/building-partially-hydrated-progressively-enhanced-static-websites-with-isomorphic-preact-and-eleventy).**

### Rendering content

Now our Preact components are ready to be rendered, but currently, we do not use them anywhere. Let's change this by creating a new file `src/page.11ty.js`.

```js
// src/page.11ty.js
const { html } = require('htm/preact');
const render = require('preact-render-to-string');

const App = require('./components/App');

module.exports = class Page {
  data() {
    return {
      title: 'Setting up Eleventy with Preact and htm',
      layout: 'layout.njk',
      pagination: {
        data: 'pages',
        size: 1,
        alias: 'page',
        addAllPagesToCollections: true,
      },
      permalink: ({ page }) => `/${page.slug}/index.html`,
    };
  }

  render(data) {
    return render(html`<${App} page=${data.page}/>`);
  }
};
```

Here is where we link Eleventy and Preact. The `render()` method provided by the `preact-render-to-string` package renders our Preact component and outputs an HTML string, which is then used by Eleventy to render the final `.html` file which is later served by the browser.

The [data which is used to render the page above](https://github.com/maoberlehner/eleventy-preact/blob/setting-up-eleventy-with-preact-and-htm/src/_data/pages.js) comes from `src/_data/pages.js`.

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

What I love about this approach is that **every code snippet you can see in this article is *just* JavaScript.** We don't have to use and maintain a complicated webpack set up to run this code. We don't have to configure our linter and code editor to work with some pseudo-language like JSX or Vue.js Single File Components.

Because of that, I think Eleventy, Preact, and htm are a perfect match. Eleventy, too, is known and loved for its simplicity, which makes it a joy to use those two in conjunction. If you want to read more about how to make this combination even more powerful you can read [my follow up article about how to do partial hydration with Eleventy and Preact](/blog/building-partially-hydrated-progressively-enhanced-static-websites-with-isomorphic-preact-and-eleventy).
