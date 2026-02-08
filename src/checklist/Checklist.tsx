import { useState, useMemo, useRef, useEffect, type FC, type ReactElement } from 'react';
import type { ChecklistItem } from 'app/types.ts';
import { DndContext, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import type { DragEndEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';
import { SortableItem } from 'sortable-item/SortableItem.tsx';
import { TAGS, EXCLUSIVE_TAGS, PRIORITY_TAG, type Tag, isExclusiveTag } from 'checklist/constants';
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
interface ChecklistProps {
    isActiveList: boolean;
    activeFilters: Tag[];
    onChangeFilters: (filters: Tag[]) => void;
    onEditItem: (item: ChecklistItem) => void;
    sparkles: ReactElement;
}

const Checklist: FC<ChecklistProps> = ({
    isActiveList,
    activeFilters,
    onChangeFilters,
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
    const [filterCategory, setFilterCategory] = useState<string>(ALL_CATEGORIES);
    const [showSparkles, setShowSparkles] = useState(false);
    const [showHidden, setShowHidden] = useState(false);
    const { isHiddenToday, hideForToday, unhideForToday } = useDailyHide();
    const sparkleTimeoutRef = useRef<number | null>(null);

    const hasExclusiveFilter = activeFilters.some(f =>
        EXCLUSIVE_TAGS.includes(f as (typeof EXCLUSIVE_TAGS)[number])
    );

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const isCorrectList = isActiveList === !task.isArchived;
            const isHidden = showHidden === isHiddenToday(task.id);
            if (!isCorrectList || !isHidden) return false;
            return true;
        });

    }, [tasks, isActiveList, showHidden, isHiddenToday]);

    const filteredItems = useMemo(() => {
        if (showHidden) {
            return items.filter(item => {
                const isCorrectList = isActiveList === !item.isArchived;
                return isCorrectList && isHiddenToday(item.id as string);
            });
        }
        const baseItems = filterTasks({ activeFilters, isActiveList, hideCompleted, filterCategory, showHidden });
        return baseItems.filter(item => {
            const hidden = isHiddenToday(item.id as string);

            if (showHidden) return hidden;
            return !hidden;
        });
    }, [items, activeFilters, isActiveList, hideCompleted, filterCategory, showHidden, isHiddenToday]);

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

        reorderItems(active.id, over.id);
    };

    const toggleChecked = (id: UniqueIdentifier, checked: boolean) => {
        toggleItem(id, checked);
    };


    const handleEdit = (id: UniqueIdentifier) => {
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

    const handleHide = (id: UniqueIdentifier, isHiddenItem: boolean) => {
        if (isHiddenItem) {
            unhideForToday(id as string);
        } else {
            hideForToday(id as string);
        }
    };

    const handleMoveItem = (id: UniqueIdentifier) => {
        archiveItem(id);
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

    const hiddenItemsAndTasksCount = useMemo(() => {
        const hiddenItemsCount = items.filter(item => {
            const isCorrectList = isActiveList === !item.isArchived;
            return isCorrectList && isHiddenToday(item.id as string);
        }).length
        const hiddenTasksCount = tasks.filter(task => {
            const isCorrectList = isActiveList === !task.isArchived;
            return isCorrectList && isHiddenToday(task.id);
        }).length
        return hiddenItemsCount + hiddenTasksCount;
    }, [items, tasks, isHiddenToday, isActiveList]);

    return (
        <>
            {showSparkles && sparkles}
            <NewTaskForm />
            <div className="checklist_toolbar">
                <div className="checklist_filter-container">
                    <button
                        onClick={() => {
                            const updatedFilters = activeFilters.filter(
                                (filter) => !isExclusiveTag(filter)
                            )
                            onChangeFilters(updatedFilters);
                        }}
                        className={`filter-button ${!hasExclusiveFilter
                            ? 'filter-button-all-active'
                            : 'filter-button-all'
                            }`}
                    >
                        All ({items.filter(t => {
                            if (t.isArchived !== !isActiveList) return false;
                            if (t.parentUuid) return false;
                            return true;
                        }).length})
                    </button>
                    {TAGS.map(tag => {
                        const isPriority = tag === PRIORITY_TAG;
                        const isActive = activeFilters.includes(tag);
                        return (
                            <button
                                key={tag}
                                onClick={() => {
                                    const nextFilters = activeFilters.includes(tag)
                                        ? activeFilters.filter(t => t !== tag)
                                        : [...activeFilters, tag];

                                    onChangeFilters(nextFilters);
                                }}
                                className={`
                                filter-button
                                ${!isPriority && isActive ? getTagColor(tag) + 'filter-button-active' : ''}
                                ${isPriority ? 'filter-button--priority' : ''}
                                ${isPriority && isActive ? 'filter-button--priority-active' : ''}
                                `}
                            >
                                {isPriority ? '⭐ ' : ''}
                                {tag} ({items.filter(t => {
                                    if (t.isArchived !== !isActiveList) return false;
                                    if (t.parentUuid) return false;
                                    return t.tags.includes(tag);
                                }).length})
                            </button>
                        )
                    })}
                </div>

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
                        Hide completed tasks
                    </label>
                </div>
                <CategorySelect
                    id="checklist-filter-category-select"
                    isFilter={true}
                    selectedCategory={filterCategory}
                    onChange={(value: string) => setFilterCategory(value)}
                />
                <label id="show-hidden-tasks-label" htmlFor="show-hidden-tasks">
                    <input
                        type="checkbox"
                        id="show-hidden-tasks"
                        checked={showHidden === true}
                        onChange={(e) => setShowHidden(e.target.checked)}
                    />
                    Show Hidden ({hiddenItemsAndTasksCount})
                </label>
            </div>
            <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
                <div className="checklist_list-container">
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
                    <SortableContext items={filteredItems.map(i => i.id)}>
                        {filteredItems.map(item => (
                            <SortableItem
                                hasSubChores={item.hasSubChores}
                                isActive={isActiveList}
                                checked={item.done}
                                key={item.id}
                                id={item.id}
                                isHidden={isHiddenToday(item.id as string)}
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
                                tags={item.tags as Tag[]}
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
