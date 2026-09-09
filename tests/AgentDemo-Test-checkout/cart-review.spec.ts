// spec: specs/AgentDemoPlane-checkout-test-plan.md
// findings: specs/AgentDemoPlane-exploratory-findings.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';
import { login, addToCart } from './helpers';

test.describe('AC1 - Cart Review', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Navigate to https://www.saucedemo.com, log in with username 'standard_user' and password 'secret_sauce'.
    await login(page);
    await expect(page).toHaveURL(/\/inventory\.html$/);
  });

  test('Cart displays correct item details for a single item', async ({ page }) => {
    // 2. On the Products page, click 'Add to cart' for 'Sauce Labs Backpack'.
    await addToCart(page, 'sauce-labs-backpack');
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    // 3. Click the cart icon to open the cart page.
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Your Cart');

    // 4. Inspect the single cart line item.
    const row = page.locator('[data-test="inventory-item"]');
    await expect(row).toHaveCount(1);
    await expect(row.locator('[data-test="item-quantity"]')).toHaveText('1');
    await expect(row.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');
    await expect(row.getByRole('link', { name: 'Sauce Labs Backpack' })).toBeVisible();
    await expect(row.locator('[data-test="inventory-item-desc"]')).not.toBeEmpty();
    await expect(row.locator('[data-test="inventory-item-price"]')).toHaveText('$29.99');
    await expect(row.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();

    // 5. Inspect the bottom of the cart page.
    await expect(page.locator('[data-test="continue-shopping"]')).toBeVisible();
    await expect(page.locator('[data-test="checkout"]')).toBeVisible();
  });

  test('Cart displays correct details and quantities for multiple items', async ({ page }) => {
    // 2. Add 'Sauce Labs Backpack' ($29.99) and 'Sauce Labs Bike Light' ($9.99) to the cart using their 'Add to cart' buttons.
    await addToCart(page, 'sauce-labs-backpack');
    await addToCart(page, 'sauce-labs-bike-light');
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');

    // 3. Open the cart page.
    await page.locator('[data-test="shopping-cart-link"]').click();
    const rows = page.locator('[data-test="inventory-item"]');
    // 4. Verify no quantity aggregation error occurs (each distinct product shown as its own row with QTY 1).
    await expect(rows).toHaveCount(2);

    const backpackRow = rows.filter({ hasText: 'Sauce Labs Backpack' });
    const bikeLightRow = rows.filter({ hasText: 'Sauce Labs Bike Light' });
    await expect(backpackRow.locator('[data-test="item-quantity"]')).toHaveText('1');
    await expect(backpackRow.locator('[data-test="inventory-item-price"]')).toHaveText('$29.99');
    await expect(backpackRow.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
    await expect(bikeLightRow.locator('[data-test="item-quantity"]')).toHaveText('1');
    await expect(bikeLightRow.locator('[data-test="inventory-item-price"]')).toHaveText('$9.99');
    await expect(bikeLightRow.locator('[data-test="remove-sauce-labs-bike-light"]')).toBeVisible();
  });

  test('Continue Shopping button returns to the Products page', async ({ page }) => {
    // 1. Log in and add any one item to the cart, then open the cart page.
    await addToCart(page, 'sauce-labs-backpack');
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);

    // 2. Click 'Continue Shopping'.
    await page.locator('[data-test="continue-shopping"]').click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('Removing an item from the cart page updates the cart', async ({ page }) => {
    // 1. Log in and add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to the cart, then open the cart page.
    await addToCart(page, 'sauce-labs-backpack');
    await addToCart(page, 'sauce-labs-bike-light');
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');

    // 2. Click 'Remove' on the 'Sauce Labs Bike Light' row.
    await page.locator('[data-test="remove-sauce-labs-bike-light"]').click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');
  });

  test('Checkout button is reachable even when the cart is empty (edge case)', async ({ page }) => {
    // 1. Without adding any items, navigate directly to /cart.html.
    await page.goto('https://www.saucedemo.com/cart.html');
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
    await expect(page.locator('[data-test="continue-shopping"]')).toBeVisible();
    await expect(page.locator('[data-test="checkout"]')).toBeVisible();

    // 2. Click 'Checkout' with an empty cart.
    // Known gap vs AC5 / business rule "cart can't be empty to checkout" (findings.md, Bug #1):
    // the app does NOT block checkout with an empty cart — it navigates straight through to the
    // Information page regardless. Asserting the real, documented behavior here.
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });
});
