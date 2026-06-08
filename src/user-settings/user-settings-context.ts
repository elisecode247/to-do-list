import { createContext } from "react";

export type UserSettingsContextValue = {
    googleCalendarEnabled: boolean;
    isLoadingSettings: boolean;
    updateEnableCalendar: (nextValue: boolean) => Promise<void>;
};

export const UserSettingsContext = createContext<UserSettingsContextValue | null>(null);
