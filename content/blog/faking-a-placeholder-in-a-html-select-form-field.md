+++
date = "2017-07-16T07:55:22+02:00"
title = "How to Show a Placeholder for a <select> Tag"
description = "Learn how to add a placeholder to a <select> HTML element and how you can make a <select> element look like an input field with a placeholder attribute."
intro = "Styling native HTML form fields – especially select fields – with CSS has always been a little tricky. Recently I was confronted with the task of creating a select field with a placeholder value so that the select field blends in nicely with other form fields on the page. The problem of custom styled select elements is a hard one..."
draft = false
categories = ["Development"]
tags = ["CSS Architecture"]
+++

Styling native HTML form fields – especially select fields – with CSS has always been a little tricky. Recently I was confronted with the task of creating a select field with a placeholder value so that the select field blends in nicely with other form fields on the page.

The problem of custom styled select elements is a hard one. Styling a select form field in a particular way is often impossible. For that reason, many websites are replacing select elements with a custom-built solution powered by HTML, CSS, and JavaScript.

Most of the time, this is a pretty bad idea. **It is tough to get accessibility right when building a custom form element**. Many of those custom-built select form fields do not work with screen readers at all or are very hard to use on mobile devices.

I recommend you to avoid building custom form elements at all costs. If you have to use a custom-styled solution, use a battle-tested library instead of rolling your own.

## Fiddling Around

In my case, it was not necessary to swap the native HTML select field with a fake select field. The problem at hand is how to display a placeholder inside a select field.

At first, I didn’t realize that the HTML select element does not support the placeholder attribute; I just assumed it does. Next, I tried using a `disabled` but default selected option element and setting the font color to the same grey as the input placeholder element. And this works in Firefox, but in WebKit and Blink based browsers, this does not work either.

## The Solution

After playing around and noticing that you can change the color of the select element itself, I worked on the idea of **setting the select elements color to placeholder grey as long as a disabled option is selected and changing the color to the default color as soon as the value changes**.

After coming up with a simple JavaScript powered solution my “somehow this has to work without JavaScript” sense tingled again. After some research I found out I could use native browser form validation with the `required` attribute and the `:invalid` pseudo class to achieve the effect I was looking for.

<p data-height="265" data-theme-id="0" data-slug-hash="WOWrqO" data-default-tab="html,result" data-user="maoberlehner" data-embed-version="2" data-pen-title="Fake Select Placeholder with Pure CSS" class="codepen">See the Pen <a href="https://codepen.io/maoberlehner/pen/WOWrqO/">Fake Select Placeholder with Pure CSS</a> by Markus Oberlehner (<a href="https://codepen.io/maoberlehner">@maoberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>

### Avoiding JavaScript at All Costs

The problem with this solution is, that it only works for required form fields. **To circumvent the need for JavaScript we can avoid using a placeholder in optional select fields altogether by providing a neutral default option** like you can see with the second select field in the CodePen above.

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

### Sprinkles of JavaScript

Making select fields required or provide a default value for optional select fields might not be possible all of the time. Some sprinkles of JavaScript can solve this problem once and for all.

<p data-height="265" data-theme-id="0" data-slug-hash="YQBQNj" data-default-tab="css,result" data-user="maoberlehner" data-embed-version="2" data-pen-title="Fake Select Placeholder with (CSS + JavaScript Fallback)" class="codepen">See the Pen <a href="https://codepen.io/maoberlehner/pen/YQBQNj/">Fake Select Placeholder with (CSS + JavaScript Fallback)</a> by Markus Oberlehner (<a href="https://codepen.io/maoberlehner">@maoberlehner</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

By setting the initial placeholder grey color of the element with JavaScript, we are save in case the user has disabled JavaScript, JavaScript didn’t load, the Browser couldn’t execute our JavaScript code or any other reason why JavaScript can be not available.
