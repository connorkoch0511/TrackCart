export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface GA4Item {
  item_id: string;
  item_name: string;
  item_brand: string;
  item_category: string;
  price: number;
  quantity?: number;
  index?: number;
}

export interface DataLayerEvent {
  event: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface AnalyticsMetrics {
  activeUsers: number;
  sessions: number;
  eventCount: number;
  pageViews: number;
  addToCartEvents: number;
  purchaseEvents: number;
  topEvents: { eventName: string; count: number }[];
  dailyUsers: { date: string; users: number }[];
}
