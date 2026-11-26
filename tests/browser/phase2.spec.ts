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

import { publicSlugs } from "../../src/frontend/content";
import { customerRoutes, adminRoutes } from "../../src/frontend/routes";
import { readFileSync } from "node:fs";
async function enterDemo(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore demo workspace", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/app\/?$/);
}
test("every public, customer and administrator route renders without runtime failures", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await enterDemo(page);
  for (const route of [
    ...publicSlugs.map((p) => "/" + p),
    ...customerRoutes.map((p) => "/app/" + p),
    ...adminRoutes.map((p) => "/admin/" + p),
  ]) {
    await page.goto(route);
    await expect(
      page.getByRole("heading", { level: 1 }).first(),
      route,
    ).toBeVisible();
    await expect(page.getByText("404", { exact: true })).toHaveCount(0);
  }
  expect(errors).toEqual([]);
  const response = await page.goto("/app/not-a-module");
  expect(response?.status()).toBe(404);
});
for (const theme of ["light", "dark"])
  for (const width of [1440, 768, 390])
    test(`workspace accessibility ${theme} ${width}`, async ({ page }) => {
      test.setTimeout(90000);
      await page.setViewportSize({ width, height: 1000 });
      await enterDemo(page);
      if (theme === "dark")
        await page.getByRole("button", { name: "Use dark theme" }).click();
      const findings: unknown[] = [];
      for (const route of [
        "/app",
        "/app/inbox",
        "/app/contacts",
        "/app/automations",
        "/admin/overview",
        "/admin/roles",
      ]) {
        await page.goto(route);
        await expect(
          page.getByRole("heading", { level: 1 }).first(),
        ).toBeVisible();
        const violations = (
          await new AxeBuilder({ page }).analyze()
        ).violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            html: n.html,
            summary: n.failureSummary,
          })),
        }));
        if (violations.length) findings.push({ route, violations });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          route,
        ).toBe(true);
        if (route === "/app" || route === "/admin/overview")
          await page.screenshot({
            path: `test-results/${route === "/app" ? "dashboard" : "admin"}-${theme}-${width}.png`,
            fullPage: true,
          });
      }
      expect(findings).toEqual([]);
    });
test("XLSX and CSV mapping preserve suppression categories and import history", async ({
  page,
}) => {
  await enterDemo(page);
  await page.goto("/app/contacts");
  await page
    .getByRole("button", { name: "Import contacts", exact: true })
    .click();
  await page.getByLabel("CSV or XLSX file").setInputFiles({
    name: "synthetic.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from(
      readFileSync("tests/fixtures/contacts.xlsx.base64", "utf8"),
      "base64",
    ),
  });
  await expect(
    page.getByRole("heading", { name: "Match your columns" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Preview import", exact: true })
    .click();
  await expect(
    page.getByText("suppressed", { exact: false }).last(),
  ).toBeVisible();
  await page.getByRole("button", { name: /Import \d+ rows/ }).click();
  await expect(page.getByText(/Imported 3 new rows/)).toBeVisible();
  await page.getByText(/Import history/).click();
  await expect(
    page.getByRole("cell", { name: "synthetic.xlsx", exact: true }),
  ).toBeVisible();
});
test("automation editor validates and records a simulated execution", async ({
  page,
}) => {
  await enterDemo(page);
  await page.goto("/app/automations");
  await page
    .getByRole("button", { name: "Create workflow", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Activate workflow (demo)", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Add a message");
  await page
    .getByRole("button", { name: "Add condition", exact: true })
    .click();
  await page.getByRole("button", { name: "Add delay", exact: true }).click();
  await page.getByRole("button", { name: "Add message", exact: true }).click();
  await page
    .getByLabel("Message action", { exact: true })
    .fill("Thanks for joining. Reply STOP to opt out.");
  await page
    .getByRole("button", { name: "Activate workflow (demo)", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Deactivate workflow" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Simulate execution" }).click();
  await expect(
    page.getByText("Simulated path completed. No message sent."),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /New follow-up/ }).click();
  await expect(
    page.getByText("Simulated path completed. No message sent."),
  ).toBeVisible();
});
test("admin credit adjustment requires reason and updates audit and customer balance", async ({
  page,
}) => {
  await enterDemo(page);
  await page.goto("/admin/wallets");
  await page
    .getByRole("button", { name: "Adjust credits", exact: true })
    .last()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Credit adjustment (+ or −)", { exact: true })
    .fill("100");
  await dialog.getByLabel("Mandatory reason").fill("Synthetic goodwill credit");
  await dialog.getByRole("button", { name: "Confirm demo action" }).click();
  await expect(
    page.getByRole("cell", { name: "3100", exact: true }),
  ).toBeVisible();
  await page.goto("/admin/audit");
  await expect(
    page.getByRole("cell", { name: "Synthetic goodwill credit", exact: true }),
  ).toBeVisible();
});
test("mobile menu, theme persistence, keyboard search and reduced motion remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enterDemo(page);
  await page.getByRole("button", { name: "Use dark theme" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Use light theme" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Global search" }).click();
  const dialog = page.getByRole("dialog");
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.locator(":focus")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Global search" }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Workspace navigation" })
    .getByRole("link", { name: "Automations", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Automations", exact: true }),
  ).toBeVisible();
});

