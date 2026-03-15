import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com';

// Helper to login
async function login(page : Page) {
  await page.goto(BASE_URL);
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
}

// 1. MOCK PRODUCT LIST
test('mock product list with fake data', async ({ page }) => {
  await page.goto(BASE_URL);

  await page.route('**/static/js/*.js', async route => {
    const response = await route.fetch();
    let body = await response.text();
    body = body.replace('Sauce Labs Backpack', 'Fake Product 999');
    await route.fulfill({ response, body });
  });

  await login(page);

  await expect(page.locator('[data-test="inventory-item-name"]').first()).toContainText('Fake Product 999');
});

// 2. MOCK EMPTY INVENTORY
test('mock empty product list', async ({ page }) => {
  await login(page);

  await page.evaluate(() => {
    const items = document.querySelectorAll('[data-test="inventory-item"]');
    items.forEach(item => item.remove());
  });

  await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
});

// 3. SIMULATE SERVER FAILURE (500)
test('simulate server failure on inventory page', async ({ page }) => {
  await page.goto(BASE_URL);

  await page.route('**/static/js/*.js', route => {
    route.fulfill({
      status: 500,
      body: 'Internal Server Error'
    });
  });

  await page.reload();

  await expect(page.locator('#root')).toBeEmpty();
});

// 4. MOCK SLOW RESPONSE
test('simulate slow network response', async ({ page }) => {
  await page.goto(BASE_URL);

  await page.route('**/static/js/*.js', async route => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    await route.continue();
  });

  await page.reload();

  await expect(page.locator('[data-test="login-button"]')).toBeVisible({ timeout: 15000 });
});

// 5. MOCK UNAUTHORISED (401)
test('simulate unauthorised access', async ({ page }) => {
  await page.goto(BASE_URL);

  await page.route('**/static/js/*.js', route => {
    route.fulfill({
      status: 401,
      body: 'Unauthorised - Please log in again'
    });
  });

  await page.reload();

  await expect(page.locator('#root')).toBeEmpty();
});

// 6. MOCK CART API RESPONSE
test('mock cart with modified quantity', async ({ page }) => {
  await login(page);

  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="shopping-cart-link"]').click();

  // Wait for quantity element directly
  await expect(page.locator('[data-test="item-quantity"]')).toBeVisible();

  // Modify quantity via JS
  await page.evaluate(() => {
    const qty = document.querySelector('[data-test="item-quantity"]');
    if (qty) qty.textContent = '99';
  });

  await expect(page.locator('[data-test="item-quantity"]')).toHaveText('99');
});