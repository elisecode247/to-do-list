// usePersistedChecklist.ts
import { useEffect, useEffectEvent, useState } from 'react';
import type { ChecklistItem } from './types';
import { isToday } from './utilities/is-today';

const ITEMS_KEY = 'checklist-items';
const RESET_DATE_KEY = 'reset-checklist-date';

export function usePersistedChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const setInitialItems = useEffectEvent(setItems);

  // Restore + daily reset logic
  useEffect(() => {
    const storedItems = localStorage.getItem(ITEMS_KEY);
    const storedResetDate = localStorage.getItem(RESET_DATE_KEY);

    if (storedItems) {
      setInitialItems(JSON.parse(storedItems));
      console.log(storedItems)
      console.log('initial items set from local storage')
    }

    const now = new Date();
    console.log("%c Line:26 🍅 now", "color:#4fff4B", now);

    if (storedResetDate) {
      const lastReset = new Date(JSON.parse(storedResetDate));
      console.log("%c Line:30 🍺 lastReset", "color:#b03734", lastReset);

      if (!isToday(lastReset)) {
        setInitialItems(prev =>
          prev.map(item => ({ ...item, done: false }))
        );
        localStorage.setItem(RESET_DATE_KEY, JSON.stringify(now));
        console.log('items checked reset for new day')
      }
    } else {
      localStorage.setItem(RESET_DATE_KEY, JSON.stringify(now));
      console.log('reset date set')
    }
  }, []);

  // Persist on change
  useEffect(() => {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    console.log('items saved to local storage')
  }, [items]);

  return [items, setItems] as const;
}
