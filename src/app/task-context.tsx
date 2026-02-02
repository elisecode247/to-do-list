import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { ChecklistItem } from 'app/types';
import { fetchTasks, updateTask, updateTasksOrder, deleteTask, addTask } from 'app/api';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { PRIORITY_TAG, type Tag, isExclusiveTag } from 'src/checklist/constants';
import { useAuthentication } from 'src/authentication/use-authentication';
import { useToast } from 'src/toast/use-toast';
import { isDateToday } from 'src/utilities/is-date-today';
import { ALL_CATEGORIES, isCategoryIncluded } from 'src/category-select/category-constants';

interface TaskContextType {
    items: ChecklistItem[];
    isLoading: boolean;
    error: string | null;
    loadTasks: (cancelled?: boolean) => void;
    addItem: (newItem: ChecklistItem) => Promise<void>;
    updateItem: (item: ChecklistItem) => Promise<void>;
    deleteItem: (id: UniqueIdentifier) => void;
    toggleItem: (id: UniqueIdentifier, checked: boolean) => void;
    prioritizeItem: (id: UniqueIdentifier) => void;
    archiveItem: (id: UniqueIdentifier) => void;
    hideItem: (id: UniqueIdentifier) => void;
    reorderItems: (activeId: UniqueIdentifier, overId: UniqueIdentifier) => void;
    reset: () => void;
    filterTasks: (params: {
        activeFilters: Tag[];
        isActiveList: boolean;
        hideCompleted: boolean;
        filterCategory: string;
    }) => ChecklistItem[];
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated: enabled } = useAuthentication();
    const { showToast } = useToast();
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [isLoading, setIsLoading] = useState(enabled);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(enabled);
    }, [enabled]);

    useEffect(() => {
        if (!enabled) return;

        let cancelled = false;

        const fetchData = () => loadTasks(cancelled);
        fetchData();

        return () => {
            cancelled = true;
        };
    }, [enabled])

    const reset = () => {
        setItems([]);
        setError(null);
        setIsLoading(false);
    };

    function loadTasks(cancelled = false) {
        if (!cancelled) setError(null);
        setIsLoading(true);
        fetchTasks().then((data) => {
            if (cancelled) return;
            const formattedItems = data.map((item: ChecklistItem) => {
                return {
                    ...item,
                    done: isDateToday(item.lastCompleted)
                }
            })
            setItems(formattedItems);
        }).catch(error => {
            if (!cancelled) {
                console.error(error);
                setError('Failed to load your tasks. Please check your connection and try again.');
                setItems([]);
            }
        }).finally(() => {
            if (!cancelled) {
                setIsLoading(false);
            }
        });
    }

    const updateItem = async (item: ChecklistItem) => {
        const prevItems = [...items];
        setItems(prev =>
            prev.map(i => (i.id === item.id ? item : i))
        );

        try {
            await updateTask(item);
            setItems(prev =>
                prev.map(i => (i.id === item.id ? item : i))
            );
        } catch (error) {
            setItems(prevItems);
            throw error;
        }
    };


    const addItem = async (newItem: ChecklistItem) => {
        try {
            const data = await addTask(newItem);
            const formattedTask = {
                id: data.id,
                done: false,
                text: data.text,
                lastCompleted: data.lastCompleted,
                note: data.note,
                sortOrder: data.sortOrder,
                category: data.category,
                tags: data.tags,
                isArchived: false
            } as ChecklistItem;
            setItems(prev => [formattedTask, ...prev]);
        } catch (err) {
            console.error('Failed to add task:', err);
            showToast('Failed to add task. Please try again.', 'error');
        }
    }

    const deleteItem = (id: UniqueIdentifier) => {
        deleteTask(id).then(() => {
            setItems(prev => prev.filter(item => item.id !== id));
            showToast('Task deleted successfully', 'success');
        }).catch((err) => {
            console.error('Failed to delete task:', err);
            showToast('Task could not be deleted. Please try again.', 'error');
        });
    }


    const toggleItem = (id: UniqueIdentifier, checked: boolean) => {
        if (!checked) {
            const confirmed = confirm(
                'If you uncheck, you will lose the last completed date. Are you sure?'
            );
            if (!confirmed) return;
        }

        updateTask({
            ...items.find(item => item.id === id)!,
            done: checked,
            lastCompleted: checked ? new Date().toISOString() : '',
        }).then(() => {
            setItems(prev =>
                prev.map(item =>
                    item.id === id
                        ? {
                            ...item,
                            done: checked,
                            lastCompleted: checked ? new Date().toISOString() : '',
                        }
                        : item
                )
            );
        }).catch((err) => {
            console.error('Failed to toggle task:', err);
            showToast('Failed to update task status. Please try again.', 'error');
        });
    }

    const prioritizeItem = (id: UniqueIdentifier) => {
        setItems(prev => {
            const updated = prev.map(item => {
                if (item.id !== id) return item;

                const hasPriority = item.tags.includes(PRIORITY_TAG);
                return {
                    ...item,
                    tags: hasPriority
                        ? item.tags.filter(t => t !== PRIORITY_TAG)
                        : [...item.tags, PRIORITY_TAG]
                };
            });

            const changedItem = updated.find(i => i.id === id);
            if (changedItem) {
                updateTask(changedItem).catch(err => {
                    console.error('Failed to prioritize task:', err);
                });
            }

            return updated;
        });
    }

    const archiveItem = (id: UniqueIdentifier) => {
        updateTask({
            ...items.find(item => item.id === id)!,
            isArchived: !items.find(item => item.id === id)!.isArchived,
        }).then(() => {
            setItems(prev =>
                prev.map(item =>
                    item.id === id
                        ? { ...item, isArchived: !item.isArchived }
                        : item
                )
            );
        }).catch((err) => {
            console.error('Failed to archive task:', err);
            showToast('Failed to update task archive status. Please try again.', 'error');
        });
    }

    const hideItem = (id: UniqueIdentifier) => {
        let updatedItems = items.map(item =>
            item.id === id ? { ...item, isHidden: true } : item
        );
        setItems(updatedItems);
    }

    const reorderItems = (activeId: UniqueIdentifier, overId: UniqueIdentifier) => {
        setItems(prevItems => {
            const oldIndex = prevItems.findIndex(item => item.id === activeId);
            const newIndex = prevItems.findIndex(item => item.id === overId);

            if (oldIndex === -1 || newIndex === -1) return prevItems;

            const reordered = arrayMove(prevItems, oldIndex, newIndex);

            const updatedItems = reordered.map((item, index) => ({
                ...item,
                sortOrder: index
            }));

            // optimistic update
            updateTasksOrder(
                updatedItems.map(({ id, sortOrder }) => ({ id, sortOrder }))
            ).catch(err => {
                console.error('Failed to update task order:', err);
                // optional: reload tasks or rollback
            });

            return updatedItems;
        });
    }
    type FilterParams = {
        activeFilters: Tag[];
        isActiveList: boolean;
        hideCompleted: boolean;
        filterCategory: string;
    };
    const filterTasks = ({
        activeFilters,
        isActiveList,
        hideCompleted,
        filterCategory
    }: FilterParams) => {
        if (!items.length) return items;
        const exclusiveFilters = activeFilters.filter(
            selected => isExclusiveTag(selected)
        );
        const nonExclusiveFilters = activeFilters.filter(
            selected => !isExclusiveTag(selected)
        );

        return items.filter(task => {
            if (isActiveList ? task.isArchived : !task.isArchived) return false;
            if (hideCompleted && isDateToday(task.lastCompleted)) return false;

            const tagSet = new Set(task.tags);

            // OR logic for exclusive tags
            if (exclusiveFilters.length > 0) {
                if (!exclusiveFilters.some(tag => tagSet.has(tag))) return false;
            }

            // AND logic for everything else (priority, etc)
            for (const tag of nonExclusiveFilters) {
                if (!tagSet.has(tag)) return false;
            }
            if (!isCategoryIncluded(filterCategory, task.category)) {
                return false;
            }
            // finally, exclude hidden tasks
            if (task.isHidden) return false;

            return true;
        });
    }

    return (
        <TaskContext.Provider value={{
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
            hideItem,
            reorderItems,
            reset,
            filterTasks,
        }}>
            {children}
        </TaskContext.Provider>
    );
};

