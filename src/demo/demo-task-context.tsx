import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { ChecklistItem } from 'app/types';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { PRIORITY_TAG, type Tag, isExclusiveTag } from 'src/checklist/constants';
import { useToast } from 'src/toast/use-toast';
import { isCategoryIncluded } from 'src/category-select/category-constants';
import { DEMO_TASKS } from './demo-tasks';

const DEMO_STORAGE_KEY = 'demo_checklist_tasks';


interface TaskContextType {
    items: ChecklistItem[];
    isLoading: boolean;
    error: string | null;
    loadTasks: () => void;
    addItem: (newItem: ChecklistItem) => Promise<void>;
    updateItem: (item: ChecklistItem) => Promise<void>;
    deleteItem: (id: UniqueIdentifier) => void;
    toggleItem: (id: UniqueIdentifier, checked: boolean) => void;
    prioritizeItem: (id: UniqueIdentifier) => void;
    archiveItem: (id: UniqueIdentifier) => void;
    reorderItems: (activeId: UniqueIdentifier, overId: UniqueIdentifier) => void;
    reset: () => void;
    filterTasks: (params: {
        activeFilters: Tag[];
        activeTab: string;
        isActiveList: boolean;
        hideCompleted: boolean;
        filterCategory: string;
        showHidden?: boolean;
        isHiddenToday?: (arg0: string) => boolean;
    }) => ChecklistItem[];
    getSubtasks: (parentId: UniqueIdentifier) => ChecklistItem[];
}

export const DemoTaskContext = createContext<TaskContextType | undefined>(undefined);

