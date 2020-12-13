+++
date = "2020-05-03T08:51:51+02:00"
title = "Using Netlify Redirects to Proxy Images Hosted on a Third Party Image Provider or a Headless CMS"
description = "Learn how you can use Netlify redirects to serve images hosted on Cloudinary from your own domain."
intro = "If you are using a third-party image hosting service like Cloudinary or if you are hosting your images via a headless CMS like Storyblok, you may have been annoyed that the images are not delivered from your domain..."
draft = false
categories = ["Development"]
tags = ["Netlify", "Cloudinary", "headless CMS"]
images = ["/images/c_pad,b_rgb:23F56E,f_auto,q_auto,w_1014,h_510/v1542158521/blog/2020-05-03/netlify-proxy"]
+++

If you are using a third-party image hosting service like Cloudinary or if you are hosting your images via a headless CMS like Storyblok, **you may have been annoyed that the images are not delivered from your domain.**

```bash
# Image served via Cloudinary
https://res.cloudinary.com/maoberlehner/image/upload/v1584257421/blog/2020-03-15/eleventy-preact.png

# Image served via Storyblok
https://a.storyblok.com/f/56283/1024x768/8a9c71a740/eleventy-preact.png

# What I want
https://markus.oberlehner.net/images/v1584257421/blog/2020-03-15/eleventy-preact.png
```

If you host your website with Netlify, you're in luck: **we can use Netlify redirects to proxy the requests to our third-party image provider, so it looks like the images are served from our domain.**

```toml
# Cloudinary
[[redirects]]
  from = "/images/*"
  to = "https://res.cloudinary.com/maoberlehner/image/upload/:splat"
  status = 200

# Storyblok
[[redirects]]
  from = "/images/*"
  to = "https://a.storyblok.com/f/56283/:splat"
  status = 200
```

The critical part is the HTTP status code 200 of the redirect rule; this makes it a rewrite.

```html
<!-- before: -->
<img src="https://res.cloudinary.com/maoberlehner/image/upload/v1584257421/blog/2020-03-15/eleventy-preact.png" alt="...">
<!-- or -->
<img src="https://a.storyblok.com/f/56283/1024x768/8a9c71a740/eleventy-preact.png" alt="...">

<!-- after: -->
<img src="/images/v1584257421/blog/2020-03-15/eleventy-preact.png" alt="...">
<!-- or -->
<img src="/images/1024x768/8a9c71a740/eleventy-preact.png" alt="...">
```

## Benefits

The image provider can stop its service at any time, and then the images will no longer be accessible at the same URL. This can have negative consequences, for example, for the ranking in the Google search. By using Netlify as a proxy, everything is served from your domain, and you are in full control. You can switch to another provider or choose to serve the images from your own server at any time.

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

## Caveats

Proxying the request adds a few milliseconds to the load time of your images. In my quick test, it was about 30ms.

Furthermore, if you serve the assets of your site via the same domain as the site itself, all the cookies you set are also sent with each request. But this can be mitigated by serving assets from a separate sub-domain like `assets.oberlehner.net`.

You have to decide if it's worth it in your case or not.
