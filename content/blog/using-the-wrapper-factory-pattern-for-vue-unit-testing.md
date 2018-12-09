+++
date = "2018-12-02T06:04:04+02:00"
title = "Using the Wrapper Factory Pattern for Vue.js Unit Testing"
description = "Learn how to use the Wrapper Factory Pattern to simplify your Vue.js unit test code."
intro = "If you test Vue.js Components with a certain complexity, oftentimes you'll be faced with the situation of repeating the same component initialization code again and again. There are multiple patterns to deal with situations like that but today we'll take a look at how we can solve this problem by using a wrapper factory function..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "Front-End testing", "unit tests", "Vue"]
+++

If you test Vue.js Components with a certain complexity, oftentimes you'll be faced with the situation of **repeating the same component initialization code again and again.** There are multiple patterns to deal with situations like that but today we'll take a look at how **we can solve this problem by using a wrapper factory function.**

## The problem

First of all, let me show you the problem before we examine a possible solution.

```js
describe('MyComponent', () => {
  test('It should render the given items.', () {
    const wrapper = shallowMount(MyComponent, {
      propsData: {
        items: ['item 1', 'item 2'],
      },
    });
    expect(wrapper.findAll('.item').length).toBe(2);
  });
  
  test('It should emit a click event if an item is clicked.', () {
    const wrapper = shallowMount(MyComponent, {
      propsData: {
        items: ['item 1', 'item 2'],
      },
    });
    wrapper.find('.item').trigger('click');
    expect(wrapper.emitted().click).toBeTruthy();
  });
  
  test('It should render an empty information if no items are given.', () {
    const wrapper = shallowMount(MyComponent, {
      propsData: {
        items: [],
      },
    });
    expect(wrapper.contains('.empty-information')).toBeTruthy();
  });
});
```

## The wrapper factory

In the example above you can see **a lot of repetition** going on. Let's take a look at how we can clean this up by using a wrapper factory.

```js
describe('MyComponent', () => {
  function wrapperFactory({ propsData } = {}) {
    return shallowMount(MyComponent, {
      propsData: {
        items: ['item 1', 'item 2'],
        ...propsData,
      },
    });
  }

  test('It should render the given items.', () {
    const wrapper = wrapperFactory();
    expect(wrapper.findAll('.item').length).toBe(2);
  });
  
  test('It should emit a click event if an item is clicked.', () {
    const wrapper = wrapperFactory();
    wrapper.find('.item').trigger('click');
    expect(wrapper.emitted().click).toBeTruthy();
  });
  
  test('It should render an empty information if no items are given.', () {
    const wrapper = wrapperFactory({
      propsData: {
        items: [],
      },
    });
    expect(wrapper.contains('.empty-information')).toBeTruthy();
  });
});
```

In the code snippet above, you can see, that we've created a `wrapperFactory()` function which covers the most common case. **By using the `wrapperFactory()` we only have to provide additional options, if our test case deviates from the norm.**

This example is a rather simple one. **The wrapper factory pattern becomes more and more useful the more boilerplate code is needed to initialize the component.**

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

Although some general programming rules like “don't repeat yourself” do not always apply when writing test code, keeping repetition at a minimum is usually still a good idea. Thanks to the wrapper factory pattern, we can reduce the amount of repetition in our test files by quite a lot without harming transparency too much.
