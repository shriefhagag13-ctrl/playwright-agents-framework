// spec: specs/AgentDemoPlane-checkout-test-plan.md
// findings: specs/AgentDemoPlane-exploratory-findings.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';
import { goToCheckoutInformation } from './helpers';

test.describe('AC5 - Error Handling, Negative Testing, and Boundary Conditions', () => {
  test('Special characters in First Name and Last Name fields', async ({ page }) => {
    // 1. Log in, add an item to the cart, and go to the Checkout Information page.
    await goToCheckoutInformation(page);

    // 2. Enter '@#$%^&*()' into First Name, '!!!!' into Last Name, and a valid numeric Zip '12345'.
    await page.locator('[data-test="firstName"]').fill('@#$%^&*()');
    await page.locator('[data-test="lastName"]').fill('!!!!');
    await page.locator('[data-test="postalCode"]').fill('12345');

    // 3. Click 'Continue'.
    // Known gap vs AC5 (findings.md, Bug #3): the app applies no character-format validation to
    // Name fields — special characters are accepted and the user proceeds to Overview with no
    // error banner. Asserting the real, documented behavior here.
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });

  test('Non-numeric characters in Zip/Postal Code field', async ({ page }) => {
    // 1. Log in, add an item to the cart, go to Checkout Information, and enter valid First/Last Name.
    await goToCheckoutInformation(page);
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');

    // 2. Enter 'abcde' (non-numeric letters) into the Zip/Postal Code field and click 'Continue'.
    // Known gap vs AC5 (findings.md, Bug #4): no format validation is applied to Postal Code —
    // non-numeric values are accepted and the user proceeds to Overview with no error banner.
    await page.locator('[data-test="postalCode"]').fill('abcde');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });

  test('Incomplete information combined with invalid characters', async ({ page }) => {
    // 1. Log in, add an item to the cart, go to Checkout Information, enter '###' into First Name only.
    await goToCheckoutInformation(page);
    await page.locator('[data-test="firstName"]').fill('###');

    // 2. Click 'Continue'.
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Last Name is required');
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });

  test('Very long input values in checkout fields (boundary condition)', async ({ page }) => {
    // 1. Log in, add an item to the cart, go to Checkout Information, and enter a 200-character
    // string into First Name, another 200-character string into Last Name, and '12345' into Zip.
    await goToCheckoutInformation(page);
    const longValue = 'A'.repeat(200);
    const firstNameField = page.locator('[data-test="firstName"]');
    const lastNameField = page.locator('[data-test="lastName"]');
    await firstNameField.fill(longValue);
    await lastNameField.fill(longValue);
    await page.locator('[data-test="postalCode"]').fill('12345');

    // Known gap / product-decision item (findings.md, Bug #5): neither Name input declares a
    // maxlength attribute, so no app-enforced maximum length exists.
    await expect(firstNameField).toHaveJSProperty('maxLength', -1);
    await expect(lastNameField).toHaveJSProperty('maxLength', -1);

    // 2. Click 'Continue'.
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });

  test('Minimum valid input (single character) in each field (boundary condition)', async ({ page }) => {
    // 1. Log in, add an item to the cart, go to Checkout Information, and enter a single character
    // in each field: First Name 'A', Last Name 'B', Zip '1'.
    await goToCheckoutInformation(page);
    await page.locator('[data-test="firstName"]').fill('A');
    await page.locator('[data-test="lastName"]').fill('B');
    await page.locator('[data-test="postalCode"]').fill('1');

    // 2. Click 'Continue'. Since all three fields are non-empty, the app proceeds to Overview.
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });

  test('Numeric values entered into First Name / Last Name fields', async ({ page }) => {
    // 1. Log in, add an item to the cart, go to Checkout Information, and enter numeric values
    // into First Name, Last Name, and Zip.
    await goToCheckoutInformation(page);
    await page.locator('[data-test="firstName"]').fill('12345');
    await page.locator('[data-test="lastName"]').fill('67890');
    await page.locator('[data-test="postalCode"]').fill('99999');

    // 2. Click 'Continue'.
    // Informational (findings.md, Bug #6): the story does not restrict name field character
    // types, so numeric-only names are accepted and the user proceeds to Overview without error.
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });
});
