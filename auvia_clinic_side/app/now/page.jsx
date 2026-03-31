"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";
import EarningsChart from "../components/EarningsChart";

// Static weekly earnings data - replace with API call later
const staticWeeklyData = [
  { day: "Sun", earnings: 6500, date: "2026-03-29" },
  { day: "Mon", earnings: 12000, date: "2026-03-30" },
  { day: "Tue", earnings: 18500, date: "2026-03-31" },
  { day: "Wed", earnings: 14500, date: "2026-04-01" },
  { day: "Thu", earnings: 21000, date: "2026-04-02" },
  { day: "Fri", earnings: 19500, date: "2026-04-03" },
  { day: "Sat", earnings: 9200, date: "2026-04-04" },
];

export default function NowPage() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use static data for now - replace with API call later
    setWeeklyData(staticWeeklyData);
    const total = staticWeeklyData.reduce((sum, item) => sum + item.earnings, 0);
    setTotalEarnings(total);
    setLoading(false);
  }, []);

  const highestDay = weeklyData.length > 0
    ? weeklyData.reduce((max, item) => item.earnings > max.earnings ? item : max)
    : null;

  const averageDaily = weeklyData.length > 0
    ? Math.round(totalEarnings / weeklyData.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#f5f8fb] text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
        <Sidebar />
        <main className="flex flex-col gap-6 px-8 py-6">
          <Navbar />

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Agent Earnings</h1>
              <p className="text-sm text-slate-500">Weekly performance overview</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Total Earnings Card */}
            <Card className="border-slate-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Earnings (This Week)</p>
                  <CardTitle className="text-3xl font-bold text-emerald-600 mt-2">
                    ₹{(totalEarnings).toLocaleString("en-IN")}
                  </CardTitle>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>From agent calls</span>
                </div>
              </CardContent>
            </Card>

            {/* Daily Average Card */}
            <Card className="border-slate-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Daily Average</p>
                  <CardTitle className="text-3xl font-bold text-blue-600 mt-2">
                    ₹{(averageDaily).toLocaleString("en-IN")}
                  </CardTitle>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">Across 7 days</p>
              </CardContent>
            </Card>

            {/* Highest Day Card */}
            <Card className="border-slate-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Best Day</p>
                  <CardTitle className="text-3xl font-bold text-amber-600 mt-2">
                    {highestDay ? highestDay.day : "—"}
                  </CardTitle>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                  <span className="text-xl font-bold text-amber-600">⭐</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">
                  {highestDay ? `₹${(highestDay.earnings).toLocaleString("en-IN")}` : "—"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Chart */}
          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Weekly Earnings</p>
                  <p className="text-xs text-slate-400">Last 7 days breakdown</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-80 animate-pulse rounded bg-slate-100" />
              ) : (
                <EarningsChart data={weeklyData} />
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>© 2026 Auvia Health Systems. Revenue analytics dashboard.</span>
            <div className="flex items-center gap-4">
              <span>Last updated: {new Date().toLocaleTimeString("en-IN")}</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
