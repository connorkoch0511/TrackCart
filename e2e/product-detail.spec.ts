import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("trackcart_cart"));
});

test.describe("Product Detail Page", () => {
  test("displays full product information", async ({ page }) => {
    await page.goto("/products/p001");
    await expect(page.getByRole("heading", { name: "Trail Running Shoes" })).toBeVisible();
    await expect(page.getByText("TrailBlaze")).toBeVisible();
    await expect(page.getByText("$89.99", { exact: true })).toBeVisible();
    await expect(page.getByText("Footwear")).toBeVisible();
    await expect(page.getByText(/Built for the toughest terrain/)).toBeVisible();
  });

  test("shows sale badge when item has original price", async ({ page }) => {
    await page.goto("/products/p001");
    await expect(page.getByText(/-\d+% OFF/)).toBeVisible();
  });

  test("quantity selector increments and decrements", async ({ page }) => {
    await page.goto("/products/p001");
    const addBtn = page.locator("button", { hasText: "+" }).first();
    const subtractBtn = page.locator("button", { hasText: "−" }).first();
    await addBtn.click();
    await addBtn.click();
    await expect(page.getByText("3").nth(1)).toBeVisible();
    await subtractBtn.click();
    await expect(page.getByText("2").nth(1)).toBeVisible();
  });

  test("add to cart shows toast notification", async ({ page }) => {
    await page.goto("/products/p001");
    await page.getByRole("button", { name: /Add to Cart/ }).click();
    await expect(page.getByText(/added to cart/i)).toBeVisible({ timeout: 8000 });
  });

  test("add to cart updates cart badge in header", async ({ page }) => {
    await page.goto("/products/p001");
    await page.getByRole("button", { name: /Add to Cart/ }).click();
    await expect(page.locator("header").getByText("1")).toBeVisible();
  });

  test("fires view_item event with correct product data", async ({ page }) => {
    await page.goto("/products/p001");
    await page.waitForTimeout(500);
    const events = await page.evaluate(() =>
      ((window as any).dataLayer || []).filter((e: any) => e.event === "view_item")
    );
    expect(events.length).toBeGreaterThan(0);
    const item = events[0].ecommerce.items[0];
    expect(item.item_id).toBe("p001");
    expect(item.item_name).toBe("Trail Running Shoes");
    expect(item.item_brand).toBe("TrailBlaze");
    expect(item.item_category).toBe("Footwear");
    expect(item.price).toBe(89.99);
  });

  test("fires add_to_cart event with correct ecommerce data", async ({ page }) => {
    await page.goto("/products/p001");
    await page.getByRole("button", { name: /Add to Cart/ }).click();
    const events = await page.evaluate(() =>
      ((window as any).dataLayer || []).filter((e: any) => e.event === "add_to_cart")
    );
    expect(events.length).toBeGreaterThan(0);
    const event = events[0];
    expect(event.ecommerce.currency).toBe("USD");
    expect(event.ecommerce.items[0].item_name).toBe("Trail Running Shoes");
  });

  test("back link navigates to product listing", async ({ page }) => {
    await page.goto("/products/p001");
    await page.getByRole("link", { name: /Back to products/ }).click();
    await expect(page).toHaveURL("/");
  });

  test("out of stock product shows disabled button", async ({ page }) => {
    await page.goto("/products/p008");
    await expect(page.getByRole("button", { name: "Out of Stock" })).toBeDisabled();
  });

  test("returns 404 for unknown product id", async ({ page }) => {
    await page.goto("/products/nonexistent");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });
});
