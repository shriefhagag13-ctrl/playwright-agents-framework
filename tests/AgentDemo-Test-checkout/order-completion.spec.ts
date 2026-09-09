// spec: specs/AgentDemoPlane-checkout-test-plan.md
// findings: specs/AgentDemoPlane-exploratory-findings.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';
import { addToCart, goToCheckoutInformation, fillCheckoutInfo, completeCheckout } from './helpers';

test.describe('AC4 - Order Completion', () => {
  test('Clicking Finish completes the order and shows the confirmation page', async ({ page }) => {
    // 1. Log in, add 'Sauce Labs Backpack' to the cart, complete Checkout Information with valid data.
    await goToCheckoutInformation(page, ['sauce-labs-backpack']);
    await fillCheckoutInfo(page, 'John', 'Doe', '12345');
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);

    // 2. Click 'Finish'.
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Complete!');
  });

  test('Confirmation page shows success message and image', async ({ page }) => {
    // 1. Complete a full checkout flow (login, add item, valid info, Finish) to reach the confirmation page.
    await completeCheckout(page);

    // 2. Inspect the page content.
    await expect(page.locator('[data-test="pony-express"]')).toBeVisible();
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    await expect(page.locator('[data-test="complete-text"]')).toHaveText(
      'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
    );
  });

  test('Confirmation page has a Back Home button', async ({ page }) => {
    // 1. Complete a full checkout flow to reach the confirmation page.
    await completeCheckout(page);

    // 2. Locate the action buttons on the page.
    await expect(page.locator('[data-test="back-to-products"]')).toBeEnabled();
    await expect(page.locator('[data-test="generate-pdf-order"]')).toBeVisible();
  });

  test('Back Home navigates to Products page', async ({ page }) => {
    // 1. Complete a full checkout flow to reach the confirmation page.
    await completeCheckout(page);

    // 2. Click 'Back Home'.
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
  });

  test('Order completion clears the cart', async ({ page }) => {
    // 1. Log in, add both items to the cart, complete Checkout Information, reach Overview, and click 'Finish'.
    await completeCheckout(page, ['sauce-labs-backpack', 'sauce-labs-bike-light']);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);

    // 2. Click 'Back Home', then open the cart page (/cart.html) directly.
    await page.locator('[data-test="back-to-products"]').click();
    await page.goto('https://www.saucedemo.com/cart.html');
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
  });

  test('Completed order flow can be repeated for a new set of items', async ({ page }) => {
    // 1. Complete one full checkout (login, add item, valid info, Finish, Back Home).
    await completeCheckout(page, ['sauce-labs-backpack']);
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);

    // 2. Add a different item (e.g. 'Sauce Labs Onesie') to the cart and repeat the full checkout flow.
    await addToCart(page, 'sauce-labs-onesie');
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await fillCheckoutInfo(page, 'John', 'Doe', '12345');
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $7.99');
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });
});
