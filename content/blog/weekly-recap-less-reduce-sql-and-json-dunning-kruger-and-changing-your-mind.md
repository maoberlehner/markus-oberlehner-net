+++
date = "2020-01-12T07:19:19+02:00"
title = "Weekly Recap: Less Array.reduce(), SQL and JSON, Dunning-Kruger and Changing Your Mind"
description = "My personal recap of the last week reflecting on my use of Array.reduce(), how to use JSON in SQL, the Dunning-Kruger effect and how to change your mind."
intro = "Last week I discovered some things that made me question myself. Do I use Array.reduce() too much? Do I sometimes feel too competent in subjects about which I know little in reality?..."
draft = false
categories = ["Development"]
tags = ["Weekly Recap"]
+++

Last week I discovered some things that made me question myself. Do I use `Array.reduce()` too much? Do I sometimes feel too competent in subjects about which I know little in reality?

## Table of Contents

- [`Array.reduce()` considered harmful?](#array-reduce-considered-harmful)
- [SQL and JSON with PostgreSQL](#sql-and-json-with-postgresql)
- [Dunning-Kruger effect](#dunning-kruger-effect)
- [How to change your mind](#how-to-change-your-mind)

## `Array.reduce()` considered harmful?

I like to use `Array.reduce()` because I assume it makes my code look cleaner. Also, I have to admit that sometimes it makes me feel smart when writing my code. When I solve a problem with `Array.reduce()`, it often seems like a really elegant solution. But I realize now that it can be difficult to understand code written this way later on.

[Jake Archibald has made some compelling arguments](https://twitter.com/jaffathecake/status/1213408744362692608) against the (heavy) use of `Array.reduce()`. Code written this way can not only be much harder to comprehend but is often significantly slower than, for example, using a `for` loop.

```js
// How I use `Array.reduce()` most of the time:
const obj = arr.reduce((obj, item) => ({
  ...obj,
  [item]: null,
}), {});
// Here a new object is created on every iteration.

// Alternative way with local mutation:
const obj = {};
for (const item of arr) obj[item] = null;
```

I want to reduce my use of `Array.reduce()`, but I feel that in many situations, it will be hard. It is nice to be able to chain `Array.map()`, `Array.filter()` and `Array.reduce()`. Also, a somewhat stupid reason why it will be hard is that I have internalized the mantra of immutability, and this makes me feel guilty of changing object properties (even locally) instead of creating a new `Object` in every loop. But as I said before, this is a pretty stupid reason.

I wonder if `Array.reduce()` should be avoided altogether or if there are cases where it is the best solution. Later, I discovered a [sub-tweet from Jake](https://twitter.com/jaffathecake/status/1213408714415333377) that supported my initial suspicion that sums are a valid use case for `Array.reduce()`.

```js
// Nice use case for `Array.reduce()`.
const sum = arr.reduce((total, item) => total + item, 0);
```

Furthermore, I think there are also situations where `Array.reduce()` really has the potential to make the code more readable. In such cases, it might be okay to accept a minimal performance penalty (when creating a new `Object` on each iteration) for better readability.

The last few days I've tried to stay away from `Array.reduce()`, but it feels weird in many situations. Local mutation may be the fastest, but it also seems dangerous to me. As soon as the function containing the locally mutated object gets more complicated, you can quickly lose track of where the object is mutated.

I strongly recommend reading [the entire Twitter thread](https://twitter.com/jaffathecake/status/1213408744362692608), especially the examples from Jake. Although it's a bit sad that at least twice he reduces (pun intended) people like me who use `Array.reduce()` extensively to showoffs who want to look smart for other developers and don't care about readability. But I understand that he's gotten much headwind for expressing this opinion that he's forgiven for being a bit snarky about it.

## SQL and JSON with PostgreSQL

For a small side project of mine, I am currently playing around a lot with crafting SQL queries. I decided to use PostgreSQL as my database and recently [discovered](https://gofore.com/en/are-you-sure-you-need-an-orm-for-that-uk/) some powerful features I was not aware of: `json_agg` and `row_to_json`.

```sql
# Example taken from: https://gofore.com/en/are-you-sure-you-need-an-orm-for-that-uk/
SELECT person.name, person.id,
    (SELECT json_agg(sq) FROM
        (SELECT hobby.name, hobby.id FROM hobby
            INNER JOIN person_hobby ON hobby.id = person_hobby.hobby
            WHERE person_hobby.person = person.id) sq
    ) as hobbies
FROM person
```

This gets you the following result:

```json
{
  "id": 1,
  "name": "John Doe",
  "hobbies": [
    {
      "id": 1,
      "name": "Tennis"
    },
    {
      "id": 2,
      "name": "Minesweeper"
    }
  ]
}
```

Keep that in mind the next time you have to decide between SQL and NoSQL.

Note: there are [similar functions in other SQL databases like MySQL](https://database.guide/json_arrayagg-create-a-json-array-from-the-rows-of-a-query-in-mysql/).

## Dunning-Kruger effect

[Adam Wathan reminded me in a Twitter post of the Dunning-Kruger effect](https://twitter.com/adamwathan/status/1213798684477083648), which postulates that incompetent people sometimes feel more competent than experts when it comes to a subject about which they actually know very little. Adam explicitly links this to the idea that incompetent people write more blog posts and give more talks.

I feel guilty for falling for the Dunning-Kruger effect. I have written blog posts about topics I don’t have much experience with. But that alone is not Dunning-Kruger. I often write about new topics because I want to learn new things. But that does not mean that I feel very confident about it. But for my readers, it may seem that way. Because: somebody has written a blog post about it, they must think they are an expert.

My main goal with this blog is to learn new things. In the future, I will try to make clear in my posts which parts are based on years of experience and where I am playing with a new idea.

I have also read a good explanation of why we fall for the Dunning-Kruger effect: The less we know about a given subject, the less we know how much there is to learn about it. If in reality we only know 20% about something, we assume that there is not much more to know because we do not know what we do not know. But if we already know 80%, we know that there is still a lot to learn and that there may pop up new things to learn all the time.

## How to change your mind

In keeping with the Dunning-Kruger effect, I listened again to an episode of the amazing Freakonomics podcast about [“How to Change Your Mind”](http://freakonomics.com/podcast/change-your-mind/).

As they explain in the episode, you should make an effort to explain the basics of a topic to yourself, if you want to challenge your own opinion. If you want to make someone else think about their opinion about a given topic where they have little or no experience, and you have much experience, you should challenge them to explain the basics to you. If they fail to do so, there is a high chance that they realize their error and maybe are more open-minded for different ideas from an expert.

It was also interesting to hear that more information is often not helpful in changing someone's (misinformed) opinion on a topic. On the one hand, because it is incredibly difficult to get unbiased information. And on the other hand, because the same information can often be interpreted in different ways.

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like what you read?</h2>
      <p class="c-twitter-teaser__body">
        Follow me to get my latest articles.
      </p>
      <a class="c-button c-button--outline c-twitter-teaser__button" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">
        Find me on Twitter
      </a>
    </div>
  </div>
</div>

## Wrapping it up

It can be difficult to discover your own weaknesses. But it would be foolish to think that all my programming habits are perfect or that I am immune to psychological effects as common as Dunning-Kruger.

The last week has made me think about my programming habits and how to avoid falling victim to Dunning-Kruger. Although it's hard to face your weaknesses, it's better than living in a bubble and thinking you have no weaknesses. I've made some progress on a personal level.

## References

- [Stackoverflow, Select columns inside json_agg](https://dba.stackexchange.com/questions/69655/select-columns-inside-json-agg)
- [Ian, JSON_ARRAYAGG() – Create a JSON Array from the Rows of a Query in MySQL](https://database.guide/json_arrayagg-create-a-json-array-from-the-rows-of-a-query-in-mysql/)
- [GOFORE, Are you sure you need an ORM for that?](https://gofore.com/en/are-you-sure-you-need-an-orm-for-that-uk/)
- [Freakonomics, How to Change Your Mind](http://freakonomics.com/podcast/change-your-mind/)
