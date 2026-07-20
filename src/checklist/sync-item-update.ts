import { type Dispatch, type SetStateAction } from 'react';
import type { ChecklistItem } from 'app/types';
import type { Tab } from 'src/app-toolbar/tabs/types';
import {
    toggleHideToday,
    updateTask,
    updateTaskCompletion,
    updateTasksOrder,
    type TaskOrderUpdate,
} from 'app/api';
import { canEditTask } from 'src/sharing/chore-access';

export const updateItemByIdAndSync = async (
    items: ChecklistItem[],
    setList: Dispatch<SetStateAction<ChecklistItem[]>>,
    id: string,
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
        const requests: Promise<unknown>[] = [];
        const sharedFields: (keyof ChecklistItem)[] = [
            'text',
            'note',
            'mode',
            'isPriority',
            'isArchived',
            'category',
            'recurrence',
        ];

        if (sharedFields.some(field => prevItem[field] !== updatedItem[field])) {
            requests.push(updateTask(updatedItem));
        }

        if (prevItem.lastCompleted !== updatedItem.lastCompleted) {
            requests.push(updateTaskCompletion(
                updatedItem.id,
                updatedItem.lastCompleted
                    ? new Date(updatedItem.lastCompleted).toISOString()
                    : null,
            ));
        }

        if (prevItem.isHidden !== updatedItem.isHidden) {
            requests.push(toggleHideToday(updatedItem.id, updatedItem.isHidden));
        }

        const order: TaskOrderUpdate = { id: updatedItem.id };
        if (prevItem.sortOrder !== updatedItem.sortOrder) {
            order.sortOrder = updatedItem.sortOrder;
        }
        if (prevItem.parentUuid !== updatedItem.parentUuid) {
            if (!canEditTask(updatedItem.accessRole)) {
                throw new Error('Owner or editor access is required to move tasks between groups.');
            }
            order.parentUuid = updatedItem.parentUuid;
        }
        if (Object.keys(order).length > 1) {
            requests.push(updateTasksOrder([order]));
        }

        for (const [tabName, tabSortOrder] of Object.entries(updatedItem.tabSortOrder)) {
            if (prevItem.tabSortOrder[tabName] !== tabSortOrder) {
                requests.push(updateTasksOrder([{
                    id: updatedItem.id,
                    tabName: tabName as Tab,
                    tabSortOrder,
                }]));
            }
        }

        await Promise.all(requests);
    } catch (err) {
        console.error('Failed to sync task update:', err);
        setList(prev =>prev.map(item => (item.id === id ? prevItem : item)));
        alert('Failed to save changes. Reverting.');
    }
};
