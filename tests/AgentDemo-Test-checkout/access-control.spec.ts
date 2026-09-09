// spec: specs/AgentDemoPlane-checkout-test-plan.md
// findings: specs/AgentDemoPlane-exploratory-findings.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';
import { BASE_URL, login, addToCart, goToCheckoutInformation, fillCheckoutInfo } from './helpers';

test.describe('AC5 - Error Handling, Negative Testing, and Boundary Conditions', () => {
  test('Direct URL access to Checkout Information page without login is blocked', async ({ page }) => {
    // 1. Ensure no active session (fresh browser context, per Playwright test isolation).
    // Navigate directly to https://www.saucedemo.com/checkout-step-one.html.
    await page.goto(`${BASE_URL}/checkout-step-one.html`);
    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.locator('[data-test="error"]')).toHaveText(
      "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."
    );
  });

  test('Direct URL access to Overview page without login is blocked', async ({ page }) => {
    // 1. Ensure no active session. Navigate directly to https://www.saucedemo.com/checkout-step-two.html.
    await page.goto(`${BASE_URL}/checkout-step-two.html`);
    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.locator('[data-test="error"]')).toHaveText(
      "Epic sadface: You can only access '/checkout-step-two.html' when you are logged in."
    );
  });

  test('Direct URL access to Confirmation page without login is blocked', async ({ page }) => {
    // 1. Ensure no active session. Navigate directly to https://www.saucedemo.com/checkout-complete.html.
    await page.goto(`${BASE_URL}/checkout-complete.html`);
    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.locator('[data-test="error"]')).toHaveText(
      "Epic sadface: You can only access '/checkout-complete.html' when you are logged in."
    );
  });

  test('Cart contents persist across logout/login (session behavior)', async ({ page }) => {
    // 1. Log in as standard_user, add 'Sauce Labs Backpack' to the cart, then log out via the hamburger menu.
    await login(page);
    await addToCart(page, 'sauce-labs-backpack');
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    // The [data-test="open-menu"] attribute is on the decorative <img> icon, which is visually
    // layered under the actual clickable <button id="react-burger-menu-btn"> (absolutely
    // positioned on top, same size/position). Clicking the img directly gets intercepted by the
    // button, so we target the button itself to open the hamburger menu reliably.
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="logout-sidebar-link"]').click();
    await expect(page).toHaveURL(`${BASE_URL}/`);

    // 2. Log back in with the same standard_user credentials.
    await login(page);
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('Browser back navigation from Overview page to Checkout Information page', async ({ page }) => {
    // 1. Log in, add an item to the cart, go to Checkout Information, enter valid data, and click
    // 'Continue' to reach the Overview page.
    await goToCheckoutInformation(page);
    await fillCheckoutInfo(page, 'John', 'Doe', '12345');
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);

    // 2. Use the browser Back button to return to the previous page.
    await page.goBack();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);

    // Documented behavior (findings.md, Bug #7): browser Back correctly lands on
    // /checkout-step-one.html, but the previously entered First Name / Last Name / Postal Code
    // values are NOT retained — the form resets to empty rather than being repopulated.
    await expect(page.locator('[data-test="firstName"]')).toHaveValue('');
    await expect(page.locator('[data-test="lastName"]')).toHaveValue('');
    await expect(page.locator('[data-test="postalCode"]')).toHaveValue('');
  });
});
