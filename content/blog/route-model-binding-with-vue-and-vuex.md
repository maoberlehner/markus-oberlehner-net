+++
date = "2018-03-25T07:07:10+02:00"
title = "Route Model Binding with Vue.js and Vuex"
description = "Learn how to implement Route Model Binding and how to use models in Vue.js in combination with vue-router and Vuex."
intro = "I'm currently in the process of refreshing my knowledge about Laravel. I do so by reading the official documentation. Although, I almost exclusively work on the front side of things with Vue.js nowadays, there is a lot to be learned by getting to know techniques outside of your comfort zone..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Vuex"]
+++

I'm currently in the process of refreshing my knowledge about Laravel. I do so by reading the [official documentation](https://laravel.com/docs). Although, I almost exclusively work on the front side of things with Vue.js nowadays, there is a lot to be learned by getting to know techniques outside of your comfort zone. Laravel is doing some pretty great things to make the life of developers easier. One of those featuers is [Route Model Binding](https://laravel.com/docs/routing#route-model-binding).

## Route Model Binding in Laravel

This technique makes it possible to achieve a lot with very little code.

```php
Route::get('user/{user}', function (App\User $user) {
  return view('user', compact('user'));
});
```

In this example, a `User` model instance is automatically resolved by the given `ID` provided in the URL and the data is directly passed into a `view` render function. A lot of functionality for three lines of code.

## Route Model Binding in Vue.js

Unfortunately, there is no such functionality in Vue.js out of the box. But luckily we're programmers, and we can write some code to get similar functionality in combination with Vue.js and `vue-router`. In the following examples, I assume that you have advanced knowledge about Vue.js and I'll only show the code which is necessary for this special technique to work. If you want to have a look at the full code, you can [go to the GitHub repository accompanying this article](https://github.com/maoberlehner/route-model-binding-with-vue-and-vuex).

### The store module

In our example implementation, we want to fetch users by ID from an API, we want to use Vuex to manage the state of our application and we want to build our store with namespaced modules.

```js
// src/store/user.js
import axios from 'axios';

export default {
  namespaced: true,
  actions: {
    async byId({ commit }, id) {
      const { data: user } = await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`);

      commit('set', user);
    },
  },
  mutations: {
    clear(state) {
      state.id = null;
      state.email = '';
      state.username = '';
    },
    set(state, user) {
      state.id = user.id;
      state.email = user.email;
      state.username = user.username;
    },
  },
  state: {
    id: null,
    email: '',
    username: '',
  },
};
```

In the example above, you can see an action with the name `byId()` which we can use to fetch user data from an API. The `clear()` and `set()` mutations are responsible for mutating the state to either clear it or fill it with new data.

Now that we've created our new user store module, we have to load it when initializing our global Vuex store.

```js
// src/store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

import user from './user';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    user,
  },
});
```

### The Base model

We want to build our system to be flexible and reusable, therefore let's start with a `Base` model class, which we can later use to extend our data models with it.

```js
// src/models/Base.js
import store from '../store';

export default class Base {
  constructor() {
    this.fetching = false;
    this.idIsInt = true;
    this.idKey = 'id';
    this.name = this.constructor.name.toLowerCase();
    this.store = store;
  }

  find(rawId) {
    const state = this.store.state[this.name];
    const id = this.idIsInt ? parseInt(rawId, 10) : rawId;

    // If the model is currently fetching data
    // we escape the function early and return
    // the current `state`.
    if (this.fetching) return state;

    // If the currently loaded record matches
    // the given ID, we can skip fetching data
    // and immediately return the `state`.
    if (state[this.idKey] !== id) {
      this.fetching = true;

      // To make sure to not display old data
      // the `state` of the store module is cleared
      // before filling it with new data.
      store.commit(`${this.name}/clear`);
      store.dispatch(`${this.name}/byId`, id).then(() => {
        this.fetching = false;
      });
    }

    return state;
  }
}
```

Let's take a look at the code above: in the constructor of our `Base` model class, we have the default configuration for our models. We can define if the ID which is passed to our model, will be an integer (`idIsInt`) and which key in the state holds the ID (`idKey`). The `name` of the model, is automatically generated from the `constructor.name` (basically the class name) of the model.

### The User model

With the `Base` model we've created in the previous step, we're now ready to define our `User` model.

```js
// src/models/User.js
import Base from './Base';

export class User extends Base {}

