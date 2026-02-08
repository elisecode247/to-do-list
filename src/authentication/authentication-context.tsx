import { createContext, useState, useCallback, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { loginWithGoogle, logout as logoutAPI } from 'src/authentication/authentication-api';
import { AUTH_TOKEN_KEY } from 'src/authentication/constants';


interface AuthenticationContextType {
    isAuthenticated: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    email?: string;
    googleButtonState: 'pending' | 'success' | 'failure';
    setGoogleButtonState: Dispatch<SetStateAction<"pending" | "success" | "failure">>;
}

export const AuthenticationContext = createContext<AuthenticationContextType | undefined>(undefined);

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

