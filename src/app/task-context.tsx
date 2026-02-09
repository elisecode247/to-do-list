import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { ChecklistItem } from 'app/types';
import { fetchTasks, updateTask, updateTasksOrder, deleteTask, addTask } from 'app/api';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { PRIORITY_TAG, type Tag, isExclusiveTag } from 'src/checklist/constants';
import { useAuthentication } from 'src/authentication/use-authentication';
import { useToast } from 'src/toast/use-toast';
import { isDateToday } from 'src/utilities/is-date-today';
import { isCategoryIncluded } from 'src/category-select/category-constants';
import { TABS } from 'src/checklist/tabs/Tabs';

type FilterParams = {
    activeFilters: Tag[];
    activeTab: string;
    hideCompleted: boolean;
    filterCategory: string;
    isHiddenToday: (id: string) => boolean;
};
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
    reorderItems: (activeId: UniqueIdentifier, overId: UniqueIdentifier) => void;
    reset: () => void;
    filterTasks: (params: FilterParams) => ChecklistItem[];
    getSubtasks: (parentId: UniqueIdentifier) => ChecklistItem[];
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
                    done: isDateToday(item.lastCompleted),
                    tags: item.tags || [],
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

    const deleteItem = (id: UniqueIdentifier) => {
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

    const reorderItems = (activeId: UniqueIdentifier, overId: UniqueIdentifier) => {
        setItems(prevItems => {
            const activeItem = prevItems.find(i => i.id === activeId);

            if (!activeItem) return prevItems;

            // Detect placeholder dropzone
            let isFirstSubTask = false;
            let placeholderParentId: UniqueIdentifier | null = null;

            if (typeof overId === "string" && overId.startsWith("placeholder-")) {
                isFirstSubTask = true;
                placeholderParentId = overId.replace("placeholder-", "");
                overId = placeholderParentId;
            }

            const overItem = prevItems.find(i => i.id === overId);

            if (!overItem) return prevItems;

            const oldParent = (activeItem.parentUuid ?? null) as UniqueIdentifier | null;

            // If placeholder is used, newParent becomes the *parent task itself*
            const newParent: UniqueIdentifier | null = isFirstSubTask ? (overItem.id as UniqueIdentifier) : (overItem.parentUuid ?? null);

            const getSiblings = (parentUuid: UniqueIdentifier | null) =>
                prevItems
                    .filter(i => (i.parentUuid ?? null) === parentUuid)
                    .sort((a, b) => a.sortOrder - b.sortOrder);

            // SAME PARENT REORDER
            if (oldParent === newParent && !isFirstSubTask) {
                const siblings = getSiblings(oldParent);

                const oldIndex = siblings.findIndex(i => i.id === activeId);
                const newIndex = siblings.findIndex(i => i.id === overId);

                if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
                    return prevItems;
                }

                const reordered = arrayMove(siblings, oldIndex, newIndex).map((item, index) => ({
                    ...item,
                    sortOrder: index,
                }));

                const otherItems = prevItems.filter(item => (item.parentUuid ?? null) !== oldParent);

                updateTasksOrder(
                    reordered.map(({ id, sortOrder, parentUuid }) => ({
                        id,
                        sortOrder,
                        parentUuid: parentUuid ?? null,
                    }))
                ).catch(console.error);

                return [...otherItems, ...reordered];
            }

            // CROSS PARENT MOVE
            const oldSiblings = getSiblings(oldParent).filter(i => i.id !== activeId);
            const newSiblings = getSiblings(newParent);

            // If placeholder dropzone, insert at index 0 always
            let targetIndex = 0;

            if (!isFirstSubTask) {
                const insertIndex = newSiblings.findIndex(i => i.id === overId);
                targetIndex = insertIndex === -1 ? newSiblings.length : insertIndex;
            }

            const movedItem = {
                ...activeItem,
                parentUuid: newParent,
            };

            const updatedNewSiblings = [
                ...newSiblings.slice(0, targetIndex),
                movedItem,
                ...newSiblings.slice(targetIndex),
            ].map((item, index) => ({
                ...item,
                sortOrder: index,
            }));

            const updatedOldSiblings = oldSiblings.map((item, index) => ({
                ...item,
                sortOrder: index,
            }));

            const untouched = prevItems.filter(i => {
                const p = i.parentUuid ?? null;
                return p !== oldParent && p !== newParent && i.id !== activeId;
            });

            let updatedItems = [...untouched, ...updatedOldSiblings, ...updatedNewSiblings];

            // --- Update hasSubChores dynamically ---
            const parentIds = [oldParent, newParent].filter(Boolean) as UniqueIdentifier[];
            updatedItems = updatedItems.map(item => {
                if (parentIds.includes(item.id)) {
                    const childCount = updatedItems.filter(i => i.parentUuid === item.id).length;
                    return { ...item, hasSubChores: childCount > 0 };
                }
                return item;
            });

            // Persist order to DB
            updateTasksOrder(
                [...updatedOldSiblings, ...updatedNewSiblings].map(({ id, sortOrder, parentUuid }) => ({
                    id,
                    sortOrder,
                    parentUuid: parentUuid ?? null,
                }))
            ).catch(console.error);

            return updatedItems;
        });
    };

    const filterTasks = ({
        activeFilters,
        activeTab,
        hideCompleted,
        filterCategory,
        isHiddenToday
    }: FilterParams) => {
        if (!items.length) return items;

        let filteredItems = [...items].map(item =>
            ({ ...item, isHidden: isHiddenToday(item.id as string)})
        );

        // --- Tab filtering ---
        filteredItems = filteredItems.filter(task => {
            switch (activeTab) {
                case TABS.active:
                    return (
                        !task.isArchived ||
                        task.tags.includes('scheduled') // TODO  && new Date(task.due) <= today
                    );
                case TABS.scheduled:
                    return task.tags.includes('scheduled');
                case TABS.hidden:
                    return task.isHidden;
                case TABS.archived:
                    return task.isArchived;
                case TABS.priority:
                    return task.tags.includes('priority');
                default:
                    return true;
            }
        });

        // --- Further filters ---
        const exclusiveFilters = activeFilters.filter(tag => isExclusiveTag(tag));
        const nonExclusiveFilters = activeFilters.filter(tag => !isExclusiveTag(tag));

        filteredItems = filteredItems.filter(task => {
            // skip subtasks
            if (task.parentUuid) return false;

            // hide completed tasks
            if (hideCompleted && task.done) return false;

            const tagSet = new Set(task.tags);

            // OR logic for exclusive tags
            if (exclusiveFilters.length > 0 && !exclusiveFilters.some(tag => tagSet.has(tag))) {
                return false;
            }

            // AND logic for non-exclusive tags
            if (!nonExclusiveFilters.every(tag => tagSet.has(tag))) return false;

            // category filter
            if (!isCategoryIncluded(filterCategory, task.category)) return false;

            // hidden today filter
            if (activeTab !== TABS.hidden && task.isHidden) return false;

            return true;
        });

        return filteredItems;
    };


    const getSubtasks = (parentId: UniqueIdentifier) => {
        if (!parentId) return [];
        return items.filter(item => item.parentUuid === parentId);
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
            reorderItems,
            reset,
            filterTasks,
            getSubtasks,
        }}>
            {children}
        </TaskContext.Provider>
    );
};

