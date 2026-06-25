import { createContext } from "react";
import type { EncryptionConfig } from "src/encryption/types";

export type UserSettingsContextValue = {
    encryptionConfig: EncryptionConfig | null;
    googleCalendarEnabled: boolean;
    isEncryptionEnabled: boolean;
    isLoadingSettings: boolean;
    setupEncryption: (encryptionData: EncryptionConfig) => Promise<void>;
    updateEnableCalendar: (nextValue: boolean) => Promise<void>;
};

export const UserSettingsContext = createContext<UserSettingsContextValue | null>(null);
