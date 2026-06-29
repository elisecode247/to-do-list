import { createContext, useContext, useState, useCallback, useEffect, type ReactNode, createElement } from 'react';
import { unlockMasterKey, decryptData as decrypt, encryptData as encrypt, toBase64 } from './utilities';
import { authHeaders } from 'src/authentication/authentication-api';
import { API_URL } from 'src/app/constants';
import type { JournalEntry } from 'src/journal/types';
const ENCRYPTION_URL = API_URL + "/encryption";
import {
    ENCRYPTION_STATUS,
    type EncryptedResult,
    type EncryptionConfig,
    type EncryptionStatus,
    type ServerEncryptionConfig
} from "src/encryption/types";

type EncryptionKeyContextValue = {
    encryptionStatus: EncryptionStatus;
    updateEncryptionStatus: (val: EncryptionStatus) => void;
    masterKey: CryptoKey | null;
    isUnlocked: boolean;
    unlock: (password: string, config: EncryptionConfig) => Promise<void>;
    lock: () => void;
    decryptData: (ciphertext: string, iv: string) => Promise<string>;
    encryptData: (plaintext: string) => Promise<EncryptedResult>;
    setupEncryption: (encryptionData: EncryptionConfig) => Promise<void>;
    encryptionConfig: EncryptionConfig | null;
    setEncryptionConfig: React.Dispatch<React.SetStateAction<EncryptionConfig | null>>;
    isEncryptionEnabled: boolean;
    decryptAllEntries: (password: string, config: EncryptionConfig) => Promise<JournalEntry[]>;
    removeEncryption: () => Promise<void>;
};

const EncryptionKeyContext = createContext<EncryptionKeyContextValue | null>(null);

export const EncryptionKeyProvider = ({ children }: { children: ReactNode }) => {
    const [encryptionConfig, setEncryptionConfig] = useState<EncryptionConfig | null>(null);
    const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
    const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(false);
    const [encryptionStatus, setEncryptionStatus] = useState<EncryptionStatus>(ENCRYPTION_STATUS.NOT_ENCRYPTED);
    useEffect(() => {
        const fetchEncryptionConfig = async () => {
            try {
                const response = await fetch(ENCRYPTION_URL + '/status', {
                    method: "GET",
                    headers: await authHeaders(),
                });

                if (!response.ok) {
                    throw new Error(`Failed to load encryption settings: ${response.status}`);
                }

                const settings = await response.json();
                const nextEncryptionEnabled = settings?.encryptionEnabled ?? settings?.userSettings?.encryptionEnabled;
                const nextEncryptionConfig = settings?.encryptionConfig ?? settings?.userSettings?.encryptionConfig;
                const nextEncryptionStatus = settings?.encryptionStatus ?? settings?.userSettings?.encryptionStatus;

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
                if (nextEncryptionStatus) {
                    setEncryptionStatus(nextEncryptionStatus);
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

    const encryptData = useCallback(async (plaintext: string): Promise<EncryptedResult> => {
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
            const response = await fetch(`${ENCRYPTION_URL}/config`, {
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

    const updateAllEntriesContent = useCallback(async (updatedEntries: JournalEntry[]) => {
        try {
            const response = await fetch(`${API_URL}/journal/all/update-text`, {
                method: 'PATCH',
                headers: {
                    ...await authHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ entries: updatedEntries })
            });

            if (!response.ok) {
                throw new Error(`Failed to update entries: ${response.status}`);
            }
        } catch (err) {
            console.error("Updating all entries failed:", err);
            throw err;
        }
    }, []);

    const decryptAllEntries = useCallback(async (password: string, config: EncryptionConfig) => {
        try {
            // Unlock the master key with the provided password
            let key: CryptoKey;
            try {
                key = await unlockMasterKey(password, config);
                setMasterKey(key);
            } catch (err) {
                console.error("Unlocking master key failed:", err);
                throw err;
            }

            // Fetch all entries from the server
            const response = await fetch(`${API_URL}/journal/all`, {
                method: 'GET',
                headers: await authHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch entries: ${response.status}`);
            }

            const entries = await response.json();

            // Decrypt each entry
            const skippedEntries: JournalEntry[] = [];
            const updatedEntries = await Promise.all(entries.map(async (entry: JournalEntry) => {
                if (!entry.ciphertext) {
                    return entry;
                }
                try {
                    const decryptedContent = await decrypt(entry.ciphertext, entry.iv, key);
                    return { ...entry, ciphertext: '', iv: null, encryptionVersion: null, text: decryptedContent };
                } catch {
                    skippedEntries.push(entry);
                    return entry;
                }
            }));
            if (skippedEntries.length > 0) {
                console.warn(`Skipped ${skippedEntries.length} entries due to decryption errors.`);
                return skippedEntries;
            }

            await updateAllEntriesContent(updatedEntries);
            return [];

        } catch (err) {
            console.error("Decrypting all entries failed:", err);
            throw err;
        }
    }, [updateAllEntriesContent]);

    const removeEncryption = useCallback(async () => {
        try {
            const response = await fetch(`${ENCRYPTION_URL}/config`, {
                method: 'DELETE',
                headers: await authHeaders(),
            });
            if (!response.ok) {
                console.error(`Failed to remove encryption: ${response.status}`);
                throw new Error(`Failed to remove encryption: ${response.status}`);
            }
            setIsEncryptionEnabled(false);
            setEncryptionConfig(null);
            setMasterKey(null);
        } catch (err) {
            console.error("Removing encryption failed:", err);
            throw err;
        }
    }, []);

    const updateEncryptionStatus = useCallback((val: EncryptionStatus) => {
        setEncryptionStatus(val);
    }, []);

    const value = {
        encryptionStatus,
        updateEncryptionStatus,
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
        decryptAllEntries,
        updateAllEntriesContent,
        removeEncryption
    };

    return createElement(EncryptionKeyContext.Provider, { value }, children);
};

export const useEncryptionKey = () => {
    const ctx = useContext(EncryptionKeyContext);
    if (!ctx) throw new Error('useEncryptionKey must be used within EncryptionKeyProvider');
    return ctx;
};
