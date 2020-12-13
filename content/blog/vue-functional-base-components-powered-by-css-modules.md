+++
date = "2020-02-02T08:29:29+02:00"
title = "Vue.js Functional Base Components Powered by CSS Modules"
description = "Learn how to automatically create functional Vue.js components from CSS Modules with dynamic props for modifier and state classes."
intro = "In one of my earlier articles, I wrote about how to use functional Vue.js components so that they inherit attributes such as classes and styles. This way, functional components are perfect for creating simple base components. In this article, we take a look at how we can simplify and generalize the process of creating new functional base components by automatically creating new Vue.js components from CSS files..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:6CFA27,f_auto,q_auto,w_1014,h_510/v1542158520/blog/2020-02-02/css-module-functional-component"]
+++

In one of my earlier articles, [I wrote about how to use functional Vue.js components so that they inherit attributes such as classes and styles](/blog/working-with-functional-vue-components/). This way, functional components are perfect for creating simple base components.

In this article, we take a look at how we can simplify and generalize the process of creating new functional base components by automatically creating new Vue.js components from CSS files.

```js
import makeCssModuleComponent from './css-module-component';

import styles from './BaseCard.module.scss';

// `BaseCard` is a functional Vue.js component.
export const BaseCard = makeCssModuleComponent({
  name: 'BaseCard',
  styles,
});
```

Above, you can see a usage example for how we can utilize `makeCssModuleComponent()` to create a functional base component directly from a CSS (module) file. All the boilerplate code is generated automatically. Furthermore, all the component props we need to modify the styling of our component, are dynamically generated based on the modifier and state classes defined in the `BaseCard.module.scss` file.

