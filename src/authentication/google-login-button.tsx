import { useEffect, useRef, useState } from "react";
import GoogleLogoutButton from 'src/authentication/google-logout-button';
import { AUTH_TOKEN_KEY, API_GOOGLE_CLIENT_ID_URL, REFRESH_TOKEN_KEY } from 'src/authentication/constants';
import { loginWithGoogle } from 'src/authentication/authentication-api';
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize(options: {
                        client_id: string;
                        callback: (response: GoogleCredentialResponse) => void;
                    }): void;
                    disableAutoSelect: () => void;
                    renderButton(
                        parent: HTMLElement | null,
                        options: {
                            theme?: "outline" | "filled_blue" | "filled_black";
                            size?: "small" | "medium" | "large";
                            text?: string;
                            shape?: string;
                            logo_alignment?: string;
                            width?: number;
                        }
                    ): void;
                };
            };
        };
    }
}

interface GoogleCredentialResponse {
    credential: string;
    select_by?: string;
}

interface GoogleLoginButtonProps {
    onLoad: (cancelled?: boolean) => void;
    onReset: () => void;
}
const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onReset, onLoad }) => {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [clientId, setClientId] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem(AUTH_TOKEN_KEY)));
    const initializedRef = useRef(false); // ensure Google button is initialized once

    // Fetch client ID from backend
    useEffect(() => {
        const fetchClientId = async () => {
            try {
                const res = await fetch(API_GOOGLE_CLIENT_ID_URL);
                if (!res.ok) throw new Error(`Failed to fetch client ID: ${res.status}`);
                const data = await res.json();
                if (!data?.clientId) throw new Error("No client ID returned from server");
                setClientId(data.clientId);
                if (isAuthenticated) {
                    onLoad();
                }
            } catch (err) {
                console.error("GoogleLoginButton fetch error:", err);
            }
        };
        fetchClientId();
    }, []);

    // Initialize Google Sign-In button
    useEffect(() => {
        if (!window.google || !buttonRef.current || !clientId) return;
        if (initializedRef.current) return; // prevent multiple initializations
        initializedRef.current = true;

        try {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: async function (response: GoogleCredentialResponse) {
                    try {
                        if (!response.credential) {
                            throw new Error("No credential returned from Google");
                        }
                        await loginWithGoogle(response.credential);
                        setIsAuthenticated(true);
                        onLoad(); // or just onLoad?.()
                    } catch (err) {
                        console.error("Google login error:", err);
                    }
                },
            });

            // Disable auto-select so user is always prompted
            window.google.accounts.id.disableAutoSelect();

            // Render the button
            window.google.accounts.id.renderButton(buttonRef.current, {
                theme: "outline",
                size: "large",
                width: 260,
            });
        } catch (err) {
            console.error("GoogleLoginButton initialization error:", err);
        }
    }, [clientId]);

    function handleLogout() {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        setIsAuthenticated(false);
        onReset();
    }

    return (
        <div>
            <div ref={buttonRef} hidden={isAuthenticated} />
            {isAuthenticated && <GoogleLogoutButton onLogout={handleLogout} />}
        </div>
    );
};

export default GoogleLoginButton;
