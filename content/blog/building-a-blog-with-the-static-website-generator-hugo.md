+++
date = "2017-04-01T20:18:06+02:00"
title = "Building a Blog with the Static Website Generator Hugo"
description = "Learn how to use the static website generator, Hugo, to build a blog. Setup a simple personal blog with Hugo, Gulp and npm scripts to achieve blazing fast loading times."
intro = "There are currently three huge trends in the web development world: reactive JavaScript frameworks, progressive web apps, and static website generators. Especially static website generators are currently getting a lot of attention. With smashingmagazine.com one of the most well-known web design blogs has just announced to make the switch from WordPress to a static website generator..."
draft = false
categories = ["Development"]
+++

There are currently three huge trends in the web development world: reactive JavaScript frameworks, progressive web apps, and static website generators. Especially static website generators are getting a lot of attention since [smashingmagazine.com](https://www.smashingmagazine.com/) – one of the most well-known web design blogs – has announced to make the switch from WordPress to a static website generator. Their choice fell on [Hugo](https://gohugo.io/), which is the current rising star in the static website generator universe.

## Building my blog

When I started my blog a few months ago, it was a no brainer for me to utilize a static website generator instead of a heavyweight CMS like WordPress. I played around with Hugo and also [Jekyll](https://github.com/jekyll/jekyll) and [Hexo](https://hexo.io/) but suffering from a severe form of [NIH syndrome](https://en.wikipedia.org/wiki/Not_invented_here) I quickly decided to build a simple static site generator myself.

I started hacking and after two days I had built my own, very basic static website generator. It was lacking basic features like pagination but who needs pagination anyway if there aren't any blog articles yet? So I was quite happy with what I had built and everything worked nicely. In fact everything worked so well it became really boring and after [next.smashingmagazine.com](https://next.smashingmagazine.com/) was released and everybody raved about how great Hugo is, I decided I should give it a try.

## First steps with Hugo

Installing Hugo is as easy as running `brew update && brew install hugo` if you're using macOS or `sudo apt install hugo` if you're using a Debian based Linux distribution (if you have to use Windows, I feel deeply sorry for you).

If you want to write about programming topics and you need support for syntax highlighting in your articles, I recommend you to also install [Pygments](http://pygments.org/).

```bash
# Install Hugo
brew update && brew install hugo
# Install the latest version of python
# including pip (a Python package manager)
brew install python
# Install the Pygments syntax highlighter
pip install Pygments
```

After installing Hugo you can create a new site by running `hugo new site myblog`. Switch to the newly created directory by running `cd myblog` and run `hugo new blog/my-first-blog-article.md` to create a new blog article.

One of the most powerful features of Hugo is it's built in development server. Run `hugo server --buildDrafts` to run the development server and open `http://localhost:1313/` in your browser to see – nothing – because we haven't created a theme yet.

### Add a theme

Switch into the `themes` directory and clone the `robust` theme. Start the development server again and open `http://localhost:1313/` in your browser to see your newly created site.

```bash
cd themes
git clone https://github.com/dim0627/hugo_theme_robust.git
cd ..
hugo server --theme=hugo_theme_robust --buildDrafts
```

### Add npm scripts

If you're anything like me and you immediately feel the itch to tear everything down and rebuild it from the ground, I have some tips for you. npm scripts are a great tool for making complex build tasks more modular while also keeping the commands to execute them memorizable.

In the following example you can see a list of scripts which make your life as a developer easier.

1. `start` Run the default Gulp task (or any other build system) and the Hugo development server.
2. `build` Before publishing your website you need to build the content with Hugo and all the source files with your build system of choice.
3. `sw-precache` The Google sw-precache module makes it easy to build a service worker for your static website.
4. `lint` Linting.
5. `lighthouse` Run lighthouse tests to see if your website is progressive web app capable.
6. `test` Run unit and / or integration tests.
7. `publish` Use rsync to upload your static website data to your server.

```json
{
  "scripts": {
    "start": "gulp & hugo server --theme=hugo_theme_robust --buildDrafts",
    "build": "hugo --theme=hugo_theme_robust && gulp build",
    "sw-precache": "sw-precache --root=public --sw-file-path=public/service-worker.js",
    "lint": "stylelint 'themes/**/*.scss'",
    "lighthouse": "lighthouse https://localhost:1313/",
    "test": "testcafe chrome tests/",
    "publish": "rsync -avz --delete --exclude=/.* --exclude=/google16e3ae2exda47ac0.html -e ssh public/ your-server.com:/var/www/my-blog.com"
  }
}
```

## My thoughts about Hugo

Although I was a little sad to move away from my custom built solution, I'm quite happy with Hugo so far. Basic features like tagging and pagination would have cost me many hours to build and the custom built solution would be way less powerful than what Hugo has to offer out of the box. Although the installation process of Hugo is painless (assuming you're using macOS) I miss the simplicity a pure Node.js powered solution provides thanks to `npm install`.

One major feature my custom static site generator had to offer, was using [UnCSS](https://github.com/giakki/uncss) to remove all the unnecessary CSS on a site by site basis. I couldn't get this feature up and running with Hugo – but I guess it is also doable.

Definitely the best feature Hugo has to offer is speed. Hugo is damn fast. Building my entire (tiny) blog is a matter of milliseconds. Live reloading is blazing fast, painless and makes developing a breeze.

The only thing a really don't like about Hugo is the Go template language. It sucks. Seriously, it feels like some very smart people at Google had the sinister plan to make the most hard to read template language their is, and they succeeded.

```html
{{ range first 1 (where (where .Site.Pages ".Params.tags" "intersect" .Params.tags) "Permalink" "!=" .Permalink) }}
  {{ $.Scratch.Set "has_related" true }}
{{ end }}
{{ if $.Scratch.Get "has_related" }}
  <hr class="c-hr">
  <aside class="o-vertical-spacing o-vertical-spacing--m">
    <h2 class="c-title c-title--2">Related Content</h2>
    <ul>
      {{ $num_to_show := .Site.Params.related_content_limit | default 7 }}
      {{ range first $num_to_show (where (where .Site.Pages ".Params.tags" "intersect" .Params.tags) "Permalink" "!=" .Permalink) }}
        <li><a class="c-anchor" href="{{ .RelPermalink }}">{{ .Title }}</a> &ndash; {{ .ReadingTime }} minutes
      {{ end }}
    </ul>
  </aside>
{{ end }}
```

I wrote this code myself just a day ago and I have no idea what the hell is going on. So this is my only major pain point with Hugo so far.

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

## Conclusion

The combination of Progressive Web App technologies and static websites is very powerful and enables developers to build websites which are not only faster than regular dynamically rendered websites but also easier to build and to deploy.

Hugo is a very mighty and fast static website generator. I personally do not like the Go template language but I guess thats a matter of taste.

The code powering this blog is [available on GitHub](https://github.com/maoberlehner/markus-oberlehner-net).

Static website generators are here to stay and I love it.
