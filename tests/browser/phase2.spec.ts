import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("public pages, help search, recovery and demo navigation work", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A small message",
  );
  await page
    .getByRole("button", { name: "Explore demo workspace", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/app\/?$/);
  await page
    .getByRole("button", { name: "Global search", exact: true })
    .click();
  await page
    .getByLabel("Search pages, contacts and campaigns")
    .fill("contacts");
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Contacts", exact: true })
    .click();
  await expect(page).toHaveURL(/contacts/);
  await page.goto("/help");
  await page.getByLabel("Search help articles").fill("credits");
  await expect(
    page.getByText("Understand credits", { exact: true }),
  ).toBeVisible();
  await page.goto("/forgot-password");
  await page.getByLabel("Email", { exact: true }).fill("test@example.com");
  await page.getByRole("button", { name: "Preview recovery email" }).click();
  await expect(page.getByRole("status")).toContainText("No email was sent");
  expect(errors).toEqual([]);
});
for (const width of [1440, 768, 390])
  test(`marketing accessibility and layout ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page
      .locator(".hero-demo")
      .evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    expect(
      (await new AxeBuilder({ page }).analyze()).violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          html: n.html,
          summary: n.failureSummary,
        })),
      })),
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/marketing-${width}.png`,
      fullPage: true,
    });
  });
test("inbox notes, assignment and suppression persist", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore demo workspace", exact: true })
    .first()
    .click();
  await page.goto("/app/inbox");
  await page.locator(".conversation-item").first().click();
  await page.getByText("Contact details & team tools", { exact: true }).click();
  await page
    .getByLabel("Assigned teammate")
    .selectOption("avery@juniper.example");
  await page
    .getByLabel("Internal note", { exact: true })
    .fill("Call back Friday");
  await page
    .getByRole("button", { name: "Add internal note", exact: true })
    .click();
  await expect(
    page.getByText("Call back Friday", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Suppress contact", exact: true })
    .click();
  await page
    .getByLabel("Suppression reason")
    .fill("Requested no further texts");
  await page.getByRole("button", { name: "Confirm suppression" }).click();
  await expect(
    page.getByRole("button", { name: "Send reply (demo)", exact: true }),
  ).toBeDisabled();
});
