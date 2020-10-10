+++
date = "2020-09-06T07:58:58+02:00"
title = "When and When Not to Use Utility Classes With BEM"
description = "Learn more about when to use utility classes with BEM or other non-utility-first approaches to CSS."
intro = "After trying to go all-in with utility classes a few times, I decided that, for me, this is not the right approach. But one thing irks me and makes me think twice if I'm not perhaps just being stubborn..."
draft = false
categories = ["Development"]
tags = ["CSS Architecture"]
images = ["/images/c_thumb,f_auto,q_auto,w_1014,h_510/v1542158524/blog/2020-09-06/utility-classes-and-bem"]
+++

After trying to go all-in with utility classes a few times, I decided that, [for me, this is not the right approach](/blog/thoughts-about-utility-first-css-frameworks/). But one thing irks me and makes me think twice if I'm not perhaps just being stubborn. I've been using [utility classes for a long time](https://csswizardry.com/2015/03/more-transparent-ui-code-with-namespaces/#utility-namespaces-u-), even before full-blown utility class-based frameworks like Tachyons and Tailwind CSS became popular. But what I have discovered lately is that more and more utility classes are sneaking into my codebases. So why not draw the logical conclusion and use utility classes for everything from the beginning? I have discovered that it often doesn't feel right to use some of these utility classes and can lead to problems in the long run. In this article, we will try to find rules for when we should and should not use utility classes in a traditional CSS codebase.

## When I don't use utility classes

**1) I don't use utility classes for styling different variants of a component.**

```html
<button class="primary">
  Primary
</button>

<button class="secondary">
  Secondary
</button>

<style>
.primary {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  /* ... */
}

.secondary {
  background-color: var(--color-secondary);
  color: var(--color-text-on-secondary);
  /* ... */
}
</style>
```

Variants might affect more than one style. In such cases, it makes more sense to me to have a *semantic* class name. This code is self-explanatory; I don't have to think about why the `color` property has a particular value.

**2) I don't use utility classes if multiple styles work together and rely on each other.**

```css
.button-group {
  display: flex;
  justify-content: center;
}
```

`justify-content: center` does not work without `display: flex` so I want those properties grouped in a distinct class so that there is a clear relationship.

```scss
// 1. For absolute positioning of `.child`.
.parent {
  position: relative; // 1
  /* ... */
}

.child {
  position: absolute;
  /* ... */
}
```

Sometimes CSS properties on one element rely on specific values on other elements. Concrete classes make it easier to document such relationships.

**3) I don't use utility classes when styles carry semantic meaning.**

```html
<span class="text-muted">Not so important text</span>
```

It is tempting to use a utility class for text color, but doing so would mean you have to use search and replace if you want to change the color of all muted texts. Although this is doable, in my opinion, it is a code smell.

## When I use utility classes

**1) I use utility classes for context-specific one-off stylings.**

```html
<div class="u-font-size-l">
  <div class="intro">
    <!-- ... -->
  </div>
  <button class="button button--primary">
    Click me
  </button>
</div>
```

The `font-size` is not a property of the `intro` or `button` components but of the context in which we put the components. And the context does not serve a specific function (as opposed to a hero component for example, where we would specify the `font-size` in the component).

**2) I use utility classes for spacing between components.**

```html
<div class="intro">
  <!-- ... -->
</div>
<button class="button u-spacing-top-l">
  Click me
</button>
```

This is a prime example of using utility classes. The spacing information does not belong anywhere. On the other hand, it might be a good idea to solve situations like that, with [layout components](https://fullstackradio.com/134).

## The rule

I can distill all of the above in two simple rules:

> Use utility classes outside, but never inside components.

A `component` is a specific piece of UI. So what it comes down to is:

> Use utility classes for layout (if you do not use layout components).

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

To some extent, I can understand why more and more people go utility first. Writing maintainable CSS requires discipline. Many people might find it easier to go all-in on utility classes. But I am convinced that well-thought-out CSS code will be easier to understand and, therefore, easier to maintain for (new) stakeholders in the long run.
