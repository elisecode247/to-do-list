import { CALENDAR_RECURRENCE, INTERVAL_RECURRENCE, ONE_TIME_RECURRENCE, type ApiRecurrence, type ChecklistItem } from 'app/types';
import { isDateToday } from 'src/utilities/is-date-today';
import { type Tab } from 'src/app-toolbar/tabs/types';
import { getReorderedItems } from 'src/app/utilities/get-reorder-items';
import { ONE_TIME_MODE } from 'src/checklist/constants';
import type {
    IntervalRecurrence,
    CalendarRecurrence,
    OneTimeRecurrence,
    FrequencyType,
    EndingConditionType,
} from 'app/types';
import { useState, useEffect, useRef, type ReactNode } from 'react';
import { DemoTaskContext } from './demo-task-context';
import { DEMO_TASKS } from './demo-tasks';

const STORAGE_KEY = 'demo-tasks';

const generateId = () => {
    return Math.random().toString(36).substring(2, 11);
};

interface StoredTask {
    id: string;
    text: string;
    done?: boolean;
    lastCompleted?: string;
    note?: string;
    sortOrder?: number;
    tabSortOrder?: Record<string, number>;
    category?: string;
    categoryUuid?: string | null;
    mode?: string;
    isArchived?: boolean;
    isPriority?: boolean;
    isHidden?: boolean;
    parentUuid?: string | null;
    hasSubChores?: boolean;
    recurrence?: IntervalRecurrence | CalendarRecurrence | OneTimeRecurrence | null;
    nextDue?: string;
    listId?: string;
}

const loadTasksFromStorage = (): ChecklistItem[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            const initialTasks = DEMO_TASKS.map((task) => ({
                ...task,
                itemType: 'checklist-item' as const,
                lastCompleted: task.lastCompleted ?? '',
                done: isDateToday(task.lastCompleted),
            }));

            const initialTasksForStorage = initialTasks.map((task) => {
                const storageTask: Omit<ChecklistItem, 'itemType'> & { itemType?: ChecklistItem['itemType'] } = { ...task };
                delete storageTask.itemType;
                return storageTask;
            });

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(initialTasksForStorage)
            );

            return initialTasks;
        }

        const tasks: StoredTask[] = JSON.parse(stored);
        return tasks.map((task: StoredTask) => ({
            ...task,
            itemType: 'checklist-item' as const,
            lastCompleted: task.lastCompleted ?? '',
            done: isDateToday(task.lastCompleted),
        } as ChecklistItem));
    } catch (error) {
        console.error('Failed to load tasks from localStorage:', error);
        return [];
    }
};

const saveTasksToStorage = (tasks: ChecklistItem[]) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const toStore = tasks.map(({ itemType, ...rest }) => rest);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
        console.error('Failed to save tasks to localStorage:', error);
        throw error;
    }
};

