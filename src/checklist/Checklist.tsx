import { useState, useMemo, useRef, useEffect, type FC, type ReactElement, type SetStateAction } from 'react';
import type { ChecklistItem, Mode } from 'app/types.ts';
import { DndContext, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableItem } from 'sortable-item/SortableItem.tsx';
import { MODES } from 'checklist/constants';
import CategorySelect from 'category-select/CategorySelect.tsx';
import { getTagColor } from 'checklist/utilities/get-tag-color';
import 'checklist/checklist.css';
import { useTask } from 'src/app/use-task';
import { useCalendarIntegration } from 'src/google-authorization/use-google-calendar';
import NewTaskForm from 'src/new-task-form/NewTaskForm';
import { ALL_CATEGORIES } from 'src/category-select/category-constants';
import CalendarEventItem from 'src/google-authorization/calendar-event-item';
import ScheduledTaskItem from 'src/google-authorization/scheduled-task-item';
import { useDailyHide } from 'src/app/use-hide-task';
import { TABS, default as Tabs } from 'src/checklist/tabs/Tabs';
import EmptyStateFilters from './empty-state/EmptyStateFilters';
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
        filterTasks,
        getSubtasks,
    } = useTask();
    const { events, tasks, markScheduledTaskCompletion } = useCalendarIntegration();
    const [hideCompleted, setHideCompleted] = useState(true);
    const [activeFilters, setActiveFilters] = useState<Mode[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>(ALL_CATEGORIES);
    const [showSparkles, setShowSparkles] = useState(false);
    const { hiddenItems, isHiddenToday, hideForToday, unhideForToday } = useDailyHide();
    const [activeTab, setActiveTab] = useState(TABS.today);
    const sparkleTimeoutRef = useRef<number | null>(null);
    const isActiveList = activeTab === TABS.today;

    const hasExclusiveFilter = activeFilters.some(f =>
        MODES.includes(f as (typeof MODES)[number])
    );

    const filteredTasks = useMemo(() => {
        return tasks.map(task => ({ ...task, isHidden: isHiddenToday(task.id) })).filter(task => {
            if (activeTab === TABS.hidden && task.isHidden) return true;
            if (activeTab === TABS.scheduled && !task.isHidden) return true;
            if (activeTab === TABS.today && !task.isHidden) return true;
            return false;

        });
    }, [tasks, activeTab, isHiddenToday, hiddenItems]);

    const filteredItems = useMemo(() => {
        return filterTasks({ items, activeFilters, activeTab, hideCompleted, filterCategory, isHiddenToday });
    }, [items, activeFilters, activeTab, hideCompleted, filterCategory, isHiddenToday]);

    const allItems = [...events, ...filteredTasks, ...filteredItems];

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
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        reorderItems(active.id as string, over.id as string);
    };

    const toggleChecked = (id: string, checked: boolean) => {
        toggleItem(id, checked);
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

    const handleHide = (id: string, isHiddenItem: boolean) => {
        if (isHiddenItem) {
            unhideForToday(id as string);
        } else {
            hideForToday(id as string);
        }
    };

    const handleMoveItem = (id: string) => {
        archiveItem(id);
    };

    const handleTabChange = (tab: SetStateAction<string>) => {
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

    return (
        <>
            {showSparkles && sparkles}
            <NewTaskForm />
            <div className="checklist_toolbar">
                <div className="checklist_filter-container">
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
                    {MODES.map(tag => {
                        const isActive = activeFilters.includes(tag);
                        return (
                            <button
                                key={tag}
                                onClick={() => {
                                    const nextFilters = activeFilters.includes(tag)
                                        ? activeFilters.filter(t => t !== tag)
                                        : [...activeFilters, tag];

                                    setActiveFilters(nextFilters);
                                }}
                                className={`
                                    filter-button
                                    ${isActive ? getTagColor(tag) + 'filter-button-active' : ''}
                                `}
                            >
                                {tag}
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
                                isHiddenToday={isHiddenToday}
                                hideForToday={hideForToday}
                                unhideForToday={unhideForToday}
                            />
                        ))}
                        {filteredItems.map(item => (
                            <SortableItem
                                activeTab={activeTab}
                                hasSubChores={item.hasSubChores}
                                isActive={isActiveList}
                                isPriority={item.isPriority}
                                checked={item.done}
                                key={item.id}
                                id={item.id}
                                isHidden={item.isHidden}
                                isHiddenToday={isHiddenToday}
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
