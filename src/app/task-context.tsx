import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { ChecklistItem } from 'app/types';
import { fetchTasks, prioritizeTask, updateTask, updateTasksOrder, deleteTask, addTask, toggleHideToday } from 'app/api';
import { useAuthentication } from 'src/authentication/use-authentication';
import { isDateToday } from 'src/utilities/is-date-today';
import type { TaskContextType } from 'app/types';
import { type Tab } from 'src/checklist/tabs/types';
import { getReorderedItems } from './utilities/get-reorder-items';
import { ONE_TIME_MODE } from 'src/checklist/constants';

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated: enabled } = useAuthentication();
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [isLoading, setIsLoading] = useState(enabled);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(enabled);
    }, [enabled]);

    useEffect(() => {
        if (!enabled) return;

        let cancelled = false;

        loadTasks(cancelled);

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

    const updateItem = async (updatedItem: ChecklistItem) => {
        let previousItem: ChecklistItem | undefined;

        setItems(prev => {
            previousItem = prev.find(i => i.id === updatedItem.id);
            return prev.map(i => i.id === updatedItem.id ? updatedItem : i);
        });

        try {
            await updateTask(updatedItem);
        } catch (error) {
            // rollback only that item
            if (previousItem) {
                setItems(prev =>
                    prev.map(i => i.id === previousItem!.id ? previousItem! : i)
                );
            }
            throw error;
        }
    };


    const addItem = async (newItem: ChecklistItem) => {
        try {
            const data = await addTask(newItem);
            const formattedTask: ChecklistItem = {
                id: data.id,
                isPriority: data.isPriority ?? false,
                isHidden: data.isHidden ?? false,
                done: false,
                text: data.text,
                lastCompleted: data.lastCompleted,
                note: data.note ?? '',
                sortOrder: data.sortOrder ?? 0,
                tabSortOrder: data.tabSortOrder ?? {},
                category: data.category,
                categoryUuid: data.categoryUuid ?? null,
                mode: data.mode ?? ONE_TIME_MODE,
                isArchived: false,
                parentUuid: data.parentUuid,
                hasSubChores: data.hasSubChores,
            };

            setItems(prev => {
                let updatedPrev = [...prev];
                // update parent item's hasSubChores if formattedTask has a parent
                if (formattedTask.parentUuid) {
                    updatedPrev = prev.map(item => {
                        if (item.id === formattedTask.parentUuid) {
                            return { ...item, hasSubChores: true };
                        }
                        return item;
                    });
                }
                return [formattedTask, ...updatedPrev]
            });
        } catch (err) {
            console.error('Failed to add task:', err);
            throw err;
        }
    }

    const deleteItem = (id: string) => {
        deleteTask(id).then(() => {
            setItems(prev => {
                // update hasSubChores of parent has last subtask deleted
                let deletedTask = prev.find(item => item.id === id);
                let parentSubTaskCount = prev.filter(item => item.parentUuid === deletedTask?.parentUuid).length;
                const updatedPrev = prev.map(item => {
                    if (item.id === deletedTask?.parentUuid && parentSubTaskCount === 1) {
                        return { ...item, hasSubChores: false };
                    }
                    return item;
                });
                return updatedPrev.filter(item => item.id !== id);
            });
        }).catch((err) => {
            console.error('Failed to delete task:', err);
            throw err;
        });
    }


    const toggleItem = async (id: string, checked: boolean) => {
        let previousItem: ChecklistItem | undefined;

        setItems(prev => {
            const item = prev.find(i => i.id === id);
            if (!item) {
                return prev;
            }

            previousItem = item;

            return prev.map(i =>
                i.id === id
                    ? {
                        ...i,
                        done: checked,
                        lastCompleted: checked ? new Date().toISOString() : '',
                    }
                    : i
            );
        });

        try {
            await updateTask({
                ...previousItem!,
                done: checked,
                lastCompleted: checked ? new Date().toISOString() : '',
            });
        } catch (err) {
            if (previousItem) {
                setItems(prev =>
                    prev.map(i =>
                        i.id === id ? previousItem! : i
                    )
                );
            }
            throw err;
        };
    }


    const prioritizeItem = (id: string) => {
        setItems(prev => {
            const updated = prev.map(item => {
                if (item.id !== id) return item;

                return {
                    ...item,
                    isPriority: !item.isPriority
                };
            });

            const changedItem = updated.find(i => i.id === id);
            if (changedItem) {
                prioritizeTask(changedItem).catch((err: Error) => {
                    console.error('Failed to prioritize task:', err);
                });
            }

            return updated;
        });
    }

    const archiveItem = (id: string) => {
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
        });
    }
    const sortItems = (
        filteredItems: ChecklistItem[],
        activeTab: Tab,
        activeId: string,
        overId: string
    ) => {
        setItems(prev => {
            // Determine sort subset, either tab-specific or subtasks
            const sortedSubset = getReorderedItems({
                allItems: prev,
                filteredItems,
                activeTab,
                activeId,
                overId
            });

            // 2. Merge subset changes back into canonical state
            const updatedMap = new Map(
                sortedSubset.map((i: ChecklistItem) => [i.id, i])
            );

            const updated = prev.map((item: ChecklistItem) =>
                updatedMap.get(item.id) ?? item
            );

            // 3. Persist only changed items
            const changed = sortedSubset.filter((item: ChecklistItem) => {
                const old = prev.find((p: ChecklistItem) => p.id === item.id);
                return (
                    old?.sortOrder !== item.sortOrder ||
                    old?.parentUuid !== item.parentUuid ||
                    old?.tabSortOrder !== item.tabSortOrder
                );
            });

            if (changed.length > 0) {
                updateTasksOrder(
                    changed.map((i: { id: string; sortOrder: number; parentUuid: string | null; }) => ({
                        id: i.id,
                        sortOrder: i.sortOrder,
                        parentUuid: i.parentUuid ?? null,
                    }))
                ).catch(console.error);
            }

            return updated;
        });
    };

    const getSubtasks = (parentId: string) => {
        if (!parentId) return [];
        return items.filter(item => item.parentUuid === parentId)
            .sort((a, b) => a.sortOrder - b.sortOrder);
    }

    const hideForToday = async (id: string) => {
        let previousItem: ChecklistItem | undefined;

        setItems(prev => {
            const item = prev.find(i => i.id === id);
            if (!item) return prev;

            previousItem = item;

            return prev.map(i =>
                i.id === id ? { ...i, isHidden: true } : i
            );
        });

        try {
            await toggleHideToday(id, true);
        } catch (err) {
            if (previousItem) {
                setItems(prev =>
                    prev.map(i =>
                        i.id === id ? previousItem! : i
                    )
                );
            }
            throw err;
        }
    };

    const unhideForToday = async (id: string) => {
        try {
            setItems(prev => {
                toggleHideToday(id, false)
                return prev.map(item => item.id === id ? { ...item, isHidden: false } : item);
            });
        } catch (err) {
            console.error('Failed to unhide task for today:', err);
            throw err;
        }
    };

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
            sortItems,
            reset,
            getSubtasks,
            hideForToday,
            unhideForToday
        }}>
            {children}
        </TaskContext.Provider>
    );
};

