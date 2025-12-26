import { useState, type FC, type Dispatch, type SetStateAction } from 'react';
import type { ChecklistItem } from 'app/types.ts';
import { ListChecks } from 'lucide-react';
import { DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { SortableItem } from 'sortable-item/SortableItem.tsx';
import { formatDate } from 'app/utilities/format-date.ts'
import { updateItemById } from 'checklist/update-item-by-id.ts';
import { addTask, updateTasksOrder, deleteTask } from 'app/api';

interface ChecklistProps {
    isActiveList: boolean;
    items: Array<ChecklistItem>;
    setActiveItems: Dispatch<SetStateAction<ChecklistItem[]>>;
    setTargetItems: Dispatch<SetStateAction<ChecklistItem[]>>;
    setEditingItem: (checklistItem: ChecklistItem) => void;
}
const Checklist: FC<ChecklistProps> = ({
    isActiveList,
    items,
    setActiveItems,
    setTargetItems,
    setEditingItem
}) => {
    const [inputText, setInputText] = useState<string>("");

    const updateItemText = (id: UniqueIdentifier, newText: string): void => {
        updateItemById(setActiveItems, id, (item: ChecklistItem) => ({ ...item, text: newText }));
    };

    const deleteItem = (id: UniqueIdentifier): void => {
        deleteTask(id).then((data) => {
            console.log(data);
            setActiveItems(prev => prev.filter(item => item.id !== id));
        }).catch((err) => {
            console.error('Failed to delete task:', err);
            alert('Task could not be deleted.');
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setActiveItems((items: ChecklistItem[]) => {
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

    const toggleChecked = (id: UniqueIdentifier) => {
        updateItemById(setActiveItems, id, item => ({
            ...item,
            done: !item.done,
            lastCompleted: !item.done ? formatDate(new Date()) : item.lastCompleted,
        }));
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
                ? new Date(selectedItem.lastCompleted).toISOString().split('T')[0]
                : ''
        };
        console.log(formattedItem);

        setEditingItem(formattedItem);
    };


    function moveItemBetweenLists(
        id: UniqueIdentifier,
        setActiveItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>,
        setTargetItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>
    ) {

        // Remove from active checklist and add to other checklist
        setActiveItems(prev => {
            const item = prev.find(i => i.id === id);
            if (!item) return prev;
            setTargetItems(target =>
                target.some(i => i.id === id) ? target : [...target, item]
            );
            return prev.filter(i => i.id !== id)
        });

    }



    const resetCheckboxes = (): void => {
        setActiveItems(prev => prev.map(item => ({ ...item, done: false })))
    };

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
            sortOrder: 0
        };

        addTask(newItem)
            .then((data) => {
                const formattedTask = {
                    id: data.uuid,
                    done: false,
                    text: data.text,
                    lastCompleted: data.lastCompleted,
                    note: data.note,
                    sortOrder: data.sortOrder
                }
                console.log(data);
                setActiveItems(prev => [formattedTask, ...prev]);
                setInputText('');
            })
            .catch((e) => {
                alert('Task could not be added');
                console.error(e);
            });
    };

    const moveItem = (id: UniqueIdentifier) => {
        moveItemBetweenLists(id, setActiveItems, setTargetItems);
    };

    return (
        <>
            <div>
                <button onClick={resetCheckboxes}>
                    <ListChecks size={12} />
                </button>
                <input
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
                <button onClick={addItem}  >Add</button>
            </div>
            <DndContext onDragEnd={handleDragEnd}>
                <div className="task-list-container">
                    <SortableContext items={items.map(i => i.id)}>
                        {items.map(item => (
                            <SortableItem
                                isActive={isActiveList}
                                checked={item.done}
                                key={item.id}
                                id={item.id}
                                text={item.text}
                                deleteItem={deleteItem}
                                toggleChecked={toggleChecked}
                                updateItemText={updateItemText}
                                handleEdit={handleEdit}
                                onMoveItem={moveItem}
                            />
                        ))}
                    </SortableContext>

                </div>
            </DndContext>
        </>
    )
}

export default Checklist;
