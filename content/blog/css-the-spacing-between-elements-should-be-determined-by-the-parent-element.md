+++
date = "2021-06-21T13:00:00+02:00"
title = "CSS: The Spacing Between Elements Should Be Determined by the Parent Element"
description = "Learn why determining the spacing between elements on their shared parent element leads to more resilient and maintainable code."
intro = "Years of writing and maintaining CSS code and remarks by Mark Dalgleish and Adam Wathan, along the same line, lead me to conclude that the spacing between HTML elements should be determined by their parent element in almost all cases."
draft = false
categories = ["Development"]
tags = ["CSS", "CSS Architecture"]
images = ["/images/c_pad,b_rgb:EFEFEF,f_auto,q_auto,w_1014,h_510/v1542158522/blog/2021-06-21/spacing-between-elements"]
+++

Years of writing and maintaining CSS code and remarks by [Mark Dalgleish](https://fullstackradio.com/134) and [Adam Wathan](https://twitter.com/adamwathan/status/1399473305086742529), along the same line, lead me to conclude that the spacing between HTML elements should be determined by their parent element in almost all cases.

- [Layout Components](#layout-components)
- [What Are the Advantages of Putting the Spacing on the Parent Element?](#what-are-the-advantages-of-putting-the-spacing-on-the-parent-element)
- [Exceptions](#exceptions)

```html
<ul class="nav">
  <li class="nav-item"><!-- ... --></li>
  <li class="nav-item"><!-- ... --></li>
  <!-- ... -->
<ul>

<style>
/* ❌ Bad */
.nav-item:not(:first-child) {
  margin-top: 1em;
}

/* 🆗 Better */
.nav > * + * {
  margin-top: 1em;
}

/* ✅ Best */
.nav {
  display: flex;
  flex-direction: column;
  gap: 1em;
}
</style>
```

I think the example above is probably the least controversial one. In the case of repeated elements, it seems like a no-brainer to put the information, about spacing between repeated elements, on the parent element.

But I'd even go one step further and say that putting the spacing information on a shared parent element in almost all situations should be preferred over putting it on the element itself.

```html
<body class="the-page">
  <header class="the-header">
    <!-- ... -->
  </header>
  <main class="the-main-area">
    <!-- ... -->
  </main>
  <footer class="the-footer">
    <!-- ... -->
  </footer>
</body>

<style>
/* ❌ */
.the-main-area,
.the-footer {
  margin-top: 3em;
}

/* ✅ */
.the-page {
  display: flex;
  flex-direction: column;
  gap: 3em;
}
</style>
```

But this is a perfect world scenario: what if the spacing between `the-header` and `the-main-area` must be different than the spacing between `the-main-area` and `the-footer`?

## Layout Components

We can make use of generic layout components to help us dealing with more complex situations more easily.

```html
<body class="the-page stack stack--xl">
  <header class="the-header">
    <!-- ... -->
  </header>
  <div class="stack stack--l">
    <main class="the-main-area">
      <!-- ... -->
    </main>
    <footer class="the-footer">
      <!-- ... -->
    </footer>
  </div>
</body>

<style>
.stack {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.stack--l {
  gap: 2em;
}

.stack--xl {
  gap: 3em;
}
</style>
```

Although this makes our markup more complex, I think it can be worth it in certain situations to make this trade-off.

## What Are the Advantages of Putting the Spacing on the Parent Element?

But why should we? Why should we add unnecessary wrapper `<div>`s to our HTML code? Because code written that way is much more resilient! Spacing is contextual. It depends on the larger context but also on whether a particular sibling element is currently displayed or not.

Consider the following example (written in a pseudo HTML templating language syntax):

```html
<div class="stack">
  {#if shouldShowIntro}
    <p>{intro}</p>
  {#endif}
  {#if shouldShowAd}
    <div class="ad">
      <!-- ... -->
    </div>
  {#endif}
  <div class="content">
    <!-- ... -->
  </div>
</div>
```

Thanks to using the `stack` layout component from before, our layout works regardless of which combination of `shouldShowIntro` and `shouldShowAd` is currently at work. If we'd put the spacing onto the `ad` component, it would break if `shouldShowIntro` is false because then `ad` would be the first element.

<div>
  <hr class="c-hr">
  <a
    style="display: block; margin-top: 1em;"
    href="https://www.creative-tim.com/templates/vuejs/?partner=143346"
  >
    <img
      src="/images/q_auto,f_auto/v1532158515/blog/assets/high-quality-templates"
      alt="Screenshots of three premium Vue.js templates."
      style="max-width: 100%; height: auto;"
      loading="lazy"
      width="1240"
      height="576"
    >
  </a>
  <hr class="c-hr">
</div>

## Exceptions

My rule of thumb is to default to using layout components like `stack` to determine the spacing between elements, but I'm not dogmatic about it. If I have the feeling that doing so makes the implementation significantly worse without making the system more resilient, I might choose to diverge from this rule. In the `the-page` example, I might decide to use the `stack` component as long as the spacing between all children is equal. Still, if the spacing is different between certain elements, I might choose to break the rule in favor of simpler markup.

```html
<body class="the-page">
  <header class="the-header">
    <!-- ... -->
  </header>
  <main class="the-main-area">
    <!-- ... -->
  </main>
  <footer class="the-footer">
    <!-- ... -->
  </footer>
</body>

<style>
/* ✅ This is probably fine too. */
.the-main-area {
  margin-top: 3em;
}

.the-footer {
  margin-top: 2em;
}
</style>
```
