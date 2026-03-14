import { test, expect } from '@playwright/test';

// ✅ PASS — clean happy path
test('Login page loads correctly @smoke', async ({ page }) => {
  test.info().annotations.push({ type: 'story', description: 'AUTH-101' });

  await page.goto('https://www.saucedemo.com');
  await expect(page).toHaveTitle(/Swag Labs/);
  await expect(page.locator('[data-test="username"]')).toBeVisible();
  await expect(page.locator('[data-test="password"]')).toBeVisible();
  await expect(page.locator('[data-test="login-button"]')).toBeVisible();
});

// ✅ PASS — successful login flow
test('Successful login shows inventory @smoke @critical', async ({ page }) => {
  test.info().annotations.push({ type: 'story', description: 'AUTH-102' });

  await page.goto('https://www.saucedemo.com');
  await page.fill('[data-test="username"]', 'standard_user');
  await page.fill('[data-test="password"]', 'secret_sauce');
  await page.click('[data-test="login-button"]');

  await expect(page).toHaveURL(/inventory/);
  await expect(page.locator('.inventory_list')).toBeVisible();
});

// ✅ PASS — locked out user sees error message
test('Locked out user sees error message @regression', async ({ page }) => {
  test.info().annotations.push({ type: 'story', description: 'AUTH-103' });

  await page.goto('https://www.saucedemo.com');
  await page.fill('[data-test="username"]', 'locked_out_user');
  await page.fill('[data-test="password"]', 'secret_sauce');
  await page.click('[data-test="login-button"]');

  await expect(page.locator('[data-test="error"]')).toBeVisible();
  await expect(page.locator('[data-test="error"]')).toContainText('Sorry, this user has been locked out');
});

// ✅ PASS — correct product count
test('Product count is correct @regression', async ({ page }) => {
  test.info().annotations.push({ type: 'story', description: 'SHOP-201' });

  await page.goto('https://www.saucedemo.com');
  await page.fill('[data-test="username"]', 'standard_user');
  await page.fill('[data-test="password"]', 'secret_sauce');
  await page.click('[data-test="login-button"]');

  const items = page.locator('.inventory_item');
  await expect(items).toHaveCount(6);
});

// ✅ PASS — add item to cart
test('Add item to cart @smoke', async ({ page }) => {
  test.info().annotations.push({ type: 'story', description: 'SHOP-101' });
  test.info().annotations.push({ type: 'severity', description: 'critical' });

  await page.goto('https://www.saucedemo.com');
  await page.fill('[data-test="username"]', 'standard_user');
  await page.fill('[data-test="password"]', 'secret_sauce');
  await page.click('[data-test="login-button"]');

  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});