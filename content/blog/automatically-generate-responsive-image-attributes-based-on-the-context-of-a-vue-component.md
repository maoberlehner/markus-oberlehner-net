+++
date = "2020-08-23T08:28:28+02:00"
title = "Automatically Generate Responsive Image Attributes Based on the Context of a Vue Component"
description = "Learn how to automatically generate srcset and sizes attributes for responsive images based on context."
intro = "Recently I saw an interesting Tweet by Mark Dalgleish, about the idea of contextual defaults for React components. I was especially interested in this because I had to solve a similar problem only a few days before..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:36E684,f_auto,q_auto,w_1014,h_510/v1542158521/blog/2020-08-23/width-provider"]
+++

Two weeks ago, we explored how we can make Vue components aware of their context and change their props accordingly. We used this technique to detect the background context of a component to adapt its background color and styling. Today we use the same approach but take it a step further: we identify the approximate width of the context in which we render an image component so that we can automatically generate `srcset` and `sizes` attributes that match our breakpoints.

For this concept to work, we need to have an image service that makes it possible to dynamically generate images at different sizes via URL parameters.

```bash
# Image URL with `w` and `h` parameters.
https://images.unsplash.com/photo-1585108592681-d0db82bab204?auto=format&fit=crop&q=80&w=300&h=300
```

## Approximating a fitting image size

It is important to mention that the approach we use in this article has nothing to do with detecting an image's exact width by getting the current dimensions via JavaScript from the client. This would not work for SSR. We want to get the approximate width of an image given the context (container or grid component, for example) in which we place it. Based on the `srcset` and `sizes` information, the browser can then decide which image size to load.

## The concept

Let's take a quick look at the basic concept of what we are trying to achieve.

```js
// src/config/breakpoints.js
export const breakpoints = {
  default: 0,
  xs: 376,
  s: 768,
  m: 1024,
  l: 1280,
  xl: 1920,
};
```

```html
<template>
  <ProvideWidth :width="[375, '767@xs', '1023@s', '1279@m', '1919@l', '2559@xl']">
    <BaseGrid>
      <BaseGridItem :width="['12/12', '6/12@m']">
        <!-- Image 1 -->
        <BaseImage
          aspect-ratio="16/9"
          src="/some-image.jpg"
        />
      </BaseGridItem>
      <BaseGridItem :width="['12/12', '6/12@m']">
        <BaseGrid>
          <BaseGridItem :width="['12/12', '6/12@m']">
            <!-- Image 2 -->
            <BaseImage
              aspect-ratio="4/3"
              src="/some-image.jpg"
            />
          </BaseGridItem>
        </BaseGrid>
      </BaseGridItem>
    </BaseGrid>
  </ProvideWidth>
</template>
```

At the top level, we see a `<ProvideWidth>` component. Here we define that by default, our viewport is `375px` max; at the `xs` breakpoint, it is `767px` max, at the `s` breakpoint, it is `1023px` max, and so on. The max-width for a specific breakpoint is always `1px` less than the next breakpoint size. So if the `m` breakpoint size is `1024px`, a full-width image can become maximum `1023px` wide at the `s` breakpoint because as soon as we reach the `m` breakpoint, the new max image width of the `m` breakpoint takes effect.

This means that our `Image 1` that is rendered inside of a `<GridItem>` which is `12/12` or 100% wide by default and `6/12` or 50% wide starting from breakpoint `m`, should be `375px` wide from `default` to the `xs` breakpoint, `767px` wide from `xs` to the `s` breakpoint, and `640px` (1279 / 2) wide from the `m` breakpoint to the `l` breakpoint, then 1919 / 2, then 2559 / 2.

For `Image 2` it gets a little bit more complicated. The default size is the same because 100% of 100% are 100%. But at the `m` breakpoint it gets interesting. Now this image is 50% of 50% = 25% wide because the parent container is also only 50% wide. The image sizes have to be calculated accordingly.

