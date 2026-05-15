"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { dataLayer } from "@/lib/dataLayer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

const EMPTY_FORM: FormData = {
  firstName: "", lastName: "", email: "",
  address: "", city: "", state: "", zip: "",
  cardNumber: "", cardExpiry: "", cardCvc: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, isHydrated } = useCart();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [hasTrackedBeginCheckout, setHasTrackedBeginCheckout] = useState(false);

  const shipping = subtotal >= 100 ? 0 : 9.99;
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const total = parseFloat((subtotal + shipping + tax).toFixed(2));

  useEffect(() => {
    dataLayer.pageView("Checkout | TrackCart", "/checkout");
    if (items.length > 0 && !hasTrackedBeginCheckout) {
      dataLayer.beginCheckout(items, subtotal);
      setHasTrackedBeginCheckout(true);
    }
  }, [items, subtotal, hasTrackedBeginCheckout]);

  useEffect(() => {
    if (isHydrated && items.length === 0 && !orderComplete) router.push("/cart");
  }, [isHydrated, items, orderComplete, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newOrderId = `TC-${Date.now().toString(36).toUpperCase()}`;
    setOrderId(newOrderId);
    dataLayer.purchase(newOrderId, items, subtotal);
    clearCart();
    setOrderComplete(true);
  }

  if (orderComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-emerald-100 p-5 mb-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
        <p className="mt-2 text-gray-500">Thanks for your order. A <code className="text-emerald-600 font-mono">purchase</code> event was sent to the dataLayer.</p>
        <div className="mt-4 rounded-lg bg-gray-100 px-5 py-3">
          <div className="text-xs text-gray-400 uppercase tracking-wider">Order ID</div>
          <div className="font-mono font-bold text-lg text-gray-900">{orderId}</div>
          <div className="text-sm text-gray-500 mt-1">Total: ${total.toFixed(2)}</div>
        </div>
        <Link href="/" className="mt-8">
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Package className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
              <Field label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
              <div className="sm:col-span-2">
                <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Shipping Address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Street Address" name="address" value={form.address} onChange={handleChange} required />
              </div>
              <Field label="City" name="city" value={form.city} onChange={handleChange} required />
              <Field label="State" name="state" value={form.state} onChange={handleChange} required />
              <Field label="ZIP Code" name="zip" value={form.zip} onChange={handleChange} required />
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Payment</h2>
            <div className="mb-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
              Demo mode — no real payment is processed
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Card Number" name="cardNumber" value={form.cardNumber} onChange={handleChange} placeholder="4242 4242 4242 4242" required />
              </div>
              <Field label="Expiry (MM/YY)" name="cardExpiry" value={form.cardExpiry} onChange={handleChange} placeholder="12/26" required />
              <Field label="CVC" name="cardCvc" value={form.cardCvc} onChange={handleChange} placeholder="123" required />
            </div>
          </section>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base">
            Place Order — ${total.toFixed(2)}
          </Button>
        </form>

        <div className="rounded-xl bg-white p-6 shadow-sm h-fit sticky top-20">
          <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate max-w-[160px]">
                  {product.name} <span className="text-gray-400">×{quantity}</span>
                </span>
                <span className="font-medium text-gray-900 shrink-0">${(product.price * quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="space-y-1.5 text-sm text-gray-600">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, name, value, onChange, type = "text", placeholder, required,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
    </div>
  );
}
