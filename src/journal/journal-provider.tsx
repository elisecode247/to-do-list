import { useState, useCallback, type ReactNode } from 'react';
import { JournalContext } from './journal-context';
import type { JournalEntry } from './types';
import { addEntry, fetchJournalEntries, updateEntry, deleteEntry } from './api';
import { useEncryptionKey } from 'src/encryption/encryption-key-context';
import { useUserSettings } from 'src/user-settings/use-user-settings';

export const JournalProvider = ({ children }: { children: ReactNode }) => {
    const { interstitialJournalEnabled } = useUserSettings();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const { isUnlocked, decryptData, encryptData, isEncryptionEnabled, encryptionConfig } = useEncryptionKey();

    // When a day has multiple entries (written while interstitial mode was on) but the
    // user is now in non-interstitial mode, we need a single entry to bind the "one entry
    // per day" textarea to. Previously this was faked client-side only, which meant edits
    // landed on one arbitrary underlying entry while the rest silently stuck around in
    // storage - so switching modes back and forth kept re-combining stale duplicates.
    // Instead, actually merge on the server: keep the chronologically-earliest entry,
    // fold every entry's text into it (oldest -> newest), and delete the others.
    const formatEntryTimestamp = (entryTime: string) => {
        const parsed = new Date(entryTime);
        if (Number.isNaN(parsed.getTime())) return '';
        const hours = String(parsed.getHours()).padStart(2, '0');
        const minutes = String(parsed.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const consolidateEntries = useCallback(async (day: string, sameDayEntries: JournalEntry[]) => {
        const sorted = [...sameDayEntries].sort(
            (a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime()
        );
        const [keep, ...rest] = sorted;

        const combinedText = sorted
            .map((entry) => {
                const timestamp = formatEntryTimestamp(entry.entryTime);
                return timestamp ? `[${timestamp}] ${entry.text}` : entry.text;
            })
            .join('\n');

        const mergedEntry: JournalEntry = { ...keep, text: combinedText, day };

        try {
            if (isEncryptionEnabled && encryptionConfig) {
                const { ciphertext, iv, encryptionVersion } = await encryptData(combinedText);
                await updateEntry({ ...mergedEntry, text: '', ciphertext, iv, encryptionVersion });
                mergedEntry.ciphertext = ciphertext;
                mergedEntry.iv = iv;
                mergedEntry.encryptionVersion = encryptionVersion;
            } else {
                await updateEntry(mergedEntry);
            }
            await Promise.all(rest.map((e) => deleteEntry(e.id)));
        } catch (err) {
            console.error("Failed to consolidate journal entries:", err);
        }

        return mergedEntry;
    }, [isEncryptionEnabled, encryptionConfig, encryptData]);

    const loadJournalEntries = useCallback(async (day: string) => {
        try {
            const data = await fetchJournalEntries(day);

            // if encryption is not enabled, just return raw entries
            if (!isEncryptionEnabled || !encryptionConfig) {
                if (!interstitialJournalEnabled && data.length > 1) {
                    const mergedEntry = await consolidateEntries(day, data);
                    setEntries([mergedEntry]);
                    return;
                }
                setEntries(data);
                return;
            }

            if (!isUnlocked) {
                console.warn("Journal is locked; can't decrypt entries yet.");
                return; // UI should be showing the lock screen in this state
            }

            // 4. Decrypt journal entries
            const decryptedEntries = await Promise.all(
                data.map(async (entry) => {
                    try {
                        const decryptedText = entry.ciphertext ? await decryptData(entry.ciphertext, entry.iv) : entry.text;
                        return { ...entry, text: decryptedText };
                    } catch (err) {
                        console.error(`Failed to decrypt entry with id ${entry.id}:`, err);
                        return { ...entry, text: '[Unable to decrypt entry]' };
                    }
                })
            );
            if (!interstitialJournalEnabled && decryptedEntries.length > 1) {
                const mergedEntry = await consolidateEntries(day, decryptedEntries);
                setEntries([mergedEntry]);
                return;
            }
            setEntries(decryptedEntries);
        } catch (err) {
            console.error("Failed to load journal entries:", err);
        }
    }, [isEncryptionEnabled, encryptionConfig, isUnlocked, decryptData, interstitialJournalEnabled, consolidateEntries]);

    const addJournalEntry = async (entry: JournalEntry) => {
        try {
            const newEntry = { ...entry };
            // encrypt the new entry if encryption is enabled
            if (isEncryptionEnabled && encryptionConfig) {
                if (!isUnlocked) {
                    console.warn("Journal is locked; can't encrypt entries yet.");
                    return; // UI should be showing the lock screen in this state
                }
                const { ciphertext, iv, encryptionVersion } = await encryptData(newEntry.text);
                // Update the new entry with encrypted content and IV
                newEntry.ciphertext = ciphertext;
                newEntry.iv = iv;
                newEntry.encryptionVersion = encryptionVersion;
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
                const { ciphertext, iv, encryptionVersion } = await encryptData(entry.text);
                updatedEntry.ciphertext = ciphertext;
                updatedEntry.iv = iv;
                updatedEntry.encryptionVersion = encryptionVersion;
                updatedEntry.text = ''; // Clear the plaintext text field for security
                await updateEntry(updatedEntry);
                const decryptedText = updatedEntry.ciphertext ? await decryptData(updatedEntry.ciphertext, updatedEntry.iv) : updatedEntry.text;
                updatedEntry = { ...updatedEntry, text: decryptedText } // Restore the plaintext for local state
                setEntries(prev => prev.map(e => e.id === entry.id ? updatedEntry : e));
            } else {
                await updateEntry(updatedEntry);
                setEntries(prev => prev.map(e => e.id === entry.id ? updatedEntry : e));
            }
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