export const DemoTaskProvider = ({ children }: { children: ReactNode }) => {
    const { showToast } = useToast();
    const [items, setItems] = useState<ChecklistItem[]>(() => {
        const stored = localStorage.getItem(DEMO_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
        return DEMO_TASKS;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const reset = () => {
        setError(null);
        setIsLoading(false);
        localStorage.removeItem(DEMO_STORAGE_KEY);
        setItems(DEMO_TASKS);
    };

    const loadTasks = () => {
        setIsLoading(true);
        try {
            const stored = localStorage.getItem(DEMO_STORAGE_KEY);
            if (stored) setItems(JSON.parse(stored));
            else setItems(DEMO_TASKS);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load tasks.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateItem = async (item: ChecklistItem) => {
        setItems(prev =>
            prev.map(i => (i.id === item.id ? item : i))
        );
        showToast('Task updated', 'success');
    };

    const addItem = async (newItem: ChecklistItem) => {
        setItems(prev => {
            let updatedPrev = [...prev];
            // update parent hasSubChores if needed
            if (newItem.parentUuid) {
                updatedPrev = updatedPrev.map(item => {
                    if (item.id === newItem.parentUuid) return { ...item, hasSubChores: true };
                    return item;
                });
            }
            return [newItem, ...updatedPrev];
        });
        showToast('Task added', 'success');
    };

    const deleteItem = (id: UniqueIdentifier) => {
        setItems(prev => {
            let deleted = prev.find(item => item.id === id);
            let parentSubCount = prev.filter(i => i.parentUuid === deleted?.parentUuid).length;
            return prev
                .map(item => {
                    if (item.id === deleted?.parentUuid && parentSubCount === 1) return { ...item, hasSubChores: false };
                    return item;
                })
                .filter(item => item.id !== id);
        });
        showToast('Task deleted', 'success');
    };

    const toggleItem = (id: UniqueIdentifier, checked: boolean) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, done: checked, lastCompleted: checked ? new Date().toISOString() : '' }
                    : item
            )
        );
    };

    const prioritizeItem = (id: UniqueIdentifier) => {
        setItems(prev =>
            prev.map(item => {
                if (item.id !== id) return item;
                const hasPriority = item.tags.includes(PRIORITY_TAG);
                return {
                    ...item,
                    tags: hasPriority ? item.tags.filter(t => t !== PRIORITY_TAG) : [...item.tags, PRIORITY_TAG],
                };
            })
        );
    };

    const archiveItem = (id: UniqueIdentifier) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, isArchived: !item.isArchived } : item
            )
        );
    };

    const filterTasks = ({
        activeFilters,
        activeTab: _activeTab,
        isActiveList,
        hideCompleted,
        filterCategory,
        showHidden = false,
        isHiddenToday: _isHiddenToday,
    }: {
        activeFilters: Tag[];
        activeTab: string;
        isActiveList: boolean;
        hideCompleted: boolean;
        filterCategory: string;
        showHidden?: boolean;
        isHiddenToday?: (arg0: string) => boolean;
    }) => {
        if (!items.length) return [];
        return items.filter(task => {
            if (isActiveList && task.parentUuid) return false;
            if (isActiveList ? task.isArchived : !task.isArchived) return false;
            if (hideCompleted && task.done) return false;
            if (!showHidden && task.isHidden) return false;

            const tagSet = new Set(task.tags);

            // exclusive tags OR logic
            const exclusiveFilters = activeFilters.filter(isExclusiveTag);
            if (exclusiveFilters.length && !exclusiveFilters.some(tag => tagSet.has(tag))) return false;

            // non-exclusive tags AND logic
            const nonExclusiveFilters = activeFilters.filter(t => !isExclusiveTag(t));
            if (nonExclusiveFilters.some(tag => !tagSet.has(tag))) return false;

            if (!isCategoryIncluded(filterCategory, task.category)) return false;

            return true;
        });
    };

    const getSubtasks = (parentId: UniqueIdentifier) => {
        return items.filter(item => item.parentUuid === parentId);
    };

    const reorderItems = (activeId: UniqueIdentifier, overId: UniqueIdentifier) => {
        setItems(prevItems => {
            const activeItem = prevItems.find(i => i.id === activeId);
            if (!activeItem) return prevItems;

            let isFirstSubTask = false;
            let placeholderParentId: UniqueIdentifier | null = null;

            // Detect placeholder dropzone
            if (typeof overId === 'string' && overId.startsWith('placeholder-')) {
                isFirstSubTask = true;
                placeholderParentId = overId.replace('placeholder-', '');
                overId = placeholderParentId as string;
            }

            const overItem = prevItems.find(i => i.id === overId);
            if (!overItem) return prevItems;

            const oldParent = activeItem.parentUuid ?? null;
            const newParent: UniqueIdentifier | null = isFirstSubTask ? overItem.id : overItem.parentUuid ?? null;

            const getSiblings = (parentUuid: UniqueIdentifier | null) =>
                prevItems
                    .filter(i => (i.parentUuid ?? null) === parentUuid)
                    .sort((a, b) => a.sortOrder - b.sortOrder);

            // SAME PARENT REORDER
            if (oldParent === newParent && !isFirstSubTask) {
                const siblings = getSiblings(oldParent);
                const oldIndex = siblings.findIndex(i => i.id === activeId);
                const newIndex = siblings.findIndex(i => i.id === overId);
                if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prevItems;

                const reordered = arrayMove(siblings, oldIndex, newIndex).map((item, index) => ({
                    ...item,
                    sortOrder: index,
                }));
                const otherItems = prevItems.filter(i => (i.parentUuid ?? null) !== oldParent);
                return [...otherItems, ...reordered];
            }

            // CROSS PARENT MOVE
            const oldSiblings = getSiblings(oldParent).filter(i => i.id !== activeId);
            const newSiblings = getSiblings(newParent);

            // Determine insert index
            let targetIndex = 0;
            if (!isFirstSubTask) {
                const insertIndex = newSiblings.findIndex(i => i.id === overId);
                targetIndex = insertIndex === -1 ? newSiblings.length : insertIndex;
            }

            const movedItem = { ...activeItem, parentUuid: newParent };

            const updatedNewSiblings = [
                ...newSiblings.slice(0, targetIndex),
                movedItem,
                ...newSiblings.slice(targetIndex),
            ].map((item, index) => ({ ...item, sortOrder: index }));

            const updatedOldSiblings = oldSiblings.map((item, index) => ({ ...item, sortOrder: index }));

            const untouched = prevItems.filter(i => {
                const p = i.parentUuid ?? null;
                return p !== oldParent && p !== newParent && i.id !== activeId;
            });

            let updatedItems = [...untouched, ...updatedOldSiblings, ...updatedNewSiblings];

            // Update hasSubChores dynamically
            const parentIds = [oldParent, newParent].filter(Boolean) as UniqueIdentifier[];
            updatedItems = updatedItems.map(item => {
                if (parentIds.includes(item.id)) {
                    const childCount = updatedItems.filter(i => i.parentUuid === item.id).length;
                    return { ...item, hasSubChores: childCount > 0 };
                }
                return item;
            });

            return updatedItems;
        });
    };

    return (
        <DemoTaskContext.Provider
            value={{
                items,
                isLoading,
                error,
                loadTasks,
                addItem,
                updateItem,
                deleteItem,
                toggleItem,
                prioritizeItem,
                archiveItem,
                reorderItems,
                reset,
                filterTasks,
                getSubtasks,
            }}
        >
            {children}
        </DemoTaskContext.Provider>
    );
};
