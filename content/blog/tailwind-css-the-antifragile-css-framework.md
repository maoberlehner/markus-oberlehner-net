+++
date = "2021-01-24T09:33:33+02:00"
title = "Tailwind CSS: The Antifragile CSS Framework"
description = "Learn about what makes Tailwind CSS antifragile and why it is more robust than BEM in certain situations."
intro = "Tailwind CSS is a divisive issue in the web development world: some love it, others love to hate it. This article is about one specific feature of Tailwind CSS: its antifragility..."
draft = false
categories = ["Development"]
tags = ["CSS Architecture"]
images = ["/images/c_pad,b_rgb:ED8936,f_auto,q_auto,w_1014,h_510/v1542158523/blog/2021-01-24/antifragile-css-framework"]
+++

Tailwind CSS is a divisive issue in the web development world: some love it, others love to hate it. [I already wrote about my thoughts about Tailwind](/blog/thoughts-about-utility-first-css-frameworks/) in a separate article, and there are a ton of articles from different people about [why they like it](https://dev.to/swyx/why-tailwind-css-2o8f) and [why they don't like it](https://dev.to/jaredcwhite/why-tailwind-isn-t-for-me-5c90). This article is about one specific feature of Tailwind CSS: **its antifragility.**

> **Disclaimer:** Although this article focuses on one particular strength of Tailwind, which happens to be a weakness of BEM, I'm not advising using one over the other. I don't use Tailwind extensively, but I admire the dedication of Adam Wathan and his team. Both Tailwind and BEM have their strengths and weaknesses. I still use mostly BEM for my personal and professional projects and try to deal with its shortcomings the best I can.

## The Fragility of BEM

BEM is no framework but a methodology. A set of rules and recommendations. **BEM's biggest weakness is that it very quickly falls apart when not everybody on the team has the same understanding of how to BEM.** People have to follow the rules for it to work. But for people to be able to follow the rules, they first must know and understand them. With BEM, there is always some room for interpretation of specific rules. So even if you have a team of BEM specialists, there is the possibility of some people not following the rules in the eyes of other people and vice versa.

Furthermore, BEM is especially susceptible to [The Wrong Abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction) problem. Constant refactoring is needed to prevent The Wrong Abstraction from making the codebase go to waste. Code reviews can help form a shared understanding of the rules.

BEM can work great for teams and companies that have strict processes and guidelines. If everybody knows of, and sticks to the rules, there is a good chance that using BEM leads to a highly maintainable codebase. **But if chaos breaks loose, you likely end up with an unattainable mess nobody wants to touch.**

## The Antifragile Nature of Tailwind CSS

Chaos is where Tailwind CSS shows its strength. I'm not saying that using Tailwind is inherently chaotic or only for teams where things are chaotic. But other than BEM, which has a hard dependency on order and well-considered processes, Tailwind can do without.

Writing CSS using BEM or other more traditional approaches means that complexity and the size of your code scales linearly. As Shawn Wang mentions in his article, with Tailwind CSS, you get [Sublinear Scaling of CSS: Scale at O(log N), not O(N)](https://dev.to/swyx/why-tailwind-css-2o8f#tldr).

Tailwind can shine when used by teams of people with very diverse CSS skills. It is only a subset of CSS, so there is less to know. Ideally, you also want to follow some best practices, but there are a lot fewer rules, and the damage you can do by not following the rules is limited. **It not being reliant on strict guidelines is what makes Tailwind CSS antifragile: it has a chaos cap.** If you aim for fast-paced development cycles and things (people, features, products) are changing rapidly, antifragility might be a valuable asset that trumps the benefits of more traditional approaches.

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like What You Read?</h2>
      <p class="c-twitter-teaser__body">
        Follow me to get my articles.
      </p>
      <a class="c-button c-button--outline c-twitter-teaser__button" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">
        Find me on Twitter
      </a>
    </div>
  </div>
</div>

## Wrapping It Up

Tailwind is antifragile because the bigger and more chaotic an application gets, the better the CSS bundle will perform compared to CSS authored the traditional class-based way or with a methodology like BEM. BEM might be superior in an orderly world with good communication between team members and efficient processes. Still, most software projects go south one day or the other, and when that happens, Tailwind becomes more robust instead of weaker. Working on a codebase that has become a legacy codebase always sucks, but it probably sucks less with Tailwind.
