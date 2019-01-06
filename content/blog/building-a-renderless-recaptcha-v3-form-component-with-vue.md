+++
date = "2019-01-06T07:04:04+02:00"
title = "Building a Renderless reCAPTCHA v3 Form Component with Vue.js"
description = "Learn how to build a reusable form component which handles loading and error logic and is secured by reCAPTCHA v3 with the “renderless components” approach."
intro = "The modern frontend stack is all about reusable components. The renderless component pattern is one of the most elegant ways of how to build highly reusable components. Today we'll build a renderless component for handling form submission, loading and error logic in a generic and reusable way. Additionally we'll take a look at how we can use the new reCAPTCHA v3 to secure our form from spam submissions..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158514/blog/2019-01-06/renderless-form-recaptcha-vue-component-twitter"]
+++

The modern frontend stack is all about reusable components. The *renderless component* pattern is one of the most elegant ways of how to build highly reusable components. Today we'll build a renderless component for handling form submission, loading and error logic in a generic and reusable way. Additionally we'll take a look at how we can use the new reCAPTCHA v3 to secure our form from spam submissions.

<div class="c-content__figure">
  <video
    src="https://res.cloudinary.com/maoberlehner/video/upload/q_auto/v1532157368/blog/2019-01-06/renderless-form-recaptcha-vue-component.mp4"
    poster="https://res.cloudinary.com/maoberlehner/video/upload/q_auto,f_auto,so_0.0/v1532157368/blog/2019-01-06/renderless-form-recaptcha-vue-component"
    muted
    autoplay
    loop
  ></video>
  <p class="c-content__caption">
    <small>Generic error and success handling</small>
  </p>
</div>

