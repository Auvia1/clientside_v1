"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertCircle, Loader2, Phone, Calendar, User, Stethoscope, MapPin } from "lucide-react";
import { patientsApi } from "../lib/api";

export default function PatientDetailsDialog({ open, onOpenChange, patient }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !patient) return;

    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await patientsApi.getAppointments(patient.id, { limit: 100 });
        // Sort by appointment_start DESC (newest first)
        const sorted = (data || []).sort((a, b) => {
          return new Date(b.appointment_start) - new Date(a.appointment_start);
        });
        setAppointments(sorted);
      } catch (err) {
        setError(err.message || "Failed to load appointments");
        console.error("Error fetching patient appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [open, patient]);

  if (!patient) return null;

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      case "no_show":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "rescheduled":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  // Format appointment time
  const formatDateTime = (isoString) => {
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex items-start justify-between">
          <div>
            <DialogTitle>Patient Details</DialogTitle>
          </div>
          <DialogClose className="text-slate-500 hover:text-slate-700" />
        </DialogHeader>

        {/* Patient Info Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                  {patient.name
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-lg">{patient.name}</p>
                  <p className="text-sm text-slate-600">Patient ID: {patient.id.slice(0, 8)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Phone</p>
                    <p className="text-sm text-slate-900">{patient.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Total Appointments</p>
                    <p className="text-sm text-slate-900">{patient.total_appointments}</p>
                  </div>
                </div>
              </div>

              {patient.last_visit && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Last Visit</p>
                    <p className="text-sm text-slate-900">
                      {new Date(patient.last_visit).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appointments Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Appointment History
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({appointments.length})
              </span>
            </h3>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setError(null);
                    // Re-fetch on retry
                    if (patient) {
                      const fetchAppointments = async () => {
                        setLoading(true);
                        try {
                          const data = await patientsApi.getAppointments(patient.id, { limit: 100 });
                          const sorted = (data || []).sort(
                            (a, b) => new Date(b.appointment_start) - new Date(a.appointment_start)
                          );
                          setAppointments(sorted);
                        } catch (err) {
                          setError(err.message || "Failed to load appointments");
                        } finally {
                          setLoading(false);
                        }
                      };
                      fetchAppointments();
                    }
                  }}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-slate-500">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="text-center py-8">
                <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-600">No appointments found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {/* Top row: Date/Time and Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <Calendar className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {formatDateTime(appointment.appointment_start)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {appointment.appointment_end &&
                                `Duration: ${new Date(appointment.appointment_end).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}`}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(appointment.status)} border`}>
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1).replace("_", " ")}
                        </Badge>
                      </div>

                      {/* Doctor and Clinic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-7">
                        <div className="flex items-start gap-2">
                          <Stethoscope className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-500 uppercase">Doctor</p>
                            <p className="text-sm text-slate-900 font-medium break-words">
                              {appointment.doctor_name}
                            </p>
                            {appointment.doctor_speciality && (
                              <p className="text-xs text-slate-600">{appointment.doctor_speciality}</p>
                            )}
                          </div>
                        </div>

                        {appointment.clinic_name && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-slate-500 uppercase">Clinic</p>
                              <p className="text-sm text-slate-900 font-medium break-words">
                                {appointment.clinic_name}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Reason */}
                      {appointment.reason && (
                        <div className="ml-7">
                          <p className="text-xs font-medium text-slate-500 uppercase mb-1">Reason</p>
                          <p className="text-sm text-slate-700 bg-slate-50 rounded px-2 py-1.5">
                            {appointment.reason}
                          </p>
                        </div>
                      )}

                      {/* Payment Info */}
                      {appointment.payment_amount && (
                        <div className="ml-7 pt-2 border-t border-slate-200 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Payment</p>
                            <p className="text-sm text-slate-900 font-semibold">
                              ₹{parseFloat(appointment.payment_amount).toLocaleString("en-IN", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                          {appointment.payment_status && (
                            <Badge
                              variant={
                                appointment.payment_status === "paid" ? "default" : "secondary"
                              }
                            >
                              {appointment.payment_status.charAt(0).toUpperCase() +
                                appointment.payment_status.slice(1)}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
