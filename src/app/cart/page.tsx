"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { dataLayer } from "@/lib/dataLayer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { items, subtotal, removeFromCart, updateQuantity } = useCart();

  useEffect(() => {
    dataLayer.pageView("Cart | TrackCart", "/cart");
  }, []);

  const shipping = subtotal >= 100 ? 0 : subtotal > 0 ? 9.99 : 0;
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const total = parseFloat((subtotal + shipping + tax).toFixed(2));

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-200 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Your cart is empty</h2>
        <p className="mt-2 text-gray-400 text-sm">Add some products to get started</p>
        <Link href="/" className="mt-6">
          <Button className="bg-emerald-600 hover:bg-emerald-700">Shop Now</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-4 rounded-xl bg-white p-4 shadow-sm">
              <Link href={`/products/${product.id}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <Image src={product.image} alt={product.name} fill className="object-cover" sizes="96px" />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-gray-400 uppercase">{product.brand}</div>
                    <Link href={`/products/${product.id}`} className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                      {product.name}
                    </Link>
                  </div>
                  <button
                    onClick={() => removeFromCart(product)}
                    className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-lg border bg-gray-50">
                    <button
                      onClick={() => updateQuantity(product, quantity - 1)}
                      className="px-2.5 py-1 text-gray-600 hover:text-gray-900"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product, quantity + 1)}
                      className="px-2.5 py-1 text-gray-600 hover:text-gray-900"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-gray-900">${(product.price * quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm h-fit sticky top-20">
          <h2 className="font-semibold text-gray-900 text-lg">Order Summary</h2>
          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          </div>

          {subtotal > 0 && subtotal < 100 && (
            <p className="mt-3 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
              Add ${(100 - subtotal).toFixed(2)} more for free shipping
            </p>
          )}

          <Separator className="my-4" />
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <Link href="/checkout" className="mt-5 block">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 gap-2">
              Checkout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
