import { useState, useEffect, type ReactNode } from 'react';
import { JournalContext } from './journal-context';
import type { JournalEntry } from './types';
import { addEntry, fetchJournalEntries, updateEntry, deleteEntry } from './api';

export const JournalProvider = ({ children }: { children: ReactNode }) => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    useEffect(() => {
        fetchJournalEntries()
            .then(setEntries)
            .catch(err => console.error("Failed to load journal entries:", err));
    }, [setEntries]);

    const addJournalEntry = async (entry: JournalEntry) => {
        try {
            const newEntry = await addEntry(entry);
            setEntries(prev => [...prev, newEntry]);
        } catch (err) {
            console.error("Failed to add journal entry:", err);
        }
    };

    const updateJournalEntry = async (entry: JournalEntry) => {
        try {
            await updateEntry(entry);
            setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
        } catch (err) {
            console.error("Failed to update journal entry:", err);
        }
    };

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
            addJournalEntry,
            updateJournalEntry,
            deleteJournalEntry
            }}>
            {children}
        </JournalContext.Provider>
    );
};
