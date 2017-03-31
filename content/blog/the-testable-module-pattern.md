+++
date = "2017-02-12T10:19:05+02:00"
title = "The testable module pattern"
description = "The testable module pattern is a pattern to write JavaScript modules which are fully testable by unit tests but also easy to use without the overhead of directly using a factory function."
intro = "This is a pattern to write JavaScript modules which are fully testable by unit tests but also easy to use without the overhead of directly using a factory function. You might use this pattern when you want to use unit tests but you do not want to give up on the flexibility of a modular, dependency based approach of structuring your code..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "TDD", "dependency injection"]
aliases = ["/blog/2017/02/the-testable-module-pattern/"]
+++

This is a pattern to write JavaScript modules which are fully testable by unit tests but also easy to use without the overhead of directly using a factory function.

You might use this pattern when you want to use unit tests but you do not want to give up on the flexibility of a modular, dependency based approach of structuring your code.

The testable module pattern builds upon the traditional approach of using dependency injection in combination with a factory function to make modules testable.

## Dependency injection and the factory pattern
In my last blog article I wrote about how to make a module testable by using a factory function for injecting dependencies into a function.

```js
export function formatValues({ Math, chalk }, values) {
  const minValue = Math.min(...values);
  return values.map((value) => {
    if (value === minValue) return chalk.bold.green(value);
    return value;
  });
}

export default function formatValuesFactory(dependencies) {
  return formatValues.bind(null, dependencies);
};
```

This is solving the problem of making the code testable very well but although the factory function makes it easier to use the function, it is still more work as if we were using a regular module.

```js
// Usage of the formatValues module.
import chalk from 'chalk';
import formatValuesFactory from './format-values';

const formatValues = formatValuesFactory({ Math, chalk });

const formattedValues1 = formatValues([1, 2, 3]);
const formattedValues2 = formatValues([3, 2, 1]);
```

We only have to initialize the `formatValues` function once but we still have to do this either in a controller file and pass the dependency down to our modules or we have to do this in every module that is using the function. Either way there is quite some overhead.

## Using the testable module pattern
The testable module pattern is an extended variation of the dependency injection and factory function based approach shown in the previous example.

It combines the enhanced testability of the factory function based approach with the simplicity of traditional, self contained modules.

```js
import chalk from 'chalk';

export function formatValues({ Math, chalk }, values) {
  const minValue = Math.min(...values);
  return values.map((value) => {
    if (value === minValue) return chalk.bold.green(value);
    return value;
  });
}

export function formatValuesFactory(dependencies) {
  return formatValues.bind(null, dependencies);
};

export default formatValuesFactory({ Math, chalk });
```

We changed our initial example by importing the `chalk` dependency like you would do when writing a regular module. And we changed the default export to run the `formatValuesFactory` with the imported dependency (and the native `Math` object).

Now we have the best of two worlds. We can use the [named exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#Using_named_exports) of `formatValues` and the `formatValuesFactory` for writing unit tests or whenever we need full control of which dependencies we want to inject. Or we can use the default export to just use our module without further caring about it's dependencies.

```js
// Regular usage example.
import formatValues from './format-values';

const formattedValues = formatValues([1, 2, 3]);
```

```js
// Test usage example.
import { formatValuesFactory } from './format-values';

test(`Some test case.`, (t) => {
  const Math = fakeMath();
  const chalk = fakeChalk();
  const formatValues = formatValuesFactory({ Math, chalk });
  // ...
});
```

### Simplified testable module pattern
You may decide that you do not need the extra factory function because you're either using the default export in your production code or the named export of `formatValues` for testing. In this case you can further simplify the pattern by removing the factory function.

```js
import chalk from 'chalk';

export function formatValues({ Math, chalk }, values) {
  const minValue = Math.min(...values);
  return values.map((value) => {
    if (value === minValue) return chalk.bold.green(value);
    return value;
  });
}

export default formatValues.bind(null, { Math, chalk });
```

## Potential downsides of the testable module pattern
One potential downside of this approach is, that you're loading the dependencies of the module no matter if you're using them or not. If you're just importing the factory function and inject your own dependencies, you're still loading the dependencies which are defined in the module. The way I would use this approach is to always use the default export in production code. I would only use the named exports for testing where it doesn't matter (that much) to use a little more resources than necessary.

If you're planing to build modules which you want to initialize with different dependencies, depending on the situation you're using them in, you might be better off with the traditional factory function approach.
