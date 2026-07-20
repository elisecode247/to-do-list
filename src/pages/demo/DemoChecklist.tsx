import { useState, useMemo, useRef, useEffect, type FC, type ReactElement, useCallback } from 'react';
import type { ChecklistItem, Mode } from 'app/types';
import { DndContext, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableItem } from 'sortable-item/SortableItem';
import { ONE_TIME_MODE } from 'checklist/constants';
import 'checklist/checklist.css';
import { useDemoTask } from 'src/pages/demo/use-demo-task';
import { useGoogleCalendar } from 'src/google-authorization/use-google-calendar';
import CalendarEventItem from 'src/google-authorization/calendar-event-item';
import { TABS, type Tab } from 'src/app-toolbar/tabs/types';
import EmptyStateFilters from 'src/checklist/empty-state/EmptyStateFilters';
import { filterTasks } from 'src/app/utilities/filter-tasks';
import { useToast } from 'src/toast/use-toast';
import { ALL_MODES } from 'src/checklist/constants';
import type { GoogleEvent } from 'src/google-authorization/types';
import { useReducedMotion } from 'framer-motion';

function isTodayOrBefore(date: Date) {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // end of today
  return date <= today;
}

function isTomorrowOrLater(date: Date) {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // end of today
  return date > today;
}

interface ChecklistProps {
    activeTab: Tab;
    modeFilter: Mode | typeof ALL_MODES;
    hideCompleted: boolean;
    filterCategory: string;
    clearFilters: () => void;
    onEditItem: (item: ChecklistItem) => void;
    sparkles: ReactElement;
}

