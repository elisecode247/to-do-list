import { createContext, useState, useCallback, type ReactNode } from 'react';
import { loginWithGoogle } from 'src/authentication/authentication-api';
import { AUTH_TOKEN_KEY } from 'src/authentication/constants';


interface AuthenticationContextType {
    isAuthenticated: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
}

export const AuthenticationContext = createContext<AuthenticationContextType | undefined>(undefined);

export const AuthenticationProvider = ({ children }: { children: ReactNode }) => {
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

    return (
        <AuthenticationContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthenticationContext.Provider>
    );
};

