+++
date = "2016-12-30T09:15:05+02:00"
title = "Building avalanche 4.x.x"
description = "Thoughts about building avalanche, a package based CSS framework."
intro = "Up until a few years ago, most people didn't put much thought into „CSS architecture“ (I'm quite sure it wasn't even a thing). Around the year 2009 some sophisticated fronted folks (most notably Nicole Sullivan) started talking about concepts like OOCSS..."
draft = false
categories = ["Development"]
tags = ["CSS", "SCSS", "CSS architecture", "avalanche"]
aliases = ["/blog/2016/12/building-avalanche-v4/"]
+++

Up until a few years ago, most people didn't put much thought into „CSS architecture“ (I'm quite sure it wasn't even a thing). Around the year 2009 some sophisticated fronted folks (most notably Nicole Sullivan) started talking about concepts like [OOCSS](http://de.slideshare.net/stubbornella/object-oriented-css).

```css
/* Typical CSS code, ca. 2010 */
.selector ul > li #imAnID {
  background-color: hotpink !important;
}
```

I tinkered around with OOCSS and really liked it, so I started to build some reusable components and used them for my personal projects. Life was nice and easy.

In the year 2011 Bootstrap was released and quickly gained traction. Although I liked many parts of Bootstrap, there were some aspects I didn't agree with. So as almost every self respecting programmer does at some point in life, I made a momentous decision: I should make my own framework.

**avalanche** was born ([obligatory XKCD link](https://xkcd.com/927/)).

## avalanche 2.x.x and 3.x.x
**avalanche** 1.x.x was basically a collection of BEM style OOCSS components. It was not until version 2.x.x when it became interesting.

I moved all components into separate GitHub repositories and made them work as [Bower](https://bower.io/) packages. I also split the packages into different types (mostly based on the [ITCSS convention](http://csswizardry.net/talks/2014/11/itcss-dafed.pdf)).

The biggest change from version 2.x.x to 3.x.x was the switch to NPM instead of Bower. With version 3.x.x I also tried to use SASS to it's limits and made almost every aspect of the packages configurable.

```scss
// 3.x.x example code (grid object package).
.#{$o-grid-namespace} {
  @include o-grid($o-grid-flex, $o-grid-flex-fallback);
  @if $o-grid-spaced-vertical-default-size {
    @include o-grid-spaced-vertical(map-get($spacing, $o-grid-spaced-vertical-default-size), '.#{$o-grid-namespace}__item');
  }
  @if $o-grid-spaced-horizontal-default-size {
    @include o-grid-spaced-horizontal(map-get($spacing, $o-grid-spaced-horizontal-default-size), '.#{$o-grid-namespace}__item');
  }
}

.#{$o-grid-namespace}__item {
  @include o-grid-item($o-grid-flex, $o-grid-flex-fallback);
}
```

This was powerful and flexible but also very hard to explain to other developers. One other major pain point still existed in version 3.x.x – packages depended on the **avalanche** core and were not usable without it.

## 4.x.x
I already knew that a package based workflow is superior to a monolithic approach but one thing I learned from my experiences building and using **avalanche** was: it is very hard to build reusable packages.

One of the biggest problems with package based CSS workflows I encountered is, that CSS and even SASS or LESS, do not provide all the tools necessary to efficiently integrate packages into your project.

```js
// JavaScript modules are awesome.
import { Stuff, OtherStuff } from 'SomeModule';
```

### We need more tooling
In the JavaScript world this problem is solved since a few years. The `require()` syntax and more recently the standard ES6 `import` syntax, do solve this problem very elegantly. But those are solutions which are only possible thanks to tooling. Not even the latest modern browsers do support `import`.

Ironically CSS supports `@import` natively since at least 15 years. But until the invention of preprocessors like SASS and LESS it was almost useless. And even with preprocessors, the `@import` rule is still lacking functionality.

1. **Multiple imports of the same file**  
Preprocessors do import a file multiple times when they encounter the same `@import` rule multiple times in the code, which leads to code duplication.
2. **Importing only specific selectors**  
In the front-end world every byte matters and therefore it is quite costly to `@import` a complete package if you just need one class from it.
3. **Selectors should match the projects naming convention**  
If you use a third party CSS package, you do not want to end up with a mixture of different naming conventions for CSS selectors.

For my idea of how **avalanche** 4.x.x should work, I needed a solution for those three problems. Thats why I built [node-sass-magic-importer](https://github.com/maoberlehner/node-sass-magic-importer), a custom node-sass importer.

### Standalone packages
What really bothered me with version 3.x.x was that all the packages still depended on the core **avalanche** package. With version 4.x.x packages are built in a way so that they can work standalone.

Packages are now way less configurable but thanks to the [node-sass-magic-importer](https://github.com/maoberlehner/node-sass-magic-importer) most of the configuration options aren't necessary anymore. Instead of controlling the output of packages with variables, the user can import only the selectors he needs from the package.

```scss
// Importing only specific selectors from an avalanche 4.x.x package.
@import '{ .u-width-12/12, .u-width-4/12@m } from ~@avalanche/utility-width';

// Replace selectors to match the projects naming convention.
@import '{ .u-width-6/12 as .half-width } from ~@avalanche/utility-width';
```

### Monorepo
Splitting packages in separate git repositories was a nice idea but it led to a lot of code duplication and overall more maintenance work.

Some big open source projects recently made the switch to a monorepo structure (e.g. [Babel](https://github.com/babel/babel/blob/master/doc/design/monorepo.md)). At first it really seems counter intuitive to make a monorepo for building a package based CSS framework.

Using packages is easier when they are tiny and easy to understand without having to know anything about the code but building them is much more painless if you can see the big picture. Thinking about it that way, supports the case for a monorepo approach.

### Testing
Being an open source maintainer really made me fall in love with automated testing. Without tests you can't be sure if a bugfix or a new feature didn't break something in your project. You live in constant fear that, after a new release, bug report notifications flood your inbox.

Although automated tests are not a huge thing in the CSS world, I really wanted to have a system in place to prevent me from releasing faulty code.

Every **avalanche** 4.x.x package comes with it's own regression tests and a new release is only created if all the packages pass their tests. [BackstopJS](https://github.com/garris/backstopjs) is used to run the tests.

## Conclusion
For now I'm quite happy with the latest release of **avalanche**. I made the packages work standalone, optimized the development process by using a monorepo approach and made development less fragile by adding regression tests.

I do not expect for **avalanche** to be the next Bootstrap or even to be used by many people. Although what I hope for is, that other people keep working on better ways of building design systems with CSS and that **avalanche** may serve as an inspiration for some of those people.
