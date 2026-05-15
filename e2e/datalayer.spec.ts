import { test, expect } from "@playwright/test";

/**
 * These tests verify the full dataLayer contract — event names, ecommerce
 * object structure, and required fields — matching the GA4 Enhanced E-commerce spec.
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("trackcart_cart"));
});

test.describe("dataLayer — GA4 Enhanced E-commerce Contract", () => {
  test("dataLayer is initialized on page load", async ({ page }) => {
    await page.goto("/");
    // Wait for the page_view event which initializes window.dataLayer
    await page.waitForFunction(() => Array.isArray((window as any).dataLayer) && (window as any).dataLayer.length > 0, { timeout: 5000 });
    const isArray = await page.evaluate(() => Array.isArray((window as any).dataLayer));
    expect(isArray).toBe(true);
  });

  test("page_view event has required fields", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);
    const event = await page.evaluate(() =>
      ((window as any).dataLayer || []).find((e: any) => e.event === "page_view")
    );
    expect(event).toBeTruthy();
    expect(event.page_title).toBeTruthy();
    expect(event.page_location).toBeTruthy();
    expect(event.page_path).toBeTruthy();
  });

  test("view_item_list event has valid ecommerce schema", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);
    const event = await page.evaluate(() =>
      ((window as any).dataLayer || []).find((e: any) => e.event === "view_item_list")
    );
    expect(event).toBeTruthy();
    expect(event.ecommerce.item_list_id).toBeTruthy();
    expect(event.ecommerce.item_list_name).toBeTruthy();
    expect(Array.isArray(event.ecommerce.items)).toBe(true);
    const item = event.ecommerce.items[0];
    expect(item.item_id).toBeTruthy();
    expect(item.item_name).toBeTruthy();
    expect(item.item_brand).toBeTruthy();
    expect(item.item_category).toBeTruthy();
    expect(typeof item.price).toBe("number");
    expect(typeof item.index).toBe("number");
  });

  test("view_item event has valid ecommerce schema", async ({ page }) => {
    await page.goto("/products/p002");
    await page.waitForTimeout(300);
    const event = await page.evaluate(() =>
      ((window as any).dataLayer || []).find((e: any) => e.event === "view_item")
    );
    expect(event).toBeTruthy();
    expect(event.ecommerce.currency).toBe("USD");
    expect(typeof event.ecommerce.value).toBe("number");
    const item = event.ecommerce.items[0];
    expect(item.item_id).toBe("p002");
    expect(item.item_name).toBe("GPS Sports Watch");
    expect(item.price).toBe(249.99);
  });

  test("ecommerce null push precedes every ecommerce event", async ({ page }) => {
    await page.goto("/products/p001");
    await page.waitForTimeout(300);
    const layer = await page.evaluate(() => (window as any).dataLayer || []);
    const viewItemIdx = layer.findIndex((e: any) => e.event === "view_item");
    expect(viewItemIdx).toBeGreaterThan(0);
    // The entry before the event should clear ecommerce
    const preceding = layer[viewItemIdx - 1];
    expect(preceding.ecommerce).toBeNull();
  });

  test("add_to_cart event has valid ecommerce schema", async ({ page }) => {
    await page.goto("/products/p003");
    await page.getByRole("button", { name: /Add to Cart/ }).click();
    const event = await page.evaluate(() =>
      ((window as any).dataLayer || []).find((e: any) => e.event === "add_to_cart")
    );
    expect(event).toBeTruthy();
    expect(event.ecommerce.currency).toBe("USD");
    expect(event.ecommerce.value).toBe(45.0);
    expect(event.ecommerce.items[0].quantity).toBe(1);
  });

  test("begin_checkout event includes all cart items", async ({ page }) => {
    await page.goto("/products/p001");
    await page.getByRole("button", { name: /Add to Cart/ }).click();
    await page.waitForTimeout(200);
    await page.goto("/products/p003");
    await page.getByRole("button", { name: /Add to Cart/ }).click();
    await page.waitForTimeout(200);
    await page.goto("/checkout");
    await page.waitForTimeout(500);
    const event = await page.evaluate(() =>
      ((window as any).dataLayer || []).find((e: any) => e.event === "begin_checkout")
    );
    expect(event).toBeTruthy();
    expect(event.ecommerce.items.length).toBe(2);
    expect(event.ecommerce.currency).toBe("USD");
  });

  test("purchase event has transaction_id, tax, shipping, and items", async ({ page }) => {
    await page.goto("/products/p002"); // $249.99 — qualifies for free shipping
    await page.getByRole("button", { name: /Add to Cart/ }).click();
    await page.waitForTimeout(200);
    await page.goto("/checkout");

    await page.getByLabel("First Name").fill("Test");
    await page.getByLabel("Last Name").fill("User");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Street Address").fill("1 Test St");
    await page.getByLabel("City").fill("Testville");
    await page.getByLabel("State").fill("CA");
    await page.getByLabel("ZIP Code").fill("90000");
    await page.getByLabel("Card Number").fill("4242 4242 4242 4242");
    await page.getByLabel("Expiry (MM/YY)").fill("12/26");
    await page.getByLabel("CVC").fill("123");
    await page.getByRole("button", { name: /Place Order/ }).click();

    const event = await page.evaluate(() =>
      ((window as any).dataLayer || []).find((e: any) => e.event === "purchase")
    );
    expect(event).toBeTruthy();
    expect(event.ecommerce.transaction_id).toMatch(/^TC-/);
    expect(event.ecommerce.currency).toBe("USD");
    expect(event.ecommerce.shipping).toBe(0); // free shipping over $100
    expect(event.ecommerce.tax).toBeCloseTo(249.99 * 0.08, 1);
    expect(event.ecommerce.items[0].item_id).toBe("p002");
  });
});
