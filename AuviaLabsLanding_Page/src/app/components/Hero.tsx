import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, LayoutDashboard, Calendar, Phone, Bell, Search, ToggleRight, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { AuroraBackground } from "./ui/aurora-background";

const tabs = ["Dashboard", "Schedule", "Calls & Logs"] as const;
type Tab = (typeof tabs)[number];

function DashboardScreen() {
  return (
    <div className="flex h-full overflow-hidden rounded-xl bg-[#f8fafb] text-[11px]">
      {/* Sidebar */}
      <div className="flex w-[120px] shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-4">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-slate-800">
            <div className="size-3 rounded-sm bg-teal-400" />
          </div>
          <span className="text-[12px] font-bold text-slate-800">Auvia</span>
        </div>
        <p className="mb-1 px-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Clinic Ops</p>
        <div className="mb-1 flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1.5 text-emerald-700 font-medium">
          <LayoutDashboard className="size-3" /><span>Dashboard</span>
        </div>
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-slate-500">
          <Calendar className="size-3" /><span>Schedule</span>
        </div>
        <p className="mb-1 mt-4 px-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Virtual Asst.</p>
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-slate-500">
          <Phone className="size-3" /><span>Calls &amp; Logs</span>
          <span className="ml-auto rounded-full bg-emerald-500 px-1.5 text-[8px] font-bold text-white">12</span>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex h-9 items-center justify-between border-b border-slate-200 bg-white px-4">
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-400">
            <Search className="size-2.5" /><span className="text-[9px]">Search patients or operations…</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-semibold text-teal-600">Active &amp; Monitoring</span>
            <div className="relative h-3.5 w-6 rounded-full bg-teal-500">
              <div className="absolute right-0.5 top-0.5 size-2.5 rounded-full bg-white shadow" />
            </div>
            <Bell className="size-3 text-slate-400" />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden p-3 gap-3">
          {/* Schedule table */}
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[13px] font-bold text-slate-800">Morning Overview</h2>
                <p className="text-[9px] text-slate-400">Tuesday, October 24, 2026 • 09:45 AM</p>
              </div>
              <div className="flex gap-1.5">
                <button className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[9px] text-slate-600">Operational Audit</button>
                <button className="rounded-md bg-slate-900 px-2 py-1 text-[9px] text-white">+ New Appointment</button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3 text-teal-500" />
                  <span className="text-[10px] font-semibold text-slate-700">Today's Schedule</span>
                </div>
                <div className="flex gap-1">
                  {["All Providers", "Dr. Rao", "Dr. Reddy"].map((p, i) => (
                    <span key={p} className={`rounded-full px-2 py-0.5 text-[8px] font-medium ${i === 0 ? "bg-slate-800 text-white" : "border border-slate-200 text-slate-500"}`}>{p}</span>
                  ))}
                </div>
              </div>
              <div className="px-3">
                <div className="grid grid-cols-4 py-1.5 text-[8px] font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100">
                  <span>Time</span><span>Patient &amp; Reason</span><span>Provider</span><span>Status</span>
                </div>
                {[
                  { time: "09:00 AM", name: "K. Sai Pallavi", tag: "NEW PATIENT", reason: "Annual Checkup", initials: "SR", provider: "Dr. S. Rao", status: "Checked In", statusColor: "text-orange-600 bg-orange-50", highlight: false },
                  { time: "09:30 AM", name: "Ch. Venkata Ramana", tag: "AGENT BOOKED", reason: "Follow-up: X-Ray", initials: "AR", provider: "Dr. A. Reddy", status: "Confirmed", statusColor: "text-emerald-600 bg-emerald-50", highlight: true },
                  { time: "10:15 AM", name: "Rahul Sharma", tag: "ROUTINE", reason: "Prescription Renewal", initials: "SR", provider: "Dr. S. Rao", status: "Upcoming", statusColor: "text-slate-500 bg-slate-50", highlight: false },
                  { time: "11:00 AM", name: "Ananya Verma", tag: "AGENT BOOKED", reason: "Acute Knee Pain", initials: "AR", provider: "Dr. A. Reddy", status: "Upcoming", statusColor: "text-slate-500 bg-slate-50", highlight: false },
                ].map((row) => (
                  <div key={row.name} className={`grid grid-cols-4 items-center py-1.5 border-b border-slate-50 ${row.highlight ? "border-l-2 border-l-teal-500 bg-teal-50/30 -ml-0.5 pl-0.5" : ""}`}>
                    <span className="text-[9px] font-medium text-slate-600">{row.time}</span>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-semibold text-slate-800">{row.name}</span>
                        <span className={`rounded px-1 py-0.5 text-[7px] font-bold ${row.tag === "AGENT BOOKED" ? "bg-teal-500 text-white" : "border border-slate-300 text-slate-500"}`}>{row.tag}</span>
                      </div>
                      <span className="text-[8px] text-slate-400">{row.reason}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex size-4 items-center justify-center rounded-full bg-slate-200 text-[7px] font-bold text-slate-600">{row.initials}</div>
                      <span className="text-[9px] text-slate-600">{row.provider}</span>
                    </div>
                    <span className={`w-fit rounded-full px-1.5 py-0.5 text-[8px] font-medium ${row.statusColor}`}>{row.status}</span>
                  </div>
                ))}
              </div>
              <div className="px-3 py-2 text-center">
                <span className="text-[8px] font-medium text-teal-600">View All 18 Appointments ↓</span>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex w-[130px] shrink-0 flex-col gap-2">
            {/* Inbound calls */}
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <div className="flex items-center gap-1 mb-1.5">
                <Phone className="size-3 text-slate-400" />
                <span className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">Inbound Calls</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-[22px] font-bold leading-none text-slate-800">128</span>
                <div className="mb-0.5">
                  <span className="text-[9px] font-semibold text-emerald-600">98.5%</span>
                  <p className="text-[8px] text-emerald-500">Answered</p>
                </div>
              </div>
              <p className="mt-1 text-[8px] text-slate-500"><span className="inline-block size-1.5 rounded-full bg-emerald-400 mr-0.5 align-middle" />84 calls handled by Agent</p>
            </div>
            {/* Live activity */}
            <div className="rounded-lg border border-slate-200 bg-white p-2.5 flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-semibold text-slate-700">Live Activity</span>
                <div className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /><span className="text-[8px] text-emerald-500 font-medium">LIVE</span></div>
              </div>
              {[
                { ago: "2 MINS AGO", text: "Virtual Agent handled a rescheduling request.", sub: "Moved B. Nagarjuna to Thursday 2PM.", color: "border-teal-400" },
                { ago: "14 MINS AGO", text: "Receptionist checked in K. Sai Pallavi.", sub: "", color: "border-slate-300" },
                { ago: "25 MINS AGO", text: "Missed Call: Unknown Number", sub: "", color: "border-red-400" },
              ].map((item) => (
                <div key={item.ago} className={`mb-2 border-l-2 pl-2 ${item.color}`}>
                  <p className="text-[7px] font-semibold text-slate-400">{item.ago}</p>
                  <p className="text-[8px] text-slate-700 leading-tight">{item.text}</p>
                  {item.sub && <p className="text-[7px] text-slate-400">{item.sub}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleScreen() {
  return (
    <div className="flex h-full overflow-hidden rounded-xl bg-[#f8fafb] text-[11px]">
      {/* Sidebar */}
      <div className="flex w-[120px] shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-4">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-slate-800">
            <span className="text-[9px] font-bold text-white">A</span>
          </div>
          <span className="text-[12px] font-bold text-slate-800">Auvia</span>
        </div>
        <p className="mb-1 px-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Clinic Ops</p>
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-slate-500">
          <LayoutDashboard className="size-3" /><span>Dashboard</span>
        </div>
        <div className="mb-1 flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1.5 text-emerald-700 font-medium">
          <Calendar className="size-3" /><span>Schedule</span>
        </div>
        <p className="mb-1 mt-4 px-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Virtual Asst.</p>
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-slate-500">
          <Phone className="size-3" /><span>Calls &amp; Logs</span>
          <span className="ml-auto rounded-full bg-emerald-500 px-1.5 text-[8px] font-bold text-white">12</span>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-9 items-center justify-between border-b border-slate-200 bg-white px-4">
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-400">
            <Search className="size-2.5" /><span className="text-[9px]">Search patients, doctors, slots…</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-semibold text-teal-600">Virtual Agent Active</span>
            <div className="relative h-3.5 w-6 rounded-full bg-teal-500"><div className="absolute right-0.5 top-0.5 size-2.5 rounded-full bg-white shadow" /></div>
            <Bell className="size-3 text-slate-400" />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden p-3 gap-3">
          <div className="flex flex-1 flex-col gap-2 overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[13px] font-bold text-slate-800">Clinic Schedule</h2>
                <p className="text-[9px] text-slate-400">Today, Tuesday, October 24, 2026</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex rounded-md border border-slate-200 bg-white overflow-hidden">
                  {["Day","Week","Month"].map((v,i) => (
                    <button key={v} className={`px-2 py-1 text-[8px] ${i===0 ? "bg-slate-800 text-white font-medium" : "text-slate-500"}`}>{v}</button>
                  ))}
                </div>
                <button className="flex items-center gap-1 rounded-md bg-teal-500 px-2 py-1 text-[8px] font-medium text-white">+ New Appointment</button>
              </div>
            </div>

            {/* Calendar columns */}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden flex-1">
              <div className="grid grid-cols-[50px_1fr_1fr_1fr] border-b border-slate-100">
                <div />
                {[
                  { initials: "SR", name: "Dr. Suresh Reddy", spec: "Cardiology • 09:00 – 17:00" },
                  { initials: "AR", name: "Dr. Ananya Rao", spec: "General • 08:30 – 16:30" },
                  { initials: "KP", name: "Dr. Kiran Prasad", spec: "Orthopedic • 10:00 – 16:00" },
                ].map((d) => (
                  <div key={d.initials} className="border-l border-slate-100 px-2 py-1.5 text-center">
                    <div className="mx-auto mb-0.5 flex size-5 items-center justify-center rounded-full bg-slate-200 text-[8px] font-bold text-slate-600">{d.initials}</div>
                    <p className="text-[8px] font-semibold text-slate-700">{d.name}</p>
                    <p className="text-[7px] text-slate-400">{d.spec}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-[50px_1fr_1fr_1fr] text-[8px]">
                {["09:00 AM","10:00 AM","11:00 AM","12:00 PM"].map((t, ri) => (
                  <>
                    <div key={t} className="border-b border-slate-50 px-1 py-3 text-[7px] text-slate-400">{t}</div>
                    {/* SR column */}
                    <div className="border-b border-l border-slate-50 p-1 relative" key={`sr-${t}`}>
                      {ri === 0 && (
                        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-1">
                          <p className="font-semibold text-slate-700">Jayanth Rao</p>
                          <p className="text-slate-400">Annual Checkup</p>
                          <span className="rounded px-1 bg-emerald-500 text-white text-[7px] font-bold">CHECKED IN</span>
                        </div>
                      )}
                      {ri === 1 && (
                        <div className="rounded-md bg-red-50 border border-red-200 p-1">
                          <p className="font-semibold text-slate-700">Saranya Krishnan</p>
                          <p className="text-slate-400">Cardiology Consult</p>
                          <span className="rounded px-1 bg-red-500 text-white text-[7px] font-bold">LATE</span>
                        </div>
                      )}
                    </div>
                    {/* AR column */}
                    <div className="border-b border-l border-slate-50 p-1" key={`ar-${t}`}>
                      {ri === 0 && (
                        <div className="rounded-md bg-teal-50 border border-teal-200 p-1">
                          <p className="font-semibold text-slate-700">Venkata Ramana</p>
                          <p className="text-slate-400">Follow-up: X-Ray</p>
                          <span className="rounded px-1 bg-teal-500 text-white text-[7px] font-bold">AGENT BOOKED</span>
                        </div>
                      )}
                      {ri === 1 && (
                        <div className="rounded-md bg-slate-50 border border-slate-200 p-1">
                          <p className="font-semibold text-slate-700">Suresh Babu</p>
                          <p className="text-slate-400">General Inquiry</p>
                        </div>
                      )}
                    </div>
                    {/* KP column */}
                    <div className="border-b border-l border-slate-50 p-1" key={`kp-${t}`}>
                      {ri === 1 && (
                        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-1">
                          <p className="font-semibold text-slate-700">Meena Kumari</p>
                          <p className="text-slate-400">Post-Op Review (Knee)</p>
                          <span className="rounded px-1 bg-emerald-600 text-white text-[7px] font-bold">CONFIRMED</span>
                        </div>
                      )}
                    </div>
                  </>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex w-[130px] shrink-0 flex-col gap-2">
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="mb-1.5 text-[9px] font-semibold text-slate-700">Patient Look-up</p>
              <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 mb-2">
                <Search className="size-2.5 text-slate-400" /><span className="text-[8px] text-slate-400">Name or Phone…</span>
              </div>
              {[{ initials: "JR", name: "Jayanth Rao", sub: "Last visit: 2 days ago" }, { initials: "SK", name: "Saranya Krishnan", sub: "New Patient" }].map(p => (
                <div key={p.initials} className="flex items-center gap-1.5 mb-1.5">
                  <div className="flex size-5 items-center justify-center rounded-full bg-slate-200 text-[7px] font-bold text-slate-600">{p.initials}</div>
                  <div><p className="text-[8px] font-medium text-slate-700">{p.name}</p><p className="text-[7px] text-slate-400">{p.sub}</p></div>
                </div>
              ))}
              <button className="mt-1 w-full rounded-md border border-slate-200 py-1 text-[8px] text-slate-600">View All Patients</button>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2.5 flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-semibold text-slate-700">Live Activity</span>
                <div className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /><span className="text-[8px] text-emerald-500 font-medium">LIVE</span></div>
              </div>
              {[
                { color: "border-teal-400", ago: "2 MINS AGO", text: "Virtual Agent handled rescheduling for B. Nagarjuna.", sub: '"Moved to Thursday 2PM."' },
                { color: "border-slate-300", ago: "14 MINS AGO", text: "Receptionist checked in Jayanth Rao.", sub: "" },
                { color: "border-amber-400", ago: "25 MINS AGO", text: "Missed Call: +91 98480 22338", sub: "" },
              ].map((item) => (
                <div key={item.ago} className={`mb-2 border-l-2 pl-2 ${item.color}`}>
                  <p className="text-[7px] font-semibold text-slate-400">{item.ago}</p>
                  <p className="text-[8px] text-slate-700 leading-tight">{item.text}</p>
                  {item.sub && <p className="text-[7px] italic text-slate-400">{item.sub}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CallsLogsScreen() {
  return (
    <div className="flex h-full overflow-hidden rounded-xl bg-[#f8fafb] text-[11px]">
      {/* Sidebar */}
      <div className="flex w-[120px] shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-4">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-slate-800">
            <span className="text-[9px] font-bold text-white">A</span>
          </div>
          <span className="text-[12px] font-bold text-slate-800">Auvia</span>
        </div>
        <p className="mb-1 px-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Clinic Ops</p>
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-slate-500">
          <LayoutDashboard className="size-3" /><span>Dashboard</span>
        </div>
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-slate-500">
          <Calendar className="size-3" /><span>Schedule</span>
        </div>
        <p className="mb-1 mt-4 px-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Virtual Asst.</p>
        <div className="mb-1 flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1.5 text-emerald-700 font-medium">
          <Phone className="size-3" /><span>Calls &amp; Logs</span>
          <span className="ml-auto rounded-full bg-emerald-500 px-1.5 text-[8px] font-bold text-white">12</span>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-9 items-center justify-between border-b border-slate-200 bg-white px-4">
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-400">
            <Search className="size-2.5" /><span className="text-[9px]">Search logs, patients, or agents…</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-semibold text-teal-600">Active &amp; Listening</span>
            <div className="relative h-3.5 w-6 rounded-full bg-teal-500"><div className="absolute right-0.5 top-0.5 size-2.5 rounded-full bg-white shadow" /></div>
            <Bell className="size-3 text-slate-400" />
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden p-3 gap-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[13px] font-bold text-slate-800">Calls &amp; Logs</h2>
              <p className="text-[9px] text-slate-400">Review communication history and AI activity logs.</p>
            </div>
            <div className="flex gap-1.5">
              <button className="rounded-md border border-slate-200 px-2 py-1 text-[8px] text-slate-600">Export CSV</button>
              <button className="rounded-md bg-teal-500 px-2 py-1 text-[8px] font-medium text-white">+ Log Manual Call</button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[8px] text-slate-500">
              <Calendar className="size-2.5" /> Today: Oct 24, 2024
            </div>
            {["Agent: All", "Outcome: All", "Call Type: All"].map(f => (
              <div key={f} className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[8px] text-slate-500">{f} ▾</div>
            ))}
            <div className="ml-auto flex flex-col items-end rounded-lg border border-slate-200 bg-white px-2.5 py-1">
              <div className="flex items-center gap-1"><span className="text-[16px] font-bold text-slate-800">128</span><span className="text-[8px] font-semibold text-emerald-500">98.5% Success</span></div>
              <span className="text-[7px] text-slate-400">Calls Handled</span>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="grid grid-cols-[60px_80px_70px_50px_1fr_50px] gap-1 px-3 py-1.5 text-[7px] font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100">
              <span>Time &amp; Type</span><span>Caller</span><span>Agent</span><span>Duration</span><span>AI Summary &amp; Action</span><span>Recording</span>
            </div>
            {[
              { time: "10:45 AM", type: "Incoming", icon: "✓", iconColor: "text-emerald-500", caller: "Anusha Rao", phone: "+9198490 12345", agent: "VIRTUAL AGENT", agentColor: "bg-teal-500 text-white", duration: "2m 14s", summary: '"Rescheduled follow-up to Thursday 3 PM due to conflict."', tags: ["APPT CONFIRMED", "Schedule Updated"] },
              { time: "10:32 AM", type: "Outgoing", icon: "↗", iconColor: "text-blue-500", caller: "Srinivas Reddy", phone: "+9198890 54321", agent: "RECEPTIONIST (LP)", agentColor: "bg-slate-200 text-slate-600", duration: "4m 02s", summary: '"Called to confirm insurance details for surgery tomorrow."', tags: ["ADMIN FOLLOW-UP"] },
              { time: "10:15 AM", type: "Missed", icon: "↘", iconColor: "text-red-500", caller: "Unknown Caller", phone: "+9196000 88990", agent: "NONE", agentColor: "bg-slate-100 text-slate-400", duration: "0s", summary: "", tags: ["RETURN CALL"] },
              { time: "09:12 AM", type: "Incoming", icon: "✓", iconColor: "text-emerald-500", caller: "Priya Kavuri", phone: "+9198888 22710", agent: "VIRTUAL AGENT", agentColor: "bg-teal-500 text-white", duration: "3m 22s", summary: '"New patient booking. Collected insurance info and DOB."', tags: ["NEW PATIENT REGISTERED", "Schedule Updated"] },
            ].map((row) => (
              <div key={row.time + row.caller} className="grid grid-cols-[60px_80px_70px_50px_1fr_50px] items-center gap-1 px-3 py-2 border-b border-slate-50 text-[8px]">
                <div>
                  <div className="flex items-center gap-0.5"><span className={`text-[9px] font-bold ${row.iconColor}`}>{row.icon}</span><span className="font-medium text-slate-700">{row.time}</span></div>
                  <span className={`text-[7px] ${row.type === "Missed" ? "text-red-500 font-semibold" : "text-slate-400"}`}>{row.type}</span>
                </div>
                <div>
                  <p className="font-medium text-slate-700 truncate">{row.caller}</p>
                  <p className="text-slate-400 text-[7px]">{row.phone}</p>
                </div>
                <span className={`rounded px-1.5 py-0.5 text-[7px] font-semibold w-fit ${row.agentColor}`}>{row.agent}</span>
                <span className="text-slate-600">{row.duration}</span>
                <div>
                  {row.summary && <p className="text-slate-600 italic mb-0.5 truncate">{row.summary}</p>}
                  <div className="flex flex-wrap gap-0.5">
                    {row.tags.map(tag => (
                      <span key={tag} className="rounded bg-teal-50 px-1 py-0.5 text-[6px] font-semibold text-teal-700 border border-teal-200">{tag}</span>
                    ))}
                  </div>
                </div>
                <span className="text-teal-500 text-[8px]">{row.duration !== "0s" ? "▶" : "—"}</span>
              </div>
            ))}
          </div>

          {/* Efficiency */}
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-semibold text-slate-700">Daily Handling Efficiency</span>
              <div className="flex items-center gap-2 text-[7px]">
                <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-teal-500" />Virtual Agent</span>
                <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-slate-800" />Human Staff</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between text-[8px] mb-0.5"><span className="text-slate-500">Virtual Agent Workload</span><span className="font-semibold text-teal-600">84% (107 CALLS)</span></div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-teal-500" style={{ width: "84%" }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-[8px] mb-0.5"><span className="text-slate-500">Human Staff Intervention</span><span className="font-semibold text-slate-600">16% (21 CALLS)</span></div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-slate-800" style={{ width: "16%" }} /></div>
              </div>
            </div>
            <p className="mt-2 text-center text-[8px] text-slate-500">The Virtual Agent has successfully automated approximately <span className="font-semibold text-slate-700">4.2 hours</span> of manual call time today.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero({ onOpenForm }: { onOpenForm: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Effortless", "Intelligent", "Always-On", "Automated", "Modern"],
    []
  );

  useEffect(() => {
    const id = setTimeout(() => {
      setTitleNumber((n) => (n === titles.length - 1 ? 0 : n + 1));
    }, 2200);
    return () => clearTimeout(id);
  }, [titleNumber, titles]);

  return (
    <AuroraBackground
      className="h-auto items-start justify-start overflow-hidden px-6 pb-20 pt-32 md:pt-40"
      showRadialGradient
    >
      {/* Decorative elements */}
      <div className="pointer-events-none absolute left-10 top-32 size-24 rounded-2xl border-2 border-emerald-200/40 opacity-60"></div>
      <div className="pointer-events-none absolute right-20 top-40 size-16 rounded-xl border-2 border-green-200/40 opacity-50"></div>
      <div className="pointer-events-none absolute bottom-20 left-1/4 size-20 rounded-2xl bg-emerald-100/20"></div>

      <div className="mx-auto max-w-7xl w-full">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:pt-8"
          >
            <h1 className="mb-6 text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
              <span className="block">
                <span className="relative inline-flex overflow-hidden">
                  {titles.map((title, index) => (
                    <motion.span
                      key={index}
                      className="absolute left-0 top-0 bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 80 }}
                      transition={{ type: "spring", stiffness: 60, damping: 18 }}
                      animate={
                        titleNumber === index
                          ? { y: 0, opacity: 1 }
                          : { y: titleNumber > index ? -80 : 80, opacity: 0 }
                      }
                    >
                      {title}
                    </motion.span>
                  ))}
                  <span className="invisible">Intelligent</span>
                </span>{" "}
                Receptionists
              </span>
              <span className="block">for Modern Clinics</span>
            </h1>
            <p className="mb-8 max-w-xl text-xl leading-relaxed text-muted-foreground">
              AI voice agents that answer patient calls, schedule appointments, and automate clinic workflows.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  onClick={onOpenForm}
                  className="rounded-xl bg-linear-to-br from-emerald-600 to-green-600 px-8 py-6 text-base font-medium text-white shadow-lg hover:from-emerald-700 hover:to-green-700 hover:shadow-xl"
                >
                  Book a Demo
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Realistic Admin UI Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Browser chrome */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              {/* Browser bar */}
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                <div className="size-2.5 rounded-full bg-red-400" />
                <div className="size-2.5 rounded-full bg-yellow-400" />
                <div className="size-2.5 rounded-full bg-green-400" />
                <div className="mx-auto flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] text-slate-400">
                  <span className="text-slate-300">🔒</span> app.auvia.ai/dashboard
                </div>
              </div>

              {/* Tab switcher */}
              <div className="flex border-b border-slate-100 bg-white">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium transition-colors ${
                      activeTab === tab ? "text-emerald-700" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab === "Dashboard" && <LayoutDashboard className="size-3" />}
                    {tab === "Schedule" && <Calendar className="size-3" />}
                    {tab === "Calls & Logs" && <Phone className="size-3" />}
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Screen content */}
              <div className="h-[420px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {activeTab === "Dashboard" && <DashboardScreen />}
                    {activeTab === "Schedule" && <ScheduleScreen />}
                    {activeTab === "Calls & Logs" && <CallsLogsScreen />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -right-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-xl"
            >
              <div className="size-2 animate-pulse rounded-full bg-emerald-400" />
              <div>
                <p className="text-[10px] font-semibold text-slate-700">84 calls handled by AI</p>
                <p className="text-[9px] text-slate-400">today • 98.5% answered</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
}
