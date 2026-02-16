import { useState, useMemo, useRef, useEffect, type FC, type ReactElement, type SetStateAction, useCallback, act } from 'react';
import type { ChecklistItem, Mode } from 'app/types';
import { DndContext, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableItem } from 'sortable-item/SortableItem';
import { MODES } from 'checklist/constants';
import CategorySelect from 'category-select/CategorySelect';
import { getModeColor } from 'src/checklist/utilities/get-mode-color';
import 'checklist/checklist.css';
import { useTask } from 'src/app/use-task';
import { useCalendarIntegration } from 'src/google-authorization/use-google-calendar';
import { ALL_CATEGORIES } from 'src/category-select/category-constants';
import CalendarEventItem from 'src/google-authorization/calendar-event-item';
import ScheduledTaskItem from 'src/google-authorization/scheduled-task-item';
import Tabs from 'src/checklist/tabs/Tabs';
import { TABS, type Tab } from 'src/checklist/tabs/types';
import EmptyStateFilters from './empty-state/EmptyStateFilters';
import { filterTasks } from 'src/app/utilities/filter-tasks';
import { Filter } from 'lucide-react';
import { useToast } from 'src/toast/use-toast';

interface ChecklistProps {
    onEditItem: (item: ChecklistItem) => void;
    sparkles: ReactElement;
}

const Checklist: FC<ChecklistProps> = ({
    onEditItem,
    sparkles
}) => {
    const {
        items,
        deleteItem,
        toggleItem,
        prioritizeItem,
        archiveItem,
        reorderItems,
        getSubtasks,
        hideForToday,
        unhideForToday,
    } = useTask();
    const { events, tasks, markScheduledTaskCompletion } = useCalendarIntegration();
    const [hideCompleted, setHideCompleted] = useState(true);
    const [activeFilters, setActiveFilters] = useState<Mode[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>(ALL_CATEGORIES);
    const [showSparkles, setShowSparkles] = useState(false);
    const [activeTab, setActiveTab] = useState(TABS.today);
    const sparkleTimeoutRef = useRef<number | null>(null);
    const isActiveList = activeTab === TABS.today;
    const [showFilters, setShowFilters] = useState(false);
    const { showToast } = useToast();
    const completedDayRef = useRef(false);

    const hasExclusiveFilter = activeFilters.some(f =>
        MODES.includes(f as (typeof MODES)[number])
    );

    const filteredTasks = useMemo(() => {
        return tasks.map(task => ({ ...task })).filter(task => {
            if (activeTab === TABS.hidden && task.isHidden) return true;
            if (activeTab === TABS.scheduled && !task.isHidden) return true;
            if (activeTab === TABS.today && !task.isHidden) return true;
            return false;

        });
    }, [tasks, activeTab]);

    const filteredItems = useMemo(() => {
        return filterTasks({ items, activeFilters, activeTab, hideCompleted, filterCategory })
            .sort((a, b) => {
                if (activeTab === TABS.priority || activeTab === TABS.hidden || activeTab === TABS.archived) {
                    return (a.tabSortOrder?.[activeTab] ?? 0) - (b.tabSortOrder?.[activeTab] ?? 0);
                }
                return a.sortOrder - b.sortOrder;
            });
    }, [items, activeFilters, activeTab, hideCompleted, filterCategory]);

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

        reorderItems(filteredItems, activeTab, active.id as string, over.id as string);
    }, [activeTab, filteredItems, reorderItems]);

    const toggleChecked = async (id: string, checked: boolean) => {
        if (!checked) {
            const confirmed = confirm('If you uncheck, you will lose ' +
                'the last completed date. Are you sure?'
            );
            if (!confirmed) return;
        }
        try {
            await toggleItem(id, checked);
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

    const handleMoveItem = (id: string) => {
        archiveItem(id);
    };

    const handleTabChange = (tab: SetStateAction<Tab>) => {
        setActiveTab(tab);
    }

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

    function clearFilters() {
        setActiveFilters([]);
        setFilterCategory(ALL_CATEGORIES);
        setHideCompleted(false);
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

            <div className="checklist_toolbar">
                <div className="checklist_filter-container">
                    <button
                        className="filter-toggle-icon-button"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={24} />Filters
                    </button>
                    {showFilters && (
                        <>
                            <button
                                onClick={() => {
                                    const updatedFilters = activeFilters.filter(
                                        (filter) => !MODES.includes(filter)
                                    );
                                    setActiveFilters(updatedFilters);
                                }}
                                className={`filter-button ${!hasExclusiveFilter
                                    ? 'filter-button-all-active'
                                    : 'filter-button-all'
                                    }`}
                            >
                                All
                            </button>
                            {MODES.map(mode => {
                                const isActive = activeFilters.includes(mode);
                                return (
                                    <button
                                        key={mode}
                                        onClick={() => {
                                            const nextFilters = activeFilters.includes(mode)
                                                ? activeFilters.filter(t => t !== mode)
                                                : [...activeFilters, mode];

                                            setActiveFilters(nextFilters);
                                        }}
                                        className={`
                                        filter-button
                                        ${isActive ? getModeColor(mode) + 'filter-button-active' : ''}
                                    `}
                                    >
                                        {mode}
                                    </button>
                                )
                            })}
                            <div className="checklist_hide-completed-checkbox-container">
                                <input
                                    className="checklist_hide-completed-checkbox-input"
                                    type="checkbox"
                                    id="hideCompleted"
                                    checked={hideCompleted}
                                    onChange={(e) => setHideCompleted(e.target.checked)}
                                />
                                <label
                                    htmlFor="hideCompleted"
                                    className="checklist_hide-completed-checkbox-label"
                                >
                                    Hide Completed
                                </label>
                            </div>
                            <CategorySelect
                                id="checklist-filter-category-select"
                                isFilter={true}
                                selectedCategory={filterCategory}
                                onChange={(value: string) => setFilterCategory(value)}
                            />
                        </>
                    )}
                </div>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                />
            </div>
            <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
                <div className="checklist_list-container">
                    <SortableContext items={allItems.map(i => i.id)}>
                        {!allItems.length && (
                            <EmptyStateFilters
                                activeFilters={activeFilters}
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
