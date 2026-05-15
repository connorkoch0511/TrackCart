import { test, expect } from "@playwright/test";

test.describe("Analytics Dashboard", () => {
  test("loads the analytics page", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.getByRole("heading", { name: "Analytics Dashboard" })).toBeVisible();
  });

  test("shows demo data badge when GA4 is not configured", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.getByText("Active Users", { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Demo Data")).toBeVisible();
  });

  test("shows GA4 API info banner in demo mode", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.getByText(/Demo mode/)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/GA4_PROPERTY_ID/)).toBeVisible();
  });

  test("renders all six metric cards after loading", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.getByText("Active Users", { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Sessions", { exact: true })).toBeVisible();
    await expect(page.getByText("Page Views", { exact: true })).toBeVisible();
    await expect(page.getByText("Total Events", { exact: true })).toBeVisible();
    await expect(page.getByText("Add to Cart", { exact: true })).toBeVisible();
    await expect(page.getByText("Purchases", { exact: true })).toBeVisible();
  });

  test("renders top events chart", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.getByText("Top Events (30 days)")).toBeVisible({ timeout: 10000 });
  });

  test("renders daily users chart", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.getByText("Daily Active Users (30 days)")).toBeVisible({ timeout: 10000 });
  });

  test("renders e-commerce funnel", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.getByText("E-commerce Funnel")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("div.font-mono").filter({ hasText: /^begin_checkout$/ })).toBeVisible();
  });

  test("fires page_view event on load", async ({ page }) => {
    await page.goto("/analytics");
    await page.waitForTimeout(500);
    const events = await page.evaluate(() =>
      ((window as any).dataLayer || []).filter((e: any) => e.event === "page_view")
    );
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].page_title).toBe("Analytics Dashboard | TrackCart");
  });
});
