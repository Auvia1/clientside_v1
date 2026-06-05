"use client";

import { useState, useEffect, useCallback } from "react";
import { creditsApi } from "../lib/api";

function getClinicId() {
  return typeof window !== "undefined" ? localStorage.getItem("auvia_clinic_id") || "" : "";
}

export function useCreditsBalance() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBalance = useCallback(async () => {
    const clinicId = getClinicId();
    if (!clinicId) {
      setError("Clinic ID not found");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await creditsApi.getBalance(clinicId);
      setBalance(data);
    } catch (err) {
      console.error("Failed to fetch credit balance:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 60000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return { balance, loading, error, refetch: fetchBalance };
}

export function useCreditssSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    const clinicId = getClinicId();
    if (!clinicId) {
      setError("Clinic ID not found");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await creditsApi.getSummary(clinicId);
      setSummary(data);
    } catch (err) {
      console.error("Failed to fetch credit summary:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}
