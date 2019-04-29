+++
date = "2017-04-04T06:04:01+02:00"
title = "AMP and the Open Web"
description = "The technical aspects and restrictions of AMP make it just harder to build a very slow site – the cache is actually what AMP is at it's core."
intro = "About three months ago I held a talk about Google AMP at the local stahlstadt.js meet up. Since then AMP has gained a lot of traction. Today most of my Google search results for news on mobile have this little lightning bolt which marks them as valid (and cached) AMP pages..."
draft = false
categories = ["Development"]
images = ["https://markus.oberlehner.net/images/2017-04-04/stahlstadtjs-amp-rant.jpg"]
+++

About three months ago I did a talk about Google AMP at the local [stahlstadt.js meet up](https://www.meetup.com/de-DE/stahlstadt-js/). Since then AMP has gained a lot of traction. Today most of my Google search results for news on mobile have this little lightning bolt which marks them as valid (and cached) AMP pages.

![Markus Oberlehner talking about Google AMP at the stahlstadt.js meet up](/images/2017-04-04/stahlstadtjs-amp-rant.jpg)

My talk focused almost exclusively on the technical aspects of AMP. Although I also talked about the possible ups and downs the AMP Cache could have, I didn't consider the further implications. I also underestimated how huge AMP would become, especially in the news business.

At the time I held my talk I thought of the AMP Cache as a little bonus feature, more like a free CDN. As I only now realize, the cache is actually what AMP is at it's core.

## The AMP Cache
Every valid AMP page get's automatically cached on a Google Server. There are also some optimizations which will run on cached AMP pages like compressing images and such stuff, but that's not the most important thing. What's most important is that Google (the actual search engine) can trust the cached version of your page on their server. If a page ends up in the AMP Cache, it is guaranteed to be a valid AMP page and therefore most likely decently fast loading and guaranteed to not execute any harmful JavaScript.

So if you're providing an AMPed up version of your page, Google caches it and rewards you with the chance that your articles end up in the top stories carousel, the fancy lightning bolt and most notably **preloading of your page** in search result listings.

### Preloading of AMP pages
AMP pages aren't actually that fast by itself. There is no special technique that AMP is utilizing which magically makes your pages fast. In fact highly optimized sites like [The Guardian](https://www.theguardian.com) deliver faster loading times with their non AMP versions of their pages. But there's *this one weird trick* which makes AMP pages **seem** to load extremely fast when you click on them in Google search result listings. It's preloading.

Because Google knows it can trust the cached version of your page on **their server** it is possible to preload AMP news articles in search results. At the time you click on one of those search results with the lightning bolt, at least the above the fold content is already loaded and the page appears to load instantly.

Thats why the AMP Cache is the most important part of AMP. All the other technical aspects and restrictions make it just harder to build a very slow site. But they are not the real reason why AMP pages are loading blazingly fast if you reach them from a Google search. I'd even go so far as to say that AMP – in the sense of the JavaScript library, the HTML components and technical restrictions – is just a distraction from the real goal of Google, which is to have full control over the web.

## Don't be evil
No one in their right mind would give up the control over their content and allow Google to cache their sites and serve them from Google servers automatically. But with AMP most of the major news platforms suddenly seem to be OK with that idea.

Google could cache regular pages and do almost all the optimizations AMP does automatically. The problem is, nobody would allow Google to do that, that would be silly, right? But with AMP the major news platforms doing all the work voluntarily and happily allow Google to cache and serve **their** content.

Google argues all of this is for the greater good. Users are happy because sites are loading fast, happy users means more user engagement which in turn means more advertising money and advertising money is what makes publishers happy. Everybody is happy – what is the problem with that? We're in turn giving Google full control over the web.

Although Google allows certified third party providers to build their own AMP Cache implementations, with [Cloudflare being the first](https://blog.cloudflare.com/accelerated-mobile/). So maybe there's a glimmer of hope? However many problems of AMP and the AMP Cache still remain no matter which provider is used.

## Is Google already evil?
At least since the monopoly of Standard Oil (ended by antitrust laws in 1911) we know that big companies controlling a huge part of a certain market, are almost never a good thing. Google is already controlling a huge part of the internet with many of it's services considered to be the de facto standards in their segment (Google Search, Google Analytics, Google Adwords,...). With AMP it is getting even easier to force the usage of Google products. Although it is possible to use other advertising services than Google Adwords and other tracking services than Google Analytics in combination with Google AMP, of course the Google services are better supported while third party services are lacking documentation.

Also there is no guarantee that competing services will be infinitely supported by AMP in the future. Whats even worse is, it is getting very hard for new services to gain ground. A new advertising service may be too unknown to get integrated into AMP but without AMP support no news platform will ever consider to use that new advertising service – a vicious circle.

## The Open Web
AMP is violating all of the most important principles of the Open Web. It prohibits the use of open standards like they are intended to be used, and in turn forces you to use their own proprietary HTML extensions. It attacks one of the most simple yet also most powerful features of the web: the URL. Sharing URLs is getting harder with AMP Cache URLs and it is also harder for users to immediately know the source of the content they are looking at. There are already cases of far right sites or propaganda news platforms like Russia Today, concealing their identity and benefit from the credibility the Google AMP Cache domain provides.

On the other hand there is also a big chance for the Open Web. AMP could serve as a catalyzer for new standards to evolve.

I want to believe that Google is not evil (yet). But we can't leave the fate of the Open Web in the hands of big corporations like Facebook and Google alone.
