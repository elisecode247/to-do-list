import { useContext } from 'react';
import { JournalContext } from './journal-context';

export function useJournal() {
    const context = useContext(JournalContext);
    if (!context) {
        throw new Error('useJournal must be used within a JournalProvider');
    }
    return context;

}
