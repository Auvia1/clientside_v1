"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { patientsApi } from "../lib/api";

// Helper: Get initials from name
function initials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Helper: Format relative date
function relativeDate(dateStr) {
  if (!dateStr) return "No visits yet";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 30) return `${diff} days ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

export default function ViewAllPatientsPage() {
  const [activeMonitoring, setActiveMonitoring] = useState(true);
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 20;

  // Ensure component only hydrates on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch all patients from clinic
  const fetchAllPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all patients from the clinic using search API
      // The search API returns patients for the authenticated clinic
      const patients = await patientsApi.search("", 1000);

      console.log("Fetched patients (raw):", patients);
      console.log("Total patients (raw):", patients?.length || 0);

      // Ensure we have an array
      let patientsArray = Array.isArray(patients) ? patients : [];

      // Deduplicate patients by ID
      const seenIds = new Set();
      patientsArray = patientsArray.filter((patient) => {
        if (seenIds.has(patient.id)) {
          console.warn("Duplicate patient ID found:", patient.id);
          return false;
        }
        seenIds.add(patient.id);
        return true;
      });

      console.log("Total patients (after dedup):", patientsArray.length);

      setAllPatients(patientsArray);
      setFilteredPatients(patientsArray);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError(err.message || "Failed to load patients");
      setAllPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isClient) {
      fetchAllPatients();
    }
  }, [isClient]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    if (query.trim()) {
      const filtered = allPatients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(query.toLowerCase()) ||
          patient.phone.includes(query)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(allPatients);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const endIndex = startIndex + patientsPerPage;
  const displayedPatients = filteredPatients.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
        <Sidebar />
        <main className="flex flex-col gap-6 px-8 py-6">
          <Navbar
            activeMonitoring={activeMonitoring}
            onToggleMonitoring={setActiveMonitoring}
          />

          {!isClient ? (
            <div className="space-y-6">
              <div className="h-10 bg-slate-200 animate-pulse rounded" />
              <div className="h-40 bg-slate-200 animate-pulse rounded" />
            </div>
          ) : (
            <>
              {/* Back button */}
              <div>
                <Link href="/schedule">
                  <Button variant="ghost" className="gap-2 -ml-4">
                    <FiArrowLeft /> Back to Schedule
                  </Button>
                </Link>
              </div>

              {/* Header */}
              <div>
                <h1 className="text-2xl font-semibold">All Patients</h1>
                <p className="text-sm text-slate-500">
                  Manage and view all patients in your clinic
                </p>
              </div>

              {/* Search Card */}
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="pt-6">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-3 text-slate-400" />
                    <Input
                      className="h-10 rounded-lg border-slate-200 pl-10 text-sm"
                      placeholder="Search by name or phone..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                    {loading && (
                      <FiLoader className="absolute right-3 top-3 animate-spin text-slate-400" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Error state */}
              {error && (
                <Card className="border-red-100 bg-red-50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-red-700 flex items-center gap-2">
                      <FiAlertCircle /> {error}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Patients List */}
              <Card className="border-slate-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      All Patients{" "}
                      <span className="text-sm font-normal text-slate-500">
                        ({filteredPatients.length} total)
                      </span>
                    </span>
                    {displayedPatients.length > 0 && (
                      <span className="text-sm font-normal text-slate-500">
                        Page {currentPage} of {totalPages}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-16 bg-slate-200 animate-pulse rounded-lg"
                        />
                      ))}
                    </div>
                  ) : displayedPatients.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">
                      {searchQuery
                        ? "No patients found matching your search."
                        : "No patients available."}
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {displayedPatients.map((patient) => (
                          <div
                            key={patient.id}
                            className="flex items-center gap-4 rounded-lg border border-slate-100 px-4 py-3 hover:bg-slate-50 transition-colors"
                          >
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-sm font-semibold text-blue-700 shrink-0">
                              {initials(patient.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-700">
                                {patient.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {patient.phone} • {relativeDate(patient.last_visit)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="secondary" className="text-xs">
                                {patient.total_appointments} visits
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="gap-2"
                          >
                            <FiChevronLeft className="w-4 h-4" />
                            Previous
                          </Button>

                          <span className="text-sm text-slate-600 font-medium">
                            Page {currentPage} of {totalPages}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="gap-2"
                          >
                            Next
                            <FiChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