If you want to take a look at the final code, you can [check out the full code on GitHub](https://github.com/maoberlehner/vue-functional-css-module-components). You can also [take a look at a live demo hosted on Netlify](https://vue-functional-base-components-powered-by-css-modules.netlify.com/).

## Fully transparent functional components with render functions

Vue.js components can’t inherit templates of other components. This means we have to find another way to reuse the boilerplate code we can see in the example beneath in other components without having to repeat it for all our base components.

```html
<!-- src/components/base/BaseCard.vue -->
<template functional>
  <!--
    All this ceremony is necessary to make
    the component fully transparent.
  -->
  <Component
    :is="props.tag"
    :ref="data.ref"
    :class="[
      $style.root,
      props.elevated && $style['--elevated'],
      props.isActive && $style['is-active'],
      data.class,
      data.staticClass,
    ]"
    :style="[
      data.style,
      data.staticStyle,
    ]"
    v-bind="data.attrs"
    v-on="listeners"
  >
    <slot/>
  </Component>
</template>

<script>
export const UiCard = {
  name: 'UiCard',
  props: {
    tag: {
      default: 'div',
      type: String,
    },
    // Properties for modifier and state classes
    // must be added manually.
    elevated: {
      default: false,
      type: Boolean,
    },
    isActive: {
      default: false,
      type: Boolean,
    },
  },
};

export default UiCard;
</script>

<style lang="scss" module>
.root {
  overflow: hidden;
  border-radius: 0.25em;
  box-shadow: 0 0.625em 1em -0.25em rgba(0, 0, 0, 0.1), 0 0.25em 0.375em -0.25em rgba(0, 0, 0, 0.05);
}

/* If a class is removed or a new style is added,
   the properties above must be updated as well. */
.--elevated {
  box-shadow: 0 1.625em 1.5em -0.25em rgba(0, 0, 0, 0.1), 0 0.25em 0.375em -0.25em rgba(0, 0, 0, 0.05);
}

.is-active {
  border: 2px solid hotpink;
}
</style>
```

Here you can see the code necessary to make a straightforward, functional component behave like a [transparent component](https://vuejs.org/v2/guide/render-function.html#Passing-Attributes-and-Events-to-Child-Elements-Components). In the following example, you can see the same component automatically generated with the `makeCssModuleComponent()` function we create next.

```scss
// src/components/base/BaseCard.module.scss
.root {
  overflow: hidden;
  border-radius: 0.25em;
  box-shadow: 0 0.625em 1em -0.25em rgba(0, 0, 0, 0.1), 0 0.25em 0.375em -0.25em rgba(0, 0, 0, 0.05);
}

.--elevated {
  box-shadow: 0 1.625em 1.5em -0.25em rgba(0, 0, 0, 0.1), 0 0.25em 0.375em -0.25em rgba(0, 0, 0, 0.05);
}

.is-active {
  border: 2px solid hotpink;
}
```

```js
// src/components/base/index.js
import makeCssModuleComponent from './css-module-component';

import styles from './BaseCard.module.scss';

// The generated `BaseCard` component works
// exactly like the `.vue` equivalent from above.
export const BaseCard = makeCssModuleComponent({
  name: 'BaseCard',
  styles,
});
```

The first step to achieve this is to convert our template into a render function. A render function is a regular JavaScript function so we can easily share it and modify its behavior via the arguments we pass to it.

```js
// src/components/base/css-module-component.js
export default function makeCssModuleComponent({
  name,
  styles,
}) {
  return {
    name,
    functional: true,
    props: {
      tag: {
        type: String,
        default: 'div',
      },
    },
    render(h, { children, data, props }) {
      const componentData = {
        class: {
          [styles.root]: styles.root,
        },
      };

      return h(props.tag, mergeData(data, componentData), children);
    },
  };
}
```

Here you can see a first iteration of the `makeCssModuleComponent()` function, which currently only returns a simple functional component. It is already able to spare us all the ceremony work of creating a transparent functional component but lacks the functionality to add style modifier and state props. In the next chapter, we extend it with the ability to generate all necessary props automatically.

## Dynamically generate props from CSS Module styles

Manually adding props for every possible modifier or state class can be cumbersome. And what's even worse is that we have to add or remove properties every time we add or remove modifier and state classes. We can make this a lot easier by letting our `makeCssModuleComponent()` function do the heavy lifting and automatically generate all necessary props based on the CSS code.

```js
// src/components/base/css-module-component.js

// ...

const PREFIXES = {
  modifier: '--',
  state: 'is-',
};

const SUFFIXES = {
  modifier: ['-2xs', '-xs', '-s', '-m', '-l', '-xl', '-2xl', '-3xl', '-4xl', /-(.+)\/(.+)[@(.+)]?$/],
};

// ...

function parseProps({ styles }) {
  const props = {};
  const selectors = Object.keys(styles);

  // Find and process state styles (e.g. `is-active`).
  const states = selectors.filter(selector => selector.startsWith(PREFIXES.state));
  for (const state of states) {
    const name = toCamelCase(state);
    // Vue component prop definition.
    props[name] = {
      default: false,
      // This is no default Vue prop property
      // we use this later to dynamically apply
      // the CSS class to our component.
      meta: {
        class: state,
      },
      type: Boolean,
    };
  }

  // Find and process modifier styles (e.g. `--elevated`, `--size-s`).
  const modifiers = selectors.filter(selector => selector.startsWith(PREFIXES.modifier));
  const groups = {};
  for (const modifier of modifiers) {
    const name = modifier.replace(new RegExp(`^${PREFIXES.modifier}`), '');
    const parts = name.split('-');
    const option = parts.pop();
    const suffix = `-${option}`;

    if (SUFFIXES.modifier.some(x => (x.test ? x.test(suffix) : x === suffix))) {
      // Grouped modifiers (e.g. `--size-s`, `--size-m`).
      const groupName = parts.join('-');
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(option);
    } else {
      // Boolean modifiers (e.g. `--elevated`).
      props[name] = {
        default: false,
        meta: {
          class: modifier,
        },
        type: Boolean,
      };
    }
  }

  // Further process grouped modifier styles (e.g. `--size-s`, `--size-m`).
  for (const name of Object.keys(groups)) {
    props[name] = {
      default: null,
      meta: {
        class: `${PREFIXES.modifier}${name}-`,
      },
      type: [Array, String],
    };
  }

  return props;
}

// ...
```

The `parseProps()` function is the most critical function for the final result. Next, we take a look at the `conditionalClasses()` function, which is responsible for dynamically applying the classes onto the root element of our final component.

```js
// src/components/base/css-module-component.js

// ...

function conditionalClasses({ props, propsConfig, styles }) {
  const classData = {};
  for (const name in propsConfig) {
    if (typeof props[name] === 'boolean') {
      classData[styles[propsConfig[name].meta.class]] = props[name];
    } else if (typeof props[name] === 'string') {
      classData[styles[`${propsConfig[name].meta.class}${props[name]}`]] = !!props[name];
    } else if (Array.isArray(props[name])) {
      for (const value of props[name]) {
        classData[styles[`${propsConfig[name].meta.class}${value}`]] = !!value;
      }
    }
  }
  return classData;
}

// ...
```

Now let's update our `makeCssModuleComponent()` function to make use of the two newly added methods.

```js
// src/components/base/css-module-component.js

// ...

export default function makeCssModuleComponent({
  name,
  styles,
}) {
  const propsConfig = parseProps({ styles });
  return {
    name,
    functional: true,
    props: {
      tag: {
        type: String,
        default: 'div',
      },
      ...propsConfig,
    },
    render(h, { children, data, props }) {
      const componentData = {
        class: {
          [styles.root]: styles.root,
          ...conditionalClasses({ props, propsConfig, styles }),
        },
      };

      return h(props.tag, mergeData(data, componentData), children);
    },
  };
}
```

Now we already have reached our goal to provide the same functionality as the specific `BaseCard.vue` component from the beginning. But we can even do better and add prop validation.

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

## Prop validation

Let's take a look at the following example validation console message to see how useful prop validation can be for our use case.

```bash
[Vue warn]: Invalid prop: custom validator check failed for prop "gap".
Available options for `gap` are: `s`, `m`, `l`.
```

Here you can see how we can make this possible without having to do any extra work when creating a new functional component with `makeCssModuleComponent()`.

```js
// src/components/base/css-module-component.js

// ...

function makeValidator({ name, options }) {
  return function validator(value) {
    const values = Array.isArray(value) ? value : [value];
    const isValid = values.every(x => options.includes(x));
    if (!isValid) {
      console.error(
        `Available options for \`${name}\` are: ${options.map(x => `\`${x}\``).join(`, `)}.`,
      );
    }
    return isValid;
  };
}

function parseProps({ styles }) {
  // ...
  
  for (const name of Object.keys(groups)) {
    props[name] = {
      default: null,
      meta: {
        class: `${PREFIXES.modifier}${name}-`,
      },
      type: [Array, String],
      validator: makeValidator({ name, options: groups[name] }),
    };
  }

  return props;
}

// ...
```

