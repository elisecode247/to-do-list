import { useState, useEffect } from 'react';

export function useDailyHide() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Pad with '0' for single digits
    const day = String(today.getDate()).padStart(2, '0');
    const todayKey = `${year}-${month}-${day}`;
    const storageKey = 'hiddenItems';

    const [hiddenItems, setHiddenItems] = useState(() => {
        const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
        return stored[todayKey] || [];
    });

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
        stored[todayKey] = hiddenItems;
        localStorage.setItem(storageKey, JSON.stringify(stored));
    }, [hiddenItems, todayKey]);

    const hideForToday = (itemId: string) => {
        if (!hiddenItems.includes(itemId)) {
            setHiddenItems([...hiddenItems, itemId]);
        }
    };

    const unhideForToday = (itemId: string) => {
        setHiddenItems(hiddenItems.filter((id: string) => id !== itemId));
    };

    const isHiddenToday = (itemId: string) => hiddenItems.includes(itemId);

    const hiddenCount = hiddenItems.length;

    return {
        hiddenItems,
        hideForToday,
        isHiddenToday,
        unhideForToday,
        hiddenCount
    };
}
