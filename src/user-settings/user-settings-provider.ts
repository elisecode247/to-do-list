import {
    createElement,
    useCallback,
    useEffect,
    useState,
    useMemo,
    type ReactNode,
} from "react";
import { API_URL } from "src/app/constants";
import { authHeaders } from "src/authentication/authentication-api";
import { useAuthentication } from "src/authentication/use-authentication";
import { useToast } from "src/toast/use-toast";
import { UserSettingsContext, type UserSettingsContextValue } from "./user-settings-context";

export function UserSettingsProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuthentication();
    const [googleCalendarEnabled, setGoogleCalendarEnabled] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        setIsLoadingSettings(true);
        let isCancelled = false;

        async function loadUserSettings() {
            try {
                const response = await fetch(`${API_URL}/user-settings`, {
                    method: "GET",
                    headers: await authHeaders(),
                });

                if (!response.ok) {
                    throw new Error(`Failed to load user settings: ${response.status}`);
                }

                const settings = await response.json();
                const nextEnableCalendar = settings?.googleCalendarEnabled ?? settings?.userSettings?.googleCalendarEnabled;

                if (!isCancelled && typeof nextEnableCalendar === "boolean") {
                    setGoogleCalendarEnabled(nextEnableCalendar);
                }

                if (!isCancelled) {
                    setIsLoadingSettings(false);
                }
            } catch (err) {
                console.error("Loading user settings failed:", err);
                showToast('Failed to load user settings. Please refresh the page.', 'error');
                if (!isCancelled) {
                    setIsLoadingSettings(false);
                }
            }
        }

        void loadUserSettings();

        return () => {
            isCancelled = true;
        };
    }, [isAuthenticated, showToast]);

    const updateEnableCalendar = useCallback(async (nextValue: boolean) => {

        try {
            const response = await fetch(`${API_URL}/user-settings`, {
                method: "PUT",
                headers: await authHeaders(),
                body: JSON.stringify({ googleCalendarEnabled: nextValue }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update user settings: ${response.status}`);
            }
            const updatedSettings = await response.json();
            setGoogleCalendarEnabled(updatedSettings?.googleCalendarEnabled ?? updatedSettings?.userSettings?.googleCalendarEnabled);
        } catch (err) {
            console.error("Updating user settings failed:", err);
            showToast('Failed to update Google Calendar setting. Please try again.', 'error');
        }
    }, [showToast]);

    const value = useMemo<UserSettingsContextValue>(() => ({
        googleCalendarEnabled,
        isLoadingSettings,
        updateEnableCalendar,
    }), [
        googleCalendarEnabled,
        isLoadingSettings,
        updateEnableCalendar,
    ]);

    return createElement(UserSettingsContext.Provider, { value }, children);
}
