+++
date = "2018-12-09T06:13:13+02:00"
title = "Variables in Design Systems"
description = "Are we overusing variables in design systems? In this article I try to articulate my thoughts about using variables in design systems in kind of a dogmatic way."
intro = "Recently, I've been thinking a lot about variables in (Sass based) design systems. My approach with avalanche, and more recently with the design system we're building at work, always was to use variables for everything from spacings to colors and things like border radius..."
draft = false
categories = ["Development"]
tags = ["CSS Architecture", "Sass", "Front-End Architecture"]
+++

Recently, I've been thinking a lot about variables in (Sass based) design systems. My approach with [avalanche](https://avalanche.oberlehner.net/), and more recently with the design system we're building at work, always was to **use variables for everything from spacings to colors and things like border radius for example**. The rule is, that there are no colors or spacings, like margins and paddings, that do not use a variable value.

It has became kind of a dogma. But lately, I've been wondering more and more if it makes sense to use variables for everything. **What kind of problems does it solve to use variables in certain situations?** Does it make the life of all stakeholders easier to use variables for everything or does it just make things more complicated? In this article I'll try to articulate my thoughts about this topic.

## Why use variables in the first place?

There are basically two reasons for using variables that I can think of: to **ensure consistency** and to **keep the codebase DRY**.

### Ensure consistency

Variables can help us to ensure consistency across our design system. By defining a variable `$color-warning` and using it whenever we display a warning message of some kind, we can make certain that the design remains consistent. Otherwise there might be an orange warning popup in one place and a red warning validation message in another place.

### Keeping the codebase DRY

Sticking to the `$color-warning` example – by changing the value of this single variable, we're able to change the color of all warning messages across our application. This is the main reason why variables are such a powerful tool in the tool belt when it comes to building large scale design systems with (S)CSS.

## Why not use variables?

Now that we've reminded ourselves why we use variable in the first place, let's think about some instances were we might use variables for all the wrong reasons.

I tend to use spacing variables in most of my projects. You can see the basic gist of it in the code snippet below.

```scss
$spacing-xxs: 0.25em;
$spacing-xs: 0.5em;
$spacing-s: 0.75em;
$spacing-m: 1em;
$spacing-l: 1.25em;
// ...
```

Let's think a little closer about this example. We start with `0.25em` (which is `4px` at a font size of `16px`) and we're getting bigger and bigger in increments of `0.25em`.

But what's the point of a `$spacing-xxs` variable? **Will we ever change the value of this variable? E.g. from `0.25em` to `0.30em`. Most likely not. So it does not help with keeping our codebase DRY.**

Will our users (or really anybody) notice if the spacing between two items is `0.25em` in one place and the spacing between two different items is `0.35em` in another? Again, the answer is: most likely not. **So those variables don't contribute to consistency either.**

## Other common pitfalls

Imagine we have a variable called `$color-dark-orange` and we're using this variable throughout our application for everything related to displaying warning messages. It's still useful to use a variable because of keeping the codebase DRY but does this variable actually help with consistency? Not really – if somebody adds a new component for showing a warning message, they could easily use another variable like `$color-light-orange`. You can [read more about this topic in one of my previous articles about two tier Sass variables](/blog/two-tier-sass-variables-and-css-custom-properties/).

## Alternatives to using variables

Don't get me wrong, I'm not advocating against using any variables at all. **There are very good reasons for using variables in a lot of circumstances. But in some situations, there might be better alternatives.**

### Using patterns instead of variables

Let's go back to the example of spacing variables. In order to ensure consistency you might want to have a spacing of `0.5em` every time you have an image on the left and some text to its right.

```scss
// Using variables.
$spacing-s: 0.5em;

.comment-avatar-image {
  border-radius: 50%;
  // ...
}

.comment-text {
  margin-left: $spacing-s;
  // ...
}

.teaser-image {
  // ...
}

.teaser-text {
  margin-left: $spacing-s;
  // ...
}

.article-list-image {
  // ...
}

.article-list-text {
  // Uuups, somebody choose the wrong variable ¯\_(ツ)_/¯
  margin-left: $spacing-m;
  // ...
}
```

There's not only one but three problems with the example above. First of all, as we can see with the `.article-list-text` example, **in this case, using variables does not help with consistency at all**. Second, if we decide that we want to have `1em` spacing between images and text throughout our application, **we can't simply change the value of `$spacing-s` because that would change every component (which might be completely unrelated to this pattern) where we're using this variable**. Which takes us to the third issue with this approach: it is everything but DRY. **In order to change the spacing, we have to change every implementation of this pattern.**

```scss
// Using the Media Object pattern.
// http://www.stubbornella.org/content/2010/06/25/the-media-object-saves-hundreds-of-lines-of-code/

.media-figure {
  // ...
}

.media-body {
  margin-left: 0.5em;
  // ...
}

.comment-avatar-image {
  border-radius: 50%;
  // ...
}
```

Although we're not using any variable at all, using the Media Object pattern not only makes our code a lot more DRY but also guarantees consistency across our application (as long as we enforce the usage of this pattern).

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like what you read?</h2>
      <p class="c-twitter-teaser__body">
        Follow me to get my latest Vue.js articles.
      </p>
      <a class="c-button c-button--outline c-twitter-teaser__button" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">
        Find me on Twitter
      </a>
    </div>
  </div>
</div>

## Wrapping it up

There are a lot of situations were variables are tremendously useful, but we should not follow the dogma of using variables for everything everywhere. There are certainly situations in which other strategies for avoiding repetition can be a lot more effective.
