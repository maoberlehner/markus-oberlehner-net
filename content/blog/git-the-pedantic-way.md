+++
date = "2017-11-26T09:06:56+02:00"
title = "Git, the pedantic way"
description = "Read more about possible ways of keeping your Git commit history clean and how to write better commit messages."
intro = "When people think of programmers, they think of pale nerds sitting in front of their computers writing code all day long. As we all know, this couldn't be further from the truth. In reality we're pale nerds, who spend most of our time siting in front of our computers reading (and trying to make sense of code), written by other people (or our past selves)..."
draft = false
categories = ["Development"]
tags = ["Git"]
+++

When people think of programmers, they think of pale nerds sitting in front of their computers writing code all day long. As we all know, this couldn't be further from the truth. In reality we're pale nerds, who spend most of our time siting in front of our computers **reading** (and trying to make sense of) code, written by **other people** (or our past selves).

Since what most of us do most of the time is read code and try do understand it, it is all the more important to write code that is easy to understand. But even if we're doing a great job writing simple code, what oftentimes is missing, is an explanation **why** certain parts of the code were added or changed. Even the most elegant code, although easily understood, can't tell the full story **why** it was written in the first place all by itself.

This is where Git commit messages come into play. A carefully crafted commit message can express additional information about your code, which you can't provide directly in the code itself.

## Why good commit messages matter

