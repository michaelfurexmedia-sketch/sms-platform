import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [1440, 768, 390]) {
  test(`Phase 2.7 plans and accessible pricing at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/pricing");
    const plans = page.locator(".pricing-plans");
    await expect(plans).toContainText("$19/month");
    await expect(plans).toContainText("$39/month");
    await expect(plans).toContainText("Recommended");
    await expect(plans).toContainText("Up to 10 active phone numbers");
    await expect(
      plans.getByRole("link", { name: "Contact Sales" }),
    ).toHaveAttribute("href", "/contact");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await plans.getByRole("link", { name: "Explore Professional" }).click();
    await expect(page).toHaveURL(/signup\?plan=professional/);
  });
}
