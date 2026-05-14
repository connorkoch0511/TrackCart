"use client";

import { useEffect, useState } from "react";
import { BarChart3, Users, MousePointerClick, ShoppingCart, CreditCard, Eye, Info } from "lucide-react";
import { dataLayer } from "@/lib/dataLayer";
import { AnalyticsMetrics } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface MetricsResponse extends AnalyticsMetrics {
  isDemo: boolean;
  error?: string;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataLayer.pageView("Analytics Dashboard | TrackCart", "/analytics");
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-emerald-600" />
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-gray-500">Last 30 days · Powered by GA4 Reporting API</p>
        </div>
        {data && (
          <Badge variant={data.isDemo ? "outline" : "default"} className={data.isDemo ? "border-amber-300 text-amber-700 bg-amber-50" : "bg-emerald-600"}>
            {data.isDemo ? "Demo Data" : "Live GA4 Data"}
          </Badge>
        )}
      </div>

      {data?.isDemo && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <strong>Demo mode</strong> — set <code className="bg-blue-100 px-1 rounded">GA4_PROPERTY_ID</code> and{" "}
            <code className="bg-blue-100 px-1 rounded">GOOGLE_APPLICATION_CREDENTIALS_JSON</code> in your environment variables to connect real GA4 data.{" "}
            See the <a href="https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries" className="underline" target="_blank" rel="noopener noreferrer">GA4 Data API docs</a>.
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white animate-pulse shadow-sm" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <MetricCard icon={Users} label="Active Users" value={data.activeUsers.toLocaleString()} color="text-blue-600" bg="bg-blue-50" />
            <MetricCard icon={MousePointerClick} label="Sessions" value={data.sessions.toLocaleString()} color="text-purple-600" bg="bg-purple-50" />
            <MetricCard icon={Eye} label="Page Views" value={data.pageViews.toLocaleString()} color="text-indigo-600" bg="bg-indigo-50" />
            <MetricCard icon={BarChart3} label="Total Events" value={data.eventCount.toLocaleString()} color="text-gray-600" bg="bg-gray-100" />
            <MetricCard icon={ShoppingCart} label="Add to Cart" value={data.addToCartEvents.toLocaleString()} color="text-emerald-600" bg="bg-emerald-50" />
            <MetricCard icon={CreditCard} label="Purchases" value={data.purchaseEvents.toLocaleString()} color="text-green-600" bg="bg-green-50" />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Events (30 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topEvents.map((evt, i) => {
                    const max = data.topEvents[0].count;
                    const pct = Math.round((evt.count / max) * 100);
                    return (
                      <div key={evt.eventName}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-mono text-xs text-gray-700">{evt.eventName}</span>
                          <span className="font-semibold text-gray-900">{evt.count.toLocaleString()}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100">
                          <div
                            className="h-2 rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {i < data.topEvents.length - 1 && <Separator className="mt-3" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Active Users (30 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-40">
                  {data.dailyUsers.map((d, i) => {
                    const max = Math.max(...data.dailyUsers.map((x) => x.users));
                    const heightPct = max > 0 ? (d.users / max) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end group relative h-full">
                        <div
                          className="w-full rounded-t bg-emerald-500 opacity-80 hover:opacity-100 transition-all cursor-pointer"
                          style={{ height: `${heightPct}%` }}
                          title={`${d.date}: ${d.users} users`}
                        />
                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                          {d.date}: {d.users}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-gray-400">
                  <span>{data.dailyUsers[0]?.date}</span>
                  <span>{data.dailyUsers[data.dailyUsers.length - 1]?.date}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">E-commerce Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                {[
                  { label: "view_item", value: data.topEvents.find((e) => e.eventName === "view_item")?.count ?? 0, color: "bg-purple-400" },
                  { label: "add_to_cart", value: data.addToCartEvents, color: "bg-emerald-400" },
                  { label: "begin_checkout", value: data.topEvents.find((e) => e.eventName === "begin_checkout")?.count ?? 0, color: "bg-amber-400" },
                  { label: "purchase", value: data.purchaseEvents, color: "bg-green-500" },
                ].map((step, i, arr) => {
                  const max = arr[0].value || 1;
                  const pct = Math.round((step.value / max) * 100);
                  return (
                    <div key={step.label} className="flex-1 text-center">
                      <div className="font-bold text-lg text-gray-900">{step.value.toLocaleString()}</div>
                      <div className="mx-auto my-1 rounded" style={{ height: "8px", background: "#e5e7eb" }}>
                        <div className={`h-2 rounded ${step.color}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="font-mono text-[10px] text-gray-500">{step.label}</div>
                      {i > 0 && (
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {Math.round((step.value / arr[i - 1].value) * 100) || 0}% of prev
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-gray-400">Could not load analytics data.</p>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon, label, value, color, bg,
}: {
  icon: React.ElementType; label: string; value: string; color: string; bg: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className={`inline-flex rounded-lg p-2 ${bg} mb-3`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </CardContent>
    </Card>
  );
}
