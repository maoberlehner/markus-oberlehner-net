+++
date = "2020-01-19T07:33:33+02:00"
title = "Weekly Recap: Single Parameter Object and Craftsmanship vs. Engineering"
description = "My personal recap of the last week with thoughts about the Single Parameter Object pattern and craftsmanship vs. engineering."
intro = "The last week was, on the one hand, a busy week and, on the other hand, a slow week when it comes to learning new things. One topic that comes up again and again in my daily programming work is the handling of function parameters: Is it a good idea to always use a single object as the only parameter for functions?"
draft = false
categories = ["Development"]
tags = ["Weekly Recap"]
+++

The last week was, on the one hand, a busy week and, on the other hand, a slow week when it comes to learning new things. One topic that comes up again and again in my daily programming work is the handling of function parameters: **Is it a good idea to always use a single object as the only parameter for functions?**

Another recurring theme for me is what motivates me to code? I think it's the feeling of craftsmanship; **making something that is beautiful not only in what it does, but in itself.**

## Single Parameter Object

I was recently reminded of a Tweet by [Shawn Swyx Wang](https://twitter.com/swyx/status/1198632709834326021) because I am currently trying to use an object as the only parameter for functions by default. But sometimes I experience borderline cases where I wouldn't say I like it much.

> If a function requires one or more parameters, always provide a single object that provides all necessary parameters as properties.

That's the simple rule I try to follow. Next, you see a few examples of how this can look like in practice.

```js
// With a single parameter.
const id = 1;
doSomething({ id });

// With a single parameter which itself is an object.
const user = { id: 1 };
doSomething({ user });

// With multiple parameters.
const id = 1;
const label = 'Lorem Ipsum';
doSomething({ id, label });
```

In these simple examples, it feels pretty natural to always stick to this rule. It may seem unnecessary to use an object in the first and second examples. Still, I think the advantage of flexibility in case you need to add new parameters later, outweighs the minor inconvenience.

```js
// Start with two parameters ...
calculateTotal({ price, taxRate })
// ... add addtional parameters as needed.
calculateTotal({ price, taxRate, discount })
```

When it starts to feel weird to follow this rule, it is in cases where you have one parameter that is *The Thing* and some other parameters that are mostly optional configuration options.

```js
// `resolveReferences` is optional!
getUser({ id, resolveReferences: true })
// vs.
getUser(id, { resolveReferences: true })
```

In this example, `id` is *The Thing*. If you were reading it in natural language, you would say: *get the user for this ID, and I may ask you also to resolve references while you at it.*

I can't say why, but the second example feels much more natural to me. In cases where you usually only use the first parameter and only sometimes pass additional parameters to change the default behavior, the second example seems much cleaner.

The problem with this is that it's tough to make a rule that states that you can use multiple function parameters in cases where *The Thing* exists because it's hard to make a rule that specifies what qualifies as *The Thing*.

```js
// Allow both to get a user by ID ...
getUser({ id })
// ... or UUID
getUser({ uuid })
```

Another challenge is that if it is possible to get a user by either `id` or `uuid`, we suddenly have two *Things*. And now, the single object-parameter pattern becomes beneficial again.

## Craftsmanship vs. Engineering

One aspect of programming or even work in general that I find very frustrating is **the need to be efficient at all costs.** That only the result counts. Only what you produce, but not how it is done. Only the functionality is important, but not how elegant the solution is.

Two tweets made me think about this topic. In the first tweet, [Mario Fusco says that we need to stop thinking about programming as a craft, but as an act of engineering](https://twitter.com/mariofusco/status/1216044413442498560). And in another tweet, [Shawn points out the difference between technicians and engineers](https://twitter.com/swyx/status/1213801962900271106).

Although I see myself mainly as an engineer, **I am also a craftsman.** And contrary to what Mario's tweet suggests, I don't think that's mutually exclusive. **Great craftsmen, poets, and artists have processes to achieve continuous success.**

Maybe it's just semantics and interpretation, but for me, engineering is all about efficiency. **Efficiency is essential, but I find it soul-eating if it is not backed up by the creativity and appreciation of small details that come with being a craftsman.**

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

It may seem like a waste of time to think about details such as which parameter style should be used. But having systems in place instead of starting from scratch every time you need to make a decision is very beneficial for moving fast and saving mental capacity for more relevant programming tasks.

**Seeing our profession as a craft that involves creativity as well as thoughtful engineering can change the perspective on how we do our work.** I prefer to see the code itself as a vital output of my work, and not just a means to an end, although I am aware that this is against the current zeitgeist.
