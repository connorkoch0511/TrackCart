"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white px-3 py-1 text-sm font-medium">Out of Stock</span>
            </div>
          )}
          {product.originalPrice && product.inStock && (
            <Badge className="absolute top-2 left-2 bg-red-500">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="mb-1 text-xs text-gray-500 uppercase tracking-wide">{product.brand}</div>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-1 hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs text-gray-600">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <Button
            size="sm"
            disabled={!product.inStock}
            onClick={() => addToCart(product)}
            className="bg-emerald-600 hover:bg-emerald-700 h-8 gap-1.5"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
