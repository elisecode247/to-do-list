import { useState, useCallback, type ReactNode } from 'react';
import { JournalContext } from './journal-context';
import type { JournalEntry } from './types';
import { addEntry, fetchJournalEntries, updateEntry, deleteEntry } from './api';
import { useEncryptionKey } from 'src/encryption/encryption-key-context';

export const JournalProvider = ({ children }: { children: ReactNode }) => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const { isUnlocked, decryptData, encryptData, isEncryptionEnabled, encryptionConfig } = useEncryptionKey();

    const loadJournalEntries = useCallback(async (day: string) => {
        try {
            const data = await fetchJournalEntries(day);

            // if encryption is not enabled, just return raw entries
            if (!isEncryptionEnabled || !encryptionConfig) {
                setEntries(data);
                return;
            }

            if (!isUnlocked) {
                console.warn("Journal is locked; can't decrypt entries yet.");
                return; // UI should be showing the lock screen in this state
            }

            // 4. Decrypt journal entries
            const decryptedEntries = await Promise.all(
                data.map(async (entry) => ({
                    ...entry,
                    text: entry.ciphertext ? await decryptData(entry.ciphertext, entry.iv) : entry.text,
                }))
            );

            setEntries(decryptedEntries);
        } catch (err) {
            console.error("Failed to load journal entries:", err);
        }
    }, [isEncryptionEnabled, encryptionConfig, isUnlocked, decryptData]);

    const addJournalEntry = async (entry: JournalEntry) => {
        try {
            const newEntry = { ...entry };
            // encrypt the new entry if encryption is enabled
            if (isEncryptionEnabled && encryptionConfig) {
                if (!isUnlocked) {
                    console.warn("Journal is locked; can't encrypt entries yet.");
                    return; // UI should be showing the lock screen in this state
                }
                const { ciphertext, iv } = await encryptData(newEntry.text);
                // Update the new entry with encrypted content and IV
                newEntry.ciphertext = ciphertext;
                newEntry.iv = iv;
                newEntry.encryptionVersion = 1;
                newEntry.text = ''; // Clear the plaintext text field for security
            }
            const createdEntry = await addEntry(newEntry);
            setEntries(prev => [createdEntry, ...prev]);
        } catch (err) {
            console.error("Failed to add journal entry:", err);
        }
    };

    const updateJournalEntry = useCallback(async (entry: JournalEntry) => {
        let updatedEntry = { ...entry };
        try {
            // encrypt the entry if encryption is enabled
            if (isEncryptionEnabled && encryptionConfig) {
                if (!isUnlocked) {
                    console.warn("Journal is locked; can't encrypt entries yet.");
                    return; // UI should be showing the lock screen in this state
                }
                const { ciphertext, iv } = await encryptData(entry.text);
                updatedEntry.ciphertext = ciphertext;
                updatedEntry.iv = iv;
                updatedEntry.encryptionVersion = 1;
                updatedEntry.text = ''; // Clear the plaintext text field for security
            }
            await updateEntry(updatedEntry);
            const decryptedText = updatedEntry.ciphertext ? await decryptData(updatedEntry.ciphertext, updatedEntry.iv) : updatedEntry.text;
            updatedEntry = { ...updatedEntry, text: decryptedText } // Restore the plaintext for local state
            setEntries(prev => prev.map(e => e.id === entry.id ? updatedEntry : e));
        } catch (err) {
            console.error("Failed to update journal entry:", err);
        }
    }, [isEncryptionEnabled, encryptionConfig, isUnlocked, encryptData, decryptData]);

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
