+++
date = "2018-01-06T08:11:11+02:00"
title = "Combining GraphQL and Vuex"
description = "Learn how to combine GraphQL and Vuex for managing state in Vue applications and how to set up a simple GraphQL powered API server."
intro = "In todays article, we're going to take a look at how we can combine GraphQL and Vuex to manage the state of a Vue application. But first of all let me say that the way we're going to integrate the Apollo GraphQL client into our Vue application is not the “official” way of how to integrate GraphQL into a Vue powered application..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Vuex", "GraphQL"]
+++

In todays article, we're going to take a look at how we can combine GraphQL and Vuex to manage the state of a Vue application. But first of all let me say that the way we're going to integrate the Apollo GraphQL client into our Vue application is not the “official” way of how to integrate GraphQL into a Vue powered application. The most standard way of using GraphQL with Vue would be the [vue-apollo](https://github.com/Akryum/vue-apollo) plugin.

Let me explain the reasons why I choose to not use `vue-apollo`.

1. Too much magic: I want to experience how it “feels” to integrate GraphQL / Apollo into an application with my bare hands.
2. One more dependency: `vue-apollo` to me, feels like another dependency in the already abyssal GraphQL dependency tree.
3. Vuex integration: I want Vuex to be the single source of truth for application state, `vue-apollo` is designed to be used alongside Vuex, but I want to integrate the GraphQL client into the Vuex store.

I'm still experimenting with this approach, so if you want a solution that is battle tested by the community, I recommend you to use `vue-apollo`. But if you want to deeply integrate GraphQL with Vuex you might find the following article useful.

You can find [the code for this article on GitHub](https://github.com/maoberlehner/combining-graphql-and-vuex).

## Project setup

To get started, we need to initialize a new Vue project. Additionally we'll need a GraphQL server. In a real world application, you might want to create two separate projects for your GraphQL API server and the Vue frontend, but in order to keep this article as simple as possible, we'll use one project containing both, the frontend application and the GraphQL server.

```bash
# Install the Vue CLI tool.
npm install -g vue-cli
# Create a new Vue project
# with the webpack template.
vue init webpack PROJECT_NAME
```

After we've initialized a new webpack powered Vue project with the command you can see above, we can move on to implementing a simple GraphQL server.

## Basic GraphQL server setup

First of all, let's start with installing all the dependencies we're going to need to set up our server.

```bash
npm install --save apollo-server-express body-parser cors express graphql graphql-tools nodemon
```

Next we can proceed with creating our server script.

```js
// api/server.js
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');

const booksDb = require('./books');

const PORT = 3000;
const APP_URL = 'http://localhost:8080';

const typeDefs = `
  type Book {
    id: ID!
    title: String
    author: String
    description: String
  }
  type Query {
    book(id: ID!): Book
    bookList: [Book]
  }
`;
const resolvers = {
  Query: {
    book(_, { id }) {
      return booksDb.find(book => book.id === id);
    },
    bookList() {
      return booksDb;
    },
  },
};
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const app = express();

// Enable pre-flighting on all requests.
// See: https://www.npmjs.com/package/cors#enabling-cors-pre-flight
app.options('*', cors());
// Only allow cross origin requests
// coming from the URL specified above.
app.use(cors({ origin: APP_URL }));

// bodyParser is needed for POST.
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
app.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

app.listen(PORT, () => {
  console.log(`Go to http://localhost:${PORT}/graphiql to run queries!`);
});
```

What you can see above, is a very basic implementation of a GraphQL API server. For simplicity, we're using a JSON file [api/books.json](https://github.com/maoberlehner/combining-graphql-and-vuex/blob/master/api/books.json) instead of a real database.

The `typeDefs` specify which types of data we can request from the server. The `Book` type is the resource type which we want to be able to fetch. The `Query` type is a special GraphQL type for defining the queries which are allowed to make to our API. In our case we're allowing to query a book by ID and a list of all books. In a real world application you might want to add additional filters, sorting and pagination, but let's keep it simple for now.

The `resolvers` are in charge of retrieving the data (usually from a database or the file system). This is the place where you would make database queries to retrieve the data from the database. In our example, we're returning the data imported from a JSON file.

### Server configuration

In the second half of the code you can see above, we're starting an express server with support for cross origin requests which are coming from the application we're going to build. We specify that our API can be accessed using the `/graphql` endpoint. Also we define a `/graphiql` endpoint which serves an [in-browser IDE for exploring GraphQL data](https://github.com/graphql/graphiql).

Now we're already able to start the server by typing `node api/server.js` in the shell of your choice. To make the process of starting the server a little bit more convenient, we can add a new npm script to our `package.json` file.

```json
"scripts": {
  ...
  "api": "nodemon api/server.js"
  ...
},
```

This makes it possible to run `npm run api` to start the API server. The `nodemon` package, automatically restarts the server when files are changing, which is especially useful during development.

### Using GraphiQL to test the API server

If everything works correctly, we're now able to open `http://localhost:3000/graphiql` in the browser and send a query to it.

```bash
{
  book(id: 1) {
    title
    author
  }
}
```

As you can see above, GraphQL allows us to specify the fields we want to fetch from the API. The return of the query above should generate the following output.

