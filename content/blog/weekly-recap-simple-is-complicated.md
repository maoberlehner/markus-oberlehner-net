+++
date = "2019-12-22T07:25:25+02:00"
title = "Weekly Recap: Simple is Complicated"
description = "My personal recap of the last week about TDD best practices, writing simple code and State Machines."
intro = "Last week was a slow week when it comes to discovering or learning about new things. Here are a few things I encountered..."
draft = false
categories = ["Development"]
tags = ["Weekly Recap", "TDD"]
+++

Last week was a slow week when it comes to discovering or learning about new things. Here are a few things I encountered.

## Make things flat

It’s a mantra in programming that you should strive for simplicity. But often we have to solve complex problems and coming up with a simple solution isn’t always doable or seems to be utterly impossible.

One thing I discovered is that it can help to [work with flat data structures](/blog/make-your-vuex-state-flat-state-normalization-with-vuex/). Accessing properties of objects which are nested multiple levels deep can lead to hard to understand code, especially when you have to use loops and `find` a lot.

## Writing simple code is complicated

Often I start with a good feeling about coming up with a solution for a new feature and writing the first tests everything seems to run smoothly. But an hour or two later, I discover edge case after edge case, and my code quickly becomes complicated. I don't have the right solution for this yet; I have to work on my simplification skills.

## State machines everywhere

Both the [Full Stack Radio Podcast by Adam Wathan](http://www.fullstackradio.com/130) and the [Syntax Podcast by Wes Bos and Scott Tolinski](https://syntax.fm/show/206/state-machines-css-and-animations-with-david-k-piano) had an episode about State Machines with David Khourshid.

The concept sounds pretty interesting. Still, to me, it seems, similar to functional programming, a lot cooler and easier in theory and with simple examples as it turns out to be in real-world applications with all their edge cases.

But I haven’t tried them out yet. I’m very intrigued by the concept, and I’ll play around with it over the holidays. Furthermore, I find [the possibilities State Machines offer in regards to testing](https://css-tricks.com/model-based-testing-in-react-with-state-machines/) very exciting.

## Red, green, refactor in practice

Last week I tried to put more emphasis on the *refactor* step.  It worked well. Not putting too much pressure on myself during the *green* phase to write clean code makes it easier to come up with a simple solution. During refactoring, you already have a better feeling for where to put abstractions.

I had mixed results with writing tests for the internal API during development but deleting them after the fact. Although I recognize that those tests can be a burden on maintenance over the lifecycle of an app, I can also see how they can be very beneficial when refactoring small parts of the SUT.

## Write a failing test before leaving work

It seems counterintuitive at first, but I think it's a good practice to leave work with a failing test. That way, the next morning, you know where to start.

## `const` vs `let`

I discovered that there is [some debate](https://twitter.com/dan_abramov/status/1208369896880558080) about the usefulness of `const` in JavaScript. As I understand it, the main point of criticism is that it's easy to believe you can make objects immutable by using `const`, which is not the case.

Jamie Kyle wrote [a pretty good overview of the topic](https://jamie.build/const), unfortunately with a lot of needless profanity (I don’t get it why some people think they have to use profanity in technical writing, but that’s another topic).

The practice of declaring everything as `const` if you happen not to redeclare the variable elsewhere and changing const to let as soon as you do want to change the value of a variable, indeed, seems pretty pointless.

## Wrapping it up

I learned a few interesting things last week and I’m very excited to start playing around with State Machines. Maybe they are a useful tool for writing simple code.

## References

- [Adam Wathan and David Khourshid, Building Better UI Components with State Machines](http://www.fullstackradio.com/130)
- [Wes Bos, Scott Tolinski and David Khourshid, State Machines, CSS and Animations](https://syntax.fm/show/206/state-machines-css-and-animations-with-david-k-piano)
- [David Khourshid, Model-Based Testing in React with State Machines](https://css-tricks.com/model-based-testing-in-react-with-state-machines/)
- [Jamie Kyle, A fucking rant about fucking const vs fucking let](https://jamie.build/const)
- [Markus Oberlehner, Make your Vuex State Flat: State Normalization with Vuex](/blog/make-your-vuex-state-flat-state-normalization-with-vuex/)
