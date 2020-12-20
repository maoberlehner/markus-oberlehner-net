+++
date = "2020-11-29T09:34:34+02:00"
title = "Progressive Enhancement and the Modern Web"
description = "Learn about my thoughts about Progressive Enhancement in the time of modern frontend frameworks."
intro = "A few years ago, before frameworks like React and Vue.js became popular and WordPress and jQuery dominated the web (which, strictly speaking, still is the case today), there seemed to be an agreement on the overall importance of Progressive Enhancement. My impression is that this consensus has vanished since..."
draft = false
categories = ["Development"]
tags = ["Front-End Architecture"]
images = ["/images/c_pad,b_rgb:ED8936,f_auto,q_auto,w_1014,h_510/v1542158523/blog/2020-11-29/progressive-enhancement-modern-web"]
+++

A few years ago, before frameworks like React and Vue.js became popular and WordPress and jQuery dominated the web (which, strictly speaking, still is the case today), there seemed to be an agreement on the overall importance of Progressive Enhancement. My impression is that this consensus has vanished since. I'm not sure if this is because of the rise of React and Vue.js or if it just seems that way to me because back then, I was in the Progressive Enhancement bubble, and nowadays, I'm in a bubble that doesn't seem to care about that.

But more and more, I feel like we are on the wrong track. Instead of using HTML and CSS with sprinkles of JavaScript to build sites that are fast and accessible by default, we mainly use JavaScript that compiles to HTML and CSS, which frequently leads to monstrosities of websites. And we have a hard time making them fast after the fact.

## Better Concepts

In the first phase of the frontend framework revolution, we decoupled the backend from the frontend. Instead of building monoliths, we shifted to pure client-side applications that talk to APIs. I think that this approach makes a lot of sense in principle but that **we've gone too far in eliminating the application-specific backend layer.**

Meta-frameworks like Next.js and Nuxt.js blurred the borders between frontend and backend again. In my opinion, both (and most other similar frameworks) have the potential to get us back on the Progressive Enhancement track by giving us a backend layer close to our frontend applications.

Currently, how Next.js, Nuxt.js, and others work is that they pre-render HTML on the server, and then the HTML is hydrated on the client. Although technically possible, most websites built that way fail to work if no JavaScript is loaded or executed (for whatever reason). Not only is this very wasteful, because a lot of the HTML that is pre-rendered on the server is entirely static and doesn't need to be hydrated, this is also very fragile.

Thanks to the server-side rendering and backend capabilities of those frameworks, nothing stops us from building progressively enhanced websites; nothing but the fact that the tools and frameworks we use are not built with Progressive Enhancement in mind.

They don't support us:

- shipping only the bare necessary JavaScript code.
- in separating dynamic and static parts.
- with strategies for server-side, no JavaScript fallbacks.

I think those tools have great potential, and many of the recently announced features in some of those meta-frameworks make me feel optimistic.

<hr class="c-hr">
<div class="c-service-info">
  <h2>Do you like what you're reading?</h2>
  <p class="c-service-info__body">
    <a class="c-anchor" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">Follow me on Twitter for more</a>.
  </p>
</div>
<hr class="c-hr">

## Wrapping It Up

With the rise of frontend frameworks and their corresponding backend meta-frameworks, we have thrown some best practices out of the window without adequate replacements. But I think that are typical growing pains and that we are well on the way to ironing out some of our past mistakes.
