import { test, expect } from './axe';

const CRITICAL_PAGES = [
	{ path: '/', name: 'home' },
	{ path: '/search?q=privacy', name: 'search results' },
	{ path: '/about', name: 'about' },
	{ path: '/privacy', name: 'privacy' },
	{ path: '/donate', name: 'donate' },
	{ path: '/settings', name: 'settings' }
];

for (const { path, name } of CRITICAL_PAGES) {
	test(`accessibility: ${name} page has no critical violations`, async ({ page, axeBuilder }) => {
		await page.goto(path);
		await page.waitForLoadState('networkidle');

		const results = await axeBuilder()
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();

		const violations = results.violations.filter(
			(v) => v.impact === 'critical' || v.impact === 'serious'
		);

		expect.soft(violations, `${violations.length} accessibility violations on ${name}`).toEqual([]);
	});
}
