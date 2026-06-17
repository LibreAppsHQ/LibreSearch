import { test, expect } from '@playwright/test';

test('home page loads and renders search bar', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/LibreSearch/);
	await expect(page.locator('input[name="q"]')).toBeVisible();
});

test('search bar submits query and navigates to results', async ({ page }) => {
	await page.goto('/');
	await page.locator('input[name="q"]').fill('privacy');
	await page.locator('input[name="q"]').press('Enter');

	await page.waitForURL('**/search?q=privacy*');
	await expect(page.locator('input[name="q"]')).toHaveValue('privacy');
});

test('keyboard shortcut / focuses search input', async ({ page }) => {
	await page.goto('/');
	await page.locator('body').press('/');
	await expect(page.locator('input[name="q"]')).toBeFocused();
});

test('search tabs are present on results page', async ({ page }) => {
	await page.goto('/search?q=test');
	await expect(page.locator('text=Web')).toBeVisible();
});

test('static pages render without errors', async ({ page }) => {
	const pages = ['/privacy', '/terms', '/about', '/donate', '/contact'];
	for (const path of pages) {
		await page.goto(path);
		await expect(page).not.toHaveTitle(/500/);
	}
});

test('settings page loads', async ({ page }) => {
	await page.goto('/settings');
	await expect(page.locator('h1')).toBeVisible();
});

test('manifest.json is served', async ({ page }) => {
	const response = await page.goto('/manifest.json');
	expect(response?.status()).toBe(200);
	const json = await response?.json();
	expect(json.name).toBe('LibreSearch');
});

test('opensearch.xml is served', async ({ page }) => {
	const response = await page.goto('/opensearch.xml');
	expect(response?.status()).toBe(200);
	const text = await response?.text();
	expect(text).toContain('OpenSearchDescription');
});
