"use client";

import { createContext, useContext, useEffect, useReducer } from "react";
import { CartItem, Product } from "@/types";
import { dataLayer } from "@/lib/dataLayer";

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; product: Product; quantity: number }
  | { type: "REMOVE"; productId: string }
  | { type: "UPDATE_QTY"; productId: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find((i) => i.product.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + action.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, { product: action.product, quantity: action.quantity }] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.product.id !== action.productId) };
    case "UPDATE_QTY":
      return {
        items: state.items.map((i) =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "CLEAR":
      return { items: [] };
    case "HYDRATE":
      return { items: action.items };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (product: Product) => void;
  updateQuantity: (product: Product, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("trackcart_cart");
      if (saved) dispatch({ type: "HYDRATE", items: JSON.parse(saved) });
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("trackcart_cart", JSON.stringify(state.items));
  }, [state.items]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  function addToCart(product: Product, quantity = 1) {
    dispatch({ type: "ADD", product, quantity });
    dataLayer.addToCart(product, quantity);
  }

  function removeFromCart(product: Product) {
    const item = state.items.find((i) => i.product.id === product.id);
    if (item) dataLayer.removeFromCart(product, item.quantity);
    dispatch({ type: "REMOVE", productId: product.id });
  }

  function updateQuantity(product: Product, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(product);
      return;
    }
    const item = state.items.find((i) => i.product.id === product.id);
    if (item) {
      const diff = quantity - item.quantity;
      if (diff > 0) dataLayer.addToCart(product, diff);
      else dataLayer.removeFromCart(product, Math.abs(diff));
    }
    dispatch({ type: "UPDATE_QTY", productId: product.id, quantity });
  }

  function clearCart() {
    dispatch({ type: "CLEAR" });
  }

  return (
    <CartContext.Provider value={{ items: state.items, itemCount, subtotal, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
