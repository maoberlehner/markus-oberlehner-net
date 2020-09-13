+++
date = "2020-09-12T10:42:42+02:00"
title = "We Have Solved CSS! With BEM, Scoped Components, and Utility First Frameworks"
description = "CSS has some shortcomings. But we have solved them multiple times for now. Learn more about how."
intro = "Again and yet again, we hear and read about the problems of CSS. And there are some pitfalls you can fall into, mostly because of the global nature of CSS. But I argue that we solved those problems now multiple times..."
draft = false
categories = ["Development"]
tags = ["CSS Architecture"]
images = ["/images/c_thumb,f_auto,q_auto,w_1014,h_510/v1542158524/blog/2020-09-12/we-solved-css"]
+++

Again and yet again, we hear and read about the problems of CSS. And there are some pitfalls you can fall into, mostly because of the global nature of CSS. But I argue that we have solved those problems now multiple times, with BEM, scoped components (e.g., Vue, Svelte, and CSS in JS), and utility-class-based CSS frameworks (e.g., Tachyons and Tailwind).

## Problem 1: No Scoping or Namespacing

Because of the lack of native support for scoping CSS styles, we might use the same class name without realizing that they sabotage each other.

```css
/* page-user.css */
.teaser {
  background-color: blue;
  /* ... */
}

/* page-about.css */
.teaser {
  background-color: red;
  /* ... */
}
```

In **BEM**, this is typically solved using the convention to create a separate file for each component. So you can only have a single file named `teaser.css`.

**Scoped components, and CSS in JS,** make it possible to scope your CSS. So you can theoretically have multiple components named `teaser` but with different styles.

With **utility-first frameworks**, you have a mix of both, where you typically would create a `teaser` component, encapsulating all the utility classes that form a `teaser`.

## Problem 2: Specificity Battles

If you have one giant stylesheet, with a lot of nested selectors, there is a high chance that you run into specificity problems.

```css
.teaser .button {
  background-color: blue;
}

.card .button {
  background-color: red;
}

/*
 * If there is a button in a teaser in a card,
 * you have to one-up the button in a card style.
 */
.card .teaser .button {
  background-color: blue;
}
```

Again, **BEM** solves this by enforcing the use of modifiers, instead of styling elements based on their context.

When using **scoped components and CSS in JS,** we typically use modifier props to change a component's look. This is conceptually very similar to modifiers in BEM.

**Utility-first frameworks** make this a non-issue because most classes have the same specificity.

## Problem 3: Naming Things

Although you have a `.button` class that makes elements look like a button, you often need to apply additional, context-specific styles. For this, you either need to use nesting (which sets you up for specificity battles) or apply a new class, for which you have to come up with a name.

```css
.teaser .button {
  margin-top: 1em;
}

/* Arbitrary names */
.teaser-button {
  margin-top: 1em;
}
```

**BEM** gives us the convention to always use the name of the current component (or block) as a prefix, followed by the name of the element we need to style (e.g., `.teaser__button`). Not ideal, but at least we don't have to think about it.

**Scoped CSS in components and CSS in JS** allows us to use the same name `.button` again and the namespacing is taken care of automatically for us.

Again this is a non-issue when using a **utility-first CSS framework**. There simply are no names other than the class names that already exist in the framework.

## Problem 4: Every Growing CSS

In legacy CSS codebases, nobody knows what's affected by what styles, so nobody is brave enough to delete old styles but adds new ones instead.

With **BEM and component-based** workflows, we typically have a separate file for each component. That way, we know exactly that we can remove individual styles if we don't use specific components anymore.

And yet again, **utility-based CSS frameworks** make this a non-issue because your CSS code's maximum size is predestined. Furthermore, if you remove a particular component's markup, a tool like Purge CSS typically removes all the obsolete utility classes.

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

CSS makes it very easy to write horrible code. But don't focus on the negatives; let's embrace the fact that the language (and the browser implementation) is flexible enough that we were able to come up with multiple solutions to write maintainable CSS.

Looking at this list of problems and solutions, it becomes apparent why utility-class based CSS frameworks are becoming so popular lately: they solve those problems most consequently.
