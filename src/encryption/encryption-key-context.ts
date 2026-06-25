// src/encryption/encryption-key-context.tsx
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode, createElement } from 'react';
import { unlockMasterKey, decryptData as decrypt, encryptData as encrypt, toBase64 } from './utilities';
import { type EncryptionConfig, type ServerEncryptionConfig } from "src/encryption/types";
import { authHeaders } from 'src/authentication/authentication-api';
import { API_URL } from 'src/app/constants';
const USER_SETTINGS_URL = API_URL + "/user-settings";

type EncryptionKeyContextValue = {
    masterKey: CryptoKey | null;
    isUnlocked: boolean;
    unlock: (password: string, config: EncryptionConfig) => Promise<void>;
    lock: () => void;
    decryptData: (ciphertext: string, iv: string) => Promise<string>;
    encryptData: (plaintext: string) => Promise<{ ciphertext: string; iv: string }>;
    setupEncryption: (encryptionData: EncryptionConfig) => Promise<void>;
    encryptionConfig: EncryptionConfig | null;
    setEncryptionConfig: React.Dispatch<React.SetStateAction<EncryptionConfig | null>>;
    isEncryptionEnabled: boolean;
};

const EncryptionKeyContext = createContext<EncryptionKeyContextValue | null>(null);

export const EncryptionKeyProvider = ({ children }: { children: ReactNode }) => {
    const [encryptionConfig, setEncryptionConfig] = useState<EncryptionConfig | null>(null);
    const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
    const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(false);

    useEffect(() => {

        const fetchEncryptionConfig = async () => {
            try {
                const response = await fetch(USER_SETTINGS_URL, {
                    method: "GET",
                    headers: await authHeaders(),
                });

                if (!response.ok) {
                    throw new Error(`Failed to load encryption settings: ${response.status}`);
                }

                const settings = await response.json();
                const nextEncryptionEnabled = settings?.encryptionEnabled ?? settings?.userSettings?.encryptionEnabled;
                const nextEncryptionConfig = settings?.encryptionConfig ?? settings?.userSettings?.encryptionConfig;


                if (typeof nextEncryptionEnabled === "boolean") {
                    setIsEncryptionEnabled(nextEncryptionEnabled);
                }

                if (nextEncryptionConfig) {
                    // Convert base64-encoded strings to ArrayBuffer and Uint8Array
                    const convertProtector = (protector: ServerEncryptionConfig["passwordProtector"]) => ({
                        wrappedKey: Uint8Array.from(atob(protector.wrappedKey), c => c.charCodeAt(0)).buffer,
                        iv: Uint8Array.from(atob(protector.iv), c => c.charCodeAt(0)),
                        salt: Uint8Array.from(atob(protector.salt), c => c.charCodeAt(0)),
                    });

                    const convertedEncryptionConfig: EncryptionConfig = {
                        version: nextEncryptionConfig.version,
                        passwordProtector: convertProtector(nextEncryptionConfig.passwordProtector),
                        recoveryProtector: convertProtector(nextEncryptionConfig.recoveryProtector),
                    };

                    setEncryptionConfig(convertedEncryptionConfig);
                }

            } catch (err) {
                console.error("Loading user settings failed:", err);
                throw new Error('Failed to load user settings. Please refresh the page.');
            }
        }
        fetchEncryptionConfig();
    }, []);

    const unlock = useCallback(async (password: string, config: EncryptionConfig) => {
        const key = await unlockMasterKey(password, config);
        setMasterKey(key);
    }, []);

    const lock = useCallback(() => setMasterKey(null), []);

    const decryptData = useCallback(async (ciphertext: string, iv: string): Promise<string> => {
        if (!masterKey) {
            throw new Error("Master key is not available. Unlock the journal first.");
        }
        return decrypt(ciphertext, iv, masterKey);
    }, [masterKey]);

    const encryptData = useCallback(async (plaintext: string): Promise<{ ciphertext: string; iv: string }> => {
        if (!masterKey) {
            throw new Error("Master key is not available. Unlock the journal first.");
        }
        return encrypt(plaintext, masterKey);
    }, [masterKey]);

    const setupEncryption = useCallback(async ({
        version,
        passwordProtector,
        recoveryProtector
    }: EncryptionConfig) => {
        try {
            const payload = JSON.stringify({
                version,
                passwordProtector: {
                    wrappedKey: toBase64(new Uint8Array(passwordProtector.wrappedKey)),
                    iv: toBase64(passwordProtector.iv),
                    salt: toBase64(passwordProtector.salt),
                },
                recoveryProtector: {
                    wrappedKey: toBase64(new Uint8Array(recoveryProtector.wrappedKey)),
                    iv: toBase64(recoveryProtector.iv),
                    salt: toBase64(recoveryProtector.salt),
                },
            });
            const response = await fetch(`${USER_SETTINGS_URL}/encryption-setup`, {
                method: 'PUT',
                headers: await authHeaders(),
                body: payload
            });
            if (!response.ok) {
                console.error(`Failed to set up encryption: ${response.status}`);
                throw new Error(`Failed to set up encryption: ${response.status}`);
            }
            setIsEncryptionEnabled(true);
            setEncryptionConfig({
                version,
                passwordProtector,
                recoveryProtector
            });
        } catch (err) {
            console.error("Setting up encryption failed:", err);
            throw err;
        }

    }, [setIsEncryptionEnabled]);


    const value = {
        masterKey,
        isUnlocked: !!masterKey,
        unlock,
        lock,
        decryptData,
        encryptData,
        setupEncryption,
        encryptionConfig,
        setEncryptionConfig,
        isEncryptionEnabled,
    };

    return createElement(EncryptionKeyContext.Provider, { value }, children);
};

export const useEncryptionKey = () => {
    const ctx = useContext(EncryptionKeyContext);
    if (!ctx) throw new Error('useEncryptionKey must be used within EncryptionKeyProvider');
    return ctx;
};
