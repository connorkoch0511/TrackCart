"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, ArrowLeft, Tag } from "lucide-react";
import { getProductById } from "@/lib/products";
import { dataLayer } from "@/lib/dataLayer";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = getProductById(id);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    dataLayer.pageView(`${product.name} | TrackCart`, `/products/${product.id}`);
    dataLayer.viewItem(product);
  }, [product]);

  if (!product) notFound();

  function handleAddToCart() {
    addToCart(product!, quantity);
    toast.success(`${product!.name} added to cart`, {
      description: `Qty: ${quantity} · $${(product!.price * quantity).toFixed(2)}`,
    });
  }

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          {product.originalPrice && (
            <Badge className="absolute top-3 left-3 bg-red-500 text-sm">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </Badge>
          )}
        </div>

        <div className="flex flex-col">
          <div className="text-sm font-medium uppercase tracking-wider text-gray-400">{product.brand}</div>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">{product.name}</h1>
          <Badge variant="outline" className="mt-2 w-fit">{product.category}</Badge>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {product.rating} · {product.reviewCount} reviews
            </span>
          </div>

          <Separator className="my-5" />

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-lg text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>

          <Separator className="my-5" />

          {product.inStock ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 text-lg font-medium"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 text-lg font-medium"
                >
                  +
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-11 gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart — ${(product.price * quantity).toFixed(2)}
              </Button>
            </div>
          ) : (
            <Button disabled className="h-11">Out of Stock</Button>
          )}

          <p className="mt-4 text-xs text-gray-400">
            Free shipping on orders over $100 · 30-day returns
          </p>
        </div>
      </div>
    </div>
  );
}
