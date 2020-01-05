+++
date = "2020-01-05T08:48:48+02:00"
title = "Weekly Recap: Playing with State Machines, Complexity and Best Practices"
description = "My personal recap of the last week about playing with State Machines, the definition of the term complexity in programming and (code review) best practices."
intro = "The last couple of weeks, David Khourshid seemed to be everywhere. He appeared on both the Syntax FM and the Full Stack Radio podcast. And in both, he spoke about the advantages of state machines..."
draft = false
categories = ["Development"]
tags = ["Weekly Recap"]
+++

The last couple of weeks, [David Khourshid](https://twitter.com/DavidKPiano) seemed to be everywhere. He appeared on both the Syntax FM and the Full Stack Radio podcast. And in both, he spoke about the advantages of state machines. I was interested in that, and I've been playing around with the concept for the last two weeks.

## Testing State Machine powered Vue.js components

What interested me most about State Machines was the automated testing workflow they enable. So I especially took a closer look at that aspect.

While playing around with the concept, I quickly realized how superior State Machines could be in certain situations. But I was not thrilled with the model-based testing. It is cool, but you can only automate so much; you still have to write a lot of test code yourself. But that's ok. Also, you have to be disciplined to not rely on the automatically generated test descriptions, but write your own.

## What is simple or complex?

[Hillel Wayne](https://twitter.com/hillelogram) started [a fascinating Twitter thread about the terms “simple” and “complex” in programming](https://twitter.com/hillelogram/status/1211433465956196352).

My definition of complex code: to solve a problem, you first have to understand another part of the code, to understand the other part, you have to understand another part,... The more levels you need to understand, the more complex the code is.

A possible solution is decoupling. But writing decoupled code is difficult. One must first thoroughly understand the problem. Additionally, there is always the danger of choosing the wrong abstractions to decouple your code. This can make things even worse.

What you should strive for are clear boundaries between the different functionalities of your application. **Ideally, you could, at least in theory, publish parts of your application as separate npm packages, and it would be perfectly fine to use them outside the context of your application.**

If you do this correctly, it is okay if some of your modules are more complex internally, if they solve complex problems. As long as the public API is well tested, this does not affect the overall complexity of your application.

<blockquote>
  Making React internals simple is not a goal. We are willing to make React internals complex if that complexity lets product developers keep their code easier to understand and modify.
  <footer>
    <cite>
      <small>— <a href="https://react.christmas/2019/24">Dan Abramov</a></small>
    </cite>
  </footer>
</blockquote>

The same principle may apply to certain parts of your application.

It's incredibly challenging to get this right. But it also has the most significant impact on how fast you can move forward and scale with more developers.

## Google engineering best practices

Thanks to [a tweet from Josh Comeau](https://twitter.com/JoshWComeau/status/1212714893431971840), I discovered the goldmine, which is the [Google's Engineering Practices documentation](https://google.github.io/eng-practices/).

I started reading [the article about the speed of code reviews](https://google.github.io/eng-practices/review/reviewer/speed.html), but also followed most of the links in the article and I discovered one gem after another.

Funnily enough, even in these very well-written documents, it's hard to understand what they mean by terms like *complexity,* *code health,* and *code quality.* But they offer two explanations of what they mean by saying code is *complex.* In my opinion, both are somewhat wishy-washy.

> “can’t be understood quickly by code readers.”

> “developers are likely to introduce bugs when they try to call or modify this code.”

One mistake I have made in the past when doing code reviews is being too focused on little details.

> In general, reviewers should favor approving a CL once it is in a state where it definitely improves the overall code health of the system being worked on, even if the CL isn’t perfect.

I try to follow this advice when doing future code reviews.

## UI before API before Code

[Dan Abramov has written an exciting piece about the principles of the React team](https://react.christmas/2019/24). One of them is UI before API.

The way I see it, the API of a piece of code can be seen as its UI, if we recognize that programmers are users (of the code) too. So, in my opinion, the next step is API before code.

Before we write code, we should think about how the users of our code (other programmers or our future selves) want to use it. Maybe it seems like a no brainer, but at least I often do it the wrong way round. Sometimes I think about abstractions and patterns of the code I want to write *before* I think about the public API.

This is a good reason for TDD: it forces you to think about the public API first.

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

## References

- [David Khourshid, Model-Based Testing in React with State Machines](https://css-tricks.com/model-based-testing-in-react-with-state-machines/)
- [Frederick P. Brooks, No Silver Bullet](http://worrydream.com/refs/Brooks-NoSilverBullet.pdf)
- [Rich Hickey, Simple Made Easy](https://www.infoq.com/presentations/Simple-Made-Easy/)
- [Dan Abramov, What are the React Team Principles?](https://react.christmas/2019/24)
- [Google, Speed of Code Reviews](https://google.github.io/eng-practices/review/reviewer/speed.html)
