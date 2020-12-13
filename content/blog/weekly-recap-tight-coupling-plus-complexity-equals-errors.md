+++
date = "2019-12-15T06:50:50+02:00"
title = "Weekly Recap: Tight Coupling + Complexity = Errors"
description = "My personal recap of the last week about code complexity and coupling, code sharing between client and server, and code duplication and abstraction."
intro = "This week I thought a lot about two topics: reducing complexity and structuring your codebase and naming things. Recently I listened to an episode of 99% Invisible about what causes errors. Although this episode wasn’t specifically about programming, the basic idea very much applied to what we do in our daily jobs..."
draft = false
categories = ["Development"]
tags = ["Weekly Recap"]
+++

This week I thought a lot about two topics: **reducing complexity** and **structuring your codebase and naming things.**

## Complexity and error mitigation measures

Recently I listened to an episode of 99% Invisible about what causes errors. Although this episode wasn’t specifically about programming, the basic idea very much applied to what we do in our daily jobs. The key message was that **errors are inevitable if you have both tightly coupled and complex systems.** If you want to have fewer bugs, you either have to reduce tight coupling or complexity (or ideally both).

### Brittle Systems because of error mitigation

**Sometimes measures introduced to reduce complexity can have the opposite effect.** One example that was brought up was the Oscar 2017 debacle. Because there were two versions of the envelopes Warren Beatty and Faye Dunaway could give the wrong version the wrong movie.

In programming I often feel like our sophisticated build tools have the potential to do more harm than good. Do you sometimes write pure Node.js or JavaScript code without any build tool like TypeScript or webpack? To me, it feels quite liberating.

Testing is another measure that can lead to more complexity and have the opposite effect of what they promise. Everyone who has worked on a codebase with a flaky test suite knows what I’m talking about.

### What to do when both is inevitable?

One question that haunts me is: **what to do when both complexity and tight coupling is (seems) inevitable?** Complexity sometimes can be inevitable when you have to solve complex problems. But it seems sensible to assume that most of the times there are means to avoid tight coupling. Often I feel my knowledge is too limited to find simple and decoupled solutions to complex problems.

## Code sharing between server and client

I investigated with what solutions people came up with for the folder structure of (somewhat) isomorphic web applications. The reason I did so was that I’m not very happy with splitting code in `server`, `client`, and `shared` directories. I think code that belongs together should be colocated. That’s impossible to do when splitting it that way.

I didn’t find a suitable solution for this. One of the reasons for this is that **when not splitting your code, it’s harder to prevent secret configuration like database credentials from leaking into the client-side code bundle.**

## Prefer duplication over the wrong abstraction

Reading a little more about this was a great reminder about a few things. **The key takeaway is that duplication is not when things look the same, but when they do the same.** When you have a piece of code repeating in multiple places, **the right time to refactor is when you know that every time you change it in one place, you have to make the same change in all the other places.**

Two unanswered questions regarding this topic: what to do if you have code that repeats a lot but is always just slightly different? Where to put newly created abstractions? I always feel bad when I create a new file in my utilities folder.

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like What You Read?</h2>
      <p class="c-twitter-teaser__body">
        Follow me to get my latest articles.
      </p>
      <a class="c-button c-button--outline c-twitter-teaser__button" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">
        Find me on Twitter
      </a>
    </div>
  </div>
</div>

## Wrapping it up

This week there was nothing new and groundbreaking, but a few exciting thoughts about those crucial topics crossed my mind.

Additionally, I also thought about rules for naming (Vue.js) components, but I didn’t finalize my thoughts yet.

## References

- [99% Invisible, Episode 379: Cautionary Tales](https://99percentinvisible.org/episode/cautionary-tales/)
- [Sandi Metz, The Wrong Abstraction](https://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction?duplication)
- [Hacker News, Discussion: Prefer duplication over the wrong abstraction](https://news.ycombinator.com/item?id=12061453)