## Usage examples

Now let's take a look at a complete usage example.

```html
<!-- src/App.vue -->
<template>
  <BaseLayout gap="m">
    <BaseLayoutItem
      :width="['12/12', '6/12@m', '3/12@l']"
    >
      <BaseCard>
        <BaseCardFigure
          tag="img"
          src="https://via.placeholder.com/250x140"
          alt="Placeholder"
        />
        <BaseCardBody>
          Lorem ipsum ...
        </BaseCardBody>
      </BaseCard>
    </BaseLayoutItem>
    <BaseLayoutItem
      :width="['12/12', '6/12@m', '3/12@l']"
    >
      <BaseCard elevated>
        <BaseCardFigure
          tag="img"
          src="https://via.placeholder.com/250x140"
          alt="Placeholder"
        />
        <BaseCardBody>
          Lorem ipsum ...
        </BaseCardBody>
      </BaseCard>
    </BaseLayoutItem>
  </BaseLayout>
</template>

<script>
import {
  BaseCard,
  BaseCardBody,
  BaseCardFigure,
  BaseLayout,
  BaseLayoutItem,
} from './components/base';

export default {
  name: 'App',
  components: {
    BaseCard,
    BaseCardBody,
    BaseCardFigure,
    BaseLayout,
    BaseLayoutItem,
  },
};
</script>
```

The `BaseCard` and `BaseLayout` components above are automatically generated from corresponding `*.module.scss` files. On the `BaseLayoutItem` component, you can see that the `width` prop can even except an array of `width` options.

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

This was only the first part of how to apply this technique to build powerful functional base components. In my next article, we take a closer look at how we can compose and reuse such functional components. [Follow me on Twitter to not miss the next article](https://twitter.com/MaOberlehner).

Although I think this approach is very mighty, I also sometimes wonder whether we're pushing it too far if we componentize everything. Those relatively simple base components, with only styling and no logic, could be replaced by good old global CSS classes. This is most likely much more performant than using functional Vue.js components.

If you are interested in the pros and cons of using components for styling versus regular global CSS, you can [read my article about Vue.js CSS architecture](/blog/vue-application-structure-and-css-architecture/).
