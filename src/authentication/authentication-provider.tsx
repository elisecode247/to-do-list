import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { CLIENT_ID } from 'src/app/constants';
import { getAuthEmail, getSessionUser, getValidAuthToken, loginWithGoogle, logout as logoutAPI } from 'src/authentication/authentication-api';
import { AuthenticationContext } from './authentication-context';
import { requestGoogleCredential } from './google-identity';


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
        if (!CLIENT_ID) {
            return Promise.reject(new Error('Google client ID is missing'));
        }

        setGoogleButtonState('pending');
        return requestGoogleCredential(CLIENT_ID)
            .then((credential) => {
                setGoogleButtonState('success');
                return credential;
            })
            .catch((error) => {
                setGoogleButtonState('failure');
                throw error;
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
