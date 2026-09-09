// spec: specs/AgentDemoPlane-checkout-test-plan.md
// findings: specs/AgentDemoPlane-exploratory-findings.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';
import { goToCheckoutInformation, fillCheckoutInfo } from './helpers';

test.describe('AC3 - Order Overview', () => {
  test('Overview page shows correct item summary matching the cart', async ({ page }) => {
    // 1. Log in, add both items to the cart, proceed to Checkout, and fill in valid info.
    await goToCheckoutInformation(page, ['sauce-labs-backpack', 'sauce-labs-bike-light']);
    await fillCheckoutInfo(page, 'John', 'Doe', '12345');
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Overview');

    // 2. Inspect the item summary table on the Overview page.
    const rows = page.locator('[data-test="inventory-item"]');
    await expect(rows).toHaveCount(2);
    const backpackRow = rows.filter({ hasText: 'Sauce Labs Backpack' });
    const bikeLightRow = rows.filter({ hasText: 'Sauce Labs Bike Light' });
    await expect(backpackRow.locator('[data-test="item-quantity"]')).toHaveText('1');
    await expect(backpackRow.locator('[data-test="inventory-item-desc"]')).not.toBeEmpty();
    await expect(backpackRow.locator('[data-test="inventory-item-price"]')).toHaveText('$29.99');
    await expect(bikeLightRow.locator('[data-test="item-quantity"]')).toHaveText('1');
    await expect(bikeLightRow.locator('[data-test="inventory-item-desc"]')).not.toBeEmpty();
    await expect(bikeLightRow.locator('[data-test="inventory-item-price"]')).toHaveText('$9.99');
    // No 'Remove' buttons are present on this page.
    await expect(page.locator('[data-test^="remove-"]')).toHaveCount(0);
  });

  test('Overview page shows Payment and Shipping information', async ({ page }) => {
    // 1. Log in, add one item to the cart, complete the Checkout Information step with valid data.
    await goToCheckoutInformation(page);
    await fillCheckoutInfo(page, 'John', 'Doe', '12345');

    // 2. Locate the 'Payment Information' and 'Shipping Information' sections.
    await expect(page.locator('[data-test="payment-info-value"]')).toHaveText('SauceCard #31337');
    await expect(page.locator('[data-test="shipping-info-value"]')).toHaveText('Free Pony Express Delivery!');
  });

  test('Overview page price total calculation is correct for a single item', async ({ page }) => {
    // 1. Log in, add only 'Sauce Labs Backpack' ($29.99) to the cart, complete Checkout Information.
    await goToCheckoutInformation(page, ['sauce-labs-backpack']);
    await fillCheckoutInfo(page, 'John', 'Doe', '12345');

    // 2. Read the 'Item total', 'Tax', and 'Total' values in the Price Total section.
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $29.99');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $2.40');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $32.39');
  });

  test('Overview page price total calculation is correct for multiple items', async ({ page }) => {
    // 1. Log in, add both items to the cart, complete Checkout Information with valid data.
    await goToCheckoutInformation(page, ['sauce-labs-backpack', 'sauce-labs-bike-light']);
    await fillCheckoutInfo(page, 'John', 'Doe', '12345');

    // 2. Read the Price Total section.
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $39.98');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $3.20');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $43.18');
  });

  test('Cancel on Overview page returns to Products page and preserves cart', async ({ page }) => {
    // 1. Log in, add 'Sauce Labs Backpack' to the cart, complete Checkout Information with valid data.
    await goToCheckoutInformation(page, ['sauce-labs-backpack']);
    await fillCheckoutInfo(page, 'John', 'Doe', '12345');
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    // 2. Click 'Cancel' on the Overview page.
    await page.locator('[data-test="cancel"]').click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    // 3. Open the cart page to confirm.
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');
  });

  test('Finish and Cancel buttons are both present and enabled on Overview page', async ({ page }) => {
    // 1. Log in, add an item to the cart, complete Checkout Information, and reach the Overview page.
    await goToCheckoutInformation(page);
    await fillCheckoutInfo(page, 'John', 'Doe', '12345');
    await expect(page.locator('[data-test="cancel"]')).toBeEnabled();
    await expect(page.locator('[data-test="finish"]')).toBeEnabled();
  });
});
