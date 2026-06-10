"use client";

import { useState, useCallback } from "react";
import { creditsApi } from "../lib/api";

function getClinicId() {
  return typeof window !== "undefined" ? localStorage.getItem("auvia_clinic_id") || "" : "";
}

export function usePaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPayments = useCallback(async (page = 1, limit = 20, filters = {}) => {
    const clinicId = getClinicId();
    if (!clinicId) {
      setError("Clinic ID not found");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const response = await creditsApi.getPayments(clinicId, {
        ...filters,
        page,
        limit,
      });

      if (Array.isArray(response)) {
        setPayments(response);
        setPagination({ page, limit, total: response.length, totalPages: 1 });
      } else if (response && typeof response === 'object') {
        setPayments(response.data || response || []);
        setPagination(response.pagination || { page, limit, total: 0, totalPages: 0 });
      } else {
        setPayments([]);
        setPagination({ page, limit, total: 0, totalPages: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch payment history:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    payments,
    pagination,
    loading,
    error,
    fetchPayments,
  };
}
