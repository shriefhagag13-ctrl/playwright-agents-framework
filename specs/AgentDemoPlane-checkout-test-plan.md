# E-commerce Checkout Process Test Plan (SCRUM-101)

## Application Overview

This test plan covers the E-commerce Checkout Process for the Sauce Demo application (https://www.saucedemo.com), validating user story SCRUM-101. It exercises the full checkout workflow: Cart Review, Checkout Information Entry, Order Overview, Order Completion, and Error Handling, using the standard_user / secret_sauce test account.

All scenarios assume a fresh/blank browser state (no prior session, empty cart) unless the scenario explicitly builds on a previous state as noted in "Preconditions". Application behavior referenced in this plan (button labels, field names, error text, and navigation targets) was verified directly against the live application prior to writing this plan:
- Cart page (/cart.html) shows a QTY / Description table, item name (link), full description, unit price, a Remove button per line, plus "Continue Shopping" and "Checkout" buttons.
- Checkout Information page (/checkout-step-one.html) has First Name, Last Name, and Zip/Postal Code text fields, and Cancel / Continue buttons. Leaving a field blank and clicking Continue shows a red banner with an exact message: "Error: First Name is required", "Error: Last Name is required", or "Error: Postal Code is required" (validated in that field order), each with a dismiss (X) button.
- Overview page (/checkout-step-two.html) repeats the cart items (no Remove buttons here), shows "Payment Information: SauceCard #31337", "Shipping Information: Free Pony Express Delivery!", and a Price Total block with Item total, Tax, and Total, plus Cancel / Finish buttons.
- Cancel on the Information page returns to /cart.html. Cancel on the Overview page returns to /inventory.html (not the cart) — in both cases the cart contents are preserved.
- Confirmation page (/checkout-complete.html) shows a pony image, "Thank you for your order!" heading, a dispatch message, a "Back Home" button, and also a "Generate PDF order" button. Clicking Back Home returns to /inventory.html and the cart badge/cart contents are cleared (order completion empties the cart).
- Attempting to open /checkout-step-one.html, /checkout-step-two.html, or /checkout-complete.html directly without being logged in redirects to the login page with the message: "Epic sadface: You can only access '&lt;path&gt;' when you are logged in."
- The application currently only enforces "required" (non-empty) validation on the Information page fields; it does not reject special characters or non-numeric postal codes at the UI level, and it does not block reaching the Checkout button when the cart is empty. These are flagged as test scenarios against the acceptance criteria (AC5 / business rules) so QA can confirm current behavior and flag any gap against the story's intent.

## Test Scenarios

### 1. AC1 - Cart Review

**Seed:** `tests/seed.spec.ts`

#### 1.1. Cart displays correct item details for a single item

**File:** `tests/checkout/cart-review.spec.ts`

**Steps:**
  1. Navigate to https://www.saucedemo.com, log in with username 'standard_user' and password 'secret_sauce'.
    - expect: User is redirected to /inventory.html and the product list is displayed
  2. On the Products page, click 'Add to cart' for 'Sauce Labs Backpack'.
    - expect: The button changes to 'Remove'
    - expect: The cart icon badge shows '1'
  3. Click the cart icon to open the cart page.
    - expect: URL is /cart.html
    - expect: Page heading reads 'Your Cart'
  4. Inspect the single cart line item.
    - expect: QTY column shows '1'
    - expect: Item name 'Sauce Labs Backpack' is displayed as a link
    - expect: Full item description text is displayed
    - expect: Price '$29.99' is displayed
    - expect: A 'Remove' button is displayed for the line item
  5. Inspect the bottom of the cart page.
    - expect: A 'Continue Shopping' button is visible
    - expect: A 'Checkout' button is visible

#### 1.2. Cart displays correct details and quantities for multiple items

**File:** `tests/checkout/cart-review.spec.ts`

**Steps:**
  1. Log in as standard_user/secret_sauce.
    - expect: Inventory page is displayed
  2. Add 'Sauce Labs Backpack' ($29.99) and 'Sauce Labs Bike Light' ($9.99) to the cart using their 'Add to cart' buttons.
    - expect: Cart badge shows '2'
  3. Open the cart page.
    - expect: Both items are listed, each with QTY '1', correct name, description, and price
    - expect: Each line item has its own 'Remove' button
  4. Verify no quantity aggregation error occurs (each distinct product shown as its own row with QTY 1).
    - expect: Two separate rows are shown, not a combined row

#### 1.3. Continue Shopping button returns to the Products page

**File:** `tests/checkout/cart-review.spec.ts`

**Steps:**
  1. Log in and add any one item to the cart, then open the cart page.
    - expect: Cart page shows the added item
  2. Click 'Continue Shopping'.
    - expect: User is navigated back to /inventory.html
    - expect: Previously added item remains in the cart (badge count unchanged)

#### 1.4. Removing an item from the cart page updates the cart

**File:** `tests/checkout/cart-review.spec.ts`

**Steps:**
  1. Log in and add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to the cart, then open the cart page.
    - expect: Both items listed, badge shows '2'
  2. Click 'Remove' on the 'Sauce Labs Bike Light' row.
    - expect: The row is removed from the cart list
    - expect: Cart badge updates to '1'
    - expect: 'Sauce Labs Backpack' row remains unchanged

#### 1.5. Checkout button is reachable even when the cart is empty (edge case)

**File:** `tests/checkout/cart-review.spec.ts`

**Steps:**
  1. Log in as standard_user, without adding any items navigate directly to /cart.html.
    - expect: Cart page loads showing an empty QTY/Description table (no line items)
    - expect: 'Continue Shopping' and 'Checkout' buttons are still displayed
  2. Click 'Checkout' with an empty cart.
    - expect: Document actual behavior: application currently navigates to /checkout-step-one.html even though the cart is empty. Record as a finding against the business rule 'cart can't be empty to checkout' if this is not the desired behavior.

### 2. AC2 - Checkout Information Entry

**Seed:** `tests/seed.spec.ts`

#### 2.1. Navigating from Cart to Checkout Information page

**File:** `tests/checkout/checkout-info.spec.ts`

**Steps:**
  1. Log in, add 'Sauce Labs Backpack' to the cart, open the cart page, and click 'Checkout'.
    - expect: User is navigated to /checkout-step-one.html
    - expect: Page heading reads 'Checkout: Your Information'
    - expect: First Name, Last Name, and Zip/Postal Code text fields are displayed, all empty
    - expect: Cancel and Continue buttons are displayed

#### 2.2. Valid data in all fields proceeds to the Overview page

**File:** `tests/checkout/checkout-info.spec.ts`

**Steps:**
  1. Log in, add an item to the cart, go to Checkout, then enter First Name 'John', Last Name 'Doe', Zip/Postal Code '12345'.
    - expect: Fields accept the input without error
  2. Click 'Continue'.
    - expect: User is navigated to /checkout-step-two.html ('Checkout: Overview')
    - expect: No error banner is shown

#### 2.3. Clicking Continue with all fields empty shows First Name required error

**File:** `tests/checkout/checkout-info.spec.ts`

**Steps:**
  1. Log in, add an item to the cart, and go to the Checkout Information page. Leave First Name, Last Name, and Zip fields all empty.
    - expect: All three fields are blank
  2. Click 'Continue'.
    - expect: Page remains on /checkout-step-one.html
    - expect: An error banner is displayed reading exactly 'Error: First Name is required'
    - expect: Error banner has a dismiss (X) control

#### 2.4. Clicking Continue with only First Name filled shows Last Name required error

**File:** `tests/checkout/checkout-info.spec.ts`

**Steps:**
  1. Log in, add an item to the cart, go to the Checkout Information page, and enter 'John' in First Name only. Leave Last Name and Zip empty.
    - expect: First Name field contains 'John'
  2. Click 'Continue'.
    - expect: Page remains on /checkout-step-one.html
    - expect: Error banner reads exactly 'Error: Last Name is required'

#### 2.5. Clicking Continue with First and Last Name filled but Zip empty shows Postal Code required error

**File:** `tests/checkout/checkout-info.spec.ts`

**Steps:**
  1. Log in, add an item to the cart, go to the Checkout Information page, and enter First Name 'John', Last Name 'Doe'. Leave Zip/Postal Code empty.
    - expect: First Name shows 'John', Last Name shows 'Doe', Zip is empty
  2. Click 'Continue'.
    - expect: Page remains on /checkout-step-one.html
    - expect: Error banner reads exactly 'Error: Postal Code is required'

#### 2.6. Dismissing the validation error banner

**File:** `tests/checkout/checkout-info.spec.ts`

**Steps:**
  1. Log in, add an item, go to Checkout Information, leave all fields blank, and click 'Continue' to trigger the 'First Name is required' error.
    - expect: Error banner is visible
  2. Click the 'X' dismiss control on the error banner.
    - expect: The error banner is closed/hidden
    - expect: The First Name, Last Name, and Zip fields remain on the page, still empty and editable

#### 2.7. Only whitespace entered in required fields is treated as invalid (boundary condition)

**File:** `tests/checkout/checkout-info.spec.ts`

**Steps:**
  1. Log in, add an item to the cart, go to Checkout Information, and enter a single space character ' ' into First Name, Last Name, and Zip fields.
    - expect: Fields visually contain a space character
  2. Click 'Continue'.
    - expect: Document actual result: verify whether the application accepts whitespace-only values and proceeds to Overview, or shows a required-field error. Flag as a defect if whitespace-only values are accepted as valid data per AC5.

#### 2.8. Cancel on Checkout Information page returns to Cart and preserves cart contents

**File:** `tests/checkout/checkout-info.spec.ts`

**Steps:**
  1. Log in, add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to the cart, open the cart, and click 'Checkout' to reach /checkout-step-one.html.
    - expect: Checkout Information page is displayed, cart badge shows '2'
  2. Without entering any data, click 'Cancel'.
    - expect: User is navigated back to /cart.html
    - expect: Both items previously added remain listed in the cart
    - expect: Cart badge still shows '2'

### 3. AC3 - Order Overview

**Seed:** `tests/seed.spec.ts`

#### 3.1. Overview page shows correct item summary matching the cart

**File:** `tests/checkout/order-overview.spec.ts`

**Steps:**
  1. Log in, add 'Sauce Labs Backpack' ($29.99) and 'Sauce Labs Bike Light' ($9.99) to the cart, proceed to Checkout, and fill First Name 'John', Last Name 'Doe', Zip '12345', then click 'Continue'.
    - expect: User is navigated to /checkout-step-two.html, heading 'Checkout: Overview'
  2. Inspect the item summary table on the Overview page.
    - expect: Both items are listed with QTY '1' each
    - expect: Each item shows its name (link), full description text, and unit price matching the cart page values
    - expect: No 'Remove' buttons are present on this page

#### 3.2. Overview page shows Payment and Shipping information

**File:** `tests/checkout/order-overview.spec.ts`

**Steps:**
  1. Log in, add one item to the cart, complete the Checkout Information step with valid data, and arrive at the Overview page.
    - expect: Overview page is displayed
  2. Locate the 'Payment Information' and 'Shipping Information' sections.
    - expect: Payment Information reads 'SauceCard #31337'
    - expect: Shipping Information reads 'Free Pony Express Delivery!'

#### 3.3. Overview page price total calculation is correct for a single item

**File:** `tests/checkout/order-overview.spec.ts`

**Steps:**
  1. Log in, add only 'Sauce Labs Backpack' ($29.99) to the cart, complete Checkout Information with valid data, and reach the Overview page.
    - expect: Overview page displayed
  2. Read the 'Item total', 'Tax', and 'Total' values in the Price Total section.
    - expect: Item total equals $29.99
    - expect: Tax is calculated correctly (e.g. approximately 8% of item total)
    - expect: Total equals Item total + Tax (e.g. $32.39)

#### 3.4. Overview page price total calculation is correct for multiple items

**File:** `tests/checkout/order-overview.spec.ts`

**Steps:**
  1. Log in, add 'Sauce Labs Backpack' ($29.99) and 'Sauce Labs Bike Light' ($9.99) to the cart, complete Checkout Information with valid data, and reach the Overview page.
    - expect: Overview page displayed
  2. Read the Price Total section.
    - expect: Item total equals $39.98 (sum of both item prices)
    - expect: Tax is calculated on the item total
    - expect: Total equals Item total + Tax (e.g. $43.18)

#### 3.5. Cancel on Overview page returns to Products page and preserves cart

**File:** `tests/checkout/order-overview.spec.ts`

**Steps:**
  1. Log in, add 'Sauce Labs Backpack' to the cart, complete Checkout Information with valid data ('John'/'Doe'/'12345'), and reach the Overview page.
    - expect: Overview page displayed, cart badge shows '1'
  2. Click 'Cancel' on the Overview page.
    - expect: User is navigated to /inventory.html (Products page), NOT back to the cart page
    - expect: Cart badge still shows '1', confirming the item is still in the cart
  3. Open the cart page to confirm.
    - expect: 'Sauce Labs Backpack' is still listed in the cart

#### 3.6. Finish and Cancel buttons are both present and enabled on Overview page

**File:** `tests/checkout/order-overview.spec.ts`

**Steps:**
  1. Log in, add an item to the cart, complete Checkout Information, and reach the Overview page.
    - expect: 'Cancel' and 'Finish' buttons are both visible and clickable

### 4. AC4 - Order Completion

**Seed:** `tests/seed.spec.ts`

#### 4.1. Clicking Finish completes the order and shows the confirmation page

**File:** `tests/checkout/order-completion.spec.ts`

**Steps:**
  1. Log in, add 'Sauce Labs Backpack' to the cart, complete Checkout Information with valid data (First Name 'John', Last Name 'Doe', Zip '12345'), and reach the Overview page.
    - expect: Overview page displayed with the item and totals
  2. Click 'Finish'.
    - expect: User is navigated to /checkout-complete.html
    - expect: Page heading reads 'Checkout: Complete!'

#### 4.2. Confirmation page shows success message and image

**File:** `tests/checkout/order-completion.spec.ts`

**Steps:**
  1. Complete a full checkout flow (login, add item, valid info, Finish) to reach the confirmation page.
    - expect: Confirmation page displayed
  2. Inspect the page content.
    - expect: A 'Pony Express' image is displayed
    - expect: Heading reads 'Thank you for your order!'
    - expect: Body text reads 'Your order has been dispatched, and will arrive just as fast as the pony can get there!'

#### 4.3. Confirmation page has a Back Home button

**File:** `tests/checkout/order-completion.spec.ts`

**Steps:**
  1. Complete a full checkout flow to reach the confirmation page.
    - expect: Confirmation page displayed
  2. Locate the action buttons on the page.
    - expect: A 'Back Home' button is present and enabled
    - expect: A 'Generate PDF order' button is also present (secondary action)

#### 4.4. Back Home navigates to Products page

**File:** `tests/checkout/order-completion.spec.ts`

**Steps:**
  1. Complete a full checkout flow to reach the confirmation page.
    - expect: Confirmation page displayed
  2. Click 'Back Home'.
    - expect: User is navigated to /inventory.html (Products page)

#### 4.5. Order completion clears the cart

**File:** `tests/checkout/order-completion.spec.ts`

**Steps:**
  1. Log in, add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to the cart (badge shows '2'), complete Checkout Information with valid data, reach Overview, and click 'Finish'.
    - expect: Confirmation page is shown, and the cart badge icon no longer displays a count (badge is absent)
  2. Click 'Back Home', then open the cart page (/cart.html) directly.
    - expect: Cart page shows no line items (empty QTY/Description table)
    - expect: Cart badge remains absent

#### 4.6. Completed order flow can be repeated for a new set of items

**File:** `tests/checkout/order-completion.spec.ts`

**Steps:**
  1. Complete one full checkout (login, add item, valid info, Finish, Back Home).
    - expect: Cart is cleared and user is back on Products page
  2. Add a different item (e.g. 'Sauce Labs Onesie') to the cart and repeat the full checkout flow to completion.
    - expect: Second checkout completes successfully with its own correct item summary and totals on the Overview page, and confirmation page is shown again

### 5. AC5 - Error Handling, Negative Testing, and Boundary Conditions

**Seed:** `tests/seed.spec.ts`

#### 5.1. Special characters in First Name and Last Name fields

**File:** `tests/checkout/negative-validation.spec.ts`

**Steps:**
  1. Log in, add an item to the cart, and go to the Checkout Information page.
    - expect: Page displayed with empty fields
  2. Enter '@#$%^&*()' into First Name, '!!!!' into Last Name, and a valid numeric Zip '12345'.
    - expect: Fields accept the typed characters
  3. Click 'Continue'.
    - expect: Document actual result: verify whether the application blocks progress with a validation error for invalid characters (per AC5 expectation), or allows navigation to the Overview page. Record any discrepancy from AC5 as a defect/finding.

#### 5.2. Non-numeric characters in Zip/Postal Code field

**File:** `tests/checkout/negative-validation.spec.ts`

**Steps:**
  1. Log in, add an item to the cart, go to Checkout Information, and enter valid First Name 'John' and Last Name 'Doe'.
    - expect: Fields accept input
  2. Enter 'abcde' (non-numeric letters) into the Zip/Postal Code field and click 'Continue'.
    - expect: Document actual result: verify whether the app shows a format-validation error for the postal code or allows navigation to the Overview page. Record any discrepancy from AC5 as a defect/finding.

#### 5.3. Incomplete information combined with invalid characters

**File:** `tests/checkout/negative-validation.spec.ts`

**Steps:**
  1. Log in, add an item to the cart, go to Checkout Information, enter '###' into First Name only, and leave Last Name and Zip empty.
    - expect: Only First Name has a value
  2. Click 'Continue'.
    - expect: An error banner is shown for the first missing required field: 'Error: Last Name is required'
    - expect: Page remains on /checkout-step-one.html

#### 5.4. Very long input values in checkout fields (boundary condition)

**File:** `tests/checkout/negative-validation.spec.ts`

**Steps:**
  1. Log in, add an item to the cart, go to Checkout Information, and enter a 200-character string into First Name, another 200-character string into Last Name, and '12345' into Zip.
    - expect: Fields accept the long input without crashing the page (may truncate visually)
  2. Click 'Continue'.
    - expect: Document whether the app enforces a maximum length or accepts the long values and proceeds to Overview page without errors or layout breakage

#### 5.5. Minimum valid input (single character) in each field (boundary condition)

**File:** `tests/checkout/negative-validation.spec.ts`

**Steps:**
  1. Log in, add an item to the cart, go to Checkout Information, and enter a single character in each field: First Name 'A', Last Name 'B', Zip '1'.
    - expect: Fields accept single-character input
  2. Click 'Continue'.
    - expect: Since all three fields are non-empty, the application proceeds to the Overview page without a required-field error

#### 5.6. Numeric values entered into First Name / Last Name fields

**File:** `tests/checkout/negative-validation.spec.ts`

**Steps:**
  1. Log in, add an item to the cart, go to Checkout Information, and enter '12345' into First Name, '67890' into Last Name, and '99999' into Zip.
    - expect: Fields accept numeric input
  2. Click 'Continue'.
    - expect: Document actual result: verify whether the app allows numeric-only names to proceed to the Overview page, given the story does not explicitly restrict name field character types

#### 5.7. Direct URL access to Checkout Information page without login is blocked

**File:** `tests/checkout/access-control.spec.ts`

**Steps:**
  1. Ensure no active session (log out if logged in, or open a fresh browser context). Navigate directly to https://www.saucedemo.com/checkout-step-one.html.
    - expect: User is redirected to the login page (/)
    - expect: An error banner is shown reading: "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."

#### 5.8. Direct URL access to Overview page without login is blocked

**File:** `tests/checkout/access-control.spec.ts`

**Steps:**
  1. Ensure no active session. Navigate directly to https://www.saucedemo.com/checkout-step-two.html.
    - expect: User is redirected to the login page (/)
    - expect: An error banner is shown reading: "Epic sadface: You can only access '/checkout-step-two.html' when you are logged in."

#### 5.9. Direct URL access to Confirmation page without login is blocked

**File:** `tests/checkout/access-control.spec.ts`

**Steps:**
  1. Ensure no active session. Navigate directly to https://www.saucedemo.com/checkout-complete.html.
    - expect: User is redirected to the login page (/)
    - expect: An error banner is shown reading: "Epic sadface: You can only access '/checkout-complete.html' when you are logged in."

#### 5.10. Cart contents persist across logout/login (session behavior)

**File:** `tests/checkout/access-control.spec.ts`

**Steps:**
  1. Log in as standard_user, add 'Sauce Labs Backpack' to the cart (badge shows '1'), then open the hamburger menu and click 'Logout'.
    - expect: User is redirected to the login page
  2. Log back in with the same standard_user credentials.
    - expect: User is redirected to /inventory.html
    - expect: Cart badge still shows '1', confirming the previously added item persisted across the session

#### 5.11. Browser back navigation from Overview page to Checkout Information page

**File:** `tests/checkout/access-control.spec.ts`

**Steps:**
  1. Log in, add an item to the cart, go to Checkout Information, enter valid data (First Name 'John', Last Name 'Doe', Zip '12345'), and click 'Continue' to reach the Overview page.
    - expect: Overview page is displayed
  2. Use the browser Back button to return to the previous page.
    - expect: Document actual behavior: verify whether the browser returns to /checkout-step-one.html and whether the previously entered First Name/Last Name/Zip values are retained or cleared
