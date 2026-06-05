"use client";

import { useState, useCallback } from "react";
import { creditsApi } from "../lib/api";

function getClinicId() {
  return typeof window !== "undefined" ? localStorage.getItem("auvia_clinic_id") || "" : "";
}

export function useCreditsTransactions(type = null) {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async (page = 1, limit = 20) => {
    const clinicId = getClinicId();
    if (!clinicId) {
      setError("Clinic ID not found");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const response = await creditsApi.getTransactions(clinicId, {
        type,
        page,
        limit,
      });

      // The request() function returns data.data, which contains { data: [...], pagination: {...} }
      if (response && typeof response === 'object') {
        setTransactions(response.data || []);
        setPagination(response.pagination || { page, limit, total: 0, totalPages: 0 });
      } else {
        setTransactions([]);
        setPagination({ page, limit, total: 0, totalPages: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch credit transactions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [type]);

  return {
    transactions,
    pagination,
    loading,
    error,
    fetchTransactions,
  };
}
