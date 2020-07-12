+++
date = "2020-07-12T10:41:41+02:00"
title = "Business Logic in Fat Client Applications"
description = "Learn how to deal with and where to put your business logic in modern, client-heavy SPAs."
intro = "In typical server-side rendered web applications, the separation of the business logic from the view layer was usually straightforward. But the boundaries are becoming blurry as we create fat client applications where much of the business logic tend to live on the client-side..."
draft = false
categories = ["Development"]
+++

In typical server-side rendered web applications, the separation of the business logic from the view layer was usually straightforward. But the **boundaries are becoming blurry** as we create fat client applications where much of the **business logic tend to live on the client-side.**

## Services, models and controllers

If we look at popular server-side frameworks, we often have applications made out of *services,* *models,* and *controllers.* Typically we handle the business logic inside of the services and controllers.

In fat client applications, **we need to replicate the logic which was previously implemented server-side, on the client.** Some parts of the logic we can do client-side only, while some code (e.g., input validation), must (also) run on the server for security reasons.

Very quickly, this leads to duplicated code.

## Sharing is caring

If you use Node.js on the backend, I recommend you write all the code that is inevitably running on the server in an isomorphic way.

You can create a `shared` directory, which is the place for all the code that you want to run on the server and the client. A prime example of that is input validation: you want to validate the data directly on the client for immediate feedback. But you also must validate the data on the server because of security concerns.

## Don't reinvent the wheel

Default to implement the core elements of your business logic on the backend in the API layer of your application.

Use services as a layer for your business logic both on the backend and on the frontend. Additionally, use models as a generic way for accessing your database on the backend and your API on the frontend.

```js
// api/services/user.js

// This is the service for working with user objects
// on the server. Here you should put all of your core
// business rules.

// The `model` is an abstraction of the data layer.
// On the backend this will typically fetch data from a database.
export function makeUserService({ currentUser, model }) {
  return {
    // ...
    find(query) {
      if (query.id !== currentUser.id) {
        throw new Error('Permission error');
      }

      return model.find(query);
    },
    // ...
  };
}
```

```js
// src/services/user.js

// This is the service for working with user objects
// on the client. Here you can put client related
// business logic (which should be only cosmetic).

// The `model` is an abstraction of the data layer.
// On the frontend this will typically get data from an API.
export function makeUserService({ model }) {
  return {
    // ...
    async find(query) {
      const user = await model.find(query);
      // Do something with the `user` object ...
      return user;
    },
    // ...
  };
}
```

In the two examples above, you can see that we apply the same concepts on the backend as on the frontend. But most, if not all, your business logic should be placed inside the services on the backend.

If you feel the need to put business logic (logic not only related to how things are presented to the user) into your client-side application, you should replicate logic that is already present on the backend.

```js
// shared/models/user.js
// ...

export const inputRules = {
  email: ['required', 'unique'],
  firstname: ['required'],
  // ...
};

// ...
```

Validation is a typical example of business logic you want to run on the backend and the client. By using a `shared` directory and putting isomorphic code there, you can make sure that you don't end up with duplicated code for your API and your client-side application.

## Example directory structure

Next you can see an example for a possible directory structure.

```bash
.
├─ api
│  ├─ models
│  │  └─ user-db.js
│  └─ services
│      └─ user.js
├─ shared
│  └─ models
│      └─ user.js
└─ src
    ├─ models
    │  └─ user-api.js
    └─ services
        └─ user.js
```

## Wrapping it up

Try to avoid adding business logic to your frontend at all costs. If this is out of reach, try to reuse as much logic as possible from the backend. The most crucial thing is: never to implement important aspects of your business rules only on the client!
