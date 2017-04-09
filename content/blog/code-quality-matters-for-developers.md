+++
date = "2017-04-09T08:57:02+02:00"
title = "Code Quality matters (for Developers)"
description = "Almost every developer with some years of experience knows the pain of working on a legacy project. The code quality is horrific and you're afraid of changing things because it will almost certainly break something somewhere else in the codebase."
intro = "Earlier today I read an interesting article speculating about the code quality at Facebook. There is also a Reddit thread discussing the article with some insights from current and former Facebook employees. Most of the comments agree with the conclusions of the article and I myself know the pains of working with bad code all too well. But still there was one comment from ”barry” against the popular opinion which I also can't disagree with...."
draft = false
categories = ["Development"]
tags = ["code quality", "coding style", "bad code", "refactoring"]
+++

Earlier today I read an [interesting article speculating about the code quality at Facebook](https://www.darkcoding.net/software/facebooks-code-quality-problem/). There is also a [Reddit thread](https://www.reddit.com/r/programming/comments/3r90iy/facebooks_code_quality_problem/) discussing the article with some insights from current and former Facebook employees.

Most of the comments agree with the conclusions of the article and I myself know the pains of working with bad code all too well. But still there was one comment from ”barry” against the popular opinion which I also can't disagree with.

> “And yet Facebook has more active users at any given moment than any other site in the world. How many startups run by functional programming snobs succeed vs the move fast and break things cohort? Perhaps perfection is an unrealistic and distracting target as the future is uncertain, hard to predict and is therefore the enemy of good.”

## Why Developers hate bad Code
Almost every developer with some years of experience knows the pain of working on a legacy project. The code quality is horrific and you're afraid of changing things because it will almost certainly break something somewhere else in the codebase. We're feeling dirty if we have to change or extend the functionality and feel forced to write even more bad code. It seems impossible to write clean code when working with all this old messy code (at least thats what we're telling our bosses).

## Why Developers should appreciate Legacy Code
At my workplace I can experience three levels of code quality first hand. We have the fancy new codebase, built from the ground up featuring all the latest technologies. Then there is the “newish” project still using modern technologies but, yeah it's fine but not great. And we have the big old legacy project featuring messy code and all the worst practices. It is really fun to build on top of the new codebase. It doesn't suck to work with the “newish” project. But working with the legacy project is a PITA – it is almost impossible to make changes of a certain size without introducing new bugs.

But guess what? The messy old legacy project pays our bills and it does for a lot of people – from which most of aren't even developers – since years. There are thousands of users using it daily and they don't care if the developers implementing new features wan't to kill themselves on a regular basis (of course I'm exaggerating).

## The Business Value of good Code
We know that bad code is bad for developers. We as developers want to think that bad code is also bad for businesses. But very often this is not true. If you look deeper you'll find out, that many highly successful companies run on software of horrific (code) quality.

There may be a tipping point at which the atrocious quality of the code stops a company from moving forward and ultimately leads to the company failing. The YouTuber and Spotify employee MPJ has an interesting proposal on how to deal with software which is of such bad quality: Let it die. I recommend you to [watch the video](https://www.youtube.com/watch?v=M6_a2wBK-yc) for some insights on this topic.

### Why should Companies care about code quality?
The success of most businesses is much less dependent on the quality of the code which is powering them, than most of us developers want to think – so why should businesses care about it in the first place?

Bad code makes us feel bad. We as developers want to learn new things, we want to work with new technologies, and we want to write clean code of which we can be proud of at the end of the day.

Companies want to have happy employees and they especially want the employees which build their product to be happy. What's even more important: there is currently a shortage of developers on the job market – so companies can't afford to loose developers on a regular basis.

Last but not least: happy employees will work harder and write better code, which leads to even more happy employees.

## Move fast and break things
Although we have examined why it's worth to keep developers happy and how code quality is important to achieve this goal, there are still times when moving fast is just more valuable.

I myself have experienced this a lot with my personal projects. I built the first version of [node-sass-magic-importer](https://github.com/maoberlehner/node-sass-magic-importer) over a weekend. The code was ugly, definitely nothing I was proud of, but I had a working “product” I could start to tell people about and checkout if they are interested. My biggest error I made, was not that I build ugly, but not following best practices. Most notably: I had no tests in place. I quickly fixed this issue and from there on, I could focus on refactoring.  
It was fun to build a working product in very little time and now it is fun to improve the quality of the code and implement new technologies as I'm going. Which is very easy to do if you have automated tests in place.  
Some weeks ago I made a classical programmer error which was to give in the urge of rewriting everything from the ground. I wanted to do it *right* and write *perfect code*. Although I knew this was a mistake I still did it because of the fun I have writing clean new code. Today marks the third week I work on this project and I'm not even done with half of the features yet.

It is easy to see why such an approach is tolerable for smaller, personal projects but potentially risking bankruptcy if you're running a business.

Businesses and developers must find a balance between a sane codebase which still allows moving fast when it comes to implementing new features.

Beware of preemptively optimizing your code when it comes to performance or keeping it DRY. Build ugly, repeat yourself if you can't be sure if what you're implementing is actually a repeating pattern or just coincidently the same. Don't throw best practices over board, but always question if they are useful for the specific use case you're facing. But most importantly **write tests**. I can't stress that enough **write tests**.

You can only afford to build ugly, if you **have tests in place** which allow you to easily refactor your code later on.