```html
<img
  src="/some-image?w=375&h=211"
  srcset="
    /some-image?w=375&h=211 375w,
    /some-image?w=767&h=431 767w,
    /some-image?w=1023&h=575 1023w,
    /some-image?w=320&h=180 320w,
    /some-image?w=480&h=270 480w,
    /some-image?w=640&h=360 640w"
  sizes="
    (min-width: 1920px) 640px,
    (min-width: 1280px) 480px,
    (min-width: 1024px) 320px,
    (min-width: 768px) 1023px,
    (min-width: 376px) 767px,
    375px"
  width="375"
  height="211"
  class="BaseImage"
>
```

Above, you see the desired output. Our `BaseImage` component should dynamically generate the `srcset` and `sizes` attributes according to the context in which we put it.

<div class="c-content__broad">
  <iframe src="https://codesandbox.io/embed/responsive-image-attributes-based-on-the-context-of-a-vue-component-uk45t?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="Responsive Image Attributes Based on the Context of a Vue Component"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
  ></iframe>
</div>

## Generating the image sizes depending on the context

Now let's take a look at the implementation of this concept. Next, you can see the `ProvideWidth` context provider component responsible for calculating the width based on the width passed via the `width` prop or calculated based on the context width injected from a `ProvideWidth` provider on a higher level.

```html
<template>
  <slot/>
</template>

<script>
import {
  computed,
  inject,
  provide,
} from 'vue';

import { asArray } from '../utils/as-array';
import { breakpoints } from '../config/breakpoints';
import { isNumber } from '../utils/is-number';
import { toString } from '../utils/to-string';

const DEFAULT_BREAKPOINT = 'default';

export const WidthProviderSymbol = Symbol('Width provider identifier');

function useBreakpointWidthsRatios(responsiveWidthOrWidths) {
  return computed(() => {
    const breakpointWidthsRatios = {};
    const responsiveWidths = asArray(responsiveWidthOrWidths);

    for (const responsiveWidth of responsiveWidths) {
      const [width, breakpoint] = toString(responsiveWidth).split('@');
      breakpointWidthsRatios[breakpoint || DEFAULT_BREAKPOINT] = width;
    }

    return breakpointWidthsRatios;
  });
}

function useBreakpointWidths({ breakpointWidthsRatios, parentBreakpointWidths }) {
  return computed(() => {
    const breakpointWidths = {};

    let width = '12/12';
    for (const breakpoint of Object.keys(breakpoints)) {
      // If there is no width for a certain breakpoint we assume full
      // width or the same width as at the previous breakpoint.
      width = breakpointWidthsRatios.value[breakpoint] || width;

      if (isNumber(width)) {
        breakpointWidths[breakpoint] = parseInt(width, 10);
        continue;
      }

      const [columns, maxColumns] = width.split('/').map(x => parseInt(x, 10));
      const factor = columns / maxColumns;

      breakpointWidths[breakpoint] = Math.round(parentBreakpointWidths.value[breakpoint] * factor);
    }

    return breakpointWidths;
  });
}

export default {
  props: {
    width: {
      required: true,
      type: [Array, Number, String],
    },
  },
  setup(props) {
    const parentBreakpointWidths = inject(WidthProviderSymbol, { [DEFAULT_BREAKPOINT]: 375 });
    const breakpointWidthsRatios = useBreakpointWidthsRatios(props.width);
    const breakpointWidths = useBreakpointWidths({
      breakpointWidthsRatios,
      parentBreakpointWidths,
    });

    provide(WidthProviderSymbol, breakpointWidths);
  },
};
</script>
```

The `width` prop is a little magical. If we pass in a specific `width` as a `Number`, it is overruling everything coming from its context. But if we don't pass in a `Number`, we have to specify the width as a fraction e.g., `6/12` for 50% width or `6/12@m` for 50% width at the `m` (medium) breakpoint. The fraction is always relative to the context width. If the context says it is `600` (px) wide, `6/12` of that is `300`.

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