What often happens to me during bug fixing, while reading code mostly written by other people, is that I encounter a particular snippet of code (which could very well be the source of the bug I'm hunting) which I know for a fact, that it was not that way when I last have seen it. I know that either because I have written the original code myself or because I've read this particular part of the code multiple times before.

There is nothing more frustrating than running `git blame`, to find the commit which changed the part of the code, and all it says is something like `Refactoring`.

What I now have to do, is to go to the person who refactored this part of the code and who crafted this wonderful descriptive commit message, and kill him or her. In an ideal world I would be allowed to do so, but because of laws and the basic rules of humanity, what I really have to do is to talk to the person, to find out why the code was changed in the first place.

Depending on your personality, talking to other people might not be the worst thing on the planet, but if we have to *read a lot of code* and then we also have to *talk a lot about code*, there is less and less time to actually *write code*, which is what we're actually paid for to do.

Saving one minute by not writing a descriptive commit message, oftentimes results in hours lost because dozens of programmers who encounter a certain part of confusing code in the future, have to find out what it does and why, by either talking to the person who wrote the code, or if the person is not working for the company anymore, by figuring it out themselves.

## Small vs. big commits

A popular saying, when the question is raised how big a commit should be, is “Commit Early And Often”. I tend to agree with the general notion, but I would like to add that you should only commit changes that work on their own – ideally it should be possible to `git checkout` a random commit and the project builds and works as expected.

So in general, I'd say a commit is too small, if it doesn't contain a working feature but only some code that is work in progress.

On the other hand, a possible indication that a commit is too large can be, if you have to write a rather long commit message to explain the reasoning behind the code you're checking in. Usually, if there are a lot of things going on in your code, where you feel the urge to explain your reasoning behind them in the commit message, it might be a perfect situation to split your changes into multiple smaller commits.

## A typical workflow

In the following examples, we're going to look at some typical version control challenges which happen to arise during every day development. I'm going to assume that you're using a workflow which uses some kind of feature branches which are merged into the master branch (e.g. Git flow).

### Temporary WIP commits

In an ideal world, we would work at only one feature at a time and there would be no bugs which we urgently need to fix in the meantime. But we do not live in an ideal world. So sometimes we're in the middle of work when we have to interrupt to fix one of those urgent problems.

Git provides us with the `stash` command to quickly stash away our changes so we can work on something else and retrieve our changes from the stash if we want to continue. If you just want to quickly stash away some changes, using `git stash` might be sufficient. But what I like to do is to use a temporary commit to store my changes. That way I can easily add a commit message containing information for my future self, about what I was working on when I had to interrupt my work.

```bash
# Add everything to the index.
git add --all
# Make a temporary commit.
git commit -m 'WIP: Figuring out why user API call fails'
# Checkout a new branch from master
# to work on the urgent bugfix.
git checkout -b bugfix/some-problem master
# Go back to the original branch.
git checkout feature/some-feature
# Look at the last commits to remember what
# you were working on when you left.
git log
# Undo the temporary commit - your working
# directory will look exactly like before
# making the WIP commit.
git reset HEAD~
```

### Selectively committing changes

Sometimes, if you don't have to read code and you're also lucky enough not to having to talk to other programmers about code and you actually have the time to *write some code*, ideally you get into a flow. Being in a state of flow feels amazing, you're actually getting work done. The downside of this can be, that you might end up with hundreds of lines of code which do not fit in one commit, because you completely forgot to make regular commits. You might even have refactored some parts of the code not directly related to the feature you're currently working on, so committing everything in one large commit is not an option.

Assuming you've made changes in one file which do belong into multiple commits, you can use the `-p` (patch) option with the `git add` command.

```bash
git add -p
```

After running this command you're able to select only specific changes of a file and not the file as a whole. By default Git suggests rather large chunks of the code, but you can make this as granular as you want.

By using the patch option, you can split all of your changes you've made during your flow experience, into separate logical commits.

### Changing history

Sometimes you already have made some commits to your current feature branch and you discover there is a typo in some variable name you've added. Sure, you could make a new commit to fix the typo. But what value would this commit, with the message `Fixing a typo`, have for other programmers reading it in the future?

If your code is not merged yet, and you're the only one who is working on the branch containing the commit, there is no reason not to fix the original commit in which the variable with the typo was introduced.

#### Fixing the most recent commit

There are two ways to make changes to the most recent commit. If you want to quickly fix a typo or add some file, you’ve forgot to add, to the most recent commit, that's the quickest way to do it.

```bash
# Add the changes you want to have in your previous commit.
git add --all
# Append changes to the previous commit and edit commit message.
git commit --amend
```

If you want to see all the changes again before making a change to the most recent commit, the following approach can be very useful.

```bash
# Undo the most recent commit.
git reset HEAD~
# Fix the typo and add all files
# to the index back again afterwards.
git add --all
# Reuse the original commit message
# and commit the changes again.
git commit -c ORIG_HEAD
```

#### Fixing an old commit

In this example we're changing the third last commit (`HEAD~3`). If you have to go back even further, change `3` with the number of commits you want to go back.

```bash
# Start interactive rebasing.
git rebase -i HEAD~3
# Now change the word in front of the
# commit you want to update to `edit`.
edit bb5de49 Some commit
pick daf2ab3 Some other commit
pick txf1av2 Refactoring
# Fix the typo and add the affected file(s)
# to the index back again afterwards.
git add the/file.js
# Continue rebasing, you might have to
# fix some merge conflicts if there are any.
git rebase --continue
```

By following this steps, you've changed the Git history. What this means is, that the hash of the affected commits has changed. If your branch was already pushed, you have to use a force push (`git push --force`) to update the remote branch.

**Disclaimer:** do not do this in branches you work on simultaneously with other people. Only do this with commits which are not yet merged into other branches.

### Adding tests

If you're practicing TDD this should be a no brainer: ideally you should have just one commit containing the code and the tests for the code. But oftentimes you forget about the tests or you only notice after committing, that not all the lines of your code are covered by the existing tests.

If your branch is not yet merged, [follow the steps in the previous section](#changing-history). Otherwise create a new commit and explain why you've added further tests (maybe even reference a ticket number if you were fixing a bug), if it is not obvious from the tests itself.

### Code review

Even worse than commits with only `Refactoring` as their message, are commits reading `Code review`. Such a commit message is completely useless to developers which are reading it. And furthermore it is even slightly passive aggresive towards the person who performed the code review. It could be understood as “I think my code was fine to begin with, but the idiot who performed the code review thought otherwise, so here you go: `Code review`”. One gets the notion that the input of the code reviewer is not valued enough to add the reasoning behind the suggested changes into the commit message.

I'd argue that making a separate commit for changes suggested in a code review, oftentimes is not necessary at all. If, for example, the reviewer suggests a more descriptive name for a new variable or function, there is no value in making a new commit explaining why the variable name was changed, because future developers who are reading the commit message, have never seen the original variable name to begin with. Such changes should be made to the original commits which introduced those parts of the code ([Changing history](#changing-history)).

But there might also be situations where making a new commit is appropriate. For example: if your original code seems like the obvious solution to the problem but the code reviewer suggests a different solution because of some unexpected behavior specific to your system. In such situations it might make sense to make a new commit explaining why you've changed your code, which seemed like the obvious solution, to something more complex.

### Merge conflicts

Finally, the time has come to merge your feature branch into the production branch. Chances are, that your colleagues have also written some code in the meantime and if you're unlucky, there are merge conflicts.

I recommend you to use `git rebase` instead of `git merge` to resolve merge conflicts before merging your branch into the production branch. By using `git rebase` you can avoid the pollution of your Git history with ugly merge commits, which do not add any value at all.

One potential downside of using `git rebase` though is, that you might have to do more work fixing merge conflicts, because you might have to fix the same conflicts multiple times, if multiple commits are affected. I recommend you to rebase the current state of the production branch frequently during development to minimize merge conflicts.

## Conclusion

Commit messages are an essential part of your codebase. In the same way you don't want to have useless code in your codebase, you don't want to have useless commit messages in your version control system.

If a commit message adds no value to your codebase, write a better commit message.
