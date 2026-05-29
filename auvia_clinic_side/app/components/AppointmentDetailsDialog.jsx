"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, Stethoscope, MapPin, Phone, User, IndianRupee, Hash, Loader2, AlertCircle } from "lucide-react";
import { appointmentsApi } from "../lib/api";
import { useState, useEffect } from "react";

export default function AppointmentDetailsDialog({ open, onOpenChange, appointment: initialAppointment, onViewPatient }) {
  const [appointment, setAppointment] = useState(initialAppointment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && initialAppointment?.id) {
      // Set initial data immediately so the dialog isn't empty while loading
      setAppointment(initialAppointment);
      setLoading(true);
      setError(null);
      
      appointmentsApi.get(initialAppointment.id)
        .then((data) => {
          setAppointment(data);
        })
        .catch((err) => {
          console.error("Failed to fetch full appointment details:", err);
          setError("Could not load full appointment details. Showing partial data.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, initialAppointment]);

  if (!appointment) return null;

  // Get status badge color matching website theme
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "confirmed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "no_show":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "rescheduled":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Format appointment time
  const formatDateTime = (isoString) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex items-start justify-between pb-3 border-b border-slate-100">
          <DialogTitle className="text-sm font-semibold text-slate-900">Appointment Details</DialogTitle>
          <DialogClose className="text-slate-400 hover:text-slate-600 transition-colors" />
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {error && (
            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-md border border-amber-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Status and Time */}
          <div className="flex flex-col gap-3 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px] rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Badge className={`${getStatusColor(appointment.status)} border text-xs px-2.5 py-0.5`}>
                {appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace("_", " ") : "Unknown"}
              </Badge>
              {appointment.token_number && (
                <div className="flex items-center gap-1 text-sm font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                  <Hash className="h-3 w-3" />
                  {appointment.token_number}
                </div>
              )}
            </div>
            
            <Card className="border-slate-100 shadow-sm bg-slate-50/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Schedule</p>
                    <p className="text-sm font-medium text-slate-900">
                      {formatDateTime(appointment.appointment_start)}
                    </p>
                    {appointment.appointment_end && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Until {new Date(appointment.appointment_end).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                {/* Patient Info */}
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Patient</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{appointment.patient_name || "Unknown Patient"}</p>
                        {appointment.patient_phone && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" /> {appointment.patient_phone}
                          </p>
                        )}
                      </div>
                      {onViewPatient && appointment.patient_id && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => onViewPatient(appointment.patient_id)}
                        >
                          View Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4 space-y-4">
                {/* Doctor and Clinic Info */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Stethoscope className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Doctor</p>
                      <p className="text-sm font-medium text-slate-900">
                        {appointment.doctor_name ? `Dr. ${appointment.doctor_name}` : "—"}
                      </p>
                      {appointment.doctor_speciality && (
                        <p className="text-xs text-slate-500">{appointment.doctor_speciality}</p>
                      )}
                    </div>
                  </div>

                  {appointment.clinic_name && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Clinic</p>
                        <p className="text-sm font-medium text-slate-900">{appointment.clinic_name}</p>
                      </div>
                    </div>
                  )}
                </div>

                {appointment.reason && (
                  <>
                    <div className="h-px bg-slate-100 w-full" />
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Reason for Visit</p>
                      <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 border border-slate-100">
                        {appointment.reason}
                      </div>
                    </div>
                  </>
                )}

                {appointment.payment_amount && (
                  <>
                    <div className="h-px bg-slate-100 w-full" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Payment</p>
                          <p className="text-sm font-semibold text-slate-900">
                            ₹{parseFloat(appointment.payment_amount).toLocaleString("en-IN", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                      {appointment.payment_status && (
                        <Badge
                          className={`text-[10px] ${
                            appointment.payment_status === "paid"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {appointment.payment_status.charAt(0).toUpperCase() +
                            appointment.payment_status.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex gap-3 pt-3 mt-2 border-t border-slate-100">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full h-9">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
