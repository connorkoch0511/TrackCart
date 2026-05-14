import { CartItem, GA4Item, Product } from "@/types";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function push(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // Clear previous ecommerce object to prevent data bleeding between events
  if (payload.ecommerce) {
    window.dataLayer.push({ ecommerce: null });
  }
  window.dataLayer.push(payload);
}

function toGA4Item(product: Product, quantity = 1, index?: number): GA4Item {
  return {
    item_id: product.id,
    item_name: product.name,
    item_brand: product.brand,
    item_category: product.category,
    price: product.price,
    quantity,
    ...(index !== undefined && { index }),
  };
}

export const dataLayer = {
  pageView(title: string, path: string) {
    push({
      event: "page_view",
      page_title: title,
      page_location: typeof window !== "undefined" ? window.location.href : "",
      page_path: path,
    });
  },

  viewItemList(products: Product[], listName = "Product Listing") {
    push({
      event: "view_item_list",
      ecommerce: {
        item_list_id: listName.toLowerCase().replace(/\s+/g, "_"),
        item_list_name: listName,
        items: products.map((p, i) => toGA4Item(p, 1, i)),
      },
    });
  },

  viewItem(product: Product) {
    push({
      event: "view_item",
      ecommerce: {
        currency: "USD",
        value: product.price,
        items: [toGA4Item(product)],
      },
    });
  },

  addToCart(product: Product, quantity: number) {
    push({
      event: "add_to_cart",
      ecommerce: {
        currency: "USD",
        value: product.price * quantity,
        items: [toGA4Item(product, quantity)],
      },
    });
  },

  removeFromCart(product: Product, quantity: number) {
    push({
      event: "remove_from_cart",
      ecommerce: {
        currency: "USD",
        value: product.price * quantity,
        items: [toGA4Item(product, quantity)],
      },
    });
  },

  beginCheckout(items: CartItem[], total: number) {
    push({
      event: "begin_checkout",
      ecommerce: {
        currency: "USD",
        value: total,
        items: items.map((ci) => toGA4Item(ci.product, ci.quantity)),
      },
    });
  },

  purchase(transactionId: string, items: CartItem[], subtotal: number) {
    const shipping = subtotal >= 100 ? 0 : 9.99;
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const total = parseFloat((subtotal + shipping + tax).toFixed(2));
    push({
      event: "purchase",
      ecommerce: {
        transaction_id: transactionId,
        currency: "USD",
        value: total,
        tax,
        shipping,
        items: items.map((ci) => toGA4Item(ci.product, ci.quantity)),
      },
    });
  },
};
