import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("tabs support keyboard navigation, chart labels and tabular data", async ({page}) => {
  await page.goto("/design-system/");
  const first = page.getByRole("tab", {name:"Campaigns",exact:true});
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab",{name:"Delivery",exact:true})).toHaveAttribute("aria-selected","true");
  await expect(page.getByRole("img",{name:/Sample delivery outcomes/})).toBeVisible();
  await page.getByText("View chart data",{exact:true}).click();
  await expect(page.getByRole("cell",{name:"214",exact:true})).toBeVisible();
  await page.getByRole("tab",{name:"Delivery",exact:true}).focus();
  await page.keyboard.press("Home");
  await expect(first).toBeFocused();
});
test("dialog names itself, traps focus, closes on Escape and restores focus", async ({page}) => {
  await page.goto("/design-system/");
  const opener=page.getByRole("button",{name:"Open dialog",exact:true});
  await opener.click();
  const dialog=page.getByRole("dialog",{name:"A clear next step"});
  await expect(dialog).toBeVisible();
  for(let i=0;i<8;i++) { await page.keyboard.press("Tab"); await expect(dialog.locator(":focus")).toHaveCount(1); }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});
test("forms expose inline errors and notification dismissal", async ({page}) => {
  await page.goto("/design-system/");
  await page.getByRole("button",{name:"Save example",exact:true}).click();
  const input=page.getByLabel("Campaign name",{exact:true});
  await expect(input).toHaveAttribute("aria-invalid","true");
  await expect(input).toHaveAccessibleDescription(/Enter a campaign name/);
  await input.fill("Customer update");
  await page.getByRole("button",{name:"Save example",exact:true}).click();
  await expect(page.getByText("Example saved. No campaign was created or sent.")).toBeVisible();
  await page.getByRole("button",{name:"Dismiss notification"}).click();
  await expect(page.getByText("Example saved. No campaign was created or sent.")).toHaveCount(0);
});
test("pagination and native dropdown keep table results consistent", async ({page}) => {
  await page.goto("/design-system/");
  await expect(page.getByRole("button",{name:"Previous",exact:true})).toBeDisabled();
  await page.getByRole("button",{name:"Next",exact:true}).click();
  await expect(page.getByRole("cell",{name:"Welcome message",exact:true})).toBeVisible();
  await expect(page.getByRole("button",{name:"Next",exact:true})).toBeDisabled();
  await page.getByLabel("Campaign status").selectOption("Draft");
  await expect(page.getByRole("cell",{name:"Appointment reminder",exact:true})).toBeVisible();
  await expect(page.getByText("Page 1 of 1")).toBeVisible();
});
for(const width of [1440,768,390]) {
  test(`shared components are accessible and fit at ${width}px in both themes`, async({page})=>{
    await page.setViewportSize({width,height:1000});
    await page.goto("/design-system/");
    for(const theme of ["light","dark"]) {
      if(theme==="dark") await page.getByRole("button",{name:"Use dark theme"}).click();
      await expect(page.locator(".design-preview")).toHaveAttribute("data-theme",theme);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
      const result=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
      expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
      await page.screenshot({path:`test-results/design-${theme}-${width}.png`,fullPage:true});
    }
  });
}
test("reduced motion stops skeleton animation and health endpoint is explicit", async({page,request})=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/design-system/");
  expect(await page.locator(".skeleton").evaluate(el=>getComputedStyle(el).animationName)).toBe("none");
  const response=await request.get("/api/health/");
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toMatchObject({status:"ok",mode:"demo"});
  expect(response.headers()["cache-control"]).toBe("no-store");
});
test("existing product routes and demo entry remain usable",async({page})=>{
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("link",{name:"SMS Platform home"}).first()).toBeVisible();
  await page.getByRole("button",{name:/Explore the demo/i}).first().click();
  await expect(page).toHaveURL(/\/app\//);
  for(const path of ["/app/contacts/","/app/campaigns/","/app/inbox/","/admin/","/pricing/","/signup/"]) {
    await page.goto(path); await expect(page.locator("h1").first()).toBeVisible();
  }
  expect(errors).toEqual([]);
});
