+++
date = "2017-06-27T19:21:11+02:00"
title = "Dreaming of a Package Based CSS Workflow"
description = "Learn more about building modular CSS architectures using third party packages and tools, which make it possible to use ES6 style import syntax in Sass."
intro = "CSS has quite a bad reputation among programmers of all kinds. CSS to many people is still about problems like seemingly impossible vertical centering, rendering issues across different browsers and unpredictable behaviour in general. Although the first two issues are solved since years and the last one is mostly a problem of developers not knowing the language. But there are new challenges coming up in the fast moving web development world..."
draft = false
categories = ["Development"]
tags = ["CSS", "Sass", "avalanche", "Front-End Architecture", "Workflow"]
+++

CSS has quite a bad reputation among programmers of all kinds. CSS to many people is still about problems like seemingly impossible vertical centering, rendering issues across different browsers and unpredictable behaviour in general. Although the first two issues are solved since years and the last one is mostly a problem of developers not knowing the language.

Another reason why many developers are not very fond of CSS is the massive amounts of poor quality legacy code many of us have to deal with on a regular basis. Bad CSS code is usually written by people who do not know CSS very well. For a long time CSS was not taken seriously enough to be treated as a distinct language so most people didn't bother to learn and understand it to it's core.

In the recent years this has changed for many developers. People began to think about how to structure CSS and how to write durable and easy deletable code. Browser vendors are constantly implementing new features and those are usually adopted pretty fast by all major browsers. CSS has grown up.

But there are new challenges coming up in the fast moving web development world. While JavaScript has evolved to support building modern, modular systems, Bootstrap and Foundation – the two most popular CSS frameworks – are still using a monolithic approach.

## Packages in JavaScript
In recent years JavaScript made the transformation from being  used to add some gimmicky features to static or server side rendered websites, to being a grown up language used to build professional web applications.

With the growing complexity of JavaScript codebases – which is a inevitable side effect when building large scale applications – there was a growing need for new ways of structuring JavaScript code. Dependency management and module loading systems where the logical consequence to this development, which – after many competing custom solutions where invented – finally was addressed in the official specification for ECMAScript 6.

### Problems
Ever since the success of Node.js and the npm package manger, dependency management has arrived in the world of JavaScript development and it is here to stay.

