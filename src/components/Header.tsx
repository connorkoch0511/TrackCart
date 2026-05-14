"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, BarChart3, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Package className="h-5 w-5 text-emerald-600" />
          <span>TrackCart</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Products
          </Link>
          <Link href="/analytics" className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
          <Link href="/cart" className="relative flex items-center gap-1.5 hover:text-gray-900 transition-colors">
            <ShoppingCart className="h-5 w-5" />
            <span>Cart</span>
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-3 h-4 w-4 justify-center rounded-full p-0 text-[10px] bg-emerald-600">
                {itemCount}
              </Badge>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
