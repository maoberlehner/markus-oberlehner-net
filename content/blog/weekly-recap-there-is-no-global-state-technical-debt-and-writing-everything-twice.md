+++
date = "2020-02-23T09:12:12+02:00"
title = "Weekly Recap: There is no Global State, Technical Debt and Writing Everything Twice"
description = "My personal recap of the last week with thoughts about global state, technical debt and WET first component architecture."
intro = "In the last week, thoughts about global state management, technical debt, and using a WET first approach for building components sparked my interest..."
draft = false
categories = ["Development"]
tags = ["Weekly Recap"]
+++

In the last week, thoughts about global state management, technical debt, and using a WET first approach for building components sparked my interest.

## Table of Contents

- [There is no global state](#there-is-no-global-state)
- [What is technical debt](#what-is-technical-debt)
- [WET first component architecture](#wet-first-component-architecture)

## There is no global state

Kent C. Dodds started an [interesting discussion](https://twitter.com/kentcdodds/status/1228727040238473216) about what is application state and what is actually a client-side cache of server state. I very much agree with his conclusion that many apps could be made much simpler by using less smart query mechanisms.

Apollo and Relay are very powerful tools, but they add a critical amount of overhead to otherwise straightforward applications. [`react-query`](https://www.npmjs.com/package/react-query) and [`SWR`](https://github.com/zeit/swr) by ZEIT look very promising. I am very excited about the tools that will be available when the Vue Composition API is ready.

## What is technical debt?

João Rosa had pointed out [in a tweet](https://twitter.com/antao/status/1229329606659932160) that every CFO knows about the financial debts of their company, but most CTOs have no idea how to express the technical debt of the company. I think the main problem is that it is not clear what technical debt is and how it can be measured.

Everybody uses terms like *technical debt* and [*legacy code*](/blog/weekly-recap-atomic-commits-legacy-code-and-evil-string-identifiers#all-code-is-legacy-code), but most of us have no clear definition in mind. What most people mean when they say those words is: I don't like this code.

I have only found two indicators for technical debt that can be measured to some extent with automated tools: cyclomatic complexity and code duplication. You can set up a [linting rule for cyclomatic complexity](https://eslint.org/docs/rules/complexity), and you can use a tool like [jscpd](https://github.com/kucherenko/jscpd) to find duplicated code.

**But both methods are by no means definite indicators of technical debt. Code duplication, in particular, is a poor indicator for determining the quality of your codebase.** Nevertheless, I think that it can be valuable to keep an eye on the duplication stats. Although I would not recommend automatically checking for duplication in your CI pipeline, setting up an ESLint rule for cyclomatic complexity might be a good idea.

I think we as a profession have to find **better ways to communicate about technical debt and find better ways to measure it.** Teams have to find indicators for technical debt and make them known to everyone who works with the code. Then there must be processes to measure and work on the technical debt. [Mathias Verraes has some excellent advice on this topic](https://verraes.net/2020/01/wall-of-technical-debt/).

I have started to make a note every time I find something in the code that prevents me from moving forward quickly. Two things I have learned from this practice so far are that it is challenging to keep one's preconceptions and preferences out of the technical debt assessment and that the actual problems I discover are very difficult to check for automatically.

## WET first component architecture

Lately I thought about how to avoid coming up with wrong abstractions when trying to keep my codebase DRY. One pattern I follow is to create <abbr title="Write Everything Twice">WET</abbr> components by default and adapt as soon as I'am sure that it is the same problem I have to solve before reusing a component in a different context.

I'm still trying to build the component as generic as possible, as long as it's easy to do and doesn't limit me in solving the actual problem. As soon as I realize that the component becomes unnecessarily complicated by the constraints that make it generic, I immediately stop and take the less generic, simpler approach.

```html
<!-- I start with a specific component ... -->
<template>
  <div class="LoginForm">
    <!-- ... -->
    <LoginFormButtonSubmit/>
  </div>
</template>

<!-- ... but get more generic if it is suitable. -->
<template>
  <div class="LoginForm">
    <!-- ... -->
    <ButtonSubmit/>
  </div>
</template>
<template>
  <div class="NewsletterForm">
    <!-- ... -->
    <ButtonSubmit/>
  </div>
</template>
```
