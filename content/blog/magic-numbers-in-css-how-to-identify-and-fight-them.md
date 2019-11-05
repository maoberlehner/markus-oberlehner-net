+++
date = "2019-01-27T05:36:36+02:00"
title = "Magic Numbers in CSS: How to Identify and Fight Them"
description = "Learn how to identify magic numbers in CSS design systems and about different strategies to avoid magic numbers."
intro = "Recently I started thinking about magic numbers. Until this point I haven't given much thought to what the term “magic number“ actually means in the context of CSS. I thought about it as basically all numbers in my CSS. The logical solution was to use variables for everything. But having read some articles on this topic and after further thinking about it, I realised that not every number in your CSS code is inevitably a magic one..."
draft = false
categories = ["Development"]
tags = ["CSS Architecture", "Sass", "Front-End Architecture"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1200,h_675/v1532158513/blog/2019-01-27/magic-numbers-twitter"]
+++

Recently I started thinking about magic numbers. Until this point I haven't given much thought to what the term “magic number“ actually means in the context of CSS. **I thought about it as basically all numbers in my CSS. The logical solution was to use variables for everything.**

But having read some articles on this topic and after further thinking about it, I realised that **not every number in your CSS code is inevitably a magic one.**

I’ve already written a couple of articles about variables in CSS and how to deal with them. In most of my articles about this topic I try to put my thoughts in order. This article is no exception to this. The content of this article is pretty similar to one of [my previous articles about variables in design systems](/blog/variables-in-design-systems/) but with an emphasis on the topic of magic numbers.

## What qualifies as a magic number?

In order to qualify as a magic number, a CSS property value must meet one of the following two criteria.

1. The value is related to another (seemingly unrelated) value and it has to be changed if the other value changes.
2. The same value has to be used in multiple locations in your code and it must be ensured that it is always the same value in all of those places.

A prime example for the first case would be a line height specified in `px`. Imagine a font size of `16px` and a line height of `20px`. If the font size is changed, the line height most likely has to change as well.

```scss
.my-class {
  font-size: 16px;
  line-height: 20px; // This is a magic number!
}
```

The second example of magic numbers are values that must be equal in several places. Let’s say you always want to have the same spacing between an image and some text.

```scss
.comment__image {
  // ...
}

.comment__body {
  margin-left: 1em; // Magic!
  // ...
}

.article-teaser__image {
  // ...
}

.article-teaser__body {
  margin-left: 1em; // Magic!
  // ...
}
```

If you change the value in one place, you have to change the value in several other places as well. **This makes those values magic numbers because this relation isn't apparent in any way.**

## What does not qualify as a magic number?

Misidentifying values as magic numbers is almost as common as turning a blind eye to this problem. And it can have equally bad effects on your codebase, but with the difference that one might not even realise that an unmaintainable monster is in the making.

**Values which are not related to anything else and are only used in one place do not qualify as magic numbers.** That does not mean that the same value occurs only once in your entire codebase, but that if it is changed in one place, it does not mean that it needs to be changed in all other places. The values happened to be the same, but not because they were connected in any way.

```scss
.fancy-button__icon {
  margin-right: 0.5em; // Not magic!
}

.fancy-list__item {
  &:not(:first-child) {
    margin-top: 0.5em; // Not magic!
  }

  &::before {
    content: '❤️';
    margin-right: 0.5em; // Not magic!
  }
}
```

In the example above, you can see the same value `0.5em` three times. At first glance, it may seem as if you have spotted a magic number. But this is not the case. These values are identical by pure chance. In the future you might decide to change the `margin-right` of the `fancy-button__icon` but this does not mean the `margin-top` or the `margin-right` values you can see in the `fancy-list__item` example have to change as well.

## Common pitfalls

My first instinct to fight magic numbers was to use variables for everything. **I didn’t really think hard enough about the problem so I didn’t understand it fully** (which is not to say that I completely understand it now).

But although variables definitely can help, they’re no panacea either. **Using generic variables for everything does not solve the problem at all, it does only obfuscate the fact that there is (still) a magic number that is now disguised as a variable.**

Variables serve two purposes: first of all they make a given value reusable and second they can be used as a name for an otherwise arbitrary number or string. In CSS though, oftentimes the second aspect of variables isn’t all that useful, because the property itself is kind of the name of the value and describes what it's good for perfectly fine. However, this does not mean that there are never situations where you want to use a variable to make the meaning of a particular value clearer.

In most of my projects I have a bunch of spacing variables like you can see in the following example.

```scss
$spacing-s: 0.5em;
$spacing-m: 1em;
$spacing-l: 1.5em;
$spacing-xl: 2em;
```

In the past, I simply reached for one of those spacing variables and I felt that I had no magic numbers in my codebase. But in reality, it’s still the same situation I just obfuscated the fact that magic numbers are at play.

```scss
.comment__image {
  // ...
}

.comment__body {
  margin-left: $spacing-m; // Still magic!
  // ...
}

.article-teaser__image {
  // ...
}

.article-teaser__body {
  margin-left: $spacing-m; // Still magic!
  // ...
}
```

As you can see in the example above, we achieved absolutely nothing by using a variable (except for the very rare case that we decide to change the value of `$spacing-m` globally). If I want to change the spacing, I have to change it in several places to stay consistent.

## How to fight magic numbers

Contrary to popular opinion, variables are not the best means to fight against magic numbers. At least in CSS, using relative units is the way to be preferred to disenchant magic numbers. Additionally, using reusable patterns and keeping your codebase DRY reduces the risk of introducing magic numbers into your codebase.

```scss
.my-class {
  font-size: 1em;
  line-height: 1.25;  // Not magic!
}
```

Above you can see the classic example of how to avoid magic numbers by using relative units. We simply used a relative value to specify the line height, linking the value to the value of the font size to which it refers. **Furthermore relative units like `em`, `rem`, `%`, `vh` and `vw` are your best friends when it comes to keeping your codebase free of magic numbers.**

```scss
// No magic, but cumbersome:
$default-font-size: 16px;
$paragraph-spacing: $default-font-size * 1.5;

p {
  font-size: $default-font-size;
  margin-top: $paragraph-spacing;
}

// No magic, simple:
$default-font-size: 1em;

p {
  font-size: $default-font-size;
  margin-top: 1.5em;
}
```

In the example above, we might also want to use a spacing variable in the second example, but we only really have to if we want to ensure that it is consistent with the spacing in another place.

```scss
// Variant A
$default-font-size: 1em;
$default-content-spacing: 1.5em;

p {
  font-size: $default-font-size;
  margin-top: $default-content-spacing;
}

ul {
  font-size: $default-font-size;
  margin-top: $default-content-spacing;
}

// Variant B
p,
ul {
  font-size: 1em; // Not magic!
  margin-top: 1.5em; // Not magic!
}
```

**The hardest part of keeping your CSS codebase free of magic numbers though, is to correctly detect relationships between certain values.** Oftentimes it isn't all that clear if some values are the same because they should be the same or just coincidentally. Or even more importantly, oftentimes certain values are not the same in different places even when they should be.

```scss
// Okay solution:
$body-spacing: 1em;

.comment__body {
  margin-left: $body-spacing;
  // ...
}

.article-teaser__body {
  margin-left: $body-spacing;
  // ...
}

// Better solution:
.media-object__body {
  margin-left: 1em;
}

.comment__body {
  // Comment specific styles only.
  // ...
}

.article-teaser__body {
  // Article teaser specific styles only.
  // ...
}
```

Keep in mind though that, as with many other programming languages, even in CSS **wrong abstractions can be worse than duplicate code.** Having said that, I still think **using patterns and abstractions to avoid duplication is the best way to keep your CSS codebase DRY and free of magic numbers.**

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

Working with design systems at scale can be challenging. A lot of magic numbers in the codebase can make it much harder to maintain it in the long term. So it should be a top priority to fight them. But **you have to be conscious about what values actually are magic numbers** and you have to be sure to take measures which actually disenchant them instead of just obfuscating the fact that they’re magical. When you reach for abstractions and reusable patterns to combat magic numbers, **you need to make sure you actually reduce duplication instead of artificially creating relationships where there were none before.**

## References

- [Chris Coyier, Magic Numbers in CSS](https://css-tricks.com/magic-numbers-in-css/)
- [Harry Roberts, Code smells in CSS](https://csswizardry.com/2012/11/code-smells-in-css/#magic-numbers)
