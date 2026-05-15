import { test, expect } from "@playwright/test";

async function setupCartAndGoToCheckout(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("trackcart_cart"));
  await page.goto("/products/p001");
  await page.getByRole("button", { name: /Add to Cart/ }).click();
  await page.waitForFunction(() => {
    const raw = localStorage.getItem("trackcart_cart");
    return raw !== null && JSON.parse(raw).length > 0;
  }, { timeout: 5000 });
  await page.goto("/checkout");
  await page.waitForTimeout(500);
}

async function fillCheckoutForm(page: import("@playwright/test").Page) {
  await page.getByLabel("First Name").fill("Connor");
  await page.getByLabel("Last Name").fill("Koch");
  await page.getByLabel("Email").fill("connor@example.com");
  await page.getByLabel("Street Address").fill("123 Main St");
  await page.getByLabel("City").fill("Los Angeles");
  await page.getByLabel("State").fill("CA");
  await page.getByLabel("ZIP Code").fill("90001");
  await page.getByLabel("Card Number").fill("4242 4242 4242 4242");
  await page.getByLabel("Expiry (MM/YY)").fill("12/26");
  await page.getByLabel("CVC").fill("123");
}

test.describe("Checkout Flow", () => {
  test("redirects to cart when cart is empty", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("trackcart_cart"));
    await page.goto("/checkout");
    await expect(page).toHaveURL("/cart");
  });

  test("displays order summary with cart items", async ({ page }) => {
    await setupCartAndGoToCheckout(page);
    await expect(page.getByText("Trail Running Shoes")).toBeVisible();
    await expect(page.getByText(/Trail Running Shoes/)).toBeVisible();
    // Item row price appears in the order summary sidebar
    await expect(page.locator(".font-medium.text-gray-900.shrink-0", { hasText: "$89.99" })).toBeVisible();
  });

  test("shows demo payment disclaimer", async ({ page }) => {
    await setupCartAndGoToCheckout(page);
    await expect(page.getByText(/Demo mode/)).toBeVisible();
  });

  test("fires begin_checkout event on page load", async ({ page }) => {
    await setupCartAndGoToCheckout(page);
    await page.waitForTimeout(500);
    const events = await page.evaluate(() =>
      ((window as any).dataLayer || []).filter((e: any) => e.event === "begin_checkout")
    );
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].ecommerce.currency).toBe("USD");
    expect(events[0].ecommerce.items.length).toBeGreaterThan(0);
  });

  test("shows order confirmation after successful submission", async ({ page }) => {
    await setupCartAndGoToCheckout(page);
    await fillCheckoutForm(page);
    await page.getByRole("button", { name: /Place Order/ }).click();
    await expect(page.getByText("Order Confirmed!")).toBeVisible();
    await expect(page.getByText(/TC-/)).toBeVisible();
  });

  test("fires purchase event with transaction ID and items", async ({ page }) => {
    await setupCartAndGoToCheckout(page);
    await fillCheckoutForm(page);
    await page.getByRole("button", { name: /Place Order/ }).click();
    const events = await page.evaluate(() =>
      ((window as any).dataLayer || []).filter((e: any) => e.event === "purchase")
    );
    expect(events.length).toBeGreaterThan(0);
    const event = events[0];
    expect(event.ecommerce.transaction_id).toMatch(/^TC-/);
    expect(event.ecommerce.currency).toBe("USD");
    expect(event.ecommerce.tax).toBeGreaterThan(0);
    expect(event.ecommerce.items[0].item_name).toBe("Trail Running Shoes");
  });

  test("purchase event includes correct totals", async ({ page }) => {
    await setupCartAndGoToCheckout(page);
    await fillCheckoutForm(page);
    await page.getByRole("button", { name: /Place Order/ }).click();
    await expect(page.getByText("Order Confirmed!")).toBeVisible();
    const events = await page.evaluate(() =>
      ((window as any).dataLayer || []).filter((e: any) => e.event === "purchase")
    );
    expect(events.length).toBeGreaterThan(0);
    const event = events[0];
    // $89.99 + $9.99 shipping (under $100) + 8% tax
    expect(event.ecommerce.value).toBeGreaterThan(89.99);
    expect(event.ecommerce.shipping).toBe(9.99);
  });

  test("cart is cleared after order confirmation", async ({ page }) => {
    await setupCartAndGoToCheckout(page);
    await fillCheckoutForm(page);
    await page.getByRole("button", { name: /Place Order/ }).click();
    await expect(page.getByText("Order Confirmed!")).toBeVisible();
    // Header cart badge should be gone
    await expect(page.locator("header").getByText("1")).not.toBeVisible();
  });

  test("continue shopping returns to product listing", async ({ page }) => {
    await setupCartAndGoToCheckout(page);
    await fillCheckoutForm(page);
    await page.getByRole("button", { name: /Place Order/ }).click();
    await page.getByRole("link", { name: /Continue Shopping/ }).click();
    await expect(page).toHaveURL("/");
  });
});
