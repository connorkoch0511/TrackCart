import { test } from "@playwright/test";
import path from "path";

const SCREENSHOTS_DIR = path.join(process.cwd(), "docs", "screenshots");

test.use({ baseURL: "https://trackcart.vercel.app" });

test("capture home page", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "home.png"), fullPage: false });
});

test("capture product detail page", async ({ page }) => {
  await page.goto("/products/p001");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "product-detail.png"), fullPage: false });
});

test("capture cart page", async ({ page }) => {
  await page.goto("/products/p001");
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /Add to Cart/ }).click();
  await page.waitForTimeout(500);
  await page.goto("/products/p002");
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /Add to Cart/ }).click();
  await page.waitForTimeout(500);
  await page.goto("/cart");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "cart.png"), fullPage: false });
});

test("capture checkout page", async ({ page }) => {
  await page.goto("/products/p001");
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /Add to Cart/ }).click();
  await page.waitForTimeout(500);
  await page.goto("/checkout");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "checkout.png"), fullPage: false });
});

test("capture order confirmation", async ({ page }) => {
  await page.goto("/products/p001");
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /Add to Cart/ }).click();
  await page.waitForTimeout(500);
  await page.goto("/cart");
  await page.waitForTimeout(1000);
  await page.getByRole("link", { name: /Checkout/ }).click();
  await page.waitForTimeout(1500);
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
  await page.getByRole("button", { name: /Place Order/ }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "order-confirmation.png"), fullPage: false });
});

test("capture analytics dashboard", async ({ page }) => {
  await page.goto("/analytics");
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "analytics.png"), fullPage: false });
});

test("capture datalayer inspector open", async ({ page }) => {
  await page.goto("/products/p001");
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /Add to Cart/ }).click();
  await page.waitForTimeout(300);
  await page.locator("button", { hasText: "dataLayer" }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "datalayer-inspector.png"), fullPage: false });
});
