import { test, expect } from "@playwright/test";

async function clearCart(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("trackcart_cart"));
}

async function addProductToCart(page: import("@playwright/test").Page, productId = "p001") {
  await page.goto(`/products/${productId}`);
  await page.getByRole("button", { name: /Add to Cart/ }).click();
  // Wait until localStorage reflects the added item
  await page.waitForFunction(() => {
    const raw = localStorage.getItem("trackcart_cart");
    return raw !== null && JSON.parse(raw).length > 0;
  }, { timeout: 5000 });
}

test.describe("Cart Page", () => {
  test("shows empty state when cart has no items", async ({ page }) => {
    await clearCart(page);
    await page.goto("/cart");
    await expect(page.getByText("Your cart is empty")).toBeVisible();
    await expect(page.getByRole("link", { name: "Shop Now" })).toBeVisible();
  });

  test("empty cart Shop Now link goes to product listing", async ({ page }) => {
    await clearCart(page);
    await page.goto("/cart");
    await page.getByRole("link", { name: "Shop Now" }).click();
    await expect(page).toHaveURL("/");
  });

  test("shows added item in cart", async ({ page }) => {
    await clearCart(page);
    await addProductToCart(page, "p001");
    await page.goto("/cart");
    await expect(page.getByText("Trail Running Shoes")).toBeVisible();
    await expect(page.locator(".font-bold.text-gray-900", { hasText: "$89.99" }).first()).toBeVisible();
  });

  test("shows correct subtotal for single item", async ({ page }) => {
    await clearCart(page);
    await addProductToCart(page, "p003"); // Yoga Mat $45.00
    await page.goto("/cart");
    await expect(page.getByText("Yoga Mat Pro")).toBeVisible();
    // Subtotal row in order summary
    await expect(page.locator("text=Subtotal").locator("..").getByText("$45.00")).toBeVisible();
  });

  test("shows free shipping message when eligible", async ({ page }) => {
    await clearCart(page);
    await addProductToCart(page, "p002"); // GPS Watch $249.99 > $100
    await page.goto("/cart");
    await expect(page.getByText("Free")).toBeVisible();
  });

  test("shows shipping upsell when below threshold", async ({ page }) => {
    await clearCart(page);
    await addProductToCart(page, "p003"); // Yoga Mat $45.00 < $100
    await page.goto("/cart");
    await expect(page.getByText(/Add .* more for free shipping/)).toBeVisible();
  });

  test("increment quantity updates price", async ({ page }) => {
    await clearCart(page);
    await addProductToCart(page, "p003"); // $45.00
    await page.goto("/cart");
    await expect(page.getByText("Yoga Mat Pro")).toBeVisible();
    await page.locator("button", { hasText: "+" }).click();
    // Subtotal in order summary should update to $90.00
    await expect(page.locator("text=Subtotal").locator("..").getByText("$90.00")).toBeVisible();
  });

  test("removes item when quantity reaches zero", async ({ page }) => {
    await clearCart(page);
    await addProductToCart(page, "p003");
    await page.goto("/cart");
    await expect(page.getByText("Yoga Mat Pro")).toBeVisible();
    await page.locator("button", { hasText: "−" }).click();
    await expect(page.getByText("Your cart is empty")).toBeVisible();
  });

  test("trash icon removes item and fires remove_from_cart event", async ({ page }) => {
    await clearCart(page);
    await addProductToCart(page, "p001");
    await page.goto("/cart");
    await expect(page.getByText("Trail Running Shoes")).toBeVisible();
    await page.locator("button.text-gray-400").click();
    await expect(page.getByText("Your cart is empty")).toBeVisible();
    const events = await page.evaluate(() =>
      ((window as any).dataLayer || []).filter((e: any) => e.event === "remove_from_cart")
    );
    expect(events.length).toBeGreaterThan(0);
  });

  test("checkout button navigates to checkout", async ({ page }) => {
    await clearCart(page);
    await addProductToCart(page, "p001");
    await page.goto("/cart");
    await page.getByRole("link", { name: /Checkout/ }).click();
    await expect(page).toHaveURL("/checkout");
  });
});
