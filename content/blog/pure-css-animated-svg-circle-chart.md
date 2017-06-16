+++
date = "2017-06-15T16:36:01+02:00"
title = "Creating a pure CSS animated SVG Circle Chart"
description = "Creating an animated SVG Circle Chart with pure CSS. A detailed explanation of how to build an SVG circle chart without using JavaScript."
intro = "Recently at work we faced the task of creating an animated SVG circle chart. At first it didn't strike me as a huge challenge but after playing around with a JavaScript powered solution that was provided to us, and me setting the goal of finding a solution that works without JavaScript, my colleagues and I came to the conclusion that a little JavaScript is necessary to animate the fill state of the circle..."
draft = false
categories = ["Development"]
tags = ["Pure CSS", "CSS", "SVG"]
+++

Recently at work we faced the task of creating an animated SVG circle chart. At first it didn't strike me as a huge challenge but after playing around with a JavaScript powered solution that was provided to us, and me setting the goal of finding a solution that works without JavaScript, my colleagues and I came to the conclusion that a little JavaScript is necessary to animate the fill state of the circle.

Although I usually love JavaScript and most of what I do at work and in my free time has something to do with JavaScript, there are situations where I also hate JavaScript – sometimes. Every time I think something should be done with pure HTML or SVG and CSS and it seems to be impossible to do it without JavaScript, I hate JavaScript.

So after not really solving the problem of an animated circle chart in a satisfying way, I couldn't sleep last night. It was somehow clear to me that this has to be solved using plain CSS and SVG. And I really had the feeling that it could be done using only those two techniques. I was lying in bed thinking about possible solutions until I had the first enlightenment how the problem could be at least simplified. I walked into my living room to grab my laptop and started hacking.

## Part 1: Math is hard
First of all let me explain how you can change the length of the stroke of an SVG circle which is filled. You basically need to modify two attributes: `stroke-dasharray` and `stroke-dashoffset`. The `stroke-dasharray` attribute usually controls the pattern of dashes and gaps used to stroke paths, but if you set it to a value which represents the full circumference of the circle, you can use it in combination with `stroke-dashoffset` to limit the length of the stroke.

