+++
date = "2018-08-12T06:00:00+02:00"
title = "Automatic SPA FTP Deploys with CircleCI"
description = "Learn how to deploy a modern SPA to a remote FTP server using CircleCI and Node.js."
intro = "Most of my articles are about the latest and greatest tools and technologies out there. One of the nice things about writing blog articles is that you can devote yourself fully to exploring new technologies. There is no client dictating the specifications, and there is no legacy code and technologies you need to consider..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "deployment"]
+++

Most of my articles are about the latest and greatest tools and technologies out there. One of the nice things about writing blog articles is that you can devote yourself fully to exploring new technologies. There is no client dictating the specifications, and there is no legacy code and technologies you need to consider, so you can freely choose any new and shiny technology you want.

The reality, however, is different. **In reality there are crazy project requirements and there is always a lot of legacy stuff, seriously, there is legacy technology everywhere.**

Today we'll deal with one possible aspect of a legacy technology stack: FTP. **We'll take a look at how we can deploy a modern single page application, featuring code splitting, with zero downtime, using the plain old file transfer protocol (FTP).**

You can find a complete [example project featuring the code of this article on GitHub](https://github.com/maoberlehner/automatic-spa-ftp-deploys-with-circleci).

## Challenges

One of the hardest problems to solve, when deploying a new version of a single page application, is to avoid any downtime whatsoever. Depending on the approach you're using, there might be a short time where the old files are already deleted but the new files are not in place yet.

<div class="c-content__figure">
  <div class="c-content__broad">
    <video
      data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,c_scale,h_720/v1532157367/blog/2018-08-12/chunk-loading-error"
      poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157367/blog/2018-08-12/chunk-loading-error"
      controls
      muted
    ></video>
  </div>
  <p class="c-content__caption">
    <small>Loading an old chunk is not possible anymore after deployment</small>
  </p>
</div>

**Another challenge we have to tackle is code splitting.** The way code splitting works is, that webpack creates separate chunks of JavaScript code which are dynamically loaded as needed. Because of that, there might be situations where a user opens your web app and at the same time a new deploy, which deletes the old chunks, is triggered and new chunk files are uploaded. **If the user now triggers an action which requires the next chunk to be loaded (e.g. navigating to a new route) this chunk might not exist anymore and an error is thrown.**

## Solutions

**To solve the first problem, we'll not delete old files but overwrite them.** Though, I have to say this is a far from perfect solution. There might be a very short period of time where the file is corrupt because the upload has not finished yet. Or, even worse, the connection may timeout before finishing the upload. So depending on how much traffic your site gets and how important it is to have absolutely zero downtime, you might choose a more sophisticated strategy. But in this case: you shouldn't use FTP anyway.

There are multiple solutions for dealing with the code splitting problem I've illustrated in the video above. The first strategy to mitigate the problem is to use the the `preload` resource hint. Although webpack >=4.6.0 can handle this automatically for you, this solution is far from perfect mostly because, as of writing this, [browser support is very poor](https://caniuse.com/#search=preload).

**Another way of dealing with loading outdated chunks is to use a Service Worker for caching the JavaScript code chunks.** But, although [browser support is already pretty good](https://caniuse.com/#feat=serviceworkers) there are still some browsers lacking support and also configuring a Service Worker is not trivial and might be out of the scope of your application.

**The most reliable way of dealing with this problem and preventing errors with loading outdated chunks, is to simply not delete the old chunks when a new version of your application is deployed.** That way, the users surfing on your website while a deploy of a new version is running, won't be affected in any way other than still seeing the old version of your application. But they will get the updated version as soon as they're reloading your application. The only thing we have to consider is to cleanup (very) old files at some point in time to prevent our FTP server from filling up with thousands of outdated chunk files.

## Upload files via FTP with Node.js

Now that we've outlined the problem, we can start solving it by writing some code. **Let's start with a Node.js script which uploads files and directories via FTP.**

```bash
npm install ftp glob --save
```

Luckily there is a npm package for dealing with FTP. We use the `ftp` package because I find it to be the most robust and battle tested solution. Also, we'll use the `glob` package to get an array of all the files we want to upload.

```js
// deploy.js
#!/usr/bin/env node
const fs = require('fs');
const FtpClient = require('ftp');
const glob = require('glob');

const basePath = './dist';
const destinationPath = '/public';
const config = {
  // We store the credentials for
  // our FTP server as environemnt
  // variables for security reasons.
  host: process.env.FTP_HOST,
  password: process.env.FTP_PASSWORD,
  user: process.env.FTP_USER,
};

const ftpClient = new FtpClient();

function createDirectory(destination) {
  return ftpClient.mkdir(destination, true, (error) => {
    if (error) throw error;

    ftpClient.end();
  });
}

function uploadFile(file, destination) {
  ftpClient.put(file, destination, (error) => {
    if (error) throw error;

    console.log(`${file} => ${destination}`);
    ftpClient.end();
  });
}

// Check if the path is a directory and
// either create the directory on the server
// if it is a directory, or upload the file
// if it is a file.
function handlePath(path) {
  const relativeFile = path.replace(`${basePath}/`, '');
  const destination = `${destinationPath}/${relativeFile}`;

  if (fs.lstatSync(path).isDirectory()) {
    return createDirectory(destination);
  }

  return uploadFile(path, destination);
}

ftpClient.on('ready', () => {
  // Get an array of all files and directories
  // in the given base path and send them to the
  // `handlePath()` function to decide if a
  // directory is created on the server or the
  // file is uploaded.
  glob.sync(`${basePath}/**/*`).forEach(handlePath);
});

ftpClient.connect(config);
```

**In the code snippet above, you can see how we can use the `ftp` Node.js package, to upload files and directories from our local file system to a remote FTP server.** Already existing files are overwritten or left untouched and new files are uploaded.

```bash
# Run the deployment script.
node deploy.js
```

This already does its job quite well, but depending on how often our application is changed and newly deployed, we might end up with a ton of old files left behind on our FTP storage. So let's update our code to automatically clean up for us.

## Removing old files from the FTP server

To prevent errors in the browsers of the visitors of our website, we don't want to remove old chunk files immediately but let them sit on the server for a little while until we are sure nobody is dependent on them anymore. **So let's configure our deployment script in a way that files older than a specified amount of days are removed automatically after every deploy.**

```js
// deploy.js

// ...

const EXPIRATION_DATE_IN_DAYS = 7;

// ...

function isExpired(date) {
  const oneDayInMilliseconds = 86400000;
  const timestamp = new Date(date).getTime();
  const expirationTimestamp = Date.now() - (oneDayInMilliseconds * EXPIRATION_DATE_IN_DAYS);

  return timestamp < expirationTimestamp;
}

function cleanup(pathObject, directory) {
  if (pathObject.name === '.' || pathObject.name === '..') return;

  const path = `${directory}/${pathObject.name}`;

  // If the current path is a directory
  // we recursively check the files in it.
  if (pathObject.type === 'd') {
    return cleanupRemoteDirectory(path);
  }

  if (isExpired(pathObject.date)) {
    ftpClient.delete(path, (error) => {
      if (error) throw error;

      console.log(`Removed: ${path}`);
      ftpClient.end();
    });
  }
}

function cleanupRemoteDirectory(directory) {
  return ftpClient.list(directory, (error, pathObjects) => {
    if (error) throw error;

    pathObjects.forEach(pathObject => cleanup(pathObject, directory));
    ftpClient.end();
  });
}

ftpClient.on('ready', () => {
  // ...

  // Cleanup files older than the given amount of
  // days. Keep in mind that this only makes sense
  // if you've deployed at least once since the
  // given amount of days.
  cleanupRemoteDirectory(destinationPath);
});

ftpClient.connect(config);
```

Above, you can see that we've added some logic to traverse a list of remote files and directories and recursively check if they've expired. If one of the files has expired it's deleted.

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like what you read?</h2>
      <p class="c-twitter-teaser__body">
        Follow me to get my latest Vue.js articles.
      </p>
      <a class="c-button c-button--outline c-twitter-teaser__button" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">
        Find me on Twitter
      </a>
    </div>
  </div>
</div>

## Configuring CircleCI to run the FTP deployment script

Although I'm mostly using Travis CI, I've noticed that many projects are using CircleCI nowadays. So I've decided to try it myself for this blog article.

First of all, in order to make it easier to run our deployment script, we can add a new npm script in our `package.json` file.

```diff
   "scripts": {
     "dev": "NODE_ENV=development nuxt",
     "build": "NODE_ENV=production nuxt build",
     "start": "NODE_ENV=production nuxt start",
     "generate": "NODE_ENV=production nuxt generate",
+    "ftp-deploy": "node deploy.js",
     "lint:scripts": "eslint --ext .js,.vue --ignore-path .gitignore .",
     "lint:styles": "stylelint '+(assets|components|layouts|pages)/**/*.+(scss|vue)'",
     "lint": "yarn run lint:scripts && yarn run lint:styles"
   },
```

Next we need to add a CircleCI configuration file to our project. So let's create a `config.yml` file in a new `.circleci` directory.

```yml
# .circleci/config.yml
version: 2
jobs:
  build:
    docker:
      - image: circleci/node:10
    steps:
      - checkout
      # Download and cache dependencies.
      - restore_cache:
          keys:
          - v1-dependencies-{{ checksum "package.json" }}
          # Fallback to using the latest cache if no exact match is found.
          - v1-dependencies-
      - run: npm install
      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package.json" }}
      # Build the application.
      - run: npm run generate
      # Run the FTP deployment script.
      - run: npm run ftp-deploy
```

**Next, after adding a new project in CircleCI, we have to configure the FTP host, user and password environment variables.** We can do this in the CircleCI UI as you can see in the following screenshot.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2018-08-12/circleci-environment-variables">
      <img
        data-src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-08-12/circleci-environment-variables"
        data-srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2018-08-12/circleci-environment-variables 2x"
        alt="Screenshot of the CircleCI UI for adding environment variables."
      >
      <noscript>
        <img
          src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-08-12/circleci-environment-variables"
          alt="Screenshot of the CircleCI UI for adding environment variables."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>Adding environment variables in CircleCI</small>
  </p>
</div>

Now we've successfully set up CircleCI to automatically push a new version of our app to a remote FTP server every time we push a change to our Git repository.

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2018-08-12/circleci-ftp-deploy">
      <img
        data-src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-08-12/circleci-ftp-deploy"
        data-srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2018-08-12/circleci-ftp-deploy 2x"
        alt="Screenshot of the deployment process running in CircleCI."
      >
      <noscript>
        <img
          src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2018-08-12/circleci-ftp-deploy"
          alt="Screenshot of the deployment process running in CircleCI."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption" style="margin-top:-1.5em;">
    <small>The deployment process running in CircleCI</small>
  </p>
</div>

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

## Wrapping it up

Of course, setting up a system to automatically deploy a modern SPA to a remote FTP server seems pretty dated in the times of Netlify. But sometimes we don't have a choice and we have to work with what is already there.

Thanks to tools like CircleCI it's not too hard to set up a build system to also deal with legacy technologies.
