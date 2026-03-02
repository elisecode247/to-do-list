import { useState, useCallback } from 'react';

const DEMO_NOTES_KEY = 'demo-notes';

export function useDemoNotes() {
  const [notes, setNotes] = useState<string>('Write your notes here...');
  const [isLoading, setIsLoading] = useState(true);

  // Load notes from localStorage
  const loadNotes = useCallback(() => {
    try {
      setIsLoading(true);
      const storedNotes = localStorage.getItem(DEMO_NOTES_KEY);
      if (storedNotes) {
        setNotes(storedNotes);
      }
    } catch (error) {
      console.error('Failed to load notes from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save notes to localStorage
  const saveNotes = useCallback((newNotes: string) => {
    try {
      localStorage.setItem(DEMO_NOTES_KEY, newNotes);
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error);
      throw error;
    }
  }, []);

  return {
    notes,
    setNotes,
    loadNotes,
    saveNotes,
    isLoading,
  };
}
