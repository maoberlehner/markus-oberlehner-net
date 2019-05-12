+++
date = "2019-05-12T06:19:19+02:00"
title = "HTTP/2 Server Push with Netlify"
description = "Learn how to user HTTP/2 Server Push with Netlify and how to automatically configure HTTP/2 Server Push with Nuxt.js."
intro = "Everyone I know who uses Netlify for the first time is blown away by its simplicity. But sometimes there are situations where we need to do some advanced server configuration in order to serve our web applications as fast as possible. But as I recently discovered, configuring advanced techniques like using HTTP/2 server push is also quite easy to set up with Netlify..."
draft = false
categories = ["Development"]
tags = ["Netlify", "Front-End Architecture", "deployment"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_white,f_auto,q_auto,w_1014,h_510/v1532158513/blog/2019-05-12/netlify-http2-server-push-dev-tools"]
+++

Everyone I know who uses Netlify for the first time is blown away by its simplicity. But sometimes there are situations where we need to do some advanced server configuration in order to serve our web applications as fast as possible.

**But as I recently discovered, configuring advanced techniques like using HTTP/2 server push is also quite easy to set up with Netlify.**

<div class="c-content__figure">
  <div class="c-content__broad">
    <a href="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto/v1532158513/blog/2019-05-12/netlify-http2-server-push-dev-tools">
      <img
        data-src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-05-12/netlify-http2-server-push-dev-tools"
        data-srcset="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_1480/v1532158513/blog/2019-05-12/netlify-http2-server-push-dev-tools 2x"
        alt="HTTP/2 Server Pushed CSS file in development tools."
      >
      <noscript>
        <img
          src="https://res.cloudinary.com/maoberlehner/image/upload/c_scale,f_auto,q_auto,w_740/v1532158513/blog/2019-05-12/netlify-http2-server-push-dev-tools"
          alt="HTTP/2 Server Pushed CSS file in development tools."
        >
      </noscript>
    </a>
  </div>
  <p class="c-content__caption">
    <small>The download of font.css is initiated by HTTP/2 Server Push</small>
  </p>
</div>

## The `_headers` file

To enable HTTP/2 Server Push for your website on Netlify, you can create a file called `_headers` and place it in the directory served by Netlify. To enable HTTP/2 Server Push for certain resources, you can create a `_headers` file like the following.

```bash
# HTTP/2 Server Push for every site.
/
  Link: </css/font.css>; rel=preload; as=style
  Link: </js/scripts.js>; rel=preload; as=script

# Only push to `/my/awesome/page`.
/my/awesome/page
  Link: </css/font.css>; rel=preload; as=style
  Link: </js/scripts.js>; rel=preload; as=script
```

## Bonus: Netlify HTTP/2 Server Push with Nuxt.js

If you rely on Nuxt.js for building your static sites, you can use the wonderful [nuxt-netlify-http2-server-push](https://github.com/jmblog/nuxt-netlify-http2-server-push) Nuxt.js module to automatically generate the `_headers` file for you every time you run `nuxt generate`.

<div>
  <hr class="c-hr">
  <div class="c-service-info">
    <h2>Do you enjoy this article?</h2>
    <p class="c-service-info__body">
      You can buy me a ☕️ on Ko-fi!<br>
      <div style="margin-top: 0.75em;">
        <script type="text/javascript" src='https://ko-fi.com/widgets/widget_2.js'></script>
        <script type="text/javascript">kofiwidget2.init('Support Me on Ko-fi', '#00acc1', 'O4O7U55Y');kofiwidget2.draw();</script>
      </div>
    </p>
  </div>
  <hr class="c-hr">
</div>

## Wrapping it up

HTTP/2 Server Push can be a potent solution for speeding up the loading time of your application. But remember, it's not a silver bullet! You should absolutely run a variety of benchmarks like Lighthouse and webpagetest.org to figure out if HTTP/2 Server Pushing certain resources has a net positive effect on the overall perceived loading of your application.
