export interface JournalEntry {
    id: string;
    text: string;
    distraction: boolean;
    /**
     * Journal grouping date.
     * Format: YYYY-MM-DD
     */
    day: string;
    /**
     * When the thought/event occurred.
     * ISO-8601 timestamp.
     */
    entryTime: string;
}

export interface JournalContextType {
    entries: JournalEntry[];
    loadJournalEntries: (day: string) => Promise<void>;
    addJournalEntry: (entry: JournalEntry) => Promise<void>;
    updateJournalEntry: (entry: JournalEntry) => Promise<void>;
    deleteJournalEntry: (id: string) => Promise<void>;
}
