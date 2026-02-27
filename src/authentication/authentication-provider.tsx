import { useState, useCallback, type ReactNode } from 'react';
import { loginWithGoogle, logout as logoutAPI } from 'src/authentication/authentication-api';
import { AUTH_TOKEN_KEY } from 'src/authentication/constants';
import { AuthenticationContext } from './authentication-context';


export const AuthenticationProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() =>
        Boolean(localStorage.getItem(AUTH_TOKEN_KEY))
    );
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
