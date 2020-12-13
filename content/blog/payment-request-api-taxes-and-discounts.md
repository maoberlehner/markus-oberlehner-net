+++
date = "2017-09-14T09:37:14+02:00"
title = "Payment Request API Part 3: Taxes and Discounts"
description = "Learn how to add taxes and discounts to Payment Request API powered shopping carts."
intro = "Today we're going to implement taxes and discounts into our Payment Request API powered checkout process. The code is based on the code we've produced in the previous steps..."
draft = false
categories = ["Development"]
tags = ["JavaScript"]
+++

In [the first part](/blog/payment-request-api-payment-process-using-the-credit-card-payment-method/) of this three-part series about the Payment Request API, we explored how to implement a basic payment process using the new Payment Request API.

To further improve the functionality, we looked at [how to build a Payment Request API powered shopping cart in the second article](/blog/payment-request-api-building-a-shopping-cart/) of this series.

Today we're going to implement taxes and discounts into our existing checkout process. The code is based on the code we've produced in the previous steps. You can look up [the full code on GitHub](https://github.com/maoberlehner/markus-oberlehner-net/tree/dev/static/demos/2017-09-14/payment-request-api/index.html) and [check out the demo by following this link](/demos/2017-09-14/payment-request-api/).

<div class="c-content__figure">
  <div class="c-content__broad">
    <img srcset="/images/2017-09-14/payment-request-api-cart-screenshot1.png 2x" alt="Payment Request API screenshot">
  </div>
  <p class="c-content__caption">
    <small>Payment Request API popup with multiple line items, quantity, discounts and taxes (Chrome 61)</small>
  </p>
</div>

## Adding tax categories

Every country on earth handles taxes differently in one way or another, although one common theme in many countries is that different products require different tax percentages. For example foods might be taxed differently than electronic products.

```js
const taxCategories = {
  1: {
    label: 'Tax 1 (10%)',
    percentage: '10',
  },
  2: {
    label: 'Tax 2 (15%)',
    percentage: '15',
  },
  3: {
    label: 'Tax 3 (20%)',
    percentage: '20',
  }
};
```

In this example we're assuming that we're selling products of three different tax categories. In your real world app you might call one of those tax categories “VAT” for example.

```html
<ul class="card-list">
  <li class="card-list__item">
    <div class="product" data-id="PRODUCT-001" data-tax="1" data-label="Fancy Product" data-currency="EUR" data-value="29.99">
      <h2>Fancy Product</h2>
      <p>I'm a super awesome product, please buy me!</p>
      <div class="product__cta">
        <strong class="product__price">only 29.99 €</strong>
        <a href="#no-js-checkout" class="button product__button">Add to cart</a>
      </div>
    </div>
  </li>
  <li class="card-list__item">
    <div class="product" data-id="PRODUCT-002" data-tax="2" data-label="Cheap Product" data-currency="EUR" data-value="19.99">
      <!-- ... -->
    </div>
  </li>
  <li class="card-list__item">
    <div class="product" data-id="PRODUCT-003" data-tax="3" data-label="Expensive Product" data-currency="EUR" data-value="49.99">
      <!-- ... -->
    </div>
  </li>
</ul>
```

We also need a way of associating our products with the tax category they fall into. We're doing this by adding a new `data-tax` attribute.

```js
function productFromDomFactory() {
  return ($product) => ({
    id: $product.dataset.id,
    label: $product.dataset.label,
    currency: $product.dataset.currency,
    value: $product.dataset.value,
    // You could read the quantity from a select field.
    quantity: 1,
    tax: $product.dataset.tax,
  });
}
```

In order to retrieve the tax category from products, we have to update the `productFromDomFactory()` function. As you can see above, we're adding a new `tax` property.

## Calculating taxes

Because it is possible that the user adds multiple products – which are associated with different tax categories – to his or her shopping cart, we can't just calculate the taxes from the total value.

```js
function checkoutPaymentDetailsFactory({ store, taxCategories }) {
  return () => {
    const products = [...store.values()];
    const taxes = taxesFromProducts(products, taxCategories);
    const displayItems = displayItemsFromProducts(products).concat(taxes);

    return {
      total: {
        label: 'Total',
        amount: {
          currency: 'EUR',
          value: totalValue(displayItems),
        },
      },
      displayItems,
    };
  }
}
```

The `checkoutPaymentDetailsFactory()` returns the `checkoutPaymentDetails()` function, which extracts all relevant information from all of the products added to the shopping cart.

The new `taxesFromProducts()` helper function is responsible for calculating sub totals for all products of the different tax categories and further calculate the respective tax value. The function returns an array of display items for all relevant tax categories which we can concatenate onto the display items of all products, returned by `displayItemsFromProducts()`.

```js
function taxesFromProducts(products, taxCategories) {
  return Object.keys(taxCategories)
    .map((tax) => {
      const taxCategory = taxCategories[tax];
      const productsByTaxCategory = products.filter(product => product.tax === tax);

      if (!productsByTaxCategory.length) return;

      const taxValue = totalValueFromProducts(productsByTaxCategory) * (taxCategory.percentage / 100);

      return {
        label: taxCategory.label,
        amount: {
          currency: 'EUR',
          value: Math.round(taxValue * 100) / 100,
        }
      };
    })
    .filter(x => x);
}
```

The `taxesFromProducts()` helper function, takes an array of `products` and the `taxCategories` object as its parameters. We're traversing the `taxCategories` objects keys to find all products which match the current tax category. The total value of all the products of the current tax category is used to calculate the total tax value. Tax categories with no matching products are filtered out. This function returns an array of tax display items.

## Discounts

There are usually two kinds of discounts you can find in online shops: fixed price discounts and percentage based discounts. In this example we're going to implement fixed price discounts.

### Adding a discount product

In this example we're keeping it simple – we're simulating the process of adding a discount, by simply adding a new discount product. In a real world application you would most likely add the “discount product” automatically after the user enters a promo code or something like that.

```html
<div class="product" data-id="PRODUCT-004" data-label="5 € Discount" data-currency="EUR" data-value="-5">
  <h2>5 € Discount</h2>
  <p>Add a super nice 5 € discount!</p>
  <div class="product__cta">
    <strong class="product__price">-5 €</strong>
    <a href="#no-js-checkout" class="button product__button">Add to cart</a>
  </div>
</div>
```

The discount product has the same markup as all the other products, the only difference is the price, which is negative.

Basically thats it, because the discount is just a regular product with a negative price this would already work. Although there is one flaw with this approach.

<div class="c-content__figure">
  <div class="c-content__broad">
    <img srcset="/images/2017-09-14/payment-request-api-cart-screenshot2.png 2x" alt="Payment Request API screenshot">
  </div>
  <p class="c-content__caption">
    <small>The discount display item is displayed as first item</small>
  </p>
</div>

As you can see above, because we're displaying the products in the shopping cart in the order in which the user added the products, it is possible that we end up with the discount being at the top.

The easiest way to overcome this problem, is to sort all the products in the shopping cart by their values.

```js
function displayItemsFromProducts(products) {
  return products
    .map((product) => {
      const quantityPrefix = product.quantity > 1 ? `${product.quantity} x ` : '';

      return {
        label: `${quantityPrefix}${product.label}`,
        amount: {
          currency: product.currency,
          value: lineItemValueFromProduct(product),
        }
      };
    })
    .sort((a, b) => a.amount.value < b.amount.value);
}
```

The `displayItemsFromProducts()` helper function you can see above, is responsible for building an array of display items to submit to the Payment Request API. By adding the `sort()` function at the bottom, we're ordering the products in the shopping cart by their value from high to low which leads to the discount product – with its negative value, which is always lower than a positive value of a product – being at the bottom automatically.

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

## Full code and demo

The code snippets in this article only illustrate the most important parts of the code. If you want to see the full code, please [take a look at the code at the GitHub repository](https://github.com/maoberlehner/markus-oberlehner-net/tree/dev/static/demos/2017-09-14/payment-request-api/index.html).

The code you can see on GitHub is the code used to build [this demo page on which you can see the Payment Request API powered shopping cart with taxes and discounts in action](/demos/2017-09-14/payment-request-api/).
