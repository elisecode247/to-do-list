import { API_AUTH_URL } from "src/app/constants";
import { authHeaders } from "src/authentication/authentication-api";
import 'src/google-authorization/google-calendar-button.css';
import { useGoogleCalendar } from "./use-google-calendar";

interface Props {
    onSuccess?: () => void;
    onError?: (err: unknown) => void;
}

const GoogleCalendarConnectButton = ({ onSuccess, onError }: Props) => {
    const { clientId } = useGoogleCalendar();

    const connectCalendar = () => {
        if (!clientId) {
                onError?.(new Error("Google API client ID is missing"));
            return;
        }
        if (!window.google) {
            onError?.(new Error("Google API client not loaded"));
            return;
        }

        window.google.accounts.oauth2
            .initCodeClient({
                client_id: clientId,
                scope: "https://www.googleapis.com/auth/calendar",
                ux_mode: "popup",
                prompt: "consent",
                callback: async ({ code }) => {
                    try {
                        await fetch(
                            `${API_AUTH_URL}/google/calendar`,
                            {
                                method: "POST",
                                headers: await authHeaders(), // must include your app JWT
                                body: JSON.stringify({ code }),
                            }
                        );
                        onSuccess?.();
                    } catch (err) {
                        onError?.(err);
                    }
                },
            })
            .requestCode();
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
