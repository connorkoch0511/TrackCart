"use client";

import { useEffect, useState } from "react";
import { Bug, ChevronDown, ChevronUp, X, Trash2 } from "lucide-react";
import { DataLayerEvent } from "@/types";
import { cn } from "@/lib/utils";

const EVENT_COLORS: Record<string, string> = {
  page_view: "bg-blue-100 text-blue-800",
  view_item_list: "bg-purple-100 text-purple-800",
  view_item: "bg-purple-100 text-purple-800",
  add_to_cart: "bg-emerald-100 text-emerald-800",
  remove_from_cart: "bg-red-100 text-red-800",
  begin_checkout: "bg-amber-100 text-amber-800",
  purchase: "bg-green-100 text-green-800",
};

export function DataLayerInspector() {
  const [events, setEvents] = useState<DataLayerEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];

    const originalPush = window.dataLayer.push.bind(window.dataLayer);
    window.dataLayer.push = function (...args: Record<string, unknown>[]) {
      const result = originalPush(...args);
      const event = args[0];
      if (event?.event && typeof event.event === "string") {
        setEvents((prev) => [
          { ...event, timestamp: new Date().toLocaleTimeString() } as DataLayerEvent,
          ...prev,
        ]);
      }
      return result;
    };

    return () => {
      window.dataLayer.push = originalPush;
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="w-80 rounded-xl border bg-white shadow-2xl flex flex-col max-h-[500px]">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bug className="h-4 w-4 text-gray-500" />
              dataLayer Inspector
              <span className="ml-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs">{events.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEvents([])}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {events.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-gray-400">
                Navigate the store to see events appear here
              </div>
            ) : (
              events.map((evt, idx) => (
                <div key={idx} className="border-b last:border-0">
                  <button
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50"
                    onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                          EVENT_COLORS[evt.event] ?? "bg-gray-100 text-gray-700"
                        )}
                      >
                        {evt.event}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-gray-400">{evt.timestamp}</span>
                      {expandedIdx === idx ? (
                        <ChevronUp className="h-3 w-3 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  </button>
                  {expandedIdx === idx && (
                    <pre className="bg-gray-50 px-3 py-2 text-[10px] text-gray-700 overflow-x-auto whitespace-pre-wrap break-words">
                      {JSON.stringify(evt, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-gray-700 transition-colors"
      >
        <Bug className="h-4 w-4" />
        dataLayer
        {events.length > 0 && (
          <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px]">{events.length}</span>
        )}
        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
