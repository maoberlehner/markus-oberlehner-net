+++
date = "2017-11-12T09:26:18+02:00"
title = "Intelligent Design vs. Evolution"
description = "Why is it, that we as developers don't honor the principles of evolution in our own craft and instead try to apply the idea of an “Intelligent Design” to our projects? Some thoughts about the principles of evolution in software development."
intro = "In the recent days I was confronted with the result of wrong planning in multiple (personal and professional) projects I work on. It is an unpleasant feeling if you have to refactor large parts of the architecture of a project because you've came to the realization that, what seemed like a good idea in the beginning, turned out to not work like you imagined it..."
draft = false
categories = ["Development"]
+++

In the recent days I was confronted with the result of wrong planning in multiple (personal and professional) projects I work on. It is an unpleasant feeling if you have to refactor large parts of the architecture of a project because you've came to the realization that, what seemed like a good idea in the beginning, turned out to not work like you imagined it.

Why is it, that we – as developers, people of science, as which we know of evolution as a fact and chuckle about the idea of an “Intelligent Design” forming the world we live in – don't honor the principles of evolution in our own craft and instead try to apply the idea of an “Intelligent Design” to our projects?

## The impossibility of intelligent design

We're only able to write software because our brains evolved slowly, over hundreds of thousands of years, to this powerful thinking machines they are today. And still, they're far from perfect. I'm reminded about that every time I stand in front of the fridge and I have no idea what I was looking for.

Somehow we think, because of our highly evolved brains, we're smart enough to discard the principles of evolution in our own work. If we have to work on legacy projects, the general consensus is that either our past selfs, or ideally some other people, were just not smart enough to build it right from the get go. Every time we encounter a flaw in the architectural design of the application, we want to immediately tear everything down and start from scratch.

At the beginning of a new project or a major refactoring we are sure: this time we will do better. We'll plan everything in advance and come up with a beautiful design for our software, that will fit the needs of our project perfectly, now and forever. But somehow it never works that way. Along the way, we encounter problems with our design. Specifications change and new requirements emerge.

At this point we're realizing that what we've planned out so intelligently at the beginning of our project, does not hold up to reality, we either blame ourself for not foreseeing the (realistically) unforeseeable, or we blame the project manager for coming up with new features or adjusting existing feature requirements - “This is not how software development works, we have to have perfect information right from the beginning.”

## The power of evolution in software architecture

But is it even possible to have all the information up front and to plan everything perfectly before even a single line of code is written? Of course it is not.

Although there is nothing wrong with extensive planning upfront, we should not expect to get everything right from the beginning. We should allow constant refactoring to happen and we should embrace the fact, that software is flexible.

In Austria there is a saying that you should build three houses in your life: the first one for your enemy, the second one for your friend and only the third one for yourself. The meaning of this saying is, that no matter how well you plan your house, you never get it right on the first attempt. It is only after you moved in, that you realize all the little things you got wrong because you didn't think of them when you were planning the house.

But unlike houses, software can be easily modified, extended and refactored. Even if the legacy project you're working on feels like a huge entangled mess, you still can make it better one piece at a time.

To some extend, this is how evolution works too, evolution happens through random changes to the DNA. If a mutation has positive effects, the affected creature is likely to spread its DNA more successfully than if the DNA was changed in a negative way. But unlike evolution we – as mostly intelligent people – have the capacity to think about the changes we make to a piece of software and instead of applying them randomly, only apply changes which we're pretty sure, that they are beneficial to the system. Even more, we're able to decide which changes turned out to be harmful and revert them immediately.

But oftentimes we don't act like intelligent people and instead apply quick and dirty changes. Because after all, it is legacy code and it doesn't matter. We're actively driving the evolution of our project in the wrong direction, we're worse than natural evolution – maybe because we **want** the project to go distinct?

## Evolving software intelligently

So how should we build software with the principles of evolution in mind? The first step is to believe in software evolution. With rising complexity levels it gets almost impossible to plan everything perfectly upfront. Allow yourself to make errors and take the time to refactor parts of your codebase which haven't proven themselves to work best for your use case.

Make small improvements, one after another. Oftentimes we have the feeling that we have to refactor everything at once, and this is impossible because we don't have the time to do that. But small changes add up over time. Especially if you're working on a new(ish) project, making small improvements to the parts of the code you're currently working on, can prevent the project from becoming the next big, messy legacy project in your company.

Embrace The Boy Scout Rule: “Always check a module in cleaner than when you checked it out.”

Learn from your mistakes and make better decisions the next time you encounter a similar problem. And even more important, don't knowingly act against the positive evolution of your codebase, always write the best code you can write. If you absolutely have to make a quick and dirty modification, come back later to refactor the code.

If you're working on a new project, have the guts to let patterns emerge. It happens to me again and again, that I come up with, what seems like a very smart idea at first, but ends up to be an over engineered overly complex solution to what turns out to be a rather simple problem. Don't make assumptions about future requirements. Build for the current requirements and refactor your code if you see patterns emerge.

## Conclusion

Fail fast, follow The Boy Scout Rule and constantly refactor your codebase. Don't wait until someone grants you the time to refactor some part of the project. If you're working on a new feature and you're touching code which is begging to be improved, just do it.

Believe in the evolution of your codebase but also be intelligent about it.
