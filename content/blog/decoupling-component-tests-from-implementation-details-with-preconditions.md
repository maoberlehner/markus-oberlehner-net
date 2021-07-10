+++
date = "2021-07-10T10:42:42+02:00"
title = "Decoupling Component Tests From Implementation Details with Preconditions"
description = "Learn how to use Preconditions to decouple tests from Implementation Details."
intro = "When testing components (e.g., Vue or React) or regular JavaScript modules, we typically want to decouple our test code from the implementation as much as possible. Ideally, we want to write black box tests. That means that we are only allowed to interact with the public API of the component under test..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Vue"]
images = ["/images/c_pad,b_rgb:EFEFEF,f_auto,q_auto,w_1014,h_510/v1542158522/blog/2021-07-10/decoupling-tests-with-preconditions"]
+++

When testing components (e.g., Vue or React) or regular JavaScript modules, we typically want to decouple our test code from the implementation as much as possible. Ideally, we want to write black box tests. That means that we are only allowed to interact with the public API of the component under test.

```js
test('It should increment the count when clicking the `+` button.', async () => {
  let wrapper = mount(Counter);
  
  await wrapper.find('[data-qa="plus button"]').trigger('click');
  
  expect(wrapper.find('[data-qa="count"]').text()).toBe('1');
});
```

In the example above, we test our `Counter` component from a user's perspective. We click a button and expect a specific output to be displayed. So far, so good. Some might argue that using `data-qa` selectors introduces unnecessary coupling, but I'm not convinced that [querying by text is superior](https://twitter.com/techgirl1908/status/1203180840387141632).

- [Mocking Leads to Tightly Coupled Tests](#mocking-leads-to-tightly-coupled-tests)
- [Using Preconditions to Avoid Coupling](#using-preconditions-to-avoid-coupling)

## Mocking Leads to Tightly Coupled Tests

But things get more complicated as soon as we need to mock certain parts of our code. Usually, we should avoid mocking, but that's not always possible. At least in our unit tests, we almost always have to mock calls to external APIs, for example.

```js
// src/components/ArticleForm.test.vue
// Using Mock Service Worker for API mocking.
// See: https://kentcdodds.com/blog/stop-mocking-fetch
import { server, rest } from '../../test/server';

import ArticleForm from './ArticleForm.vue';

test('It should show a success message after creating a new article.', async () => {
  server.use(
    rest.post('/article', async (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({
        data: { content: 'Foo' },
      }));
    }),
  );
  let wrapper = mount(ArticleForm);
  
  await wrapper.find('[data-qa="content"]').setValue('Foo');
  await wrapper.find('[data-qa="submit"]').trigger('click');
  
  expect(wrapper.find('[data-qa="success"]').exists()).toBe(true);
});
```

This example doesn't look terrible, but there is a problem here: the test knows too much. It knows that the `ArticleForm` component triggers a `POST` request to the `/article` endpoint. This is an implementation detail. Our component is not a black box anymore.

## Using Preconditions to Avoid Coupling

We can disarm the coupling in this test by introducing a new abstraction layer: preconditions. A precondition hides all the implementation details we need to mock out from the test.

```js
// test/preconditions/article.js
import { server, rest } from './server';

export function userCanCreateNewArticle(data = { content: 'Foo' }) {
  return server.use(
    rest.post('/article', async (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ data }));
    }),
  );
}
```

Let's update our test from above to make use of this new precondition.

```js
// src/components/ArticleForm.test.vue
import { userCanCreateNewArticle } from '../../test/preconditions/article';

import ArticleForm from './ArticleForm.vue';

test('It should show a success message after creating a new article.', async () => {
  await userCanCreateNewArticle();
  let wrapper = mount(ArticleForm);
  
  await wrapper.find('[data-qa="content"]').setValue('Foo');
  await wrapper.find('[data-qa="submit"]').trigger('click');
  
  expect(wrapper.find('[data-qa="success"]').exists()).toBe(true);
});
```

This might seem like a very subtle change, but it is a game-changer. Now, the test itself is completely decoupled from any implementation details of `ArticleForm`. The information about the transport layer (API) is hidden in `userCanCreateNewArticle()`. Another nice side effect of that is that the setup/mock code inside the precondition is reusable.

But I have to note that it is still not perfectly decoupled. If we refactor the `ArticleForm` component to delegate IO to a parent component, the precondition `userCanCreateNewArticle()` would be useless. But it is as good as we can do, I think.

## Wrapping It Up

Preconditions help us keep our test code clean of implementation details, and they help us keep our test code DRY by making setup code reusable. Furthermore, they are a first step toward using a Domain Specific Language (DSL) for writing tests.

In one of my following articles, we'll take a closer look at how we can use a DSL for further decoupling our test code, not only from implementation details but also from the implementation itself. Then our tests don't even know about the black box anymore.
