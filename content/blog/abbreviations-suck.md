+++
date = "2017-01-22T09:06:05+02:00"
title = "Abbreviations suck"
description = "Writing clean code is hard. Not using abbreviations is an effortless way to make your code easier to understand."
intro = "For a recent project I had to work a lot with express (Node.js framework). In the express documentation, abbreviations are used everywhere: `req`, `res`, `err`,... While copying code snippets from the documentation into my project and changing the abbreviations to the words they stand for again and again, I figured I should write an article about this topic."
draft = false
categories = ["Development"]
tags = ["Coding Style"]
+++

For a recent project I had to work a lot with the express Node.js framework. In the express documentation, abbreviations are used everywhere: `req`, `res`, `err`,... While copying code snippets from the documentation into my project and changing the abbreviations to the words they stand for again and again, I figured I should write an article about this topic.

## The case for abbreviations
Let's start with the adverse opinion – why use abbreviations in the first place? There are only two reasons I can think of:

1. **Abbreviations are shorter and therefore faster to write**  
Although this argument could be completely shut down by stating that every modern code editor has an autocomplete feature, let's do some math. I'm writing with about 300 keystrokes per minute – time saved writing 5 letters less (e.g. `res` instead of `response`)? 1 second. Even if you are writing a lot of code per day, let's say 160 lines, and let's assume you're writing one abbreviation every two lines. The time saved per day would be roughly 7 minutes. In contrast to that there might be dozens of people reading your code in the future. If each of them has to think only one minute longer about your code to understand it because an abbreviation isn't completely clear, it results in a net loss of time spent. Or even worse: a bug might be caused by a misunderstanding of an abbreviation.
2. **Abbreviations are shorter and therefore occupy less space**  
There is some truth to this argument in that it's broadly considered a good practice to keep your line length short (80-120 characters per line depending on who you ask). But I'd argue that although abbreviations might help in reducing the line length, they oppose the actual goal of the rule which is to improve readability.

## The case against abbreviations
Now take a look at the reasons why not to use abbreviations.

1. **Abbreviations make it harder to understand your code**  
Let's stick with the express framework and take the `res` abbreviation as an example. If you're an express guy or you're working heavily with server response logic, it seems pretty obvious that `res` stands for `response`. But let's assume your project is about REST stuff and all you think about is resources, now `res` (again obviously) stands for `resource`. You're primed for the meaning of an abbreviation because of the context you're working in.
2. **Abbreviations make it harder to be consistent**  
There may be dozens of people working on one codebase simultaneously. Everyone of them could have a different opinion on how to abbreviate certain words. The common word `options` could become `opts`, `opt` or maybe just `o` (I'm quite sure there is a special place in hell for those `o` guys).
3. **Naming things is easier being more explicit**  
Naming things is hard. Some say coming up with a good name for a variable or function is one of the hardest things in programming. But it is much easier if you give up on keeping the names as short as possible. Use obvious names like `getResponseValues` instead of `getResVal`. `Res` could stand for `Response`, `Resource`, `Reserved`,... and `Val` could stand for `Value`, `Validation`,... What might seem obvious at the time you're writing it, may not be that obvious for other people, or even yourself in one year.

## Exceptions
I'm not a fan of absolutes and there might be valid cases in which using abbreviations makes sense.

- As a JavaScript developer one exception that instantly comes to mind when talking about abbreviations is `e` for `event`. Thats just such a widely used pattern that I hardly can argue against it. All the more important it is to not use `e` as an abbreviation for `error`.
- Your team may define a short list of abbreviations of common words everybody has to use. Keep the list short and be very careful to be consistent and everybody is using the same abbreviations. Actually write down the list and teach it to new team members when onboarding them.
- If you're heavily committed to work with express or some other framework than it might be beneficial to stick to the abbreviations that are commonly used in those eco systems.
