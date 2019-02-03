+++
date = "2019-02-03T04:42:42+02:00"
title = "Multi Export Vue.js Single File UI Components"
description = "Learn how to use named exports to export multiple components from a single .vue file and how to use JSX to build powerful UI components."
intro = "In todays article we'll learn how to build Vue.js Single File Components (SFC) which export multiple components at once using ES6 named exports. Furthermore we'll utilize render functions to render the markup of our components via JSX. By combining these techniques, we are able to create UI components that consist of several separate components combined into a single file..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Front-End Architecture"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1200,h_675/v1532158513/blog/2019-02-03/named-export-vue-sfc-twitter"]
+++

> **Note:** This is the first part of my “Advanced Vue.js Project Structure” series on how to structure and test large scale Vue.js applications. Stay tuned, there's more to come! [Follow me on Twitter](https://twitter.com/MaOberlehner) if you don't want to miss the next article.

In todays article we'll learn how to build **Vue.js Single File Components (SFC) which export multiple components at once using ES6 named exports.** Furthermore we'll utilize render functions to render the markup of our components via JSX. By combining these techniques, we are able to create UI components that consist of **several separate components combined into a single file.**

What we ultimately try to accomplish is the clean separation of our UI components (the styling) from components which contain logic or fetch data from an API.

## Export multiple components from a Single File Component

Usually, a Vue.js SFC only exports a single component. Although the SFC specification requires that we have at least one `default` export, we're not limited to *only* having a `default` export. **We can add as many additional named exports as we like.**

```html
<template>
  <div class="grid">
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'UiGrid',
  // ...
};
</script>

<style lang="scss">
/* ... */
</style>
```

In the example code snippet above you can see a regular Vue.js SFC component with a `default` export, exporting a single component.

```html
<script>
export const UiGrid = {
  // ...
  render() {
    return (
      <div class="grid">
        {this.$slots.default}
      </div>
    );
  },
};

export const UiGridItem = {
  // ...
  render() {
    return (
      <div class="grid__item">
        {this.$slots.default}
      </div>
    );
  },
};

export default UiGrid;
</script>

<style lang="scss">
/* ... */
</style>
```

In this example you can see how we can modify our simple example component to not only export one but two components. Because we can't have two `<template>` sections in one SFC file, **we‘ve changed the code to use a render function and JSX to render the markup of our components.**

```html
<template>
  <UiGrid class="MyComponent">
    <UiGridItem>
      <!-- ... -->
    </UiGridItem>
    <UiGridItem>
      <!-- ... -->
    </UiGridItem>
  </UiGrid>
</template>

<script>
// Look ma, I'm importing two
// components from a single file!
import {
  UiGrid,
  UiGridItem,
} from '../ui/UiGrid.vue'

export default {
  name: 'MyComponent',
  // ...
};
</script>
```

Here you can see how we can use the `UiGrid` component inside of another component to build a simple grid layout without having to deal with global CSS or duplicating the CSS styles for our grid layout in every component where we need it.