test("campaign scheduling, pause, resume, cancel and duplication are connected", async ({
  page,
}) => {
  await enterDemo(page);
  await page.goto("/app/campaigns");
  await page
    .getByRole("button", { name: "Create campaign", exact: true })
    .first()
    .click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Campaign name").fill("Seasonal reminder");
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  await dialog
    .getByLabel("Message", { exact: true })
    .fill(
      "Hi {{first_name}}, an appointment is available. Reply STOP to opt out.",
    );
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  await dialog.getByLabel("When to send").selectOption("Future");
  await dialog
    .getByLabel("Schedule time zone")
    .selectOption("America/New_York");
  const future =
    new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10) + "T12:00";
  await dialog.getByLabel("First send date and time").fill(future);
  await expect(
    dialog.getByRole("button", { name: "Confirm schedule" }),
  ).toBeDisabled();
  await dialog
    .getByLabel(
      "I reviewed consent, excluded recipients, sender and estimated usage.",
    )
    .check();
  await dialog.getByRole("button", { name: "Confirm schedule" }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Pause schedule" }).click();
  await dialog.getByRole("button", { name: "Resume schedule" }).click();
  await dialog
    .getByRole("button", { name: "Cancel campaign", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Confirm cancellation" }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("cell", { name: "Canceled", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Duplicate", exact: true }).click();
  await expect(page.getByLabel("Campaign name")).toHaveValue(
    "Seasonal reminder copy",
  );
});
test("number discovery, simulated checkout, invoice and release require explicit actions", async ({
  page,
}) => {
  await enterDemo(page);
  await page.goto("/app/numbers");
  await page.getByRole("button", { name: "Get another number" }).click();
  await page
    .getByRole("combobox", { name: "Country", exact: true })
    .selectOption("Canada");
  await page.getByLabel("Area code", { exact: true }).fill("416");
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Continue to checkout" }).click();
  await page.getByRole("button", { name: "Simulate failed payment" }).click();
  await expect(page.getByText(/Demo payment declined/)).toBeVisible();
  await page.getByRole("button", { name: "Confirm simulated payment" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download invoice" }).click();
  expect((await download).suggestedFilename()).toBe("invoice-demo.csv");
  await page.keyboard.press("Escape");
  await page
    .getByLabel("Manage assigned number")
    .selectOption("+1 (416) 555-0113");
  await page
    .getByRole("button", { name: "Release number", exact: true })
    .click();
  await page.getByLabel("Release reason").fill("Synthetic review completed");
  await page.getByRole("button", { name: "Confirm release" }).click();
  await expect(page.getByRole("status")).toContainText("Number released");
});
test("frontend resource sample records transfer size and load timing", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.getByRole("heading", { level: 1 }).waitFor();
  const sample = await page.evaluate(() => {
    const n = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    const r = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];
    return {
      domContentLoadedMs: Math.round(n.domContentLoadedEventEnd),
      jsTransferredBytes: r
        .filter((x) => x.name.includes(".js"))
        .reduce((s, x) => s + x.transferSize, 0),
      requests: r.length,
    };
  });
  await testInfo.attach("resource-sample.json", {
    body: JSON.stringify(sample, null, 2),
    contentType: "application/json",
  });
  expect(sample.jsTransferredBytes).toBeLessThan(1500000);
});