<p data-height="380" style="height:320px;" data-theme-id="0" data-slug-hash="gRLrpx" data-default-tab="html,result" data-user="moberlehner" data-embed-version="2" data-pen-title="Part 1: Math is hard (Pure CSS animated SVG Circle Chart)" class="codepen">See the Pen <a href="https://codepen.io/moberlehner/pen/gRLrpx/">Part 1: Math is hard (Pure CSS animated SVG Circle Chart)</a> by Markus Oberlehner (<a href="https://codepen.io/moberlehner">@moberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

In the example above you can see the math involved for calculating the value for the `stroke-dashoffset` attribute to represent a circle which is filled 25%.

As you might remember from school, the formula to calculate the circumference of a circle reads as: `2 * π * Radius`. Knowing the circumference of our circle we can calculate the length that needs to be filled to represent a certain percentage value. The formula is `Circumference * (100 - Percentage to fill) / 100`.

Although this is not exactly NASA level math, it makes understanding the code and changing the percentage value a unnecessary hard task to do.

Back to my nightly adventures. The idea – which suddenly crossed my mind when I was lying in bed – to fix this circumference problem is so simple, I guess some of you already figured it out while reading the last paragraph: we have to change the radius of the circle so that the formula `Circumference * (100 - Percentage to fill) / 100` equals `Percentage to fill`.

The ultimate formula to rule all complicated SVG circle math problems once and for all reads as follows: `100 / (π * 2)`.

<p data-height="320" style="height:320px;" data-theme-id="0" data-slug-hash="rwWePx" data-default-tab="html,result" data-user="moberlehner" data-embed-version="2" data-pen-title="Part 1.2: Make math easy (Pure CSS animated SVG Circle Chart)" class="codepen">See the Pen <a href="https://codepen.io/moberlehner/pen/rwWePx/">Part 1.2: Make math easy (Pure CSS animated SVG Circle Chart)</a> by Markus Oberlehner (<a href="https://codepen.io/moberlehner">@moberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

After recalculating all the values of our circle to follow the magic number which is the result of our beautiful formula, setting the percentage value is a much easier task to do. To calculate the value for the `stroke-dashoffset` attribute we can use the simplified formula `100 - Percentage to fill`. This is still not perfect, because ultimately we should be able to use the value `25` to fill the circle to 25% but it is a move in the right direction. We're going to fix this issue later, trust me.

## Part 2: Animating to an inline value
Although the math problem was a minor inconvenience when dealing with this issue, the main reason why the usage of JavaScript seemed inevitable was because usually when animating things with CSS you're animating from a fixed starting value to a fixed end value. Because of the technical circumstances in which this problem had to be solved, for our circle chart to work, we had to set the fill percentage inline in the SVG code or passing it to the JavaScript code which handles the circle chart module.

Using the first approach, passing the percentage value directly into the SVG code, seemed to prevent the possibility of using only CSS to solve this problem. Passing the value to the JavaScript code contradicts our mission fundamentally.

Spurred by the victory over a primary school math problem, I did the unthinkable and actually read the [documentation of the CSS "animation" property](https://developer.mozilla.org/en/docs/Web/CSS/animation). And there it was waiting for me, this magic property called `animation-direction`.

<p data-height="320" style="height:320px;" data-theme-id="0" data-slug-hash="jwVraW" data-default-tab="html,result" data-user="moberlehner" data-embed-version="2" data-pen-title="Part 2: Animating to an inline value (Pure CSS animated SVG Circle Chart)" class="codepen">See the Pen <a href="https://codepen.io/moberlehner/pen/jwVraW/">Part 2: Animating to an inline value (Pure CSS animated SVG Circle Chart)</a> by Markus Oberlehner (<a href="https://codepen.io/moberlehner">@moberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

Setting the `animation-direction` to `reverse` plays the animation backwards. Instead of ending the animation with the value defined in the CSS keyframe animation it begins with this value. The `stroke-dashoffset` in the keyframe animation is set to `100` which means the stroke is not filled at all. This is the starting point and the animation ends with the value which is set inline in the SVG, which is `75` which, based on the formula we came up in Part 1, represents 25%.

## Part 3: Let's get crazy
We already have achieved a lot. The math is easier and we are able to animate the circles fill status with CSS alone. So basically we have already accomplished our mission, we eliminated the need for JavaScript to achieve our goal of an animated SVG circle chart. But there are still some problems with our current solution.

### The Templating Problem
A problem which still remains is, that we can't easily set the percentage value with a limited templating language like Handlebars (which we are rendering both on the server and in the client if necessary). Handlebars does not allow calculations in templates so we can't render the Handlebars template giving it a parameter of `25%` and do the math inside the template. This was one of the major concerns when implementing this in our system. This seems like a minor problem but in fact it is a major one. It either means you have an ugly API for using this module, requiring you to pass the calculated `stroke-dashoffset` value to the template, or there is no way around using JavaScript.

To solve the templating problem in a satisfying way, it must be possible to pass the percentage value we want to show, directly to the Handlebars template. This was a hard nut to crack but after inventing one of the most world changing math formulas since `E = mc²` and reading two short paragraphs of documentation, nothing seemed to be impossible anymore.

This time I can't offer a clever solution process like consulting [MDN](https://developer.mozilla.org) or even using advanced math. I toyed around with my code and discovered that setting the value for the `stroke-dashoffset` property to `125` fills the circle by 25% but in the opposite direction. After consulting Stack Overflow on how to mirror elements in CSS (you didn't expect me to actually know that, did you?) I was almost there.

<p data-height="320" style="height:320px;" data-theme-id="0" data-slug-hash="LLbZKX" data-default-tab="html,result" data-user="moberlehner" data-embed-version="2" data-pen-title="Part 3: The Templating Problem (Pure CSS animated SVG Circle Chart)" class="codepen">See the Pen <a href="https://codepen.io/moberlehner/pen/LLbZKX/">Part 3: The Templating Problem (Pure CSS animated SVG Circle Chart)</a> by Markus Oberlehner (<a href="https://codepen.io/moberlehner">@moberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

Setting the `transform` property to `scale(-1, 1)` to mirror the circle element, makes it possible to pass the actual percentage value `25` to our Handlebars template to fill the circle to 25%. The minor flaw of having to set `stroke-dashoffset` to `125` when we actually want to fill the circle by 25% remains, but I'm OK with that.

You might think now we're done, but there is one Problem still remaining.

### Negative values
If you can't outright avoid using negative values, there is no perfect and elegant solution to this problem. Passing a negative number to our circle chart module would result in `stroke-dashoffset="1-25"` which does not work. The solution I came up with is, that you have to pass a second parameter to the module to display a negative value. The parameters passed to the template might look something like this: `{ percentage: 25, negative: true }`. If the `negative` parameter is set to `true` a modifier class, which resets the mirroring which we applied in the previous step, is added to the circle element with the effect of filling the circle in the opposite direction, representing a negative value.

## Wrapping it up
It was a lot of fun and a great learning experience coming up with a CSS only solution for animating an SVG circle chart. The following pen includes all the features and I tried to add some useful comments to make it easier to understand how all the CSS properties work together.

<p data-height="640" style="height:640px;" data-theme-id="0" data-slug-hash="jwVWQz" data-default-tab="html,result" data-user="moberlehner" data-embed-version="2" data-pen-title="CSS only animated SVG Circle Chart" class="codepen">See the Pen <a href="https://codepen.io/moberlehner/pen/jwVWQz/">CSS only animated SVG Circle Chart</a> by Markus Oberlehner (<a href="https://codepen.io/moberlehner">@moberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
