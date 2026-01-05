import { useState, type FC, type Dispatch, type SetStateAction } from 'react';
import type { ChecklistItem } from 'app/types.ts';
import { ListChecks } from 'lucide-react';
import { DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { SortableItem } from 'sortable-item/SortableItem.tsx';
import { updateItemByIdAndSync } from 'checklist/sync-item-update';
import { addTask, updateTasksOrder, deleteTask } from 'app/api';
import { TAGS, type Tag } from 'checklist/constants';
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
}
const Checklist: FC<ChecklistProps> = ({
    isActiveList,
    items,
    setItems,
    setEditingItem,
    activeFilters,
    setActiveFilters
}) => {
    const [inputText, setInputText] = useState<string>("");
    const [newTaskTags, setNewTaskTags] = useState<Tag[]>(['daily']);
    const [hideCompleted, setHideCompleted] = useState(false);

    const isAddButtonDisabled = !inputText.length;

    const filteredItems = items.filter(task => {
        if (hideCompleted && isDateToday(task.lastCompleted)) return false;
        if (activeFilters.length) return task.tags.some((tag) => activeFilters.includes(tag));
        return items;
    });

    const deleteItem = (id: UniqueIdentifier): void => {
        deleteTask(id).then(() => {
            setItems(prev => prev.filter(item => item.id !== id));
        }).catch((err) => {
            console.error('Failed to delete task:', err);
            alert('Task could not be deleted.');
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

    const resetCheckboxes = (): void => {
        setItems(prev => prev.map(item => ({ ...item, done: false })))
    };

    const handleTagClick = (val: string): void => {
        setNewTaskTags([val]);
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
                <button className="checklist_reset-button" onClick={resetCheckboxes}>
                    <ListChecks size={12} />
                </button>
                <div className="checklist_filter-container">
                    <button
                        onClick={() => setActiveFilters([])}
                        className={`filter-button ${!activeFilters.length
                            ? 'filter-button-all-active'
                            : 'filter-button-all'
                            }`}
                    >
                        All ({items.length})
                    </button>
                    {TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setActiveFilters(prev =>
                                prev.includes(tag)
                                    ? prev.filter(t => t !== tag)
                                    : [...prev, tag]
                            )}
                            className={`filter-button ${activeFilters.includes(tag)
                                ? 'filter-button-active'
                                : ''
                                } ${getTagColor(tag)} hover:opacity-80`}
                        >
                            {tag} ({items.filter(t => t.tags.includes(tag)).length})
                        </button>
                    ))}
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
                                toggleChecked={toggleChecked}
                                handleEdit={handleEdit}
                                onMoveItem={moveItem}
                                tags={item.tags}
                            />
                        ))}
                    </SortableContext>

                </div>
            </DndContext>
        </>
    )
}

export default Checklist;
