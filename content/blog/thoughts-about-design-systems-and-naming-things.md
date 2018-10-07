+++
date = "2018-10-07T06:42:42+02:00"
title = "Thoughts About Design Systems and Naming Things"
description = "Read about my thoughts how to name components in design systems and why you shouldn't use context-dependent names."
intro = "In the last couple of days I started thinking about how to name certain things in design systems. Naming things is one of those exercises which seem to just don't get easier, even after years of working on all sorts of design systems and CSS frameworks..."
draft = false
categories = ["Development"]
tags = ["Front-End Architecture"]
+++

In the last couple of days I started thinking about how to name certain things in design systems. Naming things is one of those exercises which seem to just don't get easier, even after years of working on all sorts of design systems and CSS frameworks.

> There are only two hard things in Computer Science: cache invalidation and naming things.

*– Phil Karlton*

It's a well-known saying in the programming world: naming things is hard. And in my opinion, it's even worse for us non native speakers. There are a lot of nuances in every language and using a certain word, which pops up as the first result in the dictionary, might not be the right choice in the context you're using it.

## Names do matter

Some might say that we shouldn't waste too much of our precious time on finding good names for certain building blocks of the websites and applications we build and we should focus on building more stuff in less time instead. **I'd argue that giving things meaningful names can save you a ton of time and headaches in the long run, especially if a lot of people work on the same codebase over several years.**

Not only are good names helpful when it comes to finding things in large codebases and to promote code reuse, what's more **I've also experienced first hand how ill-named components can lead to bad code.** Because it's not clear what purpose the component serves, every programmer who touches it, over time, adds more and more functionality until the component gets so complex that nobody can possible understand it anymore. Or sometimes it can go the opposite way: because nobody knows what's the purpose of a certain component, new components are created instead of building on top of the component which initially was intended to solve the problem at hand.

## Being too specific

Oftentimes, when I think about a name for a new element or component of a design system, I fail to think of it without the context in which I'm using it right now. This can lead to very specific names like `ArticleList` or `ProductGrid`.

Rather sooner than later, I have to build a list of products which looks exactly like the thing I labeled `ArticleList` before.

This happens to me all the time. And for a long time I wasn't quite sure how to deal with this problem – it's too tempting to go with the specific name; and even when asking other people how to name certain things: more often than not the context-dependent name is the first thing you'll hear.

After doing some research and taking a look at very successful design systems of large companies (e.g. the great [salesforce Lightning Design System](https://www.lightningdesignsystem.com/components/welcome-mat/)) **I've realized that you shouldn't use specific names at all.** All of the components of large scale design systems or popular CSS frameworks, have very generic names like `ContentList` or `Panels`.

## Reinventing the wheel

Another problem I oftentimes encounter, is, that we tend to reinvent the wheel over and over again. **Instead of noticing patterns and reusing existing components (like using the same `ContentList` for displaying a list of products or a list of articles) we build a new component which looks slightly different than the `ContentList` but basically serves the same purpose.**

This defeats the point of a design system and, over time, can lead to a bloated codebase which is very hard to maintain.

## Wrapping it up

Naming things requires a lot of discipline. You have to withstand the urge of doing the easy thing and just name things after the context they are used in, because this almost certainly leads to problems in the future. And even more importantly: you have to bite the bullet if you recognize that one of your components has a bad name, don't hesitate to rename it and refactor your codebase accordingly.
