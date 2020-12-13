+++
date = "2019-06-30T06:17:17+02:00"
title = "Multi Export Vue.js Single File Components With Proxy Exports"
description = "Learn how to export multiple Vue.js Single File Components from a single proxy component."
intro = "In one of my previous articles, we examined how we can use JSX in Vue.js to export multiple Vue.js components from a single Single File Component (SFC) .vue file. Just recently I found an even easier solution to this problem..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1542158514/blog/2019-06-30/sfc-proxy-component"]
+++

In one of my [previous articles](/blog/multi-export-vue-single-file-ui-components/), we examined how we can use JSX in Vue.js to export multiple Vue.js components from a single Single File Component (SFC) `.vue` file. Just recently I found an even easier solution to this problem.

Although it can be very useful to use JSX for simple UI components, as I described in my article, there are also some drawbacks to this approach. First, JSX doesn't feel very natural in a Vue.js environment, and second, you lose many of the advantages of Vue.js Single File Components, such as scoped styles.

## Proxy exports

The concept I've come up with is quite simple: All components live in their own SFC, but there is one master component that proxies all associated components.

Let's say we have a custom form and we want to split it up into multiple components for each part of the form.

```bash
components
├─ FancyTable.vue
├─ FancyTableBody.vue
├─ FancyTableCell.vue
├─ FancyTableHead.vue
└─ FancyTableRow.vue
```

If we now want to use these generic form components to create a new, more specific component like a `DataList` component, it would look something like this.

```html
<template>
  <FancyTable>
    <!-- ... -->
  </FancyTable>
</template>

<script>
// src/components/DataList.vue
import FancyTable from './FancyTable.vue';
import FancyTableBody from './FancyTableBody.vue';
import FancyTableCell from './FancyTableCell.vue';
import FancyTableHead from './FancyTableHead.vue';
import FancyTableRow from './FancyTableRow.vue';

// ...
</script>
```

Let's improve this somewhat by updating our `FancyTable` component to serve as a proxy component that also exports all associated components.

```html
<template>
  <table class="FancyTable">
    <slot/>
  </table>
</template>

<script>
// Export the root component as named export.
export const FancyTable = {
  name: 'FancyTable',
  // ...
};

// Proxy export all related components.
export { default as FancyTableBody } from './FancyTableBody.vue';
export { default as FancyTableCell } from './FancyTableCell.vue';
export { default as FancyTableHead } from './FancyTableHead.vue';
export { default as FancyTableRow } from './FancyTableRow.vue';

// A Vue.js SFC must have a default export.
export default FancyTable;
</script>
```

Now our `FancyTable` component serves as a proxy for all related subcomponents. Shout-out to Philipp Kühn for [showing me this shortened `export` / `from` syntax](https://twitter.com/_philippkuehn/status/1145241257419202560).

<div>
  <hr class="c-hr">
  <div class="c-service-info">
    <h2>Do you want to learn more about advanced Vue.js techniques?</h2>
    <p class="c-service-info__body">
      Register for the Newsletter of my upcoming book: <a class="c-anchor" href="https://oberlehner.us20.list-manage.com/subscribe?u=8476a98c5640f6c7b5530ea57&id=8b26bf120b" data-event-category="link" data-event-action="click: newsletter" data-event-label="Newsletter (article content)">Advanced Vue.js Application Architecture</a>.
    </p>
  </div>
  <hr class="c-hr">
</div>

```html
<template>
  <FancyTable>
    <!-- ... -->
  </FancyTable>
</template>

<script>
// src/components/DataList.vue
import {
  FancyTable,
  FancyTableBody,
  FancyTableCell,
  FancyTableHead,
  FancyTableRow,
} from './FancyTable.vue';

// ...
</script>
```

As you can see above, we now only have to use one `import` statement to import all parts of the table we need to build our `DataList` component.

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like What You Read?</h2>
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

The benefits of this approach are most likely not a big deal, but in my opinion it can still be a useful improvement in certain situations.

Situations in which I already use this pattern are for generic table components such as in the example above and also for form components such as various types of input and general form layout components.

## References

- [Multi Export Vue.js Single File UI Components](/blog/multi-export-vue-single-file-ui-components/)
