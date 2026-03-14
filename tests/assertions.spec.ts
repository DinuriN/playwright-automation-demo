import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com';

// Helper: Login (consistent with team's style)
async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
}

test.describe('Assertions Feature Demonstration', () => {

  // ─────────────────────────────────────────────────────
  // 1️.TEXT CONTENT ASSERTIONS
  // ─────────────────────────────────────────────────────
  test('should verify page title and header text @assertions @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'feature', description: 'Text Assertions' });
    
    await page.goto(BASE_URL);
    
    // Assert page title contains expected text
    await expect(page).toHaveTitle(/Swag Labs/);
    
    // Assert element text exactly matches
    await expect(page.locator('.login_logo')).toHaveText('Swag Labs');
    
    // Assert element text contains substring (case-insensitive)
    await expect(page.locator('[data-test="username"]')).toHaveAttribute('placeholder', /username/i);
  });

  // ─────────────────────────────────────────────────────
  // 2️.VISIBILITY & STATE ASSERTIONS
  // ─────────────────────────────────────────────────────
  test('should verify element visibility and enabled state @assertions @critical', async ({ page }) => {
    test.info().annotations.push({ type: 'feature', description: 'State Assertions' });
    
    await page.goto(BASE_URL);
    
    // Element should be visible
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
    
    // Element should be enabled (interactive)
    await expect(page.locator('[data-test="login-button"]')).toBeEnabled();
    
    // Element should be editable (for input fields)
    await expect(page.locator('[data-test="username"]')).toBeEditable();
    
    // After login, inventory should be visible
    await login(page);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────
  // 3️.COUNT & LIST ASSERTIONS
  // ─────────────────────────────────────────────────────
  test('should verify product count and cart badge @assertions @regression', async ({ page }) => {
    test.info().annotations.push({ type: 'feature', description: 'Count Assertions' });
    
    await login(page);
    
    // Assert exact number of products displayed
    const products = page.locator('.inventory_item');
    await expect(products).toHaveCount(6);
    
    // Initially cart badge should not exist (count = 0)
    await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
    
    // Add item and verify badge shows "1"
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    await expect(page.locator('.shopping_cart_badge')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────
  // 4️.ATTRIBUTE & VALUE ASSERTIONS
  // ─────────────────────────────────────────────────────
  test('should verify input attributes and values @assertions', async ({ page }) => {
    test.info().annotations.push({ type: 'feature', description: 'Attribute Assertions' });
    
    await page.goto(BASE_URL);
    
    const usernameInput = page.locator('[data-test="username"]');
    
    // Assert placeholder attribute
    await expect(usernameInput).toHaveAttribute('placeholder', 'Username');
    
    // Assert input type
    await expect(usernameInput).toHaveAttribute('type', 'text');
    
    // Fill and verify value
    await usernameInput.fill('test_user');
    await expect(usernameInput).toHaveValue('test_user');
    
    // Clear and verify empty
    await usernameInput.clear();
    await expect(usernameInput).toHaveValue('');
  });

  // ─────────────────────────────────────────────────────
  // 5️.URL & NAVIGATION ASSERTIONS
  // ─────────────────────────────────────────────────────
  test('should verify URL changes after actions @assertions @smoke', async ({ page }) => {
    test.info().annotations.push({ type: 'feature', description: 'URL Assertions' });
    
    // Assert initial URL
    await page.goto(BASE_URL);
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    
    // Login and assert redirect
    await login(page);
    await expect(page).toHaveURL(/.*inventory.*/);
    
    // Go to cart and assert URL
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart.*/);
  });

  // ─────────────────────────────────────────────────────
  // 6️.NEGATIVE ASSERTIONS (Should NOT)
  // ─────────────────────────────────────────────────────
  test('should verify error messages appear for invalid login @assertions @negative', async ({ page }) => {
    test.info().annotations.push({ type: 'feature', description: 'Negative Assertions' });
    
    await page.goto(BASE_URL);
    
    // Attempt login with invalid credentials
    await page.locator('[data-test="username"]').fill('invalid_user');
    await page.locator('[data-test="password"]').fill('wrong_pass');
    await page.locator('[data-test="login-button"]').click();
    
    // Error message SHOULD appear
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Epic sadface');
    
    // User should NOT be redirected to inventory
    await expect(page).not.toHaveURL(/inventory/);
    
    // Success elements should NOT be visible
    await expect(page.locator('.inventory_list')).not.toBeVisible();
  });

  // ─────────────────────────────────────────────────────
  // 7️.AUTO-WAITING ASSERTION (Playwright's Key Strength)
  // ─────────────────────────────────────────────────────
  test('should demonstrate auto-waiting before assertion @assertions @advanced', async ({ page }) => {
    test.info().annotations.push({ type: 'feature', description: 'Auto-Wait Assertions' });
    
    await login(page);
    
    // Playwright automatically waits for element to be stable
    // No need for manual waitForTimeout or explicit waits!
    const backpack = page.locator('[data-test="inventory-item-name"]:has-text("Sauce Labs Backpack")');
    
    // This assertion will retry until element is visible & stable
    await expect(backpack).toBeVisible();
    
    // Click and verify cart updates (auto-wait handles async DOM update)
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    
    console.log('✅ Auto-waiting prevented flaky "element not found" errors');
  });
});