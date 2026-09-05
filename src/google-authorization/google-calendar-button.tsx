import { API_AUTH_URL } from "src/app/constants";
import { authHeaders } from "src/authentication/authentication-api";
import { loadGoogleIdentity } from "src/authentication/google-identity";
import { GOOGLE_CALENDAR_SCOPE_REQUEST } from "./google-calendar-scopes";
import { useGoogleCalendar } from "./use-google-calendar";

interface Props {
    onSuccess?: () => void;
    onError?: (err: unknown) => void;
}

const GoogleCalendarConnectButton = ({ onSuccess, onError }: Props) => {
    const { clientId } = useGoogleCalendar();

    const connectCalendar = async () => {
        if (!clientId) {
            onError?.(new Error("Google API client ID is missing"));
            return;
        }

        try {
            const google = await loadGoogleIdentity();

            if (!google.accounts?.oauth2) {
                throw new Error("Google OAuth client failed to initialize");
            }

            google.accounts.oauth2.initCodeClient({
                client_id: clientId,
                scope: GOOGLE_CALENDAR_SCOPE_REQUEST,
                include_granted_scopes: false,
                ux_mode: "popup",
                prompt: "consent",
                callback: async ({ code }) => {
                    try {
                        const response = await fetch(
                            `${API_AUTH_URL}/google/calendar`,
                            {
                                method: "POST",
                                headers: await authHeaders(), // must include your app JWT
                                body: JSON.stringify({ code }),
                            }
                        );
                        if (!response.ok) {
                            throw new Error(`Google Calendar connection failed: ${response.status}`);
                        }
                        onSuccess?.();
                    } catch (err) {
                        onError?.(err);
                    }
                },
            }).requestCode();
        } catch (err) {
            onError?.(err);
        }
    };

    return (
        <button
            type="button"
            className="settings-btn settings-btn--primary"
            onClick={connectCalendar}
        >
            Connect Google Calendar
        </button>
    );

};

export default GoogleCalendarConnectButton;
