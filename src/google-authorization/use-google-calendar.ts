import { useEffect, useState, useCallback } from "react";
import { API_AUTH_URL } from "src/app/constants";
import { authHeaders } from "src/authentication/authentication-api";
import { useAuthentication } from "src/authentication/use-authentication";
import {
    readCalendarCache,
    writeCalendarCache,
    clearCalendarCache,
} from "./google-calendar-cache";

export function useCalendarIntegration() {
    const { isAuthenticated } = useAuthentication();
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchStatus = useCallback(
        async (opts?: { force?: boolean }) => {
            if (!isAuthenticated) {
                setConnected(false);
                setLoading(false);
                return false;
            }

            if (!opts?.force) {
                const cached = readCalendarCache();
                if (cached !== null) {
                    setConnected(cached);
                    return cached;
                }
            }

            setLoading(true);

            try {
                const res = await fetch(
                    `${API_AUTH_URL}/google/calendar/status`,
                    { headers: await authHeaders() }
                );

                const isConnected =
                    res.ok && Boolean((await res.json())?.connected);

                setConnected(isConnected);
                writeCalendarCache(isConnected);
                return isConnected;
            } catch (err) {
                console.error("Calendar status check failed:", err);
                setConnected(false);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated]
    );

    const disconnectCalendar = useCallback(async () => {
        if (!isAuthenticated) return;

        setLoading(true);

        try {
            await fetch(
                `${API_AUTH_URL}/auth/google/calendar/disconnect`,
                {
                    method: "POST",
                    headers: await authHeaders(),
                }
            );
        } catch (err) {
            console.error("Calendar disconnect failed:", err);
        } finally {
            setConnected(false);
            clearCalendarCache();
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchStatus();
        } else {
            setConnected(false);
            setLoading(false);
            clearCalendarCache();
        }
    }, [isAuthenticated, fetchStatus]);

    return {
        connected,
        loading,
        refreshStatus: () => fetchStatus({ force: true }),
        disconnectCalendar,
    };
}
