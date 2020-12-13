+++
date = "2019-08-18T10:47:47+02:00"
title = "Separation of Concerns Re-Revisited"
description = "The mistakes we made when moving away from separating concerns by file type are haunting us. React Hooks and the Vue.js Composition API are trying to fix some of it. Here are my thoughts on this topic."
intro = "The more I read about React Hooks and the RFC for the Vue.js Composition API, the more I think about the early days of modern frontend frameworks like React and Vue.js..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "Front-End Architecture"]
+++

The more I read about [React Hooks](https://reactjs.org/docs/hooks-intro.html) and [the RFC for the Vue.js Composition API](https://vue-composition-api-rfc.netlify.com/), the more I think about the early days of modern frontend frameworks like React and Vue.js. Basically, the development community was divided into two camps: the people who immediately embraced the new mental model of these modern front-end frameworks, and those who absolutely hated that they broke with the then prevalent understanding of separation of concerns. Of course, apart from some discussions on Twitter and reddit, it was never really that black and white. I myself tended to lean on the classic separation of concerns side. Not until I created my first real application with Vue.js did I change my mind about how separation of concerns has to look like.

But the longer I worked with Vue.js and the more complex the problems I had to solve became, the more unhappy I was with **the lack of a clean way of how to extract and reuse logic between multiple components.** I feel that we haven't always drawn the line between our concerns correctly, and that has made it harder to write clean and decoupled code.

## Business logic and the view layer

Having everything in a single file and using components as the main means of encapsulating and composing logic feels great - as long as things don't get too complicated. But when working on large-scale applications, **it gets complicated at some point, no matter how hard you try to keep things simple.** At this point, most developers realize that it's really difficult to reuse certain parts of their code in different contexts when their entire business logic is spread across all their components.

Today, the only way to reuse code (which makes use of the Vue.js reactivity system) is through components. But what if you want to reuse the same logic and the same computed properties, but want to render something completely different?

**And here the new paradigm of separating concerns not by file type but by logical units has led us astray.**

## The skeptics were wrong

For the last couple of years it seemed that the fight about separation of concerns was won in favor of the “separate concerns based on cohesion between the markup and the logic, not by file type” camp and everybody, including former skeptics like me, agreed that **it doesn't make sense to strictly separate HTML, CSS and JavaScript.**

We have built applications consisting of hundreds of components, each component being its own concern and containing all the logic, styles and markup it needs to render. Everything was perfect, wasn't it?

<blockquote id="separate-concerns">
  The framework cannot know how to separate your concerns for you. It should only provide powerful, expressive tools for the user to do it correctly.
  <footer>
    <cite>
      <small>— <a href="https://www.youtube.com/watch?v=x7cQ3mrcKaY">Pete Hunt, JSConf EU 2013</a></small>
    </cite>
  </footer>
</blockquote>

As this quote from Pete Hunt in his [JSConf talk about React](https://www.youtube.com/watch?v=x7cQ3mrcKaY) shows: We were warned. **It's not necessarily the frameworks that are at fault, we have to blame ourselves.** As soon as the flood gates were open and we could freely put all of our logic into our components, *we did*. And moreover, it wasn't frowned upon anymore, after all, the logic was related to the markup, in some way, so it was ok, right? **Wrong!**

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

## The skeptics were right

<blockquote id="separate-concerns">
  Just don't write spaghetti code. Only put display logic in your components.
  <footer>
    <cite>
      <small>— <a href="https://www.youtube.com/watch?v=x7cQ3mrcKaY">Pete Hunt, JSConf EU 2013</a></small>
    </cite>
  </footer>
</blockquote>

So in the end one might say the skeptics sensed that **some of us less disciplined people, will fail to correctly determine the boundaries of our code and cleanly separate concerns.** And not having file types to give us at least some guideline, will only make things worse.

I see more and more *hard* separation of concerns by putting code into different files again. Hooks in React and the RFC for the new Composition API in Vue.js are one example for that, the way how people structure their React projects with [Styled Components](https://www.styled-components.com/) another one.

But it's save to say that **it's also quite possible to fail at separating your concerns, even if you (still) have separate files for your HTML, CSS and JavaScript code.** Others might argue that although mixing markup and logic in one file makes it easier to screw up separation of concerns, **strictly separating your code into individual files makes it impossible to put together what belongs together.**

## Conclusion

**It seems to me that React and Vue.js components should be primary treated as templating languages on steroids.** That's not to say that they shouldn't contain any logic at all but **they should only contain the logic which is directly concerned with rendering the component** or reacting to the user interacting with the component. As Pete Hunt put it: *Only put display logic in your components.*

Components are concerned with rendering markup and handling user input, basically **handling everything the user sees and does.** Other parts of your code should be concerned with more complicated business logic and data fetching for example. **Components are what the users can see and interact with, everything else should be treated as a separate concern and not be part of a component.**

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

The older I get, the more I realize that in most areas of life there is rarely a definite *right* or *wrong*, especially not in programming. Although it seemed that the old school separation of concerns proponents were wrong, it turned out that they had a point. But on the other hand it also was the right move to break up this hard boundary of separating everything by file ending.

**React Hooks and the RFC for the Vue.js Composition API, which hopefully will be a part of the next big Vue.js release, are urgently needed tools for better separating concerns and reusing code across different components.** Unfortunately we have lost some of the comfort of having simple rules like file endings to tell us how to structure our code, but we gained more flexibility and step by step our tools and techniques will become more powerful through constant reiteration.

## References

- [Vue.js Composition API RFC](https://vue-composition-api-rfc.netlify.com)
- [Vue.js Docs, What About Separation of Concerns](https://vuejs.org/v2/guide/single-file-components.html#What-About-Separation-of-Concerns)
- [Pete Hunt, React: Rethinking best practices](https://www.youtube.com/watch?v=x7cQ3mrcKaY)
- [React Docs, Introducing Hooks](https://reactjs.org/docs/hooks-intro.html)
- [Scott Molinari, Templating in Vue: Separation of Concerns or Separation of Technology or something else?](https://medium.com/@s.molinari/templating-separation-of-concerns-or-separation-of-technology-or-something-else-123a3d41f0b4)
