"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { TrendingUp, DollarSign, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import EarningsChart from "../components/EarningsChart";
import { doctorsApi, paymentsApi } from "../lib/api";

// Static data for multiple doctors - KEPT FOR FALLBACK
const doctorEarningsData = {
  1: {
    id: 1,
    name: "Dr. Rajesh Kumar",
    weekly: [
      { day: "Sun", earnings: 6500, date: "2026-03-29" },
      { day: "Mon", earnings: 12000, date: "2026-03-30" },
      { day: "Tue", earnings: 18500, date: "2026-03-31" },
      { day: "Wed", earnings: 14500, date: "2026-04-01" },
      { day: "Thu", earnings: 21000, date: "2026-04-02" },
      { day: "Fri", earnings: 19500, date: "2026-04-03" },
      { day: "Sat", earnings: 9200, date: "2026-04-04" },
    ],
    appointments: 24,
  },
  2: {
    id: 2,
    name: "Dr. Priya Singh",
    weekly: [
      { day: "Sun", earnings: 8000, date: "2026-03-29" },
      { day: "Mon", earnings: 9500, date: "2026-03-30" },
      { day: "Tue", earnings: 12000, date: "2026-03-31" },
      { day: "Wed", earnings: 11200, date: "2026-04-01" },
      { day: "Thu", earnings: 13500, date: "2026-04-02" },
      { day: "Fri", earnings: 14800, date: "2026-04-03" },
      { day: "Sat", earnings: 7600, date: "2026-04-04" },
    ],
    appointments: 18,
  },
  3: {
    id: 3,
    name: "Dr. Amit Patel",
    weekly: [
      { day: "Sun", earnings: 5200, date: "2026-03-29" },
      { day: "Mon", earnings: 8900, date: "2026-03-30" },
      { day: "Tue", earnings: 15600, date: "2026-03-31" },
      { day: "Wed", earnings: 16800, date: "2026-04-01" },
      { day: "Thu", earnings: 18200, date: "2026-04-02" },
      { day: "Fri", earnings: 16500, date: "2026-04-03" },
      { day: "Sat", earnings: 11200, date: "2026-04-04" },
    ],
    appointments: 22,
  },
};

