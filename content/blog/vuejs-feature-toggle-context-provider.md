+++
date = "2020-10-25T06:47:47+02:00"
title = "Vue.js Feature Toggle Context Provider"
description = "Learn how to implement feature toggles in a Vue.js application with the Context Provider Pattern."
intro = "Some time ago, I read a very informative article by Pete Hodgson about feature toggles. I'm thinking a lot about the Context Provider Pattern and the types of problems it can help solve, and it appeared to me as if feature toggles are one of the use cases where this pattern can provide a lot of o value..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:EFEFEF,f_auto,q_auto,w_1014,h_510/v1542158522/blog/2020-10-25/feature-toggle-context-provider"]
+++

Some time ago, I read a very [informative article by Pete Hodgson about feature toggles](https://www.martinfowler.com/articles/feature-toggles.html). The article goes into much detail, and I highly recommend you read it if you want to implement feature toggles yourself. Currently, I'm thinking a lot about the [Context Provider Pattern](https://markus.oberlehner.net/blog/context-and-provider-pattern-with-the-vue-3-composition-api/) and the types of problems it can help solve, and it appeared to me as if feature toggles are one of the use cases where this pattern can provide a lot of o value.

## Naive Approach

There are a ton of different use cases for feature toggles. Starting from simple configuration files in code to features configurable via admin panels or by the users themselves. If what you need for your application is a simple switch for a handful of features toggled via a configuration file, you might very well go for a solution like this and call it a day.

```html
<!-- src/components/WidgetVisitors.vue -->
<template>
  <div>
    <!-- ... -->
    <button
      v-if="hasExportCsv"
      @click="$emit('export')"
    >
      Export CSV
    </button>
  </div>
</template>

<script>
import { features } from '../config/features';

export default {
  name: 'WidgetVisitors',
  setup() {
    const hasExportCsv = features.isEnabled('EXPORT_CSV');
    
    return { hasExportCsv };
  },
};
</script>
```

Here we can see how we can solve this most straightforwardly. We directly import the `features` object and call the `isEnabled()` method with a magic string as an identifier for the feature we need to decide if it should be activated or not.

This has a couple of problems:

- Tight coupling to the `features` object (which might rely on data from an API).
- We are using a [magic string as an identifier](https://twitter.com/MaOberlehner/status/1319900981392515073) for the feature. This means we are prone to typos, and this makes it hard to refactor.

Ideally, our lower-level components do not need to know that there is a feature decision system in place.

## Feature Decision Context

Suppose we frame the feature toggle problem a little bit differently. In that case, we realize that we can provide feature decisions as a context in which our application's components function.

First, let's look at the `features.js` configuration file.

```js
// src/config/features.js
export const EXPORT_CSV = Symbol('Experimental CSV export.');

export const decisions = {
  [EXPORT_CSV]: true, // Can be set via ENV variables.
};

export function isEnabled(decision) {
  return decisions[decision];
}
```

Now we can create a simple `FeatureDecisionsContext` that helps us provide feature decisions for all of our application components.

```html
<!-- src/components/ProvideFeatureDecisions.vue -->
<template>
  <slot/>
</template>

<script>
import { provide } from 'vue';

import {
  decisions,
  isEnabled,
} from '../config/features';

export const FeatureDecisionsProviderSymbol = Symbol('Feature decisions provider identifier');

export default {
  setup() {
    provide(FeatureDecisionsProviderSymbol, {
      decisions,
      isEnabled,
    });
  },
};
</script>
```

```html
<!-- src/components/App.vue -->
<template>
  <ProvideFeatureDecisions>
    <!-- ... -->
  </ProvideFeatureDecisions>
</template>

<script>
import ProvideFeatureDecisions from './ProvideFeatureDecisions.vue';

export default {
  name: 'App',
  components: { ProvideFeatureDecisions },
};
</script>
```

Now we can inject the `isEnabled()` method into our components to decide if a certain feature should be activated or not.

```html
<!-- src/components/WidgetVisitors.vue -->
<template>
  <!-- ... -->
</template>

<script>
import { computed, inject } from 'vue';

import { EXPORT_CSV } from '../config/features';

import { FeatureDecisionsProviderSymbol } from './ProvideFeatureDecisions.vue';

export default {
  name: 'WidgetVisitors',
  setup() {
    const features = inject(FeatureDecisionsProviderSymbol);
    const hasExportCsv = computed(() => features.isEnabled(EXPORT_CSV));
    
    return { hasExportCsv };
  },
};
</script>
```

Although it comes with the considerable tradeoff of a more complex set up, there are some improvements to the naive implementation from earlier. We have decoupled our component from a concrete implementation of `features.isEnabled()`, which is important for testing, and we now use a unique `Symbol` instead of a magic string. For many use cases, especially when you have just a few temporary feature toggles, this is probably a good enough solution. We can make an additional improvement by deciding if the feature should be used or not in the parent component of `WidgetVisitors`. Hence, we keep this very generic component clean from any special feature logic.

```html
<!-- src/components/TheDashboard -->
<template>
  <div>
    <WidgetUsageStats :enable-export-csv="hasExportCsv"/>
    <WidgetVisitors :enable-export-csv="hasExportCsv"/>
    <!-- ... -->
  </div>
</template>

<script>
import { inject } from 'vue';

import { EXPORT_CSV } from '../config/features';

import { FeatureDecisionsProviderSymbol } from './ProvideFeatureDecisions.vue';
import WidgetUsageStats from './WidgetUsageStats.vue';
import WidgetVisitors from './WidgetVisitors.vue';

export default {
  name: 'TheDashboard',
  components: {
    WidgetUsageStats,
    WidgetVisitors,
  },
  setup() {
    const features = inject(FeatureDecisionsProviderSymbol);
    const hasExportCsv = computed(() => features.isEnabled(EXPORT_CSV));
    
    return { hasExportCsv };
  },
};
</script>
```

Here we moved the feature decision one level up. As you can see in this example, this also leads to a more DRY codebase because we have multiple widgets that need to know if they should show a button for exporting CSV files or not. Now they get this information via a prop `enable-export-csv` from their parent component.

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

## Feature-Aware Components

In one of my recent articles, I wrote about [how to create context-aware components with Vue.js](/blog/context-aware-props-in-vuejs-components/#the-context-aware-component-pattern). We can use the same approach to build feature-aware components.

We can use the `contextAwareComponentFactory()` from my earlier article to make components aware of the feature decisions provided by `ProvideFeatureDecisions.vue`.

```html
<!-- src/components/WidgetVisitors.vue -->
<template>
  <!-- ... -->
</template>

<script>
import { EXPORT_CSV } from '../config/features';

import { contextAwareComponentFactory } from '../utils/context-aware-component-factory';

import { FeatureDecisionsProviderSymbol } from './ProvideFeatureDecisions.vue';

const WidgetVisitors = {
  name: 'WidgetVisitors',
  props: {
    enableExportCsv: {
      default: false,
      type: Boolean,
    },
  },
};

export const WidgetVisitorsContextAware = contextAwareComponentFactory(WidgetVisitors, {
  contextId: FeatureDecisionsProviderSymbol,
  contextAwareProps: {
    enableExportCsv: {
      adapter: context => context.isEnabled(EXPORT_CSV),
    },
  },
});

export default WidgetVisitors;
</script>
```

```html
<!-- src/components/TheDashboard -->
<template>
  <div>
    <WidgetUsageStatsContextAware/>
    <WidgetVisitorsContextAware/>
    <!-- ... -->
  </div>
</template>

<script>
import { WidgetUsageStatsContextAware } from './WidgetUsageStats.vue';
import { WidgetVisitorsContextAware } from './WidgetVisitors.vue';

// ...
</script>
```

In the example above, we can see how we can use the context- and feature-aware component inside of our application. You can see that we're not leaking any feature decision logic into the higher-level component where we use the feature-aware component, except that we're explicit about the fact that the component is context-aware. Depending on your application's overall architecture, you might decide to make context-aware components the norm and discourage using the default export.

Although this is quite an improvement over our naive approach, we still have not entirely separated the component from the feature decision logic. Again, depending on your architecture, you might be ok with that, or you can decide to completely separate the creation of feature-aware components from the components themselves. By that, I mean that, for example, you create a new file `feature-aware-components.js` in which you use the factory function to make all the feature-aware variants of your components. However, this approach might fall apart if you have components that need to be aware of multiple contexts, not only feature decisions. But I leave it to you to solve this problem in a way that fits the needs of your application.

## Wrapping It Up

No matter how good the design is to implement them, feature toggles add complexity. But that’s ok. Our job as developers is to tame complexity. Suppose we add an inherently complex feature like feature toggles to our applications. In that case, we have to be especially careful to implement it to keep the complexity manageable and prevent it from growing exponentially with the number of feature toggles that get added to our system. Depending on the circumstances, this can either mean that we should keep the implementation as straightforward as possible (naive implementation, in the case of a small application) or need a more scaleable and testable solution (for large applications with dozens or even hundreds of feature toggles).
