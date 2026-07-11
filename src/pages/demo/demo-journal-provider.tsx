import { useCallback, useState, type ReactNode } from 'react';
import { JournalContext } from 'src/journal/journal-context';
import type { JournalEntry } from 'src/journal/types';

const STORAGE_KEY = 'demo-journal-entries';

const readStoredEntries = (): JournalEntry[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed as JournalEntry[];
    } catch (error) {
        console.error('Failed to read demo journal entries from localStorage:', error);
        return [];
    }
};

const writeStoredEntries = (entries: JournalEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const DemoJournalProvider = ({ children }: { children: ReactNode }) => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);

    const loadJournalEntries = useCallback(async (day: string) => {
        const allEntries = readStoredEntries();
        const filtered = allEntries.filter((entry) => entry.day === day);
        setEntries(filtered);
    }, []);

    const addJournalEntry = useCallback(async (entry: JournalEntry) => {
        try {
            const allEntries = readStoredEntries();
            const updatedEntries = [entry, ...allEntries];
            writeStoredEntries(updatedEntries);
            setEntries((prev) => [entry, ...prev]);
        } catch (error) {
            console.error('Failed to add demo journal entry:', error);
        }
    }, []);

    const updateJournalEntry = useCallback(async (entry: JournalEntry) => {
        try {
            const allEntries = readStoredEntries();
            const updatedAllEntries = allEntries.map((existing) =>
                existing.id === entry.id ? entry : existing
            );
            writeStoredEntries(updatedAllEntries);
            setEntries((prev) => prev.map((existing) => (existing.id === entry.id ? entry : existing)));
        } catch (error) {
            console.error('Failed to update demo journal entry:', error);
        }
    }, []);

    const deleteJournalEntry = useCallback(async (id: string) => {
        try {
            const allEntries = readStoredEntries();
            const updatedAllEntries = allEntries.filter((entry) => entry.id !== id);
            writeStoredEntries(updatedAllEntries);
            setEntries((prev) => prev.filter((entry) => entry.id !== id));
        } catch (error) {
            console.error('Failed to delete demo journal entry:', error);
        }
    }, []);

    return (
        <JournalContext.Provider
            value={{
                entries,
                loadJournalEntries,
                addJournalEntry,
                updateJournalEntry,
                deleteJournalEntry,
            }}
        >
            {children}
        </JournalContext.Provider>
    );
};
