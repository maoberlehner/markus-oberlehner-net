+++
date = "2019-09-08T08:22:22+02:00"
title = "Controlling the LEGO Mindstorms NXT with Node.js Part 2: It's Moving"
description = "Learn how to control the motors of the LEGO Mindstorms NXT with Node.js over Bluetooth."
intro = "In the first part of this series we made sure that we can connect to our NXT and send commands via Node.js. Today, we're exploring how we can control the motors of our LEGO Mindstorms robot to make it move..."
draft = false
categories = ["Development", "LEGO"]
tags = ["JavaScript", "Node.js", "LEGO Mindstorms"]
images = ["/images/f_auto,q_auto,w_2000/v1542158518/blog/2019-09-01/mindstorms-nxt"]
+++

In [the first part of this series](/blog/controlling-the-lego-mindstorms-nxt-with-nodejs-its-alive/) we made sure that we can connect to our NXT and send commands via Node.js. Today, we're exploring how we can control the motors of our LEGO Mindstorms robot to make it move.

As it turns out, the `nodejs-nxt` package is quite simple and has no comfort features to make the robot run faster or slower, or maybe even help with curves and turns. But that's fine, because it's a great opportunity to learn a thing or two about good old Serialport along the way.

If you want to take a closer look at the code used in this article, you can [check out this GitHub repository](https://github.com/maoberlehner/mindstorms-nxt-node).

<div class="c-content__figure">
  <video
    data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1567320597/blog/2019-09-08/mindstorms-nxt-moving.mp4"
    poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157367/blog/2019-09-08/mindstorms-nxt-moving"
    controls
  ></video>
  <p class="c-content__caption">
    <small>The final result: the robot moving forward, turning and moving back</small>
  </p>
</div>

## How to control Lego NXT Motors

Let's start with the basics. To control the NXT motors via Bluetooth, we need to send the correct commands. Commands are sent to the NXT via so-called *Telegrams*. A telegram is basically a bulk of bytes, each byte containing certain information about how the robot should behave. If you want to read more about this you can read the [How to Control Lego NXT Motors](http://www.robotappstore.com/Knowledge-Base/-How-to-Control-Lego-NXT-Motors/81.html) article on [robotappstore.com](http://www.robotappstore.com).

## Add missing byte enumerations in nodejs-nxt

Out of the box, `nodejs-nxt` already provides most of the enumerations for the bytes we need to send, but unfortunately enumerations for the power and the turn ratio are missing. So let's add those.

As I wrote in [the first article](/blog/controlling-the-lego-mindstorms-nxt-with-nodejs-its-alive/), I have already created a [fork of the `nodejs-nxt` package](https://github.com/maoberlehner/nodejs-nxt) – we use the forked version to make our changes.

```js
// nxt.js
exports.Power = {
  n100: 0x9C,
  n75: 0xB5,
  n50: 0xCE,
  n25: 0xE7,
  0: 0x00,
  25: 0x19,
  50: 0x32,
  75: 0x4B,
  100: 0x64
};
```

First we add enumerations for controlling the power of the motors of the NXT in percent. `0-100` are percentage values of how much power the motor should receive. The `n` in `n25-100` means `negative` so those values make the motor turn in the opposite direction.

```js
// nxt.js
exports.TurnRatio = {
  n100: 0x9C,
  n75: 0xB5,
  n50: 0xCE,
  n25: 0xE7,
  0: 0x00,
  25: 0x19,
  50: 0x32,
  75: 0x4B,
  100: 0x64
};
```

We also want to make our robot turn, so we declare enumerations for the `turnRatio` byte.

```diff
 exports.Mode = {
   MotorOn: 0x01,
   Brake: 0x02,
-  Regulated: 0x04
+  Regulated: 0x05
 };
```

In addition, there is a little bug in the original `nodejs-nxt` package. The `0x04` value for the motor `mode` byte does nothing, instead we have to use `0x05` to switch the motor into `regulated` mode.

## Controlling the NXT motors with Node.js

So now that we know the basics about how to send commands to the NXT and preparing `nodejs-nxt` we can go ahead and write our abstraction to make our robot move.

```js
// nxt.js
const Nxt = require('nodejs-nxt');

// ...

const drive = (nxt, {
  port,
  power = Nxt.Power[100],
  mode = Nxt.Mode.Regulated,
  regulationMode = Nxt.RegulationMode.MotorSync,
  turnRatio = Nxt.TurnRatio[0],
  runState = Nxt.RunState.Running,
  tachoLimit = 0x00,
}) => new Promise((resolve, reject) => {
  nxt.SetOutputState(
    port,
    power,
    mode,
    regulationMode,
    turnRatio,
    runState,
    tachoLimit,
    (error, response) => {
      if (error) reject(error);
      resolve(response);
    },
  );
});

const stop = (nxt, { port }) => drive(nxt, {
  port,
  power: Nxt.Power[0],
  runState: Nxt.RunState.RampDown,
});

module.exports = {
  drive,
  stop,
  // ...
};
```

Above you can see that we've created two wrapper functions around the `nodejs-nxt` `SetOutputState` method. The first `drive` function sends some bytes to make the NXT move forward.

Even more important than the `drive` function is the `stop` function because the motors keeps running until you send a command to stop them again (or the batteries die, of course).

## There and back again

Now let's use our two new convenience functions to make our robot move in one direction, turn around and move back in the other direction.

```js
// programs/there-and-back-again.js
const Nxt = require('nodejs-nxt');

const {
  drive,
  makeNxt,
  stop,
} = require('../nxt');
const { pause } = require('../utils');

const run = async () => {
  const nxt = await makeNxt();

  // Move forward.
  await Promise.race([
    drive(nxt, { port: Nxt.MotorPort.B }),
    drive(nxt, { port: Nxt.MotorPort.C }),
  ]);
  await pause(2000);

  // Turn.
  await Promise.race([
    drive(nxt, { port: Nxt.MotorPort.B, turnRatio: Nxt.TurnRatio[75] }),
    drive(nxt, { port: Nxt.MotorPort.C, turnRatio: Nxt.TurnRatio[75] }),
  ]);
  await pause(1700);
  nxt.ResetMotorPosition(Nxt.MotorPort.B, true);
  nxt.ResetMotorPosition(Nxt.MotorPort.C, true);
  await pause(30);

  // Move forward.
  await Promise.race([
    drive(nxt, { port: Nxt.MotorPort.B }),
    drive(nxt, { port: Nxt.MotorPort.C }),
  ]);
  await pause(2000);

  // Stop.
  await Promise.race([
    stop(nxt, { port: Nxt.MotorPort.B }),
    stop(nxt, { port: Nxt.MotorPort.C }),
  ]);
  await pause(1000);

  nxt.Disconnect();
};

run();
```

<div class="c-content__figure">
  <video
    data-src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1567320597/blog/2019-09-08/mindstorms-nxt-moving.mp4"
    poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157367/blog/2019-09-08/mindstorms-nxt-moving"
    controls
  ></video>
  <p class="c-content__caption">
    <small>The final result: the robot moving forward, turning and moving back</small>
  </p>
</div>

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like What You Read?</h2>
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

It took me a lot of time to figure out that I had to reset the motor position after making the robot turn. Or at least this is how I solved the problem that the robot would always turn back in the other direction immediately after a turn. Unfortunately, there really isn't a lot of documentation about that stuff out there.

But for now I'm quite happy I got the robot to do pretty much what I imagined it to do.

## References

- [Anna Sandler, What is a Lego NXT Bluetooth Telegram](http://www.robotappstore.com/Knowledge-Base/What-Is-a-NXT-Bluetooth-Telegram/24.html)
- [Anna Sandler, How to Control Lego NXT Motors](http://www.robotappstore.com/Knowledge-Base/-How-to-Control-Lego-NXT-Motors/81.html)
- [Anna Sandler, How to make LEGO NXT drive](http://www.robotappstore.com/Knowledge-Base/How-to-make-LEGO-NXT-drive/86.html)
