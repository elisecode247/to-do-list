import { useState, useMemo, useEffect, type FC } from 'react';
import type { ChecklistItem } from 'app/types.ts';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { SortableItem } from 'sortable-item/SortableItem.tsx';
import { TAGS, EXCLUSIVE_TAGS, PRIORITY_TAG, type Tag, isExclusiveTag } from 'checklist/constants';
import FrequencyButtonGroup from 'src/frequency-button-group';
import CategorySelect from 'category-select/CategorySelect.tsx';
import { getTagColor } from 'checklist/utilities/get-tag-color';
import 'checklist/checklist.css';
import SuccessGif from 'src/success-state/success-gif';
import { useTask } from 'src/app/use-task';

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
        addItem,
        deleteItem,
        toggleItem,
        prioritizeItem,
        archiveItem,
        hideItem,
        reorderItems,
        filterTasks,
    } = useTask();
    const [inputText, setInputText] = useState<string>("");
    const [newTaskTags, setNewTaskTags] = useState<Tag[]>(['daily']);
    const [newTaskCategory, setNewTaskCategory] = useState<string>('');
    const [hideCompleted, setHideCompleted] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [isAddSectionExpanded, setIsAddSectionExpanded] = useState<boolean>(false);
    const isAddButtonDisabled = !inputText.length;
    const [showSuccessGif, setShowSuccessGif] = useState(false);
    const hasExclusiveFilter = activeFilters.some(f =>
        EXCLUSIVE_TAGS.includes(f as (typeof EXCLUSIVE_TAGS)[number])
    );

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isAddSectionExpanded) {
                setIsAddSectionExpanded(false);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isAddSectionExpanded]);

    const filteredItems = useMemo(() => {
        return filterTasks({ activeFilters, isActiveList, hideCompleted, filterCategory })
    }, [items, activeFilters, hideCompleted, filterCategory]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        reorderItems(active.id, over.id);
    };

    const toggleChecked = (id: UniqueIdentifier, checked: boolean) => {
        if (!checked) {
            const confirmed = confirm(
                'If you uncheck, you will lose the last completed date. Are you sure?'
            );
            if (!confirmed) return;
        }

        toggleItem(id, checked);
    };


    const handleEdit = (id: UniqueIdentifier) => {
        const selectedItem = items.find(item => item.id === id);
        if (!selectedItem) {
            alert('task not found');
            console.error('task id: ' + id);
            return;
        }

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

    const handleTagClick = (val: string): void => {
        setNewTaskTags([val as Tag]);
    }

    const handleAddItem = (): void => {
        const text = inputText.trim();
        if (!text) return;

        const newItem: ChecklistItem = {
            id: crypto.randomUUID(),
            text,
            done: false,
            lastCompleted: '',
            note: '',
            sortOrder: 0,
            category: newTaskCategory,
            tags: newTaskTags,
            isArchived: false,
            isHidden: false
        };
        addItem(newItem);
        setInputText('');
    };


    const handleMoveItem = (id: UniqueIdentifier) => {
        archiveItem(id);
    };

    return (
        <>
            {showSuccessGif && (
                <SuccessGif onClose={() => setShowSuccessGif(false)} />
            )}
            <div className={`checklist_new-item-container ${isAddSectionExpanded ? 'expanded' : 'collapsed'}`}>
                {!isAddSectionExpanded && (
                    <button
                        className="checklist_new-item-toggle-button"
                        onClick={() => setIsAddSectionExpanded(true)}
                        aria-label="Add new item"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                )}
                {isAddSectionExpanded && (<>
                    <div className="checklist_new-item-header">
                        <span className="checklist_new-item-title">New Task</span>
                        <button
                            className="checklist_new-item-close-button"
                            onClick={() => setIsAddSectionExpanded(false)}
                            aria-label="Close"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                    <FrequencyButtonGroup
                        newTaskTags={newTaskTags}
                        onClick={(tag: Tag) => handleTagClick(tag)}
                    />
                    <CategorySelect
                        id="checklist-new-item-category-select"
                        selectedCategory={newTaskCategory}
                        onChange={(category: string) => setNewTaskCategory(category)}
                    />
                    <div className="checklist_new-item-input-row">
                        <input
                            id="checklist-new-item-text-input"
                            className="checklist_new-item-text-input"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') {
                                    handleAddItem();
                                }
                            }}
                            placeholder="New item..."
                        />
                        <button
                            disabled={isAddButtonDisabled}
                            className={`checklist_new-item-add-button
                            ${isAddButtonDisabled &&
                                'checklist_new-item-add-button--disabled'}`
                            }
                            onClick={handleAddItem}
                        >
                            Add
                        </button>
                    </div>
                </>)}
            </div>
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
                        All ({items.length})
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
                                {tag} ({items.filter(t => t.tags.includes(tag)).length})
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
            </div>
            <DndContext onDragEnd={handleDragEnd}>
                <div className="checklist_list-container">
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
