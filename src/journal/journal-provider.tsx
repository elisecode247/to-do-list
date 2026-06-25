import { useState, useCallback, type ReactNode } from 'react';
import { JournalContext } from './journal-context';
import type { JournalEntry } from './types';
import { addEntry, fetchJournalEntries, updateEntry, deleteEntry } from './api';
import { useUserSettings } from 'src/user-settings/use-user-settings';
import { decryptData, encryptData } from 'src/encryption/utilities';
import { useEncryptionKey } from 'src/encryption/encryption-key-context';

export const JournalProvider = ({ children }: { children: ReactNode }) => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const { isEncryptionEnabled, encryptionConfig } = useUserSettings();
    const { masterKey } = useEncryptionKey();

    const loadJournalEntries = useCallback(async (day: string) => {
        try {
            const data = await fetchJournalEntries(day);

            // if encryption is not enabled, just return raw entries
            if (!isEncryptionEnabled || !encryptionConfig) {
                setEntries(data);
                return;
            }

            if (!masterKey) {
                console.warn("Journal is locked; can't decrypt entries yet.");
                return; // UI should be showing the lock screen in this state
            }

            // 4. Decrypt journal entries
            const decryptedEntries = await Promise.all(
                data.map(async (entry) => ({
                    ...entry,
                    text: await decryptData(entry.ciphertext, entry.iv, masterKey)
                }))
            );

            setEntries(decryptedEntries);
        } catch (err) {
            console.error("Failed to load journal entries:", err);
        }
    }, [isEncryptionEnabled, encryptionConfig, masterKey]);

    const addJournalEntry = async (entry: JournalEntry) => {
        try {
            const newEntry = { ...entry };
            // encrypt the new entry if encryption is enabled
            if (isEncryptionEnabled && encryptionConfig) {
                if (!masterKey) {
                    console.warn("Journal is locked; can't encrypt entries yet.");
                    return; // UI should be showing the lock screen in this state
                }
                const { ciphertext, iv } = await encryptData(newEntry.text, masterKey);
                // Update the new entry with encrypted content and IV
                newEntry.ciphertext = ciphertext;
                newEntry.iv = iv;
                newEntry.encryptionVersion = 1;
            }
            const createdEntry = await addEntry(newEntry);
            setEntries(prev => [createdEntry, ...prev]);
        } catch (err) {
            console.error("Failed to add journal entry:", err);
        }
    };

    const updateJournalEntry = useCallback(async (entry: JournalEntry) => {
        try {
            // encrypt the entry if encryption is enabled
            if (isEncryptionEnabled && encryptionConfig) {
                if (!masterKey) {
                    console.warn("Journal is locked; can't encrypt entries yet.");
                    return; // UI should be showing the lock screen in this state
                }
                const { ciphertext, iv } = await encryptData(entry.text, masterKey);
                entry.ciphertext = ciphertext;
                entry.iv = iv;
                entry.encryptionVersion = 1;
            }
            await updateEntry(entry);
            setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
        } catch (err) {
            console.error("Failed to update journal entry:", err);
        }
    }, [isEncryptionEnabled, encryptionConfig, masterKey]);

    const deleteJournalEntry = async (id: string) => {
        try {
            await deleteEntry(id);
            setEntries(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            console.error("Failed to delete journal entry:", err);
        }
    };
    return (
        <JournalContext.Provider value={{
            entries,
            loadJournalEntries,
            addJournalEntry,
            updateJournalEntry,
            deleteJournalEntry
        }}>
            {children}
        </JournalContext.Provider>
    );
};
