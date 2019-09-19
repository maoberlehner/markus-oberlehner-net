+++
date = "2017-06-15T16:36:01+02:00"
title = "Creating a Pure CSS Animated SVG Circle Chart"
description = "Creating an animated SVG pie chart with pure CSS. A detailed explanation of how to build an SVG doughnut chart with just CSS animations and no JavaScript."
intro = "Recently at work we faced the task of creating an animated SVG circle chart. At first it didn't strike me as a huge challenge but after playing around with a JavaScript powered solution that was provided to us, and me setting the goal of finding a solution that works without JavaScript, my colleagues and I came to the conclusion that a little JavaScript is necessary to animate the fill state of the circle..."
draft = false
categories = ["Development"]
tags = ["CSS Architecture"]
+++

Recently at work we faced the task of creating an animated SVG pie / doughnut / circle chart. At first it didn't strike me as a huge challenge but after playing around with a JavaScript powered solution that was provided to us, and me setting the goal of finding a solution that works without JavaScript, my colleagues and I came to the conclusion that a little JavaScript is necessary to animate the fill state of the circle.

Although I usually love JavaScript and most of what I do at work and in my free time has something to do with JavaScript, there are situations where I also hate JavaScript – sometimes. **Every time I think something should be done with pure HTML or SVG and CSS and it seems to be impossible to do it without JavaScript, I hate JavaScript**.

So after not really solving the problem of an animated circle chart in a satisfying way, I couldn't sleep last night. It was somehow clear to me that **this has to be solved using plain CSS and SVG**. And I really had the feeling that it could be done using only those two techniques. I was lying in bed thinking about possible solutions until I had the first enlightenment how the problem could be at least simplified. I walked into my living room to grab my laptop and started hacking.

## Part 1: Math is hard

First of all let me explain how you can change the length of the stroke of an SVG circle which is filled. You need to modify the `stroke-dasharray` attribute. The `stroke-dasharray` attribute usually controls the pattern of dashes and gaps used to stroke paths, but if you set it to a dash length which represents the percentage you want to fill and a gap length which represents the full circumference of the circle, **you can use it to display a partially filled circle**.

