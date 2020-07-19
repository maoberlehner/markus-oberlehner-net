+++
date = "2020-07-19T08:21:21+02:00"
title = "How to Avoid Bugs from Unanticipated Behavior?"
description = "Read about my thoughts about how to deal with bugs that can arise from unanticipated behavior."
intro = "Recently I was responsible for introducing a major bug into the code base of the product I'm working on. There were no tests for the code, so my first instinct was that this could have been prevented with better test coverage..."
draft = false
categories = ["Development"]
+++

Recently I was responsible for introducing a major bug into the code base of the product I'm working on. There were no tests for the code, so **my first instinct was that this could have been prevented with better test coverage.** But when I thought about it more deeply, I realized that the problem was that **I did not anticipate a specific outcome of a piece of code.** If I did not foresee it when writing the code, there is a high probability that I would not foresee it when writing a test; therefore, not testing for it.

## TDD to the rescue?

I think that **a test-driven approach can prevent some, but not all, cases of this problem.** A typical example where this happens is when you expect data (e.g., from an API) to be in a particular form, but it turns out at runtime that it is not always the case. This is something from which even TDD cannot protect you.

```js
const articles = await articleService.list('/article');
const favoriteArticleId = 10;
const favoriteArticle = articles
  .find(article => article.id === favoriteArticleId);
// If `favoriteArticle` is `undefined`, this fails.
const title = favoriteArticle.data.title;
```

The problem with the code above is that we don't handle the case that no article with an `id` matching `favoriteArticleId` can be found.

TDD can help, because, when writing mock API responses, you might realize that you should test not only the happy path. So you might catch your error when writing the test. But there is no guarantee either.

## Code reviews

Because there is no automated way to stop you from introducing bugs like that into the code you produce, we have to rely on manual checking of our work. **Code reviews are an excellent second line of defense when checking for edge cases and finding unexpected bugs.**

If you're working on a small team, or maybe even alone, keep in mind that **self code reviews are also a thing.** Create a pull request on GitHub and take a look at your code from a different angle. More often than not, I can spot potential sources for errors or possible improvements when I do this.

## Manual testing by QA

I think the best, but also most expensive, safety nets for preventing such errors make the way into your production codebase is to have a professional QA person checking your application before every release.

**Good QA people know where they have to look and how to break your software.**

## Wrapping it up

No matter how comprehensive your test suite is, **there always will be bugs that slip through.** But by being smart when testing our applications, we can make sure to minimize the probability of introducing new bugs with new releases. **If we want maximum security, there is no way around doing code reviews and manual testing by professional QA people.**
