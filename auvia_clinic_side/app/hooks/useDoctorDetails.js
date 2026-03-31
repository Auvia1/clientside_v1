import { useState, useEffect } from "react";
import { doctorsApi } from "../lib/api";

export function useDoctorDetails(doctorId) {
  const [doctor, setDoctor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [timeOffs, setTimeOffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    if (!doctorId || doctorId === "all") {
      setDoctor(null);
      setSchedules([]);
      setTimeOffs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [doctorData, scheduleData, timeOffData] = await Promise.all([
        doctorsApi.get(doctorId),
        doctorsApi.getSchedule(doctorId),
        doctorsApi.getTimeOff(doctorId),
      ]);

      console.log("Doctor Details Loaded:", { doctorData, scheduleData, timeOffData });

      setDoctor(doctorData || null);
      setSchedules(Array.isArray(scheduleData) ? scheduleData : []);
      setTimeOffs(Array.isArray(timeOffData) ? timeOffData : []);
    } catch (err) {
      console.error("Failed to load doctor details:", err);
      setError(err.message || "Failed to load doctor details");
      setDoctor(null);
      setSchedules([]);
      setTimeOffs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [doctorId]);

  return {
    doctor,
    schedules,
    timeOffs,
    loading,
    error,
    refetch: fetchDetails,
  };
}