<p data-height="380" style="height:320px;" data-theme-id="0" data-slug-hash="gRLrpx" data-default-tab="html,result" data-user="maoberlehner" data-embed-version="2" data-pen-title="Part 1: Math is hard (Pure CSS animated SVG Circle Chart)" class="codepen">See the Pen <a href="https://codepen.io/maoberlehner/pen/gRLrpx/">Part 1: Math is hard (Pure CSS animated SVG Circle Chart)</a> by Markus Oberlehner (<a href="https://codepen.io/maoberlehner">@maoberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>

In the example above you can see the math involved for calculating the value for the `stroke-dasharray` attribute to represent a circle which is filled to 25%.

As you might remember from school, the formula to calculate the circumference of a circle reads as: `2 * π * Radius`. **Knowing the circumference of our circle we can calculate the length that needs to be filled to represent a certain percentage value**. The formula is `(Circumference / 100) * Percentage to fill`.

Although this is not exactly NASA level math, it makes understanding the code and changing the percentage value an unnecessary hard task to do.

Back to my nightly adventures. The idea – which suddenly crossed my mind when I was lying in bed – to fix this circumference problem is so simple, I guess some of you already figured it out while reading the last paragraph: we have to change the radius of the circle so that the formula `(Circumference / 100) * Percentage to fill` equals `Percentage to fill`.

**The ultimate formula to rule all complicated SVG circle math problems once and for all reads as follows**: `100 / (π * 2)`.

<p data-height="320" style="height:320px;" data-theme-id="0" data-slug-hash="rwWePx" data-default-tab="html,result" data-user="maoberlehner" data-embed-version="2" data-pen-title="Part 1.2: Make math easy (Pure CSS animated SVG Circle Chart)" class="codepen">See the Pen <a href="https://codepen.io/maoberlehner/pen/rwWePx/">Part 1.2: Make math easy (Pure CSS animated SVG Circle Chart)</a> by Markus Oberlehner (<a href="https://codepen.io/maoberlehner">@maoberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>

After recalculating all the values of our circle to follow the magic number which is the result of our beautiful formula, setting the percentage value is a much easier task to do. We now can replace `dash-length` and `gap-length` in `stroke-dasharray=”dash-length,gap-length”` with values like `25` for the dash length and `100` for the gap length if we want to display a circle which is 25% filled.

## Part 2: Animating to an inline value

Although the math problem was a minor inconvenience when dealing with this issue, the main reason why the usage of JavaScript seemed inevitable was because usually when animating things with CSS you're animating from a fixed starting value to a fixed end value. Because of the technical circumstances in which this problem had to be solved, for our circle chart to work, we had to set the fill percentage inline in the SVG code or passing it to the JavaScript code which handles the circle chart module.

Using the first approach, passing the percentage value directly into the SVG code, seemed to prevent the possibility of using only CSS to solve this problem. Passing the value to the JavaScript code contradicts our mission fundamentally.

Spurred by the victory over a primary school math problem, I did the unthinkable and actually read the [documentation of the CSS "animation" property](https://developer.mozilla.org/en/docs/Web/CSS/animation). And there it was waiting for me, this magic property called `animation-direction`.

<p data-height="320" style="height:320px;" data-theme-id="0" data-slug-hash="jwVraW" data-default-tab="html,result" data-user="maoberlehner" data-embed-version="2" data-pen-title="Part 2: Animating to an inline value (Pure CSS animated SVG Circle Chart)" class="codepen">See the Pen <a href="https://codepen.io/maoberlehner/pen/jwVraW/">Part 2: Animating to an inline value (Pure CSS animated SVG Circle Chart)</a> by Markus Oberlehner (<a href="https://codepen.io/maoberlehner">@maoberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>

Setting the `animation-direction` to `reverse` plays the animation backwards. **Instead of ending the animation with the value defined in the CSS keyframe animation it begins with this value**. The `stroke-dasharray` in the keyframe animation is set to `0 100` which means the stroke is not filled at all. This is the starting point and the animation ends with the value which is set inline in the SVG, which is `25`, representing 25%.

## Part 3: Let's get crazy

We already have achieved a lot. The math is easier and **we are able to animate the circles fill status with CSS alone**. So basically we have already accomplished our mission, we eliminated the need for JavaScript to achieve our goal of an animated SVG circle chart. But there are still some problems with our current solution.

### Values <0%

If you can't outright avoid displaying values lower than 0%, there is no perfect and elegant solution to this problem. Passing a negative number to our circle chart module would result in `stroke-dasharray="-25,100"` which does not work. The solution I came up with is, that **you have to pass an additional parameter to the module to display negative values**. The parameters passed to the template might look something like this:

```js
{
  percentage: 25,
  negative: true
}
```

If the `negative` parameter is set to `true` a modifier class, which mirrors the circle, is applied to the circle element with the effect of filling the circle in the opposite direction, representing a negative value.

Admittedly this is not the most beautiful solution. Depending on the goals and priorities you've set for your project, using JavaScript instead of sacrificing the simplicity of the modules API, might be a better solution in your case.

## Part 4: Internet Explorer strikes back

At this point I thought I was done, but as one of my colleagues noticed, this approach doesn't quite work in Internet Explorer and Edge. Looking up the `transform` property at [caniuse.com](http://caniuse.com/#feat=transforms2d) quickly revealed whats the problem: **Internet Explorer and Edge do not support CSS transforms on SVG elements. But they support using the transform attribute directly in the SVG itself**.

Because setting the transform origin when using the `transform` attribute is not possible, rotating and mirroring an SVG element is a little bit trickier that way: `transform="rotate(-90 16.91549431 16.91549431)"`. We have to use the second and third parameter of `rotate` to rotate the element using its center as origin. Because `scale` does not support setting the transform origin, we have to use `matrix` instead, to mirror the SVG element. The transformation attribute to display negative values, looks like the following: `transform="rotate(-90 16.91549431 16.91549431) matrix(-1, 0, 0, 1, 33.83098862, 0)"`.

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

It was a lot of fun and a great learning experience coming up with a CSS only solution for animating an SVG circle chart. The following pen includes all the features and I tried to add some useful comments to make it easier to understand how all the CSS properties work together.

<p data-height="640" style="height:640px;" data-theme-id="0" data-slug-hash="jwVWQz" data-default-tab="html,result" data-user="maoberlehner" data-embed-version="2" data-pen-title="CSS only animated SVG Circle Chart" class="codepen">See the Pen <a href="https://codepen.io/maoberlehner/pen/jwVWQz/">CSS only animated SVG Circle Chart</a> by Markus Oberlehner (<a href="https://codepen.io/maoberlehner">@maoberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
