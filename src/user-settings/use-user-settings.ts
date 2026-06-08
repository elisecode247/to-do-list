import { useContext } from 'react';
import { UserSettingsContext, type UserSettingsContextValue } from 'src/user-settings/user-settings-context';

export const useUserSettings = (): UserSettingsContextValue => {
    const context = useContext(UserSettingsContext);
    if (!context) {
        throw new Error('useUserSettings must be used within a UserSettingsProvider');
    }
    return context;
};