But with all the good things dependency management and third party dependencies have to offer, there are also some problems involved using them. There are security concerns and surely some of you still remember the [left-pad fiasco](https://www.theregister.co.uk/2016/03/23/npm_left_pad_chaos/).

### Problems solved
Although there are serious issues you have to consider when relying on third party code, in this article I want to focus on the positive sides of using small packages for building large scale systems.

The single most important reason why third party packages are so useful in programming, is to avoid reinventing the wheel. Many people would argue, that the functionality `left-pad` provides can be easily implemented by oneself. And this might be true, but when writing code, it is save to say that the code will have bugs, and this is also true for third party code, but in the case of third party code, thousands of people are involved in finding those bugs and even more importantly: there are also dozens of people who are working on fixing those bugs. The best code is the one which you don't have to write and maintain yourself.

If you're integrating third party code into your codebase, there has to be a way to make sure it blends nicely with your own code. ES6 is solving this problem very elegantly with the possibility to rename modules at the time of importing them, so that they fit your code style: `import leftPad as left_pad from 'left-pad'`.

## CSS history
Now that we know how JavaScript has evolved to embrace modularity and enabling package based workflows, let's take a look where CSS stands in those regards.

In the early days of CSS, writing CSS usually meant finding a selector which targets the element you want, open a single CSS file and add a new rule to the bottom of those file. Some more sophisticated folks used to split the CSS into different sections usually named like `header`, `body` and `footer`.

It is funny enough, that CSS has support for `@import` since many years, although it is considered bad practice to use it because of performance implications, I still think it is interesting, that CSS has the most important prerequisite for enabling modularization already baked in since a long time.

## Sass
Because CSS was lacking many features which we're demanded by aspiring CSS architects, CSS preprocessors like LESS and Sass came up.

Due to the general theme of this article I'm going to focus on the possibility to use Sass features for integrating third party CSS packages into your custom codebase.

### @import
Although – as I already mentioned – CSS had support for `@import` since many years, only Sass which preprocesses and – more importantly – concatenates imported files, made it possible to actually use this feature. This allowed for modularizing huge CSS codebases but still didn't provide a satisfying solution for integrating third party CSS. But enhanced importing capabilities are not the only new feature which Sass brings to the table in that regard.

### @extend
Another feature which can be used to write more modular CSS is `@extend`. This makes it possible to extend the styles of certain CSS classes.

```scss
@import 'node_modules/some-package/containing/someSelector.scss';

.some-selector {
  @extend .someSelector;
  // Additional custom styling.
  color: blue;
}
```

As you can see in the example above `@extend` solves the problem of renaming imported classes so they fit the coding style of your project and it also makes it possible to add additional stylings or even override some of the extended styles. But there are also some problems related to the use of `@extend`.

- Although you effectively can use `.some-selector` as an alias of `.someSelector` the `.someSelector` class is still imported which makes it possible to use it, and if it's possible to use it, chances are some developer will use it.
- You have to define your own class instead of simply renaming it directly in the import statement.
- According to an article written by Harry Roberts using [@include and mixins is better for performance](https://csswizardry.com/2016/02/mixins-better-for-performance/).

### @include
Mixins in combination with `@include` are also a way to achieve a similar outcome to ES6 imports.

```scss
@import 'node_modules/some-package/containing/some-mixin.scss';

.some-selector {
  @include some-mixin();
  // Additional custom styling.
  color: blue;
}
```

Like `@extend` `@include` makes it possible to define your own class name and to override certain properties, but there are still downsides to this approach. Again you have to define your own class instead of simply renaming it in the import statement and overall the experience isn't as convenient as it is in JavaScript when using ES6 imports.

## node-sass-magic-importer
Because I was not satisfied with the tools Sass is providing in regards to integrating third party packages into your codebase I started to work on [node-sass-magic-importer](https://github.com/maoberlehner/node-sass-magic-importer). At it's core `node-sass-magic-importer` enhances the default `node-sass` `@import` functionality with features we already know from ES6 style JavaScript import statements.

```scss
@import '{
  .btn as .button,
  .btn-alert as .button--alert
} from button.scss';
```

As you can see in the example above, `node-sass-magic-importer` makes it possible to import only certain selectors from a Sass file and even further it is possible to rename selectors directly in the import statement.

```scss
// Import the file that is specified in the `package.json` file of the module.
@import '~bootstrap';
```

Another convenience feature `node-sass-magic-importer` is providing, is module importing. In the example above you can see that a `~` prefix can be used to load the main stylesheet file defined in the packages `package.json` file without pointing to the exact path of the `.scss` file inside your `node_modules` directory.

I really believe that the enhanced importing features `node-sass-magic-importer` is offering are raising the possibilities, of modularizing CSS code, to the next level. I hope that at some point in the future Sass will implement features like importing specific selectors and renaming them natively. There already is an [issue tracking similar feature requests](https://github.com/sass/sass/issues/1094).

## avalanche
To demonstrate the principles of my vision for the future of package based CSS workflows, I created the package based CSS framework [avalanche](https://avalanche.oberlehner.net/). Instead of building one giant monolithic framework, every component of avalanche is a distinct npm package.

Using only certain parts of the framework doesn't require users to create a custom build using an UI on a website. Not only is this a very inconvenient way of dealing with this problem, it also fails important principles for creating code that is not only extendable but – even more importantly – also easy deletable. By creating a custom build upfront most people will choose features they might or might not use in there final codebase which leads to a bloated codebase right at the beginning.

## Implementing a package based CSS workflow with avalanche and Vue.js
On my journey of writing the most modular, extendable and delete key friendly frontend code, I ended up with a combination of `node-sass` + `node-sass-magic-importer`, the avalanche CSS framework and the Vue.js JavaScript framework.

Combining those technologies makes it possible to build self contained frontend modules. Using external dependencies from npm via ES6 style import syntax – thanks to `node-sass-magic-importer` – makes it possible to build complex components very fast without reinventing the wheel over and over again.

```html
<template>
  <button class="c-button" @click="handleClickEvent">
    <slot></slot>
  </button>
</template>

<script>
export default {
  methods: {
    handleClickEvent() {
      this.$emit('cButtonClick');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '{ .c-button } from ~@avalanche/component-button';

.c-button {
  border-radius: 0.25em;
}
</style>
```

In this example of a single file Vue.js button component you can see above, all the styles are imported from the third party [avalanche button package](https://avalanche.oberlehner.net/packages/component-button/).

Writing your frontend code that way solves multiple problems when developing big systems.

- No unused CSS code: deleting all the modules where the `@avalanche/component-button` package is used, also removes the packages code from your outputted bundle.
- No constant reinventing of the wheel: the `@avalanche/component-button` and other packages can be used across thousands of projects as a solid starting point for styling your components.
- No global leaking styles: although the global nature of CSS can also be a good thing in some circumstances, Vue.js single file components make it possible to scope certain styles to a certain component, this is a huge advantage when working on very big projects which consist of dozens or maybe even hundreds of components.

## The future is now
Modern build tools like Sass, webpack and `node-sass-magic-importer` make building highly modular frontend code, using third party packages from npm, an easy task.

Frontend frameworks like Vue.js and React are embracing modularity and extensibility. I think we're just scratching the surface of what is possible and how to implement efficient workflows around this tools, but there is a bright future ahead of us.
