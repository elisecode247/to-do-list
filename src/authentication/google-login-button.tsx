import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }): void;
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
  clientId: string;
  onSuccess: (googleIdToken: string) => void;
  onError?: (error: unknown) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  clientId,
  onSuccess,
  onError,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google || !buttonRef.current) return;

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
