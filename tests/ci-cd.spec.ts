import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com';

// Helper function to login
async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
}

// 1️⃣ Login Test
test('user can login successfully', async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL(/inventory/);
});

// 2️⃣ Add Item to Cart Test
test('user can add item to cart', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});

// 3️⃣ Remove Item from Cart Test
test('user can remove item from cart', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
  await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
});

// 4️⃣ Checkout Test
test('user can complete checkout', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();

  await page.locator('[data-test="firstName"]').fill('John');
  await page.locator('[data-test="lastName"]').fill('Doe');
  await page.locator('[data-test="postalCode"]').fill('12345');
  await page.locator('[data-test="continue"]').click();
  await page.locator('[data-test="finish"]').click();

  await expect(page.locator('.complete-header')).toHaveText('THANK YOU FOR YOUR ORDER');
});