type GoogleCredentialResponse = {
    credential: string;
    select_by?: string;
};

type CredentialHandler = (response: GoogleCredentialResponse) => void;

let sdkPromise: Promise<typeof window.google> | null = null;
let initializedClientId: string | null = null;
let defaultCredentialHandler: CredentialHandler | null = null;
let pendingCredentialHandler: CredentialHandler | null = null;

const loadGoogleIdentity = (): Promise<typeof window.google> => {
    if (window.google?.accounts?.id) {
        return Promise.resolve(window.google);
    }

    if (sdkPromise) return sdkPromise;

    sdkPromise = new Promise((resolve, reject) => {
        const script = document.querySelector<HTMLScriptElement>(
            'script[src="https://accounts.google.com/gsi/client"]',
        );

        if (!script) {
            reject(new Error('Google Identity Services script is missing'));
            return;
        }

        const handleLoad = () => {
            if (window.google?.accounts?.id) {
                resolve(window.google);
            } else {
                reject(new Error('Google Identity Services failed to initialize'));
            }
        };
        const handleError = () => reject(new Error('Google Identity Services failed to load'));

        script.addEventListener('load', handleLoad, { once: true });
        script.addEventListener('error', handleError, { once: true });
    });

    return sdkPromise;
};

const dispatchCredential = (response: GoogleCredentialResponse) => {
    if (pendingCredentialHandler) {
        const handler = pendingCredentialHandler;
        pendingCredentialHandler = null;
        handler(response);
        return;
    }

    defaultCredentialHandler?.(response);
};

export const initializeGoogleIdentity = async (clientId: string) => {
    const google = await loadGoogleIdentity();

    if (initializedClientId && initializedClientId !== clientId) {
        throw new Error('Google Identity Services was initialized with a different client ID');
    }

    if (!initializedClientId) {
        google.accounts.id.initialize({
            client_id: clientId,
            callback: dispatchCredential,
            use_fedcm_for_button: true,
        });
        initializedClientId = clientId;
    }

    return google;
};

export const setDefaultGoogleCredentialHandler = (handler: CredentialHandler | null) => {
    defaultCredentialHandler = handler;
};

export const requestGoogleCredential = async (clientId: string): Promise<string> => {
    const google = await initializeGoogleIdentity(clientId);

    if (pendingCredentialHandler) {
        throw new Error('Google reauthentication is already in progress');
    }

    return new Promise<string>((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
            pendingCredentialHandler = null;
            reject(new Error('Google reauthentication timed out'));
        }, 60_000);

        pendingCredentialHandler = ({ credential }) => {
            window.clearTimeout(timeoutId);
            if (!credential) {
                reject(new Error('No Google token returned'));
                return;
            }
            resolve(credential);
        };

        try {
            google.accounts.id.disableAutoSelect();
            google.accounts.id.prompt();
        } catch (error) {
            window.clearTimeout(timeoutId);
            pendingCredentialHandler = null;
            reject(error);
        }
    });
};
