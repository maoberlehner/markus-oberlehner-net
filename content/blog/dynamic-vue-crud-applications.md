+++
date = "2019-10-13T06:37:37+02:00"
title = "Dynamic Vue.js CRUD Applications"
description = "Learn how to build dynamic CRUD applications with Vue.js with the primary goal of keeping the codebase DRY."
intro = "Often it seems like we build the same applications again and again. And at least sometimes it feels like that because indeed we do. Again and again, we build the same CRUD applications with their generic list views, edit forms, and previews. Throughout this article, we examine how to create a generic and reusable structure for a traditional CRUD application. Our primary goal is to keep our codebase DRY..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Vuex"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_rgb:b03788,f_auto,q_auto,w_1014,h_510/v1542158520/blog/2019-10-13/dynamic-routes"]
+++

Often it seems like we build the same applications again and again. And at least sometimes it feels like that because indeed we do. Again and again, we build the same CRUD applications with their generic list views, edit forms, and previews.

When I wrote my article about [keeping the Vuex Store generic](https://markus.oberlehner.net/blog/generic-content-vuex-modules/), I started thinking about how to generalize other parts of Vue.js applications as well.

Throughout this article, **we examine how to create a generic and reusable structure for a traditional CRUD application.** Our primary goal is to keep our codebase DRY.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/dynamic-vuejs-crud-application-structure-9nnmj?fontsize=14" title="Dynamic Vue.js CRUD Applications" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

**We achieve this by dynamically registering Vuex modules and Vue Router routes.** This makes it possible to create applications programmatically from a JSON configuration file. Theoretically, **you could fetch the entire application structure and configuration from an API.**

Since it would be a huge undertaking to build a fully functional application, our goal in this article is to create a basic prototype that meets our core requirements and is easily extensible to work in the real world. If you want to see how to build a full-blown app using this and also alternative approaches, you can [sign up for the newsletter of my upcoming book, which goes into much more detail](https://oberlehner.us20.list-manage.com/subscribe?u=8476a98c5640f6c7b5530ea57&id=8b26bf120b).

## The configuration format

Before we dive into the code, let's have a look at how we imagine the configuration file to be structured.

```json
{
  "name": "Dynamic CRUD Application",
  "contentTypes": [
    {
      "name": "post",
      "label": "Posts",
      "endpoint": "https://mydomain.api.com/users",
      "fields": [
        {
          "name": "title",
          "label": "Title",
          "type": "text"
        },
        {
          "name": "body",
          "label": "Body",
          "type": "textarea"
        }
      ]
    }
  ]
}
```

As you can see above, we can give our application a name, and we can specify `contentTypes`. A content type must have a `name`, a human-readable `label`, and an `endpoint` to fetch its data. In the `fields` section, we can specify which fields should be available in the forms for creating or updating posts.

If you decide to use this approach in a real-world application, you most like would add further configuration options.

## Dynamic Vuex modules

We plan to build a large scale system, so we decide to use Vuex to handle the state of our application. But keep in mind that Vuex also has its downsides. You can [read more about possible alternatives and when to use Vuex in my article about this topic](https://markus.oberlehner.net/blog/should-i-store-this-data-in-vuex/).

I already wrote about the topic of [building generic Vuex modules in one of my previous articles](https://markus.oberlehner.net/blog/generic-content-vuex-modules/). If you want to learn more about the general approach for creating reusable Vuex modules, I recommend you to [read the previous article](https://markus.oberlehner.net/blog/generic-content-vuex-modules/).

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/dynamic-vuejs-crud-applications-9nnmj?fontsize=14&module=%2Fsrc%2Fstore%2Fcrud.js&view=editor" title="Dynamic Vue.js CRUD Applications" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

## Dynamic routes

**We want to be able to dynamically add new content types, which all come with a list view and edit form pages.** To make this work, we have to dynamically add new routes for all of the pages of the content types we have.

```js
// src/router/index.js
import Vue from 'vue';
import VueRouter from 'vue-router';

import Welcome from '../components/Welcome.vue';

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    {
      path: '/',
      component: Welcome,
    },
    // Other static routes.
    // ...
  ],
});
```

In our main router file, we only register static routes like the route for our homepage. All the other routes for our dynamic content types are later generated automatically. But let's take a look at how we can build a little helper function to quickly generate the routes for a content type.

```js
// src/router/crud.js
export default function makeCrudRoutes({
  contentType,
  components: { FormContainer, ListingContainer }
}) {
  return [
    {
      path: `/${contentType.name}/list`,
      component: ListingContainer,
      props: {
        contentType,
      },
    },
    {
      path: `/${contentType.name}/:id/edit`,
      component: FormContainer,
      props: route => ({ contentType, id: route.params.id }),
    },
  ];
}
```

The `makeCrudRoutes()` helper function takes the `contentType` specification and all the necessary components as parameters and returns an array of routes for a dynamic content type.

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

## Initializing the dynamic app

Now that we've set up our basic application structure, we can start wiring it up.

```js
// src/main.js
import Vue from 'vue';

import config from './config';
import makeCrudModule from './store/crud';
import makeCrudRoutes from './router/crud';
import makeService from './services/api';
import router from './router';
import store from './store';

import App from './App.vue';
import FormContainer from './components/FormContainer.vue';
import ListingContainer from './components/ListingContainer.vue';

Vue.config.productionTip = false;

config.contentTypes.forEach((contentType) => {
  // Register dynamically generated store modules.
  store.registerModule(
    contentType.name,
    makeCrudModule({
      service: makeService(contentType.endpoint),
    }),
  );

  // Register dynamically generated routes.
  router.addRoutes(
    makeCrudRoutes({
      components: {
        FormContainer,
        ListingContainer,
      },
      contentType,
    }),
  );
});

new Vue({
  render: h => h(App),
  router,
  store,
}).$mount('#app');
```

Here you can see that we load our `config.json` configuration file and iterate over all its `contentTypes` to dynamically generate the necessary store modules and routes.

In this case, we load a static JSON file for our config. However, we can also decide to fetch it from a remote API endpoint. That way, we could use this approach to create a drag and drop Vue.js app builder where people can add new content types via a UI, for example.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/dynamic-vuejs-crud-application-structure-9nnmj?fontsize=14" title="Dynamic Vue.js CRUD Applications" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
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

As I wrote at the beginning, this article only scratches the surface. It is intended to serve as a proof of concept to build upon. You can [sign up for the newsletter of my upcoming book, where we go into it in much more detail](https://oberlehner.us20.list-manage.com/subscribe?u=8476a98c5640f6c7b5530ea57&id=8b26bf120b).

Apart from the basic functionality like form handling and all the other CRUD actions, this implementation also lacks advanced features like i18n and in general, isn't open for extension. But I think it can serve as a solid starting point.
