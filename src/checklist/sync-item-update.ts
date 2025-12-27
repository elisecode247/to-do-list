import { type Dispatch, type SetStateAction } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { ChecklistItem } from 'app/types.ts';
import { updateTask } from 'app/api';

export const updateItemByIdAndSync = async (
    items: ChecklistItem[],
    setList: Dispatch<SetStateAction<ChecklistItem[]>>,
    id: UniqueIdentifier,
    updater: (item: ChecklistItem) => ChecklistItem
) => {
    const prevItem = items.find(item => item.id === id);
    if (!prevItem) return;

    let updatedItem = updater(prevItem);

    setList((prev) =>
        prev.map(function(item) {
            if (item.id !== id) return item;
            updatedItem = updater(item);
            return updatedItem;
        })
    );

    if (!updatedItem) return;

    try {
        await updateTask({
            ...updatedItem,
            lastCompleted: updatedItem.lastCompleted
                ? new Date(updatedItem.lastCompleted).toISOString()
                : '',
        });
    } catch (err) {
        console.error('Failed to sync task update:', err);
        setList(prev =>prev.map(item => (item.id === id ? prevItem : item)));
        alert('Failed to save changes. Reverting.');
    }
};
