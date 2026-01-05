import { useEffect, useRef, useState } from "react";

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
  onSuccess: (googleIdToken: string) => void;
  onError?: (error: unknown) => void;
  backendClientIdEndpoint?: string; // optional backend endpoint
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  backendClientIdEndpoint = "https://demo-server-production-9fc2.up.railway.app/api/google-client-id", // default endpoint
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  // Fetch client ID from backend
  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const res = await fetch(backendClientIdEndpoint);
        if (!res.ok) throw new Error(`Failed to fetch client ID: ${res.status}`);
        const data = await res.json();
        if (!data?.clientId) throw new Error("No client ID returned from server");
        setClientId(data.clientId);
      } catch (err) {
        console.error(err);
        onError?.(err);
      }
    };

    fetchClientId();
  }, [backendClientIdEndpoint, onError]);

  // Initialize Google Sign-In when clientId is ready
  useEffect(() => {
    if (!window.google || !buttonRef.current || !clientId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: GoogleCredentialResponse) => {
          if (!response.credential) {
            onError?.("No credential returned from Google");
            return;
          }
          onSuccess(response.credential);
        },
      });

      // Disable auto-select so user is always prompted
      window.google.accounts.id.disableAutoSelect();

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 260,
      });
    } catch (err) {
      onError?.(err);
    }
  }, [clientId, onSuccess, onError]);

  return <div ref={buttonRef} />;
};

export default GoogleLoginButton;
