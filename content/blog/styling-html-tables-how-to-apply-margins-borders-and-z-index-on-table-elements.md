+++
date = "2019-06-23T06:49:49+02:00"
title = "Styling HTML Tables: How to Apply Margin, Border and z-index on Table Elements"
description = "Learn how to use margin, border and z-index on tbody, thead and tr HTML table elements."
intro = "A long time ago there was practically no way around the HTML <table> element for creating complex layouts on the web. Fortunately, those days are long gone. Nowadays we only use the <table> element as it should be used: to display tabular data. However, only recently I was reminded again that styling tables is not as easy as one might think..."
draft = false
categories = ["Development"]
tags = ["HTML", "CSS"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1532158513/blog/2019-06-23/final-result-twitter"]
+++

A long time ago there was practically no way around the HTML `<table>` element for creating complex layouts on the web. Fortunately, those days are long gone. Nowadays we only use the `<table>` element as it should be used: to display tabular data. However, only recently I was reminded again that styling tables is not as easy as one might think.

Unfortunately, some CSS properties (e.g. `margin`, `border-radius` and `z-index`) do not work on certain HTML table elements like `<tbody>`, `<thead>` and `<tr>`. In this article, we will explore how we can work around these limitations.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2019-06-23/final-result">
      <img
        data-src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-06-23/final-result"
        data-srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2019-06-23/final-result 2x"
        alt="The final result."
      >
      <noscript>
        <img
          src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-06-23/final-result"
          alt="The final result."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-2.5em;">
    <small>The final result</small>
  </p>
</div>

## The table markup

The screenshot above illustrates the final result we want to achieve: a table with the first row being the main header and multiple sections which all have their own sub headers.

```html
<table class="table">
  <thead>
    <tr>
      <th>MO</th>
      <th>TU</th>
      <th>WE</th>
      <th>TH</th>
      <th>FR</th>
      <th>SA</th>
      <th>SU</th>
    </tr>
  </thead>
  <tbody class="section section-step">
    <tr class="sub-header">
      <th colspan="7">
        Working hours
      </th>
    </tr>
    <tr>
      <td>4</td>
      <td>5</td>
      <td>5</td>
      <td>5</td>
      <td>5</td>
      <td>0</td>
      <td>0</td>
    </tr>
  </tbody>
  <tbody class="section section-step">
    <tr class="sub-header">
      <th colspan="7">
        Workout
      </th>
    </tr>
    <tr>
      <td>0.5</td>
      <td>0.5</td>
      <td>0.5</td>
      <td>1</td>
      <td>0.5</td>
      <td>2</td>
      <td>0</td>
    </tr>
  </tbody>
  <tbody class="section">
    <tr class="section-header">
      <th colspan="7">
        Total
      </th>
    </tr>
    <tr>
      <td>8.5</td>
      <td>8.5</td>
      <td>9.5</td>
      <td>10</td>
      <td>5.5</td>
      <td>2</td>
      <td>0</td>
    </tr>
  </tbody>
</table>
```

Above you see the HTML structure of the table. Inside the `<thead>` element we have our main header and beneath it several `<tbody>` elements that represent separate sections of our table, each of which has its own sub header.

## Using `margin` on table elements

As you can see in the screenshot at the beginning of this article, there is some space between the main header and the first `<tbody>` section and also between the individual `<tbody>` sections. Naive as I am, I first tried to apply `margin-top` to the `<tbody>` elements.

But unfortunately, if you try to apply `margin` on `<tbody>`, `<thead>` or `<tr>`, you will find that it has no effect. First things first: there is no magic way of making `margin` work on these elements other than by changing the `display` property (which you usually don't want to change because you lose all table-related formatting). But there are a couple of alternative ways of how we can add some space around those elements.

### Using `border`

The simplest solution to achieve a similar result as using `margin` is to add `border-top: 1em` onto the `<tbody>` elements.

```css
// 1. Needed for making border-top spacing work.
.table {
  border-collapse: collapse; // 1
  border-spacing: 0;
}

.section {
  border-top: 1em solid transparent;
}
```

All our `<tbody>` elements, which need some space around them, have a class `.section`. For the `border-top` to work, we have to put `border-collapse: collapse` on our table.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/how-to-apply-margins-borders-and-z-index-on-table-elements-wo9cc?fontsize=14&initialpath=%2Fmargin-with-border.html&module=%2Fmargin-with-border.html" title="How to Apply Margins, Borders and z-index on Table Elements"  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

### Using `::before` and `::after` pseudo elements

Another way of applying some margin on a `<tbody>` element is to use a `::before` or `::after` pseudo element.

```css
.section::before {
  height: 1em;
  display: table-row;
  content: '';
}
```

This way we basically add a new (empty) row which we can use to add some space at the beginning of our `<tbody>` elements.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/how-to-apply-margins-borders-and-z-index-on-table-elements-wo9cc?fontsize=14&initialpath=%2Fmargin-with-pseudo-elements.html&module=%2Fmargin-with-pseudo-elements.html" title="How to Apply Margins, Borders and z-index on Table Elements"  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

Depending on the circumstances you might want to reach for either the border method or the pseudo element trick.

## Using `border-radius` on table elements

Next, we want to give our `<tbody>` elements a border and apply a border radius. Again we're out of luck if we try to apply `border` and `border-radius` onto the `<tbody>` element itself.

```scss
// 1. Using box-shadow because otherwise
//    border-radius doesn't work on <tbody>.
.section-step {
  border-radius: 0.25em; // 1
  box-shadow: 0 0 0 1px #ccc; // 1
}
```

Above you can see how we can use `box-shadow` instead of `border` in order to achieve (almost) the same result.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/how-to-apply-margins-borders-and-z-index-on-table-elements-wo9cc?fontsize=14&initialpath=%2Fborder-radius-with-box-shadow.html&module=%2Fborder-radius-with-box-shadow.html" title="How to Apply Margins, Borders and z-index on Table Elements"  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

## Styling table cells instead

As you may have noticed, our current implementation doesn't look exactly like the screenshot you saw at the beginning of this article.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2019-06-23/wrong-spacing">
      <img
        data-src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-06-23/wrong-spacing"
        data-srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2019-06-23/wrong-spacing 2x"
        alt="The spacing hack works like padding instead of margin."
      >
      <noscript>
        <img
          src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-06-23/wrong-spacing"
          alt="The spacing hack works like padding instead of margin."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-2.5em;">
    <small>The spacing hack works like padding instead of margin</small>
  </p>
</div>

Now that we've added the borders, **we can see that our spacing hacks do not work like `margin` but rather like `padding`.** Unfortunately, under these circumstances, if you have a border around a `<tbody>` element that must have some space to the previous element, there is no easy solution to achieve this. The only way to solve this is to apply our border styles to the table cells and use some `:first-child` / `:last-child` selector magic to achieve the desired layout.

```scss
.section-step th,
.section-step td {
  border: 0 solid #ccc;
}

.section-step th:first-child,
.section-step td:first-child {
  border-left-width: 1px;
}

.section-step th:last-child,
.section-step td:last-child {
  border-right-width: 1px;
}

.section-step tr:first-child th,
.section-step tr:first-child td {
  border-top-width: 1px;
}

.section-step tr:first-child th:first-child,
.section-step tr:first-child td:first-child {
  border-top-left-radius: 0.25em;
}

.section-step tr:first-child th:last-child,
.section-step tr:first-child td:last-child {
  border-top-right-radius: 0.25em;
}

.section-step tr:last-child th,
.section-step tr:last-child td {
  border-bottom-width: 1px;
}

.section-step tr:last-child th:first-child,
.section-step tr:last-child td:first-child {
  border-bottom-left-radius: 0.25em;
}

.section-step tr:last-child th:last-child,
.section-step tr:last-child td:last-child {
  border-bottom-right-radius: 0.25em;
}
```

In the code snippet above we apply the necessary border styles to the relevant `th` and `td` table cell elements. The elements at the corners must have a border radius all element on the edges must have a border. By using `:first-child` and `:last-child` selectors we can apply the styles to the correct cells.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/how-to-apply-margins-borders-and-z-index-on-table-elements-wo9cc?fontsize=14&initialpath=%2Fstyling-the-cells.html&module=%2Fstyling-the-cells.html" title="How to Apply Margins, Borders and z-index on Table Elements"  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

<div>
  <hr class="c-hr">
  <div class="c-service-info">
    <h2>Do you want to learn about advanced Vue.js techniques?</h2>
    <p class="c-service-info__body">
      Register for the Newsletter of my upcoming book: <a class="c-anchor" href="https://oberlehner.us20.list-manage.com/subscribe?u=8476a98c5640f6c7b5530ea57&id=8b26bf120b" data-event-category="link" data-event-action="click: newsletter" data-event-label="Newsletter (article content)">Advanced Vue.js Application Architecture</a>.
    </p>
  </div>
  <hr class="c-hr">
</div>

## Using `z-index` on table elements

As you can see in the initial screenshot of the final result, a `box-shadow` has been applied to the sub header, overlaying the following row. If we try to simply apply a `box-shadow` to the element, we will see that the shadow of the sub header disappears behind the following row.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2019-06-23/shadow-behind-row">
      <img
        data-src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-06-23/shadow-behind-row"
        data-srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2019-06-23/shadow-behind-row 2x"
        alt="The box shadow disappears behind the following row."
      >
      <noscript>
        <img
          src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-06-23/shadow-behind-row"
          alt="The box shadow disappears behind the following row."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-2.5em;">
    <small>The box shadow disappears behind the following row</small>
  </p>
</div>

Normally, we would use `z-index` to raise the sub header above the following row. But as you may have guessed, using relative positioning and `z-index` on a `<tbody>` element doesn't work either. But we can use our knowledge about the CSS stacking context to solve this problem. Applying `position: relative` and a `z-index` to an element creates a new stacking context. But this is not the only way we can achieve this: for example, we can also use `transform: translate(0, 0)`.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2019-06-23/final-result">
      <img
        data-src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-06-23/final-result"
        data-srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2019-06-23/final-result 2x"
        alt="The final result."
      >
      <noscript>
        <img
          src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-06-23/final-result"
          alt="The final result."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-2.5em;">
    <small>The final result</small>
  </p>
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

We have to dig deep into the CSS bag of tricks to make some more complicated table layouts work. But the beauty of CSS is that there is always a way to achieve certain things.

We could have made our lives a little easier by overriding the `display` property of our table elements. But that means you have to explicitly specify the width of each cell to make the columns equally wide. This may be okay in certain cases, but it's often more convenient to rely on the browser to automatically determine the width of each cell.

## References

- [Tiffany B. Brown, CSS stacking contexts: What they are and how they work](https://tiffanybbrown.com/2015/09/css-stacking-contexts-wtf/index.html)
