+++
date = "2017-03-05T13:17:05+02:00"
title = "A (final?) look at Grid Frameworks"
description = "With CSS Grid Layout around the corner and Flexbox being broadly supported, it seems that the importance of Grid Frameworks is declining."
intro = "With CSS Grid Layout around the corner and Flexbox being broadly supported, it seems that the importance of grid frameworks is declining. Some people even say that Flexbox made grid frameworks obsolete. I disagree..."
draft = false
categories = ["Development"]
tags = ["CSS", "SCSS", "grid", "avalanche"]
aliases = ["/blog/2017/03/a-final-look-at-grid-frameworks/"]
+++

With [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout) around the corner and Flexbox being broadly supported, it seems that the importance of grid frameworks is declining. Some people even say that Flexbox made grid frameworks obsolete. I disagree. As an advocate of OOCSS I'm a fan ob abstracting away complexity as much as possible. Flexbox made it easier to build grid layouts but it is still a good practice to use CSS classes whenever a repeating pattern needs a solution. Elements displayed side by side with a certain gutter around, is a pattern that you'll find many times on almost every website. Thats why in my opinion there is still no way around grid frameworks in the foreseeable future.

## Grid framework history
Showing one element next to another element with CSS used to be a tricky task to do. That's why grid frameworks became as famous as they are in the first place. Let's take a look at some techniques which were used to build grid layouts.

### Floats
The most widely used approach for solving the problem was using either `float: left` or `float: right`. Bootstrap up to version 3 is using this approach. Using floats makes it necessary to use a clearfix, otherwise it is a solid approach at least it was the best we had.

### Inline-block
For some time more and more frameworks utilized `display: inline-block` for building grid frameworks. This works well and doesn't need a clearfix but has the huge downside of needing some kind of hack to remove the spacing on the right side that `inline` and `inline-block` elements have. There were multiple solutions to this, with the most popular being using `font-size: 0` (*Ughh..*) on the parent element.

### Tables
In the dark days of web development, tables were used to create complex layouts. It was a PITA and led to sites which weren't accessible at all, but it worked. Later there was the approach of using `display: table` to create grid layouts. A valid approach and it worked well, but it was only usable in certain situations.

## The modern gold standard
With Bootstrap 4 being on the horizon, it is safe to say that Flexbox powered grid systems are the new gold standard for building grid frameworks.

Let's take a closer look at how the new Bootstrap 4 grid actually works. The Bootstrap grid uses a `.row` class as a wrapper and `.col-*` classes on the grid items.

```scss
// 1. Negative margin to compensate for
//    the gutter of the grid items.
.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px; // [1]
  margin-left: -15px; // [1]
}

.col {
  flex-grow: 1;
  padding-right: 15px;
  padding-left: 15px;
}
```

As you can see Flexbox made it pretty easy to create a powerful grid system. The only “trick” that is used here is the horizontal negative margin to compensate the gutter (padding) on the grid items.

### Problems with the Bootstrap grid
Although the Bootstrap approach works well it is incomplete and highly inflexible.

1. **Only horizontal spacing between items**  
In my opionion a grid framework without vertical spacing just doesn't work. Think mobile first: the grid items are stacked underneath each other on the smallest breakpoint – so the very first thing we actually need is vertical, not horizontal spacing. Even in the official Bootstrap documentation they realize that and add vertical padding manually (but do not compensate it with negative vertical margins).
2. **Fixed width gutters**  
It is not practical to assume that there only will be one gutter size throughout the whole site. But Bootstrap grid only has one gutter size. This can be configured but doing so breaks the system because the `.row` class does only account for the default gutter size.
3. **Overflow issues**  
The usage of gutters on both sides of the grid elements can lead to overflow issues if you are using gutters which are wider than the padding of the default container. Look at the following example, you'll notice a horizontal scrollbar.

<p data-height="265" data-theme-id="0" data-slug-hash="YZWLBL" data-default-tab="result" data-user="moberlehner" data-embed-version="2" data-pen-title="Bootstrap grid overflow issue" class="codepen">See the Pen <a href="http://codepen.io/moberlehner/pen/YZWLBL/">Bootstrap grid overflow issue</a> by Markus Oberlehner (<a href="http://codepen.io/moberlehner">@moberlehner</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## A better approach with single direction margins
Let's take a look at how we can fix the problems of Bootstrap grid to create a more flexible solution.

First of all, let's talk about single direction margins. I'm a huge fan of this approach, what it means is, that you're deciding if you're using either `margin-top` or `margin-bottom` and either `margin-right` or `margin-left` in your project. Once you decided to only use only `margin-top` and `margin-left`, you're going to use **only** top and left margins in your project. The advantage of this approach is, that you don't have to deal with [collapsing margins](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model/Mastering_margin_collapsing). Some developers don't care, they argue that they know there stuff and the concept of collapsing margins is no problem for them. In my opinion this is not a valid standpoint. Sure the seniors in your team may are well aware of the gotchas when dealing with collapsing margins but the juniors most likely aren't even aware of the problem.

But other than that, single direction margins are also solving the overflowing issue you can see in the CodePen example above. And even further, with single direction margins vertical spacing is no problem to implement. The following CodePen uses single direction margins and also adds vertical spacing. This is the same approach used for the [avalanche grid package](https://avalanche.oberlehner.net/packages/object-grid/).

<p data-height="265" data-theme-id="0" data-slug-hash="QpErew" data-default-tab="result" data-user="moberlehner" data-embed-version="2" data-pen-title="avalanche grid awesomeness" class="codepen">See the Pen <a href="http://codepen.io/moberlehner/pen/QpErew/">avalanche grid awesomeness</a> by Markus Oberlehner (<a href="http://codepen.io/moberlehner">@moberlehner</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Final thougts
New techniques like Flexbox and CSS Grid Layout may change how we build and use grid frameworks but they won't replace them. Grid frameworks are here to stay. If you're using an approach like (or similar to) OOCSS you want to abstract away as much complexity as possible. Many grid frameworks and even the widely used Bootstrap grid framework, have no bullet proof solutions for common patterns like vertical spacing or varying gutters. You should be aware of those problems and extend the grid system you're using to deal with those shortcomings – or use a grid system that already has those features in the first place.
