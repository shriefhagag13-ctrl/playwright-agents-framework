// Shared helpers for the SCRUM-101 checkout automated test suite (tests/AgentDemo-Test-checkout).
// Selectors used here are the data-test attributes discovered and verified in
// specs/AgentDemoPlane-exploratory-findings.md ("Selectors Discovered" section), and re-confirmed
// live against https://www.saucedemo.com before writing the spec files.

import { Page } from '@playwright/test';

export const BASE_URL = 'https://www.saucedemo.com';

/**
 * Logs in on the login page (default: standard_user / secret_sauce).
 */
export async function login(page: Page, username = 'standard_user', password = 'secret_sauce') {
  await page.goto(BASE_URL);
  await page.locator('[data-test="username"]').fill(username);
  await page.locator('[data-test="password"]').fill(password);
  await page.locator('[data-test="login-button"]').click();
}

/**
 * Clicks "Add to cart" for a product identified by its slug
 * (e.g. 'sauce-labs-backpack', 'sauce-labs-bike-light', 'sauce-labs-onesie').
 */
export async function addToCart(page: Page, slug: string) {
  await page.locator(`[data-test="add-to-cart-${slug}"]`).click();
}

/**
 * Logs in, adds the given product slugs to the cart, opens the cart page, and clicks
 * Checkout, landing on /checkout-step-one.html.
 */
export async function goToCheckoutInformation(page: Page, slugs: string[] = ['sauce-labs-backpack']) {
  await login(page);
  for (const slug of slugs) {
    await addToCart(page, slug);
  }
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
}

/**
 * Fills the Checkout Information form (First Name / Last Name / Zip) and clicks Continue.
 */
export async function fillCheckoutInfo(page: Page, firstName = 'John', lastName = 'Doe', postalCode = '12345') {
  await page.locator('[data-test="firstName"]').fill(firstName);
  await page.locator('[data-test="lastName"]').fill(lastName);
  await page.locator('[data-test="postalCode"]').fill(postalCode);
  await page.locator('[data-test="continue"]').click();
}

/**
 * Full happy-path checkout: login, add items, fill valid info, and click Finish, landing on
 * /checkout-complete.html.
 */
export async function completeCheckout(page: Page, slugs: string[] = ['sauce-labs-backpack']) {
  await goToCheckoutInformation(page, slugs);
  await fillCheckoutInfo(page);
  await page.locator('[data-test="finish"]').click();
}
