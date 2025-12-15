// usePersistedChecklist.ts
import { useEffect, useEffectEvent, useState } from 'react';
import type { ChecklistItem } from './types';
import { ITEMS_KEY } from './constants';

export function usePersistedChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const setInitialItems = useEffectEvent(setItems);

  // Restore + daily reset logic
  useEffect(() => {
    const storedItems = localStorage.getItem(ITEMS_KEY);

    if (storedItems) {
      setInitialItems(JSON.parse(storedItems));
      console.log(storedItems)
      console.log('initial items set from local storage')
    }

  }, []);

  // Persist on change
  useEffect(() => {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    console.log('items saved to local storage')
  }, [items]);

  return [items, setItems] as const;
}
