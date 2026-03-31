"use client";

import { useState } from "react";
import { useDoctorDetails } from "../hooks/useDoctorDetails";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertCircle, Users, Clock, Edit2, Trash2, Loader2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import EditScheduleModal from "./EditScheduleModal";
import EditTimeOffModal from "./EditTimeOffModal";
import AddScheduleModal from "./AddScheduleModal";
import AddTimeOffModal from "./AddTimeOffModal";
import { doctorsApi } from "../lib/api";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime(timeStr) {
  if (!timeStr) return { time: "--:--", period: "" };
  const [h, m] = timeStr.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour = h % 12 || 12;
  return {
    time: `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    period,
  };
}

function formatDateRange(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const startStr = start.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endStr = end.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startStr} - ${endStr}`;
}

export default function DoctorDetailsCard({ doctorId }) {
  const { doctor, schedules, timeOffs, loading, error, refetch } = useDoctorDetails(doctorId);

  // Modal state
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editScheduleOpen, setEditScheduleOpen] = useState(false);
  const [editingTimeOff, setEditingTimeOff] = useState(null);
  const [editTimeOffOpen, setEditTimeOffOpen] = useState(false);
  const [addScheduleOpen, setAddScheduleOpen] = useState(false);
  const [addTimeOffOpen, setAddTimeOffOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showAllTimeOffs, setShowAllTimeOffs] = useState(false);

  if (!doctorId || doctorId === "all") {
    return null;
  }

  // Create a map of day -> schedule
  const scheduleMap = {};
  schedules.forEach((schedule) => {
    const day = DAYS_OF_WEEK[schedule.day_of_week];
    scheduleMap[day] = schedule;
  });

  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    setDeleting(scheduleId);
    setDeleteError(null);
    try {
      await doctorsApi.deleteSchedule(doctorId, scheduleId);
      refetch();
    } catch (err) {
      setDeleteError(err.message || "Failed to delete schedule");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteTimeOff = async (timeOffId) => {
    if (!confirm("Are you sure you want to delete this time-off period?")) return;
    setDeleting(timeOffId);
    setDeleteError(null);
    try {
      await doctorsApi.deleteTimeOff(doctorId, timeOffId);
      refetch();
    } catch (err) {
      setDeleteError(err.message || "Failed to delete time-off");
    } finally {
      setDeleting(null);
    }
  };

  const openEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setEditScheduleOpen(true);
  };

  const openEditTimeOff = (timeOff) => {
    setEditingTimeOff(timeOff);
    setEditTimeOffOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Doctor Info Card */}
      <Card className="border-slate-100 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Doctor Information</p>
              <p className="text-xs text-slate-400">
                {loading ? "Loading…" : doctor ? doctor.name : "—"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <div className="h-6 animate-pulse rounded bg-slate-100 w-1/3" />
              <div className="h-4 animate-pulse rounded bg-slate-100 w-2/3" />
              <div className="h-4 animate-pulse rounded bg-slate-100 w-1/2" />
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={refetch}
                  className="mt-2 text-xs underline text-red-600 hover:text-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : doctor ? (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{doctor.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{doctor.speciality}</p>
                </div>
                <Badge variant={doctor.is_active ? "success" : "warning"}>
                  {doctor.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Consultation Duration</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{doctor.consultation_duration_minutes} min</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Buffer Time</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{doctor.buffer_time_minutes} min</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Max Appointments/Day</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {doctor.max_appointments_per_day || "Unlimited"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No doctor data available</p>
          )}
        </CardContent>
      </Card>

      {/* Weekly Schedule Card */}
      <Card className="border-slate-100 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Weekly Schedule</p>
              <p className="text-xs text-slate-400">
                {loading ? "Loading…" : `${schedules.length} day${schedules.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setAddScheduleOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={loading}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Schedule
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {DAYS_OF_WEEK.map((day) => {
                const schedule = scheduleMap[day];
                const { time: startTime, period: startPeriod } = formatTime(schedule?.start_time);
                const { time: endTime, period: endPeriod } = formatTime(schedule?.end_time);

                return (
                  <div
                    key={day}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-700 block mb-1">{day}</span>
                      {schedule ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-600">
                            {startTime} {startPeriod} - {endTime} {endPeriod}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({schedule.slot_duration_minutes}m slots)
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </div>
                    {schedule && (
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => openEditSchedule(schedule)}
                          disabled={deleting === schedule.id}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors disabled:opacity-50"
                          title="Edit schedule"
                        >
                          {deleting === schedule.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Edit2 className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          disabled={deleting === schedule.id}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete schedule"
                        >
                          {deleting === schedule.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Off Card */}
      <Card className="border-slate-100 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Time Off Periods</p>
              <p className="text-xs text-slate-400">
                {loading ? "Loading…" : `${timeOffs.length} period${timeOffs.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setAddTimeOffOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
            disabled={loading}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Time Off
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          ) : timeOffs.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No time off scheduled</p>
          ) : (
            <div className="space-y-3">
              {deleteError && (
                <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                  <p className="text-xs text-red-700">{deleteError}</p>
                </div>
              )}
              {(showAllTimeOffs ? timeOffs : timeOffs.slice(0, 3)).map((timeOff, idx) => (
                <div
                  key={timeOff.id || idx}
                  className="flex items-start justify-between px-3 py-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">
                      {formatDateRange(timeOff.start_time, timeOff.end_time)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{timeOff.reason || "No reason specified"}</p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => openEditTimeOff(timeOff)}
                      disabled={deleting === timeOff.id}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors disabled:opacity-50"
                      title="Edit time-off"
                    >
                      {deleting === timeOff.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Edit2 className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteTimeOff(timeOff.id)}
                      disabled={deleting === timeOff.id}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Delete time-off"
                    >
                      {deleting === timeOff.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {timeOffs.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllTimeOffs(!showAllTimeOffs)}
                  className="w-full mt-2 text-amber-600 hover:bg-amber-50"
                >
                  {showAllTimeOffs ? "Show Less" : `View All ${timeOffs.length} Periods`}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modals */}
      <EditScheduleModal
        open={editScheduleOpen}
        onOpenChange={setEditScheduleOpen}
        schedule={editingSchedule}
        doctorId={doctorId}
        onUpdate={refetch}
      />

      <EditTimeOffModal
        open={editTimeOffOpen}
        onOpenChange={setEditTimeOffOpen}
        timeOff={editingTimeOff}
        doctorId={doctorId}
        onUpdate={refetch}
      />

      {/* Add Modals */}
      <AddScheduleModal
        open={addScheduleOpen}
        onOpenChange={setAddScheduleOpen}
        doctorId={doctorId}
        onAdded={refetch}
      />

      <AddTimeOffModal
        open={addTimeOffOpen}
        onOpenChange={setAddTimeOffOpen}
        doctorId={doctorId}
        onAdded={refetch}
      />
    </div>
  );
}
