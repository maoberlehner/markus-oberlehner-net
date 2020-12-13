+++
date = "2020-08-30T10:47:47+02:00"
title = "Antifragile Web Development"
description = "Learn more about how to apply some lessons from Nassim Nicholas Taleb's book Antifragile to Web Development."
intro = "Recently I've finished reading the book Antifragile by Nassim Nicholas Taleb. I was fascinated by the concept of antifragility. He uses the term to describe systems that benefit from volatility and disorder. In this article, I would like to reflect on a few ideas I had about applying some of the concepts in the book to web development..."
draft = false
categories = ["Development"]
images = ["/images/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1542158517/blog/2020-08-30/antifragile-web-development"]
+++

Recently I've finished reading the book Antifragile by Nassim Nicholas Taleb. I was fascinated by the concept of antifragility. He uses the term to describe systems that benefit from volatility and disorder. In this article, I would like to reflect on a few ideas I had about applying some of the concepts in the book to web development.

## Do you have evidence for no (long term) harm?

His anecdote about how doctors often prescribe drugs, with potentially serious side effects, to treat minor illnesses, immediately reminded me of how careless we usually are when it comes to adding dependencies to our projects.

When thinking about installing a new dependency via npm, we should not look for evidence that it does harm but for evidence that it does no harm. From a security point of view, you might look at the output of `npm audit`, see no warning or errors, and take that as a sign that the dependency is safe. But that is a fallacy. **The only thing `npm audit` can give you is the certainty that there *are* security holes, not the opposite.**

> Do you have evidence that the library has no security vulnerabilities?

When talking about heavy-hitting dependencies like a front-end framework (Vue, React, etc.) or other dependencies with an enormous footprint like GraphQL and Apollo, there are more things to consider. **We should think about the consequences of adding them to our projects also in terms of maintainability and overall complexity.**

> Do you have evidence, that introducing framework X or library Y into our codebase does not harm maintainability in the long run?

## Via negativa

The most powerful heuristic described in Antifragile, applied to programming, is, in my opinion, *via negativa*. In the book, it is again mainly considered in terms of medical treatment. Instead of prescribing (more) drugs, it might be better to remove unhealthy substances or behaviors from your life, for example eliminating cigarettes or sugary drinks from your diet.

In the programming world, we can apply the same principle to a variety of concerns. One of the more straightforward examples is the performance of our applications and websites. **The best way to make our websites faster is to remove things—for example, images, CSS, or, most pressing, a few 100 kilobytes of JavaScript.**

It seems obvious to apply *via negativa* to performance issues but still, oftentimes, it's recommended to add this or that to make your site faster. For example, add client-side routing or SSR. Don't get me wrong; there are things you can add to your site to make it load more quickly. Still, in the same way, if you worry about your health, you should probably stop smoking instead of taking pills, **you should also first remove a bunch of JavaScript before thinking about adding additional code for making your site faster.**

Another area where this principle can be beneficial is when it comes to making our applications simpler and more maintainable. **Instead of adding layers upon layers of abstraction, it might be the right call to remove a layer instead.**

And last but not least, it turns out that sometimes, **the best we can do to make our applications better is to remove whole features instead of adding more and more functionalities nobody uses anyway.**

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

Although I think it has some flaws, I still can highly recommend reading Taleb's book. Taleb tends to apply his methodology to various areas of life. I recommend you to make sure always to remember that it is, at its core, about risk management and that this is the area of expertise of Taleb. So take everything that he writes about more general topics like what he eats and drinks with a grain of salt. I understand those anecdotes as examples for practical applications of the heuristics described in the book, but not as definitive rules that everybody must follow precisely the way he does.
