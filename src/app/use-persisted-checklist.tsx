// usePersistedChecklist.ts
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { ChecklistItem } from './types';
import { type PersistedChecklistKey } from './constants';

export function usePersistedChecklist(KEY: PersistedChecklistKey) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const initializedRef = useRef(false);
  const updateItems = useEffectEvent(setItems);
  const logInitialized = useEffectEvent(() => console.log(KEY + ': initial items set from local storage'));

  // Load when KEY changes
  useEffect(() => {
    initializedRef.current = false;

    const storedItems = localStorage.getItem(KEY);
    console.log("%c Line:15 🥚 storedItems", "color:#ffdd4d", storedItems);
    try {
        if (storedItems) {
            updateItems(JSON.parse(storedItems));
            console.log(storedItems)
            logInitialized();
        }
    } catch (e) {
        console.error('JSON parsing error' + e)
    }
    initializedRef.current = true;
    console.log(KEY + ': initialized from localStorage');
  }, [KEY]);

  // Persist on change
  useEffect(() => {
    if (!initializedRef.current) return;
    localStorage.setItem(KEY, JSON.stringify(items));
    console.log(KEY + ': items saved to local storage')
  }, [items, KEY]);

  return [items, setItems] as const;
}
