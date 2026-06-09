import { useState, useCallback, useEffect, type ReactNode } from 'react';
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

    return (
        <AuthenticationContext.Provider value={{
            email,
            isLoading,
            isAuthenticated,
            login,
            logout,
            googleButtonState,
            setGoogleButtonState,
        }}>
            {children}
        </AuthenticationContext.Provider>
    );
};
