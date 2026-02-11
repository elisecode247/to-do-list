import { useContext } from 'react';
import { AuthenticationContext, type AuthenticationContextType } from 'src/authentication/authentication-context';

export function useAuthentication(): AuthenticationContextType {
        const context = useContext(AuthenticationContext);
    if (!context) {
        throw new Error('useAuthentication must be used within a AuthenticationProvider');
    }
    return context;
}
