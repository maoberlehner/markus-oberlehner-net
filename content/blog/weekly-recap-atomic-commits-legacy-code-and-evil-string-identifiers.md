+++
date = "2020-02-09T07:44:44+02:00"
title = "Weekly Recap: Atomic Commits, Legacy Code and Evil String Identifiers"
description = "My personal recap of the last week with thoughts about how to Git, legacy code and string identifiers."
intro = "Last week I had two insights: sanitizing data as early as possible can make it much easier to reason about your code. And reducing the complexity of your components, the deeper down they are in the component tree can lead to a cleaner architecture..."
draft = false
categories = ["Development"]
tags = ["Weekly Recap"]
+++

Over the last two weeks, I've been thinking about how to Git, legacy code, why our profession is terrible at what we do, and why string identifiers are evil.

## Git: atomic commits vs squashing

The topic of how to use Git effectively is always on my mind. [I'm a Git pedant](https://markus.oberlehner.net/blog/git-the-pedantic-way/), so I have a pretty strong opinion on the subject.

As so often, it was [a tweet from Jake Archibald](https://twitter.com/jaffathecake/status/1222478385168949248) that got me thinking. He argues that **a pull request should represent a unit of work.** Commits that are only there to incorporate feedback from the code review usually don't contribute to a better understanding of the code in retrospect. I couldn't agree more.

This brings me to the topic of atomic commits vs. large commits. **In theory, atomic commits are the way to go.  In practice, I keep seeing the pattern that this leads to useless commit messages.** If you make dozens of commits a day, there's simply no way to write meaningful messages for each of them. This can be fine during development, but it is counterproductive if these commits end up in the master branch. The only thing worse than no commit message is a commit message like `rename variable`. For someone who later attempts to better understand the code through the commit messages, this message is worthless. Think about your commit messages as part of your codebase (because they are): just as you don't want to have lines of code in your codebase that do nothing, **you don't want to have commit messages that carry no meaning.**

In my opinion, it's better to have fewer commits with carefully crafted commit messages. **Usually, large commits are a symptom of another problem: too large features, or generally a too broad scope for the unit of work.**

**Reduce the scope of the features you are working on so that you can keep your commits at a more granular level.**

## All code is legacy code

Addy Osmani has posted a [link](https://mobile.twitter.com/addyosmani/status/1223554082125668352) to a [discussion on reddit](https://www.reddit.com/r/programming/comments/8f2lzu/theres_a_reason_that_programmers_always_want_to/) about an [old article by Joel Spolsky](https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/). Although I agree very much with the essence of the article, I usually find it very difficult to follow his advice. Often it is hardly possible to isolate certain parts of an application so that you can refactor them bit by bit. This is particularly true for applications that are in urgent need of a major refactoring effort, as everything is very tightly coupled.

## Why are we so bad at what we are doing?

In the aftermath of the Iowa caucus debacle, someone posted the [relevant xkcd](https://xkcd.com/2030/) on Twitter. Of course, it is only a comic strip, but I think there is some truth in it.

We are building more and more complex applications using more and more complex processes and tools. We used to write plain JavaScript, connect to a server via FTP, and "deploy" a new version of our app. I understand that this line of argumentation that everything used to be better and easier is very weak. Nobody hinders us from working the way we did 10 years ago. The applications we wrote then were at least as bad as the code we write today. But in my opinion, we didn't draw the correct conclusions. Instead of reducing the complexity, we added additional layers of complexity, and thus gained very little or probably made some things even worse.

**I think the main reason why we write lousy code is complexity. Reducing complexity is the key to a maintainable codebase.** The trick is how to break down complex processes and make them simple. And I keep failing at that.

## String identifiers

I am not quite sure whether I use the term "string identifier" correctly here. I often discover areas in the codebases I'm working on where a change in one part of the application silently breaks something in another, very different part of the application, with no way of knowing anything about it except by testing it manually (or automatically).

```js
// A good example for what I mean are strings
// for mutation names in something like Vuex.

// blog-post.js
export default {
  mutations: {
    UPDATE: () => { /* ... */ },
  },
};

// some-place-in-your-application.js
// If 'UPDATE' is renamed to 'UPDATE_BLOG_POST'
// this silently breaks.
store.commit('blog-post/UPDATE');
```

As long as your application is very simple, this is not a big problem, because manual testing of all functionalities takes 5 minutes. However, for large applications, this quickly becomes a huge problem. Manual testing of all features takes several hours, and even running automated tests can take an hour or more. If you do not have automated acceptance tests in place at this point, and you have many such implicit links throughout your application, you are screwed.

```js
// Variables to the rescue:

// blog-post.js
export const UPDATE = 'UPDATE';

export default {
  mutations: {
    [UPDATE]: () => { /* ... */ },
  },
};

// some-place-in-your-application.js
import { UPDATE } from './blog-post';

// Now if the variable value `UPDATE` is changed
// everything is still fine. If the variable name
// is changed to `UPDATE_BLOG_POST` your build fails.
store.commit(`blog-post/${UPDATE}`);
```

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

## Wrapping it up

Writing high-quality code is hard. It's so hard we constantly fail at it. The only way to keep our applications at least somewhat maintainable is to refactor the areas that are responsible for most errors continuously.