export function userModelFactory() {
  return new User();
}
```

Because all of our logic is already defined in the `Base` model, our `User` model is very tidy and doesn't has to implement any logic itself.

We're using a factory function to create a new instance of the `User` model. It is generally a good practice to use factory functions if you're using classes ([JavaScript Factory Functions vs Constructor Functions vs Classes - by Eric Elliott](https://medium.com/javascript-scene/javascript-factory-functions-vs-constructor-functions-vs-classes-2f22ceddf33e)).

### The User component

In our example, we want to display the name and the email address of a user on a page. Let's create the component (`src/views/User.vue`) which we'll use to render that page.

```html
<template>
  <div class="User">
    <p>Username: {{ user.username }}</p>
    <p>Email: {{ user.email }}</p>
  </div>
</template>

<script>
export default {
  name: 'User',
  props: {
    user: {
      type: Object,
    },
  },
};
</script>
```

### Binding the User model to a route

Now that we've laid the foundation, we can start to put everything together and bind our `User` model to a new route to render user data in the `User.vue` component.

```js
// src/utils/bind-model.js
export default function bindModel(model) {
  return route => ({ [model.name]: model.find(route.params[model.name]) });
}
```

The `bindModel()` utility function you can see above, takes a model instance and calls its `find()` method with the value of the route parameter matching the value of the models name property. It returns an object with a key which matches the models name.

```js
// src/router.js
import Vue from 'vue';
import Router from 'vue-router';

import User from './views/User.vue';
import { userModelFactory } from './models/User';
import bindModel from './utils/bind-model';

const userModel = userModelFactory();

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/user/:user',
      name: 'user',
      component: User,
      props: bindModel(userModel),
    },
  ],
});
```

Now here is where everything comes together. In the route named `user` you can see that we pass the object returned by the `bindModel()` function, to the `props` of the `User` component. This makes it possible to access the `user` object in the `User.vue` component.

That's it. Thanks to the generic `Base` model and the `bindModel()` helper function, you can now create new models and store modules without too much effort and without writing a lot of (reapeating) code. And you also don't have to write the logic for retrieving the data from the store in your components again and again.

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

## Bonus: Field mapping with vuex-map-fields

We've already achieved our main goal of having a more convenient and abstracted way of automatically loading data by binding a model to a route. As a little bonus, let's build an additional page where the user can input their data.

### Adding vuex-map-fields

[vuex-map-fields](https://github.com/maoberlehner/vuex-map-fields) makes it possible to use two-way data binding (with `v-model`) for form fields saved in a Vuex store. In order to being able to use it, we have to update our user store module and the `Base` model.

```js
// src/store/user.js
// ...
import { getField, updateField } from 'vuex-map-fields';

export default {
  // ...
  getters: {
    getField,
  },
  mutations: {
    // ...
    updateField,
  },
  // ...
};
```

In the user store module, we add the `vuex-map-fields` `getField()` and `updateField()` helper functions which enable retrieving and setting data without mutating the state directly.

```js
// src/models/Base.js
import { createHelpers } from 'vuex-map-fields';

import store from '../store';

export default class Base {
  // ...

  mapFields(fields) {
    const { mapFields } = createHelpers({
      getterType: `${this.name}/getField`,
      mutationType: `${this.name}/updateField`,
    });

    return mapFields(fields || Object.keys(this.store.state[this.name]));
  }
}
```

In the `Base` model, we add a new `mapFields()` method which (optionally) takes an array (or object) of fields to be mapped via the `mapFields()` function provided by `vuex-map-fields`. By default, all of the fields in the store are mapped by their name.

### The user create page component

Now we need the view component which we'll use to render the form fields which the user can use to input their data.

```html
<template>
  <form class="UserForm">
    <div>
      <label>
        Username
        <input v-model="username">
      </label>
    </div>
    <div>
      <label>
        Email
        <input v-model="email">
      </label>
    </div>
  </form>
</template>

<script>
import { userModelFactory } from '../models/User';

const user = userModelFactory();

export default {
  name: 'User',
  computed: {
    ...user.mapFields(),
  },
};
</script>
```

By using the spread operator (`...`) we can use the `mapFields()` method on the `user` model, to map all fields of the user store module to our component. By using `v-model` on the input fields, we create a two-way data binding which updates the state via the `updateField()` mutation function which is provided by `vuex-map-fields`.

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

It can be very inspiring to work with technologies other than those which you're using day in and day out. Even if you're not going to use them in your projects, there might be lessons to be learned which also apply to the technologies you're using.

Laravels Route Model Binding can be a very useful technique in Vue.js applications too and there are tons of other useful things we can learn by looking at other frameworks and programming languages.
