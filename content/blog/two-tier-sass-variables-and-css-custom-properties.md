+++
date = "2017-11-05T06:52:25+02:00"
title = "Two Tier Sass Variables / CSS Custom Properties"
description = "A two tier variable system can help with keeping large scale CSS codebases maintainable. Learn more about multiple variations of how to use a two tier variable system to keep your codebase flexible and DRY."
intro = "One of the hardest challenges when working with CSS (or Sass) at scale, is to keep everything consistent and maintainable. Sass variables or CSS custom properties can be a very useful tool to help with consistency and flexibility. Although variables can make your life as a developer a lot easier, there are many considerations you have to keep in mind when defining variables for your CSS framework..."
draft = false
categories = ["Development"]
tags = ["CSS", "Sass", "Front-End Architecture"]
+++

One of the hardest challenges when working with CSS (or Sass) at scale, is to keep everything consistent and maintainable. Sass variables or CSS custom properties can be a very useful tool to help with consistency and flexibility. Although variables can make your life as a developer a lot easier, there are many considerations you have to keep in mind when defining variables for your CSS framework.

Imagine the following situation: you may have variables for certain shades of gray you might use in your styles.

```scss
// colors.scss
$color-gray-100: #f6f8fa;
$color-gray-200: #e1e4e8;
$color-gray-300: #a5a5a5;

// button.scss
.button--disabled {
  background-color: $color-gray-200;
}

// input.scss
.input--disabled {
  background-color: $color-gray-200;
}

// card.scss
.card {
  border-color: $color-gray-200;
}
```

As you can see in the example above, we're using the same `$color-gray-200` variable for different use cases. Now imagine you decide that all the disabled styles in your codebase (in our example those are two styles, in a real world application this might be hundreds of styles) should be one shade lighter. You now have to find all the occurrences of the variable in the context of disabled styles and replace the variables with `$color-gray-100`.

## Two tier variables to the rescue
One way to make it easier to handle such situations is, to use a two tier approach for naming your variables. The first tier is for generic variables like the basic gray tones we've seen in the example above. Second tier variables are either named after the context in which they are used or they are named after a specific use case. Furthermore second tier variables always use a first tier variable as their value.

```scss
// colors.scss
// First Tier
$color-gray-100: #f6f8fa;
$color-gray-200: #e1e4e8;
$color-gray-300: #a5a5a5;

// Second Tier
$color-disabled-background: $color-gray-100;
$color-border-default: $color-gray-200;

// button.scss
.button--disabled {
  background-color: $color-disabled-background;
}

// input.scss
.input--disabled {
  background-color: $color-disabled-background;
}

// card.scss
.card {
  border-color: $color-border-default;
}
```

As you can see in the example above, now that we're using a two tier system, changing all the disabled styles in our codebase is as easy as pie – by altering the `$color-disabled-background` variable in one place, we can update all the disabled styles at once.

Next you can see the same example as above but with CSS custom properties instead of Sass variables.

```scss
// colors.scss
:root {
  // First Tier
  --color-gray-100: #f6f8fa;
  --color-gray-200: #e1e4e8;
  --color-gray-300: #a5a5a5;

  // Second Tier
  --color-disabled-background: var(--color-gray-100);
  --color-border-default: var(--color-gray-200);
}

// button.scss
.button--disabled {
  background-color: var(--color-disabled-background);
}

// input.scss
.input--disabled {
  background-color: var(--color-disabled-background);
}

// card.scss
.card {
  border-color: var(--color-border-default);
}
```

## Two tier variables on a component level
In the examples above we've kept the variable names generic, but there might be situations when you have to be more specific.

```scss
// colors.scss
$color-blue-100: #0366d6;
$color-blue-200: #125caf;
$color-blue-300: #0e3d71;

$color-orange-100: #e4ac79;
$color-orange-200: #de924c;
$color-orange-300: #bf6411;

$color-white: #ffffff;

// button.scss
$color-button-primary-background: $color-blue-200;
$color-button-primary-text: $color-white;

$color-button-secondary-background: $color-orange-200;
$color-button-secondary-text: $color-white;

.button--primary {
  background-color: $color-button-primary-background;
  color: $color-button-primary-text;
}

.button--secondary {
  background-color: $color-button-secondary-background;
  color: $color-button-secondary-text;
}
```

The example above, of how to use two tier variables for styling primary and secondary buttons, is only one possible solution for how to define second tier variables which are specific to a component. Another possibility would be to define all the second tier variables in the main `color.scss` file, which has the advantage of having all the settings in one place.

Depending on your project, it might also be possible to not use component specific variables at all.

```scss
// colors.scss
$color-blue-100: #0366d6;
$color-blue-200: #125caf;
$color-blue-300: #0e3d71;

$color-orange-100: #e4ac79;
$color-orange-200: #de924c;
$color-orange-300: #bf6411;

$color-white: #fff;

$color-primary: $color-blue-200;
$color-primary-contrast: $color-white;

$color-secondary: $color-orange-200;
$color-secondary-contrast: $color-white;

// button.scss
.button--primary {
  background-color: $color-primary;
  color: $color-primary-contrast;
}

.button--secondary {
  background-color: $color-secondary;
  color: $color-secondary-contrast;
}
```

The concept above, which only uses generic variable names, is a very clean solution to the problem. But keep in mind, that although this might work very well in the beginning of your project, you may encounter problems later on when your CSS codebase is growing and you have to consider more and more edge cases.

## Final considerations
There are no definitive rules of how to use a two tier variable system. You might define a lot of second tier variables for every specific use case or you may want to keep it DRY by defining few, very generic second tier variables.

Having a lot of very specific variables for every possible use case, makes it easier to cover edge cases where no generic variable would fit and it also gives you more freedom on the design front.

If you decide to use few, very specific second tier variables, you have to have a very strict rule set for creating designs. If something is a primary action, it must use the defined primary color, if something is disabled, it must use the defined disabled color, and so on.

Another question you have to answer is if you're allowing the usage of first tier variables for other purposes than defining the values of second tier variables. I'd suggest to only use first tier variables as values for second tier variables and to only use second tier variables in you CSS styles. But in the end it's up to you to find a system that works best for you, your team and your project.