export default function EarningsPage() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [doctorAppointmentCount, setDoctorAppointmentCount] = useState(0);
  const [doctorWeeklyEarnings, setDoctorWeeklyEarnings] = useState(0);
  const [doctorLoading, setDoctorLoading] = useState(false);

  // Calculate week offset based on selected date
  const calculateWeekOffset = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(dateStr);
    const daysDiff = Math.floor((selectedDateObj - today) / (1000 * 60 * 60 * 24));
    return Math.floor(daysDiff / 7);
  };

  const weekOffset = calculateWeekOffset(selectedDate);

  // Fetch daily earnings data from payments API
  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Calculate the start and end date of the selected week
        const selectedDateObj = new Date(selectedDate);

        // Get the start of the week (Sunday)
        const weekStart = new Date(selectedDateObj);
        weekStart.setDate(selectedDateObj.getDate() - selectedDateObj.getDay());
        weekStart.setHours(0, 0, 0, 0);

        // Calculate end of week (Saturday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        // Format dates for API
        const startDateStr = weekStart.toISOString().split('T')[0];
        const endDateStr = weekEnd.toISOString().split('T')[0];

        console.log("📊 Week Calculation:");
        console.log("  Selected date:", selectedDate);
        console.log("  Week range:", startDateStr, "to", endDateStr);
        console.log("  Days in week:", ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + i);
          return `${d} (${date.toISOString().split('T')[0]})`;
        }).join(", "));

        // Fetch payments for the week
        const paymentsResponse = await paymentsApi.list({
          status: "paid",
          start_date: startDateStr,
          end_date: endDateStr,
          limit: 100,
        });

        console.log("✓ Payments API response:", paymentsResponse.length, "payments");

        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        // Group payments by day of week
        const dayMap = {
          0: { day: "Sun", earnings: 0, count: 0, date: new Date(weekStart) },
          1: { day: "Mon", earnings: 0, count: 0, date: new Date(weekStart.getTime() + 1000 * 60 * 60 * 24) },
          2: { day: "Tue", earnings: 0, count: 0, date: new Date(weekStart.getTime() + 2 * 1000 * 60 * 60 * 24) },
          3: { day: "Wed", earnings: 0, count: 0, date: new Date(weekStart.getTime() + 3 * 1000 * 60 * 60 * 24) },
          4: { day: "Thu", earnings: 0, count: 0, date: new Date(weekStart.getTime() + 4 * 1000 * 60 * 60 * 24) },
          5: { day: "Fri", earnings: 0, count: 0, date: new Date(weekStart.getTime() + 5 * 1000 * 60 * 60 * 24) },
          6: { day: "Sat", earnings: 0, count: 0, date: new Date(weekStart.getTime() + 6 * 1000 * 60 * 60 * 24) },
        };

        // Sum earnings by day
        paymentsResponse.forEach((payment) => {
          const paymentDate = new Date(payment.created_at);
          const dayOfWeek = paymentDate.getDay();
          const amount = parseFloat(payment.amount);
          dayMap[dayOfWeek].earnings += amount;
          dayMap[dayOfWeek].count += 1;
        });

        // Log the breakdown
        console.log("📈 Daily breakdown:");
        Object.values(dayMap).forEach((day) => {
          console.log(`  ${day.day}: ₹${day.earnings.toLocaleString('en-IN')} (${day.count} payments)`);
        });

        const weeklyEarnings = Object.values(dayMap).map(d => ({
          day: d.day,
          earnings: d.earnings,
        }));
        const total = weeklyEarnings.reduce((sum, item) => sum + item.earnings, 0);

        console.log("💰 Total earnings for week:", "₹" + total.toLocaleString('en-IN'));

        setWeeklyData(weeklyEarnings);
        setTotalEarnings(total);
      } catch (err) {
        console.error("❌ Error fetching earnings:", err);
        setError(err.message);
        // Fallback to static data on error
        const fallbackData = [
          { day: "Sun", earnings: 6500 },
          { day: "Mon", earnings: 12000 },
          { day: "Tue", earnings: 18500 },
          { day: "Wed", earnings: 14500 },
          { day: "Thu", earnings: 21000 },
          { day: "Fri", earnings: 19500 },
          { day: "Sat", earnings: 9200 },
        ];
        setWeeklyData(fallbackData);
        setTotalEarnings(101200);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [selectedDate]);

  // Fetch doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsData = await doctorsApi.list();
        setDoctors(doctorsData);
        if (doctorsData.length > 0) {
          setSelectedDoctorId(doctorsData[0].id);
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        // Fallback to static data
        const fallbackDoctors = Object.values(doctorEarningsData).map(d => ({
          id: d.id,
          name: d.name,
        }));
        setDoctors(fallbackDoctors);
        setSelectedDoctorId(fallbackDoctors[0].id);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch doctor appointments and earnings for selected doctor
  useEffect(() => {
    if (!selectedDoctorId) return;

    const fetchDoctorAppointments = async () => {
      setDoctorLoading(true);
      try {
        // Calculate the start and end date of the selected week
        const selectedDateObj = new Date(selectedDate);
        const weekStart = new Date(selectedDateObj);
        weekStart.setDate(selectedDateObj.getDate() - selectedDateObj.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const startDateStr = weekStart.toISOString().split('T')[0];
        const endDateStr = weekEnd.toISOString().split('T')[0];

        const appointmentsResponse = await doctorsApi.getAppointments(selectedDoctorId, {
          status: 'completed',
          start_date: startDateStr,
          end_date: endDateStr,
          limit: 100,
        });

        setDoctorAppointmentCount(appointmentsResponse?.length || 0);

        // Calculate doctor's total earnings from appointments
        const doctorEarnings = appointmentsResponse?.reduce((sum, appt) => {
          return sum + (parseFloat(appt.payment_amount) || 0);
        }, 0) || 0;

        setDoctorWeeklyEarnings(doctorEarnings);
        console.log(`Doctor ${selectedDoctorId}: ${appointmentsResponse?.length || 0} appointments, ₹${doctorEarnings.toLocaleString('en-IN')} earnings`);
      } catch (err) {
        console.error("Error fetching doctor appointments:", err);
        setDoctorAppointmentCount(0);
        setDoctorWeeklyEarnings(0);
      } finally {
        setDoctorLoading(false);
      }
    };

    fetchDoctorAppointments();
  }, [selectedDoctorId, selectedDate]);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  // Doctor's weekly total is calculated from their appointments
  const selectedDoctorTotal = doctorWeeklyEarnings;

  const highestDay = weeklyData.length > 0
    ? weeklyData.reduce((max, item) => item.earnings > max.earnings ? item : max)
    : null;

  const averageDaily = weeklyData.length > 0
    ? Math.round(totalEarnings / weeklyData.length)
    : 0;

  const selectedDoctorHighestDay = null; // Doctor best day would need day-by-day breakdown from appointments

  const weekLabel = weekOffset === 0
    ? "This Week"
    : weekOffset === -1
    ? "Previous Week"
    : weekOffset === 1
    ? "Next Week"
    : `Week ${weekOffset > 0 ? '+' : ''}${weekOffset}`;

  const shiftDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().slice(0, 10));
  };

  const handleShiftWeek = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().slice(0, 10));
  };

  return (
    <div className="min-h-screen bg-[#f5f8fb] text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
        <Sidebar />
        <main className="flex flex-col gap-6 px-8 py-6">
          <Navbar />

          {/* Header with Week Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Doctor Earnings</h1>
                <p className="text-sm text-slate-500">{weekLabel}</p>
              </div>
            </div>

            {/* Date & Week Navigation */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                <Calendar className="text-slate-400 shrink-0 h-4 w-4" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                  }}
                  className="h-8 border-none bg-transparent p-0 text-xs w-32"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 rounded-full p-0"
                  onClick={() => {
                    setSelectedDate(new Date().toISOString().slice(0, 10));
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                className="rounded-full px-3"
                onClick={() => shiftDate(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-4 text-xs"
                onClick={() => {
                  setSelectedDate(new Date().toISOString().slice(0, 10));
                }}
              >
                This Week
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-3"
                onClick={() => handleShiftWeek(7)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
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
                  <span>From appointments</span>
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

          {/* Weekly Chart + Earnings Summary */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chart Card - Takes 2 columns */}
            <Card className="border-slate-100 shadow-sm lg:col-span-2">
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
                ) : error ? (
                  <div className="h-80 flex items-center justify-center bg-slate-50 rounded">
                    <p className="text-sm text-slate-500">{error}</p>
                  </div>
                ) : (
                  <EarningsChart data={weeklyData} />
                )}
              </CardContent>
            </Card>

            {/* Earnings Summary - Takes 1 column */}
            <Card className="border-slate-100 shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold">Doctor Summary</p>
                  {/* Doctor Dropdown */}
                  <select
                    value={selectedDoctorId || ""}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Total Weekly */}
                <div className="rounded-lg bg-emerald-50 p-4">
                  <p className="text-xs font-medium text-emerald-700 mb-1">Total Weekly</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ₹{(selectedDoctorTotal).toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Total Appointments */}
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-xs font-medium text-blue-700 mb-1">Total Appointments</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {doctorLoading ? "..." : doctorAppointmentCount}
                  </p>
                </div>

                {/* Best Day */}
                <div className="rounded-lg bg-amber-50 p-4">
                  <p className="text-xs font-medium text-amber-700 mb-1">Weekly Earnings per Appointment</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {doctorAppointmentCount > 0 ? `₹${Math.round(doctorWeeklyEarnings / doctorAppointmentCount).toLocaleString("en-IN")}` : "—"}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    {doctorAppointmentCount > 0 ? `per appointment` : "—"}
                  </p>
                </div>

                {/* Stats */}
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <div className="flex justify-between items-center text-xs text-slate-600 mb-2">
                    <span>Total weekly earnings</span>
                    <span className="font-semibold">₹{doctorWeeklyEarnings.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Total appointments</span>
                    <span className="font-semibold">{doctorLoading ? "..." : doctorAppointmentCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
