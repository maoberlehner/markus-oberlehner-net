+++
date = "2021-01-17T08:56:56+02:00"
title = "Your Components Do Too Much"
description = "Learn how to identify when your components are doing too much and what to do against it."
intro = "Whenever you feel the need to access global state or globally injected plugin methods or global anything for that matter, often it is a sign that the component you're working on is doing too much..."
draft = false
categories = ["Development"]
images = ["/images/c_pad,b_rgb:ED8936,f_auto,q_auto,w_1014,h_510/v1542158523/blog/2021-01-17/components-do-too-much"]
+++

Whenever you feel the need to access global state or globally injected plugin methods or global anything for that matter, often it is a sign that the component you're working on is doing too much.

We can think of our applications as a tree structure. The `App` component (or the individual page components in a multi-page app) is the trunk. `App` is the main entry point of our application. Every component is a direct or indirect child component of `App` in the same way every branch and every leaf connects directly or indirectly to a tree's trunk. The deeper down in the component tree a particular component lives, the less state it should need and the less logic it should contain.

Trunk components own the shared state and business logic. Branch components can also have state and logic, but leaf components, typically, only receive state via props and render it. They don't handle complex user interactions or state changes themselves but emit events or [execute callbacks](/blog/events-and-callbacks-parent-child-component-communication-in-vue/). Leaf components also don't fetch state from an API or get state from a global store.

Imagine we fetch data from an API, and we need the data in multiple places of our application. What we can do is to fetch the data in all of the components where we need it. But ultimately, in a complex app, this can lead to a situation where we make dozens of requests to the same API endpoint for the same data. There are tools out there to help with that by batching requests. Still, I think we should aim for an application architecture where most components are simple components without data fetching logic. Only a few components are responsible for fetching all the data that is necessary.

If we deal with state or logic that we need (almost) everywhere in our application in multiple independent components, we might want our `App` component to manage it. If it is page-specific state or logic that we only need on one or multiple specific pages, then page components are the right place to put it. Then there is state or logic that is very specific to a particular component. Whenever we use the component somewhere in our application, we need a specific piece of state or logic, and it is not shared with any other component (except child components). This component is the best place to hold the state and business logic.

Still, sometimes we end up with multiple, self-contained (they don't share a common parent) components on a page that need to fetch the same data from a particular endpoint. In those cases, we should ensure that we utilize caching and only a single request goes through.

And then there is the case of multiple self-contained components sharing the same business logic. Whenever that happens, using composables (Vue 3) or hooks (React) is probably the best way to go.

## The Heavy Trunk Problem

Moving more and more state and business logic into the trunk component can lead to a huge `App` component containing virtually all of the application's state and logic.

At that point, it might be the right time to start thinking about a global state management solution. Or even better: [Context Providers](/blog/context-and-provider-pattern-with-the-vue-3-composition-api/).

## Wrapping It Up

Straightforward components with as little logic and state management as possible should be the vast majority of our components. But at the same time, we have to be careful not to build overly heavy branches and trunks.
