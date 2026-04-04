"use client";

import { useState, useEffect, useRef } from "react";

export function useLiveActivity() {
  const [activities, setActivities] = useState([]);
  const [wsStatus, setWsStatus]     = useState("connecting");
  const wsRef          = useRef(null);
  const reconnectTimer = useRef(null);
  const mountedRef     = useRef(false);
  const retryCount     = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    const clinicId = localStorage.getItem("auvia_clinic_id") || "";

    fetch(`/api/activity?limit=15&clinic_id=${clinicId}`)
      .then((r) => r.json())
      .then((json) => { if (json.success && mountedRef.current) setActivities(json.data); })
      .catch(() => {});

    function connectWs() {
      if (!mountedRef.current) return;
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      const proto  = window.location.protocol === "https:" ? "wss" : "ws";
      const wsHost = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
      const ws     = new WebSocket(`${proto}://${wsHost}/ws/activity`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) { ws.close(); return; }
        setWsStatus("open");
        retryCount.current = 0;
        clearTimeout(reconnectTimer.current);
      };
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "activity" && mountedRef.current)
            setActivities((prev) => [msg.data, ...prev].slice(0, 20));
        } catch (_) {}
      };
      const scheduleReconnect = () => {
        if (!mountedRef.current) return;
        setWsStatus("closed");
        const delay = Math.min(3_000 * Math.pow(2, retryCount.current), 30_000);
        retryCount.current += 1;
        reconnectTimer.current = setTimeout(connectWs, delay);
      };
      ws.onclose = scheduleReconnect;
      ws.onerror = () => { ws.onclose = null; ws.close(); scheduleReconnect(); };
    }

    const initTimer = setTimeout(connectWs, 150);
    return () => {
      mountedRef.current = false;
      clearTimeout(initTimer);
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return { activities, wsStatus };
}
