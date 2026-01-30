import { useEffect, useState } from "react";
import { authHeaders } from "src/authentication/authentication-api";

interface Props {
    backendClientIdEndpoint?: string;
    onSuccess?: () => void;
    onError?: (err: unknown) => void;
}

const GoogleCalendarConnectButton = ({ onSuccess, onError }: Props) => {
    const [clientId, setClientId] = useState<string | null>(null);

    useEffect(() => {
        fetch("https://demo-server-production-9fc2.up.railway.app/api/google-client-id")
            .then(res => res.json())
            .then(data => setClientId(data.clientId))
            .catch(onError);
    }, [onError]);

    const connectCalendar = () => {
        if (!clientId || !window.google) return;

        window.google.accounts.oauth2
            .initCodeClient({
                client_id: clientId,
                scope: "https://www.googleapis.com/auth/calendar.events",
                ux_mode: "popup",
                prompt: "consent",
                callback: async ({ code }) => {
                    try {
                        await fetch(
                            "https://demo-server-production-9fc2.up.railway.app/auth/google/calendar",
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

    return <button onClick={connectCalendar}>Connect Google Calendar</button>;
};

export default GoogleCalendarConnectButton;
