"use client";

import { useMemo } from "react";

export default function EarningsChart({ data }) {
  const stats = useMemo(() => {
    if (!data || data.length === 0) return { max: 0, min: 0 };

    const earnings = data.map((d) => d.earnings);
    const max = Math.max(...earnings);
    const min = Math.min(...earnings);

    return { max, min };
  }, [data]);

  if (!data || data.length === 0) {
    return <p className="text-center text-slate-400">No data available</p>;
  }

  const range = stats.max - stats.min || stats.max;
  const padding = range * 0.1;
  const scaledMax = stats.max + padding;

  return (
    <div className="w-full">
      {/* Chart Container */}
      <div className="flex flex-col gap-6">
        {/* Bar Chart */}
        <div className="flex items-end justify-between gap-3 min-h-72">
          {data.map((item, index) => {
            const percentage = (item.earnings / scaledMax) * 100;
            const isHighest = item.earnings === stats.max;

            return (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                {/* Bar */}
                <div className="relative w-full flex items-end justify-center min-h-48">
                  <div
                    className={`w-10 rounded-t-lg transition-all duration-300 ${
                      isHighest
                        ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg"
                        : "bg-gradient-to-t from-emerald-500 to-emerald-300 hover:from-emerald-600 hover:to-emerald-400"
                    }`}
                    style={{ height: `${percentage}%` }}
                  >
                    {/* Value Label */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-semibold text-slate-700">
                      ${(item.earnings / 100).toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* Day Label */}
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">{item.day}</p>
                  <p className="text-xs text-slate-400">{item.date}</p>
                </div>

                {/* Best Day Badge */}
                {isHighest && (
                  <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1">
                    <span className="text-xs font-semibold text-emerald-600">⭐ Best</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend and Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-emerald-500" />
            <span className="text-sm text-slate-600">Daily Earnings</span>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400">Week Total:</p>
            <p className="text-lg font-semibold text-emerald-600">
              ${(data.reduce((sum, d) => sum + d.earnings, 0) / 100).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
