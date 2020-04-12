+++
date = "2020-04-12T11:27:27+02:00"
title = "Lint Only Files with Changes on pre-commit"
description = "Learn how to create a pre-commit hook which runs ESLint and stylelint only on files with changes."
intro = "A few days ago, I remembered that at my former workplace, karriere.at, we had a pre-commit hook bash script that executed ESLint and Stylelint, not on the entire repo, but only on files that were changed. Because that was pretty handy, I was looking into how I could have the same convenience for my projects..."
draft = false
categories = ["Development"]
tags = ["Git"]
+++

A few days ago, I remembered that at my former workplace, karriere.at, **we had a pre-commit hook bash script that executed ESLint and Stylelint, not on the entire repo, but only on files that were changed.** Because that was pretty handy, I was looking into how I could have the same convenience for my projects.

## Manually create a pre-commit hook for linting

There are multiple ways of how to achieve this, and what I see a lot is using something like the npm package [Husky](https://github.com/typicode/husky) to help with managing git hooks. But because this can also be done by hand without adding a dependency to your project, I settled for using a good old bash script.

```bash
#!/bin/bash

PREFIX="pre-commit:"

fileList=$(git diff --diff-filter=d --cached --name-only)

jsFileList=$(echo "$fileList" | grep -E '\.(js)$')
if [ ${#jsFileList} -gt 0 ]; then
    if ! npx eslint ${jsFileList[*]} "$@"; then
        echo "$PREFIX Commit aborted."
        echo "$PREFIX You can lint manually via 'yarn lint:scripts'.\n"
        exit 1
    fi
fi

cssFileList=$(echo "$fileList" | grep -E '\.(css|scss)$')
if [ ${#cssFileList} -gt 0 ]; then
    if ! npx stylelint ${cssFileList[*]} "$@"; then
        echo "$PREFIX Commit aborted."
        echo "$PREFIX You can lint manually via 'yarn lint:styles'.\n"
        exit 1
    fi
fi
```

In my project, I've created a new `bin` directory, where I put this file with the file name `pre-commit`. **Here we specify the commands we want to run before every commit.** In our case, we run ESLint and stylelint. The way we've set this up, **our linting scripts run only on staged files;** if there is a linting error, the commit aborts.

The script you can see above is loosely based on [this snippet by Mark Holtzhausen](https://gist.github.com/dahjelle/8ddedf0aebd488208a9a7c829f19b9e8#gistcomment-3218493).

Also make sure to set the correct permissions on the newly created file so it can be executed.

```bash
chmod 0755 bin/pre-commit
```

If we want to keep things simple, we can now manually copy the file into our git hooks directory. But to make it easier for our colleagues and our future selfs we can add a `setup` script which does that for us. We configure our `setup` script to run automatically whenever we run `npm install`.

```bash
#!/bin/bash

echo "Installing pre-commit hook ..."

cp bin/pre-commit .git/hooks/pre-commit

echo -e "\033[32mFinished!\033e"
```

For now, we only install our pre-commit hook in the `setup` script, but **we can add additional set up procedures later.**

Again, we have to set the correct permissions to make the newly created setup script runnable.

```bash
chmod 0755 bin/setup
```

To automatically run the `setup` script whenever somebody starts using the codebase, we can add an npm `postinstall` script.

```json
{
  "scripts": {
    "postinstall": "bin/setup"
  }
}
```

## Husky and lint-staged

If you don't want to manually create your own pre-commit hook you can also use the combination of [Husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged) to achieve the same.

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

Once multiple people are working on the same codebase and performing regular code reviews, it is essential to establish procedures to check your code for inconsistencies automatically. By automatically running your lint scripts every time you commit, you ensure that no one can commit code that doesn't match your project's code style.
