+++
date = "2019-12-08T10:01:01+02:00"
title = "Weekly Recap: TDD is dead"
description = "My personal recap of the last week about TDD best practices and misconceptions."
intro = "Last week I did go down the rabbit hole reading about TDD best practices and misconceptions. Everything began with a Twitter discussion about David Heinemeier Hansson's (old) article: TDD is dead. Long live testing..."
draft = false
categories = ["Development"]
tags = ["Weekly Recap", "TDD"]
+++

Last week I did go down the rabbit hole reading about TDD best practices and misconceptions. Everything began with a Twitter discussion about David Heinemeier Hansson's (old) article: [TDD is dead. Long live testing](https://dhh.dk/2014/tdd-is-dead-long-live-testing.html).

## TDD, Where Did It All Go Wrong

Next, I watched a YouTube video of a talk named [TDD, Where Did It All Go Wrong](https://www.youtube.com/watch?v=EZ05e7EMOLM) by Ian Cooper. His talk opened my eyes to what is the *system under test*. It is not a specific method or function; it is a single piece of behavior.

### Red, Green, Refactor

Furthermore, it encouraged me to change my Red, Green, Refactor practice to write *sinful code* in the Red to Green phase and only fine tune it in the Refactor phase. I frequently catch myself to try too hard to write clean code before refactoring. But it is crucial to fully understand the problem and the solution to the problem before trying to write clean code.

### Key takeaways

- Writing a test should be like writing a story about how the public API of the system under test should look.
- The public API can be a part of the UI the user interacts with or a module that is exported in a Node.js or JavaScript codebase.
- Don't make things public to test them (don't export a function in a JavaScript file that is only used inside this file).
- Acceptance testing has a huge maintenance burden, and stakeholders other than QA and programmers usually don't participate (as they should).
- Trigger for adding a new test is when a new requirement must be implemented.
- During development, it can make sense to write a test for private APIs – those tests should be deleted and not checked into version control.

## More about testing

Additionally, I read about [the problem with acceptance testing](https://www.jamesshore.com/Blog/The-Problems-With-Acceptance-Testing.html) and how [TDD changed the life of Eric Elliott](https://medium.com/javascript-scene/tdd-changed-my-life-5af0ce099f80).

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

Some of the things I read about this week, I already knew, but it was a great reminder. Overall, my thinking about practicing TDD changed quite a bit. I try to improve my Red, Green, Refactor discipline, and how to determine the system under test.

## Resources

[David Heinemeier Hansson, TDD is dead. Long live testing.](https://dhh.dk/2014/tdd-is-dead-long-live-testing.html)
[Ian Cooper, TDD, Where Did It All Go Wrong](https://www.youtube.com/watch?v=EZ05e7EMOLM)
[James Shore, The Problems With Acceptance Testing](https://www.jamesshore.com/Blog/The-Problems-With-Acceptance-Testing.html)
[Eric Elliott, TDD Changed My Life](https://medium.com/javascript-scene/tdd-changed-my-life-5af0ce099f80)
