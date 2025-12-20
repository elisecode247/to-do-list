import { type Dispatch, type SetStateAction } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { ChecklistItem } from '../app/types.ts';

export const updateItemById = (
    setList: Dispatch<SetStateAction<ChecklistItem[]>>,
    id: UniqueIdentifier,
    updater: (item: ChecklistItem) => ChecklistItem
) => setList(prev => prev.map(item => (item.id === id ? updater(item) : item)));
