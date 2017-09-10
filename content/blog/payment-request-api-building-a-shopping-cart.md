+++
date = "2017-09-10T10:42:04+02:00"
title = "Payment Request API Part 2: Building a Shopping Cart"
description = "Learn how to implement a JavaScript shopping cart and collect credit card data with the Payment Request API."
intro = "The first article of this three part series was about building a very basic checkout process using the Payment Request API. In this article we're going to build a basic shopping cart implementation followed by a Payment Request API powered checkout process..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Payment Request API"]
+++

[The first article](/blog/payment-request-api-payment-process-using-the-credit-card-payment-method/) of this three part series was about building a very basic checkout process using the Payment Request API. In this article we're going to build a basic shopping cart implementation followed by a Payment Request API powered checkout process.

<div class="u-text-align-center">
  <img srcset="/images/2017-09-10/payment-request-api-cart-screenshot.png 2x" alt="Payment Request API screenshot">
  <p><small>Payment Request API popup with multiple line items and quantity (Chrome 61)</small></p>
</div>

The following code examples are based on the code in [the previous article about the Payment Request API](/blog/payment-request-api-payment-process-using-the-credit-card-payment-method/), you can look at [the full code featured in this article at GitHub](https://github.com/maoberlehner/markus-oberlehner-net/tree/dev/static/demos/2017-09-10/payment-request-api/index.html) and you can checkout the functionality by looking at [the demo](/demos/2017-09-10/payment-request-api/).

## Basic HTML structure and event listeners
For this example we have to make some slight changes to the code we've already built in the [previous article](/blog/payment-request-api-payment-process-using-the-credit-card-payment-method/).

```html
<ul class="card-list">
  <li class="card-list__item">
    <div class="product" data-id="PRODUCT-001" data-label="Fancy Product" data-currency="EUR" data-value="29.99">
      <h2>Fancy Product</h2>
      <p>I'm a super awesome product, please buy me!</p>
      <div class="product__cta">
        <strong class="product__price">only 29.99 €</strong>
        <a href="#no-js-checkout" class="button product__button">Add to cart</a>
      </div>
    </div>
  </li>
  <li class="card-list__item">
    <div class="product" data-id="PRODUCT-002" data-label="Cheap Product" data-currency="EUR" data-value="19.99">
      <!-- ... -->
    </div>
  </li>
  <li class="card-list__item">
    <div class="product" data-id="PRODUCT-003" data-label="Expensive Product" data-currency="EUR" data-value="49.99">
      <!-- ... -->
    </div>
  </li>
</ul>

<a href="#no-js-checkout" class="button checkout-button">
  Checkout
</a>
```

As you can see above, we've added two more products and wrapped them in a `card-list`. Also the product button text was changed from “Buy” to “Add to cart”. Additionally we're adding a new checkout button at the bottom. In this example we do not want the customer to buy products directly one by one but the customer should add them to the cart and buy multiple products at once by clicking on the new checkout button.

```js
const $products = document.querySelectorAll('.product');
[].slice.call($products).forEach($product => $product.addEventListener('click', handleProductClick));

const $checkoutButton = document.querySelector('.checkout-button');
$checkoutButton.addEventListener('click', () => startPayment(getPaymentDetails()));
```

The process of adding the event listeners to trigger the `handleProductClick()` function is still the same as in the previous article. But we're adding two new lines for binding a new `click` event listener onto the new checkout button. If the user clicks the checkout button, a new payment is started with the payment details we retrieve from `getPaymentDetails()`.

For a detailed explanation of the `startPayment()` function, you can read [the previous article](/blog/payment-request-api-payment-process-using-the-credit-card-payment-method/) or take a look at [the code on GitHub](https://github.com/maoberlehner/markus-oberlehner-net/tree/dev/static/demos/2017-09-10/payment-request-api/index.html).

## Initializing functions
Additionally to the functions we've already used in [the previous article](/blog/payment-request-api-payment-process-using-the-credit-card-payment-method/) we need three more objects which we have to initialize.

```js
// Initialize a new store for our cart items.
// In a real app you might need a more sophisticated
// storage implementation powered by either `localStorage`,
// an API or some other persistent storage method.
const store = new Map();
// The `addToCart` functions takes a product data
// object and adds it to the given store. If the
// same product is added multiple times the `quantitiy`
// property on the product counter is raised.
const addToCart = addToCartFactory({ store });
// Retrieve the payment details (total amount
// and display items) from the store.
const getPaymentDetails = getPaymentDetailsFactory({ store });
```

First of all we need a `store` where we can store our line items which represent the shopping cart. In this example we're simply using JavaScripts own `Map()` object. In a real world app you'll most likely need a persistent data store but for demonstration purposes this is fine.

The `addToCart()` functions is built by providing the previously created `store` as a dependency. This function will take with whatever it got initialized as it's store (as long as it matches the `Map()` interface) to save products in it.

Finally we need a way to retrieve the payment detail data from the shopping cart store. This is what the `getPaymentDetails()` function does.

## Adding products to the cart
In order to add products to the cart instead of immediately triggering the checkout process when the user clicks on a product button, we have to make some slight modifications to the `handleProductClick()` function.

```js
function handleProductClick(e) {
  e.preventDefault();

  const $product = e.currentTarget;
  const $button = e.target;

  if ($button.classList.contains('product__button')) {
    const productData = getProductData($product);

    addToCart(productData);
  }
}
```

As you can see above, instead of starting a new payment, we're calling a new `addToCart()` function and provide the products data as a parameter.

```js
function addToCartFactory({ store }) {
  return (product) => {
    const storeProduct = store.get(product.id);
    const currentQuantity = storeProduct ? storeProduct.quantity : 0;
    const quantity = product.quantity + currentQuantity;

    store.set(product.id, Object.assign({}, product, { quantity }));

    alert(`Prdouct “${product.label}” was added to your cart.`);
  }
}
```

Like in [the previous article](/blog/payment-request-api-payment-process-using-the-credit-card-payment-method/) we're using factory functions to build our functions with their dependencies already preconfigured.

The `addToCart()` function returned by the `addToCartFactory()` function, takes a `product` object as its only parameter. In the function we're checking if a product with the same `id` as the provided product already exists in the store. If yes, we're determining the quantity of how many items of the same product were already added to the store by looking at the `quantity` property of the line item in the store, otherwise the quantity is `0`.

By calling `store.set()` we're either overriding an existing line item in the store with a new quantity, or we're adding a new line item to the store.

To notify the user that he or she has successfully added a new product to the cart, we're calling `alert()` with an info message.

## Retrieving payment details from the shopping cart store
To retrieve the payment details, which we're providing when we're calling the `startPayment()` function, we need a function to take all the items we've added to the store and build a valid `paymentDetails` object with them.

```js
function getPaymentDetailsFactory({ store }) {
  return () => {
    const products = [...store.values()];
    const displayItems = getDisplayItemsFromProducts(products);
    const totalValue = getTotalValueFromProducts(products);

    return {
      total: {
        label: 'Total',
        amount: {
          currency: 'EUR',
          value: totalValue,
        },
      },
      displayItems,
    };
  }
}
```

The function returned by `getPaymentDetailsFactory()` takes no arguments. We're using the new ES6 destructor syntax `[...store.values()]` to get an array of all the values in the `store`. Next we're calling the two helper functions `getDisplayItemsFromProducts()` and `getTotalValueFromProducts()` to build a `displayItems` object with the first, and to get the total value of all products by the second function. Finally we're returning a `paymentDetails` object containing all the necessary data to start a new payment request.

```js
function getLineItemValueFromProduct(product) {
  return parseFloat(product.value, 10) * parseInt(product.quantity, 10);
}

function getDisplayItemsFromProducts(products) {
  return products.map((product) => {
    const quantityPrefix = product.quantity > 1 ? `${product.quantity} x ` : '';

    return {
      label: `${quantityPrefix}${product.label}`,
      amount: {
        currency: product.currency,
        value: getLineItemValueFromProduct(product),
      }
    };
  });
}

function getTotalValueFromProducts(products) {
  return products.reduce((total, product) => {
    return total + getLineItemValueFromProduct(product);
  }, 0);
}
```

The first function `getLineItemValueFromProduct()` you can see in the example code above, takes a `product` object, containing it's quantity and value, and calculates the total price by multiplication of those two values.

The `getDisplayItemsFromProducts()` helper function takes an array of products and builds a new `displayItems` object from it. Because the [current specification of the Payment Request API](https://www.w3.org/TR/payment-request/) does not mention any way of specifying a quantity on a payment item, we have to use it's `label` property for providing informations about how often one item was added to the shopping cart. If the quantity is higher than `1` a prefix in the form of `2 x` is added to the products label.

In the `getTotalValueFromProducts()` helper function, we're using JavaScripts `Array.reduce()` function to calculate the total value of all products in the shopping cart store.

## Full code and demo
The code snippets in this article only illustrate the most important parts of the code. If you want to see the full code, please [take a look at the code at the GitHub repository](https://github.com/maoberlehner/markus-oberlehner-net/tree/dev/static/demos/2017-09-10/payment-request-api/index.html).

The code you can see on GitHub is the code used to build [this demo page on which you can see the Payment Request API powered shopping cart in action](/demos/2017-09-10/payment-request-api/).
