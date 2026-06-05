"use client";

import { useState, useEffect, useCallback } from "react";
import { creditsApi } from "../lib/api";

export function useCreditsPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPackages = useCallback(async () => {
    try {
      setError(null);
      const data = await creditsApi.getPackages();
      setPackages(data || []);
    } catch (err) {
      console.error("Failed to fetch credit packages:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return { packages, loading, error, refetch: fetchPackages };
}
