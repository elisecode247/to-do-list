import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { CLIENT_ID } from 'src/app/constants';
import { getAuthEmail, getSessionUser, getValidAuthToken, loginWithGoogle, logout as logoutAPI } from 'src/authentication/authentication-api';
import { AuthenticationContext } from './authentication-context';


export const AuthenticationProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [googleButtonState, setGoogleButtonState] = useState<'pending' | 'success' | 'failure'>('pending');
    const [email, setEmail] = useState<string | undefined>(getAuthEmail());
    const login = useCallback(async (token: string) => {
        const userData = await loginWithGoogle(token);
        if (userData.email) {
            setEmail(userData.email);
        }
        setIsAuthenticated(true);
    }, []);

    useEffect(() => {
        let isMounted = true;

        getValidAuthToken()
            .then(async (token) => {
                if (isMounted) {
                    if (token) {
                        const session = await getSessionUser();
                        setEmail(session?.email ?? getAuthEmail());
                    } else {
                        setEmail(undefined);
                    }
                    setIsAuthenticated(Boolean(token));
                    setIsLoading(false);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setEmail(undefined);
                    setIsAuthenticated(false);
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const logout = useCallback(() => {
        logoutAPI();
        setEmail(undefined);
        setIsAuthenticated(false);
    }, []);

    function startGoogleReauth(): Promise<string> {
        if (!window.google?.accounts?.id) {
            return Promise.reject(new Error('Google API not loaded'));
        }

        if (!CLIENT_ID) {
            return Promise.reject(new Error('Google client ID is missing'));
        }

        setGoogleButtonState('pending');

        return new Promise<string>((resolve, reject) => {
            let settled = false;

            const timeoutId = window.setTimeout(() => {
                if (settled) return;
                settled = true;
                setGoogleButtonState('failure');
                reject(new Error('Google reauthentication timed out'));
            }, 60_000);

            window.google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: ({ credential }) => {
                    if (settled) return;
                    if (!credential) {
                        settled = true;
                        window.clearTimeout(timeoutId);
                        setGoogleButtonState('failure');
                        reject(new Error('No Google token returned'));
                        return;
                    }

                    settled = true;
                    window.clearTimeout(timeoutId);
                    setGoogleButtonState('success');
                    resolve(credential);
                },
            });

            try {
                window.google.accounts.id.disableAutoSelect();
                window.google.accounts.id.prompt();
            } catch (error) {
                if (settled) return;
                settled = true;
                window.clearTimeout(timeoutId);
                setGoogleButtonState('failure');
                reject(error);
            }
        });
    }

    return (
        <AuthenticationContext.Provider value={{
            email,
            isLoading,
            isAuthenticated,
            login,
            logout,
            googleButtonState,
            setGoogleButtonState,
            startGoogleReauth
        }}>
            {children}
        </AuthenticationContext.Provider>
    );
};
