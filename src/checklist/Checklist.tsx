import { useState, useRef, useEffect, type FC, type ReactElement, useCallback } from 'react';
import type { ChecklistItem, Mode } from 'app/types';
import { DndContext, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableItem } from 'sortable-item/SortableItem';
import { ONE_TIME_MODE } from 'checklist/constants';
import 'checklist/checklist.css';
import type { ChecklistController } from 'checklist/types';
import CalendarEventItem from 'src/google-authorization/calendar-event-item';
import { TABS, type Tab } from 'src/app-toolbar/tabs/types';
import EmptyStateFilters from 'src/checklist/empty-state/EmptyStateFilters';
import { filterTasks } from 'src/app/utilities/filter-tasks';
import { useToast } from 'src/toast/use-toast';
import { ALL_MODES } from 'src/checklist/constants';
import type { GoogleEvent } from 'src/google-authorization/types';
import { usePullToRefresh } from 'src/checklist/utilities/use-pull-to-refresh.tsx';
import { motion, useReducedMotion } from 'framer-motion';
import { canEditTask } from 'src/sharing/chore-access';
import { isChoreAccessChangedError } from 'src/app/api';

function eventIncludesToday(startDate: Date | string, endDate: Date | string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    return start <= endOfToday && end >= startOfToday;
}

function eventIncludesAfterToday(startDate: Date | string, endDate: Date | string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    return start > endOfToday || end > endOfToday;
}

interface ChecklistProps {
    checklistType?: 'task' | 'template' | 'search-results';
    enablePullToRefresh: boolean;
    controller: ChecklistController;
    activeTab: Tab;
    modeFilter: Mode | typeof ALL_MODES;
    hideCompleted: boolean;
    filterCategory: string;
    sharedByMe?: boolean;
    sharedByOthers?: boolean;
    clearFilters: () => void;
    onEditItem: (item: ChecklistItem) => void;
    onEditEvent?: (item: GoogleEvent) => void;
    expandedNoteItemIds?: ReadonlySet<string>;
    itemLookup?: ReadonlyMap<string, ChecklistItem>;
    sparkles?: ReactElement;
}

