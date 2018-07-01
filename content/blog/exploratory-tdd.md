+++
date = "2017-12-10T06:55:59+02:00"
title = "Exploratory TDD"
description = "Read more about how to overcome the TDD writer's block. Exploratory coding can help you to get started writing code in a test driven manner."
intro = "I'm currently working hard on making TDD my default way of writing code. Although I've noticed that the more I practice TDD, the more easier it becomes, oftentimes I still fall back into writing dozens of lines of code with absolutely no tests covering them..."
draft = false
categories = ["Development"]
tags = ["TDD"]
+++

I'm currently working hard on making TDD my default way of writing code. Although I've noticed that the more I practice TDD, the more easier it becomes, oftentimes I still fall back into writing dozens of lines of code with absolutely no tests covering them.

Sometimes laziness is the reason why I fall back into my old habit of writing code without coming up with a test first. But oftentimes the reason is that I just don't know how to start. I have no idea what test to write first, because I have no idea about how I'm going to implement the feature that I have to build. 

Well, I know what the thing is supposed to do once it's ready, but there is a long way ahead and a lot of lines of code have to be written before reaching the final goal of a working implementation.

## The TDD writer's block
When I'm struggling with getting started writing tests, I oftentimes go back to the literature, searching for instructions on how to deal with a severe TDD writer's block. But most of the examples used in TDD articles and books are very basic.

Of course very basic examples are used when explaining the concepts of TDD, it is much easier to explain the essential techniques with simple examples. I myself use rather basic examples in this blog too.

But when you're working on real world projects, things are different. You have to solve complex problems of a kind you more often than not, have never dealt with before. In such situations it feels like all of those articles, books and talks about TDD are a lie. Of course TDD works when dealing with such (artificially) simple problems, you might think in those moments.

## Exploratory coding to the rescue
One technique I've used with decent success lately in such situations, is exploratory coding. The way I do it, is to start hacking and playing around with the code similar to “normal”, non test driven coding. There are two major differences though.

1. **I don't care about code quality at all.** Usually when writing code, I'm trying to do my best to keep the code clean and DRY. But not so when I'm doing exploratory coding – quite the opposite. Oftentimes I intentionally write WET code to see patterns emerge. What counts in this phase of programming is, that I get a feeling for the requirements of the implementation. The end result is not necessarily a working implementation, but an idea of how a possible implementation could look like.
2. **I throw away the initial code.** After the first phase of getting a feeling for what's needed to solve the problem at hand, I delete (or at least comment out) the code I've written so far.

After I've gathered enough knowledge about the problem – and I feel ready to start with *real* TDD – I write my first test. Some might argue that this defeats one of the major advantages of TDD, which is that it guides you to come up with a rather simple solution to a problem. But in my experience so far, because I try to ignore the implementation details of the code I've written during the exploration phase, TDD still enables me to write simple code.

Most of the time, the final (tested) code has not too much in common with the code written during the exploration phase. The exploration phase helps me to wrap my head around the problem and provides me with a starting point for writing the real code in a test driven manner.

## Don't be too dogmatic
However, it may happen that the code written during the exploration phase is perfectly fine. You might have found a simple and elegant solution to the problem you're dealing with.

It would be silly to throw away such code just because it was not written using TDD. In such cases, the most practical solution would be to write your tests retroactively and call it a day. But you should be suspicious of yourself if you use this as an excuse for not doing *real* TDD again and again.

## Final thoughts
The approach of exploratory TDD might not be a perfect fit for every situation and there might even be some TDD extremists who think it's blasphemy, but it often works for me.

The next time you suffer from a TDD writer's block, I recommend you to start with some exploratory coding first.
