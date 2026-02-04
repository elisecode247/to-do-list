import { useEffect, useState } from "react";
import { API_AUTH_URL } from "src/app/constants";
import { authHeaders } from "src/authentication/authentication-api";
import 'src/google-authorization/google-calendar-button.css';

interface Props {
    backendClientIdEndpoint?: string;
    onSuccess?: () => void;
    onError?: (err: unknown) => void;
}

const GoogleCalendarConnectButton = ({ onSuccess, onError }: Props) => {
    const [clientId, setClientId] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${API_AUTH_URL}/google-client-id`)
            .then(res => res.json())
            .then(data => setClientId(data.clientId))
            .catch(onError);
    }, [onError]);

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
            className="calendar-connect-button"
            onClick={connectCalendar}
        >
            Connect Google Calendar
        </button>
    );
};

export default GoogleCalendarConnectButton;
