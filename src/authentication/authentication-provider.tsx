import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { CLIENT_ID } from 'src/app/constants';
import { getAuthEmail, getValidAuthToken, loginWithGoogle, logout as logoutAPI } from 'src/authentication/authentication-api';
import { AuthenticationContext } from './authentication-context';
import { requestGoogleCredential } from './google-identity';
import { useLocation } from 'wouter';
import { ROUTES } from 'src/router';


export const AuthenticationProvider = ({ children }: { children: ReactNode }) => {
    const [location] = useLocation();
    const shouldValidateSession = location !== ROUTES.home;
    const [hasValidatedSession, setHasValidatedSession] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [googleButtonState, setGoogleButtonState] = useState<'pending' | 'success' | 'failure'>('pending');
    const [email, setEmail] = useState<string | undefined>(getAuthEmail());
    const login = useCallback(async (token: string) => {
        const userData = await loginWithGoogle(token);
        if (userData.email) {
            setEmail(userData.email);
        }
        setIsAuthenticated(true);
        setHasValidatedSession(true);
    }, []);

    useEffect(() => {
        if (!shouldValidateSession || hasValidatedSession) return;

        let isMounted = true;

        getValidAuthToken()
            .then((token) => {
                if (isMounted) {
                    setEmail(token ? getAuthEmail() : undefined);
                    setIsAuthenticated(Boolean(token));
                    setHasValidatedSession(true);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setEmail(undefined);
                    setIsAuthenticated(false);
                    setHasValidatedSession(true);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [hasValidatedSession, shouldValidateSession]);

    const logout = useCallback(() => {
        logoutAPI();
        setEmail(undefined);
        setIsAuthenticated(false);
        setHasValidatedSession(true);
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
            isLoading: shouldValidateSession && !hasValidatedSession,
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
