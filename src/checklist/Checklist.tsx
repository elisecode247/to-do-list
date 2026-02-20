import { useState, useMemo, useRef, useEffect, type FC, type ReactElement, useCallback } from 'react';
import type { ChecklistItem, Mode } from 'app/types';
import { DndContext, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableItem } from 'sortable-item/SortableItem';
import { ONE_TIME_MODE } from 'checklist/constants';
import 'checklist/checklist.css';
import { useTask } from 'src/app/use-task';
import { useCalendarIntegration } from 'src/google-authorization/use-google-calendar';
import CalendarEventItem from 'src/google-authorization/calendar-event-item';
import ScheduledTaskItem from 'src/google-authorization/scheduled-task-item';
import { TABS, type Tab } from 'src/app-toolbar/tabs/types';
import EmptyStateFilters from './empty-state/EmptyStateFilters';
import { filterTasks } from 'src/app/utilities/filter-tasks';
import { useToast } from 'src/toast/use-toast';
import { ALL_MODES } from 'src/checklist/constants';

interface ChecklistProps {
    activeTab: Tab;
    modeFilter: Mode | typeof ALL_MODES;
    hideCompleted: boolean;
    filterCategory: string;
    clearFilters: () => void;
    onEditItem: (item: ChecklistItem) => void;
    sparkles: ReactElement;
}

const Checklist: FC<ChecklistProps> = ({
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
    } = useTask();
    const { events, tasks, markScheduledTaskCompletion } = useCalendarIntegration();

    const [showSparkles, setShowSparkles] = useState(false);
    const sparkleTimeoutRef = useRef<number | null>(null);
    const isActiveList = activeTab === TABS.today;
    const { showToast } = useToast();
    const completedDayRef = useRef(false);

    const filteredTasks = useMemo(() => {
        return tasks.map(task => ({ ...task })).filter(task => {
            if (activeTab === TABS.hidden && task.isHidden) return true;
            if (activeTab === TABS.scheduled && !task.isHidden) return true;
            if (activeTab === TABS.today && !task.isHidden) return true;
            return false;

        });
    }, [tasks, activeTab]);

    const filteredItems = useMemo(() => {
        return filterTasks({ items, modeFilter, activeTab, hideCompleted, filterCategory })
            .sort((a, b) => {
                if (activeTab === TABS.priority || activeTab === TABS.hidden || activeTab === TABS.archived) {
                    return (a.tabSortOrder?.[activeTab] ?? 0) - (b.tabSortOrder?.[activeTab] ?? 0);
                }
                return a.sortOrder - b.sortOrder;
            });
    }, [items, modeFilter, activeTab, hideCompleted, filterCategory]);

    const allItems = [...events, ...filteredTasks, ...filteredItems];
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

    const handleMoveItem = async (id: string) => {
        try {
            await archiveItem(id);
            showToast('Task archived successfully', 'success');
        } catch (err) {
            showToast('Failed to archive task. Please try again.', 'error');
        }
    };



    const displaySparkles = () => {
        setShowSparkles(true);
        if (sparkleTimeoutRef.current) {
            clearTimeout(sparkleTimeoutRef.current);
        }

        sparkleTimeoutRef.current = window.setTimeout(() => {
            setShowSparkles(false);
            sparkleTimeoutRef.current = null;
        }, 3000)
    }

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
            displaySparkles();
            completedDayRef.current = !!completedDay;
        }
    }, [completedDay, activeTab]);

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
                        {events.map(event => (
                            <CalendarEventItem
                                key={event.id}
                                event={event}
                            />
                        ))}
                        {filteredTasks?.map(task => (
                            <ScheduledTaskItem
                                key={task.id}
                                task={task}
                                markCompleted={markScheduledTaskCompletion}
                                hideForToday={hideForToday}
                                unhideForToday={unhideForToday}
                            />
                        ))}
                        {filteredItems.map(item => (
                            <SortableItem
                                activeTab={activeTab}
                                hasSubChores={item.hasSubChores}
                                isSubChore={!!item.parentUuid}
                                isActive={isActiveList}
                                isPriority={item.isPriority}
                                checked={item.done}
                                key={item.id}
                                id={item.id}
                                isHidden={item.isHidden}
                                isHideCompleted={hideCompleted}
                                text={item.text}
                                note={item.note}
                                mode={item.mode}
                                category={item.category}
                                lastCompleted={item.lastCompleted}
                                deleteItem={deleteItem}
                                prioritizeItem={prioritizeItem}
                                toggleChecked={toggleChecked}
                                handleEdit={handleEdit}
                                handleHideItem={handleHide}
                                subtasks={getSubtasks(item.id)}
                                onMoveItem={handleMoveItem}
                                onSuccess={displaySparkles}
                            />
                        ))}
                    </SortableContext>

                </div>
            </DndContext>
        </>
    )
}

export default Checklist;
