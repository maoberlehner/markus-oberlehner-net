+++
date = "2019-09-01T09:09:09+02:00"
title = "Controlling the LEGO Mindstorms NXT with Node.js Part 1: It's Alive"
description = "Learn how to control the LEGO Mindstorms NXT with Node.js over Bluetooth."
intro = "For several years now, my LEGO Mindstorms NXT has been living a life as a decorative item on my desk. Since I wasn't in the mood to do real work today, I was wondering if it wouldn't be possible to use JavaScript to control it. After searching the web I found out that it is actually possible to do this. So let's have some fun..."
draft = false
categories = ["Development", "LEGO"]
tags = ["JavaScript", "Node.js", "LEGO Mindstorms"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/f_auto,q_auto,w_2000/v1542158518/blog/2019-09-01/mindstorms-nxt"]
+++

For several years now, my LEGO Mindstorms NXT has been living a life as a decorative item on my desk. Since I wasn't in the mood to do real work today, I was wondering if it wouldn't be possible to use JavaScript to control it. After searching the web I found out that it is actually possible to do this. So let's have some fun.

This is the first article in a multi-part series. I don't know how far I'll go, but ultimately I have some ideas for building a Vue.js-based web interface to control the LEGO Mindstorms NXT robot. Let's see if I can make this a reality.

If you want to take a closer look at the code used in this article, you can [check out this GitHub repository](https://github.com/maoberlehner/mindstorms-nxt-node).

<div class="c-content__figure">
  <video
    data-src="https://res.cloudinary.com/maoberlehner/video/upload/c_crop,q_auto,w_1464,x_153,y_106/v1567320597/blog/2019-09-01/mindstorms-nxt-signature.mp4"
    poster="https://res.cloudinary.com/maoberlehner/video/upload/c_crop,q_auto,w_1464,x_153,y_106,f_auto,so_0.0/v1532157367/blog/2019-09-01/mindstorms-nxt-signature"
    controls
  ></video>
  <p class="c-content__caption">
    <small>The final result: the robot playing a signature melody</small>
  </p>
</div>

## The Setup

There are a few ways you can control the LEGO Mindstorms robot via Node.js, but the one I ultimately chose is the only one I managed to get to work. Unfortunately the LEGO Mindstorms NXT is quite old and most of the tutorials I could find had links to downloads that lead nowhere..

But what I could get to work was [nodejs-nxt](https://github.com/sahithyen/nodejs-nxt). However, I had to fork it and update its dependency to `serialport` to make it work with newer versions of Node.js. So if you want to follow along, please install [my fork](https://github.com/maoberlehner/nodejs-nxt) instead of the outdated version on npm, otherwise it won't work with newer versions of Node.js.

```bash
npm install maoberlehner/nodejs-nxt#464e251d18c144a607f0629642e18c9dcc82a8f9
```

Next, you have to connect your NXT to your computer via Bluetooth. To do this, follow the instructions for your operating system on how to connect to Bluetooth devices. After entering you pin code (usually `0000`) you're ready for controlling your LEGO Mindstorms NXT with Node.js.

## Make it speak

Let's start with a very basic example. Like any good robot, our NXT robot should play a catchy signature melody when turned on.

```js
// nxt.js
const Nxt = require('nodejs-nxt');

// Depending on your OS you might have to change
// the path to your Bluetooth connection.
const makeNxt = (path = '/dev/tty.NXT-DevB') => new Promise((resolve, reject) => {
  const nxt = new Nxt.NXT(path, (error) => {
    if (error) reject(error);
    resolve(nxt);
  });
});

const playTone = (nxt, { duration, frequency }) => new Promise((resolve, reject) => {
  nxt.PlayTone(frequency, duration, (error, response) => {
    if (error) reject(error);
    resolve(response);
  });
});

module.exports = {
  makeNxt,
  playTone,
};
```

The `nxt.js` file contains the function `makeNxt()` to establish a new connection to our NXT via Bluetooth. In addition, we have added a `playTone()`method that allows us to play a tone at a certain frequency for a certain duration.

```js
// programs/signature.js
const {
  makeNxt,
  playTone,
} = require('../nxt');
const { pause } = require('../utils');

const run = async () => {
  const nxt = await makeNxt();

  await playTone(nxt, { duration: 250, frequency: 700 });
  await pause(200);

  await playTone(nxt, { duration: 250, frequency: 1200 });
  await pause(200);

  await playTone(nxt, { duration: 250, frequency: 1000 });
  await pause(200);

  await playTone(nxt, { duration: 250, frequency: 1300 });
  await pause(200);

  await playTone(nxt, { duration: 250, frequency: 800 });
  await pause(250);

  await playTone(nxt, { duration: 250, frequency: 800 });
  await pause(200);

  nxt.Disconnect();
};

run();
```

Above you can see the code for playing a short signature melody on our robot – let's run it.

```bash
node programs/signature.js
```

<div class="c-content__figure">
  <video
    data-src="https://res.cloudinary.com/maoberlehner/video/upload/c_crop,q_auto,w_1464,x_153,y_106/v1567320597/blog/2019-09-01/mindstorms-nxt-signature.mp4"
    poster="https://res.cloudinary.com/maoberlehner/video/upload/c_crop,q_auto,w_1464,x_153,y_106,f_auto,so_0.0/v1532157367/blog/2019-09-01/mindstorms-nxt-signature"
    controls
  ></video>
  <p class="c-content__caption">
    <small>The final result: the robot playing a signature melody</small>
  </p>
</div>

The little move the robot makes at the end is not achieved by the above code, this is just a teaser of what you can expect in the second part of this article series.

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

## Wrapping it up

Although there isn't much documentation available, and this can be a bit frustrating from time to time, writing code that causes a small LEGO robot to make noises or even move, is for the most part a lot of fun.

Speaking of movement, in [the second part](/blog/controlling-the-lego-mindstorms-nxt-with-nodejs-its-moving/) of this series we take a closer look at how we can control the motors of the LEGO Mindstorms NXT with Node.js. Stay tuned!
