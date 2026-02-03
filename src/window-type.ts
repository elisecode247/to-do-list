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
                oauth2: {
                    initCodeClient(config: {
                        client_id: string;
                        scope: string | string[];
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
