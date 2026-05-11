import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { getValidAuthToken, loginWithGoogle, logout as logoutAPI } from 'src/authentication/authentication-api';
import { AuthenticationContext } from './authentication-context';


export const AuthenticationProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [googleButtonState, setGoogleButtonState] = useState<'pending' | 'success' | 'failure'>('pending');
    const [email, setEmail] = useState<string | undefined>(
        localStorage.getItem("email") || ''
    );
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
            .then((token) => {
                if (isMounted) {
                    setIsAuthenticated(Boolean(token));
                }
            })
            .catch(() => {
                if (isMounted) {
                    setIsAuthenticated(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const logout = useCallback(() => {
        logoutAPI();
        setEmail('');
        setIsAuthenticated(false);
    }, []);

    return (
        <AuthenticationContext.Provider value={{
            email,
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
