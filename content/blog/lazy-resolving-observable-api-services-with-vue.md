+++
date = "2019-12-29T07:14:14+02:00"
title = "Lazy Resolving Observable API Services with Vue.js"
description = "Learn how to build a lazy resolving API service with Vue.js observables. The API service only resolves relations when they are needed."
intro = "Although GraphQL is pretty cool and powerful, I also like the simplicity of good old REST API endpoints. Also, we often can't use GraphQL for everything because there is no GraphQL endpoint available. In this article, we take a closer look at how we can replicate one of the core features of GraphQL, which makes it possible only to load what is absolutely necessary, in a classic REST API-based application..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_rgb:FA2727,f_auto,q_auto,w_1014,h_510/v1542158520/blog/2019-12-29/reference-resolver"]
+++

Although GraphQL is pretty cool and powerful, **I also like the simplicity of good old REST API endpoints.** Also, we often can't use GraphQL for everything because there is no GraphQL endpoint available.

In this article, we take a closer look at how we can replicate one of the core features of GraphQL, which makes it possible only to load **what is absolutely necessary, in a classic REST API-based application.** But we take it one step further and look at the matter from a different angle: **we want to build a solution that allows us to load additional data only when it is *really* needed.** For example, loading comments for an article only after the user has scrolled to the end of the article where they see the comment section.

The demo application we build does precisely that: we initially fetch the article via our lazy API service to get back an object with all of the data we need to render our article. **But the comments for the article will only be resolved when we actually need to show them to the user.**

<div class="c-content__broad">
  <iframe
    data-src="https://codesandbox.io/embed/lazy-api-service-oq9ko?fontsize=14&hidenavigation=1&theme=dark&view=preview"
    style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
    title="Lazy Resolving Observable API Services with Vue.js"
    allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
    sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
  ></iframe>
</div>

## The power of Vue.observable()

`Vue.observable()` gives us a taste of what will be possible when Vue.js 3.0 arrives, and we can use all of the powerful Vue.js reactivity features as standalone functions. I have already written an article about `Vue.observable()` as a solution for a similar use case.

```js
const state = Vue.observable({ count: 0 });

const Demo = {
  render(h) {
    return h('button', {
      on: { click: () => { state.count++ } },
    }, `count is: ${state.count}`),
  },
};
```

Here you see a simple example using `Vue.observable()`. It takes an object and makes it reactive. Internally, Vue.js uses this for the `data` function.

## The Service Factory

The Service Factory is responsible for creating service functions for a specific schema and content type. We use it later to create services to fetch users, posts, and comments from an API.

```js
// src/api/utils/service.js
const BASE_URL = 'https://jsonplaceholder.typicode.com';

function mapSchema({ entity, schema }) {
  const result = {};

  Object.keys(schema).forEach(key => {
    const config = schema[key];
    const resolver = config.resolver || config;
    const value = entity[config.field] || entity[key];

    Object.defineProperty(result, key, {
      // This getter function is only triggered
      // when the value is accessed.
      get() {
        return resolver(value, entity);
      },
    });
  }, {});

  return result;
}

export default function makeService({ schema, type }) {
  return {
    find(id) {
      return fetch(`${BASE_URL}/${type}/${id}`)
        .then(x => x.json())
        .then(entity => mapSchema({ entity, schema }));
    },
    referencedBy({ id, type: refType }) {
      return fetch(`${BASE_URL}/${refType}/${id}/${type}`)
        .then(x => x.json())
        .then(entities =>
          entities.slice(0, 12).map(entity => mapSchema({ entity, schema }))
        );
    },
  };
}
```

In the example above we can see two functions: `mapSchema()` and `makeService()`. The `mapSchema()` function is responsible for creating getters for every property of the schema object. As a result, **the resolver is only called when the value of the property is accessed.** Otherwise, the resolver is never called, and **no unnecessary API request to resolve relations is made.**

In the following chapters, we take a closer look at how to create a resolver function to resolve references for data referenced by the fetched entity.

## Resolvers

