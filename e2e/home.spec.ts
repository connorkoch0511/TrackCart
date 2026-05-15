import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("trackcart_cart"));
});

test.describe("Home Page", () => {
  test("displays the product listing with all products", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Gear Up" })).toBeVisible();
    await expect(page.getByText("Trail Running Shoes")).toBeVisible();
    await expect(page.getByText("GPS Sports Watch")).toBeVisible();
    await expect(page.getByText("Yoga Mat Pro")).toBeVisible();
  });

  test("category filter shows only matching products", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Electronics" }).click();
    await expect(page.getByText("GPS Sports Watch")).toBeVisible();
    await expect(page.getByText("Wireless Sport Earbuds")).toBeVisible();
    await expect(page.getByText("Trail Running Shoes")).not.toBeVisible();
    await expect(page.getByText("Yoga Mat Pro")).not.toBeVisible();
  });

  test("All filter restores full product list", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Electronics" }).click();
    await page.getByRole("button", { name: "All" }).click();
    await expect(page.getByText("Trail Running Shoes")).toBeVisible();
    await expect(page.getByText("GPS Sports Watch")).toBeVisible();
  });

  test("fires page_view event on load", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(500);
    const events = await page.evaluate(() =>
      ((window as any).dataLayer || []).filter((e: any) => e.event === "page_view")
    );
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].page_title).toBe("Product Listing | TrackCart");
  });

  test("fires view_item_list event on load", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(500);
    const events = await page.evaluate(() =>
      ((window as any).dataLayer || []).filter((e: any) => e.event === "view_item_list")
    );
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].ecommerce.items.length).toBeGreaterThan(0);
  });

  test("fires view_item_list when category filter changes", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Electronics" }).click();
    await page.waitForTimeout(300);
    const events = await page.evaluate(() =>
      ((window as any).dataLayer || []).filter((e: any) => e.event === "view_item_list")
    );
    expect(events.length).toBeGreaterThanOrEqual(2);
  });

  test("header navigation links are present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Products", exact: true })).toBeVisible();
    await expect(page.locator("header a[href='/analytics']")).toBeVisible();
    await expect(page.locator("header a[href='/cart']")).toBeVisible();
  });
});
