+++
date = "2020-05-31T07:27:27+02:00"
title = "Are my Component Names Too Long? Vue.js Component Naming Best Practices"
description = "Learn about the mean component name lenght in the Facebook codebase and important best practices to follow when naming your Vue.js components."
intro = "When naming your (Vue.js) components, you might sometimes be worried that the names are getting very long. In this article, we take a closer look at how long is too long and what are the most important best practices when it comes to naming your components..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["/images/c_pad,b_rgb:9423F5,f_auto,q_auto,w_1014,h_510/v1542158521/blog/2020-05-31/how-long-is-too-long"]
+++

When naming your (Vue.js) components, you might sometimes be worried that the names are getting very long. In this article, we take a closer look at how long is too long and what are the most important best practices when it comes to naming your components.

## What is too long?

Jane Manchun Wong from Facebook has gathered [data from more than 3000 components in the Facebook React codebase](https://twitter.com/wongmjane/status/1250726774884859905). Her results are that the mean length of a component name is 27 characters: `ImA27CharacterComponentName`. And the longest component name counts **66 characters.** She also gives two examples for some very long component names.

```bash
CometSearchTypeaheadInternalLayoutInlineStrategyWithScrollableView
CoronavirusCommunityHelpCometRequestOfferHelpCreateDialog
```

On the one hand, we should always strive to keep our code short and concise. On the other hand, we read more code than we write. Therefore, **it is critical to quickly understand what a component does rather than to save a few milliseconds while writing the code.**

That is why I argue that you should **worry much less about your component names getting too long and instead focus on getting them right.** It's more important to stick to some general rules and best practices when choosing the names for your components.

## Best practices

The official Vue.js style guide provides us with a comprehensive list of recommendations for how to name our Vue.js components. You might notice that even in the examples, some of the component names are getting quite long.

- [Base component names](https://vuejs.org/v2/style-guide/#Base-component-names-strongly-recommended)
- [Single instance component names](https://vuejs.org/v2/style-guide/#Single-instance-component-names-strongly-recommended)
- [Tightly coupled component names](https://vuejs.org/v2/style-guide/#Tightly-coupled-component-names-strongly-recommended)
- [Order of words in component names](https://vuejs.org/v2/style-guide/#Order-of-words-in-component-names-strongly-recommended)
- [Full-word component names](https://vuejs.org/v2/style-guide/#Full-word-component-names-strongly-recommended)

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

**Don't worry about your component names becoming too long!** Instead, focus on coming up with descriptive names and rigorously follow the best practices I mentioned above. In the long run, it pays off.
