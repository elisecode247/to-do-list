import { createContext } from "react";

export type UserSettingsContextValue = {
    googleCalendarEnabled: boolean;
    isEncryptionEnabled: boolean;
    isLoadingSettings: boolean;
    setupEncryption: (encryptionData: {
        version: number;
        passwordProtector: {
            wrappedKey: ArrayBuffer;
            iv: Uint8Array;
            salt: Uint8Array;
        };
        recoveryProtector: {
            wrappedKey: ArrayBuffer;
            iv: Uint8Array;
            salt: Uint8Array;
        };
    }) => Promise<void>;
    updateEnableCalendar: (nextValue: boolean) => Promise<void>;
};

export const UserSettingsContext = createContext<UserSettingsContextValue | null>(null);