Although we keep our resolvers simple, they have one compelling feature, namely that they are lazy. This means that **they are only resolved when our application accesses their value.** The beauty of this is that, unlike GraphQL, we do not have to specify in advance whether we need a specific piece of data or not. If we do not need the data, the resolver is never resolved. If we need it immediately, the resolver is resolved immediately. And if we need the data sometime after the first request to the API (e.g., after the user clicks a button), the resolver is resolved at the exact moment we need the data.

This is possible because our resolvers do their work on the frontend instead of on the backend. But this also has the disadvantage that we have to make multiple requests from the client. Although, depending on the overall architecture of your application, this can also be seen as an advantage because **you can show the most critical data earlier.**

### Reference resolver

Resolving references for a given entity fetched from an API can either be done directly on the server, or **you can do it on-demand on the client.** There are ups and downs to both methods. In GraphQL, references are almost always resolved (on-demand) on the server. In many implementations of REST APIs, you can send a parameter to tell the server if it should resolve references and include them in the response payload or not.

Although, at first glance, the GraphQL way seems in every way superior, using our approach also has some benefits to offer. **Using our lazy resolving approach makes it possible to tell our service which data we need eventually, but only the data which we use immediately is loaded.**

In GraphQL, you either have to fetch all the data you eventually need immediately, or you have to trigger a further request for the additional data manually.

```js
// src/api/resolvers/reference-resolver.js
import Vue from 'vue';

export default function makeReferenceResolver({ service }) {
  const result = Vue.observable({ data: null });
  let resolved = false;

  return function referenceResolver(id) {
    if (resolved) return result;

    resolved = true;
    service.find(id).then(item => {
      result.data = item;
    });

    return result;
  };
}
```

Above, you can see the code for our generic reference resolver. The `makeReferenceResolver()` function takes the service for the type of the reference we want to resolve, and it returns a `Vue.observable()` for the referenced data.

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

### Reverse reference resolver

Usually your references go only in one direction: a comment references an article for example. This means, if you want to show comments beneath an article, you have to make an additional API request to get the articles.

```js
// Pseudo code for manually resolving references.

// First load the article without its comments.
const post = await postService.find({ id: postId });

// When the comments become visible, this function
// is called and the comments are resolved.
function loadCommentsWhenVisible(postId) {
  return commentService.findAll({ postId });
}
```

But using resolvers, we can make this a straightforward experience. We can create a resolver which fetches all the comments for an article automatically. When using this pattern, we don't care if comments reference articles or articles reference users. We can tell the service what we want, and it uses the resolvers to get it for us when we need it.

```js
// src/api/resolvers/reverse-reference-resolver.js
import Vue from 'vue';

export default function makeReverseReferenceResolver({ service, type }) {
  const result = Vue.observable({ data: null, count: 0 });
  let resolved = false;

  return function reverseReferenceResolver(_, { id }) {
    if (resolved) return result;

    resolved = true;
    service.referencedBy({ id, type }).then(items => {
      result.data = items;
      result.count = items.length;
    });

    return result;
  };
}
```

## Demo

In this demo application, you can see the lazy resolvers in action. The reference to the author of the article is resolved immediately because we display the author right at the beginning of the article. The comments at the bottom on the other hand, are only rendered when the user scrolls to the bottom of the page. This means the reference is also only resolved at that time.

<div class="c-content__broad">
  <iframe
    data-src="https://codesandbox.io/embed/lazy-api-service-oq9ko?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue&theme=dark&view=editor"
    style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
    title="Lazy Resolving Observable API Services with Vue.js"
    allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
    sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
  ></iframe>
</div>

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

Although in our example application, we only use resolvers to resolve relationships, we could also create resolvers that, for example, calculate a sum of several values of the entity. Or we could search Wikipedia for an article that matches the title of our fetched entity. Since resolvers are loaded lazily, we can also do expensive things in them.

This is just one of the numerous exciting things we can do with `Vue.observable()`. I am very much looking forward to the possibilities that the new Composition API has to offer.

Compared to a fully-featured GraphQL infrastructure, this pattern brings much less overhead and is overall quite easy to use. Of course, **many** of the features you get with something like `vue-apollo' are missing, but that also can be an advantage if you want to keep things simple.