You can take a look at [the full code at GitHub](https://github.com/maoberlehner/building-a-renderless-recaptcha-v3-form-component-with-vue) and you can [try out the demo hosted on Netlify](https://building-a-renderless-recaptcha-v3-form-component-with-vue.netlify.com/).

## Building the form component

The following code is loosely based on the code I've written for one of my previous articles [about renderless components for handling CRUD operations](/blog/building-renderless-components-to-handle-crud-operations-in-vue/).

```js
import { post } from '../../utils/api';

export default {
  props: {
    data: {
      required: true,
      type: Object,
    },
    endpoint: {
      required: true,
      type: String,
    },
  },
  data() {
    return {
      error: null,
      loading: false,
      success: false,
    };
  },
  methods: {
    async submit() {
      try {
        this.error = null;
        this.loading = true;

        await post({
          data: this.data,
          endpoint: this.endpoint,
        });

        this.loading = false;
        this.success = true;
      } catch (error) {
        this.error = error;
        this.loading = false;
        this.success = false;
      }
    },
  },
  render() {
    return this.$scopedSlots.default({
      // Data
      error: this.error,
      loading: this.loading,
      success: this.success,
      // Methods
      submit: this.submit,
    });
  },
};
```

Let's take a closer look at the code of the `FormFrame` renderless component you can see above. At the top we import a `post` method from the `api` package, you can [take a look at the code in the GitHub repository](https://github.com/maoberlehner/building-a-renderless-recaptcha-v3-form-component-with-vue/blob/master/src/utils/api.js). This method is using the new Fetch API but you can also use [axios](https://github.com/axios/axios) or some other library if you want.

The component takes two properties: `data` and `endpoint`. Via the `data` property, an object containing all the data we want to send to our backend is passed. The `endpoint` property takes the API endpoint to which the data should be sent.

The `submit()` method immediately (re)sets the `error` and the `loading` state and executes the post request. If it succeeds the `loading` state is reset and the `success` state is set to `true`. If an error occurs it is catched and the `error` state is set.

Last but not least, the `render()` function passes all relevant properties to the components default slot and returns the rendered default slot. The component does not render any markup itself – hence the name “renderless”.

### Building a simple feedback form

Now we can use the renderless `FormFrame` component to build a simple feedback form.

```html
<template>
  <FormFrame
    :data="formData"
    endpoint=".netlify/functions/feedback"
  >
    <div
      slot-scope="{ error, loading, success, submit }"
      class="FormFeedback"
    >
      <p v-if="success">
        Thank you!
      </p>
      <form
        v-else
        class="o-vertical-spacing"
        @submit.prevent="submit"
      >
        <label class="FormFeedback__label">
          Name
          <input
            v-model="formData.name"
            class="FormFeedback__field"
          >
        </label>
        <label class="FormFeedback__label">
          Message
          <textarea
            v-model="formData.message"
            class="FormFeedback__field"
          />
        </label>
        <p
          v-if="error"
          class="FormFeedback__error"
        >
          An error has occurred, please try again.
        </p>
        <button :disabled="loading">
          <template v-if="loading">
            Sending ...
          </template>
          <template v-else>
            Submit
          </template>
        </button>
      </form>
    </div>
  </FormFrame>
</template>

<script>
import FormFrame from './frames/FormFrame';

export default {
  name: 'FormFeedback',
  components: {
    FormFrame,
  },
  data() {
    return {
      formData: {
        message: '',
        name: '',
      },
    };
  },
};
</script>

<style lang="scss">
@import '../assets/scss/settings/**/*';

.FormFeedback__field {
  width: 100%;
  padding: setting-spacing(m);
  border: 1px solid #c5c5c5;
  border-radius: 0.25em;
}

.FormFeedback__label {
  display: block;
}

.FormFeedback__error {
  color: red;
}
</style>
```

This is a very simple implementation of a form with just two fields: `name` and `message`. Thanks to the properties provided by the `FormFrame` component via `slot-scope="{ error, loading, success, submit }"` we're able to conditionally render an error message or a success message. Additionally we can easily disable the submit button while the the request is loading. The `submit()` method which is passed via `slot-scope` is triggered by the `@submit` event on the `<form>` tag.

Right at the beginning of the code snippet you can see that we are using a Netlify Functions endpoint to handle our data on the backend – let's take a look at how we can implement this endpoint.

### Backend

I've already written about [how to set up Netlify Serverless Functions in a Vue.js project](/blog/building-a-serverless-comment-system-with-netlify-functions-storyblok-and-vue#configuring-netlify). So I'm not going into much detail on how to do that in this article. You can also [take a look at this commit to see the changes needed in order to integrate a Netlify Functions build step](https://github.com/maoberlehner/building-a-renderless-recaptcha-v3-form-component-with-vue/commit/124795077aa46a2012591060b4b1788d61326086) into your Vue.js project.

In the following code snippet you can see a simple implementation of how to create an endpoint for your form request using Netlify Serverless Functions.

```js
// src-functions/feedback.js
exports.handler = async (event, context, callback) => {
  try {
    // Do not handle requests if the request
    // type is something other than `POST` or
    // if the request body is empty.
    if (event.httpMethod !== 'POST' || !event.body) {
      callback(null, {
        statusCode: 400,
        body: JSON.stringify({ status: 'Bad Request' }),
      });
      return;
    }

    const {
      message,
      name,
    } = JSON.parse(event.body);

    // This is the place to handle
    // the submitted data.
    // For example:
    // await sendEmail({ message, name });
    // or
    // await saveToDb({ message, name });

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({ status: 'success' }),
    });
  } catch (error) {
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({ status: 'error' }),
    });
  }
};
```

What you can see above is a very basic implementation. **You should add some validation rules and sanitize the incoming data before sending it to your database.**

### Integrating reCAPTCHA v3

Next up, we want to prevent spam bots from flooding our email inbox or database with spam submissions. Let's take a look at how we can integrate Googles reCAPTCHA v3 to prevent that.

In order to use it you have to [register for reCAPTCHA v3](https://g.co/recaptcha/v3). You get two keys: one public key which you must use as a parameter for loading the reCAPTCHA script (as you can see below) and a private one which we gonna use in the serverless function.

```diff
     <title>Building a Renderless reCAPTCHA v3 Form Component with Vue.js</title>
     <link rel="icon" href="<%= BASE_URL %>favicon.ico">
+    <script src='https://www.google.com/recaptcha/api.js?render=6LelBIcUAAAAAGkihBXg7vWPXV5QJaj0bE_qeX1e'></script>
   </head>
   <body>
```

Above you can see how to update the `public/index.html` file in order to load the reCAPTCHA script.

```diff
 import { post } from '../../utils/api';
 
+// Public token.
+const RECAPTCHA_TOKEN = '6LelBIcUAAAAAGkihBXg7vWPXV5QJaj0bE_qeX1e';
+
 export default {
   props: {
     data: {
```

```diff
         this.error = null;
         this.loading = true;
 
+        const token = await this.recaptchaToken();
         await post({
-          data: this.data,
+          data: { ...this.data, token },
           endpoint: this.endpoint,
         });

         this.loading = false;
         this.success = true;
       } catch (error) {
         this.error = error;
         this.loading = false;
         this.success = false;
       }
     },
+    recaptchaToken() {
+      return new Promise((resolve) => {
+        grecaptcha.ready(async () => {
+          const token = await grecaptcha.execute(RECAPTCHA_TOKEN);
+          resolve(token);
+        });
+      });
+    },
   },
   render() {
     return this.$scopedSlots.default({
```

Above you can see the changes we made to the `FormFrame` component. We implemented a new `recaptchaToken()` method which fetches a new reCAPTCHA token via the reCAPTCHA API. We add this token to the data object which we send to our backend.

```diff
+import axios from 'axios';
+
+const { RECAPTCHA_SECRET } = process.env;
+const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
+const RECAPTCHA_SCORE_THRESHOLD = 0.5;
+
+function isHuman(token) {
+  const endpoint = `${RECAPTCHA_VERIFY_URL}?response=${token}&secret=${RECAPTCHA_SECRET}`;
+  return axios.post(endpoint)
+    .then(({ data }) => data.score > RECAPTCHA_SCORE_THRESHOLD);
+}
+
 exports.handler = async (event, context, callback) => {
   try {
     // Do not handle requests if the request
```

In the `src-function/feedback.js` script, the first thing we do is to import the `axios` library. We can't use our own `api` utility because it's based on the Fetch API which is not supported by Node.js.

```bash
npm install axios
```

Next we get the reCAPTCHA secret from the `process.env` environment variable because we don't want to commit the secret to our Git repository. The `RECAPTCHA_SCORE_THRESHOLD` defines the threshold for declaring a form submission to be human or not. It is a value between `0` and `1` where `0` means almost certainly a bot and `1` is almost certainly a human.

The `isHuman()` function takes the `token` we previously fetched in the `FormFrame` component and sends it to the reCAPTCHA API in order to verify the request and to get a score. If the score is larger than what we've defined in `RECAPTCHA_SCORE_THRESHOLD` we declare the user a human.

```diff
     const {
       message,
       name,
+      token,
     } = JSON.parse(event.body);
 
-    // This is the place to handle
-    // the submitted data.
-    // For example:
-    // await sendEmail({ message, name });
-    // or
-    // await saveToDb({ message, name });
+    if (await isHuman(token)) {
+      // This is the place to handle
+      // the submitted data.
+      // For example:
+      // await sendEmail({ message, name });
+      // or
+      // await saveToDb({ message, name });
+    }
 
     callback(null, {
       statusCode: 200,
```

In this diff you can see how we can make sure to only handle the form submission if it is most likely made be a real human being. We send a `200` status code, no matter what, to keep spam bots from knowing if their submission was successful or not.

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

Renderless components are the gold standard when it comes to reusability of Vue.js components. In contrast to mixins, for example, they're much more transparent.

The implementation we've built in this article is a very basic one but I think it serves as a decent starting point for building more complex solutions.
