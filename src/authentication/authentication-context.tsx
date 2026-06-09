import { createContext, type Dispatch, type SetStateAction } from 'react';


export interface AuthenticationContextType {
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    email?: string;
    googleButtonState: 'pending' | 'success' | 'failure';
    setGoogleButtonState: Dispatch<SetStateAction<"pending" | "success" | "failure">>;
    startGoogleReauth: () => Promise<string>;
}

export const AuthenticationContext = createContext<AuthenticationContextType | undefined>(undefined);



