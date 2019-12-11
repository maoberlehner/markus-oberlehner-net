+++
date = "2017-08-06T08:24:33+02:00"
title = "What I’ve Learned from Rewriting an Open Source Project from Scratch"
description = "Rewriting the entirety of your codebase from scratch, is almost always a bad idea. Things to consider when you feel the urge to rewrite your codebase."
intro = "A few months ago I started learning more about TypeScript. It was very refreshing and I learned a lot about type-based programming in general. So I was overcome by the natural urge of every programmer who is learning a new technique that they enjoy: I wanted to rewrite everything I ever built with TypeScript..."
draft = false
categories = ["Development"]
tags = ["TDD", "TypeScript"]
+++

A few months ago I started learning more about TypeScript. It was very refreshing and I learned a lot about type-based programming in general.
So I was overcome by the natural urge of every programmer who is learning a new technique that they enjoy: I wanted to rewrite everything I ever built with TypeScript.

I don't know exactly why I thought starting with [node-sass-magic-importer](https://github.com/maoberlehner/node-sass-magic-importer), which is one of my bigger projects, was a good idea. The enthusiasm of using my newly acquired TypeScript skills on a real project was just overwhelming.

## Don't ever rewrite your codebase from scratch

For experienced developers it is general knowledge, that rewriting the entirety of your codebase from scratch, is almost always a bad idea. But still we keep doing it again and again. It just seems so tempting to throw away the old, crappy codebase and replace it with a shiny new one.

I also knew it was a bad idea when I started the project of rewriting node-sass-magic-importer from the ground up. But I still found some justifications to warrant my decision to start from scratch.

- **It's all about the learning experience**  
I use my open source projects to learn new things and in the course of this project I wanted to learn more about TDD and TypeScript.
- **A clean codebase allows for more rapid development of new features**  
In the moment of starting the project, I felt like it was impossible to add new features to the existing codebase because of the architectural mistakes I made when building it initially.
- **It will not take a lot of time**  
After all I already had built everything I needed, the only thing I had to do was to rewrite it in TypeScript and fix some architectural problems in the process, how long can it take, right?

In retrospect none of those reasons are valid.

### Learning

Although it is true that I've learned a lot about TypeScript over the course of the last months, I could have achieved similar results using TypeScript for new projects I started or rewriting some of the very small projects I maintain first. And also one of the main things I learned about TypeScript is, that TypeScript is not the best fit for the project at hand.

### Clean code

The more experience I gain, the more I suspect the tail of the clean codebase which allows for more rapid development, to be a myth. First of all, as soon as a codebase reaches a certain complexity, things get messy. And things get messy for reasons other than lazy or bad programmers. This does not mean you should not strive for writing clean code and having a clean codebase, just consider that no matter how hard you try, your codebase will never be perfect.

Although I tried my best to build a codebase which is clean (whatever that really means) and easy testable, I'm not satisfied with the result. And what's even more important: the time I invested in rewriting the projects codebase (without adding any new functionality whatsoever) could have been spent much more efficient in fixing some architectural mistakes I made and building new features.

Code doesn't have to be perfect. Code has to do it's job. And bugs in your code must be fixed within a reasonable time. That's it. In the end everything your users care about is what they can do with your project and how fast they can do it, the quality of the codebase doesn't matter (to them).

### Time

One simple principle which explains why we almost always underestimate the time it takes to finish complex tasks is the Pareto principle or 80 / 20 rule. Often times finishing the first 80% of a project is easy and fun. We're learning new things and we're getting the things done which we enjoy doing. We're able to finish 80% of the work very fast. But then we realize that there are problems with the new technique we're using and all the tasks that are left are those we delayed doing because we do not enjoy them as much. The last 20% of the work takes up 80% of the time we spend on the project as a whole.

Although I had a lot of fun and I also learned a lot during the first 80% of the project, finishing the last 20% in 80% of the time, felt like work not play. To finish the last 20% of this project, I set myself a rule to work at least half an hour a day, seven days a week, on powering through to bring the project to an end.

## Architectural changes

Apart from rewriting the code from plain new ES2015 to TypeScript, building a TDD ready codebase was another major goal I wanted to achieve.

The old codebase was tested pretty well but only by integration tests. Usually you want to have both: integration tests and unit tests. What I didn't consider is the reason why it is generally a good idea to have both kinds of tests. The reason is: integration tests are much slower than unit tests and you want your tests to be as fast as possible to enable efficient TDD.

The thing is: the integration tests implemented in node-sass-magic-importer are blazing fast, they run in less than a second. Considering this and the fact, that my project (although it has reached a certain complexity) is a pretty small project, it is debatable if unit tests are really a necessity.

- The functions to test are either very tiny or they rely on (already well tested) third party code.
- Making your codebase perfectly testable adds a lot of overhead because you need some kind auf dependency injection.
- Because of the nature of the project some aspects are very hard to test with unit tests, but very easy to test with integration tests.

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like what you read?</h2>
      <p class="c-twitter-teaser__body">
        Follow me to get my latest articles.
      </p>
      <a class="c-button c-button--outline c-twitter-teaser__button" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">
        Find me on Twitter
      </a>
    </div>
  </div>
</div>

## Recap

The next time you're thinking about throwing all your code away and rewrite everything from scratch, keep in mind the 80 / 20 rule. Be aware of the fact that the outcome won't be a perfectly clean codebase like you're imagine it at that moment. Reconsider if it is the best use of your time or if you'll be better off working on new features and refactoring the existing codebase.

I myself already thought about refactoring node-sass-magic-importer from using TypeScript to using plain Node.js (without the need for any build process) but after thinking it through, based on the concerns I listed above, I decided it would not be the best use of my time. But maybe if I... ;)