This concept is similar to how things are done in many React projects with [styled components](https://www.styled-components.com/). **By using JSX and named exports to export multiple components from one SFC we can keep all of our grid related styles in one single file** instead of having to create multiple files each containing different parts of our grid layout implementation.

**Keep in mind though, that it is not possible to use scoped styles or CSS Modules for multi export components** (those will only work for the default export). You have to come up with your own approach of preventing your styles from leaking into the global scope. I recommend you to use namespacing in combination with the BEM syntax.

## Building a Grid Component

Let's take a closer look how we can build a real world Grid Component using the techniques outlined above.

```html
<script>
import classnames from 'classnames';

export const UiGrid = {
  props: {
    columnGap: {
      default: 'm',
      type: String,
    },
    rowGap: {
      default: 'm',
      type: String,
    },
    tag: {
      default: 'div',
      type: String,
    }
  },
  render() {
    const Tag = this.tag;
    return (
      <Tag
        class={classnames(
          'grid',
          `grid--column-gap-${this.columnGap}`,
          `grid--row-gap-${this.rowGap}`,
        )}
      >
        {this.$slots.default}
      </Tag>
    );
  },
};

export const UiGridItem = {
  // ...
};

export default UiGrid;
</script>

<style lang="scss">
/* ... */
</style>
```

The `UiGrid` wrapper component you can see above, has properties to control the gap between the columns and rows of its child grid items and we even make it possible to change the HTML tag of the component by providing a `tag` property. We use the `classnames` package to make it a little easier to provide multiple classes to our HTML elements.

```html
<script>
import classnames from 'classnames';

export const UiGrid = {
  // ...
};

export const UiGridItem = {
  props: {
    tag: {
      default: 'div',
      type: String,
    },
    width: {
      default: () => [],
      type: Array,
    }
  },
  render() {
    const Tag = this.tag;
    return (
      <Tag
        class={classnames(
          'grid__item',
          this.width.map(x => `grid__item--width-${x}`),
        )}
      >
        {this.$slots.default}
      </Tag>
    );
  },
};

export default UiGrid;
</script>

<style lang="scss">
/* ... */
</style>
```

`UiGridItem` elements take a `width` (an array of widths to be more precise) and also a `tag` property. We map over the given widths to create modifier classes for them. In the following code snippet you can see the CSS styles for our basic grid component.

```scss
$breakpoint-m: 32em;
$gap-m: 1em;
$gap-l: 2em;

.grid {
  display: flex;
  flex-wrap: wrap;

  &--column-gap-m {
    margin-left: -$gap-m;
  }

  &--column-gap-l {
    margin-left: -$gap-l;
  }

  &--row-gap-m {
    margin-top: -$gap-m;
  }

  &--row-gap-l {
    margin-top: -$gap-l;
  }
}

.grid__item {
  box-sizing: border-box;

  &--width-12\/12 {
    width: 100%;
  }

  @media (min-width: $breakpoint-m) {
    &--width-4\/12\@m {
      width: 33.3333333%;
    }

    &--width-8\/12\@m {
      width: 66.6666666%;
    }
  }

  .grid--column-gap-m > & {
    padding-left: $gap-m;
  }

  .grid--column-gap-l > & {
    padding-left: $gap-l;
  }

  .grid--row-gap-m > & {
    padding-top: $gap-m;
  }

  .grid--row-gap-l > & {
    padding-top: $gap-l;
  }
}
```

## Building a Media Object Component

Next we also want to take a look at how we can utilize multi export Single File Components to build a the famous [Media Object](http://www.stubbornella.org/content/2010/06/25/the-media-object-saves-hundreds-of-lines-of-code/).

```html
<script>
import classnames from 'classnames';

export const UiMedia = {
  props: {
    gap: {
      default: 'm',
      type: String,
    },
    tag: {
      default: 'div',
      type: String,
    }
  },
  render() {
    const Tag = this.tag;
    return (
      <Tag class={classnames(
        'media',
        `media--gap-${this.gap}`),
      }>
        {this.$slots.default}
      </Tag>
    );
  },
};

export const UiMediaFigure = {
  // ...
};

export const UiMediaBody = {
  // ...
};

export default UiMedia;
</script>

<style lang="scss">
/* ... */
</style>
```

As you can see in the example above we can use the same patterns we've used before to build our Media Object UI Component. The `UiMediaFigure` and `UiMediaBody` components in the following example snippet also follow the same principles.

```html
<script>
import classnames from 'classnames';

export const UiMedia = {
  // ...
};

export const UiMediaFigure = {
  props: {
    align: {
      default: 'start',
      type: String,
    },
    tag: {
      default: 'div',
      type: String,
    }
  },
  render() {
    const Tag = this.tag;
    return (
      <Tag
        class={classnames(
          'media__figure',
          `media__figure--align-${this.align}`,
        )}
      >
        {this.$slots.default}
      </Tag>
    );
  },
};

export const UiMediaBody = {
  props: {
    align: {
      default: 'start',
      type: String,
    },
    tag: {
      default: 'div',
      type: String,
    }
  },
  render() {
    const Tag = this.tag;
    return (
      <Tag
        class={classnames(
          'media__body',
          `media__body--align-${this.align}`,
        )}
      >
        {this.$slots.default}
      </Tag>
    );
  },
};

export default UiMedia;
</script>

<style lang="scss">
/* ... */
</style>
```

Last but not least you can take a look at the CSS styles in the next code block.

```scss
$gap-m: 1em;
$gap-l: 2em;

.media {
  display: flex;
}

.media__figure {
  &--align-center {
    align-self: center;
  }

  &--align-end {
    align-self: flex-end;
  }

  &:first-child {
    .media--gap-m > & {
      margin-right: $gap-m;
    }

    .media--gap-l > & {
      margin-right: $gap-l;
    }
  }

  &:last-child {
    .media--gap-m > & {
      margin-left: $gap-m;
    }

    .media--gap-l > & {
      margin-left: $gap-l;
    }
  }
}

.media__body {
  &--align-center {
    align-self: center;
  }

  &--align-end {
    align-self: flex-end;
  }
}
```

### Named slots

After seeing this implementation of the Media Object, you may wonder if this might not be an ideal use case for named slots.

```html
<template>
  <div class="media">
    <div class="media__figure">
      <slot name="figure"/>
    </div>
    <div class="media__body">
      <slot/>
    </div>
  </div>
</template>
```

```html
<template>
  <div class="MyComponent">
    <UiMedia>
      <img
        slot="figure"
	      src="..."
	      alt="A nice image."
	    >
	    <h2>Lorem Ipsum</h2>
	    <p>Dolor sit ...</p>
    </UiMedia>
  </div>
</template>
```

Although there is nothing wrong with the implementation above, I find it to be less obvious to a new developer to tell how this will render by only looking at the code of `MyComponent`.

I don't want to make sweeping statements like “Don't use named slots at all.”, but I'd argue that you should use them sparingly. In my experience, if you overuse named slots, it can be very hard to figure out how a piece of your application will render by only looking at the part of the code that consumes a component with named slots.

## Putting it together

In the following CodeSandbox you can see how to use the `UiGrid` and `UiMedia` components.

<div class="c-content__broad">
  <iframe src="https://codesandbox.io/embed/n9wyzvpo8m?module=%2Fpages%2Findex.vue&view=preview" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

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

Although the techniques outlined in this article also has their downsides I really like the  approach that everything is a component. In the past I mostly reached for global CSS and I basically built my own CSS framework. This is a quite simple solution at the beginning but as your project grows it gets harder and harder to keep track of which CSS styles are used in which places. When using components instead, tooling can help with that and if a component is not used anymore, all the styles associated with the component disappear from your codebase automatically.

But from a performance point of view, having hundreds of small UI components, might take its toll. Like so often these times it’s a trade off between the optimal developer experience and the maximum possible performance.
