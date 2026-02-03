import { useState, useMemo, type FC } from 'react';
import type { ChecklistItem } from 'app/types.ts';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { SortableItem } from 'sortable-item/SortableItem.tsx';
import { TAGS, EXCLUSIVE_TAGS, PRIORITY_TAG, type Tag, isExclusiveTag } from 'checklist/constants';
import CategorySelect from 'category-select/CategorySelect.tsx';
import { getTagColor } from 'checklist/utilities/get-tag-color';
import 'checklist/checklist.css';
import SuccessGif from 'src/success-state/success-gif';
import { useTask } from 'src/app/use-task';
import { useCalendarIntegration } from 'src/google-authorization/use-google-calendar';
import NewTaskForm from 'src/new-task-form/NewTaskForm';
import { ALL_CATEGORIES } from 'src/category-select/category-constants';
import CalendarEventItem from 'src/google-authorization/calendar-event-item';

interface ChecklistProps {
    isActiveList: boolean;
    activeFilters: Tag[];
    onChangeFilters: (filters: Tag[]) => void;
    onEditItem: (item: ChecklistItem) => void;
}

const Checklist: FC<ChecklistProps> = ({
    isActiveList,
    activeFilters,
    onChangeFilters,
    onEditItem,
}) => {
    const {
        items,
        deleteItem,
        toggleItem,
        prioritizeItem,
        archiveItem,
        hideItem,
        reorderItems,
        filterTasks,
    } = useTask();
    const { events } = useCalendarIntegration();
    console.log("%c Line:41 🌽 events", "color:#e41a6a", events);
    const [hideCompleted, setHideCompleted] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>(ALL_CATEGORIES);
    const [showSuccessGif, setShowSuccessGif] = useState(false);
    const [showHidden, setShowHidden] = useState(false);
    const hasExclusiveFilter = activeFilters.some(f =>
        EXCLUSIVE_TAGS.includes(f as (typeof EXCLUSIVE_TAGS)[number])
    );

    const filteredItems = useMemo(() => {
        return filterTasks({ activeFilters, isActiveList, hideCompleted, filterCategory, showHidden })
    }, [items, activeFilters, isActiveList, hideCompleted, filterCategory, showHidden]);

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

    const handleHide = (id: UniqueIdentifier) => {
        hideItem(id);
    };

    const handleMoveItem = (id: UniqueIdentifier) => {
        archiveItem(id);
    };

    return (
        <>
            {showSuccessGif && (
                <SuccessGif onClose={() => setShowSuccessGif(false)} />
            )}
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
                            return isActiveList ? !t.isArchived : t.isArchived;
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
                                    const isActive = isActiveList ? !t.isArchived : t.isArchived;
                                    return isActive && t.tags.includes(tag);
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
                    Show Hidden ({items.filter(item => {
                        return isActiveList === !item.isArchived && item.isHidden;
                    }).length})
                </label>
            </div>
            <DndContext onDragEnd={handleDragEnd}>
                <div className="checklist_list-container">
                    {events.map(event => (
                        <CalendarEventItem
                            key={event.id}
                            event={event}
                        />
                    ))}
                    <SortableContext items={filteredItems.map(i => i.id)}>
                        {filteredItems.map(item => (
                            <SortableItem
                                isActive={isActiveList}
                                checked={item.done}
                                key={item.id}
                                id={item.id}
                                text={item.text}
                                lastCompleted={item.lastCompleted}
                                deleteItem={deleteItem}
                                prioritizeItem={prioritizeItem}
                                toggleChecked={toggleChecked}
                                handleEdit={handleEdit}
                                handleHideItem={handleHide}
                                onMoveItem={handleMoveItem}
                                tags={item.tags as Tag[]}
                                onSuccess={setShowSuccessGif}
                            />
                        ))}
                    </SortableContext>

                </div>
            </DndContext>
        </>
    )
}

export default Checklist;
