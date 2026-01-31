import { useEffect, useState, useCallback } from "react";
import { API_AUTH_URL } from "src/app/constants";
import { authHeaders } from "src/authentication/authentication-api";
import { useAuthentication } from "src/authentication/use-authentication";

export function useCalendarIntegration() {
  const { isAuthenticated } = useAuthentication();

  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!isAuthenticated) {
      setConnected(false);
      setLoading(false);
      return false;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_AUTH_URL}/google/calendar/status`,
        { headers: await authHeaders() }
      );

      if (!res.ok) {
        // 401 / 403 → treat as not connected
        setConnected(false);
        return false;
      }

      const data = await res.json();
      const isConnected = Boolean(data?.connected);

      setConnected(isConnected);
      return isConnected;
    } catch (err) {
      console.error("Calendar status check failed:", err);
      setConnected(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStatus();
    } else {
      // logout cleanup
      setConnected(false);
      setLoading(false);
    }
  }, [isAuthenticated, fetchStatus]);

  return {
    connected,
    loading,
    refreshStatus: fetchStatus,
  };
}