In the following example you can see how we can use the `ProvideWidth` context provider component inside of our `BaseGridItem` and `BaseImage` components.

```html
<template>
  <ProvideWidth :width="width">
    <div
      class="BaseGridItem"
      :class="widths.map(x => `width-${x}`)"
    >
      <slot/>
    </div>
  </ProvideWidth>
</template>

<script>
import { computed } from 'vue';
import { asArray } from '../utils/as-array';
import ProvideWidth from './ProvideWidth.vue';

export default {
  name: 'BaseGridItem',
  components: {
    ProvideWidth,
  },
  props: {
    width: {
      default: '12/12',
      type: [Array, String],
    },
  },
  setup(props) {
    const widths = computed(() => asArray(props.width));

    return { widths };
  },
};
</script>
```

The `BaseGridItem` component uses the provider component to specify how the width context is affected by this component.

```html
<template>
  <img
    :src="attributes.src"
    :srcset="srcset || attributes.srcset"
    :sizes="sizes || attributes.sizes"
    :width="width || attributes.width"
    :height="height || attributes.height"
    class="BaseImage"
  >
</template>

<script>
import {
  computed,
  inject,
} from 'vue';

import { breakpoints } from '../config/breakpoints';
import { calcAspectRatio } from '../utils/calc-aspect-ratio';

import { WidthProviderSymbol } from './ProvideWidth.vue';

function appendDimensions(src, { width, height }) {
  const srcUrl = new URL(src);
  srcUrl.searchParams.append('w', width);
  srcUrl.searchParams.append('h', height);

  return srcUrl.toString();
}

function useAttributes({ breakpointWidths, props }) {
  return computed(() => {
    if (props.width || props.height) {
      const { width, height } = calcAspectRatio(props.aspectRatio, {
        width: props.width,
        height: props.height,
      });

      return {
        src: appendDimensions(props.src, { width, height }),
        srcset: `${appendDimensions(props.src, { width: width * 2, height: height * 2 })} 2x`,
        sizes: null,
        width,
        height,
      };
    }

    const srcset = [];
    const sizes = [];
    const attributes = {
      src: null,
      srcset: null,
      sizes: null,
      width: null,
      height: null,
    };

    Object.keys(breakpointWidths.value).forEach((breakpoint) => {
      const width = breakpointWidths.value[breakpoint];
      const { height } = calcAspectRatio(props.aspectRatio, { width });
      const src = appendDimensions(props.src, { width, height });

      if (breakpoint === 'default') {
        attributes.src = src;
        attributes.width = width;
        attributes.height = height;
      }

      srcset.push(`${src} ${width}w`);
      sizes.push(`${breakpoints[breakpoint] ? `(min-width: ${breakpoints[breakpoint]}px) ` : ''}${width}px`);
    });

    attributes.srcset = srcset.join(', ');
    attributes.sizes = [...sizes].reverse().join(', ');

    return attributes;
  });
}

export default {
  props: {
    aspectRatio: {
      default: '16/9',
      type: String,
    },
    width: {
      default: null,
      type: Number,
    },
    height: {
      default: null,
      type: Number,
    },
    src: {
      required: true,
      type: String,
    },
    srcset: {
      default: null,
      type: String,
    },
    sizes: {
      default: null,
      type: String,
    },
  },
  setup(props) {
    const breakpointWidths = inject(WidthProviderSymbol);
    const attributes = useAttributes({ breakpointWidths, props });

    return { attributes };
  },
};
</script>

<style>
.BaseImage {
  width: 100%;
  height: auto;
  vertical-align: middle;
}
</style>
```

In the `BaseImage` component, we inject the width context and use the information we get from it to generate the different `sizes` and `srcset` URLs.

## Wrapping it up

For now, this is only an experimental concept that I don't use yet in production. But so far I like it very much. It makes it easier to build generic components where the images are always the correct size, regardless of the components' context.
