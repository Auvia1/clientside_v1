"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function EarningsChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-slate-400">No data available</p>;
  }

  // Format data for recharts - map earnings to revenue for the bar chart
  const chartData = data.map((item) => ({
    day: item.day,
    revenue: item.earnings,
  }));

  return (
    <div className="w-full">
      <div className="mt-4 h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap={18} barGap={6}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 8" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(148,163,184,0.08)" }}
              contentStyle={{
                background: "#ffffff",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
                fontSize: 12,
              }}
              formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
            />
            <Bar dataKey="revenue" fill="var(--brand-primary)" radius={[8, 8, 0, 0]} barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend and Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-emerald-500" />
          <span className="text-sm text-slate-600">Daily Earnings</span>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">Week Total:</p>
          <p className="text-lg font-semibold text-emerald-600">
            ₹{(data.reduce((sum, d) => sum + d.earnings, 0)).toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
}
