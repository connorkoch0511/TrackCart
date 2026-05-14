import { NextResponse } from "next/server";
import { AnalyticsMetrics } from "@/types";

// Demo data shown when GA4 credentials are not configured
const DEMO_METRICS: AnalyticsMetrics = {
  activeUsers: 1284,
  sessions: 2147,
  eventCount: 18932,
  pageViews: 9421,
  addToCartEvents: 634,
  purchaseEvents: 87,
  topEvents: [
    { eventName: "page_view", count: 9421 },
    { eventName: "view_item_list", count: 3204 },
    { eventName: "view_item", count: 2891 },
    { eventName: "add_to_cart", count: 634 },
    { eventName: "begin_checkout", count: 213 },
    { eventName: "purchase", count: 87 },
    { eventName: "remove_from_cart", count: 148 },
    { eventName: "session_start", count: 2147 },
  ],
  dailyUsers: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      users: Math.floor(30 + Math.random() * 60),
    };
  }),
};

export async function GET() {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!propertyId || !credentialsJson) {
    return NextResponse.json({ ...DEMO_METRICS, isDemo: true });
  }

  try {
    const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
    const client = new BetaAnalyticsDataClient({
      credentials: JSON.parse(credentialsJson),
    });

    const [report] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "eventCount" },
        { name: "screenPageViews" },
      ],
    });

    const [eventReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 10,
    });

    const [dailyReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "29daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const row = report.rows?.[0]?.metricValues ?? [];
    const topEvents = (eventReport.rows ?? []).map((r) => ({
      eventName: r.dimensionValues?.[0]?.value ?? "",
      count: parseInt(r.metricValues?.[0]?.value ?? "0"),
    }));
    const dailyUsers = (dailyReport.rows ?? []).map((r) => {
      const raw = r.dimensionValues?.[0]?.value ?? ""; // YYYYMMDD
      const d = new Date(
        parseInt(raw.slice(0, 4)),
        parseInt(raw.slice(4, 6)) - 1,
        parseInt(raw.slice(6, 8))
      );
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        users: parseInt(r.metricValues?.[0]?.value ?? "0"),
      };
    });

    const addToCartEvents = topEvents.find((e) => e.eventName === "add_to_cart")?.count ?? 0;
    const purchaseEvents = topEvents.find((e) => e.eventName === "purchase")?.count ?? 0;

    const metrics: AnalyticsMetrics & { isDemo: false } = {
      activeUsers: parseInt(row[0]?.value ?? "0"),
      sessions: parseInt(row[1]?.value ?? "0"),
      eventCount: parseInt(row[2]?.value ?? "0"),
      pageViews: parseInt(row[3]?.value ?? "0"),
      addToCartEvents,
      purchaseEvents,
      topEvents,
      dailyUsers,
      isDemo: false,
    };

    return NextResponse.json(metrics);
  } catch (err) {
    console.error("GA4 API error:", err);
    return NextResponse.json({ ...DEMO_METRICS, isDemo: true, error: "GA4 API call failed — showing demo data" });
  }
}
