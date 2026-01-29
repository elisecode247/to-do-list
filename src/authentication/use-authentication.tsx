import { AUTH_TOKEN_KEY } from "./constants";
import { useState } from "react";
import { loginWithGoogle } from 'src/authentication/authentication-api';

export function useAuthentication() {
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem(AUTH_TOKEN_KEY)));

    const login = async (token: string) => {
        try {
            await loginWithGoogle(token);
            setIsAuthenticated(true);
        } catch (err) {
            console.error("Login failed:", err);
            throw err;
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
    };

    return {
        isAuthenticated,
        login,
        logout,
    };
}
