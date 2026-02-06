import { createContext, useState, useCallback, type ReactNode } from 'react';
import { loginWithGoogle, logout as logoutAPI } from 'src/authentication/authentication-api';
import { AUTH_TOKEN_KEY } from 'src/authentication/constants';


interface AuthenticationContextType {
    isAuthenticated: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    email?: string;
}

export const AuthenticationContext = createContext<AuthenticationContextType | undefined>(undefined);

export const AuthenticationProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() =>
        Boolean(localStorage.getItem(AUTH_TOKEN_KEY))
    );
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
        <AuthenticationContext.Provider value={{ isAuthenticated, login, logout, email }}>
            {children}
        </AuthenticationContext.Provider>
    );
};

