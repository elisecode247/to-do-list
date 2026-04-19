import { API_AUTH_URL } from "src/app/constants";
import { authHeaders } from "src/authentication/authentication-api";
import 'src/google-authorization/google-calendar-button.css';
import { useClientId } from "./google-calendar-context";

interface Props {
    backendClientIdEndpoint?: string;
    onSuccess?: () => void;
    onError?: (err: unknown) => void;
}

const GoogleCalendarConnectButton = ({ onSuccess, onError }: Props) => {
    const clientId = useClientId();

    const connectCalendar = () => {
        if (!clientId || !window.google) return;

        window.google.accounts.oauth2
            .initCodeClient({
                client_id: clientId,
                scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks",
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