const Checklist: FC<ChecklistProps> = ({
    checklistType = 'task',
    enablePullToRefresh,
    controller,
    activeTab,
    modeFilter,
    hideCompleted,
    filterCategory,
    sharedByMe = false,
    sharedByOthers = false,
    clearFilters,
    onEditItem,
    onEditEvent,
    expandedNoteItemIds,
    itemLookup,
    sparkles,
}) => {
    const {
        items,
        addItem, // for template page
        partialUpdateItem,
        deleteItem,
        toggleItem,
        prioritizeItem,
        archiveItem,
        sortItems,
        getSubtasks,
        hideForToday,
        unhideForToday,
        loadTasks,
        events,
        hideEventForToday,
        unhideEventForToday,
        isLoading
    } = controller;

    const [showSparkles, setShowSparkles] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const shouldReduceMotion = useReducedMotion();
    const sparkleTimeoutRef = useRef<number | null>(null);
    const listContentRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();
    const completedDayRef = useRef(false);
    const hasInitializedCompletedDayRef = useRef(false);
    const {
        refreshContainerRef,
        pullRefreshContainerClassName,
        PullToRefresh,
        pullDistance
      } = usePullToRefresh(
        loadTasks,
        (enablePullToRefresh ?? checklistType !== 'template') && !isDragging
      );

    const filteredItems = filterTasks({
        items,
        modeFilter,
        activeTab,
        hideCompleted,
        filterCategory,
        sharedByMe,
        sharedByOthers,
    })
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

    const filteredEvents = (sharedByMe || sharedByOthers) ? [] : events?.filter(event => {
        if (activeTab === TABS.hidden) return event.isHidden;
        if (event.isHidden) return false;
        if (activeTab === TABS.today) {
            return eventIncludesToday(event.startDate, event.endDate);
        }
        if (activeTab === TABS.upcoming) {
            return eventIncludesAfterToday(event.startDate, event.endDate);
        }
        return false;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) ?? [];

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

    const completedDay = (items.some(item => item.done) || items.some(item => item.isHidden)) &&
        items.length !== 0 && filteredItems.length === 0 && activeTab === TABS.today;

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

        setIsDragging(true);
    }
    const handleDragEnd = (event: DragEndEvent) => {
        setIsDragging(false);

        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeItem = items.find(item => item.id === active.id);
        const overItem = items.find(item => item.id === over.id);
        if (
            activeItem
            && overItem
            && !canEditTask(activeItem.accessRole)
            && (activeItem.parentUuid ?? null) !== (overItem.parentUuid ?? null)
        ) {
            showToast('Owner or editor access is required to move tasks between groups.', 'error');
            return;
        }

        sortItems(filteredItems, activeTab, active.id as string, over.id as string);
    };

    const handleDragCancel = () => {
        setIsDragging(false);
    };

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
            const undoAction = () => {
                // restore last completed date if unchecking
                if (selectedItem && checked) {
                    const updatedItem = {
                        id: id,
                        // unarchive if the item has been archived
                        lastCompleted: selectedItem.lastCompleted,
                        ...((selectedItem?.mode === ONE_TIME_MODE
                            && canEditTask(selectedItem.accessRole)) ?
                            { isArchived: false } : {}),
                    } as Partial<ChecklistItem>;
                    partialUpdateItem(updatedItem);
                }
            };
            if (checked) {
                showToast(`"${selectedItem?.text}" completed`, 'success', undoAction);
            }
            // archive if item's mode is ONE_TIME_MODE and is being marked completed
            if (
                selectedItem?.mode === ONE_TIME_MODE
                && checked
                && canEditTask(selectedItem.accessRole)
            ) {
                await archiveItem(id);
                showToast('Task archived successfully', 'success');
            }
        } catch (err) {
            console.error('Failed to toggle task:', err);
            if (!isChoreAccessChangedError(err)) {
                showToast('Failed to update task status. Please try again.', 'error');
            }
        }
    };

    const handleEventEdit = (id: string) => {
        if (!events) return;
        const selectedEvent = events.find(event => event.id === id);
        if (!selectedEvent) return;
        onEditEvent?.({
            ...selectedEvent,
            itemType: 'google-event',
        } as GoogleEvent);
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
        const selectedItem = items.find(item => item.id === id);
        if (!selectedItem) return;
        try {
            if (isHiddenItem) {
                await unhideForToday(id as string);
            } else {
                await hideForToday(id as string);
                const undoAction = () => {
                    unhideForToday(id as string);
                };
                showToast(`"${selectedItem?.text}" hidden for today`, 'success', undoAction);
            }
        } catch (err) {
            console.error('Failed to update task visibility:', err);
            if (!isChoreAccessChangedError(err)) {
                showToast('Failed to update task visibility. Please try again.', 'error');
            }
        }
    };

    const handleEventHide = async (id: string, isHiddenItem: boolean) => {
        try {
            if (isHiddenItem) {
                await unhideEventForToday(id as string);
            } else {
                await hideEventForToday(id as string);
            }
        } catch (err) {
            console.error('Failed to update event visibility:', err);
            showToast('Failed to update event visibility. Please try again.', 'error');
        }
    };

    const handleMoveItem = async (id: string, isArchived: boolean) => {
        try {
            await archiveItem(id);
            if (isArchived) {
                showToast('Task un-archived successfully', 'success');
            } else {
                showToast('Task archived successfully', 'success');
            }
        } catch (err) {
            console.error('Failed to archive task:', err);
            if (!isChoreAccessChangedError(err)) {
                showToast('Failed to archive task. Please try again.', 'error');
            }
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
        const noOtherFilters = modeFilter === ALL_MODES && filterCategory === 'all' &&
            sharedByMe === false && sharedByOthers === false;

        // Prevent sparkle animation on initial page load.
        if (!hasInitializedCompletedDayRef.current) {
            completedDayRef.current = completedDay;
            hasInitializedCompletedDayRef.current = true;
            return;
        }

        if (!completedDayRef.current && completedDay && noOtherFilters && activeTab === TABS.today) {
            setTimeout(() => {
                displaySparkles();
            }, 0);
        }

        completedDayRef.current = completedDay;
    }, [completedDay, activeTab, modeFilter, filterCategory, displaySparkles]);

    useEffect(() => {
        const contentElement = listContentRef.current;
        if (!contentElement) return;

        contentElement.style.transform = pullDistance ? `translateY(${pullDistance}px)` : 'translateY(0px)';
        contentElement.style.transition = pullDistance ? 'none' : 'transform 220ms ease-out';
    }, [pullDistance]);

    if (isLoading) {
        return (
            <div className="app_loading-container">
                <div aria-busy="true" className="app_loading-spinner"></div>
                <p>Loading your tasks...</p>
            </div>
        );
    }

    return (
        <>
            {showSparkles && sparkles}
            <DndContext
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
                onDragCancel={handleDragCancel}
                sensors={sensors}
            >
                <div
                    className={
                        `checklist_list-container
                        checklist_list-container--${checklistType}
                        ${pullRefreshContainerClassName} ${pullDistance ?
                        "checklist_list-container--pulling" : ""}`
                    }
                    ref={refreshContainerRef}
                >
                    <PullToRefresh />
                    <div
                        className="checklist_list-content"
                        ref={listContentRef}
                    >
                        <SortableContext items={allItems.map(i => i.id)}>
                            {activeTab === TABS.today && !allItems.length && (
                                <EmptyStateFilters
                                    modeFilter={modeFilter}
                                    onClearFilters={clearFilters}
                                    filterCategory={filterCategory}
                                    hideCompleted={hideCompleted}
                                    sharedByMe={sharedByMe}
                                    sharedByOthers={sharedByOthers}
                                    type={items.length === 0 ? 'noTasks' :completedDay ? 'completedDay' : 'noTasks'}
                                />
                            )}
                            {(allItems as (ChecklistItem | GoogleEvent)[]).map((item) => {
                                if ((item as GoogleEvent).itemType === 'google-event') {
                                    const eventItem = item as GoogleEvent;
                                    return (<CalendarEventItem
                                        key={eventItem.id}
                                        event={eventItem}
                                        onHideItem={handleEventHide}
                                        onEdit={handleEventEdit}
                                    />);
                                } else if (item.itemType === 'checklist-item') {
                                    const checklistItem = item as ChecklistItem;
                                    const checklistItemElement = (
                                        <SortableItem
                                            checklistType={checklistType}
                                            activeTab={activeTab}
                                            hasSubChores={checklistItem.hasSubChores}
                                            isSubChore={!!checklistItem.parentUuid}
                                            parentUuid={checklistItem.parentUuid}
                                            isArchived={checklistItem.isArchived}
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
                                            addItem={addItem}
                                            partialUpdateItem={partialUpdateItem}
                                            getSubtasks={getSubtasks}
                                            recurrence={checklistItem.recurrence}
                                            accessRole={checklistItem.accessRole}
                                            ownerName={checklistItem.ownerName}
                                            hasMembers={checklistItem.hasMembers}
                                            expandedNoteItemIds={expandedNoteItemIds}
                                            itemLookup={itemLookup}
                                        />
                                    );

                                    if (checklistType === 'search-results') {
                                        return (
                                            <motion.div
                                                className="search-result-item"
                                                key={checklistItem.id}
                                                initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: shouldReduceMotion ? 0 : 0.14, ease: 'easeOut' }}
                                            >
                                                {checklistItemElement}
                                            </motion.div>
                                        );
                                    }

                                    return checklistItemElement;
                                }
                                return null;
                            })}
                            {/* Placeholder div to ensure proper spacing at the end of the list */}
                            <div className="placeholder" />
                        </SortableContext>
                    </div>
                </div>
            </DndContext>
        </>
    )
}

export default Checklist;
