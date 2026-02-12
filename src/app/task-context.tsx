import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { ChecklistItem } from 'app/types';
import { fetchTasks, prioritizeTask, updateTask, updateTasksOrder, deleteTask, addTask, toggleHideToday } from 'app/api';
import { useAuthentication } from 'src/authentication/use-authentication';
import { useToast } from 'src/toast/use-toast';
import { isDateToday } from 'src/utilities/is-date-today';
import type { TaskContextType } from 'app/types';
import { type Tab, TABS } from 'src/checklist/tabs/types';
import { getReorderedItems } from './utilities/get-reorder-items';

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
                mode: data.mode,
                isArchived: false,
                parentUuid: data.parentUuid,
                hasSubChores: data.hasSubChores,
            } as ChecklistItem;

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
            showToast('Failed to add task. Please try again.', 'error');
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
            showToast('Task deleted successfully', 'success');
        }).catch((err) => {
            console.error('Failed to delete task:', err);
            showToast('Task could not be deleted. Please try again.', 'error');
        });
    }


    const toggleItem = (id: string, checked: boolean) => {
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
            showToast('Failed to update task archive status. Please try again.', 'error');
        });
    }

    const reorderItems = (filteredItems: ChecklistItem[], activeTab: Tab, activeId: string, overId: string) => {
        setItems(prevItems => {
            const reordered = getReorderedItems({
                filteredItems,
                activeTab,
                activeId,
                overId,
            });

            // If nothing changed, don't persist
            if (reordered === prevItems) return prevItems;

            // TAB only reorder
            if (
                activeTab === TABS.priority ||
                activeTab === TABS.hidden ||
                activeTab === TABS.archived
            ) {
                const toPersist = reordered.map((item, index) => ({
                    id: item.id,
                    tabName: activeTab,
                    tabSortOrder: item.tabSortOrder?.[activeTab] ?? index,
                }));

                updateTasksOrder(toPersist).catch(console.error);

                return reordered;
            }

            /* Structural Reorder (moving tasks between parents or to root level) */
            const toPersist = reordered.map(({ id, sortOrder, parentUuid }) => ({
                id,
                sortOrder,
                parentUuid: parentUuid ?? null,
            }));

            updateTasksOrder(toPersist).catch(console.error);

            return reordered;
        });
    };

    const getSubtasks = (parentId: string) => {
        if (!parentId) return [];
        return items.filter(item => item.parentUuid === parentId);
    }

    const hideForToday = async (id: string) => {
        try {
            setItems(prev => {
                toggleHideToday(id, true)
                return prev.map(item => item.id === id ? { ...item, isHidden: true } : item);
            });
        } catch (err) {
            console.error('Failed to hide task for today:', err);
            showToast('Failed to hide task for today. Please try again.', 'error');
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
            showToast('Failed to unhide task for today. Please try again.', 'error');
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
            reorderItems,
            reset,
            getSubtasks,
            hideForToday,
            unhideForToday
        }}>
            {children}
        </TaskContext.Provider>
    );
};

