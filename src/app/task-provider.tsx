import { useAuthentication } from 'src/authentication/use-authentication';
import { isDateToday } from 'src/utilities/is-date-today';
import { type Tab } from 'src/app-toolbar/tabs/types';
import { getReorderedItems } from './utilities/get-reorder-items';
import { ONE_TIME_MODE } from 'src/checklist/constants';
import {
    fetchTasks,
    prioritizeTask,
    updateTask,
    updateTasksOrder,
    deleteTask,
    addTask,
    toggleHideToday,
    bulkUpdateTasks,
    updateTaskCompletion,
    subscribeToChoreAccessChanges,
    type BulkUpdateTaskRequest,
    type TaskOrderUpdate,
} from 'app/api';
import {
    type ChecklistItem,
    type ApiRecurrence,
    type IntervalRecurrence,
    type OneTimeRecurrence,
    FrequencyType,
    INTERVAL_RECURRENCE,
    ONE_TIME_RECURRENCE,
} from 'app/types';
import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { TaskContext } from './task-context';
import { getLocalTodayAtMidnight } from './utilities/filter-tasks';
import { useToast } from 'src/toast/use-toast';


export const TaskProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated: enabled } = useAuthentication();
    const { showToast } = useToast();
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [taskError, setTaskError] = useState<string | null>(null);
    const loadDateRef = useRef(new Date());
    const [isUpdatedDate, setIsUpdatedDate] = useState(false);
    const itemLength = items.length;

    const reset = () => {
        setItems([]);
        setTaskError(null);
        setIsLoading(false);
    };

    const loadTasks = useCallback((cancelled = false) => {
        if (!cancelled) setTaskError(null);
        setIsLoading(true);
        fetchTasks().then((data) => {
            if (cancelled) return;
            const formattedItems = data.map((item: ChecklistItem): ChecklistItem => {
                return {
                    ...item,
                    done: isDateToday(item.lastCompleted),
                    itemType: 'checklist-item',
                    // and if it was completed today, it is not upcoming, otherwise it is upcoming if nextDue is in the future
                    upcoming: item.lastCompleted ? !isDateToday(item.lastCompleted) && item.nextDue !== null && new Date(item.nextDue) > getLocalTodayAtMidnight() : item.nextDue !== null && new Date(item.nextDue) > getLocalTodayAtMidnight(),
                }
            })
            setItems(formattedItems);
            loadDateRef.current = new Date();
            setTaskError(null);
        }).catch(error => {
            if (!cancelled) {
                console.error(error);
                setTaskError('Failed to load your tasks. Please check your connection and try again.');
                setItems([]);
            }
        }).finally(() => {
            setIsLoading(false);
            setIsUpdatedDate(true);
            const timer = setTimeout(() => setIsUpdatedDate(false), 20000);
            return () => clearTimeout(timer);
        });
    }, []);

    useEffect(() => subscribeToChoreAccessChanges(() => {
        loadTasks();
        showToast('Your access to this task changed.', 'info');
    }), [loadTasks, showToast]);

    const partialUpdateItem = async (partialItem: Partial<ChecklistItem>) => {
        let previousItem = items.find(i => i.id === partialItem.id);

        try {
            const updatedItem = { ...previousItem, ...partialItem } as ChecklistItem;
            const hasCompletionUpdate = Object.prototype.hasOwnProperty.call(
                partialItem,
                'lastCompleted',
            );
            const hasGeneralTaskUpdate = [
                'text',
                'note',
                'mode',
                'isPriority',
                'isArchived',
                'category',
                'recurrence',
            ].some(key => Object.prototype.hasOwnProperty.call(partialItem, key));
            let updatedTask = updatedItem;

            if (hasGeneralTaskUpdate) {
                updatedTask = {
                    ...updatedTask,
                    ...await updateTask(updatedItem),
                };
            }

            if (hasCompletionUpdate) {
                const completion = await updateTaskCompletion(
                    updatedItem.id,
                    updatedItem.lastCompleted
                        ? new Date(updatedItem.lastCompleted).toISOString()
                        : null,
                );
                updatedTask = {
                    ...updatedTask,
                    lastCompleted: completion.lastCompleted ?? '',
                    nextDue: completion.nextDue,
                    done: isDateToday(completion.lastCompleted ?? ''),
                };
            }

            setItems(prev => {
                previousItem = prev.find(i => i.id === partialItem.id);
                return prev.map(i => i.id === partialItem.id ? {
                    ...i,
                    ...updatedTask,
                    done: isDateToday(updatedTask.lastCompleted),
                    itemType: 'checklist-item',
                } : i);
            });
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

    const updateItem = async (updatedItem: ChecklistItem) => {
        let originalItem: ChecklistItem | undefined;

        setItems(prev => {
            originalItem = prev.find(item => item.id === updatedItem.id);

            return prev.map(item =>
                item.id === updatedItem.id
                    ? { ...updatedItem }
                    : item
            );
        });

        try {
            const serverTask = await updateTask(updatedItem);

            let updatedTask: ChecklistItem = {
                ...updatedItem,
                ...serverTask,
            };

            if (originalItem?.lastCompleted !== updatedItem.lastCompleted) {
                const completion = await updateTaskCompletion(
                    updatedItem.id,
                    updatedItem.lastCompleted
                        ? new Date(updatedItem.lastCompleted).toISOString()
                        : null,
                );

                updatedTask = {
                    ...updatedTask,
                    lastCompleted: completion.lastCompleted ?? "",
                    nextDue: completion.nextDue,
                };
            }

            setItems(prev =>
                prev.map(item => {
                    if (item.id !== updatedItem.id) {
                        return item;
                    }

                    return {
                        ...item,
                        ...updatedTask,
                        done: isDateToday(updatedTask.lastCompleted),
                        itemType: "checklist-item" as const,
                        upcoming:
                            !isDateToday(updatedTask.lastCompleted) &&
                            updatedTask.nextDue != null &&
                            new Date(updatedTask.nextDue) >
                            getLocalTodayAtMidnight(),
                    };
                })
            );
        } catch (error) {
            console.error("[updateItem] Error", error);

            if (originalItem) {
                setItems(prev =>
                    prev.map(item =>
                        item.id === originalItem!.id
                            ? originalItem!
                            : item
                    )
                );
            }

            throw error;
        }
    };

    const bulkUpdate = async (updatedItems: ChecklistItem[]) => {
        try {
            const requests: BulkUpdateTaskRequest[] = updatedItems.map(item => ({
                id: item.id,
                mode: item.mode,
                isArchived: item.isArchived,
                category: item.category,
                isPriority: item.isPriority,
            }));
            await bulkUpdateTasks(requests);
            setItems(prev => {
                return prev.map(item => {
                    const updated = updatedItems.find(i => i.id === item.id);
                    return updated ? { ...item, ...updated } : item;
                });
            });

        } catch (error) {
            console.error('Failed to bulk update tasks:', error);
            throw error;
        }
    };

    const addItem = async (newItem: ChecklistItem) => {

        function mapRecurrence(rec: ApiRecurrence | null): IntervalRecurrence | OneTimeRecurrence | null {
            if (!rec) return null;
            switch (rec.type) {
                case ONE_TIME_RECURRENCE:
                    return {
                        type: ONE_TIME_RECURRENCE,
                        startDate: rec.startDate ? new Date(rec.startDate).toISOString() : new Date().toISOString(),
                    };
                case INTERVAL_RECURRENCE:
                    return {
                        type: INTERVAL_RECURRENCE,
                        numberOfRepetitions: rec.numberOfRepetitions ?? 1,
                        frequency: rec.frequency as FrequencyType,
                        startDate: rec.startDate ? new Date(rec.startDate).toISOString() : new Date().toISOString(),
                    };
                default:
                    throw new Error('Unknown recurrence type');
            }
        }
        try {
            const data = await addTask(newItem);
            if ('error' in data) {
                throw new Error(data.error);
            }
            const formattedTask: ChecklistItem = {
                hasMembers: false,
                isOwner: true,
                accessRole: "owner",
                ownerUuid: data.ownerUuid,
                ownerName: data.ownerName,
                itemType: 'checklist-item',
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
                mode: data.mode ?? ONE_TIME_MODE,
                isArchived: false,
                parentUuid: data.parentUuid,
                hasSubChores: data.hasSubChores,
                recurrence: mapRecurrence(data.recurrence),
                nextDue: data.nextDue,
                listId: data.listId,
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

    const deleteItem = async (id: string) => {
        await deleteTask(id);
        setItems(prev => {
            // update hasSubChores of parent has last subtask deleted
            const deletedTask = prev.find(item => item.id === id);
            const parentSubTaskCount = prev.filter(item => item.parentUuid === deletedTask?.parentUuid).length;
            const updatedPrev = prev.map(item => {
                if (item.id === deletedTask?.parentUuid && parentSubTaskCount === 1) {
                    return { ...item, hasSubChores: false };
                }
                return item;
            });
            return updatedPrev.filter(item => item.id !== id);
        });
    }


    const toggleItem = async (id: string, checked: boolean) => {
        let previousItem: ChecklistItem | undefined;
        const optimisticLastCompleted = checked ? new Date().toISOString() : '';

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
                        lastCompleted: optimisticLastCompleted,
                        itemType: 'checklist-item',
                    }
                    : i
            );
        });

        try {
            const completion = await updateTaskCompletion(
                id,
                checked ? optimisticLastCompleted : null,
            );
            setItems(prev => prev.map(item =>
                item.id === id
                    ? {
                        ...item,
                        lastCompleted: completion.lastCompleted ?? '',
                        nextDue: completion.nextDue,
                        done: isDateToday(completion.lastCompleted ?? ''),
                    }
                    : item
            ));
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

    const archiveItem = async (id: string) => {
        const item = items.find(currentItem => currentItem.id === id);
        if (!item) return;

        await updateTask({
            ...item,
            id,
            isArchived: !item.isArchived,
        });
        setItems(prev =>
            prev.map(currentItem =>
                currentItem.id === id
                    ? { ...currentItem, isArchived: !currentItem.isArchived }
                    : currentItem
            )
        );
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
                const orders = changed.map((item): TaskOrderUpdate => {
                    const old = prev.find(previous => previous.id === item.id);
                    const order: TaskOrderUpdate = { id: item.id };

                    if (old?.sortOrder !== item.sortOrder) {
                        order.sortOrder = item.sortOrder;
                    }

                    const oldTabOrder = old?.tabSortOrder?.[activeTab];
                    const newTabOrder = item.tabSortOrder?.[activeTab];
                    if (oldTabOrder !== newTabOrder && newTabOrder !== undefined) {
                        order.tabName = activeTab;
                        order.tabSortOrder = newTabOrder;
                    }

                    if (
                        old
                        && old.parentUuid !== item.parentUuid
                        && (item.accessRole === 'owner' || item.accessRole === 'editor')
                    ) {
                        order.parentUuid = item.parentUuid ?? null;
                    }

                    return order;
                }).filter(order => Object.keys(order).length > 1);

                if (orders.length > 0) {
                    updateTasksOrder(orders).catch(console.error);
                }
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
        let previousItem: ChecklistItem | undefined;

        setItems(prev => {
            previousItem = prev.find(item => item.id === id);
            return prev.map(item =>
                item.id === id ? { ...item, isHidden: false } : item
            );
        });

        try {
            await toggleHideToday(id, false);
        } catch (err) {
            if (previousItem) {
                setItems(prev =>
                    prev.map(item =>
                        item.id === id ? previousItem! : item
                    )
                );
            }
            throw err;
        }
    };

    useEffect(() => {
        if (!enabled) return;

        let cancelled = false;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadTasks(cancelled);
        const now = new Date();
        loadDateRef.current = now;

        return () => {
            cancelled = true;
        };
    }, [enabled, loadTasks])

    return (
        <TaskContext.Provider value={{
            itemLength,
            items,
            isLoading,
            taskError,
            loadTasks,
            addItem,
            partialUpdateItem,
            updateItem,
            bulkUpdate,
            deleteItem,
            toggleItem,
            prioritizeItem,
            archiveItem,
            sortItems,
            reset,
            getSubtasks,
            hideForToday,
            unhideForToday,
            loadDate: loadDateRef,
            isUpdatedDate,
        }}>
            {children}
        </TaskContext.Provider>
    );
};
