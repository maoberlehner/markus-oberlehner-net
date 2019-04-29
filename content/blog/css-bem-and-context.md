+++
date = "2017-02-18T10:09:05+02:00"
title = "CSS, BEM and Context"
description = "Read about how you can use BEM mixes and modifiers to handle the styling of a block in the context of another block or to use multiple blocks on the same element."
intro = "The recent days there was some talk about one of my favorite CSS architecture topics: styling things in the context of other things. It all started with a tweet from Dave Rupert. He asked whether the style..."
draft = false
categories = ["Development"]
tags = ["CSS Architecture", "BEM", "Front-End Architecture"]
+++

The recent days there was some talk about one of my favorite CSS architecture topics: styling things in the context of other things.

It all started with [a tweet from Dave Rupert](https://twitter.com/davatron5000/status/829091851651149824). He asked whether the style `.some-context .thing {}` belongs into `thing.css` or `some-context.css`. [Harry Roberts weighed in](https://twitter.com/csswizardry/status/829124651288780801) saying the style should be put in `thing.css`.

Some days later Harry Roberts wrote [a blog article](https://csswizardry.com/2017/02/code-smells-in-css-revisited#a-class-appearing-in-another-components-file) referencing Dave Rupert's tweet and Jonathan Snook also wrote [a blog article](https://snook.ca/archives/html_and_css/coding-css-for-context) referencing both, Dave Rupert's tweet and Harry's article (this is getting really meta).

## Now what?
So where do we stand taking the input of those three sources? The poll attached to Dave Rupert's tweet comes to the conclusion, that a slim majority would put `.some-context .thing {}` in a file named `some-context.css`. Harry Roberts and Jonathan Snook disagree and argue that `thing.css` should contain this style.

Both Harry Roberts and Jonathan Snook go a little further and explain different ways how to avoid writing a nested style like that in the first place. Harry Roberts suggests to use a so called “BEM mix” and Jonathan Snook explains how to use a BEM modifier class to style `.thing` to avoid styling a specific context but a specific purpose (of “the thing”).

## Combining BEM mixes and modifiers
Harry Roberts doesn't go into much detail about how to use a BEM mix in such a situation (because it is outside of the scope of his article) and Jonathan Snook states, that a BEM modifier would be a better fit for the problem at hand. I'd argue that in many cases a combination of both can be the most beneficial.

So how can we use a combination of BEM mixes and modifiers to handle the styling of a thing in the context of another thing? Let's build upon Jonathan's example of a `.modal` and a `.button`. First we identify **why** the button should look different in the context of a modal and we might end up choosing a modifier like `.button--primary`. But there may still be other styles that are specific to the context (the modal) but need to be on the button. For example we may want to have a lot of whitespace around the button. In situations like those, a BEM mix is the perfect fit.

```html
<div class="modal">
  <h2 class="modal__title">I'm a modal!</div>
  <!-- Other modal content -->
  <button class="modal__button button button--primary">
    Please click me!
  </button>
</div>
```

```scss
// button.css
.button {
  // ... Generic button styles.
}

.button--primary {
  background: hotpink;
}
```

```scss
// modal.css
.modal {
  // ... All the modal styles.
}

.modal__button {
  margin: 3em; // A lot of whitespace.
}
```

## BEM mix or modifier – where do i put my styles?
You may wonder how to decide which styles do belong in a BEM mix and which styles do belong in a modifier. I'd say that positional styles like `margin` or `top` / `left` are typical candidates for a BEM mix. Other than that `font-size`, `color` and `text-align` may also be potential styles which could be used in a BEM mix under some circumstances. You should ask yourself if a certain style hinders potential reusability outside of a given context, if that is the case, a BEM mix might be the best place to put such a style.

## Conclusion
First of all I'd argue that writing a style like `.modal .button {}` should be avoided by all means. You'll not only end up wondering where you should put such a style but you're also opening the pandora's box of specificity battles.

Try to avoid styling things in a specific context and use modifiers to style for a specific purpose of “the thing” instead. In cases where it isn't possible to avoid context completely think about using a BEM mix.

Using a BEM mix or a modifier is not a question of either-or they both have specific use cases and often times can be combined symbiotically.
