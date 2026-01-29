import { loginWithGoogle } from 'src/authentication/authentication-api';
import { useState, useCallback, use } from 'react';
import { AUTH_TOKEN_KEY } from 'src/authentication/constants';

export function useAuthentication() {
    const [isAuthenticated, setIsAuthenticated] = useState(() =>
        Boolean(localStorage.getItem(AUTH_TOKEN_KEY))
    );

    const login = useCallback(async (token: string) => {
        await loginWithGoogle(token);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setIsAuthenticated(false);
    }, []);

    return {
        isAuthenticated,
        login,
        logout,
    };
}
