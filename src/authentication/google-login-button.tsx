import { useEffect, useRef, useState } from "react";
import { API_AUTH_URL } from "src/app/constants";
import { useAuthentication } from "src/authentication/use-authentication";
import {
    initializeGoogleIdentity,
    setDefaultGoogleCredentialHandler,
} from "src/authentication/google-identity";
import './google-login-button.css';

interface GoogleCredentialResponse {
    credential: string;
    select_by?: string;
}

interface GoogleLoginButtonProps {
    onSuccess?: (googleIdToken: string) => void;
    onError?: (error: unknown) => void;
    backendClientIdEndpoint?: string; // optional backend endpoint
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
    onSuccess,
    onError,
    backendClientIdEndpoint = `${API_AUTH_URL}/google-client-id`,
}) => {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [clientId, setClientId] = useState<string | null>(null);
    const initializedRef = useRef(false); // ensure Google button is initialized once
    const { setGoogleButtonState } = useAuthentication();

    // Fetch client ID from backend
    useEffect(() => {
        const fetchClientId = async () => {
            try {
                const res = await fetch(backendClientIdEndpoint);
                if (!res.ok) throw new Error(`Failed to fetch client ID: ${res.status}`);
                const data = await res.json();
                if (!data?.clientId) throw new Error("No client ID returned from server");
                setClientId(data.clientId);
                setGoogleButtonState('success');
            } catch (err) {
                console.error("GoogleLoginButton fetch error:", err);
                setGoogleButtonState('failure')
                onError?.(err);
            }
        };
        fetchClientId();
    }, [backendClientIdEndpoint, onError, setGoogleButtonState]);

    // Initialize Google Sign-In button
    useEffect(() => {
        if (!buttonRef.current || !clientId) return;
        if (initializedRef.current) return; // prevent multiple initializations
        initializedRef.current = true;

        const credentialHandler = (response: GoogleCredentialResponse) => {
                    if (!response.credential) {
                        onError?.("No credential returned from Google");
                        setGoogleButtonState('failure');
                        return;
                    }
                    onSuccess?.(response.credential);
                    setGoogleButtonState('success');

        };

        const initializeButton = async () => {
            try {
                const google = await initializeGoogleIdentity(clientId);
                if (!buttonRef.current) return;
                setDefaultGoogleCredentialHandler(credentialHandler);

                // Disable auto-select so user is always prompted
                google.accounts.id.disableAutoSelect();

                // Render the button
                google.accounts.id.renderButton(buttonRef.current, {
                    theme: "filled_black",
                    text: "continue_with",
                    size: "large",
                    shape: "pill",
                    logo_alignment: "left",
                });
            } catch (err) {
                initializedRef.current = false;
                console.error("GoogleLoginButton initialization error:", err);
                onError?.(err);
                setGoogleButtonState('failure');
            }
        };

        initializeButton();

        return () => {
            setDefaultGoogleCredentialHandler(null);
        };
    }, [clientId, onSuccess, onError, setGoogleButtonState]);

    return <div ref={buttonRef} className="google-login-button" />;
};

export default GoogleLoginButton;
