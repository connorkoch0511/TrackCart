"use client";

import { useState, useEffect } from "react";
import { products, categories } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { dataLayer } from "@/lib/dataLayer";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    dataLayer.pageView("Product Listing | TrackCart", "/");
    dataLayer.viewItemList(products, "Home Page");
  }, []);

  const filtered =
    activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    const items = cat === "All" ? products : products.filter((p) => p.category === cat);
    dataLayer.viewItemList(items, cat === "All" ? "All Products" : cat);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gear Up</h1>
        <p className="mt-1 text-gray-500">
          Shop the latest gear — every interaction is tracked and visible in the dataLayer inspector below.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeCategory === cat
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
