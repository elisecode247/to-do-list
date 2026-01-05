import { useState, useMemo, type FC, type Dispatch, type SetStateAction } from 'react';
import type { ChecklistItem } from 'app/types.ts';
import { DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { SortableItem } from 'sortable-item/SortableItem.tsx';
import { updateItemByIdAndSync } from 'checklist/sync-item-update';
import { addTask, updateTasksOrder, deleteTask, updateTask } from 'app/api';
import { TAGS, EXCLUSIVE_TAGS, PRIORITY_TAG, type Tag, isExclusiveTag } from 'checklist/constants';
import FrequencyButtonGroup from 'src/frequency-button-group';
import { getTagColor } from 'checklist/utilities/get-tag-color';
import 'checklist/checklist.css';
import { isDateToday } from 'src/utilities/is-date-today';

interface ChecklistProps {
    isActiveList: boolean;
    items: Array<ChecklistItem>;
    setItems: Dispatch<SetStateAction<ChecklistItem[]>>;
    setEditingItem: (checklistItem: ChecklistItem) => void;
    activeFilters: Array<Tag>;
    setActiveFilters: Dispatch<SetStateAction<Array<Tag>>>;
    onSuccess: Dispatch<SetStateAction<boolean>>;
}
const Checklist: FC<ChecklistProps> = ({
    isActiveList,
    items,
    setItems,
    setEditingItem,
    activeFilters,
    setActiveFilters,
    onSuccess
}) => {
    const [inputText, setInputText] = useState<string>("");
    const [newTaskTags, setNewTaskTags] = useState<Tag[]>(['daily']);
    const [hideCompleted, setHideCompleted] = useState(false);
    const isAddButtonDisabled = !inputText.length;
    const hasExclusiveFilter = activeFilters.some(f =>
        EXCLUSIVE_TAGS.includes(f as (typeof EXCLUSIVE_TAGS)[number])
    );
    const filteredItems = useMemo(() => {
        if (!items.length) return items;

        const exclusiveFilters = activeFilters.filter(
            selected => isExclusiveTag(selected)
        );
        const nonExclusiveFilters = activeFilters.filter(
            selected => !isExclusiveTag(selected)
        );

        return items.filter(task => {
            if (hideCompleted && isDateToday(task.lastCompleted)) return false;

            const tagSet = new Set(task.tags);

            // OR logic for exclusive tags
            if (exclusiveFilters.length > 0) {
                if (!exclusiveFilters.some(tag =>tagSet.has(tag))) return false;
            }

            // AND logic for everything else (priority, etc)
            for (const tag of nonExclusiveFilters) {
                if (!tagSet.has(tag)) return false;
            }

            return true;
        });
    }, [items, activeFilters, hideCompleted]);

    const deleteItem = (id: UniqueIdentifier): void => {
        deleteTask(id).then(() => {
            setItems(prev => prev.filter(item => item.id !== id));
        }).catch((err) => {
            console.error('Failed to delete task:', err);
            alert('Task could not be deleted.');
        });
    };

    const prioritizeItem = (id: UniqueIdentifier): void => {
        const updatedItem = items.find(item => item.id === id);
        if (!updatedItem) return;
        if (updatedItem.tags.includes(PRIORITY_TAG)) {
            updatedItem.tags = updatedItem.tags.filter(tag => tag !== PRIORITY_TAG)
        } else {
            updatedItem.tags.push(PRIORITY_TAG);
        }
        updateTask(updatedItem).then(() => {
            setItems(prev => {
                return prev.map(item => item.id === id ? updatedItem : item);
            });
        }).catch((err) => {
            console.error('Failed to prioritize task:', err);
            alert('Task could not be prioritized.');
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setItems((items: ChecklistItem[]) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return items;

            const newItems = arrayMove(items, oldIndex, newIndex);

            const updatedItems = newItems.map((item, index) => ({
                ...item,
                sortOrder: index
            }));

            updateTasksOrder(
                updatedItems.map(({ id, sortOrder }) => ({ id, sortOrder }))
            ).catch((err: string) => {
                console.error('Failed to update task order:', err)
            });

            return updatedItems;
        });
    };

    const toggleChecked = (id: UniqueIdentifier, checked: boolean) => {
        if (!checked) {
            const confirmMessage = `If you uncheck, you will lose the last completed date.
            Are you sure you want to uncheck?`;
            const confirmed = confirm(confirmMessage);
            if (!confirmed) return;
        }
        updateItemByIdAndSync(
            items,
            setItems,
            id, item => ({
                ...item,
                done: checked,
                lastCompleted: checked ? new Date().toISOString() : '',
            })
        );
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

        setEditingItem(formattedItem);
    };


    function moveItemBetweenLists(
        id: UniqueIdentifier,
        setItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>
    ) {
        updateItemByIdAndSync(
            items,
            setItems,
            id, item => ({
                ...item,
                isArchived: !item.isArchived
            })
        );

    }

    const handleTagClick = (val: string): void => {
        setNewTaskTags([val as Tag]);
    }

    const addItem = (): void => {
        const text = inputText.trim();
        if (!text) return;

        const id = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

        const newItem: ChecklistItem = {
            id,
            text,
            done: false,
            lastCompleted: '',
            note: '',
            sortOrder: 0,
            tags: newTaskTags,
            isArchived: false
        };

        addTask(newItem)
            .then((data) => {
                const formattedTask = {
                    id: data.uuid,
                    done: false,
                    text: data.text,
                    lastCompleted: data.lastCompleted,
                    note: data.note,
                    sortOrder: data.sortOrder,
                    tags: data.tags,
                    isArchived: false
                }
                setItems(prev => [formattedTask, ...prev]);
                setInputText('');
            })
            .catch((e) => {
                alert('Task could not be added');
                console.error(e);
            });
    };

    const moveItem = (id: UniqueIdentifier) => {
        moveItemBetweenLists(id, setItems);
    };

    return (
        <>
            <div className="checklist_new-item-container">
                <FrequencyButtonGroup
                    newTaskTags={newTaskTags}
                    onClick={(tag: Tag) => handleTagClick(tag)}
                />
                <div className="checklist_new-item-input-row">
                    <input
                        className="checklist_new-item-text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                                addItem();
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
                        onClick={addItem}
                    >
                        Add
                    </button>
                </div>
            </div>
            <div className="checklist_toolbar">
                <div className="checklist_filter-container">
                    <button
                        onClick={() => {
                            const updatedFilters = activeFilters.filter(
                                (filter) => !isExclusiveTag(filter)
                            )
                            setActiveFilters(updatedFilters);
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
                                onClick={() => setActiveFilters(prev =>
                                    prev.includes(tag)
                                        ? prev.filter(t => t !== tag)
                                        : [...prev, tag]
                                )}
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
            </div>
            <DndContext onDragEnd={handleDragEnd}>
                <div className="checklist_list-container">
                    <SortableContext items={filteredItems.map(i => i.id)}>
                        {filteredItems.map(item => (
                            <SortableItem
                                activeFilters={activeFilters}
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
                                onMoveItem={moveItem}
                                tags={item.tags as Tag[]}
                                onSuccess={onSuccess}
                            />
                        ))}
                    </SortableContext>

                </div>
            </DndContext>
        </>
    )
}

export default Checklist;