```json
{
  "data": {
    "book": {
      "title": "The Lord of the Rings",
      "author": "J. R. R. Tolkien"
    }
  }
}
```

## Apollo GraphQL client setup

With our server set up and ready to go, we can move on to build a Vuex powered Vue application which connects to our GraphQL server.

```bash
npm install --save apollo-cache-inmemory apollo-client apollo-link-http graphql graphql-tag vuex
# This Babel plugin removes the `graphql-tag`
# dependency to reduce the script
# initialization time and the bundle size.
npm install --save-dev babel-plugin-graphql-tag
```

Unfortunately, we need to install a lot of dependencies to integrate GraphQL into our application.

### Optimize the Babel config

To minimize the impact of all those dependencies to the final bundle size, at least a little bit, let's add the `babel-plugin-graphql-tag` plugin to the `.babelrc` configuration file.

```json
{
  "presets": [
    ["env", {
      "modules": false
    }],
    "stage-2"
  ],
  "plugins": [
    "graphql-tag",
    "transform-vue-jsx",
    "transform-runtime"
  ]
}
```

If you're interested in what exactly this plugin does, you can read more about it on [the official project page](https://github.com/gajus/babel-plugin-graphql-tag).

### Initializing the Apollo client

In order to being able to make requests to our previously set up GraphQL server, we need to initialize a new Apollo client instance.

```js
// src/utils/graphql.js
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

export default new ApolloClient({
  // Provide the URL to the API server.
  link: new HttpLink({ uri: 'http://localhost:3000/graphql' }),
  // Using a cache for blazingly
  // fast subsequent queries.
  cache: new InMemoryCache(),
});
```

### Setting up Vuex

In the next step, we want to set up a Vuex store and use the previously initialized Apollo client to retrieve data from our API server and save it in the state of the store.

```js
// src/store/index.js
import Vue from 'vue';
import Vuex from 'vuex';
import gql from 'graphql-tag';

import graphqlClient from '../utils/graphql';

Vue.use(Vuex);

export const mutations = {
  // ...
};

export const actions = {
  // ...
};

export const state = {
  book: null,
  bookList: [],
};

export default new Vuex.Store({
  mutations,
  actions,
  state,
});
```

What you can see above, is the basic structure of our Vuex store. We'll fill the gaps in the next step with mutations and actions.

We also have to add the newly created Vuex store to our Vue instance.

```js
// src/main.js
import Vue from 'vue';

import App from './App';
import store from './store';

Vue.config.productionTip = false;

new Vue({
  el: '#app',
  store,
  render: h => h(App),
});
```

### Implementing Vuex mutations and actions

```js
// src/store/index.js
export const mutations = {
  setBook(state, book) {
    state.book = book;
  },
  setBookList(state, bookList) {
    state.bookList = bookList;
  },
};
```

The mutation functions you can see above, are responsible for adding new data to the state.

```js
// src/store/index.js
export const actions = {
  async fetchBook({ commit }, id) {
    const response = await graphqlClient.query({
      // It is important to not use the
      // ES6 template syntax for variables
      // directly inside the `gql` query,
      // because this would make it impossible
      // for Babel to optimize the code.
      query: gql`
        query Book($bookId: ID!) {
          book(id: $bookId) {
            id
            title
            author
            description
          }
        }
      `,
      variables: { bookId: id },
    });

    // Trigger the `setBook` mutation
    // which is defined above.
    commit('setBook', response.data.book);
  },
  async fetchBookList({ commit }) {
    const response = await graphqlClient.query({
      query: gql`
        query BookList {
          bookList {
            id
            title
            author
            description
          }
        }
      `,
    });

    // Trigger the `setBookList` mutation
    // which is defined above.
    commit('setBookList', response.data.bookList);
  },
};
```

Now this is where it starts to get interesting: the actions are responsible for triggering queries to the GraphQL API via the `apolloClient` we've initialized previously.

### Putting everything together

Finally, everything is set up correctly and we're ready to retrieve data via Vuex and GraphQL from our GraphQL server, inside of our `src/App.vue` component.

```html
<template>
  <div id="app">
    <h2>The one book</h2>
    <strong>{{ book.title }}</strong> by {{ book.author }}
    <p>{{ book.description }}</p>

    <h2>All the books</h2>
    <ul v-for="book in bookList" :key="book.id">
      <li>
        <strong>{{ book.title }}</strong> by {{ book.author }}
        <p>{{ book.description }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'App',
  computed: {
    ...mapState(['book', 'bookList']),
  },
  beforeCreate() {
    // `1` is the ID of the book we want to fetch.
    this.$store.dispatch('fetchBook', 1);
    this.$store.dispatch('fetchBookList');
  },
};
</script>
```

As you can see above, we're using the `mapState()` helper function, which Vuex is providing, to map the `book` and `bookList` properties as computed properties to our component.

In the `beforeCreate()` hook, which is already called before the component is even created, we're dispatching the `fetchBook` and `fetchBookList` store actions, which are responsible for fetching data from our GraphQL server.

To test if everything is working correctly, first start the GraphQL server by running `npm run api` and then start the webpack dev server by running `npm start`. Now open `http://localhost:8080/` in your browser and you should be able to see our application rendering the data from our server.
