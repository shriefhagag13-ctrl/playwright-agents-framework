# Exploratory Test Execution Findings (SCRUM-101)

## Summary

All scenarios in `specs/AgentDemoPlane-checkout-test-plan.md` were manually executed against the live application at https://www.saucedemo.com using the Playwright MCP browser tools, driving the UI step-by-step (navigate, click, type, snapshot) rather than by writing code. Login used `standard_user` / `secret_sauce`.

- **Total scenarios executed:** 36 (AC1: 5, AC2: 8, AC3: 6, AC4: 6, AC5: 11)
- **Pass (matches plan's expected result):** 29
- **"As documented" (open-ended, actual behavior recorded per plan instructions):** 7 — scenarios 1.5, 2.7, 5.1, 5.2, 5.4, 5.6, 5.11
- **Hard failures (crash / broken page):** 0
- **Bugs / gaps flagged against AC5 business rules:** 4 (see Bugs / Findings section)

Note: the browser profile used by the MCP tool retained `cart-contents` in `localStorage` from a prior session at the very start of this run (cart showed "1" item before any action was taken). This was cleared via `localStorage.clear()` before scenario 1.1 to guarantee a true fresh/blank state as required by the plan's preconditions.

## Results Table

| ID | Title | Result | Notes |
|----|-------|--------|-------|
| 1.1 | Cart displays correct item details for a single item | PASS | URL, heading, QTY, name link, description, price $29.99, Remove button, Continue Shopping/Checkout buttons all present as expected. |
| 1.2 | Cart displays correct details/quantities for multiple items | PASS | Badge shows 2; two separate rows, each QTY 1, each with own Remove button — no aggregation. |
| 1.3 | Continue Shopping returns to Products page | PASS | Navigated to /inventory.html; badge remained unchanged. |
| 1.4 | Removing an item from cart page updates the cart | PASS | Bike Light row removed, badge updated 2→1, Backpack row untouched. |
| 1.5 | Checkout reachable with empty cart (edge case) | AS DOCUMENTED | Empty cart shows empty QTY/Description table with Continue Shopping/Checkout still visible. Clicking Checkout with 0 items **navigates to /checkout-step-one.html** — not blocked. Flagged as a finding (see Bugs). |
| 2.1 | Navigating from Cart to Checkout Information page | PASS | Heading "Checkout: Your Information", 3 empty fields, Cancel/Continue buttons present. |
| 2.2 | Valid data proceeds to Overview page | PASS | John/Doe/12345 → navigated to /checkout-step-two.html, no error banner. |
| 2.3 | All fields empty shows First Name required error | PASS | Error banner text exactly "Error: First Name is required", dismiss (X) present, page stayed on /checkout-step-one.html. |
| 2.4 | Only First Name filled shows Last Name required error | PASS | Error text exactly "Error: Last Name is required". |
| 2.5 | First+Last filled, Zip empty shows Postal Code required error | PASS | Error text exactly "Error: Postal Code is required". |
| 2.6 | Dismissing the validation error banner | PASS | Clicking the X (`button[data-test="error-button"]`) hides the banner; all 3 fields remain present, empty, and editable. |
| 2.7 | Whitespace-only values in required fields (boundary) | AS DOCUMENTED | Entering a single space `" "` in First Name, Last Name, and Zip is treated as non-empty and **passes required-field validation** — navigated straight to /checkout-step-two.html with no error. Flagged as a finding (see Bugs). |
| 2.8 | Cancel on Checkout Information returns to Cart, preserves cart | PASS | Navigated to /cart.html; both items still listed; badge still showed 2. |
| 3.1 | Overview item summary matches cart (multi-item) | PASS | Both items shown, QTY 1 each, name/desc/price match cart page values, no Remove buttons present. |
| 3.2 | Overview shows Payment and Shipping info | PASS | "Payment Information: SauceCard #31337"; "Shipping Information: Free Pony Express Delivery!" |
| 3.3 | Price total correct for single item | PASS | Item total $29.99, Tax $2.40 (~8%), Total $32.39 = sum. |
| 3.4 | Price total correct for multiple items | PASS | Item total $39.98, Tax $3.20, Total $43.18 = sum. |
| 3.5 | Cancel on Overview returns to Products, preserves cart | PASS | Navigated to /inventory.html (not /cart.html); badge stayed at 1; item confirmed still present on /cart.html. |
| 3.6 | Finish and Cancel both present/enabled on Overview | PASS | Confirmed on both single-item and multi-item overview pages. |
| 4.1 | Finish completes order, shows confirmation page | PASS | Navigated to /checkout-complete.html; secondary-header title reads "Checkout: Complete!". |
| 4.2 | Confirmation shows success message and image | PASS | Pony Express image present; heading "Thank you for your order!"; body text matches exactly: "Your order has been dispatched, and will arrive just as fast as the pony can get there!" |
| 4.3 | Confirmation has Back Home button | PASS | "Back Home" (`button[data-test="back-to-products"]`) and "Generate PDF order" (`button[data-test="generate-pdf-order"]`) both present and enabled. |
| 4.4 | Back Home navigates to Products page | PASS | Navigated to /inventory.html. |
| 4.5 | Order completion clears the cart | PASS | Cart badge absent on confirmation page; after Back Home, direct nav to /cart.html shows an empty QTY/Description table and no badge. |
| 4.6 | Completed order flow can be repeated for a new item | PASS | Second run with Sauce Labs Onesie ($7.99, Tax $0.64, Total $8.63) completed successfully; confirmation page shown again. |
| 5.1 | Special characters in First/Last Name | AS DOCUMENTED | `@#$%^&*()` in First Name, `!!!!` in Last Name, valid Zip `12345` — **no validation error**, navigated to /checkout-step-two.html. Flagged as a finding (see Bugs). |
| 5.2 | Non-numeric characters in Zip/Postal Code | AS DOCUMENTED | `abcde` in Zip with valid John/Doe — **no format validation error**, navigated to /checkout-step-two.html. Flagged as a finding (see Bugs). |
| 5.3 | Incomplete info + invalid characters | PASS | `###` in First Name only → error "Error: Last Name is required" (first missing required field, per field-order validation); stayed on /checkout-step-one.html. |
| 5.4 | Very long input values (boundary) | AS DOCUMENTED | ~198-char strings in First/Last Name accepted with no crash/layout break; no `maxlength` attribute present on either input (`maxLength` evaluated to -1); page proceeded to Overview without error. No app-enforced maximum length observed. |
| 5.5 | Minimum valid single-character input (boundary) | PASS | First Name 'A', Last Name 'B', Zip '1' — all non-empty, proceeded to Overview without error. |
| 5.6 | Numeric values in First/Last Name | AS DOCUMENTED | '12345'/'67890'/'99999' accepted, proceeded to Overview without error. Not necessarily a bug since the story does not restrict name character types — recorded as informational. |
| 5.7 | Direct URL access to /checkout-step-one.html without login | PASS | Redirected to `/`; error text exactly: "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in." |
| 5.8 | Direct URL access to /checkout-step-two.html without login | PASS | Error text exactly: "Epic sadface: You can only access '/checkout-step-two.html' when you are logged in." |
| 5.9 | Direct URL access to /checkout-complete.html without login | PASS | Error text exactly: "Epic sadface: You can only access '/checkout-complete.html' when you are logged in." |
| 5.10 | Cart persists across logout/login | PASS | Added item (badge=1) → Logout (via hamburger menu) → redirected to login → logged back in → redirected to /inventory.html → badge still showed 1. |
| 5.11 | Browser Back from Overview to Checkout Information | AS DOCUMENTED | Browser Back from /checkout-step-two.html correctly returns to /checkout-step-one.html (SPA history is preserved), **but** First Name, Last Name, and Postal Code values that were previously entered ('12345'/'67890'/'99999') are **cleared/reset to empty**, not retained. |

## Selectors Discovered

All values below were read directly from the live DOM (`data-test` attributes and `id`s), not guessed. These are stable and should be used verbatim for automated test generation.

### Login page (`/`)
| Element | Selector |
|---|---|
| Username field | `input[data-test="username"]` (also `#user-name`) |
| Password field | `input[data-test="password"]` (also `#password`) |
| Login button | `input[data-test="login-button"]` (also `#login-button`) — note: this is an `<input type="submit">`, not a `<button>` |
| Login container | `div[data-test="login-container"]` |
| Credentials info block | `div[data-test="login-credentials"]`, `div[data-test="login-password"]` |
| Error banner (shared component, see below) | `h3[data-test="error"]` |
| Error dismiss (X) button | `button[data-test="error-button"]` |

### Global header (present on all logged-in pages)
| Element | Selector |
|---|---|
| Header container | `div[data-test="header-container"]` |
| Hamburger / open-menu button | `button[data-test="open-menu"]` (also `#react-burger-menu-btn`) |
| Close-menu button | `button[data-test="close-menu"]` (icon inside is `img[data-test="close-menu"]`) |
| Sidebar: All Items | `a[data-test="inventory-sidebar-link"]` |
| Sidebar: About | `a[data-test="about-sidebar-link"]` |
| Sidebar: Logout | `a[data-test="logout-sidebar-link"]` |
| Sidebar: Reset App State | `a[data-test="reset-sidebar-link"]` |
| Shopping cart icon/link | `a[data-test="shopping-cart-link"]` |
| Shopping cart badge (count) | `span[data-test="shopping-cart-badge"]` (class `shopping_cart_badge`) — **element is entirely absent from the DOM when cart is empty**, it is not merely hidden/zero |
| Page title/heading (varies by page) | `span[data-test="title"]` |

### Inventory / Products page (`/inventory.html`)
| Element | Selector |
|---|---|
| Product sort dropdown | `select[data-test="product-sort-container"]` |
| Inventory list container | `div[data-test="inventory-container"]`, `div[data-test="inventory-list"]` |
| Each product card | `div[data-test="inventory-item"]` |
| Product image link | `a[data-test="item-{N}-img-link"]` (N is a fixed per-product index, e.g. item-4 = Backpack, item-0 = Bike Light, item-1 = Bolt T-Shirt, item-5 = Fleece Jacket, item-2 = Onesie, item-3 = Test.allTheThings T-Shirt) |
| Product title link | `a[data-test="item-{N}-title-link"]` |
| Product name text | `div[data-test="inventory-item-name"]` |
| Product description text | `div[data-test="inventory-item-desc"]` |
| Product price text | `div[data-test="inventory-item-price"]` |
| Add to cart button (slug-based, most reliable) | `button[data-test="add-to-cart-sauce-labs-backpack"]`, `add-to-cart-sauce-labs-bike-light`, `add-to-cart-sauce-labs-bolt-t-shirt`, `add-to-cart-sauce-labs-fleece-jacket`, `add-to-cart-sauce-labs-onesie`, `add-to-cart-test.allthethings()-t-shirt-(red)` |
| Remove button (after add) | `button[data-test="remove-{same-slug-as-above}"]` |

### Cart page (`/cart.html`)
| Element | Selector |
|---|---|
| Page heading | "Your Cart" via `span[data-test="title"]` |
| Cart contents container | `div[data-test="cart-contents-container"]` |
| Cart list | `div[data-test="cart-list"]` |
| Column labels | `div[data-test="cart-quantity-label"]` ("QTY"), `div[data-test="cart-desc-label"]` ("Description") |
| Each cart row | `div[data-test="inventory-item"]` |
| Row quantity | `div[data-test="item-quantity"]` |
| Row item title link | `a[data-test="item-{N}-title-link"]` |
| Row remove button | `button[data-test="remove-{item-slug}"]` (same as inventory page) |
| Continue Shopping button | `button[data-test="continue-shopping"]` |
| Checkout button | `button[data-test="checkout"]` |

### Checkout: Your Information (`/checkout-step-one.html`)
| Element | Selector |
|---|---|
| Container | `div[data-test="checkout-info-container"]` |
| First Name field | `input[data-test="firstName"]` (also `#first-name`) |
| Last Name field | `input[data-test="lastName"]` (also `#last-name`) |
| Zip/Postal Code field | `input[data-test="postalCode"]` (also `#postal-code`) |
| Cancel button | `button[data-test="cancel"]` (also `#cancel`) |
| Continue button | `input[data-test="continue"]` (also `#continue`) — **`<input type="submit">`, not `<button>`** |
| Error banner | `h3[data-test="error"]` (exact text varies, see Results Table) |
| Error dismiss (X) button | `button[data-test="error-button"]` |
| Notes | No `maxlength` attribute on firstName/lastName inputs; no client-side format/regex validation beyond "non-empty" is applied to any of the three fields. |

### Checkout: Overview (`/checkout-step-two.html`)
| Element | Selector |
|---|---|
| Container | `div[data-test="checkout-summary-container"]` |
| Cart list (no remove buttons) | `div[data-test="cart-list"]` → `div[data-test="inventory-item"]` |
| Payment info label/value | `div[data-test="payment-info-label"]` ("Payment Information:") / `div[data-test="payment-info-value"]` ("SauceCard #31337") |
| Shipping info label/value | `div[data-test="shipping-info-label"]` ("Shipping Information:") / `div[data-test="shipping-info-value"]` ("Free Pony Express Delivery!") |
| Price total section label | `div[data-test="total-info-label"]` ("Price Total") |
| Item subtotal | `div[data-test="subtotal-label"]` (text "Item total: $X.XX") |
| Tax | `div[data-test="tax-label"]` (text "Tax: $X.XX") |
| Total | `div[data-test="total-label"]` (text "Total: $X.XX") |
| Cancel button | `button[data-test="cancel"]` |
| Finish button | `button[data-test="finish"]` |

### Checkout: Complete (`/checkout-complete.html`)
| Element | Selector |
|---|---|
| Container | `div[data-test="checkout-complete-container"]` |
| Pony Express image | `img[data-test="pony-express"]` |
| Confirmation heading (h2) | `h2[data-test="complete-header"]` — text: "Thank you for your order!" |
| Body/dispatch text | `div[data-test="complete-text"]` — text: "Your order has been dispatched, and will arrive just as fast as the pony can get there!" |
| Back Home button | `button[data-test="back-to-products"]` |
| Generate PDF order button | `button[data-test="generate-pdf-order"]` |
| Notes | Cart badge (`span[data-test="shopping-cart-badge"]`) is absent from DOM on this page. |

### Access-control error page (unauthenticated direct nav)
Same login page and error banner elements as above (`h3[data-test="error"]`, dismiss `button[data-test="error-button"]`). Exact text pattern: `Epic sadface: You can only access '<path>' when you are logged in.` where `<path>` is the originally-requested path (e.g. `/checkout-step-one.html`).

## Bugs / Findings

1. **Empty-cart checkout is not blocked (scenario 1.5).** The Checkout button on `/cart.html` remains enabled and functional even when the cart has zero line items, and clicking it navigates straight to `/checkout-step-one.html`. There is no business-rule guard preventing a user from starting checkout with nothing in the cart. If the story intends "cart cannot be empty at checkout," this is a gap against AC5.

2. **Whitespace-only values pass required-field validation (scenario 2.7).** Entering a single space character (`" "`) into First Name, Last Name, and Postal Code is treated as a non-empty value — no client-side trimming/whitespace check occurs, and the user proceeds directly to the Overview page with no error banner. This is a gap against the AC5 expectation that required fields reject effectively-empty input.

3. **No character-format validation on Name fields (scenario 5.1).** Special characters (e.g. `@#$%^&*()`, `!!!!`) are accepted in First Name / Last Name with no validation error, allowing progression to Overview. If AC5 expects names to be restricted to letters, this is a gap.

4. **No format validation on Postal Code (scenario 5.2).** Non-numeric letters (e.g. `abcde`) are accepted in the Zip/Postal Code field with no format-validation error, allowing progression to Overview. If AC5 expects a numeric-only postal code, this is a gap.

5. **No maximum length enforced on Name fields (scenario 5.4).** Neither the First Name nor Last Name `<input>` has a `maxlength` attribute, and no server-side length limit was observed — very long (~200-char) values are accepted without error or visible layout breakage. Not necessarily a defect (no crash occurred), but worth a product decision on whether a sane upper bound should be enforced.

6. **Numeric-only names accepted (scenario 5.6) — informational, not confirmed as a bug** since the user story does not explicitly restrict character types for name fields; flagged for product/QA sign-off on intended behavior.

7. **Browser Back does not retain previously entered Checkout Information field values (scenario 5.11).** Navigating back from the Overview page correctly lands on `/checkout-step-one.html` (SPA history works), but the First Name / Last Name / Postal Code inputs are reset to empty rather than repopulated with the values entered before Continue was clicked. This is standard behavior for a component that doesn't persist form state across route changes, but should be captured as expected behavior (or challenged as a UX gap) before being encoded into automated tests.

None of the above caused a page crash, console-fatal error, or broken layout — in every case the application accepted the input and rendered the next page normally. All are validation/business-rule gaps rather than functional breakages.

## Screenshots Taken

All saved under `test-results/exploratory-screenshots/` (relative to `D:\playwright`):

| File | Shows |
|---|---|
| `1.1-cart-single-item.png` | Cart page with a single Sauce Labs Backpack line item (scenario 1.1). |
| `1.5-empty-cart.png` | `/cart.html` with an empty QTY/Description table, Continue Shopping/Checkout still visible (scenario 1.5 step 1). |
| `1.5-checkout-with-empty-cart.png` | Result of clicking Checkout with an empty cart — lands on `/checkout-step-one.html` (scenario 1.5 step 2 / finding #1). |
| `2.3-error-first-name-required.png` | Error banner "Error: First Name is required" with dismiss (X) control on Checkout Information page. |
| `2.7-whitespace-only-accepted.png` | Overview page reached after submitting whitespace-only First/Last/Zip values (finding #2). |
| `3.2-3.3-overview-single-item.png` | Overview page for a single item showing Payment/Shipping info and Item total/Tax/Total ($29.99/$2.40/$32.39). |
| `3.1-3.4-overview-multi-item.png` | Overview page for two items showing both line items and totals ($39.98/$3.20/$43.18). |
| `4.1-4.2-4.3-confirmation-page.png` | Confirmation page: Pony Express image, "Thank you for your order!" heading, dispatch text, Back Home/Generate PDF buttons. |
| `4.6-second-checkout-confirmation.png` | Confirmation page from the second (repeat) checkout flow with the Onesie. |
| `5.1-special-characters-accepted.png` | Overview page reached after submitting special characters in First/Last Name (finding #3). |
| `5.2-non-numeric-zip-accepted.png` | Overview page reached after submitting a non-numeric Zip (finding #4). |
| `5.4-long-input-accepted.png` | Overview page reached after submitting ~198-character First/Last Name values, no layout breakage (finding #5). |
| `5.6-numeric-names-accepted.png` | Overview page reached after submitting numeric-only First/Last Name values. |
| `5.7-access-control-checkout-step-one.png` | Login page with "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in." error. |
| `5.9-access-control-checkout-complete.png` | Login page with the equivalent access-control error for `/checkout-complete.html`. |
| `5.11-browser-back-fields-cleared.png` | `/checkout-step-one.html` after browser Back from Overview, showing all three fields empty (finding #7). |
