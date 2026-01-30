import { useState } from 'react';
import type { ChecklistItem } from 'app/types';
import { fetchTasks, updateTask, updateTasksOrder, deleteTask, addTask } from 'app/api';
import { isDateToday } from 'src/utilities/is-date-today';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { PRIORITY_TAG } from 'src/checklist/constants';

export const useTask = ({ enabled }: { enabled: boolean }) => {
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [isLoading, setIsLoading] = useState(enabled);
    const [error, setError] = useState<string | null>(null);

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
            throw err;
        }
    }

    const deleteItem = (id: UniqueIdentifier) => {
        deleteTask(id).then(() => {
            setItems(prev => prev.filter(item => item.id !== id));
        }).catch((err) => {
            console.error('Failed to delete task:', err);
            throw err;
        });
    }


    const toggleItem = (id: UniqueIdentifier, checked: boolean) => {
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
            throw err;
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
            throw err;
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

    return {
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
        reset
    };
}

