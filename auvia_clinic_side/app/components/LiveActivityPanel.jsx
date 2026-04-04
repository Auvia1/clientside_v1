"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { FiActivity } from "react-icons/fi";
import { useLiveActivity } from "../hooks/useLiveActivity";

const IST = "Asia/Kolkata";

// ─── Helper Functions ─────────────────────────────────────────────────────

function activityAge(createdAt) {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function activityDot(type) {
  return {
    agent_booking:  "bg-emerald-400",
    manual_booking: "bg-sky-400",
    completion:     "bg-emerald-500",
    active_call:    "bg-amber-400 animate-pulse",
    cancellation:   "bg-red-400",
    reschedule:     "bg-violet-400",
  }[type] || "bg-slate-300";
}

function activityTypeLabel(type) {
  return {
    agent_booking:  "Agent booked",
    manual_booking: "Receptionist booked",
    completion:     "Completed",
    active_call:    "Active call",
    cancellation:   "Cancelled",
    reschedule:     "Rescheduled",
  }[type] || type;
}

function metaSubline(meta) {
  if (!meta) return null;
  const obj = typeof meta === "string" ? JSON.parse(meta) : meta;
  if (obj.appointment_start) {
    try {
      return new Date(obj.appointment_start).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", hour12: true, timeZone: IST,
      });
    } catch (_) {}
  }
  if (obj.doctor_name) return `Dr. ${obj.doctor_name}`;
  return null;
}

// ─── LiveActivityPanel ────────────────────────────────────────────────────

export default function LiveActivityPanel() {
  const { activities, wsStatus } = useLiveActivity();

  return (
    <Card className="border-slate-100 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Live Activity</CardTitle>
          <Badge variant={wsStatus === "open" ? "success" : "warning"} className="text-[9px]">
            {wsStatus === "open" ? "Live" : "Reconnecting…"}
          </Badge>
        </div>
        <FiActivity className={`h-4 w-4 ${wsStatus === "open" ? "text-emerald-500" : "text-slate-300"}`} />
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No recent activity yet.</p>
        ) : (
          activities.map((item) => {
            const sub = metaSubline(item.meta);
            return (
              <div key={item.id} className="flex gap-3 items-start">
                <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${activityDot(item.event_type)}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <span>{activityAge(item.created_at)}</span>
                    <span className="inline-block h-1 w-1 rounded-full bg-slate-200" />
                    <span className="font-medium">{activityTypeLabel(item.event_type)}</span>
                  </p>
                  <p className="text-sm text-slate-700 leading-snug">{item.title}</p>
                  {sub && <p className="text-xs text-slate-400 truncate">{sub}</p>}
                </div>
              </div>
            );
          })
        )}
        <Button className="w-full bg-slate-800 text-white hover:bg-slate-700">Return Call</Button>
      </CardContent>
    </Card>
  );
}
