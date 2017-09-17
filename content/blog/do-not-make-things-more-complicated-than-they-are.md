+++
date = "2017-09-17T06:56:54+02:00"
title = "Don't Make Things More Complicated than They Are"
description = "Thoughts about overthinking programming problems and how to deal with issues which seem to be too complicated to solve."
intro = "Yesterday I’ve learned a valuable lesson in how to solve a problem by looking at it from a different angle. The longest open issues in the node-sass-magic-importer GitHub issue queue, is about source map support..."
draft = false
categories = ["Development"]
tags = ["Workflow", "SCSS"]
+++

Yesterday I’ve learned a valuable lesson in how to solve a problem by looking at it from a different angle.

The longest open issues in the [node-sass-magic-importer GitHub issue queue](https://github.com/maoberlehner/node-sass-magic-importer/issues), is about source map support. A source map maps from the transformed source (CSS) served to the browser to the original source (SCSS), enabling the browser to reconstruct the original source and present the reconstructed original in the developer tools.

## The problem
Certain import methods like [selector filtering](https://github.com/maoberlehner/node-sass-magic-importer/tree/master/packages/node-sass-magic-importer#selector-filtering) or [node filtering](https://github.com/maoberlehner/node-sass-magic-importer/tree/master/packages/node-sass-magic-importer#node-filtering), provided by node-sass-magic-importer, do remove code from the input files. This is done with the help of PostCSS.

PostCSS is able to create source maps mapping the new source (missing certain selectors or nodes) to the old source so that the line numbers do match correctly. So far so good, but after node-sass-magic-importer has removed certain nodes from the source with PostCSS, the result is passed to node-sass.

Although PostCSS generates a source map and node-sass generates a source map too, node-sass is not able to apply the mappings from the PostCSS source map to its own generated source map.

```scss
// original-source-file.scss
.selector1 { ... } // Line 1
.selector2 { ... } // Line 2
.selector3 { ... } // Line 3
```

```scss
// index.scss
@import { .selector2 } from 'original-source-file.scss';
```

```scss
// virtual original-source-file.scss in memory
.selector2 { ... } // Line 1
```

As you can see above, after using selector filtering to import `.selector2` from `original-source-file.scss`, we end up with a version of `original-source-file.scss` in the memory which now contains only `.selector2` on line 1. This “virtual” version of the imported file, is the source which is passed to node-sass. Therefore, when node-sass is creating its source map, it's mapping `.selector2` to `Line 1` of the file `original-source-file.scss`, which is wrong.

## Complicated thinking
Source maps are a complicated matter. The tools which are creating and reading them are not trivial. In the early days it also wasn’t very easy to configure your browser and build chain to handle them correctly.

Although things have changed and for the most part, getting started with source maps has become very easy, in my mind source maps still remained this complicated technique, I wasted a ton of time on, making them work when they were still new and very experimental.

This might be the reason, why when I thought about making node-sass-magic-importer work correctly with source maps, it seemed like a huge complicated task and I avoided looking at it further at any cost.

Yesterday a GitHub user commented on this issue stating that this is the only reason why he doesn’t feel comfortable using node-sass-magic-importer. This was the kick in the ass I needed to start looking for a solution to this problem once and for all.

## Shifting perspective 
At first I thought the problem could only be solved if the tools I used (PostCSS and node-sass) are able to read source map data from one another. PostCSS can read and write source maps, but node-sass can only write source maps.

At this point I thought about giving up. Implementing the logic to generate or modify source maps myself, would've been way to complicated. But suddenly, by just looking at my code and forget about all the other tools involved and how complicated everything is, my perspective shifted and the solution seemed to be very easy.

What if I just not remove filtered nodes completely but replace them with the same amount of newlines `\n` which they've occupied lines?

```scss
// virtual original-source-file.scss in memory
// Line 1
.selector2 { ... } // Line 2
// Line 3
```

This might not be the most elegant solution but it works and it is a very easy one to implement. node-sass removes empty newlines when compiling the source to CSS, so nobody ever sees the “virtual” source with the ugly empty newlines anyway.

## Final thoughts
Because my brain thought about source maps as a complicated matter, this issue seemed to be a very complicated thing too. By taking a step back and looking at the problem with a fresh state of mind, the allegedly hard problem became an easy one.

If you’re caught up with a problem which seems to be very hard or even impossible to solve, try to free your mind from everything you think you know about the problem and find a different angle to look at it.
