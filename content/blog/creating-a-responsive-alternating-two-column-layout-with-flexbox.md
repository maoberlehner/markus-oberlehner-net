+++
date = "2018-09-09T06:05:05+02:00"
title = "Creating a Responsive Alternating Two Column Layout with Flexbox"
description = "Learn how to build an alternating two column layout with text on one side and an image on the other side with Flexbox."
intro = "Last week a Tweet by Benjamin De Cock about how to achieve a two column layout with CSS Grid popped up in my timeline. This reminded me of my own journey of creating a two column layout featuring the image left / text right, text right / image left pattern, I've gone through very recently..."
draft = false
categories = ["Development"]
tags = ["CSS Architecture"]
+++

Last week a Tweet by Benjamin De Cock about how to achieve a two column layout with CSS Grid popped up in my timeline.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Quick example of an alternating two column layout made with CSS Grid: <a href="https://t.co/IwQFyiyh6l">pic.twitter.com/IwQFyiyh6l</a></p>&mdash; Benjamin De Cock (@bdc) <a href="https://twitter.com/bdc/status/1037007612678561792?ref_src=twsrc%5Etfw">4. September 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

This reminded me of my own journey of creating a two column layout featuring the image left / text right, text right / image left pattern, I've gone through very recently.

## Why is this even a problem to think about?

Some people might wonder: whats so special about this, isn't this quite easy to do with CSS Grid, Flexbox, Floats or even good old Tables? Yes and no, but in the days of responsive design: mostly no.

Sure, it's very easy to do, even with ancient methods like using Tables or Floats, and, as we can see in the tweet I've linked above, it's even easier to do with modern technologies, assuming your website is always the same width (ahh.. the good old times). But responsive design, as we all know, has changed everything (thanks Ethan Marcotte).

Considering all kinds and sizes of devices, which might be rendering our layout, this becomes a much harder problem to solve. Your first instinct might be to use Media Queries and you're right, you kinda can solve this problem pretty easily using Media Queries, but it'll be a fragile solution. Next you might think, now that we have CSS Grid this must be easy to solve, right?

## Why CSS Grid isn't a panacea to all problems

The thinking of many frontend developers goes as following: Table layouts < Float layouts < Flexbox layouts < CSS Grid Layouts. But this thinking is flawed. First of all, luckily, Table- and Float layouts are a thing of the past. Tables are fine for displaying tabular data and floats are fine for text floating around an image or some other content inside a box, but that's it.

**Flexbox on the other hand isn't going anywhere. CSS Grid is not meant to be a replacement for Flexbox.** Although there may be some overlapping in functionality, they both do different things very well.

**CSS Grid is best suited for the overall layout of your page.** Let's say you have a header, a sidebar on the left, the content area, a sidebar on the right and a footer, that's what CSS Grid is good at. But with CSS Grid, oftentimes you have to use Media Queries if you want to change the layout of your page in the case the content does not fit anymore on smaller screen sizes – it's oftentimes not very *flexible* in that regard.

## What's the problem with Media Queries?

One of the biggest problems of Media Queries is that they're tied to the viewport size. This is good enough for changing the overall layout of a page from using a single column on a small screen device to using more and more columns as the available space is growing (which is exactly when you should absolutely use CSS Grid and Media Queries). **But it's really bad when you're using components as separate building blocks which can be reused in various places and which have to adapt dynamically to its contents.**

A two column layout component might need to wrap to a single column layout at a certain screen size in one place of your application but in another area of you application the same two column component is located inside a narrow sidebar and it has to switch to a single column layout much earlier.

In the future, we might have Container Queries which are basically Media Queries but tied to the container width instead of the viewport width. And I very much look forward to this technique but in the case of the two column layout we're talking about, they're not the best solution either.

## What is Flexbox better at than CSS Grid?

Flexbox is really good in scenarios when the layout should be *flexible* in the case the available space either shrinks or grows and it should adapt to its content. Although there are [situations where CSS Grid too, can handle this very well,](https://twitter.com/ddprrt/status/863014813684957184) **in general, your first instinct should be to use Flexbox if you have to build a component which should adapt to how much space is available to it and how much space its content needs.**

In the following CodePen, you can see how to solve the responsive alternating two column layout in a way that **the layout will automatically adapt to how much space is available to the component.**

<div class="c-content__broad">
  <p data-height="450" data-theme-id="0" data-slug-hash="XPeXay" data-default-tab="result" data-user="maoberlehner" data-pen-title="Responsive Alternating Two Column Layout with Flexbox" class="codepen">See the Pen <a href="https://codepen.io/maoberlehner/pen/XPeXay/">Responsive Alternating Two Column Layout with Flexbox</a> by Markus Oberlehner (<a href="https://codepen.io/maoberlehner">@maoberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>
  <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
</div>

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

There are certainly situations where using CSS Grid with Media Queries to solve this problem is a straight forward and good enough solution. But if you're working with components and you want to make them as reusable as possible, you have to build flexible components which are able to adapt to the space, which is available to them, automatically. This is where using Media Queries just doesn't cut it anymore and when Flexbox shows it's strength and why it's still useful in the time of widespread CSS Grid support in modern browsers.