const DemoChecklist: FC<ChecklistProps> = ({
    activeTab,
    modeFilter,
    hideCompleted,
    filterCategory,
    clearFilters,
    onEditItem,
    sparkles
}) => {
    const {
        items,
        deleteItem,
        toggleItem,
        prioritizeItem,
        archiveItem,
        sortItems,
        getSubtasks,
        hideForToday,
        unhideForToday,
    } = useDemoTask();
    const { events } = useGoogleCalendar();
    const shouldReduceMotion = useReducedMotion();
    const [showSparkles, setShowSparkles] = useState(false);
    const sparkleTimeoutRef = useRef<number | null>(null);
    const { showToast } = useToast();
    const completedDayRef = useRef(false);

    const filteredItems = useMemo(() => {
        return filterTasks({ items, modeFilter, activeTab, hideCompleted, filterCategory })
            .sort((a, b) => {
                if (activeTab === TABS.priority || activeTab === TABS.hidden || activeTab === TABS.archived) {
                    return (a.tabSortOrder?.[activeTab] ?? 0) - (b.tabSortOrder?.[activeTab] ?? 0);
                } else if (activeTab === TABS.upcoming) {
                    const aDue = a.nextDue ? new Date(a.nextDue).getTime() : Infinity;
                    const bDue = b.nextDue ? new Date(b.nextDue).getTime() : Infinity;
                    return aDue - bDue;
                }
                return a.sortOrder - b.sortOrder;
            });
    }, [items, modeFilter, activeTab, hideCompleted, filterCategory]);

    const filteredEvents = events.filter(event => {
        if (activeTab === TABS.today) {
            return isTodayOrBefore(event.startDate);
        } else if (activeTab === TABS.upcoming) {
            return isTomorrowOrLater(event.startDate);
        }
        return false;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const getItemDate = (item: ChecklistItem | GoogleEvent) => {
        if ('startDate' in item) {
            return new Date(item.startDate).getTime();
        }
        if ('due' in item) {
            return item.due ? new Date(item.due).getTime() : Infinity;
        }
        return item.nextDue ? new Date(item.nextDue).getTime() : Infinity;
    };

    const allItems = [...filteredEvents, ...filteredItems].sort((a, b) => {
        if (activeTab === TABS.upcoming) {
            const aDate = getItemDate(a as ChecklistItem | GoogleEvent);
            const bDate = getItemDate(b as ChecklistItem | GoogleEvent);
            return aDate - bDate;
        }

        return 1;
    });
    const completedDay = items.filter(i => i.done).length &&
        filteredItems.length === 0 && activeTab === TABS.today;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
                delay: 100,
            },
        })
    );
    function handleDragStart(event: DragStartEvent) {
        const active = items.find(t => t.id === event.active.id) || items.find(i => i.id === event.active.id);
        if (!active) return;
    }
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        sortItems(filteredItems, activeTab, active.id as string, over.id as string);
    }, [activeTab, filteredItems, sortItems]);

    const toggleChecked = async (id: string, checked: boolean) => {
        const selectedItem = items.find(item => item.id === id);
        if (!checked) {
            const confirmed = confirm('If you uncheck, you will lose ' +
                'the last completed date. Are you sure?'
            );
            if (!confirmed) return;
        }
        try {
            await toggleItem(id, checked);
            // archive if item's mode is ONE_TIME_MODE and is being marked completed
            if (selectedItem?.mode === ONE_TIME_MODE && checked) {
                await archiveItem(id);
                showToast('Task archived successfully', 'success');
            }
        } catch (err) {
            console.error('Failed to toggle task:', err);
            showToast('Failed to update task status. Please try again.', 'error');
        }
    };


    const handleEdit = (id: string) => {
        const selectedItem = items.find(item => item.id === id);
        if (!selectedItem) return;

        const formattedItem = {
            ...selectedItem,
            lastCompleted: selectedItem.lastCompleted
                ? new Date(selectedItem.lastCompleted).toISOString()
                : ''
        };

        onEditItem(formattedItem);
    };

    const handleHide = async (id: string, isHiddenItem: boolean) => {
        try {
            if (isHiddenItem) {
                await unhideForToday(id as string);
            } else {
                await hideForToday(id as string);
            }
        } catch (err) {
            console.error('Failed to update task visibility:', err);
            showToast('Failed to update task visibility. Please try again.', 'error');
        }
    };

    const handleEventHide = async (id: string, isHidden: boolean) => {
        try {
            if (isHidden) {
                await unhideForToday(id as string);
            } else {
                await hideForToday(id as string);
            }
        } catch (err) {
            console.error('Failed to update event visibility:', err);
            showToast('Failed to update event visibility. Please try again.', 'error');
        }
    };

    const handleMoveItem = async (id: string) => {
        try {
            await archiveItem(id);
            showToast('Task archived successfully', 'success');
        } catch (err) {
            console.error('Failed to archive task:', err);
            showToast('Failed to archive task. Please try again.', 'error');
        }
    };



    const displaySparkles = useCallback(() => {
        if (shouldReduceMotion) return;
        setShowSparkles(true);
        if (sparkleTimeoutRef.current) {
            clearTimeout(sparkleTimeoutRef.current);
        }

        sparkleTimeoutRef.current = window.setTimeout(() => {
            setShowSparkles(false);
            sparkleTimeoutRef.current = null;
        }, 3000)
    }, [shouldReduceMotion]);

    useEffect(() => {
        return () => {
            if (sparkleTimeoutRef.current) {
                clearTimeout(sparkleTimeoutRef.current);
                sparkleTimeoutRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!completedDayRef.current && completedDay && activeTab === TABS.today) {
            setTimeout(() => {
                displaySparkles()
                completedDayRef.current = !!completedDay;
            }, 0);
        }
    }, [completedDay, activeTab, displaySparkles]);

    return (
        <>
            {showSparkles && sparkles}
            <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
                <div className="checklist_list-container">
                    <SortableContext items={allItems.map(i => i.id)}>
                        {!allItems.length && (
                            <EmptyStateFilters
                                modeFilter={modeFilter}
                                onClearFilters={clearFilters}
                                filterCategory={filterCategory}
                                hideCompleted={hideCompleted}
                                type={completedDay ? 'completedDay' : 'noTasks'}
                            />
                        )}
                        {(allItems as (ChecklistItem | GoogleEvent)[]).map((item) => {
                            if ((item as GoogleEvent).itemType === 'google-event') {
                                const eventItem = item as GoogleEvent;
                                return (<CalendarEventItem
                                    key={eventItem.id}
                                    event={eventItem}
                                    onHideItem={handleEventHide}
                                    onEdit={handleEdit}
                                />);
                            } else if (item.itemType === 'checklist-item') {
                                const checklistItem = item as ChecklistItem;
                                return (
                                    <SortableItem
                                        activeTab={activeTab}
                                        hasSubChores={checklistItem.hasSubChores}
                                        isSubChore={!!checklistItem.parentUuid}
                                        isPriority={checklistItem.isPriority}
                                        checked={checklistItem.done}
                                        key={checklistItem.id}
                                        id={checklistItem.id}
                                        isHidden={checklistItem.isHidden}
                                        isHideCompleted={hideCompleted}
                                        text={checklistItem.text}
                                        note={checklistItem.note}
                                        mode={checklistItem.mode}
                                        category={checklistItem.category}
                                        lastCompleted={checklistItem.lastCompleted}
                                        deleteItem={deleteItem}
                                        prioritizeItem={prioritizeItem}
                                        toggleChecked={toggleChecked}
                                        handleEdit={handleEdit}
                                        handleHideItem={handleHide}
                                        subtasks={getSubtasks(checklistItem.id)}
                                        onMoveItem={handleMoveItem}
                                        onSuccess={displaySparkles}
                                        nextDue={checklistItem.nextDue}
                                        recurrence={checklistItem.recurrence}
                                        hasMembers={false}
                                    />
                                );
                            }
                            return null;
                        })}
                        {/* Placeholder div to ensure proper spacing at the end of the list */}
                        <div className="demo-placeholder" />
                    </SortableContext>
                </div>
            </DndContext>
        </>
    )
}

export default DemoChecklist;
