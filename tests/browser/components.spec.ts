import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("foundation link uses the correct accessible role", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Explore the component library" })
    .click();
  await expect(page).toHaveURL(/\/design-system/);
  await expect(
    page.getByRole("heading", { name: "Clarity in every interaction." }),
  ).toBeVisible();
});
test("dialog traps forward/reverse focus, Escape closes and restores opener", async ({
  page,
}) => {
  await page.goto("/design-system");
  const opener = page.getByRole("button", { name: "Open dialog", exact: true });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "A focused conversation" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Close dialog" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "Done", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Close dialog" }),
  ).toBeFocused();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    await expect(dialog.locator(":focus")).toHaveCount(1);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});
test("dialog buttons close without submitting an unrelated form", async ({
  page,
}) => {
  await page.goto("/design-system");
  await page.getByRole("button", { name: "Open dialog", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByText("Enter a workspace name.")).not.toBeVisible();
});
test("form error is associated with input and notification dismisses", async ({
  page,
}) => {
  await page.goto("/design-system");
  await page.getByRole("button", { name: "Save sample" }).click();
  const input = page.getByRole("textbox", { name: "Workspace name" });
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toHaveAccessibleDescription(/Enter a workspace name/);
  await input.fill("Sample studio");
  await page.getByRole("button", { name: "Save sample" }).click();
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByText("Sample saved locally for this view."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Dismiss notification" }).click();
  await expect(
    page.getByText("Sample saved locally for this view."),
  ).not.toBeVisible();
});
test("tabs support arrow keys, Home/End and readable chart data", async ({
  page,
}) => {
  await page.goto("/design-system");
  await page.getByRole("tab", { name: "Contact lists" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Activity chart" })).toBeFocused();
  await expect(
    page.getByRole("img", { name: "Illustrative message activity" }),
  ).toBeVisible();
  await page.getByText("View chart data", { exact: true }).click();
  await expect(
    page.getByRole("table", { name: "Illustrative message activity values" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Activity chart" }).focus();
  await page.keyboard.press("Home");
  await expect(
    page.getByRole("tab", { name: "Contact lists" }),
  ).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "Activity chart" }),
  ).toHaveAttribute("aria-selected", "true");
});
test("pagination and filtering update the synthetic table", async ({
  page,
}) => {
  await page.goto("/design-system");
  await expect(
    page.getByRole("button", { name: "Previous", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "Seasonal release" }),
  ).toBeVisible();
  await page.getByLabel("Filter by status").selectOption("Ready");
  await expect(page.getByText("Page 1 of 1")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("cell", { name: "Studio updates" }),
  ).toBeVisible();
});
for (const width of [1440, 768, 390])
  for (const theme of ["light", "dark"] as const) {
    test(
      "accessibility and layout: " + theme + " at " + width,
      async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.setViewportSize({ width, height: 1000 });
        await page.goto("/design-system");
        if (theme === "dark")
          await page
            .getByRole("button", { name: "Switch to dark theme" })
            .click();
        await expect(page.locator("[data-theme]")).toHaveAttribute(
          "data-theme",
          theme,
        );
        const scan = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(scan.violations).toEqual([]);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        expect(errors).toEqual([]);
        await page.screenshot({
          path: "test-results/design-" + theme + "-" + width + ".jpg",
          type: "jpeg",
          quality: 70,
          fullPage: true,
        });
      },
    );
  }
test("reduced motion, retry state and health endpoint", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/design-system");
  await expect(page.locator(".skeleton").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("Sample retry completed.")).toBeVisible();
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({
    status: "ok",
    service: "web",
    mode: "demo",
  });
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
});