export const DemoTaskProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [taskError, setTaskError] = useState<string | null>(null);
    const loadDateRef = useRef(new Date());
    const itemLength = items.length;
    const clear = () => {
        setTaskError(null);
        setIsLoading(true);
        try {
            localStorage.removeItem(STORAGE_KEY);
            setItems([]);
        } catch (error) {
            console.error('Failed to clear demo tasks:', error);
            setTaskError('Failed to clear demo tasks.');
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setTaskError(null);
        setIsLoading(true);
        try {
            localStorage.removeItem(STORAGE_KEY);
            const seededTasks = loadTasksFromStorage();
            setItems(seededTasks);
        } catch (error) {
            console.error('Failed to reset demo tasks:', error);
            setTaskError('Failed to reset demo tasks.');
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    function loadTasks() {
        setTaskError(null);
        setIsLoading(true);
        try {
            const tasks = loadTasksFromStorage();
            setItems(tasks);
            setTaskError(null);
        } catch (error) {
            console.error(error);
            setTaskError('Failed to load your tasks.');
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }

    const updateItem = async (updatedItem: ChecklistItem) => {
        let previousItem: ChecklistItem | undefined;

        setItems(prev => {
            previousItem = prev.find(i => i.id === updatedItem.id);
            return prev.map(i => i.id === updatedItem.id ? { ...updatedItem } : i);
        });

        try {
            const updated = items.map(i =>
                i.id === updatedItem.id ? { ...updatedItem } : i
            );
            saveTasksToStorage(updated);
        } catch (error) {
            if (previousItem) {
                setItems(prev =>
                    prev.map(i => i.id === previousItem!.id ? previousItem! : i)
                );
            }
            throw error;
        }
    };

    const bulkUpdate = async (updatedItems: ChecklistItem[]) => {
        try {
            setItems(prev => {
                const updated = prev.map(item => {
                    const updatedItem = updatedItems.find(i => i.id === item.id);
                    return updatedItem ? { ...item, ...updatedItem } : item;
                });
                saveTasksToStorage(updated);
                return updated;
            });
        } catch (error) {
            console.error('Failed to bulk update tasks:', error);
            throw error;
        }
    };

    const addItem = async (newItem: ChecklistItem) => {
        function mapRecurrence(rec: ApiRecurrence | null): IntervalRecurrence | CalendarRecurrence | OneTimeRecurrence | null {
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
                case CALENDAR_RECURRENCE:
                    return {
                        type: CALENDAR_RECURRENCE,
                        startDate: rec.startDate ? new Date(rec.startDate).toISOString() : new Date().toISOString(),
                        frequency: rec.frequency as FrequencyType,
                        weekDaysRepetition: rec.weekDaysRepetition ?? [],
                        endingCondition: rec.endingCondition as EndingConditionType,
                        endingOccurrencesNumber: rec.endingOccurrencesNumber,
                        endDate: rec.endDate ? new Date(rec.endDate).toISOString() : undefined,
                        isAllDay: rec.isAllDay ?? false,
                        startTime: rec.startTime ? new Date(rec.startTime).toISOString() : undefined,
                        endTime: rec.endTime ? new Date(rec.endTime).toISOString() : undefined,
                    };
                default:
                    throw new Error('Unknown recurrence type');
            }
        }
        try {

            const formattedTask: ChecklistItem = {
                itemType: 'checklist-item',
                id: newItem.id || generateId(),
                isPriority: newItem.isPriority ?? false,
                isHidden: newItem.isHidden ?? false,
                done: false,
                text: newItem.text,
                lastCompleted: '',
                note: newItem.note ?? '',
                sortOrder: newItem.sortOrder ?? 0,
                tabSortOrder: newItem.tabSortOrder ?? {},
                category: newItem.category,
                categoryUuid: newItem.categoryUuid ?? null,
                mode: newItem.mode ?? ONE_TIME_MODE,
                isArchived: false,
                parentUuid: newItem.parentUuid ?? null,
                hasSubChores: newItem.hasSubChores ?? false,
                recurrence: mapRecurrence(newItem.recurrence),
                nextDue: newItem.nextDue,
                listId: newItem.listId,
            };

            setItems(prev => {
                let updatedPrev = [formattedTask, ...prev];
                if (formattedTask.parentUuid) {
                    updatedPrev = prev.map(item => {
                        if (item.id === formattedTask.parentUuid) {
                            return { ...item, hasSubChores: true };
                        }
                        return item;
                    });
                    updatedPrev = [formattedTask, ...updatedPrev];
                }
                saveTasksToStorage(updatedPrev);
                return updatedPrev;
            });
        } catch (err) {
            console.error('Failed to add task:', err);
            throw err;
        }
    };

    const deleteItem = (id: string) => {
        try {
            setItems(prev => {
                const deletedTask = prev.find(item => item.id === id);
                const parentSubTaskCount = prev.filter(item => item.parentUuid === deletedTask?.parentUuid).length;
                let updatedPrev = prev.map(item => {
                    if (item.id === deletedTask?.parentUuid && parentSubTaskCount === 1) {
                        return { ...item, hasSubChores: false };
                    }
                    return item;
                });
                updatedPrev = updatedPrev.filter(item => item.id !== id);
                saveTasksToStorage(updatedPrev);
                return updatedPrev;
            });
        } catch (err) {
            console.error('Failed to delete task:', err);
            throw err;
        }
    };

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
                        itemType: 'checklist-item' as const,
                    }
                    : i
            );
        });

        try {
            const updated = items.map(i =>
                i.id === id
                    ? {
                        ...i,
                        done: checked,
                        lastCompleted: checked ? new Date().toISOString() : '',
                    }
                    : i
            );
            saveTasksToStorage(updated);
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

    const prioritizeItem = (id: string) => {
        setItems(prev => {
            const updated = prev.map(item => {
                if (item.id !== id) return item;

                return {
                    ...item,
                    isPriority: !item.isPriority
                };
            });

            try {
                saveTasksToStorage(updated);
            } catch (err) {
                console.error('Failed to prioritize task:', err);
            }

            return updated;
        });
    };

    const archiveItem = (id: string) => {
        try {
            setItems(prev => {
                const updated = prev.map(item =>
                    item.id === id
                        ? { ...item, isArchived: !item.isArchived }
                        : item
                );
                saveTasksToStorage(updated);
                return updated;
            });
        } catch (err) {
            console.error('Failed to archive task:', err);
        }
    };

    const sortItems = (
        filteredItems: ChecklistItem[],
        activeTab: Tab,
        activeId: string,
        overId: string
    ) => {
        setItems(prev => {
            const sortedSubset = getReorderedItems({
                allItems: prev,
                filteredItems,
                activeTab,
                activeId,
                overId
            });

            const updatedMap = new Map(
                sortedSubset.map((i: ChecklistItem) => [i.id, i])
            );

            const updated = prev.map((item: ChecklistItem) =>
                updatedMap.get(item.id) ?? item
            );

            const changed = sortedSubset.filter((item: ChecklistItem) => {
                const old = prev.find((p: ChecklistItem) => p.id === item.id);
                return (
                    old?.sortOrder !== item.sortOrder ||
                    old?.parentUuid !== item.parentUuid ||
                    old?.tabSortOrder !== item.tabSortOrder
                );
            });

            if (changed.length > 0) {
                try {
                    saveTasksToStorage(updated);
                } catch (err) {
                    console.error('Failed to save task order:', err);
                }
            }

            return updated;
        });
    };

    const getSubtasks = (parentId: string) => {
        if (!parentId) return [];
        return items.filter(item => item.parentUuid === parentId)
            .sort((a, b) => a.sortOrder - b.sortOrder);
    };

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
            const updated = items.map(i =>
                i.id === id ? { ...i, isHidden: true } : i
            );
            saveTasksToStorage(updated);
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
                const updated = prev.map(item => item.id === id ? { ...item, isHidden: false } : item);
                saveTasksToStorage(updated);
                return updated;
            });
        } catch (err) {
            console.error('Failed to unhide task for today:', err);
            throw err;
        }
    };

    useEffect(() => {
        loadTasks();
        const now = new Date();
        loadDateRef.current = now;
        const handleVisibility = () => {
            const staleAfter = 5 * 60 * 1000;
            if (!loadDateRef.current || new Date().getTime() - loadDateRef.current.getTime() > staleAfter) {
                loadTasks();
                const updatedNow = new Date();
                loadDateRef.current = updatedNow;
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility)
        };
    }, [])

    return (
        <DemoTaskContext.Provider value={{
            itemLength,
            items,
            isLoading,
            taskError,
            loadTasks,
            addItem,
            updateItem,
            bulkUpdate,
            deleteItem,
            toggleItem,
            prioritizeItem,
            archiveItem,
            sortItems,
            clear,
            reset,
            getSubtasks,
            hideForToday,
            unhideForToday,
            loadDate: loadDateRef,
        }}>
            {children}
        </DemoTaskContext.Provider>
    );
};
