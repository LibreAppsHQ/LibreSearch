import AxeBuilder from '@axe-core/playwright';
import { expect, test as base } from '@playwright/test';

type AxeFixture = {
	axeBuilder: () => AxeBuilder;
};

export const test = base.extend<AxeFixture>({
	axeBuilder: async ({ page }, use) => {
		await use(() => new AxeBuilder({ page }));
	}
});

export { expect };
