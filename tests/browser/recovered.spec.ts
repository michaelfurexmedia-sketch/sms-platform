import { test, expect } from "@playwright/test";

test("recovered public, customer and admin previews retain their routes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/preview");
  await expect(
    page.getByText("Interactive prototype", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Explore the demo", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Explore demo workspace", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/preview\/app\/?$/);
  for (const path of [
    "app/contacts",
    "app/campaigns",
    "app/inbox",
    "app/billing",
    "admin",
    "pricing",
    "signup",
  ]) {
    await page.goto("/preview/" + path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByText("Interactive prototype", { exact: true }),
    ).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("recovered import dialog reuses the fixed shared focus behavior", async ({
  page,
}) => {
  await page.goto("/preview");
  await page
    .getByRole("button", { name: "Explore demo workspace", exact: true })
    .first()
    .click();
  await page.goto("/preview/app/contacts");
  const opener = page.getByRole("button", {
    name: "Import contacts",
    exact: true,
  });
  await opener.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press(i % 2 ? "Tab" : "Shift+Tab");
    await expect(dialog.locator(":focus")).toHaveCount(1);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test("recovered mobile navigation and layout remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/preview");
  await page
    .getByRole("button", { name: "Explore demo workspace", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  const navigation = page.getByRole("navigation", {
    name: "Workspace navigation",
  });
  await expect(navigation).toBeVisible();
  await navigation.getByRole("link", { name: "Contacts", exact: true }).click();
  await expect(page).toHaveURL(/\/preview\/app\/contacts\/?$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Contacts" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/recovered-mobile.png",
    fullPage: true,
  });
});
