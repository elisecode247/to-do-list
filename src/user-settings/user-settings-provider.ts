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
import { type EncryptionConfig, type ServerEncryptionConfig } from "src/encryption/types";
const USER_SETTINGS_URL = API_URL + "/user-settings";

function toBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
}

export function UserSettingsProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuthentication();
    const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(false);
    const [encryptionConfig, setEncryptionConfig] = useState<EncryptionConfig | null>(null);
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
                const response = await fetch(USER_SETTINGS_URL, {
                    method: "GET",
                    headers: await authHeaders(),
                });

                if (!response.ok) {
                    throw new Error(`Failed to load user settings: ${response.status}`);
                }

                const settings = await response.json();
                const nextEnableCalendar = settings?.googleCalendarEnabled ?? settings?.userSettings?.googleCalendarEnabled;
                const nextEncryptionEnabled = settings?.encryptionEnabled ?? settings?.userSettings?.encryptionEnabled;
                const nextEncryptionConfig = settings?.encryptionConfig ?? settings?.userSettings?.encryptionConfig;

                if (!isCancelled && typeof nextEnableCalendar === "boolean") {
                    setGoogleCalendarEnabled(nextEnableCalendar);
                }

                if (!isCancelled && typeof nextEncryptionEnabled === "boolean") {
                    setIsEncryptionEnabled(nextEncryptionEnabled);
                }

                if (!isCancelled && nextEncryptionConfig) {
                    // Convert base64-encoded strings to ArrayBuffer and Uint8Array
                    const convertProtector = (protector: ServerEncryptionConfig["passwordProtector"]) => ({
                        wrappedKey: Uint8Array.from(atob(protector.wrappedKey), c => c.charCodeAt(0)).buffer,
                        iv: Uint8Array.from(atob(protector.iv), c => c.charCodeAt(0)),
                        salt: Uint8Array.from(atob(protector.salt), c => c.charCodeAt(0)),
                    });

                    const convertedEncryptionConfig: EncryptionConfig = {
                        version: nextEncryptionConfig.version,
                        passwordProtector: convertProtector(nextEncryptionConfig.passwordProtector),
                        recoveryProtector: convertProtector(nextEncryptionConfig.recoveryProtector),
                    };

                    setEncryptionConfig(convertedEncryptionConfig);
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
            const response = await fetch(USER_SETTINGS_URL, {
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

    const setupEncryption = useCallback(async ({
        version,
        passwordProtector,
        recoveryProtector
    }: EncryptionConfig) => {
        try {
            const payload = JSON.stringify({
                version,
                passwordProtector: {
                    wrappedKey: toBase64(new Uint8Array(passwordProtector.wrappedKey)),
                    iv: toBase64(passwordProtector.iv),
                    salt: toBase64(passwordProtector.salt),
                },
                recoveryProtector: {
                    wrappedKey: toBase64(new Uint8Array(recoveryProtector.wrappedKey)),
                    iv: toBase64(recoveryProtector.iv),
                    salt: toBase64(recoveryProtector.salt),
                },
            });
            const response = await fetch(`${USER_SETTINGS_URL}/encryption-setup`, {
                method: 'PUT',
                headers: await authHeaders(),
                body: payload
            });
            if (!response.ok) {
                console.error(`Failed to set up encryption: ${response.status}`);
                throw new Error(`Failed to set up encryption: ${response.status}`);
            }
            setIsEncryptionEnabled(true);
        } catch (err) {
            console.error("Setting up encryption failed:", err);
            throw err;
        }

    }, []);

    const value = useMemo<UserSettingsContextValue>(() => ({
        encryptionConfig,
        googleCalendarEnabled,
        isEncryptionEnabled,
        isLoadingSettings,
        setupEncryption,
        updateEnableCalendar,
    }), [
        encryptionConfig,
        googleCalendarEnabled,
        isEncryptionEnabled,
        isLoadingSettings,
        setupEncryption,
        updateEnableCalendar,
    ]);

    return createElement(UserSettingsContext.Provider, { value }, children);
}
