import { Product } from "@/types";

export const products: Product[] = [
  {
    id: "p001",
    name: "Trail Running Shoes",
    brand: "TrailBlaze",
    category: "Footwear",
    price: 89.99,
    originalPrice: 119.99,
    description:
      "Built for the toughest terrain, these trail runners feature a grippy outsole, breathable mesh upper, and rock plate protection. Ideal for everything from muddy single-track to rocky ridgelines.",
    image: "https://picsum.photos/seed/shoes/600/600",
    rating: 4.7,
    reviewCount: 243,
    inStock: true,
    tags: ["running", "trail", "outdoor"],
  },
  {
    id: "p002",
    name: "GPS Sports Watch",
    brand: "Chrono",
    category: "Electronics",
    price: 249.99,
    description:
      "Track pace, distance, heart rate, and elevation with this advanced GPS sports watch. Multi-sport modes, 7-day battery life, and water resistance to 50m.",
    image: "https://picsum.photos/seed/watch/600/600",
    rating: 4.8,
    reviewCount: 512,
    inStock: true,
    tags: ["fitness", "wearable", "gps"],
  },
  {
    id: "p003",
    name: "Yoga Mat Pro",
    brand: "ZenCore",
    category: "Fitness",
    price: 45.0,
    description:
      "6mm thick non-slip mat made from eco-friendly natural rubber. Alignment lines printed on both sides help you perfect your form. Includes carrying strap.",
    image: "https://picsum.photos/seed/yoga/600/600",
    rating: 4.5,
    reviewCount: 189,
    inStock: true,
    tags: ["yoga", "fitness", "home-gym"],
  },
  {
    id: "p004",
    name: "Hydration Pack 20L",
    brand: "HydroPro",
    category: "Outdoor",
    price: 79.99,
    originalPrice: 99.99,
    description:
      "20L daypack with a 2L hydration reservoir, multiple organization pockets, trekking pole attachments, and a padded back panel for all-day comfort on the trail.",
    image: "https://picsum.photos/seed/pack/600/600",
    rating: 4.6,
    reviewCount: 97,
    inStock: true,
    tags: ["hiking", "backpacking", "outdoor"],
  },
  {
    id: "p005",
    name: "Wireless Sport Earbuds",
    brand: "SoundFit",
    category: "Electronics",
    price: 129.99,
    description:
      "IPX7 waterproof earbuds with 9-hour battery life, active noise cancellation, and sport fins for a secure fit during the most intense workouts.",
    image: "https://picsum.photos/seed/earbuds/600/600",
    rating: 4.4,
    reviewCount: 378,
    inStock: true,
    tags: ["audio", "workout", "wireless"],
  },
  {
    id: "p006",
    name: "Compression Running Tights",
    brand: "VeloFit",
    category: "Apparel",
    price: 54.99,
    description:
      "Graduated compression tights reduce muscle fatigue and speed recovery. Four-way stretch fabric with moisture-wicking technology and reflective details for visibility.",
    image: "https://picsum.photos/seed/tights/600/600",
    rating: 4.3,
    reviewCount: 156,
    inStock: true,
    tags: ["running", "compression", "apparel"],
  },
  {
    id: "p007",
    name: "Foam Roller Recovery Kit",
    brand: "RecoverPro",
    category: "Recovery",
    price: 34.99,
    description:
      "Complete recovery kit with a high-density foam roller, massage ball, and resistance bands. Target sore muscles post-workout and improve flexibility.",
    image: "https://picsum.photos/seed/roller/600/600",
    rating: 4.6,
    reviewCount: 221,
    inStock: true,
    tags: ["recovery", "fitness", "mobility"],
  },
  {
    id: "p008",
    name: "Carbon Trekking Poles",
    brand: "Summit",
    category: "Outdoor",
    price: 69.99,
    description:
      "Lightweight carbon fiber poles with anti-shock system, quick-lock mechanism, and ergonomic cork grips. Pack down to 65cm for easy storage.",
    image: "https://picsum.photos/seed/poles/600/600",
    rating: 4.7,
    reviewCount: 88,
    inStock: false,
    tags: ["hiking", "trekking", "outdoor"],
  },
];

export const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
