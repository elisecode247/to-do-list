interface GoogleCredentialResponse {
    credential: string;
    select_by?: string;
}

declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize(options: {
                        client_id: string;
                        use_fedcm_for_button?: boolean;
                        callback: (response: GoogleCredentialResponse) => void;
                    }): void;
                    prompt: () => void;
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
                oauth2: {
                    initCodeClient(config: {
                        client_id: string;
                        scope: string;
                        ux_mode: string;
                        prompt?: string;
                        callback: (response: { code: string }) => void;
                    }): { requestCode: () => void };
                };
            };
        };
    }
}

export {};
