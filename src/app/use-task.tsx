import { useState } from 'react';
import type { ChecklistItem } from 'app/types';

export const useTask = () => {
    const [items, setItems] = useState<ChecklistItem[]>([]);

    return { items, setItems };
}
